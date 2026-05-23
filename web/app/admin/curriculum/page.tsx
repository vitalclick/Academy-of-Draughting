import Link from "next/link";
import { redirect } from "next/navigation";
import { getUserWithRole } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { courses } from "@/data/courses";

export const metadata = { title: "Admin · Curriculum" };
export const dynamic = "force-dynamic";

export default async function CurriculumIndex() {
  const session = await getUserWithRole();
  if (!session || (session.role !== "admin" && session.role !== "faculty")) redirect("/");

  const supabase = getSupabaseAdmin();
  const { data: modulesData } = await supabase
    .from("modules")
    .select("id, course_slug")
    .is("deleted_at", null)
    .returns<{ id: string; course_slug: string }[]>();
  const { data: assignmentsData } = await supabase
    .from("assignments")
    .select("id, module_id, modules!inner(course_slug)")
    .is("deleted_at", null)
    .returns<{ id: string; module_id: string; modules: { course_slug: string } }[]>();

  const moduleCount = new Map<string, number>();
  for (const m of modulesData ?? []) {
    moduleCount.set(m.course_slug, (moduleCount.get(m.course_slug) ?? 0) + 1);
  }
  const assignmentCount = new Map<string, number>();
  for (const a of assignmentsData ?? []) {
    const slug = a.modules.course_slug;
    assignmentCount.set(slug, (assignmentCount.get(slug) ?? 0) + 1);
  }

  return (
    <section className="bg-paper">
      <div className="container-page py-12">
        <div className="flex items-baseline justify-between">
          <div>
            <span className="eyebrow">ADMIN · CURRICULUM</span>
            <h1 className="mt-2 text-3xl font-medium tracking-tight">Curriculum</h1>
            <p className="text-sm text-ink-3">
              Pick a course to publish modules and assignments.
            </p>
          </div>
          <Link href="/admin" className="mono text-[12px] text-ink-3 hover:text-ink-1">
            ← Admin home
          </Link>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {courses.map((c) => (
            <Link
              key={c.slug}
              href={`/admin/curriculum/${c.slug}`}
              className="block rounded-lg border border-paper-3 bg-white p-6 transition hover:border-electric-300 hover:shadow-sm"
            >
              <div className="mono text-[11px] text-ink-4">{c.code}</div>
              <h2 className="mt-2 text-lg font-medium">{c.title}</h2>
              <div className="mt-4 flex items-baseline gap-4 text-sm">
                <div>
                  <div className="text-2xl font-medium text-electric-600">
                    {moduleCount.get(c.slug) ?? 0}
                  </div>
                  <div className="mono text-[11px] text-ink-4">MODULES</div>
                </div>
                <div>
                  <div className="text-2xl font-medium">
                    {assignmentCount.get(c.slug) ?? 0}
                  </div>
                  <div className="mono text-[11px] text-ink-4">ASSIGNMENTS</div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </div>
    </section>
  );
}
