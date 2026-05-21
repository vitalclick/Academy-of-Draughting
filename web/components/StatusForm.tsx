"use client";

import { useState, useTransition } from "react";
import { setApplicationStatus } from "@/app/admin/actions";

const OPTIONS = ["received", "reviewing", "accepted", "rejected", "withdrawn"] as const;

export function StatusForm({ id, current }: { id: string; current: string }) {
  const [value, setValue] = useState(current);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);
  const [saved, setSaved] = useState(false);

  function submit() {
    setError(null);
    setSaved(false);
    startTransition(async () => {
      try {
        await setApplicationStatus(id, value);
        setSaved(true);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not update");
      }
    });
  }

  return (
    <div className="mt-4 space-y-3">
      <select
        value={value}
        onChange={(e) => setValue(e.target.value)}
        className="w-full rounded-md border border-paper-3 px-3 py-2.5 text-sm capitalize"
      >
        {OPTIONS.map((o) => (
          <option key={o} value={o}>{o}</option>
        ))}
      </select>
      <button onClick={submit} disabled={pending || value === current} className="btn-primary w-full justify-center disabled:opacity-50">
        {pending ? "Saving…" : "Update status"}
      </button>
      {error && <p className="text-sm text-red-600">{error}</p>}
      {saved && <p className="text-sm text-electric-700">Saved.</p>}
    </div>
  );
}
