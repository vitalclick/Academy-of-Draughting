import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserWithRole } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

const ParamsSchema = z.object({
  bucket: z.enum(["application-documents", "submissions"]),
  path: z.string().min(1).max(500),
});

// Admin/faculty get a 5-minute signed URL to a private storage object.
// 302-redirects so the browser can preview/download directly.
export async function GET(req: Request) {
  const session = await getUserWithRole();
  if (!session || (session.role !== "admin" && session.role !== "faculty")) {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const url = new URL(req.url);
  let params: z.infer<typeof ParamsSchema>;
  try {
    params = ParamsSchema.parse({
      bucket: url.searchParams.get("bucket"),
      path: url.searchParams.get("path"),
    });
  } catch {
    return NextResponse.json({ error: "Invalid bucket or path." }, { status: 400 });
  }

  // Submissions bucket is restricted to admin only — faculty grade but
  // shouldn't see arbitrary student files (defence in depth).
  if (params.bucket === "submissions" && session.role !== "admin") {
    return NextResponse.json({ error: "Forbidden." }, { status: 403 });
  }

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase.storage
    .from(params.bucket)
    .createSignedUrl(params.path, 300);
  if (error || !data?.signedUrl) {
    return NextResponse.json({ error: error?.message ?? "Could not sign." }, { status: 500 });
  }
  return NextResponse.redirect(data.signedUrl, { status: 302 });
}
