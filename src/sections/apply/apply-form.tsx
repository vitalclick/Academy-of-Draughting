'use client';

import { useState } from 'react';
import { useAida } from '@/components/chrome/aida-context';

type ApplyData = {
  firstName: string;
  lastName: string;
  email: string;
  phone: string;
  idNumber: string;
  city: string;
  matricYear: string;
  programme: 'mddop' | 'bridging' | 'short';
  mode: 'Full-time' | 'Part-time' | 'Online';
  campus: 'Johannesburg' | 'Durban' | 'Online';
  fundingPlan: 'upfront' | 'monthly' | 'employer';
};

const STEPS = [
  { key: 'about', k: 'STEP 01', label: 'About you', desc: 'Identity & contact' },
  { key: 'pathway', k: 'STEP 02', label: 'Choose pathway', desc: 'Programme & mode' },
  { key: 'docs', k: 'STEP 03', label: 'Verify documents', desc: 'ID + matric · OCR' },
  { key: 'review', k: 'STEP 04', label: 'Review & submit', desc: '< 1 business day' },
] as const;

function WaIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.4 3.6A11.9 11.9 0 0 0 12 0C5.4 0 .1 5.3.1 11.9c0 2.1.6 4.1 1.6 5.9L0 24l6.4-1.7a11.9 11.9 0 0 0 5.6 1.4h.01c6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.5-8.2z" />
    </svg>
  );
}

function Field({
  label,
  req,
  v,
  onChange,
  auto,
  verified,
  type = 'text',
  hint,
  full,
}: {
  label: string;
  req?: boolean;
  v: string;
  onChange: (v: string) => void;
  auto?: boolean;
  verified?: boolean;
  type?: string;
  hint?: string;
  full?: boolean;
}) {
  return (
    <div className={`apply-field ${full ? 'full' : ''}`}>
      <label>
        <span>
          {label} {req && <span className="req">REQ</span>}
        </span>
        {auto && <span className="auto">⚡ PREFILLED</span>}
        {verified && (
          <span className="auto" style={{ color: 'var(--cyan-500)' }}>
            ✓ DOCUMENT VERIFIED
          </span>
        )}
      </label>
      <input type={type} value={v} onChange={(e) => onChange(e.target.value)} />
      {hint && <span className="hint">{hint}</span>}
    </div>
  );
}

function StepAbout({
  data,
  update,
}: {
  data: ApplyData;
  update: <K extends keyof ApplyData>(k: K, v: ApplyData[K]) => void;
}) {
  return (
    <>
      <h2 className="apply-section-h">Tell us about you</h2>
      <p className="apply-section-sub">
        We&apos;ll use this to verify your identity and route your application to the closest
        campus. We&apos;ve prefilled 6 fields from your earlier session — review and edit anything.
      </p>

      <div className="apply-fields">
        <Field label="FIRST NAME" req v={data.firstName} onChange={(v) => update('firstName', v)} auto />
        <Field label="LAST NAME" req v={data.lastName} onChange={(v) => update('lastName', v)} auto />
        <Field
          label="EMAIL"
          req
          v={data.email}
          onChange={(v) => update('email', v)}
          auto
          type="email"
          hint="We'll send a confirmation here"
        />
        <Field
          label="MOBILE"
          req
          v={data.phone}
          onChange={(v) => update('phone', v)}
          auto
          type="tel"
          hint="For WhatsApp follow-up"
        />
        <Field
          label="ID NUMBER"
          req
          v={data.idNumber}
          onChange={(v) => update('idNumber', v)}
          verified
          hint="SA ID · 13 digits"
        />
        <Field label="CITY" req v={data.city} onChange={(v) => update('city', v)} />
      </div>
    </>
  );
}

function StepPathway({
  data,
  update,
}: {
  data: ApplyData;
  update: <K extends keyof ApplyData>(k: K, v: ApplyData[K]) => void;
}) {
  const programmes = [
    {
      id: 'mddop' as const,
      title: 'MDDOP National Certificate',
      sub: 'N4/N5 · 10–18 months',
      meta: 'Flagship · DHET examined',
      rec: '96% fit',
    },
    {
      id: 'bridging' as const,
      title: 'Bridging Course',
      sub: '3–6 months',
      meta: 'No prerequisites',
      rec: 'Foundation',
    },
    {
      id: 'short' as const,
      title: 'Autodesk Short Courses',
      sub: '4–12 weeks',
      meta: 'AutoCAD · Revit · Inventor',
      rec: 'Stackable',
    },
  ];

  const fundings = [
    { id: 'upfront' as const, t: 'Upfront', sub: '15% discount applied', tag: 'BEST VALUE' },
    {
      id: 'monthly' as const,
      t: 'Monthly instalments',
      sub: '0% interest · no hidden fees',
      tag: 'POPULAR',
    },
    {
      id: 'employer' as const,
      t: 'Employer / sponsor',
      sub: 'Invoice direct to employer',
      tag: 'BUSINESS',
    },
  ];

  return (
    <>
      <h2 className="apply-section-h">Choose your pathway</h2>
      <p className="apply-section-sub">
        Based on your earlier responses, <strong style={{ color: 'var(--ink)' }}>MDDOP N4/N5</strong>{' '}
        is the closest match. You can change this — your application stays valid for 12 months.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {programmes.map((p) => (
          <label
            key={p.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '24px 1fr auto',
              gap: 14,
              padding: 18,
              border: `1px solid ${data.programme === p.id ? 'var(--blue-500)' : 'var(--line-on-light-2)'}`,
              borderRadius: 10,
              background: data.programme === p.id ? 'rgba(45,111,247,0.04)' : 'var(--white)',
              cursor: 'pointer',
              alignItems: 'center',
            }}
          >
            <input
              type="radio"
              name="programme"
              checked={data.programme === p.id}
              onChange={() => update('programme', p.id)}
              style={{ accentColor: 'var(--blue-500)', width: 18, height: 18 }}
            />
            <div>
              <div
                style={{
                  display: 'flex',
                  alignItems: 'baseline',
                  gap: 10,
                  flexWrap: 'wrap',
                }}
              >
                <span style={{ fontSize: 16, fontWeight: 500 }}>{p.title}</span>
                <span className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>
                  {p.sub}
                </span>
              </div>
              <div className="t-mono-xs" style={{ color: 'var(--ink-3)', marginTop: 4 }}>
                {p.meta}
              </div>
            </div>
            <span className="pill pill-blue">{p.rec}</span>
          </label>
        ))}
      </div>

      <h3 className="apply-section-h" style={{ marginTop: 32, fontSize: 17 }}>
        Study mode &amp; campus
      </h3>

      <div className="apply-fields" style={{ marginTop: 12 }}>
        <div className="apply-field">
          <label>
            <span>
              MODE <span className="req">REQ</span>
            </span>
          </label>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['Full-time', 'Part-time', 'Online'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => update('mode', m)}
                className={`filter-chip ${data.mode === m ? 'is-active' : ''}`}
                style={{ flex: 1 }}
              >
                {m}
              </button>
            ))}
          </div>
          <span className="hint">
            {data.mode === 'Full-time'
              ? '10 months · Mon–Fri 8am–3pm'
              : data.mode === 'Part-time'
                ? '18 months · 2 evenings + Saturday'
                : 'Self-paced · avg 8 months'}
          </span>
        </div>
        <div className="apply-field">
          <label>
            <span>
              CAMPUS <span className="req">REQ</span>
            </span>
          </label>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['Johannesburg', 'Durban', 'Online'] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => update('campus', c)}
                className={`filter-chip ${data.campus === c ? 'is-active' : ''}`}
                style={{ flex: 1 }}
              >
                {c}
              </button>
            ))}
          </div>
          <span className="hint">
            {data.campus === 'Online' ? 'Nationwide · live + recorded' : 'In-person, full facilities'}
          </span>
        </div>
      </div>

      <h3 id="funding" className="apply-section-h" style={{ marginTop: 32, fontSize: 17 }}>
        Funding
      </h3>
      <p className="apply-section-sub">Pick a plan. You can change this with admissions later.</p>

      <div className="apply-fields">
        {fundings.map((f) => (
          <label
            key={f.id}
            style={{
              padding: 16,
              border: `1px solid ${data.fundingPlan === f.id ? 'var(--blue-500)' : 'var(--line-on-light-2)'}`,
              borderRadius: 10,
              background: data.fundingPlan === f.id ? 'rgba(45,111,247,0.04)' : 'var(--white)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <span
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                alignItems: 'center',
                gap: 8,
              }}
            >
              <span
                style={{
                  fontSize: 14,
                  fontWeight: 500,
                  color: 'var(--ink)',
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: 8,
                }}
              >
                <input
                  type="radio"
                  name="funding"
                  checked={data.fundingPlan === f.id}
                  onChange={() => update('fundingPlan', f.id)}
                  style={{ accentColor: 'var(--blue-500)' }}
                />
                {f.t}
              </span>
              <span className="pill pill-light" style={{ fontSize: 9 }}>
                {f.tag}
              </span>
            </span>
            <span className="hint" style={{ marginLeft: 22 }}>
              {f.sub}
            </span>
          </label>
        ))}
      </div>
    </>
  );
}

function OcrCell({ k, v }: { k: string; v: string }) {
  return (
    <div className="ocr-field">
      <span className="ocr-field-k">{k}</span>
      <span className="ocr-field-v">
        {v}
        <span className="ocr-check">✓</span>
      </span>
    </div>
  );
}

function StepDocs() {
  return (
    <>
      <h2 className="apply-section-h">Verify documents</h2>
      <p className="apply-section-sub">
        Upload your ID and matric certificate. OCR parses fields automatically — review and confirm.
        We don&apos;t store images longer than 90 days.
      </p>

      <div className="ocr-zone">
        <span className="pill pill-blue" style={{ fontSize: 10 }}>
          <span className="dot" />
          DOCUMENTS PARSED
        </span>
        <strong>matric_certificate.pdf · ID_thandi.jpg</strong>
        <p>2 files · 4.2 MB · uploaded 14 May 2026 · 09:14</p>
        <div style={{ display: 'flex', gap: 8, marginTop: 6 }}>
          <button type="button" className="btn btn-sm btn-ghost-light">
            Replace
          </button>
          <button type="button" className="btn btn-sm btn-ghost-light">
            Add another
          </button>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          marginTop: 24,
          marginBottom: 10,
        }}
      >
        <h3 className="apply-section-h" style={{ fontSize: 15, margin: 0 }}>
          Parsed fields
        </h3>
        <span className="t-mono-xs" style={{ color: 'var(--cyan-500)' }}>
          ✓ 6 OF 6 EXTRACTED · 100% CONFIDENCE
        </span>
      </div>

      <div className="ocr-parsed">
        <OcrCell k="FULL NAME" v="Thandi Mokoena" />
        <OcrCell k="ID NUMBER" v="040826•••••84" />
        <OcrCell k="DATE OF BIRTH" v="26 AUG 2004" />
        <OcrCell k="MATRIC YEAR" v="2024" />
        <OcrCell k="HIGH SCHOOL" v="St. Anne's College" />
        <OcrCell k="AGGREGATE" v="L5 · Bachelor's pass" />
      </div>

      <div
        style={{
          marginTop: 18,
          padding: 14,
          background: 'rgba(45,111,247,0.05)',
          border: '1px solid rgba(45,111,247,0.28)',
          borderRadius: 8,
          display: 'flex',
          gap: 12,
          alignItems: 'flex-start',
        }}
      >
        <span className="pill pill-blue" style={{ fontSize: 9, height: 20 }}>
          NOTE
        </span>
        <div>
          <div className="t-mono-xs" style={{ color: 'var(--blue-700)' }}>
            ELIGIBILITY · CONFIRMED
          </div>
          <p
            style={{
              fontSize: 13.5,
              margin: '4px 0 0',
              color: 'var(--ink-2)',
              lineHeight: 1.5,
            }}
          >
            You meet entry requirements for MDDOP N4/N5. With L5 maths and a Bachelor&apos;s pass
            you&apos;re a strong fit — no bridging required.
          </p>
        </div>
      </div>
    </>
  );
}

function ReviewRow({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '160px 1fr auto',
        gap: 16,
        padding: '14px 0',
        borderTop: '1px solid var(--line-on-light-2)',
        alignItems: 'flex-start',
      }}
    >
      <span className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>
        {title.toUpperCase()}
      </span>
      <div style={{ fontSize: 14, color: 'var(--ink)' }}>{children}</div>
      <button type="button" className="btn btn-sm btn-ghost-light">
        Edit
      </button>
    </div>
  );
}

function StepReview({ data }: { data: ApplyData }) {
  return (
    <>
      <h2 className="apply-section-h">Review &amp; submit</h2>
      <p className="apply-section-sub">
        Everything looks right? Submit and you&apos;ll get an email + WhatsApp confirmation.
        Decision within one business day.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        <ReviewRow title="About you">
          <div>
            {data.firstName} {data.lastName}
          </div>
          <div className="t-mono-sm" style={{ color: 'var(--ink-3)' }}>
            {data.email} · {data.phone}
          </div>
          <div className="t-mono-sm" style={{ color: 'var(--ink-3)' }}>
            {data.idNumber} · {data.city}
          </div>
        </ReviewRow>
        <ReviewRow title="Pathway">
          <div>
            <strong style={{ fontWeight: 500 }}>MDDOP National Certificate (N4/N5)</strong>
          </div>
          <div className="t-mono-sm" style={{ color: 'var(--ink-3)' }}>
            {data.mode} · {data.campus} campus · Jan 2026 intake
          </div>
        </ReviewRow>
        <ReviewRow title="Documents">
          <div>matric_certificate.pdf · ID_thandi.jpg</div>
          <div className="t-mono-sm" style={{ color: 'var(--cyan-500)' }}>
            ✓ OCR verified · 6 of 6 fields
          </div>
        </ReviewRow>
        <ReviewRow title="Funding">
          <div>Monthly instalments · 0% interest</div>
          <div className="t-mono-sm" style={{ color: 'var(--ink-3)' }}>
            You can switch this with admissions later
          </div>
        </ReviewRow>
      </div>

      <div
        style={{
          marginTop: 24,
          padding: 14,
          border: '1px solid var(--line-on-light-2)',
          borderRadius: 8,
          fontSize: 13,
          color: 'var(--ink-3)',
          lineHeight: 1.5,
        }}
      >
        By submitting, you agree to the{' '}
        <a href="/popia" style={{ color: 'var(--blue-500)' }}>
          POPIA notice
        </a>{' '}
        and the Academy&apos;s{' '}
        <a href="/terms" style={{ color: 'var(--blue-500)' }}>
          terms of enrollment
        </a>
        . We never share your details with third parties.
      </div>
    </>
  );
}

function ApplyAsideAida({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="aside-card aside-aida">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span className="aida-avatar" style={{ width: 28, height: 28 }}>
          <span className="ai-dot" />
        </span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Admissions support</div>
          <div className="t-mono-xs" style={{ color: 'var(--ink-on-dark-3)' }}>
            ONLINE · USUALLY REPLIES IN &lt;1 MIN
          </div>
        </div>
      </div>
      <div className="aside-aida-msg">
        You&apos;ve got a strong profile for MDDOP. Want to add the Revit Architecture short course
        in May? It pairs well — and 84% of matching career paths use it.
      </div>
      <button
        type="button"
        className="btn btn-sm btn-primary"
        style={{ width: '100%' }}
        onClick={onOpen}
      >
        Open admissions chat
      </button>
    </div>
  );
}

function ApplyAsideSummary({ data }: { data: ApplyData }) {
  return (
    <div className="aside-card">
      <span className="aside-k">YOUR APPLICATION · DRAFT</span>
      <h3 className="aside-h" style={{ marginTop: 6 }}>
        Application summary
      </h3>
      <div>
        <div className="aside-row">
          <span>Programme</span>
          <span style={{ fontWeight: 500 }}>MDDOP N4/N5</span>
        </div>
        <div className="aside-row">
          <span>Mode</span>
          <span>{data.mode}</span>
        </div>
        <div className="aside-row">
          <span>Campus</span>
          <span>{data.campus}</span>
        </div>
        <div className="aside-row">
          <span>Intake</span>
          <span>Jan 2026</span>
        </div>
        <div className="aside-row">
          <span>Funding</span>
          <span>Monthly · 0%</span>
        </div>
      </div>
      <div
        style={{
          marginTop: 14,
          padding: 12,
          background: 'var(--paper)',
          borderRadius: 8,
          fontSize: 12.5,
          color: 'var(--ink-3)',
          lineHeight: 1.5,
        }}
      >
        Estimated monthly: <strong style={{ color: 'var(--ink)' }}>R 3,950</strong> × 10 months · no
        hidden fees.
      </div>
    </div>
  );
}

function ApplyAsideHelp() {
  return (
    <div className="aside-card">
      <span className="aside-k">HELP</span>
      <h3 className="aside-h" style={{ marginTop: 6 }}>
        Stuck? Talk to a human.
      </h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
        <a
          href="https://wa.me/27681100746"
          className="btn btn-sm btn-ghost-light"
          style={{ justifyContent: 'flex-start' }}
        >
          <WaIcon /> WhatsApp Johannesburg
        </a>
        <a
          href="https://wa.me/27681100746"
          className="btn btn-sm btn-ghost-light"
          style={{ justifyContent: 'flex-start' }}
        >
          <WaIcon /> WhatsApp Durban
        </a>
        <a href="tel:+27681100746" className="btn btn-sm btn-ghost-light" style={{ justifyContent: 'flex-start' }}>
          +27 68 110 0746
        </a>
      </div>
    </div>
  );
}

export function ApplyForm() {
  const [step, setStep] = useState(0);
  const aida = useAida();
  const [data, setData] = useState<ApplyData>({
    firstName: 'Thandi',
    lastName: 'Mokoena',
    email: 'thandi.m@email.com',
    phone: '+27 82 555 0184',
    idNumber: '0408265104084',
    city: 'Johannesburg',
    matricYear: '2024',
    programme: 'mddop',
    mode: 'Full-time',
    campus: 'Johannesburg',
    fundingPlan: 'monthly',
  });

  const update = <K extends keyof ApplyData>(k: K, v: ApplyData[K]) =>
    setData((d) => ({ ...d, [k]: v }));

  return (
    <section
      className="section section-paper"
      data-screen-label={`02 Apply · ${STEPS[step].label}`}
    >
      <div className="page">
        <div className="apply-grid">
          <div className="apply-card">
            <div className="apply-stepper">
              {STEPS.map((s, i) => (
                <button
                  key={s.key}
                  type="button"
                  className={`apply-step ${i === step ? 'is-active' : ''} ${i < step ? 'is-done' : ''}`}
                  onClick={() => setStep(i)}
                >
                  <span className="apply-step-num">{i < step ? '✓' : i + 1}</span>
                  <span className="apply-step-label">
                    <span className="apply-step-label-k">{s.k}</span>
                    <span className="apply-step-label-t">{s.label}</span>
                  </span>
                </button>
              ))}
            </div>

            <div className="apply-body">
              {step === 0 && <StepAbout data={data} update={update} />}
              {step === 1 && <StepPathway data={data} update={update} />}
              {step === 2 && <StepDocs />}
              {step === 3 && <StepReview data={data} />}
            </div>

            <div className="apply-actions">
              <button
                type="button"
                className="btn btn-ghost-light"
                disabled={step === 0}
                onClick={() => setStep((s) => Math.max(0, s - 1))}
                style={{ opacity: step === 0 ? 0.4 : 1 }}
              >
                ← Back
              </button>
              <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                <span className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>
                  AUTOSAVED · 09:14
                </span>
                {step < STEPS.length - 1 ? (
                  <button
                    type="button"
                    className="btn btn-primary"
                    onClick={() => setStep((s) => Math.min(STEPS.length - 1, s + 1))}
                  >
                    Continue{' '}
                    <span className="arr" aria-hidden="true">
                      →
                    </span>
                  </button>
                ) : (
                  <button type="button" className="btn btn-primary">
                    Submit application →
                  </button>
                )}
              </div>
            </div>
          </div>

          <aside className="apply-side">
            <ApplyAsideAida onOpen={() => aida.setOpen(true)} />
            <ApplyAsideSummary data={data} />
            <ApplyAsideHelp />
          </aside>
        </div>
      </div>
    </section>
  );
}
