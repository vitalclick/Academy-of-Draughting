import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getUserWithRole } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { GradeForm } from "@/components/GradeForm";
import { EnrollForm, EnrollmentStatusSelect } from "@/components/EnrollForm";
import { courses } from "@/data/courses";
import type {
  Assignment,
  Enrollment,
  Module,
  Profile,
  Submission,
} from "@/lib/database.types";

export const dynamic = "force-dynamic";

type Params = { params: { slug: string } };

export async function generateMetadata({ params }: Params) {
  const course = courses.find((c) => c.slug === params.slug);
  return { title: `Admin · ${course?.title ?? params.slug}` };
}

type ProfileLite = Pick<Profile, "id" | "email" | "full_name">;

export default async function CohortDetailPage({ params }: Params) {
  const session = await getUserWithRole();
  if (!session || session.role !== "admin") redirect("/");

  const course = courses.find((c) => c.slug === params.slug);
  if (!course && params.slug.length < 2) notFound();

  const supabase = getSupabaseAdmin();

  const [{ data: enrollmentsData }, { data: modulesData }] = await Promise.all([
    supabase
      .from("enrollments")
      .select("id, user_id, course_slug, cohort_label, status, enrolled_at")
      .eq("course_slug", params.slug)
      .order("enrolled_at", { ascending: true })
      .returns<Enrollment[]>(),
    supabase
      .from("modules")
      .select("id, course_slug, title, description, order_index, created_at")
      .eq("course_slug", params.slug)
      .order("order_index", { ascending: true })
      .returns<Module[]>(),
  ]);

  const enrollmentsRaw = enrollmentsData ?? [];
  const modules = modulesData ?? [];
  const moduleIds = modules.map((m) => m.id);
  const userIds = enrollmentsRaw.map((e) => e.user_id);

  const { data: profilesData } = userIds.length
    ? await supabase
        .from("profiles")
        .select("id, email, full_name")
        .in("id", userIds)
        .returns<ProfileLite[]>()
    : { data: [] as ProfileLite[] };
  const profileById = new Map((profilesData ?? []).map((p) => [p.id, p]));
  const enrollments = enrollmentsRaw.map((e) => ({
    ...e,
    profile: profileById.get(e.user_id) ?? null,
  }));

  const { data: assignmentsData } = moduleIds.length
    ? await supabase
        .from("assignments")
        .select("id, module_id, title, description, due_at, max_score, order_index, created_at")
        .in("module_id", moduleIds)
        .order("order_index", { ascending: true })
        .returns<Assignment[]>()
    : { data: [] as Assignment[] };
  const assignments = assignmentsData ?? [];

  const { data: submissionsData } = userIds.length && assignments.length
    ? await supabase
        .from("submissions")
        .select("id, assignment_id, user_id, status, score, feedback, submitted_at, graded_at, storage_path, notes, created_at, updated_at")
        .in("assignment_id", assignments.map((a) => a.id))
        .in("user_id", userIds)
        .returns<Submission[]>()
    : { data: [] as Submission[] };
  const submissions = submissionsData ?? [];

  const submissionLookup = new Map<string, Submission>();
  for (const s of submissions) submissionLookup.set(`${s.user_id}:${s.assignment_id}`, s);

  return (
    <section className="bg-paper">
      <div className="container-page py-12">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <Link href="/admin/cohorts" className="mono text-[12px] text-ink-3 hover:text-ink-1">
              ← Cohorts
            </Link>
            <h1 className="mt-2 text-3xl font-medium tracking-tight">
              {course?.title ?? params.slug}
            </h1>
            <div className="mono text-[12px] text-ink-4">
              {enrollments.length} {enrollments.length === 1 ? "student" : "students"} ·{" "}
              {modules.length} {modules.length === 1 ? "module" : "modules"} · {assignments.length}{" "}
              assignments
            </div>
          </div>
          <EnrollForm
            courseSlug={params.slug}
            defaultCohort={enrollments[0]?.cohort_label ?? null}
          />
        </div>

        {enrollments.length === 0 ? (
          <div className="mt-10 rounded-lg border border-paper-3 bg-white p-8 text-center text-ink-3">
            No students enrolled yet.
          </div>
        ) : (
          <div className="mt-8 space-y-8">
            {enrollments.map((enrollment) => (
              <article
                key={enrollment.id}
                className="rounded-lg border border-paper-3 bg-white p-6"
              >
                <header className="flex flex-wrap items-baseline justify-between gap-2">
                  <div>
                    <h2 className="text-lg font-medium">
                      {enrollment.profile?.full_name ?? enrollment.profile?.email ?? "Unknown"}
                    </h2>
                    <div className="mono flex flex-wrap items-center gap-x-2 gap-y-1 text-[11px] text-ink-4">
                      <span>{enrollment.profile?.email ?? "—"}</span>
                      <span>·</span>
                      <span>
                        enrolled {new Date(enrollment.enrolled_at).toLocaleDateString()}
                      </span>
                      <span>·</span>
                      <EnrollmentStatusSelect
                        enrollmentId={enrollment.id}
                        current={enrollment.status}
                      />
                    </div>
                  </div>
                </header>
                <div className="mt-5 space-y-4">
                  {modules.map((m) => {
                    const moduleAssignments = assignments.filter((a) => a.module_id === m.id);
                    if (moduleAssignments.length === 0) return null;
                    return (
                      <div key={m.id}>
                        <h3 className="mono text-[11px] uppercase text-ink-4">{m.title}</h3>
                        <ul className="mt-2 space-y-3">
                          {moduleAssignments.map((a) => {
                            const sub = submissionLookup.get(`${enrollment.user_id}:${a.id}`);
                            const status = sub?.status ?? "not started";
                            const statusTone =
                              status === "graded"
                                ? "bg-electric-100 text-electric-700"
                                : status === "submitted"
                                  ? "bg-cyan-100 text-cyan-800"
                                  : status === "returned"
                                    ? "bg-amber-100 text-amber-800"
                                    : status === "draft"
                                      ? "bg-paper-2 text-ink-2"
                                      : "bg-paper-2 text-ink-4";
                            return (
                              <li
                                key={a.id}
                                className="rounded border border-paper-3 bg-paper-1 p-3"
                              >
                                <div className="flex flex-wrap items-baseline justify-between gap-2">
                                  <div>
                                    <div className="text-sm font-medium text-ink-1">
                                      {a.title}
                                    </div>
                                    <div className="mono text-[11px] text-ink-4">
                                      max {a.max_score}
                                      {sub?.submitted_at && (
                                        <>
                                          {" "}
                                          · submitted{" "}
                                          {new Date(sub.submitted_at).toLocaleDateString()}
                                        </>
                                      )}
                                      {sub?.score != null && (
                                        <>
                                          {" "}
                                          · scored{" "}
                                          <span className="text-electric-700">
                                            {sub.score}/{a.max_score}
                                          </span>
                                        </>
                                      )}
                                    </div>
                                  </div>
                                  <span
                                    className={`mono rounded-full px-2.5 py-0.5 text-[10px] uppercase ${statusTone}`}
                                  >
                                    {status}
                                  </span>
                                </div>
                                {sub?.notes && (
                                  <div className="mt-2 rounded border border-paper-3 bg-white p-2 text-[12px] text-ink-2">
                                    <span className="mono text-[10px] text-ink-4">
                                      STUDENT NOTES
                                    </span>
                                    <p className="mt-1 whitespace-pre-line">{sub.notes}</p>
                                  </div>
                                )}
                                {sub?.storage_path && (
                                  <div className="mt-2">
                                    <a
                                      href={`/api/admin/file?bucket=submissions&path=${encodeURIComponent(sub.storage_path)}`}
                                      target="_blank"
                                      rel="noopener noreferrer"
                                      className="mono text-[11px] text-electric-700 hover:underline"
                                    >
                                      Download submitted file ↗
                                    </a>
                                  </div>
                                )}
                                {sub ? (
                                  <GradeForm
                                    submissionId={sub.id}
                                    initialScore={sub.score}
                                    initialFeedback={sub.feedback}
                                    initialStatus={sub.status}
                                    maxScore={a.max_score}
                                  />
                                ) : (
                                  <div className="mt-2 text-[11px] text-ink-4">
                                    Awaiting student submission.
                                  </div>
                                )}
                              </li>
                            );
                          })}
                        </ul>
                      </div>
                    );
                  })}
                </div>
              </article>
            ))}
          </div>
        )}
      </div>
    </section>
  );
}
