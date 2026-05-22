export function OutcomesSection() {
  return (
    <section className="section section-paper" data-screen-label="05 Outcomes">
      <div className="page">
        <div className="sec-head">
          <div className="sec-head-meta">
            <span className="section-label">
              <span className="bar" />
              SECTION 05 / OUTCOMES
            </span>
            <h2 className="sec-head-title">
              We don&apos;t do motivation posters.
              <br />
              <em style={{ color: 'var(--blue-500)', fontStyle: 'italic', fontWeight: 400 }}>
                We measure.
              </em>
            </h2>
          </div>
          <p className="sec-head-sub">
            What employers actually value: accuracy, drawing office discipline, real-software
            fluency, and a portfolio of work that looks like the work they do. We optimize for those
            — not slogans.
          </p>
        </div>

        <div className="outcomes-grid">
          <div className="outcome-stat">
            <div className="outcome-stat-value">
              96<span style={{ color: 'var(--ink-3)', fontSize: '54%' }}>%</span>
            </div>
            <span className="outcome-stat-label">Programme Completion</span>
            <span className="outcome-stat-meta">MDDOP N4/N5 · 2024 cohort</span>
          </div>
          <div className="outcome-stat">
            <div className="outcome-stat-value">
              87<span style={{ color: 'var(--ink-3)', fontSize: '54%' }}>%</span>
            </div>
            <span className="outcome-stat-label">Job Placement · 12mo</span>
            <span className="outcome-stat-meta">Self-reported graduate survey</span>
          </div>
          <div className="outcome-stat">
            <div className="outcome-stat-value">8</div>
            <span className="outcome-stat-label">Career Pathways</span>
            <span className="outcome-stat-meta">Mapped to live demand</span>
          </div>
          <div className="outcome-stat">
            <div className="outcome-stat-value">
              R28K<span style={{ color: 'var(--ink-3)', fontSize: '40%' }}>/mo</span>
            </div>
            <span className="outcome-stat-label">Median Entry Salary</span>
            <span className="outcome-stat-meta">Gauteng · Q2 2026 · Statistical Median</span>
          </div>
        </div>

        <p className="t-mono-xs" style={{ color: 'var(--ink-4)', marginTop: 32, maxWidth: 720 }}>
          NOTE · OUTCOMES DEPEND ON INDIVIDUAL PERFORMANCE, ATTENDANCE AND MARKET CONDITIONS. THESE
          ARE COMPETENCE METRICS, NOT GUARANTEES. METHODOLOGY: ANNUAL GRADUATE SURVEY + LINKEDIN
          ATTESTATION + EMPLOYER CONFIRMATION SAMPLE.
        </p>
      </div>
    </section>
  );
}
