"use client";

import { useEffect } from "react";
import * as Sentry from "@sentry/nextjs";

export default function GlobalError({
  error,
}: {
  error: Error & { digest?: string };
}) {
  useEffect(() => {
    Sentry.captureException(error);
  }, [error]);

  return (
    <html lang="en">
      <body>
        <div style={{ fontFamily: "system-ui, sans-serif", padding: "4rem", textAlign: "center" }}>
          <h1 style={{ fontSize: "1.5rem", fontWeight: 500 }}>Something went wrong</h1>
          <p style={{ marginTop: "0.5rem", color: "#555" }}>
            An unexpected error occurred. Please reload the page.
          </p>
          {error.digest && (
            <p style={{ marginTop: "1rem", fontFamily: "monospace", fontSize: "0.8rem", color: "#999" }}>
              {error.digest}
            </p>
          )}
        </div>
      </body>
    </html>
  );
}
