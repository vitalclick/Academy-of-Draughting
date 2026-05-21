"use client";

import { useRef, useState } from "react";

export function DocumentUpload({ applicationId }: { applicationId: string; userId: string }) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "ocr" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);
  const [lastFile, setLastFile] = useState<string | null>(null);

  async function handle(file: File) {
    setError(null);
    setStatus("uploading");
    try {
      const signRes = await fetch("/api/upload", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          applicationId,
          filename: file.name,
          mimeType: file.type,
          sizeBytes: file.size,
        }),
      });
      const signData = await signRes.json();
      if (!signRes.ok) throw new Error(signData.error || "Could not start upload");

      const putRes = await fetch(signData.uploadUrl, {
        method: "PUT",
        headers: { "Content-Type": file.type, "x-upsert": "false" },
        body: file,
      });
      if (!putRes.ok) throw new Error(`Upload failed (${putRes.status})`);

      setStatus("ocr");
      await fetch("/api/ocr", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ documentId: signData.documentId }),
      });
      setLastFile(file.name);
      setStatus("done");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  }

  return (
    <div className="rounded-md border border-white/10 bg-white/[0.02] p-3 text-[12px]">
      <div className="flex items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          accept=".pdf,image/png,image/jpeg,image/webp"
          className="hidden"
          onChange={(e) => {
            const f = e.target.files?.[0];
            if (f) void handle(f);
            e.target.value = "";
          }}
        />
        <button
          type="button"
          onClick={() => inputRef.current?.click()}
          disabled={status === "uploading" || status === "ocr"}
          className="btn-ghost-dark disabled:opacity-50"
        >
          {status === "uploading" ? "Uploading…" : status === "ocr" ? "Processing…" : "Upload document"}
        </button>
        <span className="text-white/55">
          {status === "done" && lastFile && `✓ ${lastFile}`}
          {status === "idle" && "PDF / PNG / JPG · up to 20 MB"}
        </span>
      </div>
      {error && <p className="mt-2 text-red-300">{error}</p>}
    </div>
  );
}
