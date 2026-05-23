import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServer, getUserWithRole } from "@/lib/supabase/server";
import { DocumentUpload } from "@/components/DocumentUpload";
import { SubmitWork } from "@/components/SubmitWork";
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

export default async function PortalPage() {
  const session = await getUserWithRole();
  if (!session) redirect("/login?next=/portal");

  const supabase = getSupabaseServer();

  const [{ data: enrollmentsData }, { data: applicationsData }, { data: submissionsData }] =
    await Promise.all([
      supabase
        .from("enrollments")
        .select("id, user_id, course_slug, cohort_label, status, enrolled_at")
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
        .select("id, assignment_id, user_id, status, score, feedback, submitted_at, graded_at, storage_path, notes, created_at, updated_at")
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
        .order("order_index", { ascending: true })
        .returns<Module[]>()
    : { data: [] as Module[] };
  const modules = modulesData ?? [];

  const moduleIds = modules.map((m) => m.id);
  const { data: assignmentsData } = moduleIds.length
    ? await supabase
        .from("assignments")
        .select("id, module_id, title, description, due_at, max_score, order_index, created_at")
        .in("module_id", moduleIds)
        .order("order_index", { ascending: true })
        .returns<Assignment[]>()
    : { data: [] as Assignment[] };
  const assignments = assignmentsData ?? [];

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
                                  const due = dueLabel(a.due_at);
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
                                      {sub?.feedback && (
                                        <div className="mt-2 rounded border border-amber-500/20 bg-amber-500/5 p-2 text-[12px] text-amber-100">
                                          <span className="mono text-[10px] uppercase text-amber-300">
                                            Reviewer feedback
                                          </span>
                                          <p className="mt-1 whitespace-pre-line">{sub.feedback}</p>
                                        </div>
                                      )}
                                      <div className="mt-3 flex justify-end">
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
      </div>
    </section>
  );
}
