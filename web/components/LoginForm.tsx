"use client";

import { useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

export function LoginForm({ next, initialSent }: { next?: string; initialSent?: boolean }) {
  const [email, setEmail] = useState("");
  const [sent, setSent] = useState(Boolean(initialSent));
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function onSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!email.trim() || busy) return;
    setBusy(true);
    setError(null);
    try {
      const supabase = getSupabaseBrowser();
      const origin = window.location.origin;
      const params = new URLSearchParams();
      if (next) params.set("next", next);
      const redirectTo = `${origin}/auth/callback${params.toString() ? `?${params}` : ""}`;
      const { error: err } = await supabase.auth.signInWithOtp({
        email: email.trim(),
        options: { emailRedirectTo: redirectTo },
      });
      if (err) throw err;
      setSent(true);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Could not send magic link");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="mt-6 rounded-md border border-electric-200 bg-electric-100 p-4 text-sm text-ink-2">
        Check your inbox. We sent a sign-in link to <strong>{email || "your email"}</strong>.
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-3">
      <input
        type="email"
        required
        value={email}
        onChange={(e) => setEmail(e.target.value)}
        placeholder="you@example.com"
        className="w-full rounded-md border border-paper-3 px-3 py-2.5 text-sm outline-none focus:border-electric-500"
      />
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={busy} className="btn-primary w-full justify-center disabled:opacity-50">
        {busy ? "Sending…" : "Send magic link"}
      </button>
    </form>
  );
}
