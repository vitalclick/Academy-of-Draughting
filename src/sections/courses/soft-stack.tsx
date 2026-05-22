import { SOFT_MARKS } from '@/data/courses';

export function SoftStackSection() {
  return (
    <section className="section section-paper" data-screen-label="04 Software Stack">
      <div className="page">
        <div className="sec-head">
          <div className="sec-head-meta">
            <span className="section-label">
              <span className="bar" />
              SECTION 04 / SOFTWARE
            </span>
            <h2 className="sec-head-title">The Autodesk stack, end to end.</h2>
          </div>
          <p className="sec-head-sub">
            Drawing offices in South Africa run on AutoCAD, Revit and Inventor. We teach all three —
            as native tools, not theory exercises. Specialisations layer Civil 3D and Navisworks on
            top.
          </p>
        </div>

        <div className="soft-stack">
          {SOFT_MARKS.map((s) => (
            <div key={s.name} className="soft-card">
              <span className="soft-mark" style={{ background: s.color }}>
                {s.letter}
              </span>
              <span className="soft-meta">{s.meta}</span>
              <h3 className="soft-name">{s.name}</h3>
              <p className="soft-desc">{s.desc}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
