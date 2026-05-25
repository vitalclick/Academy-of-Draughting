import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isAllowedOrigin } from "@/lib/origin";
import { ipFromRequest, uploadLimiter } from "@/lib/ratelimit";

export const runtime = "nodejs";

// Anonymous upload route: lets a freshly-submitted applicant attach
// required documents to their application before they create an account.
// Authorization = the upload_token returned by /api/apply, valid for 24h.

const BodySchema = z.object({
  applicationId: z.string().uuid(),
  uploadToken: z.string().uuid(),
  filename: z.string().min(1).max(180),
  mimeType: z.string().min(2).max(100),
  sizeBytes: z.number().int().positive().max(20 * 1024 * 1024),
  kind: z.enum(["id", "qualification", "portfolio", "other"]).optional(),
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
  // Rate-limit by IP — no user yet.
  const limited = await uploadLimiter().limit(`anon:${ipFromRequest(req)}`);
  if (!limited.success) {
    return NextResponse.json({ error: "Too many uploads. Try again later." }, { status: 429 });
  }

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }
  if (!ALLOWED_MIME.has(body.mimeType)) {
    return NextResponse.json({ error: "Unsupported file type." }, { status: 415 });
  }

  const supabase = getSupabaseAdmin();
  const { data: app, error: appErr } = await supabase
    .from("applications")
    .select("id, upload_token, upload_token_expires_at, user_id")
    .eq("id", body.applicationId)
    .maybeSingle();
  if (appErr) return NextResponse.json({ error: appErr.message }, { status: 500 });
  if (!app) return NextResponse.json({ error: "Application not found." }, { status: 404 });
  if (app.upload_token !== body.uploadToken) {
    return NextResponse.json({ error: "Invalid upload token." }, { status: 403 });
  }
  if (app.upload_token_expires_at && new Date(app.upload_token_expires_at) < new Date()) {
    return NextResponse.json(
      { error: "Upload window has expired. Sign in to upload from your portal." },
      { status: 403 }
    );
  }

  const safeName = body.filename.replace(/[^\w.\- ]+/g, "_").slice(0, 120);
  const kindTag = body.kind ?? "other";
  // Path: pending/<application id>/<kind>-<ts>-<filename>
  // Storage RLS for application-documents permits admin read on all paths.
  const path = `pending/${body.applicationId}/${kindTag}-${Date.now()}-${safeName}`;

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
      user_id: app.user_id, // null for anonymous uploads
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
    path,
  });
}
