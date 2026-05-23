"use client";

import { useEffect, useRef, useState } from "react";

type Msg = { role: "user" | "assistant"; content: string };

const SEED: Msg = {
  role: "assistant",
  content:
    "Hi — I'm AIDA, the admissions assistant. Tell me what you're hoping to do (architectural, mechanical, BIM, career switch?) and I'll point you at the right course.",
};

export function Aida() {
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([SEED]);
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
        body: JSON.stringify({ messages: next }),
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

  return (
    <>
      <button
        type="button"
        onClick={() => setOpen((v) => !v)}
        className="fixed bottom-5 right-5 z-50 flex items-center gap-2 rounded-full bg-electric-600 px-5 py-3 text-sm font-medium text-white shadow-lg shadow-electric-600/30 transition hover:bg-electric-500"
        aria-expanded={open}
      >
        <span className="grid h-5 w-5 place-items-center rounded-full bg-white/20 text-[10px] font-mono">AI</span>
        {open ? "Close" : "Ask AIDA"}
      </button>

      {open && (
        <div className="fixed bottom-20 right-5 z-50 flex h-[min(560px,80vh)] w-[min(380px,calc(100vw-2.5rem))] flex-col overflow-hidden rounded-xl border border-paper-3 bg-white shadow-2xl shadow-navy-900/20">
          <div className="border-b border-paper-2 bg-navy-900 px-4 py-3 text-white">
            <div className="mono text-white/60">ADMISSIONS · AIDA</div>
            <div className="text-sm">How can I help you choose a path?</div>
          </div>
          <div ref={scrollRef} className="flex-1 space-y-3 overflow-y-auto bg-paper px-4 py-4">
            {messages.map((m, i) => (
              <div
                key={i}
                className={
                  m.role === "user"
                    ? "ml-8 rounded-lg bg-electric-600 px-3 py-2 text-sm text-white"
                    : "mr-8 rounded-lg border border-paper-3 bg-white px-3 py-2 text-sm text-ink"
                }
              >
                {m.content}
              </div>
            ))}
            {busy && <div className="mr-8 rounded-lg border border-paper-3 bg-white px-3 py-2 text-sm text-ink-3">AIDA is typing…</div>}
            {error && <div className="rounded-lg border border-red-300 bg-red-50 px-3 py-2 text-xs text-red-700">{error}</div>}
          </div>
          <form
            onSubmit={(e) => { e.preventDefault(); void send(); }}
            className="flex gap-2 border-t border-paper-2 bg-white p-3"
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about courses, fees, careers…"
              className="flex-1 rounded-md border border-paper-3 px-3 py-2 text-sm outline-none focus:border-electric-500"
            />
            <button type="submit" disabled={busy || !input.trim()} className="btn-primary disabled:opacity-50">
              Send
            </button>
          </form>
        </div>
      )}
    </>
  );
}
