'use client';

import { useMemo, useState } from 'react';
import {
  FUNDABLE_COURSES,
  FUNDING_ROUTES,
  FEES,
  computeQuote,
  formatRand,
  NSFAS_HOUSEHOLD_THRESHOLD,
  type FundingRouteId,
} from '@/data/funding';
import { track } from '@/lib/analytics/events';

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

export function FundingCalculator() {
  const [courseId, setCourseId] = useState(FUNDABLE_COURSES[0]?.id ?? 'mddop');
  const [route, setRoute] = useState<FundingRouteId>('monthly');
  const fee = FEES[courseId];
  const [months, setMonths] = useState(fee?.maxMonths ?? 12);
  const [income, setIncome] = useState('');

  const [email, setEmail] = useState('');
  const [firstName, setFirstName] = useState('');
  const [phone, setPhone] = useState('');
  const [sending, setSending] = useState(false);
  const [paying, setPaying] = useState(false);
  const [done, setDone] = useState(false);
  const [bursary, setBursary] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const quote = useMemo(
    () => computeQuote({ courseId, route, months }),
    [courseId, route, months]
  );

  const depositRoute = route === 'upfront' || route === 'monthly';
  const showIncome = route === 'nsfas';

  function onCourseChange(id: string) {
    setCourseId(id);
    const max = FEES[id]?.maxMonths ?? 12;
    setMonths((m) => Math.min(m, max));
    setDone(false);
  }

  async function submitQuote(e: React.FormEvent) {
    e.preventDefault();
    setError(null);
    setSending(true);
    track('funding_quote_submitted', { courseId, route, months });
    try {
      const res = await fetch('/api/funding/quote', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          route,
          months: route === 'monthly' ? months : undefined,
          email,
          firstName: firstName || undefined,
          phone: phone || undefined,
          householdIncome: income ? Number(income) : undefined,
          ...getAnonIds(),
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError(json.error === 'rate_limited' ? 'Too many requests — try again shortly.' : 'Something went wrong. Please try again.');
        return;
      }
      setBursary(Boolean(json.bursaryFlag));
      setDone(true);
    } catch {
      setError('Network error. Please try again.');
    } finally {
      setSending(false);
    }
  }

  async function payDeposit() {
    if (!email) {
      setError('Enter your email first so we can send your receipt.');
      return;
    }
    setError(null);
    setPaying(true);
    track('deposit_clicked', { courseId, route });
    try {
      const [fn, ...rest] = firstName.trim().split(' ');
      const res = await fetch('/api/payments/payfast', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          courseId,
          route,
          months: route === 'monthly' ? months : undefined,
          email,
          firstName: fn || undefined,
          lastName: rest.join(' ') || undefined,
        }),
      });
      const json = await res.json();
      if (!res.ok) {
        setError('Could not start payment. Please try again.');
        return;
      }
      if (json.mocked || !json.fields || Object.keys(json.fields).length === 0) {
        window.location.href = json.action;
        return;
      }
      // Build and submit a Payfast form
      const form = document.createElement('form');
      form.method = 'POST';
      form.action = json.action;
      for (const [k, v] of Object.entries(json.fields as Record<string, string>)) {
        const input = document.createElement('input');
        input.type = 'hidden';
        input.name = k;
        input.value = v;
        form.appendChild(input);
      }
      document.body.appendChild(form);
      form.submit();
    } catch {
      setError('Network error. Please try again.');
      setPaying(false);
    }
  }

  return (
    <section className="section section-paper" data-screen-label="Funding calculator">
      <div className="page" style={{ maxWidth: 980 }}>
        <span className="section-label">
          <span className="bar" />
          FEES & FUNDING · ZAR · {new Date().getFullYear()}
        </span>
        <h1 className="t-h2" style={{ marginTop: 14, marginBottom: 8 }}>
          What will it cost — and how do you pay?
        </h1>
        <p className="t-body-lg" style={{ maxWidth: 620, marginBottom: 28 }}>
          Choose a programme and a way to pay. We&apos;ll show you the exact numbers, check whether
          you qualify for funding, and let you secure your seat with a deposit today.
        </p>

        <div className="apply-grid">
          <div className="apply-card">
            {/* Programme */}
            <h2 className="apply-section-h">1 · Choose a programme</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 6, marginTop: 10 }}>
              {FUNDABLE_COURSES.map((c) => (
                <button
                  key={c.id}
                  type="button"
                  className={`filter-chip ${courseId === c.id ? 'is-active' : ''}`}
                  onClick={() => onCourseChange(c.id)}
                >
                  {c.title}
                </button>
              ))}
            </div>

            {/* Route */}
            <h2 className="apply-section-h" style={{ marginTop: 28 }}>2 · How would you like to pay?</h2>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 12 }}>
              {FUNDING_ROUTES.map((r) => (
                <label
                  key={r.id}
                  style={{
                    padding: 14,
                    border: `1px solid ${route === r.id ? 'var(--blue-500)' : 'var(--line-on-light-2)'}`,
                    borderRadius: 10,
                    background: route === r.id ? 'rgba(45,111,247,0.04)' : 'var(--white)',
                    cursor: 'pointer',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 4,
                  }}
                >
                  <span style={{ display: 'inline-flex', alignItems: 'center', gap: 8, fontSize: 15, fontWeight: 500 }}>
                    <input
                      type="radio"
                      name="route"
                      checked={route === r.id}
                      onChange={() => {
                        setRoute(r.id);
                        setDone(false);
                      }}
                      style={{ accentColor: 'var(--blue-500)' }}
                    />
                    {r.label}
                  </span>
                  <span className="hint" style={{ marginLeft: 24 }}>{r.blurb}</span>
                </label>
              ))}
            </div>

            {/* Monthly term */}
            {route === 'monthly' && fee && (
              <div style={{ marginTop: 20 }}>
                <label className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>
                  REPAYMENT TERM · {months} MONTHS
                </label>
                <input
                  type="range"
                  min={Math.min(3, fee.maxMonths)}
                  max={fee.maxMonths}
                  value={months}
                  onChange={(e) => setMonths(Number(e.target.value))}
                  style={{ width: '100%', accentColor: 'var(--blue-500)', marginTop: 8 }}
                />
              </div>
            )}

            {/* Income (bursary screening) */}
            {showIncome && (
              <div className="apply-field" style={{ marginTop: 20 }}>
                <label><span>ANNUAL HOUSEHOLD INCOME (ZAR)</span></label>
                <input
                  type="number"
                  inputMode="numeric"
                  placeholder="e.g. 240000"
                  value={income}
                  onChange={(e) => setIncome(e.target.value)}
                />
                <span className="hint">
                  Households under {formatRand(NSFAS_HOUSEHOLD_THRESHOLD)}/year often qualify for support.
                </span>
              </div>
            )}
          </div>

          {/* Breakdown + capture */}
          <aside className="apply-side">
            <div className="aside-card">
              <span className="aside-k">YOUR ESTIMATE</span>
              <h3 className="aside-h" style={{ marginTop: 6 }}>{quote?.courseTitle}</h3>
              {quote && (
                <div style={{ marginTop: 8 }}>
                  <div className="aside-row"><span>Full programme fee</span><span style={{ fontWeight: 500 }}>{formatRand(quote.total)}</span></div>
                  {quote.route === 'upfront' && (
                    <>
                      <div className="aside-row"><span>Upfront discount</span><span style={{ color: 'var(--cyan-500)' }}>−{formatRand(quote.discount)}</span></div>
                      <div className="aside-row"><span style={{ fontWeight: 600 }}>You pay</span><span style={{ fontWeight: 600 }}>{formatRand(quote.payable)}</span></div>
                    </>
                  )}
                  {quote.route === 'monthly' && quote.monthly && quote.months && (
                    <>
                      <div className="aside-row"><span>Deposit to secure seat</span><span style={{ fontWeight: 500 }}>{formatRand(quote.deposit)}</span></div>
                      <div className="aside-row"><span style={{ fontWeight: 600 }}>Then per month</span><span style={{ fontWeight: 600 }}>{quote.months} × {formatRand(quote.monthly)}</span></div>
                    </>
                  )}
                  {(quote.route === 'employer' || quote.route === 'nsfas' || quote.route === 'seta') && (
                    <div className="aside-row"><span>Deposit to secure seat</span><span style={{ fontWeight: 500 }}>{formatRand(quote.deposit)}</span></div>
                  )}
                </div>
              )}
            </div>

            {!done ? (
              <form className="aside-card" onSubmit={submitQuote}>
                <span className="aside-k">EMAIL ME THIS BREAKDOWN</span>
                <div style={{ display: 'flex', flexDirection: 'column', gap: 8, marginTop: 10 }}>
                  <input
                    type="text"
                    placeholder="First name"
                    value={firstName}
                    onChange={(e) => setFirstName(e.target.value)}
                    style={inputStyle}
                  />
                  <input
                    type="email"
                    required
                    placeholder="Email address"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    style={inputStyle}
                  />
                  <input
                    type="tel"
                    placeholder="WhatsApp number (optional)"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value)}
                    style={inputStyle}
                  />
                </div>
                {error && <div className="apply-banner apply-banner-error" role="alert" style={{ marginTop: 10 }}>{error}</div>}
                <button type="submit" className="btn btn-primary" style={{ width: '100%', marginTop: 12 }} disabled={sending}>
                  {sending ? 'Sending…' : 'Send my estimate →'}
                </button>
              </form>
            ) : (
              <div className="aside-card">
                <span className="pill pill-blue"><span className="dot" />SENT TO {email}</span>
                <p style={{ fontSize: 14, marginTop: 12, lineHeight: 1.5 }}>
                  {bursary
                    ? 'Based on what you told us, you may qualify for funding — admissions will be in touch.'
                    : 'Check your inbox for the full breakdown.'}
                </p>
              </div>
            )}

            {depositRoute && quote && (
              <div className="aside-card aside-aida">
                <span className="aside-k" style={{ color: 'var(--ink-on-dark-3)' }}>SECURE YOUR SEAT</span>
                <p style={{ fontSize: 14, marginTop: 8, marginBottom: 12, lineHeight: 1.5 }}>
                  Pay {route === 'upfront' ? formatRand(quote.payable) : `your ${formatRand(quote.deposit)} deposit`} now to
                  lock your place in the next intake. Secured by Payfast.
                </p>
                <button type="button" className="btn btn-primary" style={{ width: '100%' }} onClick={payDeposit} disabled={paying}>
                  {paying ? 'Redirecting…' : `Pay ${route === 'upfront' ? formatRand(quote.payable) : formatRand(quote.deposit)} →`}
                </button>
              </div>
            )}
          </aside>
        </div>

        <p className="t-mono-xs" style={{ color: 'var(--ink-4)', marginTop: 20 }}>
          Figures are indicative and confirmed on enrolment. Deposits are credited to your fees.
        </p>
      </div>
    </section>
  );
}

const inputStyle: React.CSSProperties = {
  width: '100%',
  padding: '10px 12px',
  border: '1px solid var(--line-on-light-2)',
  borderRadius: 8,
  fontSize: 14,
  background: 'var(--white)',
};
