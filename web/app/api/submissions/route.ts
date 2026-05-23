import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isAllowedOrigin } from "@/lib/origin";
import { ipFromRequest, submissionLimiter } from "@/lib/ratelimit";

export const runtime = "nodejs";

const RequestSchema = z.object({
  assignmentId: z.string().uuid(),
  notes: z.string().max(4000).optional(),
  file: z
    .object({
      filename: z.string().min(1).max(180),
      mimeType: z.string().min(2).max(100),
      sizeBytes: z.number().int().positive().max(50 * 1024 * 1024), // 50 MB cap
    })
    .optional(),
});

const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
  // CAD-ish formats students realistically hand in:
  "application/octet-stream",
  "application/acad",
  "image/vnd.dwg",
  "application/dxf",
  "application/zip",
]);

const BUCKET = "submissions";

export async function POST(req: Request) {
  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ error: "Origin not allowed." }, { status: 403 });
  }
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to submit work." }, { status: 401 });
  }
  const limited = await submissionLimiter().limit(`${user.id}:${ipFromRequest(req)}`);
  if (!limited.success) {
    return NextResponse.json({ error: "Too many submissions. Try again later." }, { status: 429 });
  }

  let body: z.infer<typeof RequestSchema>;
  try {
    body = RequestSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (body.file && !ALLOWED_MIME.has(body.file.mimeType)) {
    return NextResponse.json({ error: "Unsupported file type." }, { status: 415 });
  }
  if (!body.file && !body.notes?.trim()) {
    return NextResponse.json(
      { error: "Submit a file, notes, or both." },
      { status: 400 }
    );
  }

  const supabase = getSupabaseAdmin();

  // Verify the assignment exists and the user is enrolled in its course.
  const { data: assignment, error: aErr } = await supabase
    .from("assignments")
    .select("id, module_id, modules!inner(course_slug)")
    .eq("id", body.assignmentId)
    .maybeSingle<{ id: string; module_id: string; modules: { course_slug: string } }>();
  if (aErr) return NextResponse.json({ error: aErr.message }, { status: 500 });
  if (!assignment) {
    return NextResponse.json({ error: "Assignment not found." }, { status: 404 });
  }
  const courseSlug = assignment.modules.course_slug;

  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", user.id)
    .eq("course_slug", courseSlug)
    .eq("status", "active")
    .maybeSingle();
  if (!enrollment) {
    return NextResponse.json(
      { error: "You are not enrolled in this course." },
      { status: 403 }
    );
  }

  let storagePath: string | null = null;
  let uploadUrl: string | null = null;
  if (body.file) {
    const safeName = body.file.filename.replace(/[^\w.\- ]+/g, "_").slice(0, 120);
    storagePath = `${user.id}/${body.assignmentId}/${Date.now()}-${safeName}`;
    const { data: signed, error: signErr } = await supabase.storage
      .from(BUCKET)
      .createSignedUploadUrl(storagePath);
    if (signErr || !signed) {
      return NextResponse.json(
        { error: signErr?.message || "Could not sign upload" },
        { status: 500 }
      );
    }
    uploadUrl = signed.signedUrl;
  }

  // Upsert: a student can re-submit the same assignment.
  const { data: submission, error: subErr } = await supabase
    .from("submissions")
    .upsert(
      {
        assignment_id: body.assignmentId,
        user_id: user.id,
        status: "submitted",
        storage_path: storagePath,
        notes: body.notes?.trim() || null,
        submitted_at: new Date().toISOString(),
      },
      { onConflict: "assignment_id,user_id" }
    )
    .select("id, status, submitted_at")
    .single();
  if (subErr) return NextResponse.json({ error: subErr.message }, { status: 500 });

  return NextResponse.json({
    submissionId: submission.id,
    status: submission.status,
    submittedAt: submission.submitted_at,
    uploadUrl,
    path: storagePath,
  });
}
