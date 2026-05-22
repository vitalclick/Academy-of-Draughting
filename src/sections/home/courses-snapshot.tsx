import Link from 'next/link';

type Meta = [string, string];

function CourseCard({
  code,
  title,
  desc,
  meta,
  recommended,
  href,
}: {
  code: string;
  title: string;
  desc: string;
  meta: Meta[];
  recommended?: boolean;
  href: string;
}) {
  return (
    <article className="course-card">
      <div className="cc-head">
        <span className="cc-code">{code}</span>
        {recommended && <span className="cc-rec">★ MOST POPULAR</span>}
      </div>
      <h3>{title}</h3>
      <p className="cc-desc">{desc}</p>
      <div className="cc-meta">
        {meta.map(([k, v]) => (
          <div key={k} className="cc-meta-cell">
            <span className="cc-meta-label">{k}</span>
            <span className="cc-meta-value">{v}</span>
          </div>
        ))}
      </div>
      <div className="cc-foot">
        <Link href={href} className="btn btn-sm btn-ghost-light">
          View details
        </Link>
        <Link href="/apply" className="btn btn-sm btn-primary">
          Apply{' '}
          <span className="arr" aria-hidden="true">
            →
          </span>
        </Link>
      </div>
    </article>
  );
}

export function CoursesSnapshot() {
  return (
    <section className="section section-light" data-screen-label="03 Courses">
      <div className="page">
        <div className="sec-head">
          <div className="sec-head-meta">
            <span className="section-label">
              <span className="bar" />
              SECTION 03 / PROGRAMMES
            </span>
            <h2 className="sec-head-title">
              Three programmes. One standard.{' '}
              <em style={{ color: 'var(--blue-500)', fontStyle: 'italic', fontWeight: 400 }}>
                Job-ready.
              </em>
            </h2>
          </div>
          <p className="sec-head-sub">
            Pick the pathway that fits where you are. The outcomes — drawing office discipline,
            industry-standard CAD, real engineering vocabulary — stay the same across every mode.
          </p>
        </div>

        <div className="course-rail">
          <CourseCard
            code="MDDOP / N4–N5"
            recommended
            href="/courses/mddop"
            title="MDDOP National Certificate"
            desc="Multi-Disciplinary Drawing Office Practice. The flagship — mechanical, civil and architectural draughting with AutoCAD, Revit and Inventor."
            meta={[
              ['DURATION', '10 mo · 18 mo · self-paced'],
              ['MODE', 'Full · Part · Online'],
              ['EXAM', 'DHET national'],
              ['ENTRY', 'Grade 11+'],
            ]}
          />
          <CourseCard
            code="BRIDGING"
            href="/courses/bridging"
            title="Bridging Course"
            desc="For students not yet at N4 entry. Maths fundamentals, technical drawing principles, AutoCAD basics. Builds the foundation for MDDOP."
            meta={[
              ['DURATION', '3–6 months'],
              ['MODE', 'Campus + Online'],
              ['EXAM', 'Internal'],
              ['ENTRY', 'No prerequisites'],
            ]}
          />
          <CourseCard
            code="SHORT / CAD"
            href="/courses/autocad"
            title="Autodesk Short Courses"
            desc="Focused, software-led training for working pros. AutoCAD, Revit, Inventor — each as a standalone stackable module."
            meta={[
              ['DURATION', '4–12 weeks'],
              ['MODE', 'Flexible · Online'],
              ['EXAM', 'Project portfolio'],
              ['ENTRY', 'Open'],
            ]}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
          <Link href="/courses" className="btn btn-lg btn-solid-dark">
            Explore all programmes{' '}
            <span className="arr" aria-hidden="true">
              →
            </span>
          </Link>
        </div>
      </div>
    </section>
  );
}
