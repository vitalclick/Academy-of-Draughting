'use client';

import { useEffect } from 'react';

/**
 * Catastrophic error boundary — fires when even the root layout throws.
 * Must render its own <html>/<body> because the root layout is bypassed.
 */
export default function GlobalError({
  error,
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  useEffect(() => {
    fetch('/api/events', {
      method: 'POST',
      headers: { 'Content-Type': 'application/json' },
      body: JSON.stringify({
        name: 'global_error',
        payload: { digest: error.digest, message: error.message },
      }),
      keepalive: true,
    }).catch(() => {});
  }, [error]);

  return (
    <html lang="en">
      <body style={{ fontFamily: 'system-ui, sans-serif', padding: 48, color: '#050F25' }}>
        <h1 style={{ fontSize: 24, fontWeight: 500, marginBottom: 16 }}>
          The site is having a moment.
        </h1>
        <p style={{ fontSize: 15, lineHeight: 1.5, maxWidth: 520, color: '#4A5876' }}>
          A core part of the page failed to load. Refresh, or come back in a minute. If this
          persists, email enroll@academydraughting.com.
        </p>
        <button
          type="button"
          onClick={reset}
          style={{
            marginTop: 24,
            background: '#2D6FF7',
            color: '#fff',
            border: 0,
            padding: '12px 18px',
            borderRadius: 6,
            cursor: 'pointer',
          }}
        >
          Try again
        </button>
      </body>
    </html>
  );
}
