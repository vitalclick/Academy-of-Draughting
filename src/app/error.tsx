'use client';

import { useEffect } from 'react';
import Link from 'next/link';

export default function GlobalErrorBoundary({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    // Best-effort client-side capture; the server has already logged the
    // original. Posting to /api/events tags the visitor so we can correlate.
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'client_error',
        payload: { digest: error.digest, message: error.message },
      }),
      keepalive: true,
    }).catch(() => {});
  }, [error]);

  return (
    <main style={{ minHeight: '60vh', display: 'flex', alignItems: 'center', justifyContent: 'center', padding: 48 }}>
      <div style={{ maxWidth: 560, textAlign: 'center' }}>
        <span className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>
          ERROR · {error.digest ?? 'UNKNOWN'}
        </span>
        <h1 className="t-h2" style={{ margin: '12px 0 16px' }}>
          Something broke on our side.
        </h1>
        <p className="t-body" style={{ marginBottom: 24 }}>
          We&apos;ve logged this. Try again, or hop back to the home page. If this keeps happening,
          reach out to admissions and we&apos;ll sort it.
        </p>
        <div style={{ display: 'inline-flex', gap: 12, flexWrap: 'wrap' }}>
          <button type="button" className="btn btn-primary" onClick={reset}>
            Try again
          </button>
          <Link href="/" className="btn btn-ghost-light">
            Back to home
          </Link>
          <Link href="/contact" className="btn btn-ghost-light">
            Contact admissions
          </Link>
        </div>
      </div>
    </main>
  );
}
