import { notFound, redirect } from "next/navigation";
import Link from "next/link";
import { getUserWithRole } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { StatusForm } from "@/components/StatusForm";

export const dynamic = "force-dynamic";

export default async function ApplicationDetailPage({ params }: { params: { id: string } }) {
  const session = await getUserWithRole();
  if (!session || session.role !== "admin") redirect("/");

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("applications")
    .select("*")
    .eq("id", params.id)
    .maybeSingle();

  if (error) {
    return <ErrorBox message={error.message} />;
  }
  if (!data) notFound();

  const { data: docs } = await supabase
    .from("application_documents")
    .select("id, filename, mime_type, size_bytes, ocr_status, created_at")
    .eq("application_id", params.id)
    .order("created_at", { ascending: false });

  return (
    <section className="bg-paper">
      <div className="container-page py-12">
        <Link href="/admin" className="text-sm text-ink-3 hover:text-ink">← Back to applications</Link>
        <div className="mt-4 grid gap-6 lg:grid-cols-[1.5fr_1fr]">
          <div className="rounded-lg border border-paper-3 bg-white p-6">
            <span className="eyebrow">APPLICATION · {data.id.slice(0, 8)}</span>
            <h1 className="mt-2 text-2xl font-medium">{data.full_name}</h1>
            <dl className="mt-6 grid grid-cols-2 gap-x-6 gap-y-4 text-sm">
              <Field k="Email" v={data.email} />
              <Field k="Phone" v={data.phone} />
              <Field k="Course" v={data.course_slug} />
              <Field k="Mode" v={data.study_mode} />
              <Field k="Previous Qualification" v={data.prev_qualification || "—"} />
              <Field k="Received" v={new Date(data.created_at).toLocaleString()} />
              <Field k="User ID" v={data.user_id || "(anonymous)"} className="font-mono text-[12px]" />
            </dl>
            {data.notes && (
              <div className="mt-6 rounded-md border border-paper-2 bg-paper p-4">
                <span className="mono text-ink-4">NOTES</span>
                <p className="mt-2 whitespace-pre-wrap text-sm text-ink-2">{data.notes}</p>
              </div>
            )}
            <div className="mt-8">
              <h2 className="text-sm font-medium">Documents</h2>
              <div className="mt-3 rounded-md border border-paper-2">
                {(docs ?? []).length === 0 ? (
                  <p className="px-4 py-6 text-center text-sm text-ink-3">No documents uploaded yet.</p>
                ) : (
                  <ul className="divide-y divide-paper-2 text-sm">
                    {docs!.map((d) => (
                      <li key={d.id} className="flex items-center justify-between px-4 py-2">
                        <span>{d.filename}</span>
                        <span className="mono text-ink-4">{d.ocr_status}</span>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>

          <div className="rounded-lg border border-paper-3 bg-white p-6">
            <span className="eyebrow">STATUS</span>
            <p className="mt-2 text-sm text-ink-3">Current: <strong>{data.status}</strong></p>
            <StatusForm id={data.id} current={data.status} />
          </div>
        </div>
      </div>
    </section>
  );
}

function Field({ k, v, className }: { k: string; v: string; className?: string }) {
  return (
    <div>
      <dt className="mono text-ink-4">{k}</dt>
      <dd className={`mt-1 text-ink-2 ${className ?? ""}`}>{v}</dd>
    </div>
  );
}

function ErrorBox({ message }: { message: string }) {
  return (
    <section className="container-page py-12">
      <div className="rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">{message}</div>
    </section>
  );
}
