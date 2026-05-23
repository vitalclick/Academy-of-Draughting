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
  const summary = await dashboardSummary();

  return (
    <section className="bg-paper">
      <div className="container-page py-12">
        <div className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
          <SummaryCard
            label="Applications · pending review"
            value={summary.pendingApplications}
            sub={`${summary.totalApplications} total`}
            href="/admin?status=received"
          />
          <SummaryCard
            label="Submissions · awaiting grading"
            value={summary.ungradedSubmissions}
            sub={summary.oldestUngradedDays != null
              ? `oldest ${summary.oldestUngradedDays}d ago`
              : "all clear"}
            href="/admin/grading"
            tone={summary.ungradedSubmissions > 0 ? "warning" : "ok"}
          />
          <SummaryCard
            label="Active enrollments"
            value={summary.activeEnrollments}
            sub={`${summary.cohortCount} ${summary.cohortCount === 1 ? "cohort" : "cohorts"}`}
            href="/admin/cohorts"
          />
          <SummaryCard
            label="Curriculum"
            value={summary.assignmentCount}
            sub={`${summary.moduleCount} ${summary.moduleCount === 1 ? "module" : "modules"} · assignments`}
            href="/admin/curriculum"
          />
        </div>

        <div className="mt-10 flex flex-wrap items-end justify-between gap-4">
          <div>
            <span className="eyebrow">ADMIN · APPLICATIONS</span>
            <h1 className="mt-2 text-3xl font-medium">Applications</h1>
            <p className="text-sm text-ink-3">
              {rows.length} shown · most recent first
            </p>
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

async function dashboardSummary() {
  const supabase = getSupabaseAdmin();
  const [appsRes, subsRes, enrollRes, modRes, asgRes] = await Promise.all([
    supabase.from("applications").select("status"),
    supabase
      .from("submissions")
      .select("status, submitted_at")
      .eq("status", "submitted"),
    supabase.from("enrollments").select("status, course_slug"),
    supabase.from("modules").select("id"),
    supabase.from("assignments").select("id"),
  ]);
  const apps = (appsRes.data ?? []) as { status: string }[];
  const subs = (subsRes.data ?? []) as { status: string; submitted_at: string | null }[];
  const enrolls = (enrollRes.data ?? []) as { status: string; course_slug: string }[];

  const pendingApplications = apps.filter(
    (a) => a.status === "received" || a.status === "reviewing"
  ).length;
  const ungraded = subs.length;
  const oldest = subs
    .map((s) => (s.submitted_at ? +new Date(s.submitted_at) : null))
    .filter((n): n is number => n != null)
    .sort((a, b) => a - b)[0];
  const oldestUngradedDays =
    oldest != null ? Math.floor((Date.now() - oldest) / 86_400_000) : null;
  const activeEnrollments = enrolls.filter((e) => e.status === "active").length;
  const cohortCount = new Set(enrolls.map((e) => e.course_slug)).size;

  return {
    totalApplications: apps.length,
    pendingApplications,
    ungradedSubmissions: ungraded,
    oldestUngradedDays,
    activeEnrollments,
    cohortCount,
    moduleCount: (modRes.data ?? []).length,
    assignmentCount: (asgRes.data ?? []).length,
  };
}

function SummaryCard({
  label,
  value,
  sub,
  href,
  tone,
}: {
  label: string;
  value: number;
  sub: string;
  href: string;
  tone?: "ok" | "warning";
}) {
  const valueClass =
    tone === "warning" && value > 0
      ? "text-amber-700"
      : tone === "ok"
        ? "text-electric-600"
        : "text-ink-1";
  return (
    <Link
      href={href}
      className="block rounded-lg border border-paper-3 bg-white p-4 transition hover:border-electric-300 hover:shadow-sm"
    >
      <div className="mono text-[10px] uppercase text-ink-4">{label}</div>
      <div className={`mt-2 text-3xl font-medium ${valueClass}`}>{value}</div>
      <div className="mt-1 text-[11px] text-ink-3">{sub}</div>
    </Link>
  );
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
