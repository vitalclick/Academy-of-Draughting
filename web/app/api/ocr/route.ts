import { NextResponse } from "next/server";
import { z } from "zod";
import { getSessionUser } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { runOcrOnPdf } from "@/lib/ocr";
import { isAllowedOrigin } from "@/lib/origin";
import type { Json } from "@/lib/database.types";

export const runtime = "nodejs";

const BodySchema = z.object({ documentId: z.string().uuid() });

const BUCKET = "application-documents";

export async function POST(req: Request) {
  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ error: "Origin not allowed." }, { status: 403 });
  }

  const user = await getSessionUser();
  if (!user) return NextResponse.json({ error: "Sign in required." }, { status: 401 });

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();
  const { data: doc, error: docErr } = await supabase
    .from("application_documents")
    .select("id, user_id, storage_path, ocr_status")
    .eq("id", body.documentId)
    .maybeSingle();

  if (docErr) return NextResponse.json({ error: docErr.message }, { status: 500 });
  if (!doc || doc.user_id !== user.id) {
    return NextResponse.json({ error: "Document not found." }, { status: 404 });
  }

  await supabase.from("application_documents").update({ ocr_status: "processing" }).eq("id", doc.id);

  const { data: signed, error: urlErr } = await supabase.storage
    .from(BUCKET)
    .createSignedUrl(doc.storage_path, 300);
  if (urlErr || !signed) {
    await supabase.from("application_documents").update({ ocr_status: "failed" }).eq("id", doc.id);
    return NextResponse.json({ error: urlErr?.message || "Could not read file" }, { status: 500 });
  }

  const result = await runOcrOnPdf({ fileUrl: signed.signedUrl });
  if (!result.ok) {
    await supabase
      .from("application_documents")
      .update({ ocr_status: "skipped", ocr_result: { error: result.error } })
      .eq("id", doc.id);
    return NextResponse.json({ status: "skipped", reason: result.error }, { status: 200 });
  }

  await supabase
    .from("application_documents")
    .update({ ocr_status: "done", ocr_result: result.raw as Json })
    .eq("id", doc.id);

  return NextResponse.json({ status: "done" });
}
