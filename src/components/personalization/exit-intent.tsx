'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';
import { usePersonalization } from './provider';
import { track } from '@/lib/analytics/events';

const STORAGE_KEY = 'aoad_exit_intent_v1';
const SUPPRESS_MS = 1000 * 60 * 60 * 24 * 14; // 14 days

const HIDDEN_ROUTES = ['/admin', '/apply', '/data-rights'];

function suppressed(): boolean {
  if (typeof window === 'undefined') return true;
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return false;
    const parsed = JSON.parse(raw) as { at: number; status: string };
    return Date.now() - parsed.at < SUPPRESS_MS;
  } catch {
    return false;
  }
}

function mark(status: 'submitted' | 'dismissed') {
  try {
    localStorage.setItem(STORAGE_KEY, JSON.stringify({ at: Date.now(), status }));
  } catch {
    // ignore
  }
}

const COPY: Record<string, { eyebrow: string; title: string; body: string }> = {
  matric: {
    eyebrow: 'FREE · 2026 GUIDE',
    title: 'Before you go — see what draughting pays in SA.',
    body: 'Salary bands, demand by region, and the shortest route from matric to a real drawing-office role.',
  },
  career_changer: {
    eyebrow: 'CAREER-CHANGER PACK',
    title: 'Pivot into draughting with eyes open.',
    body: '2026 demand + salary report and a checklist for adult learners switching from another industry.',
  },
  working_pro: {
    eyebrow: 'UPSKILL BRIEF',
    title: 'Which CAD software is hiring right now in SA?',
    body: 'A 1-page brief with the live demand split across AutoCAD, Revit, Inventor and Civil 3D.',
  },
  parent: {
    eyebrow: 'PARENT BRIEF',
    title: 'Real numbers on draughting as a career path.',
    body: 'Cost, duration, outcomes and demand. Made for parents helping a Grade 11/12 student decide.',
  },
  returning: {
    eyebrow: 'STILL DECIDING?',
    title: 'Take 60 seconds to find your fit.',
    body: 'Our recommender scores you against the programmes and explains the best match in plain English.',
  },
  unknown: {
    eyebrow: 'FREE · 2026 GUIDE',
    title: 'One more thing — the SA draughting careers report.',
    body: 'Salary, demand and software requirements across the eight main draughting roles in 2026.',
  },
};

export function ExitIntent() {
  const { ready, segment } = usePersonalization();
  const pathname = usePathname();
  const [open, setOpen] = useState(false);
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [status, setStatus] = useState<'idle' | 'pending' | 'done' | 'error'>('idle');
  const [armed, setArmed] = useState(false);

  // Arm the listener once the visitor is past the initial pageload,
  // and only on desktop with no prior submission/dismissal.
  useEffect(() => {
    if (!ready) return;
    if (typeof window === 'undefined') return;
    if (window.innerWidth < 900) return;
    if (HIDDEN_ROUTES.some((p) => pathname?.startsWith(p))) return;
    if (suppressed()) return;
    const t = setTimeout(() => setArmed(true), 8_000);
    return () => clearTimeout(t);
  }, [ready, pathname]);

  useEffect(() => {
    if (!armed) return;
    function onLeave(e: MouseEvent) {
      // Mouse left through the top of the viewport
      if (e.clientY > 4 || e.relatedTarget) return;
      if (suppressed()) return;
      setOpen(true);
      setArmed(false);
      track('exit_intent_shown', { segment });
    }
    document.addEventListener('mouseleave', onLeave);
    return () => document.removeEventListener('mouseleave', onLeave);
  }, [armed, segment]);

  function dismiss() {
    setOpen(false);
    mark('dismissed');
    track('exit_intent_dismissed', { segment });
  }

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    if (!email || status === 'pending') return;
    setStatus('pending');
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName: firstName || undefined,
          source: 'exit_intent',
          segment,
        }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus('done');
      mark('submitted');
      track('exit_intent_submitted', { segment });
    } catch {
      setStatus('error');
    }
  }

  if (!open) return null;
  const copy = COPY[segment] ?? COPY.unknown;

  return (
    <div className="exit-modal-backdrop" role="dialog" aria-modal="true" aria-label={copy.title}>
      <div className="exit-modal">
        <button
          type="button"
          className="exit-modal-close"
          onClick={dismiss}
          aria-label="Close"
        >
          ×
        </button>

        {status === 'done' ? (
          <>
            <span className="t-mono-xs" style={{ color: 'var(--cyan-500)' }}>
              ✓ SENT
            </span>
            <h2 className="exit-modal-title">Check your inbox.</h2>
            <p className="exit-modal-body">
              The guide is on its way. If it doesn&apos;t arrive in two minutes, check your spam
              folder.
            </p>
            <button type="button" className="btn btn-ghost-light" onClick={() => setOpen(false)}>
              Close
            </button>
          </>
        ) : (
          <>
            <span className="t-mono-xs" style={{ color: 'var(--blue-600)' }}>
              {copy.eyebrow}
            </span>
            <h2 className="exit-modal-title">{copy.title}</h2>
            <p className="exit-modal-body">{copy.body}</p>

            <form onSubmit={submit} className="exit-modal-form">
              <label className="t-mono-xs">FIRST NAME (OPTIONAL)</label>
              <input
                type="text"
                value={firstName}
                onChange={(e) => setFirstName(e.target.value)}
                placeholder="Your name"
              />
              <label className="t-mono-xs">EMAIL</label>
              <input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="you@email.com"
                aria-invalid={status === 'error'}
              />
              {status === 'error' && (
                <div className="apply-banner apply-banner-error" role="alert">
                  Something went wrong sending the guide. Try again or contact admissions.
                </div>
              )}
              <button
                type="submit"
                className="btn btn-primary"
                disabled={status === 'pending' || !email}
              >
                {status === 'pending' ? 'Sending…' : 'Send me the guide'}
              </button>
              <button
                type="button"
                className="exit-modal-skip"
                onClick={dismiss}
              >
                No thanks
              </button>
              <p className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>
                We&apos;ll never share your address. See our{' '}
                <a href="/privacy" style={{ color: 'var(--blue-600)' }}>
                  Privacy Notice
                </a>
                .
              </p>
            </form>
          </>
        )}
      </div>
    </div>
  );
}
