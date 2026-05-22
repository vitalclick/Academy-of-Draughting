'use client';

import Link from 'next/link';
import { useEffect, useRef, useState } from 'react';
import { useAida } from './aida-context';

type ChatMsg = {
  role: 'aida' | 'user';
  text: string;
  kind?: 'chips' | 'cta';
  chips?: string[];
  ctaHref?: string;
  ctaLabel?: string;
};

const INITIAL_THREAD: ChatMsg[] = [
  {
    role: 'aida',
    text: "Hi, I'm AIDA — your admissions assistant. Tell me where you are right now and I'll match you to the right pathway.",
  },
  {
    role: 'aida',
    text: '',
    kind: 'chips',
    chips: [
      "I'm in matric / Grade 11–12",
      "I'm changing careers",
      'I want to upgrade my CAD skills',
      "I'm not sure yet",
    ],
  },
];

function scriptedReply(text: string): ChatMsg {
  const t = text.toLowerCase();
  if (t.includes('matric') || t.includes('grade')) {
    return {
      role: 'aida',
      text: "Good — most matric / Grade 11–12 students start with MDDOP N4/N5 (10 months full-time). It's nationally examined and you don't need prior CAD experience. Want me to start your application?",
      kind: 'chips',
      chips: ['Start application', 'See MDDOP details', 'Bridging course?'],
    };
  }
  if (t.includes('career') || t.includes('chang')) {
    return {
      role: 'aida',
      text: 'Career changers usually do well in our part-time MDDOP (18 months) or the Bridging Course if maths is rusty. I can map your background to a path — paste your current role or upload your CV.',
      kind: 'chips',
      chips: ['Upload CV', 'Take career quiz', 'Talk to admissions'],
    };
  }
  if (
    t.includes('cad') ||
    t.includes('autocad') ||
    t.includes('revit') ||
    t.includes('inventor')
  ) {
    return {
      role: 'aida',
      text: 'For working professionals upgrading CAD, the short courses are usually right — AutoCAD, Revit, or Inventor. Flexible schedules, industry-standard software, practical project work. Which software is your priority?',
      kind: 'chips',
      chips: ['AutoCAD', 'Revit', 'Inventor', 'All three'],
    };
  }
  if (t.includes('apply') || t.includes('start')) {
    return {
      role: 'aida',
      text: "Let's start your application. It's a 4-step process — about 6 minutes. I'll prefill what I can from our chat.",
      kind: 'cta',
      ctaHref: '/apply',
      ctaLabel: 'Open application →',
    };
  }
  return {
    role: 'aida',
    text: "Tell me a bit more — your background, what you want to draw (mechanical, architectural, civil), or where you'd like to study (Johannesburg, Durban, online).",
    kind: 'chips',
    chips: ['Mechanical', 'Architectural', 'Civil', 'Online study'],
  };
}

function AidaMessage({ m, onChip }: { m: ChatMsg; onChip: (s: string) => void }) {
  return (
    <div className={`aida-msg ${m.role === 'user' ? 'aida-msg-user' : 'aida-msg-ai'}`}>
      {m.role !== 'user' && (
        <span className="aida-mini-avatar" aria-hidden="true">
          <span className="ai-dot" />
        </span>
      )}
      <div className="aida-bubble">
        {m.text && <p>{m.text}</p>}
        {m.kind === 'chips' && m.chips && (
          <div className="aida-chips">
            {m.chips.map((c) => (
              <button key={c} type="button" className="aida-chip" onClick={() => onChip(c)}>
                {c}
              </button>
            ))}
          </div>
        )}
        {m.kind === 'cta' && m.ctaHref && (
          <Link href={m.ctaHref} className="btn btn-sm btn-primary" style={{ marginTop: 10 }}>
            {m.ctaLabel}
          </Link>
        )}
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
      opts: [
        'Mechanical & manufacturing',
        'Buildings & architecture',
        'Civil & structural',
        'Not sure — surprise me',
      ],
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
          Strongest match for your profile. Nationally examined (DHET), covers mechanical, civil and
          architectural draughting with AutoCAD, Revit and Inventor.
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
  const [tab, setTab] = useState<'chat' | 'match' | 'apply'>('chat');
  const [thread, setThread] = useState<ChatMsg[]>(INITIAL_THREAD);
  const [input, setInput] = useState('');
  const [thinking, setThinking] = useState(false);
  const bodyRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    if (bodyRef.current) bodyRef.current.scrollTop = bodyRef.current.scrollHeight;
  }, [thread, thinking]);

  function send(text: string) {
    if (!text) return;
    setThread((t) => [...t, { role: 'user', text }]);
    setInput('');
    setThinking(true);
    setTimeout(() => {
      setThinking(false);
      setThread((t) => [...t, scriptedReply(text)]);
    }, 850);
  }

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
                <div className="aida-head-sub t-mono-xs">ONLINE · &lt;1 MIN AVG REPLY</div>
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
                  <AidaMessage key={i} m={m} onChip={send} />
                ))}
                {thinking && (
                  <div className="aida-msg aida-msg-ai">
                    <div className="aida-bubble aida-thinking">
                      <span />
                      <span />
                      <span />
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
                  placeholder="Tell AIDA where you are…"
                  value={input}
                  onChange={(e) => setInput(e.target.value)}
                  aria-label="Message"
                />
                <button type="submit" aria-label="Send" disabled={!input.trim()}>
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
                Mock prototype · responses are illustrative
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
