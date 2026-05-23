"use client";

import { useEffect } from "react";
import Link from "next/link";

export default function RootError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // eslint-disable-next-line no-console
    console.error("RootError boundary:", error);
  }, [error]);

  return (
    <section className="bg-paper">
      <div className="container-page max-w-2xl py-20">
        <span className="eyebrow text-red-700">SOMETHING WENT WRONG</span>
        <h1 className="mt-3 text-3xl font-medium tracking-tight">
          We hit an unexpected error.
        </h1>
        <p className="mt-3 text-ink-3">
          The dev team has been notified. Try again, or head back to the home
          page.
        </p>
        {error.digest && (
          <p className="mono mt-4 text-[11px] text-ink-4">
            Reference: <span className="font-mono">{error.digest}</span>
          </p>
        )}
        <div className="mt-6 flex gap-3">
          <button onClick={reset} className="btn-primary">
            Try again
          </button>
          <Link href="/" className="btn-ghost">
            Go home
          </Link>
        </div>
      </div>
    </section>
  );
}
