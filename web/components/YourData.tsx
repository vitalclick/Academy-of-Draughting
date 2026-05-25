"use client";

import { useState } from "react";

export function YourData() {
  const [reason, setReason] = useState("");
  const [confirm, setConfirm] = useState(false);
  const [pending, setPending] = useState(false);
  const [msg, setMsg] = useState<{ tone: "ok" | "err"; text: string } | null>(null);

  async function requestDeletion() {
    setPending(true);
    setMsg(null);
    try {
      const res = await fetch("/api/me/delete-request", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ reason: reason.trim() || undefined }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setMsg({ tone: "ok", text: data.message });
      setReason("");
      setConfirm(false);
    } catch (err) {
      setMsg({ tone: "err", text: err instanceof Error ? err.message : "Request failed" });
    } finally {
      setPending(false);
    }
  }

  return (
    <div className="mt-12 rounded-lg border border-white/10 bg-white/[0.03] p-6">
      <div className="mono text-[11px] uppercase text-white/55">YOUR DATA · POPIA</div>
      <p className="mt-2 text-sm text-white/70">
        You can download every record we hold about you, or request that your account
        and associated data be deleted. Deletion requests are processed within 30 days.
      </p>
      <div className="mt-4 flex flex-wrap gap-3">
        <a
          href="/api/me/export"
          className="mono rounded-full border border-white/15 px-4 py-2 text-[12px] text-white hover:bg-white/10"
        >
          Download my data (JSON)
        </a>
        {!confirm ? (
          <button
            type="button"
            onClick={() => setConfirm(true)}
            className="mono rounded-full border border-red-400/30 px-4 py-2 text-[12px] text-red-300 hover:bg-red-400/10"
          >
            Request account deletion…
          </button>
        ) : (
          <div className="w-full rounded border border-red-400/30 bg-red-500/5 p-4">
            <p className="text-sm text-red-100">
              This will queue your account for deletion. All applications, enrollments,
              submissions, and graded work will be removed within 30 days. This action
              cannot be undone once processed.
            </p>
            <textarea
              value={reason}
              onChange={(e) => setReason(e.target.value)}
              placeholder="Optional: tell us why (helps us improve)"
              rows={3}
              className="mt-3 w-full resize-y rounded border border-white/10 bg-white/[0.04] p-2 text-[13px] text-white placeholder:text-white/30 focus:border-red-300 focus:outline-none"
            />
            <div className="mt-3 flex justify-end gap-2">
              <button
                type="button"
                onClick={() => {
                  setConfirm(false);
                  setMsg(null);
                }}
                disabled={pending}
                className="rounded px-3 py-1 text-white/70 hover:text-white"
              >
                Cancel
              </button>
              <button
                type="button"
                onClick={requestDeletion}
                disabled={pending}
                className="rounded-full bg-red-500 px-4 py-1.5 text-[13px] text-white hover:bg-red-400 disabled:opacity-50"
              >
                {pending ? "Submitting…" : "Confirm deletion request"}
              </button>
            </div>
          </div>
        )}
      </div>
      {msg && (
        <p
          className={`mt-3 text-[12px] ${msg.tone === "ok" ? "text-electric-300" : "text-red-300"}`}
        >
          {msg.text}
        </p>
      )}
    </div>
  );
}
