import Link from "next/link";
import { notFound, redirect } from "next/navigation";
import { getUserWithRole } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import {
  ModuleAdder,
  ModuleRow,
  AssignmentAdder,
  AssignmentRow,
} from "@/components/CurriculumEditor";
import { courses } from "@/data/courses";
import type { Assignment, Module, RubricCriterion } from "@/lib/database.types";

export const dynamic = "force-dynamic";

type Params = { params: { slug: string } };

export async function generateMetadata({ params }: Params) {
  const course = courses.find((c) => c.slug === params.slug);
  return { title: `Admin · Curriculum — ${course?.title ?? params.slug}` };
}

export default async function CurriculumDetail({ params }: Params) {
  const session = await getUserWithRole();
  if (!session || (session.role !== "admin" && session.role !== "faculty")) redirect("/");

  const course = courses.find((c) => c.slug === params.slug);
  if (!course) notFound();

  const supabase = getSupabaseAdmin();

  const { data: modulesData } = await supabase
    .from("modules")
    .select("id, course_slug, title, description, order_index, created_at")
    .eq("course_slug", params.slug)
    .is("deleted_at", null)
    .order("order_index", { ascending: true })
    .returns<Module[]>();
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
  const allAssignments = assignmentsData ?? [];
  const assignmentsByModule = new Map<string, Assignment[]>();
  for (const a of allAssignments) {
    const list = assignmentsByModule.get(a.module_id) ?? [];
    list.push(a);
    assignmentsByModule.set(a.module_id, list);
  }
  const assignmentIds = allAssignments.map((a) => a.id);

  // Rubric criteria + prerequisites for every assignment in this course.
  const { data: criteriaData } = assignmentIds.length
    ? await supabase
        .from("rubric_criteria")
        .select("id, assignment_id, label, description, max_points, order_index, created_at")
        .in("assignment_id", assignmentIds)
        .order("order_index", { ascending: true })
        .returns<RubricCriterion[]>()
    : { data: [] as RubricCriterion[] };
  const criteriaByAssignment = new Map<string, RubricCriterion[]>();
  for (const c of criteriaData ?? []) {
    const list = criteriaByAssignment.get(c.assignment_id) ?? [];
    list.push(c);
    criteriaByAssignment.set(c.assignment_id, list);
  }

  const { data: prereqData } = assignmentIds.length
    ? await supabase
        .from("assignment_prerequisites")
        .select("assignment_id, prerequisite_id")
        .in("assignment_id", assignmentIds)
        .returns<{ assignment_id: string; prerequisite_id: string }[]>()
    : { data: [] as { assignment_id: string; prerequisite_id: string }[] };
  const prereqsByAssignment = new Map<string, string[]>();
  for (const p of prereqData ?? []) {
    const list = prereqsByAssignment.get(p.assignment_id) ?? [];
    list.push(p.prerequisite_id);
    prereqsByAssignment.set(p.assignment_id, list);
  }

  // Sibling assignments (same course) usable as prerequisites.
  const siblings = allAssignments.map((a) => ({ id: a.id, title: a.title }));

  const nextModuleOrder = modules.length
    ? Math.max(...modules.map((m) => m.order_index)) + 1
    : 1;

  return (
    <section className="bg-paper">
      <div className="container-page py-12">
        <div className="flex items-baseline justify-between">
          <div>
            <Link href="/admin/curriculum" className="mono text-[12px] text-ink-3 hover:text-ink-1">
              ← Curriculum
            </Link>
            <h1 className="mt-2 text-3xl font-medium tracking-tight">{course.title}</h1>
            <p className="text-sm text-ink-3">
              {modules.length} {modules.length === 1 ? "module" : "modules"} ·{" "}
              {(assignmentsData ?? []).length} assignments
            </p>
          </div>
          <ModuleAdder courseSlug={params.slug} nextOrder={nextModuleOrder} />
        </div>

        {modules.length === 0 ? (
          <div className="mt-10 rounded-lg border border-paper-3 bg-white p-8 text-center text-ink-3">
            No modules published yet. Add the first one to get started.
          </div>
        ) : (
          <div className="mt-8 space-y-6">
            {modules.map((m) => {
              const list = assignmentsByModule.get(m.id) ?? [];
              const nextAssignmentOrder = list.length
                ? Math.max(...list.map((a) => a.order_index)) + 1
                : 1;
              return (
                <article key={m.id} className="rounded-lg border border-paper-3 bg-white p-6">
                  <ModuleRow module={m} />
                  <div className="mt-4 border-t border-paper-2 pt-4">
                    <div className="mono text-[11px] uppercase text-ink-4">Assignments</div>
                    {list.length === 0 ? (
                      <p className="mt-2 text-[12px] text-ink-3">None yet.</p>
                    ) : (
                      <ul className="mt-2 space-y-2">
                        {list.map((a) => (
                          <AssignmentRow
                            key={a.id}
                            assignment={a}
                            criteria={criteriaByAssignment.get(a.id) ?? []}
                            prerequisiteIds={prereqsByAssignment.get(a.id) ?? []}
                            siblings={siblings.filter((s) => s.id !== a.id)}
                          />
                        ))}
                      </ul>
                    )}
                    <div className="mt-3">
                      <AssignmentAdder moduleId={m.id} nextOrder={nextAssignmentOrder} />
                    </div>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </div>
    </section>
  );
}
