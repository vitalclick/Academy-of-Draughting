const ITEMS = [
  {
    year: '1981',
    title: 'Founded in Johannesburg',
    desc: 'Established as a specialist drawing office and training institution. Original cohort: 14 students.',
  },
  {
    year: '1989',
    title: 'First Autodesk-licensed curriculum',
    desc: 'Among the first SA institutions to teach AutoCAD as a core production tool rather than an elective.',
  },
  {
    year: '1997',
    title: 'DHET registration',
    desc: 'Registered with the Department of Higher Education and Training. National Certificate alignment begins.',
  },
  {
    year: '2004',
    title: 'Durban campus opens',
    desc: 'KZN expansion. Same cohort cap, same instructor model, same standards.',
  },
  {
    year: '2012',
    title: 'SAQA 66881 award',
    desc: 'National Certificate in Engineering Drawing accredited. Examined nationally.',
  },
  {
    year: '2018',
    title: 'Bridging programme',
    desc: 'Foundation course for students not yet at N4 entry. Removes a barrier without lowering the bar.',
  },
  {
    year: '2022',
    title: 'Online + distance learning',
    desc: 'Full programme available nationwide. Self-paced track introduced.',
  },
  {
    year: '2026',
    title: 'AIDA + Career Intelligence',
    desc: 'AI admissions assistant, career match engine, live salary and demand dashboards.',
  },
];

export function TimelineSection() {
  return (
    <section className="section section-paper" data-screen-label="03 Timeline">
      <div className="page">
        <div className="sec-head">
          <div className="sec-head-meta">
            <span className="section-label">
              <span className="bar" />
              SECTION 03 / HERITAGE
            </span>
            <h2 className="sec-head-title">
              Forty-five years.{' '}
              <em style={{ color: 'var(--blue-500)', fontStyle: 'italic', fontWeight: 400 }}>
                One bar.
              </em>
            </h2>
          </div>
          <p className="sec-head-sub">
            The standards have stayed remarkably stable — drawings have to be correct, complete,
            and ready to build from. The tools change. The bar doesn&apos;t.
          </p>
        </div>

        <div
          style={{
            background: 'var(--white)',
            border: '1px solid var(--line-on-light-2)',
            borderRadius: 14,
            padding: 32,
          }}
        >
          <div className="timeline">
            {ITEMS.map((it) => (
              <div key={it.year} className="tl-item">
                <div className="tl-dot" />
                <div>
                  <span className="tl-year">{it.year}</span>
                  <h3 className="tl-title">{it.title}</h3>
                  <p className="tl-desc">{it.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
