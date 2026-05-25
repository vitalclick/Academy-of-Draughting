import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isAllowedOrigin } from "@/lib/origin";
import { scanBytes } from "@/lib/scan";
import { log } from "@/lib/log";

export const runtime = "nodejs";

const BodySchema = z.object({
  kind: z.enum(["submission", "application_document"]),
  id: z.string().uuid(),
});

// Called by the client after a successful storage PUT. Downloads the object
// (service role), scans it, and writes scan_status onto the owning row.
// Mirrors the existing /api/ocr post-upload pattern.
export async function POST(req: Request) {
  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ error: "Origin not allowed." }, { status: 403 });
  }
  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in." }, { status: 401 });

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const table = body.kind === "submission" ? "submissions" : "application_documents";
  const bucket = body.kind === "submission" ? "submissions" : "application-documents";

  const { data: row, error } = await supabase
    .from(table)
    .select("id, storage_path, user_id")
    .eq("id", body.id)
    .maybeSingle<{ id: string; storage_path: string | null; user_id: string | null }>();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });
  if (!row) return NextResponse.json({ error: "Not found." }, { status: 404 });
  // Submissions are always owned; application documents may be anonymous
  // (user_id null) during apply, in which case we allow the scan to proceed.
  if (row.user_id && row.user_id !== user.id) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }
  if (!row.storage_path) {
    return NextResponse.json({ error: "No file to scan." }, { status: 400 });
  }

  const { data: file, error: dlErr } = await supabase.storage
    .from(bucket)
    .download(row.storage_path);
  if (dlErr || !file) {
    await supabase.from(table).update({ scan_status: "error" }).eq("id", body.id);
    return NextResponse.json({ error: "Download failed." }, { status: 500 });
  }

  const status = await scanBytes(await file.arrayBuffer());
  await supabase.from(table).update({ scan_status: status }).eq("id", body.id);
  if (status === "infected") {
    log.warn("scan.infected", { kind: body.kind, id: body.id });
  }
  return NextResponse.json({ scan_status: status });
}
