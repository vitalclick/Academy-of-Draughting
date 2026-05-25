import { NextResponse } from "next/server";
import { getSessionUser } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const runtime = "nodejs";
export const dynamic = "force-dynamic";

// POPIA right of access: return every record we hold about the caller,
// as a JSON attachment. Auth required.
export async function GET() {
  const user = await getSessionUser();
  if (!user) {
    return NextResponse.json({ error: "Sign in to export your data." }, { status: 401 });
  }

  const s = getSupabaseAdmin();
  const [profile, apps, docs, enrollments, submissions, deletionRequests] = await Promise.all([
    s.from("profiles").select("*").eq("id", user.id).maybeSingle(),
    s.from("applications").select("*").eq("user_id", user.id),
    s.from("application_documents").select("*").eq("user_id", user.id),
    s.from("enrollments").select("*").eq("user_id", user.id),
    s.from("submissions").select("*").eq("user_id", user.id),
    s.from("data_deletion_requests").select("*").eq("user_id", user.id),
  ]);

  const payload = {
    exported_at: new Date().toISOString(),
    subject: {
      id: user.id,
      email: user.email,
    },
    profile: profile.data ?? null,
    applications: apps.data ?? [],
    application_documents: docs.data ?? [],
    enrollments: enrollments.data ?? [],
    submissions: submissions.data ?? [],
    data_deletion_requests: deletionRequests.data ?? [],
    note: "File contents are not included in this export. Storage paths are listed; sign in to the portal to re-download individual files.",
  };

  const ts = new Date().toISOString().slice(0, 10);
  return new NextResponse(JSON.stringify(payload, null, 2), {
    status: 200,
    headers: {
      "Content-Type": "application/json; charset=utf-8",
      "Content-Disposition": `attachment; filename="aod-export-${ts}.json"`,
      "Cache-Control": "no-store",
    },
  });
}
