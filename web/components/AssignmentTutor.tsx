"use client";

import { useEffect, useRef, useState } from "react";
import { getSupabaseBrowser } from "@/lib/supabase/client";

type Msg = { role: "user" | "assistant"; content: string };

export function AssignmentTutor({
  assignmentId,
  assignmentTitle,
}: {
  assignmentId: string;
  assignmentTitle: string;
}) {
  const greeting: Msg = {
    role: "assistant",
    content: `Hi — I'm AIDA, your tutor for "${assignmentTitle}". Tell me where you're stuck and I'll walk you through it.`,
  };
  const [open, setOpen] = useState(false);
  const [messages, setMessages] = useState<Msg[]>([greeting]);
  const [conversationId, setConversationId] = useState<string | null>(null);
  const [input, setInput] = useState("");
  const [busy, setBusy] = useState(false);
  const [historyLoaded, setHistoryLoaded] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (scrollRef.current) scrollRef.current.scrollTop = scrollRef.current.scrollHeight;
  }, [messages, open]);

  // Load the most recent prior tutor conversation for this assignment when
  // the panel is first opened. RLS scopes this to the signed-in user.
  useEffect(() => {
    if (!open || historyLoaded) return;
    setHistoryLoaded(true);
    (async () => {
      try {
        const supabase = getSupabaseBrowser();
        const { data: conv } = await supabase
          .from("ai_conversations")
          .select("id")
          .eq("scope_type", "tutor")
          .eq("scope_id", assignmentId)
          .order("updated_at", { ascending: false })
          .limit(1)
          .maybeSingle<{ id: string }>();
        if (!conv) return;
        const { data: msgs } = await supabase
          .from("ai_messages")
          .select("role, content, created_at")
          .eq("conversation_id", conv.id)
          .order("created_at", { ascending: true })
          .returns<{ role: "user" | "assistant"; content: string }[]>();
        if (msgs && msgs.length) {
          setConversationId(conv.id);
          setMessages([greeting, ...msgs.map((m) => ({ role: m.role, content: m.content }))]);
        }
      } catch {
        // No history / not signed in — keep the greeting.
      }
    })();
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [open]);

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
          conversationId: conversationId ?? undefined,
        }),
      });
      const data = await res.json();
      if (!res.ok) throw new Error(data.error || "Request failed");
      if (data.conversationId) setConversationId(data.conversationId);
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
