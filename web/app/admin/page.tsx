import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserWithRole } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import type { ApplicationStatus } from "@/lib/database.types";

export const metadata = { title: "Admin · Applications" };
export const dynamic = "force-dynamic";

const STATUSES = ["received", "reviewing", "accepted", "rejected", "withdrawn"] as const;

function asStatus(s: string | undefined): ApplicationStatus | null {
  return (STATUSES as readonly string[]).includes(s ?? "") ? (s as ApplicationStatus) : null;
}

type Row = {
  id: string;
  full_name: string;
  email: string;
  phone: string;
  course_slug: string;
  study_mode: string;
  status: string;
  created_at: string;
};

export default async function AdminApplicationsPage({
  searchParams,
}: {
  searchParams: { status?: string };
}) {
  const session = await getUserWithRole();
  if (!session || session.role !== "admin") redirect("/");

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("applications")
    .select("id, full_name, email, phone, course_slug, study_mode, status, created_at")
    .order("created_at", { ascending: false })
    .limit(200);
  const statusFilter = asStatus(searchParams.status);
  if (statusFilter) query = query.eq("status", statusFilter);
  const { data, error } = await query.returns<Row[]>();
  const rows = data ?? [];

  const counts = await statusCounts();

  return (
    <section className="bg-paper">
      <div className="container-page py-12">
        <div className="flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow">ADMIN · APPLICATIONS</span>
            <h1 className="mt-2 text-3xl font-medium">Applications</h1>
            <p className="text-sm text-ink-3">{rows.length} shown · most recent first</p>
          </div>
          <div className="flex flex-wrap gap-1 rounded-md border border-paper-3 bg-white p-1 text-[12px]">
            <Filter label="All" href="/admin" active={!statusFilter} count={counts.total} />
            {STATUSES.map((s) => (
              <Filter
                key={s}
                label={s}
                href={`/admin?status=${s}`}
                active={statusFilter === s}
                count={counts[s] ?? 0}
              />
            ))}
          </div>
        </div>

        {error && (
          <div className="mt-6 rounded-md border border-red-300 bg-red-50 px-4 py-3 text-sm text-red-700">
            {error.message}
          </div>
        )}

        <div className="mt-6 overflow-hidden rounded-lg border border-paper-3 bg-white">
          <table className="w-full text-sm">
            <thead className="bg-paper text-[11px] uppercase text-ink-3">
              <tr>
                <Th>Name</Th>
                <Th>Email</Th>
                <Th>Course</Th>
                <Th>Mode</Th>
                <Th>Status</Th>
                <Th>Received</Th>
                <Th />
              </tr>
            </thead>
            <tbody>
              {rows.length === 0 && (
                <tr>
                  <td colSpan={7} className="px-4 py-12 text-center text-ink-3">No applications yet.</td>
                </tr>
              )}
              {rows.map((r) => (
                <tr key={r.id} className="border-t border-paper-2">
                  <Td>{r.full_name}</Td>
                  <Td>{r.email}</Td>
                  <Td className="font-mono text-[12px]">{r.course_slug}</Td>
                  <Td>{r.study_mode}</Td>
                  <Td><StatusPill status={r.status} /></Td>
                  <Td className="text-ink-3">{new Date(r.created_at).toLocaleString()}</Td>
                  <Td>
                    <Link href={`/admin/applications/${r.id}`} className="text-electric-700 hover:underline">
                      Open →
                    </Link>
                  </Td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>
    </section>
  );
}

async function statusCounts() {
  const supabase = getSupabaseAdmin();
  const { data } = await supabase.from("applications").select("status");
  const acc: Record<string, number> = { total: 0 };
  for (const r of data ?? []) {
    const s = (r as { status: string }).status;
    acc[s] = (acc[s] ?? 0) + 1;
    acc.total += 1;
  }
  return acc as Record<string, number> & { total: number };
}

function Th({ children }: { children?: React.ReactNode }) {
  return <th className="px-4 py-2 text-left font-medium">{children}</th>;
}
function Td({ children, className }: { children?: React.ReactNode; className?: string }) {
  return <td className={`px-4 py-3 ${className ?? ""}`}>{children}</td>;
}
function Filter({ label, href, active, count }: { label: string; href: string; active: boolean; count: number }) {
  return (
    <Link
      href={href}
      className={`rounded-sm px-3 py-1.5 capitalize ${active ? "bg-navy-900 text-white" : "text-ink-2 hover:bg-paper"}`}
    >
      {label} <span className="ml-1 text-ink-4">{count}</span>
    </Link>
  );
}
function StatusPill({ status }: { status: string }) {
  const tone: Record<string, string> = {
    received: "bg-paper-2 text-ink-2",
    reviewing: "bg-electric-100 text-electric-700",
    accepted: "bg-green-100 text-green-800",
    rejected: "bg-red-100 text-red-700",
    withdrawn: "bg-paper-3 text-ink-3",
  };
  return <span className={`rounded-full px-2 py-0.5 text-[11px] font-mono uppercase ${tone[status] ?? "bg-paper"}`}>{status}</span>;
}
