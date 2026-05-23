"use client";

import { useState, useTransition } from "react";
import { linkApplicationToUser } from "@/app/admin/actions";

export function LinkUserForm({ applicationId, suggestedEmail }: { applicationId: string; suggestedEmail: string }) {
  const [email, setEmail] = useState(suggestedEmail);
  const [pending, startTransition] = useTransition();
  const [error, setError] = useState<string | null>(null);

  function submit() {
    setError(null);
    startTransition(async () => {
      try {
        await linkApplicationToUser(applicationId, email);
      } catch (err) {
        setError(err instanceof Error ? err.message : "Could not link");
      }
    });
  }

  return (
    <div className="mt-3 rounded-md border border-amber-200 bg-amber-50 p-3 text-[12px]">
      <div className="mono text-[10px] uppercase text-amber-700">Unlinked application</div>
      <p className="mt-1 text-amber-900">
        This applicant hasn't been linked to a user account. Auto-linking happens on signup;
        link manually here to override.
      </p>
      <div className="mt-2 flex gap-2">
        <input
          type="email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          className="flex-1 rounded border border-paper-3 bg-white px-2 py-1 text-ink-1 focus:border-electric-400 focus:outline-none"
          placeholder="user@example.com"
        />
        <button
          type="button"
          onClick={submit}
          disabled={pending}
          className="rounded bg-amber-600 px-3 py-1 text-white hover:bg-amber-500 disabled:opacity-50"
        >
          {pending ? "Linking…" : "Link"}
        </button>
      </div>
      {error && <p className="mt-2 text-red-700">{error}</p>}
    </div>
  );
}
