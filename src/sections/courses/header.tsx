export function CoursesHeader() {
  return (
    <section className="page-header" data-screen-label="01 Programmes Header">
      <div className="page ph-inner">
        <div>
          <div className="ph-eyebrow">
            <span className="pill pill-blue-dark">
              <span className="dot" />
              SECTION 01 / PROGRAMMES
            </span>
            <span className="t-mono-xs" style={{ color: 'var(--ink-on-dark-3)' }}>
              6 ACTIVE · 8 SUBJECTS · 4 SOFTWARE
            </span>
          </div>
          <h1 className="ph-title">
            Programmes built for real <em>drawing offices.</em>
          </h1>
          <p className="ph-sub">
            Six pathways from foundation to specialisation. Every programme is mapped to drawing
            office discipline, current software demand, and the way South African engineering
            offices actually work.
          </p>
        </div>
        <div className="ph-meta">
          <div className="ph-meta-cell">
            <span className="ph-meta-k">MDDOP DURATION</span>
            <span className="ph-meta-v">10 mo</span>
            <span className="ph-meta-foot">Full-time pathway</span>
          </div>
          <div className="ph-meta-cell">
            <span className="ph-meta-k">EXAM SITTINGS</span>
            <span className="ph-meta-v">3 / yr</span>
            <span className="ph-meta-foot">Up to 4 subjects each</span>
          </div>
          <div className="ph-meta-cell">
            <span className="ph-meta-k">NEXT INTAKE</span>
            <span className="ph-meta-v">Jan 2026</span>
            <span className="ph-meta-foot">Applications open</span>
          </div>
          <div className="ph-meta-cell">
            <span className="ph-meta-k">ENTRY</span>
            <span className="ph-meta-v">Grade 11+</span>
            <span className="ph-meta-foot">Bridging available</span>
          </div>
        </div>
      </div>
    </section>
  );
}
