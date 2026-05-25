const ACCREDITATIONS = [
  { k: 'DHET', v: 'National framework', note: 'MDDOP N4/N5 examined nationally' },
  { k: 'SAQA', v: 'ID 66881', note: 'Registered qualification' },
  { k: 'QCTO', v: 'Aligned', note: 'Quality Council for Trades & Occupations' },
  { k: 'SETA', v: 'Learnerships', note: 'Discretionary-grant funding routes' },
];

/**
 * Trust wall of accreditation bodies — the single biggest credibility signal
 * in South African private education.
 */
export function AccreditationStrip() {
  return (
    <section className="section section-light" data-screen-label="Accreditation">
      <div className="page">
        <span className="section-label">
          <span className="bar" />
          ACCREDITATION & RECOGNITION
        </span>
        <h2 className="t-h2" style={{ marginTop: 12, marginBottom: 20, fontSize: 22 }}>
          Recognised qualifications — not a certificate of attendance.
        </h2>
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))',
            gap: 12,
          }}
        >
          {ACCREDITATIONS.map((a) => (
            <div
              key={a.k}
              style={{
                border: '1px solid var(--line-on-light-2)',
                borderRadius: 10,
                padding: 18,
                background: 'var(--white)',
              }}
            >
              <div className="t-mono-xs" style={{ color: 'var(--blue-500)', letterSpacing: '0.08em' }}>
                {a.k}
              </div>
              <div style={{ fontSize: 17, fontWeight: 600, marginTop: 6 }}>{a.v}</div>
              <div className="t-mono-xs" style={{ color: 'var(--ink-4)', marginTop: 6, lineHeight: 1.4 }}>
                {a.note}
              </div>
            </div>
          ))}
        </div>
        <p className="t-mono-xs" style={{ color: 'var(--ink-4)', marginTop: 16 }}>
          Registration details confirmed in writing on enrolment.
        </p>
      </div>
    </section>
  );
}
