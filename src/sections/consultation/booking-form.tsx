'use client';

import { useState } from 'react';
import { FUNDABLE_COURSES } from '@/data/funding';
import { track } from '@/lib/analytics/events';

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid var(--line-on-light-2)',
  borderRadius: 8,
  fontSize: 14,
  background: 'var(--white)',
};

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

export function BookingForm({
  defaultCampus = 'Johannesburg',
  heading = 'Book a campus tour or consultation',
}: {
  defaultCampus?: 'Johannesburg' | 'Durban' | 'Online';
  heading?: string;
}) {
  const [firstName, setFirstName] = useState('');
  const [email, setEmail] = useState('');
  const [phone, setPhone] = useState('');
  const [campus, setCampus] = useState(defaultCampus);
  const [preferredDate, setPreferredDate] = useState('');
  const [preferredTime, setPreferredTime] = useState('');
  const [interest, setInterest] = useState('');
  const [message, setMessage] = useState('');
  const [busy, setBusy] = useState(false);
  const [done, setDone] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setBusy(true);
    track('consultation_submit', { campus });
    try {
      const res = await fetch('/api/consultation', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          firstName,
          email,
          phone,
          campus,
          preferredDate: preferredDate || undefined,
          preferredTime: preferredTime || undefined,
          interest: interest || undefined,
          message: message || undefined,
          ...getAnonIds(),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
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

  if (done) {
    return (
      <div className="apply-card" style={{ padding: 32 }}>
        <span className="pill pill-blue"><span className="dot" />REQUEST RECEIVED</span>
        <h3 className="t-h3" style={{ marginTop: 14, marginBottom: 8 }}>You&apos;re booked in.</h3>
        <p className="t-body">
          Admissions will confirm your {campus} consultation by email or WhatsApp — usually within
          one business day. Check your inbox for confirmation.
        </p>
      </div>
    );
  }

  return (
    <form className="apply-card" style={{ padding: 28 }} onSubmit={submit}>
      <h3 className="apply-section-h">{heading}</h3>
      <p className="apply-section-sub">No obligation — just a chat about your goals, fees and the right pathway.</p>
      <div className="apply-fields" style={{ marginTop: 14 }}>
        <div className="apply-field">
          <label><span>FIRST NAME <span className="req">REQ</span></span></label>
          <input value={firstName} onChange={(e) => setFirstName(e.target.value)} required style={inputStyle} />
        </div>
        <div className="apply-field">
          <label><span>EMAIL <span className="req">REQ</span></span></label>
          <input type="email" value={email} onChange={(e) => setEmail(e.target.value)} required style={inputStyle} />
        </div>
        <div className="apply-field">
          <label><span>WHATSAPP / MOBILE <span className="req">REQ</span></span></label>
          <input type="tel" value={phone} onChange={(e) => setPhone(e.target.value)} required style={inputStyle} />
        </div>
        <div className="apply-field">
          <label><span>CAMPUS</span></label>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['Johannesburg', 'Durban', 'Online'] as const).map((c) => (
              <button
                key={c}
                type="button"
                className={`filter-chip ${campus === c ? 'is-active' : ''}`}
                style={{ flex: 1 }}
                onClick={() => setCampus(c)}
              >
                {c}
              </button>
            ))}
          </div>
        </div>
        <div className="apply-field">
          <label><span>PREFERRED DAY</span></label>
          <input
            type="text"
            placeholder="e.g. next Tuesday"
            value={preferredDate}
            onChange={(e) => setPreferredDate(e.target.value)}
            style={inputStyle}
          />
        </div>
        <div className="apply-field">
          <label><span>PREFERRED TIME</span></label>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['morning', 'afternoon', 'evening'] as const).map((t) => (
              <button
                key={t}
                type="button"
                className={`filter-chip ${preferredTime === t ? 'is-active' : ''}`}
                style={{ flex: 1, textTransform: 'capitalize' }}
                onClick={() => setPreferredTime(preferredTime === t ? '' : t)}
              >
                {t}
              </button>
            ))}
          </div>
        </div>
        <div className="apply-field">
          <label><span>INTERESTED IN</span></label>
          <select value={interest} onChange={(e) => setInterest(e.target.value)} style={inputStyle}>
            <option value="">Not sure yet</option>
            {FUNDABLE_COURSES.map((c) => (
              <option key={c.id} value={c.id}>{c.title}</option>
            ))}
          </select>
        </div>
        <div className="apply-field">
          <label><span>ANYTHING ELSE?</span></label>
          <textarea
            value={message}
            onChange={(e) => setMessage(e.target.value)}
            rows={3}
            style={{ ...inputStyle, resize: 'vertical' }}
          />
        </div>
      </div>
      {error && <div className="apply-banner apply-banner-error" role="alert" style={{ marginTop: 12 }}>{error}</div>}
      <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 16 }} disabled={busy}>
        {busy ? 'Sending…' : 'Request my consultation →'}
      </button>
    </form>
  );
}
