"use client";

import { useRef, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

const BUCKET = "assignment-briefs";

export function BriefUploader({
  assignmentId,
  currentPath,
}: {
  assignmentId: string;
  currentPath: string | null;
}) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [path, setPath] = useState<string | null>(currentPath);
  const [status, setStatus] = useState<"idle" | "uploading" | "saving" | "error">("idle");
  const [error, setError] = useState<string | null>(null);

  const publicUrl = path
    ? `${process.env.NEXT_PUBLIC_SUPABASE_URL}/storage/v1/object/public/${BUCKET}/${path}`
    : null;

  async function upload(file: File) {
    setError(null);
    setStatus("uploading");
    try {
      const supabase = getSupabaseBrowser();
      const safe = file.name.replace(/[^\w.\- ]+/g, "_").slice(0, 120);
      const objectPath = `${assignmentId}/${Date.now()}-${safe}`;
      const { error: upErr } = await supabase.storage
        .from(BUCKET)
        .upload(objectPath, file, { upsert: false, contentType: file.type });
      if (upErr) throw upErr;
      setStatus("saving");
      const { error: assignErr } = await supabase
        .from("assignments")
        .update({ brief_storage_path: objectPath } as never)
        .eq("id", assignmentId);
      if (assignErr) throw assignErr;
      setPath(objectPath);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Upload failed");
    }
  }

  async function remove() {
    if (!path) return;
    if (!confirm("Remove the attached brief?")) return;
    setError(null);
    setStatus("saving");
    try {
      const supabase = getSupabaseBrowser();
      await supabase.storage.from(BUCKET).remove([path]);
      const { error: clearErr } = await supabase
        .from("assignments")
        .update({ brief_storage_path: null } as never)
        .eq("id", assignmentId);
      if (clearErr) throw clearErr;
      setPath(null);
      setStatus("idle");
    } catch (err) {
      setStatus("error");
      setError(err instanceof Error ? err.message : "Remove failed");
    }
  }

  return (
    <div className="mt-2 rounded border border-paper-3 bg-white p-2 text-[12px]">
      <div className="flex items-center justify-between gap-2">
        <div className="min-w-0">
          <div className="mono text-[10px] uppercase text-ink-4">Brief attachment</div>
          {publicUrl ? (
            <a
              href={publicUrl}
              target="_blank"
              rel="noopener noreferrer"
              className="block truncate text-electric-700 hover:underline"
            >
              {path?.split("/").pop()}
            </a>
          ) : (
            <span className="text-ink-3">None attached</span>
          )}
        </div>
        <div className="flex gap-1">
          {path && (
            <button
              type="button"
              onClick={remove}
              className="rounded border border-paper-3 px-2 py-1 text-[11px] text-red-600 hover:bg-red-50"
              disabled={status !== "idle"}
            >
              Remove
            </button>
          )}
          <button
            type="button"
            onClick={() => inputRef.current?.click()}
            disabled={status === "uploading" || status === "saving"}
            className="rounded border border-paper-3 px-2 py-1 text-[11px] hover:border-electric-400"
          >
            {status === "uploading" ? "Uploading…" : status === "saving" ? "Saving…" : path ? "Replace" : "Upload"}
          </button>
          <input
            ref={inputRef}
            type="file"
            accept=".pdf,image/png,image/jpeg,image/webp"
            className="hidden"
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) void upload(f);
              e.target.value = "";
            }}
          />
        </div>
      </div>
      {error && <p className="mt-1 text-red-600">{error}</p>}
    </div>
  );
}
