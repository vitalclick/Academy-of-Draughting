"use client";

import { useState, useTransition } from "react";
import { manualEnroll, updateEnrollmentStatus } from "@/app/admin/actions";

export function EnrollForm({ courseSlug, defaultCohort }: { courseSlug: string; defaultCohort?: string | null }) {
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState("");
  const [cohort, setCohort] = useState(defaultCohort ?? "");
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [ok, setOk] = useState<string | null>(null);

  function submit() {
    setError(null);
    setOk(null);
    startTransition(async () => {
      try {
        await manualEnroll({ email, courseSlug, cohortLabel: cohort });
        setOk(`${email} enrolled.`);
        setEmail("");
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not enroll");
      }
    });
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="btn-primary text-sm"
      >
        + Enroll student
      </button>
    );
  }

  return (
    <div className="w-full max-w-md rounded-lg border border-paper-3 bg-white p-4 text-[12px]">
      <div className="mono text-[10px] uppercase text-ink-4">Enroll a student in this cohort</div>
      <div className="mt-2 grid gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="student@example.com"
          className="rounded border border-paper-3 bg-white px-2 py-1.5 text-ink-1 focus:border-electric-400 focus:outline-none"
        />
        <input
          type="text"
          value={cohort}
          onChange={(e) => setCohort(e.target.value)}
          placeholder="Cohort label (optional, e.g. MDDOP 2026 Intake)"
          className="rounded border border-paper-3 bg-white px-2 py-1.5 text-ink-1 focus:border-electric-400 focus:outline-none"
        />
      </div>
      {error && <p className="mt-2 text-red-700">{error}</p>}
      {ok && <p className="mt-2 text-electric-700">{ok}</p>}
      <div className="mt-3 flex justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
            setOk(null);
          }}
          className="rounded px-3 py-1 text-ink-3 hover:text-ink-1"
        >
          Close
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={pending || !email.trim()}
          className="rounded bg-electric-600 px-3 py-1 text-white hover:bg-electric-500 disabled:opacity-50"
        >
          {pending ? "Enrolling…" : "Enroll & email"}
        </button>
      </div>
    </div>
  );
}

export function EnrollmentStatusSelect({
  enrollmentId,
  current,
}: {
  enrollmentId: string;
  current: "active" | "completed" | "withdrawn";
}) {
  const [value, setValue] = useState(current);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function change(next: "active" | "completed" | "withdrawn") {
    if (next === value) return;
    setValue(next);
    setError(null);
    startTransition(async () => {
      try {
        await updateEnrollmentStatus(enrollmentId, next);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Failed");
        setValue(current);
      }
    });
  }

  return (
    <span className="inline-flex items-center gap-1">
      <select
        value={value}
        onChange={(e) => change(e.target.value as "active" | "completed" | "withdrawn")}
        disabled={pending}
        className="mono rounded border border-paper-3 bg-white px-1.5 py-0.5 text-[10px] uppercase text-ink-2"
      >
        <option value="active">Active</option>
        <option value="completed">Completed</option>
        <option value="withdrawn">Withdrawn</option>
      </select>
      {error && <span className="text-[10px] text-red-600">{error}</span>}
    </span>
  );
}
