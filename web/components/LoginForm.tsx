"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { getSupabaseBrowser } from "@/lib/supabase/client";

type Mode = "magic" | "password";

export function LoginForm({ next, initialSent }: { next?: string; initialSent?: boolean }) {
  const router = useRouter();
  const [mode, setMode] = useState<Mode>("magic");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
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
      if (mode === "magic") {
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
      } else {
        const { error: err } = await supabase.auth.signInWithPassword({
          email: email.trim(),
          password,
        });
        if (err) throw err;
        router.push(next || "/portal");
        router.refresh();
      }
    } catch (err) {
      setError(err instanceof Error ? err.message : "Sign-in failed");
    } finally {
      setBusy(false);
    }
  }

  if (sent) {
    return (
      <div className="mt-6 rounded-md border border-electric-200 bg-electric-100 p-4 text-sm text-ink-2">
        Check your inbox. We sent a sign-in link to <strong>{email || "your email"}</strong>.
        <div className="mt-3">
          <button
            type="button"
            onClick={() => {
              setSent(false);
              setMode("password");
            }}
            className="text-electric-700 underline hover:text-electric-600"
          >
            Use a password instead
          </button>
        </div>
      </div>
    );
  }

  return (
    <form onSubmit={onSubmit} className="mt-6 space-y-3">
      <label className="block">
        <span className="sr-only">Email</span>
        <input
          type="email"
          required
          autoComplete="email"
          aria-label="Email"
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@example.com"
          className="w-full rounded-md border border-paper-3 px-3 py-2.5 text-sm outline-none focus:border-electric-500"
        />
      </label>
      {mode === "password" && (
        <label className="block">
          <span className="sr-only">Password</span>
          <input
            type="password"
            required
            autoComplete="current-password"
            aria-label="Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            placeholder="Password"
            className="w-full rounded-md border border-paper-3 px-3 py-2.5 text-sm outline-none focus:border-electric-500"
          />
        </label>
      )}
      {error && <p className="text-sm text-red-600">{error}</p>}
      <button type="submit" disabled={busy} className="btn-primary w-full justify-center disabled:opacity-50">
        {busy ? "Signing in…" : mode === "magic" ? "Send magic link" : "Sign in"}
      </button>
      <div className="text-center text-[12px] text-ink-3">
        <button
          type="button"
          onClick={() => {
            setMode((m) => (m === "magic" ? "password" : "magic"));
            setError(null);
          }}
          className="text-electric-700 hover:underline"
        >
          {mode === "magic" ? "Use a password instead" : "Use a magic link instead"}
        </button>
      </div>
    </form>
  );
}
