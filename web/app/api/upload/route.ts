import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isAllowedOrigin } from "@/lib/origin";
import { ipFromRequest, uploadLimiter } from "@/lib/ratelimit";

export const runtime = "nodejs";

const RequestSchema = z.object({
  applicationId: z.string().uuid(),
  filename: z.string().min(1).max(180),
  mimeType: z.string().min(2).max(100),
  sizeBytes: z.number().int().positive().max(20 * 1024 * 1024), // 20 MB cap
});

const ALLOWED_MIME = new Set([
  "application/pdf",
  "image/png",
  "image/jpeg",
  "image/webp",
]);

const BUCKET = "application-documents";

export async function POST(req: Request) {
  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ error: "Origin not allowed." }, { status: 403 });
  }

  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to upload documents." }, { status: 401 });
  }

  const limited = await uploadLimiter().limit(`${user.id}:${ipFromRequest(req)}`);
  if (!limited.success) {
    return NextResponse.json({ error: "Too many uploads. Try again later." }, { status: 429 });
  }

  let body: z.infer<typeof RequestSchema>;
  try {
    body = RequestSchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!ALLOWED_MIME.has(body.mimeType)) {
    return NextResponse.json({ error: "Unsupported file type." }, { status: 415 });
  }

  const supabase = getSupabaseAdmin();

  // Ensure the application belongs to this user.
  const { data: app, error: appErr } = await supabase
    .from("applications")
    .select("id, user_id")
    .eq("id", body.applicationId)
    .maybeSingle();
  if (appErr) return NextResponse.json({ error: appErr.message }, { status: 500 });
  if (!app || app.user_id !== user.id) {
    return NextResponse.json({ error: "Application not found." }, { status: 404 });
  }

  const safeName = body.filename.replace(/[^\w.\- ]+/g, "_").slice(0, 120);
  const path = `${user.id}/${body.applicationId}/${Date.now()}-${safeName}`;

  const { data: signed, error: signErr } = await supabase.storage
    .from(BUCKET)
    .createSignedUploadUrl(path);

  if (signErr || !signed) {
    return NextResponse.json({ error: signErr?.message || "Could not sign upload" }, { status: 500 });
  }

  const { data: doc, error: docErr } = await supabase
    .from("application_documents")
    .insert({
      application_id: body.applicationId,
      user_id: user.id,
      storage_path: path,
      filename: safeName,
      mime_type: body.mimeType,
      size_bytes: body.sizeBytes,
    })
    .select("id")
    .single();

  if (docErr) return NextResponse.json({ error: docErr.message }, { status: 500 });

  return NextResponse.json({
    documentId: doc.id,
    uploadUrl: signed.signedUrl,
    token: signed.token,
    path,
  });
}
