import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserWithRole } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";

export const metadata = { title: "Admin · Audit log" };
export const dynamic = "force-dynamic";

type Row = {
  id: string;
  created_at: string;
  actor_email: string | null;
  actor_role: string | null;
  action: string;
  entity_type: string | null;
  entity_id: string | null;
  details: Record<string, unknown> | null;
  ip: string | null;
};

export default async function AuditPage() {
  const session = await getUserWithRole();
  if (!session || session.role !== "admin") redirect("/");

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("audit_log")
    .select("id, created_at, actor_email, actor_role, action, entity_type, entity_id, details, ip")
    .order("created_at", { ascending: false })
    .limit(500)
    .returns<Row[]>();
  const rows = data ?? [];

  return (
    <section className="bg-paper">
      <div className="container-page py-12">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="eyebrow">ADMIN · AUDIT</span>
            <h1 className="mt-2 text-3xl font-medium tracking-tight">Audit log</h1>
            <p className="text-sm text-ink-3">
              Most recent {rows.length} events · append-only
            </p>
          </div>
          <Link href="/admin" className="mono text-[12px] text-ink-3 hover:text-ink-1">
            ← Admin home
          </Link>
        </div>

        <div className="mt-8 overflow-hidden rounded-lg border border-paper-3 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-paper text-[11px] uppercase text-ink-3">
              <tr>
                <th className="px-4 py-2 text-left font-medium">When</th>
                <th className="px-4 py-2 text-left font-medium">Actor</th>
                <th className="px-4 py-2 text-left font-medium">Action</th>
                <th className="px-4 py-2 text-left font-medium">Entity</th>
                <th className="px-4 py-2 text-left font-medium">Details</th>
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={5} className="px-4 py-12 text-center text-ink-3">
                    No audit events yet.
                  </td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-paper-2 align-top">
                  <td className="px-4 py-3 font-mono text-[11px] text-ink-3 whitespace-nowrap">
                    {new Date(r.created_at).toLocaleString()}
                  </td>
                  <td className="px-4 py-3 text-[12px]">
                    <div>{r.actor_email ?? "—"}</div>
                    <div className="mono text-[10px] uppercase text-ink-4">{r.actor_role ?? "—"}</div>
                  </td>
                  <td className="px-4 py-3 font-mono text-[12px]">{r.action}</td>
                  <td className="px-4 py-3 text-[12px]">
                    {r.entity_type ? (
                      <>
                        <div className="mono text-[10px] uppercase text-ink-4">{r.entity_type}</div>
                        <div className="font-mono text-[11px]">{r.entity_id}</div>
                      </>
                    ) : (
                      "—"
                    )}
                  </td>
                  <td className="px-4 py-3 font-mono text-[11px] text-ink-3">
                    {r.details ? JSON.stringify(r.details) : "—"}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}
