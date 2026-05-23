"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";

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
}: Props) {
  const late = latePenaltyInfo(dueAt, submittedAt, latePenaltyPctPerDay, lateGraceDays);
  const router = useRouter();
  const [score, setScore] = useState<string>(initialScore?.toString() ?? "");
  const [feedback, setFeedback] = useState(initialFeedback ?? "");
  const [pending, setPending] = useState<"graded" | "returned" | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [savedStatus, setSavedStatus] = useState(initialStatus);

  async function submit(next: "graded" | "returned") {
    setError(null);
    setPending(next);
    try {
      const parsedScore = score.trim() === "" ? null : Number(score);
      if (parsedScore != null && (Number.isNaN(parsedScore) || parsedScore < 0 || parsedScore > maxScore)) {
        throw new Error(`Score must be 0–${maxScore}`);
      }
      const res = await fetch("/api/admin/grade", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          submissionId,
          score: parsedScore,
          feedback: feedback.trim() || null,
          status: next,
        }),
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
      <div className="flex flex-wrap items-end gap-2">
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
      {late && (
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
