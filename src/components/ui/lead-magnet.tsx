'use client';

import { useState } from 'react';
import Link from 'next/link';
import { track } from '@/lib/analytics/events';

const GUIDE_URL = '/resources/draughting-careers-2026';

function getAnonIds() {
  if (typeof window === 'undefined') return { anonymousId: null, sessionId: null };
  try {
    return {
      anonymousId: localStorage.getItem('aoad_anon_id_v1'),
      sessionId: sessionStorage.getItem('aoad_session_id_v1'),
    };
  } catch {
    return { anonymousId: null, sessionId: null };
  }
}

export function LeadMagnet({ source = 'lead_magnet' }: { source?: string }) {
  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    track('lead_magnet_submit', { source });
    try {
      const res = await fetch('/api/leads', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          email,
          firstName: firstName || undefined,
          source,
          ...getAnonIds(),
        }),
      });
      if (!res.ok) {
        const json = await res.json().catch(() => ({}));
        setError(json.error === 'rate_limited' ? 'Too many requests — try again shortly.' : 'Something went wrong. Please try again.');
        return;
      }
      setDone(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setBusy(false);
    }
  }

  return (
    <div className="apply-card aside-aida" style={{ padding: 28 }}>
      <span className="pill pill-blue"><span className="dot" />FREE GUIDE · 2026</span>
      <h3 className="t-h3" style={{ marginTop: 14, marginBottom: 8 }}>
        SA Draughting Careers &amp; Salary Guide
      </h3>
      <p className="t-body" style={{ marginBottom: 16, color: 'var(--ink-on-dark-2)' }}>
        Real ZAR salary bands, demand projections, software-by-discipline and the shortest credible
        route into each role — built for the South African market.
      </p>

      {done ? (
        <div>
          <p style={{ fontSize: 14, marginBottom: 12 }}>
            Done — it&apos;s in your inbox. You can also read it right now:
          </p>
          <Link href={GUIDE_URL} className="btn btn-primary" onClick={() => track('lead_magnet_open', { source })}>
            Open the guide →
          </Link>
        </div>
      ) : (
        <form onSubmit={submit} style={{ display: 'flex', flexDirection: 'column', gap: 8 }}>
          <input
            type="text"
            placeholder="First name"
            value={firstName}
            onChange={(e) => setFirstName(e.target.value)}
            style={fieldStyle}
          />
          <input
            type="email"
            required
            placeholder="Email address"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            style={fieldStyle}
          />
          {error && <div className="apply-banner apply-banner-error" role="alert">{error}</div>}
          <button type="submit" className="btn btn-primary" disabled={busy} style={{ marginTop: 4 }}>
            {busy ? 'Sending…' : 'Send me the guide →'}
          </button>
        </form>
      )}
    </div>
  );
}

const fieldStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid var(--line-on-dark-strong)',
  borderRadius: 8,
  fontSize: 14,
  background: 'rgba(255,255,255,0.06)',
  color: 'var(--white)',
};
