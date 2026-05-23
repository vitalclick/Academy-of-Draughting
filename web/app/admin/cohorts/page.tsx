import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserWithRole } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { courses } from "@/data/courses";

export const metadata = { title: "Admin · Cohorts" };
export const dynamic = "force-dynamic";

type EnrollmentRow = { course_slug: string; status: string };

export default async function AdminCohortsPage() {
  const session = await getUserWithRole();
  if (!session || session.role !== "admin") redirect("/");

  const supabase = getSupabaseAdmin();
  const { data } = await supabase
    .from("enrollments")
    .select("course_slug, status")
    .returns<EnrollmentRow[]>();
  const rows = data ?? [];

  const byCourse = new Map<string, { active: number; total: number }>();
  for (const r of rows) {
    const cur = byCourse.get(r.course_slug) ?? { active: 0, total: 0 };
    cur.total += 1;
    if (r.status === "active") cur.active += 1;
    byCourse.set(r.course_slug, cur);
  }

  const cohortList = [...byCourse.entries()].sort((a, b) => b[1].total - a[1].total);

  return (
    <section className="bg-paper">
      <div className="container-page py-12">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="eyebrow">ADMIN</span>
            <h1 className="mt-2 text-3xl font-medium tracking-tight">Cohorts</h1>
          </div>
          <Link href="/admin" className="mono text-[12px] text-ink-3 hover:text-ink-1">
            ← Applications
          </Link>
        </div>

        {cohortList.length === 0 ? (
          <div className="mt-10 rounded-lg border border-paper-3 bg-white p-8 text-center text-ink-3">
            <p>No cohorts yet. Enrollments appear here once a student is admitted.</p>
          </div>
        ) : (
          <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {cohortList.map(([slug, counts]) => {
              const course = courses.find((c) => c.slug === slug);
              return (
                <Link
                  key={slug}
                  href={`/admin/cohorts/${slug}`}
                  className="block rounded-lg border border-paper-3 bg-white p-6 transition hover:border-electric-300 hover:shadow-sm"
                >
                  <div className="mono text-[11px] text-ink-4">{slug}</div>
                  <h2 className="mt-2 text-lg font-medium">{course?.title ?? slug}</h2>
                  <div className="mt-4 flex items-baseline gap-4 text-sm">
                    <div>
                      <div className="text-2xl font-medium text-electric-600">{counts.active}</div>
                      <div className="mono text-[11px] text-ink-4">ACTIVE</div>
                    </div>
                    <div>
                      <div className="text-2xl font-medium">{counts.total}</div>
                      <div className="mono text-[11px] text-ink-4">TOTAL</div>
                    </div>
                  </div>
                </Link>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
