"use client";

import { useRef, useState } from "react";

type Kind = "id" | "qualification" | "portfolio";

const ALLOWED = ".pdf,image/png,image/jpeg,image/webp";

export function ApplyDocumentSlot({
  applicationId,
  uploadToken,
  kind,
  label,
  required,
  hint,
}: {
  applicationId: string;
  uploadToken: string;
  kind: Kind;
  label: string;
  required?: boolean;
  hint?: string;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "done" | "error">("idle");
  const [filename, setFilename] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function handle(file: File) {
    setError(null);
    setStatus("uploading");
    try {
      const res = await fetch("/api/apply-upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          uploadToken,
          filename: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
          kind,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Upload failed");

      const put = await fetch(data.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type, "x-upsert": "false" },
        body: file,
      });
      if (!put.ok) throw new Error(`Upload failed (${put.status})`);
      // Anonymous apply uploads stay scan_status='pending'; an authenticated
      // rescan (or background worker) processes them later.
      setFilename(file.name);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  }

  return (
    <div className="rounded-md border border-paper-3 bg-white p-3">
      <div className="flex flex-wrap items-baseline justify-between gap-2">
        <div>
          <div className="text-sm font-medium text-ink-1">
            {label}{" "}
            {required && (
              <span className="mono text-[10px] uppercase text-red-600">required</span>
            )}
          </div>
          {hint && <div className="mono text-[11px] text-ink-4">{hint}</div>}
        </div>
        <div className="flex items-center gap-2 text-[12px]">
          {status === "done" && filename && (
            <span className="text-electric-700">✓ {filename}</span>
          )}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={status === "uploading"}
            className="rounded-md border border-paper-3 px-3 py-1 text-[12px] text-ink-2 hover:border-electric-400 hover:text-electric-700 disabled:opacity-50"
          >
            {status === "uploading" ? "Uploading…" : status === "done" ? "Replace" : "Upload"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept={ALLOWED}
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void handle(f);
              e.target.value = "";
            }}
          />
        </div>
      </div>
      {error && <p className="mt-2 text-[12px] text-red-600">{error}</p>}
    </div>
  );
}
