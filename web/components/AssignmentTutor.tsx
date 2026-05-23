"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

export function AssignmentTutor({
  assignmentId,
  assignmentTitle,
}: {
  assignmentId: string;
  assignmentTitle: string;
}) {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([
    {
      role: "assistant",
      content: `Hi — I'm AIDA, your tutor for "${assignmentTitle}". Tell me where you're stuck and I'll walk you through it.`,
    },
  ]);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  async function send() {
    const text = input.trim();
    if (!text || busy) return;
    const next: Msg[] = [...messages, { role: "user", content: text }];
    setMessages(next);
    setInput("");
    setBusy(true);
    setError(null);
    try {
      const res = await fetch("/api/aida", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          messages: next.filter((m) => m.role !== "assistant" || m !== messages[0]),
          assignmentId,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      setMessages((m) => [...m, { role: "assistant", content: data.reply }]);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Something went wrong");
    } finally {
      setBusy(false);
    }
  }

  if (!open) {
    return (
      <button
        type="button"
        onClick={() => setOpen(true)}
        className="mono rounded-full border border-electric-400/40 px-3 py-1 text-[11px] text-electric-200 hover:bg-electric-400/10"
      >
        Ask AIDA
      </button>
    );
  }

  return (
    <div className="w-full rounded-lg border border-electric-400/30 bg-navy-900/60 p-3">
      <div className="flex items-center justify-between">
        <span className="mono text-[10px] uppercase text-electric-300">
          AIDA · Tutor mode
        </span>
        <button
          type="button"
          onClick={() => setOpen(false)}
          className="mono text-[11px] text-white/55 hover:text-white"
        >
          Close
        </button>
      </div>
      <div
        ref={scrollRef}
        className="mt-2 max-h-72 space-y-2 overflow-y-auto rounded border border-white/5 bg-navy-900/40 p-2 text-[12px]"
      >
        {messages.map((m, i) => (
          <div
            key={i}
            className={
              m.role === "user"
                ? "ml-6 rounded bg-electric-500/20 px-2 py-1.5 text-white"
                : "mr-6 rounded bg-white/[0.04] px-2 py-1.5 text-white/85"
            }
          >
            {m.content}
          </div>
        ))}
        {busy && (
          <div className="mr-6 rounded bg-white/[0.04] px-2 py-1.5 text-white/55">
            AIDA is thinking…
          </div>
        )}
      </div>
      {error && <p className="mt-2 text-[11px] text-red-300">{error}</p>}
      <div className="mt-2 flex gap-2">
        <input
          value={input}
          onChange={(e) => setInput(e.target.value)}
          onKeyDown={(e) => {
            if (e.key === "Enter" && !e.shiftKey) {
              e.preventDefault();
              void send();
            }
          }}
          placeholder="Ask about this assignment…"
          className="flex-1 rounded border border-white/10 bg-white/[0.04] px-2 py-1.5 text-[12px] text-white placeholder:text-white/30 focus:border-electric-400 focus:outline-none"
          disabled={busy}
        />
        <button
          type="button"
          onClick={send}
          disabled={busy || !input.trim()}
          className="rounded bg-electric-400 px-3 py-1.5 text-[12px] text-navy-900 hover:bg-electric-300 disabled:opacity-50"
        >
          Send
        </button>
      </div>
    </div>
  );
}
