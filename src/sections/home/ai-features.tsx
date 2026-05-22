import type { ReactNode } from 'react';

function AidaPreviewMini() {
  return (
    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8, height: '100%' }}>
      <div
        style={{
          alignSelf: 'flex-start',
          padding: '8px 10px',
          borderRadius: 10,
          background: 'rgba(255,255,255,0.04)',
          border: '1px solid var(--line-on-dark)',
          fontSize: 12,
          maxWidth: '75%',
        }}
      >
        Where are you in your journey?
      </div>
      <div
        style={{
          alignSelf: 'flex-end',
          padding: '8px 10px',
          borderRadius: 10,
          background: 'var(--blue-500)',
          color: 'white',
          fontSize: 12,
          maxWidth: '70%',
        }}
      >
        Changing careers from sales
      </div>
      <div
        style={{
          alignSelf: 'flex-start',
          padding: '8px 10px',
          borderRadius: 10,
          background: 'rgba(61,217,214,0.08)',
          border: '1px solid rgba(61,217,214,0.28)',
          fontSize: 12,
          maxWidth: '85%',
          color: 'var(--cyan-400)',
        }}
      >
        → Part-time MDDOP (18mo) · 92% fit
      </div>
    </div>
  );
}

function MatchScorePreview() {
  const data = [
    { label: 'Architectural Draughtsperson', score: 96 },
    { label: 'BIM Coordinator', score: 78 },
    { label: 'Steel Detailer', score: 64 },
  ];
  return (
    <div
      style={{
        padding: 14,
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        height: '100%',
        justifyContent: 'center',
      }}
    >
      {data.map((d, i) => (
        <div key={d.label}>
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 4,
            }}
          >
            <span style={{ fontSize: 12, fontWeight: 500 }}>{d.label}</span>
            <span
              className="t-mono-sm"
              style={{ color: i === 0 ? 'var(--cyan-400)' : 'var(--ink-on-dark-3)' }}
            >
              {d.score}%
            </span>
          </div>
          <div
            style={{
              height: 4,
              background: 'var(--line-on-dark)',
              borderRadius: 999,
              overflow: 'hidden',
            }}
          >
            <div
              style={{
                height: '100%',
                width: `${d.score}%`,
                background: i === 0 ? 'var(--cyan-400)' : 'var(--blue-500)',
                borderRadius: 999,
              }}
            />
          </div>
        </div>
      ))}
    </div>
  );
}

function RecMini() {
  return (
    <div
      style={{
        padding: 12,
        display: 'flex',
        flexDirection: 'column',
        gap: 6,
        height: '100%',
        justifyContent: 'center',
      }}
    >
      {['AutoCAD Essentials', 'Revit Architecture', 'Inventor for Mechanical'].map((s, i) => (
        <div
          key={s}
          style={{
            display: 'flex',
            justifyContent: 'space-between',
            alignItems: 'center',
            padding: '8px 10px',
            background: i === 0 ? 'rgba(45,111,247,0.1)' : 'rgba(255,255,255,0.02)',
            border: `1px solid ${i === 0 ? 'rgba(45,111,247,0.4)' : 'var(--line-on-dark)'}`,
            borderRadius: 6,
            fontSize: 12,
          }}
        >
          <span>{s}</span>
          <span
            className="t-mono-xs"
            style={{ color: i === 0 ? 'var(--cyan-400)' : 'var(--ink-on-dark-3)' }}
          >
            {i === 0 ? '★ TOP' : '—'}
          </span>
        </div>
      ))}
    </div>
  );
}

function FormMini() {
  return (
    <div
      style={{
        padding: 14,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 8,
        justifyContent: 'center',
      }}
    >
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span className="t-mono-xs" style={{ color: 'var(--ink-on-dark-3)' }}>
          STEP 2 / 4
        </span>
        <span className="t-mono-xs" style={{ color: 'var(--cyan-400)' }}>
          OCR · 3 OF 3 PARSED
        </span>
      </div>
      <div
        style={{
          height: 4,
          background: 'var(--line-on-dark)',
          borderRadius: 999,
          overflow: 'hidden',
        }}
      >
        <div style={{ height: '100%', width: '50%', background: 'var(--blue-500)' }} />
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6 }}>
        {['ID NUMBER', 'MATRIC YEAR'].map((l, i) => (
          <div
            key={l}
            style={{
              padding: 8,
              border: '1px solid var(--line-on-dark)',
              borderRadius: 6,
              background: 'rgba(0,0,0,0.16)',
            }}
          >
            <span className="t-mono-xs" style={{ color: 'var(--ink-on-dark-3)' }}>
              {l}
            </span>
            <div style={{ fontFamily: 'var(--font-mono)', fontSize: 13, marginTop: 2 }}>
              {i === 0 ? '••••08···6' : '2024'}
              <span style={{ color: 'var(--cyan-400)', marginLeft: 4 }}>✓</span>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}

function IntelMini() {
  return (
    <div
      style={{
        padding: 14,
        height: '100%',
        display: 'flex',
        flexDirection: 'column',
        gap: 10,
        justifyContent: 'center',
      }}
    >
      <div>
        <span className="t-mono-xs" style={{ color: 'var(--ink-on-dark-3)' }}>
          MEDIAN · GAUTENG
        </span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em' }}>R 28 400</span>
          <span className="t-mono-sm" style={{ color: 'var(--cyan-400)' }}>
            ↑ 4.2%
          </span>
        </div>
      </div>
      <svg viewBox="0 0 200 50" width="100%" height="50" aria-hidden="true">
        <polyline
          points="0,40 25,38 50,32 75,28 100,30 125,22 150,18 175,12 200,8"
          fill="none"
          stroke="var(--cyan-400)"
          strokeWidth="1.5"
        />
        <polyline
          points="0,50 25,50 50,50 75,50 100,50 125,50 150,50 175,50 200,50"
          fill="none"
          stroke="var(--line-on-dark)"
          strokeWidth="0.5"
        />
      </svg>
    </div>
  );
}

function AICard({
  grid,
  label,
  title,
  desc,
  visual,
}: {
  grid: string;
  label: string;
  title: string;
  desc: string;
  visual: ReactNode;
}) {
  return (
    <article className={`ai-card ${grid}`}>
      <span className="ai-label">{label}</span>
      <h3 className="ai-title">{title}</h3>
      <p className="ai-desc">{desc}</p>
      <div className="ai-visual">{visual}</div>
    </article>
  );
}

export function AIFeaturesSection() {
  return (
    <section className="section section-darker" data-screen-label="02 How We Teach">
      <div className="page">
        <div className="sec-head">
          <div className="sec-head-meta">
            <span className="section-label">
              <span className="bar" />
              SECTION 02 / HOW WE TEACH
            </span>
            <h2 className="sec-head-title">
              An academy built around{' '}
              <em style={{ color: 'var(--cyan-400)', fontStyle: 'italic', fontWeight: 400 }}>
                the way drawing offices work
              </em>
              .
            </h2>
          </div>
          <p className="sec-head-sub">
            We don&apos;t do motivation posters. Every part of the academy — admissions, curriculum,
            faculty, software stack, examination — is built backwards from the standards South
            African engineering and design offices demand on first-week deliverables.
          </p>
        </div>

        <div className="ai-grid">
          <AICard
            grid="ai-card-wide"
            label="01 / ADMISSIONS"
            title="Personal Admissions Assistant"
            desc="Have a conversation with our admissions team — or with AIDA, our 24/7 chat assistant. Either way, you get matched to the right pathway and your application is prefilled from the conversation."
            visual={<AidaPreviewMini />}
          />
          <AICard
            grid="ai-card-wide"
            label="02 / CAREER COUNSEL"
            title="Career Counsellor"
            desc="A guided matcher that scores you against 8 draughting career paths — Architectural, Mechanical, Civil, Steel Detailing, MEP, BIM Coordination, Construction Documentation, Design Office Lead."
            visual={<MatchScorePreview />}
          />
          <AICard
            grid="ai-card-third"
            label="03 / RECOMMENDER"
            title="Programme Recommender"
            desc="Filter across mode, software, and outcome to find the right module stack for you."
            visual={<RecMini />}
          />
          <AICard
            grid="ai-card-third"
            label="04 / APPLICATION"
            title="Streamlined Application"
            desc="Document upload with field parsing, autofill, and real-time eligibility checks."
            visual={<FormMini />}
          />
          <AICard
            grid="ai-card-third"
            label="05 / OUTLOOK"
            title="Industry Outlook & Salaries"
            desc="Salary bands, regional demand, hiring trends and software requirements — updated quarterly."
            visual={<IntelMini />}
          />
        </div>
      </div>
    </section>
  );
}
