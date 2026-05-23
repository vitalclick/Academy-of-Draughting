import { getSupabaseServer } from "@/lib/supabase/server";
import type { Assignment, CohortProgress, Module, Submission } from "@/lib/database.types";

type Props = {
  courseSlug: string;
  modules: Module[];
  assignments: Assignment[];
  submissions: Submission[];
};

export async function CourseProgress({
  courseSlug,
  modules,
  assignments,
  submissions,
}: Props) {
  const supabase = getSupabaseServer();
  // Cast: supabase-js SSR client doesn't always infer typed rpc args.
  const { data: rpcData } = await (
    supabase.rpc as unknown as (
      fn: "cohort_progress",
      args: { course: string }
    ) => Promise<{ data: CohortProgress | null; error: unknown }>
  )("cohort_progress", { course: courseSlug });
  const cohort = rpcData ?? null;

  const subBy = new Map(submissions.map((s) => [s.assignment_id, s]));
  const moduleStats = modules.map((m) => {
    const list = assignments.filter((a) => a.module_id === m.id);
    let earned = 0;
    let possible = 0;
    let graded = 0;
    for (const a of list) {
      possible += a.max_score;
      const sub = subBy.get(a.id);
      if (sub?.status === "graded") {
        earned += sub.score ?? 0;
        graded += 1;
      }
    }
    const pct = possible > 0 ? Math.round((earned / possible) * 100) : 0;
    return { module: m, total: list.length, graded, earned, possible, pct };
  });

  const overallEarned = moduleStats.reduce((sum, s) => sum + s.earned, 0);
  const overallPossible = moduleStats.reduce((sum, s) => sum + s.possible, 0);
  const overallPct = overallPossible > 0 ? Math.round((overallEarned / overallPossible) * 100) : 0;

  return (
    <div className="rounded-md border border-white/10 bg-white/[0.02] p-5">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <div className="mono text-[11px] uppercase text-electric-300">Progress</div>
          <div className="mt-1 text-2xl font-medium">
            {overallEarned}
            <span className="text-white/40"> / {overallPossible}</span>
            <span className="ml-2 text-base text-white/55">({overallPct}%)</span>
          </div>
        </div>
        {cohort && cohort.cohort_size > 1 && (
          <div className="text-right text-[11px] text-white/55">
            <div>
              cohort avg{" "}
              <span className="text-white/85">{cohort.cohort_avg_score}</span>
              {" · "}top <span className="text-white/85">{cohort.cohort_top_score}</span>
            </div>
            {cohort.my_rank != null && (
              <div className="mono text-electric-300">
                rank {cohort.my_rank} / {cohort.cohort_size}
              </div>
            )}
          </div>
        )}
      </div>
      <div className="mt-3 h-2 overflow-hidden rounded-full bg-white/10">
        <div
          className="h-full bg-electric-400"
          style={{ width: `${overallPct}%` }}
          aria-label={`Overall progress ${overallPct}%`}
        />
      </div>
      <div className="mt-4 grid gap-2 sm:grid-cols-2">
        {moduleStats.map((s) => (
          <div
            key={s.module.id}
            className="rounded border border-white/5 bg-navy-900/40 p-3"
          >
            <div className="flex items-baseline justify-between text-[12px]">
              <span className="text-white/85">{s.module.title}</span>
              <span className="mono text-white/55">
                {s.graded}/{s.total}
              </span>
            </div>
            <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
              <div
                className="h-full bg-cyan-400"
                style={{ width: `${s.pct}%` }}
                aria-label={`${s.module.title}: ${s.pct}%`}
              />
            </div>
            <div className="mono mt-1 text-[10px] text-white/40">
              {s.earned}/{s.possible} · {s.pct}%
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
