import Link from "next/link";
import { redirect } from "next/navigation";
import { getSupabaseServer, getUserWithRole } from "@/lib/supabase/server";
import { DocumentUpload } from "@/components/DocumentUpload";

export const metadata = { title: "Student Portal — Academy of Advanced Draughting" };
export const dynamic = "force-dynamic";

export default async function PortalPage() {
  const session = await getUserWithRole();
  if (!session) redirect("/login?next=/portal");

  const supabase = getSupabaseServer();
  const { data: applications } = await supabase
    .from("applications")
    .select("id, full_name, course_slug, study_mode, status, created_at")
    .eq("user_id", session.user.id)
    .order("created_at", { ascending: false });

  return (
    <section className="bg-navy-900 text-white">
      <div className="container-page py-16">
        <span className="mono text-electric-300">PORTAL · {session.user.email}</span>
        <h1 className="mt-3 text-3xl font-medium leading-tight sm:text-4xl">
          Welcome back.{" "}
          <span className="italic font-normal text-cyan-400">Here's your status.</span>
        </h1>

        <div className="mt-10">
          <h2 className="mono text-white/60">YOUR APPLICATIONS</h2>
          {!applications || applications.length === 0 ? (
            <div className="mt-3 rounded-lg border border-white/10 bg-white/[0.03] p-6">
              <p className="text-sm text-white/70">
                We don't have an application linked to this email yet.
              </p>
              <Link href="/apply" className="btn-primary mt-4">Start an application →</Link>
            </div>
          ) : (
            <div className="mt-3 grid gap-3">
              {applications.map((a) => (
                <article key={a.id} className="rounded-lg border border-white/10 bg-white/[0.03] p-5">
                  <div className="flex items-baseline justify-between">
                    <div>
                      <div className="text-sm text-white/55">{a.course_slug} · {a.study_mode}</div>
                      <div className="text-lg font-medium">{a.full_name}</div>
                    </div>
                    <span className="mono rounded-full bg-white/10 px-3 py-1 capitalize">{a.status}</span>
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

        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["AI Tutor", "Stuck on a constraint? Ask Claude — context-aware on your active drawing."],
            ["Progress", "Portfolio depth, software coverage, employer-readiness score."],
            ["Schedule", "Lectures, studio sessions, peer-review slots."],
          ].map(([t, d]) => (
            <div key={t} className="card-dark">
              <h3 className="text-lg font-medium">{t}</h3>
              <p className="mt-2 text-sm text-white/65">{d}</p>
              <p className="mt-3 text-[11px] uppercase tracking-wide text-white/40">Coming on enrollment</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
