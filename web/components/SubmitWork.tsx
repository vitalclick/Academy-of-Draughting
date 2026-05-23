"use client";

import { useRef, useState } from "react";
import { useRouter } from "next/navigation";

type Props = {
  assignmentId: string;
  currentStatus: "draft" | "submitted" | "graded" | "returned" | "not started";
};

export function SubmitWork({ assignmentId, currentStatus }: Props) {
  const inputRef = useRef<HTMLInputElement>(null);
  const router = useRouter();
  const [open, setOpen] = useState(false);
  const [notes, setNotes] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [status, setStatus] = useState<"idle" | "uploading" | "saving" | "done" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const disabled = status === "uploading" || status === "saving";
  const cta =
    currentStatus === "not started"
      ? "Submit work"
      : currentStatus === "returned"
        ? "Resubmit"
        : "Update submission";

  async function submit() {
    setError(null);
    if (!file && !notes.trim()) {
      setError("Add a file or some notes.");
      return;
    }
    setStatus(file ? "uploading" : "saving");
    try {
      const body: Record<string, unknown> = { assignmentId, notes: notes.trim() || undefined };
      if (file) {
        body.file = { filename: file.name, mimeType: file.type || "application/octet-stream", sizeBytes: file.size };
      }
      const res = await fetch("/api/submissions", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(body),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Submission failed");

      if (file && data.uploadUrl) {
        const put = await fetch(data.uploadUrl, {
          method: "PUT",
          headers: { "Content-Type": file.type || "application/octet-stream", "x-upsert": "true" },
          body: file,
        });
        if (!put.ok) throw new Error(`Upload failed (${put.status})`);
      }

      setStatus("done");
      setOpen(false);
      setNotes("");
      setFile(null);
      if (inputRef.current) inputRef.current.value = "";
      router.refresh();
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Submission failed");
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mono rounded-full bg-electric-500/20 px-3 py-1 text-[11px] text-electric-200 hover:bg-electric-500/30"
      >
        {cta}
      </button>
    );
  }

  return (
    <div className="w-full max-w-md rounded border border-white/10 bg-navy-900/60 p-3 text-[12px]">
      <textarea
        value={notes}
        onChange={(e) => setNotes(e.target.value)}
        placeholder="Notes for your reviewer (optional)"
        rows={3}
        className="w-full resize-y rounded border border-white/10 bg-white/[0.04] p-2 text-white placeholder:text-white/30 focus:border-electric-400 focus:outline-none"
      />
      <div className="mt-2 flex flex-wrap items-center gap-2">
        <input
          ref={inputRef}
          type="file"
          onChange={(e) => setFile(e.target.files?.[0] ?? null)}
          className="block w-full text-[11px] text-white/70 file:mr-2 file:rounded file:border-0 file:bg-white/10 file:px-2 file:py-1 file:text-[11px] file:text-white hover:file:bg-white/20"
        />
      </div>
      {error && <p className="mt-2 text-red-300">{error}</p>}
      <div className="mt-3 flex items-center justify-end gap-2">
        <button
          type="button"
          onClick={() => {
            setOpen(false);
            setError(null);
            setStatus("idle");
          }}
          className="rounded px-3 py-1 text-white/55 hover:text-white"
          disabled={disabled}
        >
          Cancel
        </button>
        <button
          type="button"
          onClick={submit}
          disabled={disabled}
          className="rounded-full bg-electric-400 px-3 py-1 text-navy-900 hover:bg-electric-300 disabled:opacity-50"
        >
          {status === "uploading" ? "Uploading…" : status === "saving" ? "Saving…" : "Submit"}
        </button>
      </div>
    </div>
  );
}
