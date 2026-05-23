import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserWithRole } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { GradeForm } from "@/components/GradeForm";
import { GradingFeedListener } from "@/components/GradingFeedListener";
import { courses } from "@/data/courses";
import type { Submission } from "@/lib/database.types";

export const metadata = { title: "Admin · Grading queue" };
export const dynamic = "force-dynamic";

type Row = Submission & {
  assignments: {
    title: string;
    max_score: number;
    modules: { title: string; course_slug: string };
  };
};

export default async function GradingQueuePage({
  searchParams,
}: {
  searchParams: { course?: string };
}) {
  const session = await getUserWithRole();
  if (!session || (session.role !== "admin" && session.role !== "faculty")) redirect("/");

  const supabase = getSupabaseAdmin();
  let query = supabase
    .from("submissions")
    .select(
      "id, assignment_id, user_id, status, storage_path, notes, score, feedback, submitted_at, graded_at, created_at, updated_at, assignments!inner(title, max_score, modules!inner(title, course_slug))"
    )
    .eq("status", "submitted")
    .order("submitted_at", { ascending: true })
    .limit(200);
  if (searchParams.course) query = query.eq("assignments.modules.course_slug", searchParams.course);
  const { data } = await query.returns<Row[]>();
  const rows = data ?? [];

  const userIds = [...new Set(rows.map((r) => r.user_id))];
  const { data: profilesData } = userIds.length
    ? await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", userIds)
    : { data: [] };
  const profileById = new Map((profilesData ?? []).map((p) => [p.id, p]));

  return (
    <section className="bg-paper">
      <div className="container-page py-12">
        <div className="flex flex-wrap items-baseline justify-between gap-3">
          <div>
            <span className="eyebrow">ADMIN · GRADING QUEUE</span>
            <h1 className="mt-2 text-3xl font-medium tracking-tight">Grading queue</h1>
            <p className="text-sm text-ink-3">
              {rows.length} {rows.length === 1 ? "submission" : "submissions"} awaiting review · oldest first
            </p>
          </div>
          <div className="flex flex-col items-end gap-2">
            <GradingFeedListener courseFilter={searchParams.course} />
            <Link href="/admin" className="mono text-[12px] text-ink-3 hover:text-ink-1">
              ← Admin home
            </Link>
          </div>
        </div>

        <div className="mt-4 flex flex-wrap gap-1 rounded-md border border-paper-3 bg-white p-1 text-[12px]">
          <CourseFilter label="All courses" href="/admin/grading" active={!searchParams.course} />
          {courses.map((c) => (
            <CourseFilter
              key={c.slug}
              label={c.code}
              href={`/admin/grading?course=${c.slug}`}
              active={searchParams.course === c.slug}
            />
          ))}
        </div>

        {rows.length === 0 ? (
          <div className="mt-10 rounded-lg border border-paper-3 bg-white p-8 text-center text-ink-3">
            Nothing waiting. ✓
          </div>
        ) : (
          <div className="mt-8 space-y-4">
            {rows.map((sub) => {
              const profile = profileById.get(sub.user_id);
              const course = courses.find((c) => c.slug === sub.assignments.modules.course_slug);
              const age = sub.submitted_at
                ? Math.floor((Date.now() - +new Date(sub.submitted_at)) / 86_400_000)
                : 0;
              const ageTone = age >= 7 ? "text-red-600" : age >= 3 ? "text-amber-600" : "text-ink-4";
              return (
                <article key={sub.id} className="rounded-lg border border-paper-3 bg-white p-5">
                  <div className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <div className="mono text-[11px] text-ink-4">
                        {course?.title ?? sub.assignments.modules.course_slug} ·{" "}
                        {sub.assignments.modules.title}
                      </div>
                      <div className="text-lg font-medium">{sub.assignments.title}</div>
                      <div className="mono text-[11px] text-ink-4">
                        {profile?.full_name ?? profile?.email ?? "Unknown student"}
                        {profile?.email && profile.full_name ? ` · ${profile.email}` : ""}
                      </div>
                    </div>
                    <div className={`mono text-[11px] ${ageTone}`}>
                      submitted {age === 0 ? "today" : `${age}d ago`}
                    </div>
                  </div>
                  {sub.notes && (
                    <div className="mt-3 rounded border border-paper-3 bg-paper-1 p-2 text-[12px] text-ink-2">
                      <span className="mono text-[10px] text-ink-4">STUDENT NOTES</span>
                      <p className="mt-1 whitespace-pre-line">{sub.notes}</p>
                    </div>
                  )}
                  <div className="mt-2 flex flex-wrap items-center gap-3 text-[11px]">
                    {sub.storage_path && (
                      <a
                        href={`/api/admin/file?bucket=submissions&path=${encodeURIComponent(sub.storage_path)}`}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="mono rounded border border-paper-3 px-2 py-1 text-electric-700 hover:border-electric-300"
                      >
                        Download file ↗
                      </a>
                    )}
                    <Link
                      href={`/admin/cohorts/${sub.assignments.modules.course_slug}`}
                      className="mono text-electric-600 hover:underline"
                    >
                      Open full cohort view →
                    </Link>
                  </div>
                  <GradeForm
                    submissionId={sub.id}
                    initialScore={sub.score}
                    initialFeedback={sub.feedback}
                    initialStatus={sub.status}
                    maxScore={sub.assignments.max_score}
                  />
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}

function CourseFilter({ label, href, active }: { label: string; href: string; active: boolean }) {
  return (
    <Link
      href={href}
      className={`mono rounded px-2 py-0.5 ${
        active ? "bg-electric-600 text-white" : "text-ink-3 hover:text-ink-1"
      }`}
    >
      {label}
    </Link>
  );
}
