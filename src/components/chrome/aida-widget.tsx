'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { usePathname } from 'next/navigation';
import { useAida } from './aida-context';
import { track } from '@/lib/analytics/events';

const HIDDEN_ROUTES = ['/admin', '/data-rights/confirm'];

type ToolEffect =
  | { kind: 'cta-apply'; courseId: string; mode?: string }
  | { kind: 'cta-handoff'; reason: string }
  | { kind: 'cta-link'; href: string; label: string };

type ChatMsg = {
  role: 'aida' | 'user';
  text: string;
  effect?: ToolEffect;
  toolName?: string;
};

const WELCOME: ChatMsg = {
  role: 'aida',
  text: "Hi, I'm AIDA — your admissions assistant. Tell me where you are right now (matric, working, changing careers…) and I'll match you to the right pathway.",
};

const STARTER_CHIPS = [
  "I'm in matric / Grade 11–12",
  "I'm changing careers",
  'I want to upgrade my CAD skills',
  'How much do draughtspeople earn in SA?',
];

function CtaForEffect({
  effect,
  onClose,
}: {
  effect: ToolEffect;
  onClose: () => void;
}) {
  if (effect.kind === 'cta-apply') {
    return (
      <Link
        href={`/apply?course=${effect.courseId}${effect.mode ? `&mode=${effect.mode}` : ''}`}
        className="btn btn-sm btn-primary"
        style={{ marginTop: 10 }}
        onClick={onClose}
      >
        Open application →
      </Link>
    );
  }
  if (effect.kind === 'cta-link') {
    return (
      <Link
        href={effect.href}
        className="btn btn-sm btn-ghost-dark"
        style={{ marginTop: 10 }}
        onClick={onClose}
      >
        {effect.label} →
      </Link>
    );
  }
  if (effect.kind === 'cta-handoff') {
    return (
      <Link
        href="/contact"
        className="btn btn-sm btn-ghost-dark"
        style={{ marginTop: 10 }}
        onClick={onClose}
      >
        Talk to a human →
      </Link>
    );
  }
  return null;
}

function AidaMessage({
  m,
  onChip,
  onClose,
}: {
  m: ChatMsg & { chips?: string[] };
  onChip: (s: string) => void;
  onClose: () => void;
}) {
  return (
    <div className={`aida-msg ${m.role === 'user' ? 'aida-msg-user' : 'aida-msg-ai'}`}>
      {m.role !== 'user' && (
        <span className="aida-mini-avatar" aria-hidden="true">
          <span className="ai-dot" />
        </span>
      )}
      <div className="aida-bubble">
        {m.text && (
          <p style={{ whiteSpace: 'pre-wrap' }}>
            {m.text}
            {/* show a blinking caret while AIDA is streaming */}
          </p>
        )}
        {m.chips && m.chips.length > 0 && (
          <div className="aida-chips">
            {m.chips.map((c) => (
              <button key={c} type="button" className="aida-chip" onClick={() => onChip(c)}>
                {c}
              </button>
            ))}
          </div>
        )}
        {m.effect && <CtaForEffect effect={m.effect} onClose={onClose} />}
      </div>
    </div>
  );
}

function AidaMatchView() {
  const [step, setStep] = useState(0);
  const questions = [
    {
      q: 'Where are you in your journey?',
      opts: ['Matric / Grade 11–12', 'Already working', 'Changing careers', 'Studying something else'],
    },
    {
      q: 'What draws you most?',
      opts: ['Mechanical & manufacturing', 'Buildings & architecture', 'Civil & structural', 'Not sure — surprise me'],
    },
    {
      q: 'Study mode that fits your life?',
      opts: ['Full-time (10 months)', 'Part-time (18 months)', 'Online / self-paced', 'No preference'],
    },
  ];
  const done = step >= questions.length;

  if (done) {
    return (
      <div className="aida-match-result">
        <div className="aida-match-meta t-mono-xs">MATCHED · MDDOP N4/N5 · FULL-TIME · 96% FIT</div>
        <h4 className="t-h3" style={{ margin: '4px 0 8px' }}>
          MDDOP N4/N5 — National Certificate
        </h4>
        <p className="t-body-sm" style={{ marginBottom: 12 }}>
          Strongest match for your profile. Nationally examined (DHET), covers mechanical, civil
          and architectural draughting with AutoCAD, Revit and Inventor.
        </p>
        <div style={{ display: 'flex', gap: 8 }}>
          <Link href="/apply" className="btn btn-sm btn-primary">
            Apply now
          </Link>
          <button type="button" className="btn btn-sm btn-ghost-dark" onClick={() => setStep(0)}>
            Restart
          </button>
        </div>
      </div>
    );
  }

  const cur = questions[step];
  return (
    <div className="aida-match">
      <div className="aida-match-progress">
        <span className="t-mono-xs">
          QUESTION {step + 1} OF {questions.length}
        </span>
        <div className="aida-progress-track">
          <div
            className="aida-progress-bar"
            style={{ width: `${(step / questions.length) * 100}%` }}
          />
        </div>
      </div>
      <h4 className="aida-match-q">{cur.q}</h4>
      <div className="aida-match-opts">
        {cur.opts.map((o) => (
          <button
            key={o}
            type="button"
            className="aida-match-opt"
            onClick={() => setStep((s) => s + 1)}
          >
            <span>{o}</span>
            <span aria-hidden="true">→</span>
          </button>
        ))}
      </div>
    </div>
  );
}

function AidaApplyView() {
  return (
    <div className="aida-apply">
      <div className="t-mono-xs" style={{ color: 'var(--ink-on-dark-3)' }}>
        QUICK APPLY · STEP 1 / 4
      </div>
      <h4 className="t-h3" style={{ margin: '6px 0 12px' }}>
        Let&apos;s get you started
      </h4>
      <div className="aida-form-row">
        <label className="t-mono-xs">FULL NAME</label>
        <input type="text" placeholder="Your name" />
      </div>
      <div className="aida-form-row">
        <label className="t-mono-xs">EMAIL</label>
        <input type="email" placeholder="you@email.com" />
      </div>
      <div className="aida-form-row">
        <label className="t-mono-xs">MOBILE</label>
        <input type="tel" placeholder="+27 …" />
      </div>
      <Link href="/apply" className="btn btn-primary" style={{ width: '100%', marginTop: 12 }}>
        Continue to full application →
      </Link>
      <div className="t-mono-xs aida-foot" style={{ textAlign: 'center', marginTop: 8 }}>
        AIDA will prefill what we already know from chat.
      </div>
    </div>
  );
}

export function AidaWidget() {
  const aida = useAida();
  const pathname = usePathname();
  const [tab, setTab] = useState<'chat' | 'match' | 'apply'>('chat');
  const [thread, setThread] = useState<ChatMsg[]>([WELCOME]);
  const [input, setInput] = useState('');
  const [streaming, setStreaming] = useState(false);
  const [streamingText, setStreamingText] = useState('');
  const [pendingEffect, setPendingEffect] = useState<ToolEffect | null>(null);
  const bodyRef = useRef<HTMLDivElement>(null);
  const abortRef = useRef<AbortController | null>(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [thread, streaming, streamingText]);

  useEffect(() => {
    return () => abortRef.current?.abort();
  }, []);

  async function send(text: string) {
    if (!text || streaming) return;
    track('aida_message_sent', { length: text.length });

    const nextThread: ChatMsg[] = [...thread, { role: 'user' as const, text }];
    setThread(nextThread);
    setInput('');
    setStreaming(true);
    setStreamingText('');
    setPendingEffect(null);

    const apiMessages = nextThread.map((m) => ({
      role: m.role === 'aida' ? ('assistant' as const) : ('user' as const),
      content: m.text,
    }));

    const ctl = new AbortController();
    abortRef.current = ctl;
    let buffer = '';
    let finalText = '';
    let finalEffect: ToolEffect | null = null;

    try {
      const res = await fetch('/api/chat', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ messages: apiMessages }),
        signal: ctl.signal,
      });
      if (res.status === 429) {
        finalText = "I'm getting a lot of questions right now. Try me again in a few seconds.";
        setStreamingText(finalText);
      } else if (!res.ok || !res.body) {
        finalText = "Something went wrong on my side. Try again, or talk to a human admissions officer.";
        finalEffect = { kind: 'cta-handoff', reason: 'http_error' };
        setStreamingText(finalText);
      } else {
        const reader = res.body.getReader();
        const decoder = new TextDecoder();
        while (true) {
          const { value, done } = await reader.read();
          if (done) break;
          buffer += decoder.decode(value, { stream: true });
          const lines = buffer.split('\n\n');
          buffer = lines.pop() ?? '';
          for (const line of lines) {
            if (!line.startsWith('data: ')) continue;
            const payload = line.slice(6);
            try {
              const ev = JSON.parse(payload) as
                | { type: 'text'; text: string }
                | { type: 'effect'; effect: ToolEffect }
                | { type: 'tool'; name: string }
                | { type: 'error'; message: string }
                | { type: 'done' };
              if (ev.type === 'text') {
                finalText += ev.text;
                setStreamingText((s) => s + ev.text);
              } else if (ev.type === 'effect') {
                finalEffect = ev.effect;
                setPendingEffect(ev.effect);
              } else if (ev.type === 'error') {
                finalText = finalText || "I hit a snag — let's get you a human.";
                finalEffect = { kind: 'cta-handoff', reason: ev.message };
              }
            } catch {
              // ignore malformed event
            }
          }
        }
      }
    } catch (err) {
      if ((err as Error).name !== 'AbortError') {
        finalText = "Connection dropped. Try again, or jump to WhatsApp.";
        finalEffect = { kind: 'cta-handoff', reason: 'network' };
      }
    } finally {
      setStreaming(false);
      setStreamingText('');
      setPendingEffect(null);
      if (finalText) {
        const msg: ChatMsg = { role: 'aida', text: finalText };
        if (finalEffect) msg.effect = finalEffect;
        setThread((t) => [...t, msg]);
      }
      abortRef.current = null;
    }
  }

  if (HIDDEN_ROUTES.some((p) => pathname?.startsWith(p))) return null;

  return (
    <>
      {!aida.open && (
        <button
          type="button"
          className="aida-fab"
          onClick={() => aida.setOpen(true)}
          aria-label="Open AIDA admissions assistant"
        >
          <span className="aida-fab-mark" aria-hidden="true">
            <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
              <path
                d="M21 12a9 9 0 1 1-3.93-7.44L21 3l-1.06 4.06A9 9 0 0 1 21 12z"
                stroke="currentColor"
                strokeWidth="1.5"
              />
            </svg>
          </span>
          <span className="aida-fab-text">
            <span className="aida-fab-title">Admissions Chat</span>
            <span className="aida-fab-sub">Live · &lt;1 min reply</span>
          </span>
        </button>
      )}

      {aida.open && (
        <div className="aida-panel" role="dialog" aria-label="AIDA admissions assistant">
          <header className="aida-head">
            <div className="aida-head-left">
              <span className="aida-avatar" aria-hidden="true">
                <span className="ai-dot" />
              </span>
              <div className="aida-head-text">
                <div className="aida-head-name">Admissions · AIDA</div>
                <div className="aida-head-sub t-mono-xs">ONLINE · CLAUDE-POWERED</div>
              </div>
            </div>
            <button
              type="button"
              className="aida-close"
              onClick={() => aida.setOpen(false)}
              aria-label="Close"
            >
              ×
            </button>
          </header>

          <div className="aida-tabs">
            {(
              [
                { k: 'chat', label: 'Chat' },
                { k: 'match', label: 'Match Pathway' },
                { k: 'apply', label: 'Apply' },
              ] as const
            ).map((t) => (
              <button
                key={t.k}
                type="button"
                onClick={() => setTab(t.k)}
                className={`aida-tab ${tab === t.k ? 'is-active' : ''}`}
              >
                {t.label}
              </button>
            ))}
          </div>

          {tab === 'chat' && (
            <>
              <div className="aida-body" ref={bodyRef}>
                {thread.map((m, i) => (
                  <AidaMessage
                    key={i}
                    m={{ ...m, chips: i === 0 && thread.length === 1 ? STARTER_CHIPS : undefined }}
                    onChip={send}
                    onClose={() => aida.setOpen(false)}
                  />
                ))}
                {streaming && (
                  <div className="aida-msg aida-msg-ai">
                    <span className="aida-mini-avatar" aria-hidden="true">
                      <span className="ai-dot" />
                    </span>
                    <div className="aida-bubble">
                      {streamingText ? (
                        <p style={{ whiteSpace: 'pre-wrap' }}>
                          {streamingText}
                          <span className="aida-cursor" aria-hidden="true" />
                        </p>
                      ) : (
                        <div className="aida-thinking">
                          <span />
                          <span />
                          <span />
                        </div>
                      )}
                      {pendingEffect && (
                        <CtaForEffect effect={pendingEffect} onClose={() => aida.setOpen(false)} />
                      )}
                    </div>
                  </div>
                )}
              </div>
              <form
                className="aida-input"
                onSubmit={(e) => {
                  e.preventDefault();
                  send(input.trim());
                }}
              >
                <input
                  type="text"
                  placeholder={streaming ? 'AIDA is typing…' : 'Tell AIDA where you are…'}
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  aria-label="Message"
                  disabled={streaming}
                />
                <button type="submit" aria-label="Send" disabled={!input.trim() || streaming}>
                  <svg width="16" height="16" viewBox="0 0 24 24" fill="none">
                    <path
                      d="M5 12h14M13 6l6 6-6 6"
                      stroke="currentColor"
                      strokeWidth="2"
                      strokeLinecap="round"
                      strokeLinejoin="round"
                    />
                  </svg>
                </button>
              </form>
              <div className="aida-foot t-mono-xs">
                AIDA can&apos;t make final admissions decisions. Critical questions go to a human.
              </div>
            </>
          )}

          {tab === 'match' && <AidaMatchView />}
          {tab === 'apply' && <AidaApplyView />}
        </div>
      )}
    </>
  );
}
