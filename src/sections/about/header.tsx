export function AboutHeader() {
  return (
    <section className="page-header" data-screen-label="01 About Header">
      <div className="page ph-inner">
        <div>
          <div className="ph-eyebrow">
            <span className="pill pill-blue-dark">
              <span className="dot" />
              FOUNDED 1981 · JOHANNESBURG
            </span>
            <span className="t-mono-xs" style={{ color: 'var(--ink-on-dark-3)' }}>
              45 YEARS · 2 CAMPUSES · 1 SPECIALTY
            </span>
          </div>
          <h1 className="ph-title">
            Specialist for a reason. <em>Forty-five years of one thing.</em>
          </h1>
          <p className="ph-sub">
            We don&apos;t run a faculty. We run a drawing office that happens to teach. Everything
            — curriculum, software, instructors, output standards — is built around how engineering
            and design offices actually work in 2026.
          </p>
        </div>
        <div className="ph-meta">
          <div className="ph-meta-cell">
            <span className="ph-meta-k">FOUNDED</span>
            <span className="ph-meta-v">1981</span>
            <span className="ph-meta-foot">Johannesburg</span>
          </div>
          <div className="ph-meta-cell">
            <span className="ph-meta-k">CAMPUSES</span>
            <span className="ph-meta-v">2</span>
            <span className="ph-meta-foot">JHB · DBN</span>
          </div>
          <div className="ph-meta-cell">
            <span className="ph-meta-k">GRADUATES</span>
            <span className="ph-meta-v">12K+</span>
            <span className="ph-meta-foot">Since founding</span>
          </div>
          <div className="ph-meta-cell">
            <span className="ph-meta-k">FACULTY</span>
            <span className="ph-meta-v">100%</span>
            <span className="ph-meta-foot">Industry-active</span>
          </div>
        </div>
      </div>
    </section>
  );
}
