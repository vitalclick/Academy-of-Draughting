import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServer, getUserWithRole } from "@/lib/supabase/server";
import { DocumentUpload } from "@/components/DocumentUpload";
import { SubmitWork } from "@/components/SubmitWork";
import { AssignmentTutor } from "@/components/AssignmentTutor";
import { CourseProgress } from "@/components/CourseProgress";
import { YourData } from "@/components/YourData";
import { courses } from "@/data/courses";
import type {
  Application,
  Assignment,
  Enrollment,
  Module,
  Submission,
} from "@/lib/database.types";

type PortalApplication = Pick<
  Application,
  "id" | "full_name" | "course_slug" | "study_mode" | "status" | "created_at"
>;

export const metadata = { title: "Student Portal — Academy of Advanced Draughting" };
export const dynamic = "force-dynamic";

function courseTitle(slug: string): string {
  return courses.find((c) => c.slug === slug)?.title ?? slug;
}

function dueLabel(due: string | null): { text: string; tone: "ok" | "soon" | "late" | "none" } {
  if (!due) return { text: "No due date", tone: "none" };
  const days = Math.round((+new Date(due) - Date.now()) / 86_400_000);
  if (days < 0) return { text: `${-days}d overdue`, tone: "late" };
  if (days === 0) return { text: "Due today", tone: "soon" };
  if (days <= 3) return { text: `Due in ${days}d`, tone: "soon" };
  return { text: `Due ${new Date(due).toLocaleDateString()}`, tone: "ok" };
}

// Effective due-date for a student: offset from cohort start if both are set,
// else fall back to the assignment's absolute due_at.
function effectiveDueAt(
  assignment: { due_at: string | null; due_offset_days: number | null },
  enrollment: { starts_on: string | null }
): string | null {
  if (assignment.due_offset_days != null && enrollment.starts_on) {
    const d = new Date(enrollment.starts_on);
    d.setUTCDate(d.getUTCDate() + assignment.due_offset_days);
    return d.toISOString();
  }
  return assignment.due_at;
}

export default async function PortalPage() {
  const session = await getUserWithRole();
  if (!session) redirect("/login?next=/portal");

  const supabase = getSupabaseServer();

  const [{ data: enrollmentsData }, { data: applicationsData }, { data: submissionsData }] =
    await Promise.all([
      supabase
        .from("enrollments")
        .select("id, user_id, course_slug, cohort_label, status, enrolled_at, starts_on")
        .eq("user_id", session.user.id)
        .order("enrolled_at", { ascending: false })
        .returns<Enrollment[]>(),
      supabase
        .from("applications")
        .select("id, full_name, course_slug, study_mode, status, created_at")
        .eq("user_id", session.user.id)
        .order("created_at", { ascending: false })
        .returns<PortalApplication[]>(),
      supabase
        .from("submissions")
        .select("id, assignment_id, user_id, status, score, feedback, submitted_at, graded_at, storage_path, notes, created_at, updated_at, scan_status")
        .eq("user_id", session.user.id)
        .returns<Submission[]>(),
    ]);

  const enrollments = enrollmentsData ?? [];
  const applications = applicationsData ?? [];
  const submissions = submissionsData ?? [];

  const courseSlugs = enrollments.map((e) => e.course_slug);
  const { data: modulesData } = courseSlugs.length
    ? await supabase
        .from("modules")
        .select("id, course_slug, title, description, order_index, created_at")
        .in("course_slug", courseSlugs)
        .is("deleted_at", null)
        .order("order_index", { ascending: true })
        .returns<Module[]>()
    : { data: [] as Module[] };
  const modules = modulesData ?? [];

  const moduleIds = modules.map((m) => m.id);
  const { data: assignmentsData } = moduleIds.length
    ? await supabase
        .from("assignments")
        .select("id, module_id, title, description, due_at, max_score, order_index, created_at, release_offset_days, due_offset_days, brief_storage_path, late_penalty_pct_per_day, late_grace_days")
        .in("module_id", moduleIds)
        .is("deleted_at", null)
        .order("order_index", { ascending: true })
        .returns<Assignment[]>()
    : { data: [] as Assignment[] };
  const assignments = assignmentsData ?? [];

  // Prerequisites: an assignment is locked until all its prereqs have a
  // graded submission from this student.
  const assignmentIds = assignments.map((a) => a.id);
  const { data: prereqRows } = assignmentIds.length
    ? await supabase
        .from("assignment_prerequisites")
        .select("assignment_id, prerequisite_id")
        .in("assignment_id", assignmentIds)
        .returns<{ assignment_id: string; prerequisite_id: string }[]>()
    : { data: [] as { assignment_id: string; prerequisite_id: string }[] };
  const prereqsByAssignment = new Map<string, string[]>();
  for (const p of prereqRows ?? []) {
    const list = prereqsByAssignment.get(p.assignment_id) ?? [];
    list.push(p.prerequisite_id);
    prereqsByAssignment.set(p.assignment_id, list);
  }
  // Rubric breakdown: criteria per assignment + this student's per-criterion
  // scores, shown under graded assignments.
  const { data: criteriaRows } = assignmentIds.length
    ? await supabase
        .from("rubric_criteria")
        .select("id, assignment_id, label, max_points, order_index")
        .in("assignment_id", assignmentIds)
        .order("order_index", { ascending: true })
        .returns<{ id: string; assignment_id: string; label: string; max_points: number }[]>()
    : { data: [] as { id: string; assignment_id: string; label: string; max_points: number }[] };
  const criteriaByAssignment = new Map<
    string,
    { id: string; label: string; max_points: number }[]
  >();
  for (const c of criteriaRows ?? []) {
    const list = criteriaByAssignment.get(c.assignment_id) ?? [];
    list.push({ id: c.id, label: c.label, max_points: c.max_points });
    criteriaByAssignment.set(c.assignment_id, list);
  }
  const submissionIds = submissions.map((s) => s.id);
  const { data: critScoreRows } = submissionIds.length
    ? await supabase
        .from("submission_criterion_scores")
        .select("submission_id, criterion_id, points, comment")
        .in("submission_id", submissionIds)
        .returns<{ submission_id: string; criterion_id: string; points: number; comment: string | null }[]>()
    : { data: [] as { submission_id: string; criterion_id: string; points: number; comment: string | null }[] };
  const critScoresBySubmission = new Map<
    string,
    Map<string, { points: number; comment: string | null }>
  >();
  for (const cs of critScoreRows ?? []) {
    const m = critScoresBySubmission.get(cs.submission_id) ?? new Map();
    m.set(cs.criterion_id, { points: cs.points, comment: cs.comment });
    critScoresBySubmission.set(cs.submission_id, m);
  }

  const gradedIds = new Set(
    submissions.filter((s) => s.status === "graded").map((s) => s.assignment_id)
  );
  const assignmentTitleById = new Map(assignments.map((a) => [a.id, a.title]));
  function lockInfo(assignmentId: string): { locked: boolean; missing: string[] } {
    const prereqs = prereqsByAssignment.get(assignmentId) ?? [];
    const missing = prereqs
      .filter((id) => !gradedIds.has(id))
      .map((id) => assignmentTitleById.get(id) ?? "another assignment");
    return { locked: missing.length > 0, missing };
  }

  const submissionByAssignment = new Map(submissions.map((s) => [s.assignment_id, s]));
  const assignmentsByModule = new Map<string, Assignment[]>();
  for (const a of assignments) {
    const list = assignmentsByModule.get(a.module_id) ?? [];
    list.push(a);
    assignmentsByModule.set(a.module_id, list);
  }
  const modulesByCourse = new Map<string, Module[]>();
  for (const m of modules) {
    const list = modulesByCourse.get(m.course_slug) ?? [];
    list.push(m);
    modulesByCourse.set(m.course_slug, list);
  }

  return (
    <section className="bg-navy-900 text-white">
      <div className="container-page py-16">
        <span className="mono text-electric-300">PORTAL · {session.user.email}</span>
        <h1 className="mt-3 text-3xl font-medium leading-tight sm:text-4xl">
          Welcome back.{" "}
          <span className="italic font-normal text-cyan-400">
            {enrollments.length ? "Here's your coursework." : "Here's your status."}
          </span>
        </h1>

        {enrollments.length > 0 && (
          <div className="mt-10 space-y-10">
            {enrollments.map((enrollment) => {
              const courseModules = modulesByCourse.get(enrollment.course_slug) ?? [];
              const courseAssignments = courseModules.flatMap(
                (m) => assignmentsByModule.get(m.id) ?? []
              );
              const submittedCount = courseAssignments.filter((a) =>
                submissionByAssignment.has(a.id)
              ).length;
              const gradedCount = courseAssignments.filter(
                (a) => submissionByAssignment.get(a.id)?.status === "graded"
              ).length;

              return (
                <article
                  key={enrollment.id}
                  className="rounded-lg border border-white/10 bg-white/[0.03] p-6"
                >
                  <header className="flex flex-wrap items-baseline justify-between gap-2">
                    <div>
                      <div className="mono text-[12px] text-white/55">
                        {enrollment.cohort_label ?? "Cohort TBC"} ·{" "}
                        <span className="uppercase">{enrollment.status}</span>
                      </div>
                      <h2 className="mt-1 text-2xl font-medium">
                        {courseTitle(enrollment.course_slug)}
                      </h2>
                    </div>
                    <div className="text-right text-[12px] text-white/55">
                      <div>
                        {submittedCount} / {courseAssignments.length} submitted
                      </div>
                      <div className="text-electric-300">
                        {gradedCount} / {courseAssignments.length} graded
                      </div>
                    </div>
                  </header>

                  {courseModules.length > 0 && courseAssignments.length > 0 && (
                    <div className="mt-6">
                      <CourseProgress
                        courseSlug={enrollment.course_slug}
                        modules={courseModules}
                        assignments={courseAssignments}
                        submissions={submissions}
                      />
                    </div>
                  )}

                  <div className="mt-6 space-y-5">
                    {courseModules.length === 0 ? (
                      <p className="text-sm text-white/55">
                        No modules published yet — your cohort lead will publish content shortly.
                      </p>
                    ) : (
                      courseModules.map((m) => {
                        const list = assignmentsByModule.get(m.id) ?? [];
                        return (
                          <div
                            key={m.id}
                            className="rounded-md border border-white/10 bg-white/[0.02] p-5"
                          >
                            <div className="flex items-baseline justify-between">
                              <h3 className="text-lg font-medium">{m.title}</h3>
                              <span className="mono text-[11px] text-white/40">
                                {list.length} {list.length === 1 ? "task" : "tasks"}
                              </span>
                            </div>
                            {m.description && (
                              <p className="mt-2 text-sm text-white/65">{m.description}</p>
                            )}
                            {list.length > 0 && (
                              <ul className="mt-4 grid gap-2">
                                {list.map((a) => {
                                  const sub = submissionByAssignment.get(a.id);
                                  const lock = lockInfo(a.id);
                                  const due = dueLabel(effectiveDueAt(a, enrollment));
                                  const dueTone =
                                    due.tone === "late"
                                      ? "text-red-300"
                                      : due.tone === "soon"
                                        ? "text-amber-300"
                                        : "text-white/55";
                                  const status = sub?.status ?? "not started";
                                  const statusTone =
                                    status === "graded"
                                      ? "bg-electric-500/20 text-electric-200"
                                      : status === "submitted"
                                        ? "bg-cyan-500/20 text-cyan-200"
                                        : status === "returned"
                                          ? "bg-amber-500/20 text-amber-200"
                                          : status === "draft"
                                            ? "bg-white/10 text-white/70"
                                            : "bg-white/5 text-white/50";
                                  return (
                                    <li
                                      key={a.id}
                                      className="rounded border border-white/5 bg-navy-900/40 px-4 py-3"
                                    >
                                      <div className="flex flex-wrap items-baseline justify-between gap-2">
                                        <div className="min-w-0">
                                          <div className="text-sm font-medium">{a.title}</div>
                                          <div className={`mono text-[11px] ${dueTone}`}>
                                            {due.text} · max {a.max_score}
                                            {sub?.score != null && (
                                              <span className="text-electric-300">
                                                {" "}
                                                · scored {sub.score}/{a.max_score}
                                              </span>
                                            )}
                                          </div>
                                        </div>
                                        <span
                                          className={`mono rounded-full px-2.5 py-0.5 text-[11px] capitalize ${statusTone}`}
                                        >
                                          {status}
                                        </span>
                                      </div>
                                      {a.description && (
                                        <p className="mt-2 text-[12px] text-white/55">
                                          {a.description}
                                        </p>
                                      )}
                                      {a.brief_storage_path && (
                                        <a
                                          href={`${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/assignment-briefs/${a.brief_storage_path}`}
                                          target="_blank"
                                          rel="noopener noreferrer"
                                          className="mono mt-2 inline-block text-[11px] text-electric-300 hover:underline"
                                        >
                                          📄 Open assignment brief
                                        </a>
                                      )}
                                      {sub?.status === "graded" &&
                                        (() => {
                                          const crits = criteriaByAssignment.get(a.id) ?? [];
                                          const scores = sub ? critScoresBySubmission.get(sub.id) : undefined;
                                          if (!crits.length || !scores) return null;
                                          return (
                                            <div className="mt-2 rounded border border-white/10 bg-white/[0.02] p-2 text-[12px]">
                                              <span className="mono text-[10px] uppercase text-white/45">
                                                Rubric breakdown
                                              </span>
                                              <ul className="mt-1 space-y-0.5">
                                                {crits.map((c) => {
                                                  const sc = scores.get(c.id);
                                                  return (
                                                    <li
                                                      key={c.id}
                                                      className="flex items-baseline justify-between gap-2"
                                                    >
                                                      <span className="text-white/70">{c.label}</span>
                                                      <span className="mono text-white/85">
                                                        {sc ? sc.points : 0}/{c.max_points}
                                                      </span>
                                                    </li>
                                                  );
                                                })}
                                              </ul>
                                            </div>
                                          );
                                        })()}
                                      {sub?.feedback && (
                                        <div className="mt-2 rounded border border-amber-500/20 bg-amber-500/5 p-2 text-[12px] text-amber-100">
                                          <span className="mono text-[10px] uppercase text-amber-300">
                                            Reviewer feedback
                                          </span>
                                          <p className="mt-1 whitespace-pre-line">{sub.feedback}</p>
                                        </div>
                                      )}
                                      <div className="mt-3 space-y-3">
                                        {lock.locked ? (
                                          <div className="rounded border border-white/10 bg-white/[0.02] px-3 py-2 text-[12px] text-white/55">
                                            🔒 Locked — complete{" "}
                                            <span className="text-white/80">
                                              {lock.missing.join(", ")}
                                            </span>{" "}
                                            first.
                                          </div>
                                        ) : (
                                          <div className="flex flex-wrap items-center justify-end gap-2">
                                            <AssignmentTutor
                                              assignmentId={a.id}
                                              assignmentTitle={a.title}
                                            />
                                            <SubmitWork
                                              assignmentId={a.id}
                                              currentStatus={status as
                                                | "draft"
                                                | "submitted"
                                                | "graded"
                                                | "returned"
                                                | "not started"}
                                            />
                                          </div>
                                        )}
                                      </div>
                                    </li>
                                  );
                                })}
                              </ul>
                            )}
                          </div>
                        );
                      })
                    )}
                  </div>
                </article>
              );
            })}
          </div>
        )}

        <div className="mt-12">
          <h2 className="mono text-white/60">YOUR APPLICATIONS</h2>
          {applications.length === 0 ? (
            <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] p-6">
              <p className="text-sm text-white/70">
                {enrollments.length
                  ? "No additional applications on file."
                  : "We don't have an application linked to this email yet."}
              </p>
              {enrollments.length === 0 && (
                <Link href="/apply" className="btn-primary mt-4">
                  Start an application →
                </Link>
              )}
            </div>
          ) : (
            <div className="mt-3 grid gap-3">
              {applications.map((a) => (
                <article
                  key={a.id}
                  className="rounded-lg border border-white/10 bg-white/[0.03] p-5"
                >
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-sm text-white/55">
                        {courseTitle(a.course_slug)} · {a.study_mode}
                      </div>
                      <div className="text-lg font-medium">{a.full_name}</div>
                    </div>
                    <span className="mono rounded-full bg-white/10 px-3 py-1 capitalize">
                      {a.status}
                    </span>
                  </div>
                  <div className="mt-4 grid gap-4 md:grid-cols-2">
                    <div className="text-[12px] text-white/55">
                      Reference <span className="font-mono">{a.id.slice(0, 8)}</span> · submitted{" "}
                      {new Date(a.created_at).toLocaleDateString()}
                    </div>
                    <DocumentUpload applicationId={a.id} userId={session.user.id} />
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <YourData />
      </div>
    </section>
  );
}
