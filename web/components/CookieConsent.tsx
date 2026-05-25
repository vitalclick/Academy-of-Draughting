"use client";

import { useEffect, useState } from "react";

const STORAGE_KEY = "aod-cookie-consent-v1";

export function CookieConsent() {
  const [show, setShow] = useState(false);

  useEffect(() => {
    try {
      const stored = window.localStorage.getItem(STORAGE_KEY);
      if (!stored) setShow(true);
    } catch {
      // localStorage unavailable (private mode, etc) — assume implicit dismissal.
    }
  }, []);

  function record(choice: "accepted" | "necessary-only") {
    try {
      window.localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ choice, at: new Date().toISOString() })
      );
    } catch {
      // Best-effort; ignore.
    }
    setShow(false);
  }

  if (!show) return null;

  return (
    <div
      role="dialog"
      aria-label="Cookie preferences"
      className="fixed inset-x-0 bottom-0 z-50 border-t border-paper-3 bg-white/95 shadow-[0_-8px_24px_-12px_rgba(0,0,0,0.12)] backdrop-blur"
    >
      <div className="container-page flex flex-col gap-3 py-4 sm:flex-row sm:items-center sm:justify-between">
        <p className="max-w-2xl text-[13px] text-ink-2">
          We use a single strictly-necessary cookie to keep you signed in. We
          don&rsquo;t set marketing or third-party analytics cookies. See our{" "}
          <a href="/privacy" className="text-electric-700 underline">
            Privacy Policy
          </a>{" "}
          for detail.
        </p>
        <div className="flex shrink-0 gap-2">
          <button
            type="button"
            onClick={() => record("necessary-only")}
            className="rounded-md border border-paper-3 px-3 py-1.5 text-[13px] text-ink-2 hover:bg-paper"
          >
            Necessary only
          </button>
          <button
            type="button"
            onClick={() => record("accepted")}
            className="btn-primary text-[13px]"
          >
            Got it
          </button>
        </div>
      </div>
    </div>
  );
}
