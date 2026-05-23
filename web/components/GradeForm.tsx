"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

type Criterion = { id: string; label: string; max_points: number };

type Props = {
  submissionId: string;
  initialScore: number | null;
  initialFeedback: string | null;
  initialStatus: "draft" | "submitted" | "graded" | "returned";
  maxScore: number;
  // Late-penalty context (all optional — penalty suggestion is hidden when
  // any are missing).
  dueAt?: string | null;
  submittedAt?: string | null;
  latePenaltyPctPerDay?: number | null;
  lateGraceDays?: number | null;
  // Rubric context (optional — when present, grading uses per-criterion points).
  criteria?: Criterion[];
  initialCriterionScores?: Record<string, number>;
};

function latePenaltyInfo(
  due: string | null | undefined,
  submitted: string | null | undefined,
  pct: number | null | undefined,
  grace: number | null | undefined
): { daysLate: number; penaltyPct: number; multiplier: number } | null {
  if (!due || !submitted || !pct || pct <= 0) return null;
  const days = Math.floor((+new Date(submitted) - +new Date(due)) / 86_400_000);
  const chargeable = Math.max(0, days - (grace ?? 0));
  if (chargeable <= 0) return null;
  const penaltyPct = Math.min(100, chargeable * pct);
  return { daysLate: days, penaltyPct, multiplier: 1 - penaltyPct / 100 };
}

export function GradeForm({
  submissionId,
  initialScore,
  initialFeedback,
  initialStatus,
  maxScore,
  dueAt,
  submittedAt,
  latePenaltyPctPerDay,
  lateGraceDays,
  criteria = [],
  initialCriterionScores = {},
}: Props) {
  const late = latePenaltyInfo(dueAt, submittedAt, latePenaltyPctPerDay, lateGraceDays);
  const router = useRouter();
  const usesRubric = criteria.length > 0;
  const [score, setScore] = useState<string>(initialScore?.toString() ?? "");
  const [critScores, setCritScores] = useState<Record<string, string>>(() =>
    Object.fromEntries(
      criteria.map((c) => [c.id, (initialCriterionScores[c.id] ?? "").toString()])
    )
  );
  const [feedback, setFeedback] = useState(initialFeedback ?? "");
  const [pending, setPending] = useState<"graded" | "returned" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedStatus, setSavedStatus] = useState(initialStatus);

  const rubricTotal = criteria.reduce((sum, c) => sum + (Number(critScores[c.id]) || 0), 0);
  const rubricMax = criteria.reduce((sum, c) => sum + c.max_points, 0);

  async function submit(next: "graded" | "returned") {
    setError(null);
    setPending(next);
    try {
      let payload: Record<string, unknown> = {
        submissionId,
        feedback: feedback.trim() || null,
        status: next,
      };
      if (usesRubric) {
        for (const c of criteria) {
          const v = Number(critScores[c.id]);
          if (critScores[c.id]?.trim() && (Number.isNaN(v) || v < 0 || v > c.max_points)) {
            throw new Error(`${c.label}: 0–${c.max_points}`);
          }
        }
        payload.score = rubricTotal;
        payload.criterionScores = criteria.map((c) => ({
          criterionId: c.id,
          points: Number(critScores[c.id]) || 0,
        }));
      } else {
        const parsedScore = score.trim() === "" ? null : Number(score);
        if (parsedScore != null && (Number.isNaN(parsedScore) || parsedScore < 0 || parsedScore > maxScore)) {
          throw new Error(`Score must be 0–${maxScore}`);
        }
        payload.score = parsedScore;
      }
      const res = await fetch("/api/admin/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(payload),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Failed");
      setSavedStatus(next);
      router.refresh();
    } catch (err) {
      setError(err instanceof Error ? err.message : "Failed");
    } finally {
      setPending(null);
    }
  }

  const disabled = pending !== null;

  return (
    <div className="mt-2 rounded border border-paper-3 bg-paper-1 p-3 text-[12px]">
      {usesRubric && (
        <div className="mb-2 space-y-1">
          <div className="mono text-[10px] uppercase text-ink-4">
            Rubric · total {rubricTotal} / {rubricMax}
          </div>
          {criteria.map((c) => (
            <div key={c.id} className="flex items-center justify-between gap-2">
              <span className="text-ink-2">{c.label}</span>
              <span className="flex items-center gap-1">
                <input
                  type="number"
                  min={0}
                  max={c.max_points}
                  value={critScores[c.id] ?? ""}
                  onChange={(e) =>
                    setCritScores((s) => ({ ...s, [c.id]: e.target.value }))
                  }
                  className="w-16 rounded border border-paper-3 bg-white px-2 py-1 text-ink-1 focus:border-electric-400 focus:outline-none"
                  disabled={disabled}
                />
                <span className="text-ink-4">/ {c.max_points}</span>
              </span>
            </div>
          ))}
        </div>
      )}
      <div className="flex flex-wrap items-end gap-2">
        {!usesRubric && (
          <label className="block">
            <span className="mono text-[10px] text-ink-4">SCORE / {maxScore}</span>
            <input
              type="number"
              min={0}
              max={maxScore}
              value={score}
              onChange={(e) => setScore(e.target.value)}
              className="mt-1 w-20 rounded border border-paper-3 bg-white px-2 py-1 text-ink-1 focus:border-electric-400 focus:outline-none"
              disabled={disabled}
            />
          </label>
        )}
        <label className="block flex-1 min-w-[200px]">
          <span className="mono text-[10px] text-ink-4">FEEDBACK</span>
          <textarea
            rows={2}
            value={feedback}
            onChange={(e) => setFeedback(e.target.value)}
            className="mt-1 w-full resize-y rounded border border-paper-3 bg-white px-2 py-1 text-ink-1 focus:border-electric-400 focus:outline-none"
            disabled={disabled}
          />
        </label>
      </div>
      <div className="mt-2 flex items-center justify-between gap-2">
        <span className="mono text-[10px] uppercase text-ink-4">
          {savedStatus === "graded"
            ? "✓ Graded"
            : savedStatus === "returned"
              ? "↩ Returned for revision"
              : savedStatus}
        </span>
        <div className="flex gap-2">
          <button
            type="button"
            onClick={() => submit("returned")}
            disabled={disabled}
            className="rounded border border-amber-300 px-3 py-1 text-amber-700 hover:bg-amber-50 disabled:opacity-50"
          >
            {pending === "returned" ? "Saving…" : "Return"}
          </button>
          <button
            type="button"
            onClick={() => submit("graded")}
            disabled={disabled}
            className="rounded bg-electric-600 px-3 py-1 text-white hover:bg-electric-500 disabled:opacity-50"
          >
            {pending === "graded" ? "Saving…" : "Mark graded"}
          </button>
        </div>
      </div>
      {late && !usesRubric && (
        <div className="mt-2 flex items-center justify-between rounded border border-amber-300 bg-amber-50 px-2 py-1.5 text-[11px] text-amber-800">
          <span>
            {late.daysLate}d late · suggested penalty −{late.penaltyPct.toFixed(0)}%
          </span>
          <button
            type="button"
            onClick={() => {
              const raw = score.trim() === "" ? maxScore : Number(score);
              if (Number.isNaN(raw)) return;
              const adjusted = Math.max(0, Math.round(raw * late.multiplier));
              setScore(String(adjusted));
            }}
            className="mono rounded border border-amber-400 px-2 py-0.5 text-[10px] text-amber-800 hover:bg-amber-100"
          >
            Apply
          </button>
        </div>
      )}
      {error && <p className="mt-2 text-red-600">{error}</p>}
    </div>
  );
}
