/* ============================================================
   ABOUT PAGE
   ============================================================ */

function AboutPage() {
  return (
    <PageShell active="about" headerTone="light">
      <AboutHeader />
      <AboutBody />
      <TimelineSection />
      <CampusesSection />
      <FinalCTA />
    </PageShell>
  );
}

function AboutHeader() {
  return (
    <section className="page-header" data-screen-label="01 About Header">
      <div className="page ph-inner">
        <div>
          <div className="ph-eyebrow">
            <span className="pill pill-blue-dark"><span className="dot"></span>FOUNDED 1981 · JOHANNESBURG</span>
            <span className="t-mono-xs" style={{ color: 'var(--ink-on-dark-3)' }}>45 YEARS · 2 CAMPUSES · 1 SPECIALTY</span>
          </div>
          <h1 className="ph-title">Specialist for a reason. <em>Forty-five years of one thing.</em></h1>
          <p className="ph-sub">
            We don't run a faculty. We run a drawing office that happens to teach. Everything — curriculum, software, instructors, output standards — is built around how engineering and design offices actually work in 2026.
          </p>
        </div>
        <div className="ph-meta">
          <div className="ph-meta-cell"><span className="ph-meta-k">FOUNDED</span><span className="ph-meta-v">1981</span><span className="ph-meta-foot">Johannesburg</span></div>
          <div className="ph-meta-cell"><span className="ph-meta-k">CAMPUSES</span><span className="ph-meta-v">2</span><span className="ph-meta-foot">JHB · DBN</span></div>
          <div className="ph-meta-cell"><span className="ph-meta-k">GRADUATES</span><span className="ph-meta-v">12K+</span><span className="ph-meta-foot">Since founding</span></div>
          <div className="ph-meta-cell"><span className="ph-meta-k">FACULTY</span><span className="ph-meta-v">100%</span><span className="ph-meta-foot">Industry-active</span></div>
        </div>
      </div>
    </section>
  );
}

function AboutBody() {
  return (
    <section className="section section-light" data-screen-label="02 About · Manifesto">
      <div className="page">
        <div className="sec-head">
          <div className="sec-head-meta">
            <span className="section-label"><span className="bar"></span>SECTION 02 / WHY WE EXIST</span>
            <h2 className="sec-head-title">We don't do motivation posters.<br /><em style={{ color: 'var(--blue-500)', fontStyle: 'italic', fontWeight: 400 }}>We do drawings.</em></h2>
          </div>
          <p className="sec-head-sub">
            In 1981 South Africa needed draughtspeople who could walk into a drawing office and contribute on day one. That's still the standard. Everything we do — and everything we don't do — flows from that.
          </p>
        </div>

        <div className="about-grid">
          <div className="about-prose">
            <p>
              <strong>The Academy was founded as a specialist institution.</strong> Not a university with a drafting department. Not a general TVET college that teaches "design". A specialist school for one craft: technical drawing, done to the standard that engineering, architectural and manufacturing offices require.
            </p>
            <p>
              That focus changed our entire model. <strong>Smaller cohorts.</strong> Instructors who still take on drawing-office contracts. Software that's actually used on real projects. Coursework framed around live engineering vocabulary, not academic abstraction. Output graded against drawing-office standards — title blocks, layer discipline, dimensioning conventions, the lot.
            </p>
            <p>
              In 2026 we added an intelligence layer — <strong>AIDA</strong>, our admissions assistant, plus a career intelligence dashboard that tracks live South African salary and demand data. None of it replaces the craft. All of it makes the path to the craft faster, clearer, and matched to your situation.
            </p>
            <p>
              We don't promise motivation. We promise <strong>a portfolio that looks like the work employers do</strong>, and the discipline to keep producing that work after you leave us. That's the contract.
            </p>
          </div>

          <div className="about-side">
            <div className="about-fact">
              <span className="about-fact-k">FOUNDING PROMISE</span>
              <div className="about-fact-v">Drawing-office ready · day 1</div>
              <p className="about-fact-d">Coursework is built backwards from the standards South African drawing offices demand on first-week deliverables.</p>
            </div>
            <div className="about-fact">
              <span className="about-fact-k">FACULTY MODEL</span>
              <div className="about-fact-v">100% industry-active</div>
              <p className="about-fact-d">Every instructor still takes on real drawing-office contracts. No tenure-track theorists. No motivational speakers.</p>
            </div>
            <div className="about-fact">
              <span className="about-fact-k">COHORT SIZE</span>
              <div className="about-fact-v">≤ 24 students</div>
              <p className="about-fact-d">Capped per intake. Per-student instructor time stays high so portfolio reviews are real.</p>
            </div>
            <div className="about-fact">
              <span className="about-fact-k">SOFTWARE STANCE</span>
              <div className="about-fact-v">Native, not abstract</div>
              <p className="about-fact-d">AutoCAD, Revit and Inventor as they're configured in production environments — not vendor demos.</p>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function TimelineSection() {
  const items = [
    { year: '1981', title: 'Founded in Johannesburg', desc: 'Established as a specialist drawing office and training institution. Original cohort: 14 students.' },
    { year: '1989', title: 'First Autodesk-licensed curriculum', desc: 'Among the first SA institutions to teach AutoCAD as a core production tool rather than an elective.' },
    { year: '1997', title: 'DHET registration', desc: 'Registered with the Department of Higher Education and Training. National Certificate alignment begins.' },
    { year: '2004', title: 'Durban campus opens', desc: 'KZN expansion. Same cohort cap, same instructor model, same standards.' },
    { year: '2012', title: 'SAQA 66881 award', desc: 'National Certificate in Engineering Drawing accredited. Examined nationally.' },
    { year: '2018', title: 'Bridging programme', desc: 'Foundation course for students not yet at N4 entry. Removes a barrier without lowering the bar.' },
    { year: '2022', title: 'Online + distance learning', desc: 'Full programme available nationwide. Self-paced track introduced.' },
    { year: '2026', title: 'AIDA + Career Intelligence', desc: 'AI admissions assistant, career match engine, live salary and demand dashboards.' },
  ];

  return (
    <section className="section section-paper" data-screen-label="03 Timeline">
      <div className="page">
        <div className="sec-head">
          <div className="sec-head-meta">
            <span className="section-label"><span className="bar"></span>SECTION 03 / HERITAGE</span>
            <h2 className="sec-head-title">Forty-five years. <em style={{ color: 'var(--blue-500)', fontStyle: 'italic', fontWeight: 400 }}>One bar.</em></h2>
          </div>
          <p className="sec-head-sub">
            The standards have stayed remarkably stable — drawings have to be correct, complete, and ready to build from. The tools change. The bar doesn't.
          </p>
        </div>

        <div style={{ background: 'var(--white)', border: '1px solid var(--line-on-light-2)', borderRadius: 14, padding: 32 }}>
          <div className="timeline">
            {items.map(it => (
              <div key={it.year} className="tl-item">
                <div className="tl-dot"></div>
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

function CampusesSection() {
  return (
    <section className="section section-light" data-screen-label="04 Campuses">
      <div className="page">
        <div className="sec-head">
          <div className="sec-head-meta">
            <span className="section-label"><span className="bar"></span>SECTION 04 / CAMPUSES</span>
            <h2 className="sec-head-title">Two campuses. <em style={{ color: 'var(--blue-500)', fontStyle: 'italic', fontWeight: 400 }}>One nationwide programme.</em></h2>
          </div>
          <p className="sec-head-sub">
            Same curriculum, same instructors, same software stack. Pick the campus that fits — or go online from anywhere in South Africa.
          </p>
        </div>

        <div className="campus-grid">
          <CampusCard
            loc="GAUTENG · 26.20°S"
            name="Johannesburg"
            desc="Flagship campus. Full drawing office facilities, plotter room, model shop, library."
            list={['100 seats · capped intakes', 'Mon–Sat operations', 'Walk-ins for consults']}
            kind="jhb"
          />
          <CampusCard
            loc="KZN · 29.86°S"
            name="Durban"
            desc="KZN campus, opened 2004. Identical programme delivery, smaller cohort cap."
            list={['60 seats · capped intakes', 'Mon–Fri + Sat AM', 'Coastal industrial focus']}
            kind="dbn"
          />
          <CampusCard
            loc="ZA · NATIONWIDE"
            name="Online · Distance"
            desc="Full programme available nationwide. Live and recorded sessions, drawing reviews via desk share."
            list={['Self-paced · 8 mo avg', 'Live cohort sessions weekly', 'Same examination standards']}
            kind="online"
          />
        </div>
      </div>
    </section>
  );
}

function CampusCard({ loc, name, desc, list, kind }) {
  return (
    <article className="campus-card">
      <div className="campus-img img-placeholder dark" style={{ borderRadius: 0, border: 0, borderBottom: '1px solid var(--line-on-light-2)' }}>
        <CampusVis kind={kind} />
      </div>
      <div className="campus-meta">
        <span className="campus-loc">{loc}</span>
        <h3 className="campus-name">{name}</h3>
        <p>{desc}</p>
        <div className="campus-list">
          {list.map((l, i) => (
            <div key={i}>{l}</div>
          ))}
        </div>
      </div>
    </article>
  );
}

function CampusVis({ kind }) {
  // Stylised campus icon
  return (
    <svg viewBox="0 0 400 200" width="100%" height="100%" preserveAspectRatio="xMidYMid slice" aria-hidden="true" style={{ position: 'absolute', inset: 0 }}>
      <rect width="400" height="200" fill="#071B3B" />
      {/* grid */}
      <g opacity="0.18">
        {[0, 1, 2, 3, 4, 5, 6, 7].map(i => <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="200" stroke="white" strokeWidth="0.5" />)}
        {[0, 1, 2, 3, 4].map(i => <line key={`h${i}`} x1="0" y1={i * 50} x2="400" y2={i * 50} stroke="white" strokeWidth="0.5" />)}
      </g>
      {kind === 'jhb' && (
        <>
          {/* skyline */}
          <rect x="80" y="80" width="40" height="100" fill="#11315C" stroke="#5A8CFF" strokeWidth="0.8" />
          <rect x="130" y="50" width="60" height="130" fill="#11315C" stroke="#5A8CFF" strokeWidth="0.8" />
          <rect x="200" y="100" width="40" height="80" fill="#11315C" stroke="#5A8CFF" strokeWidth="0.8" />
          <rect x="250" y="70" width="50" height="110" fill="#11315C" stroke="#5A8CFF" strokeWidth="0.8" />
          {/* windows */}
          {[0,1,2,3].map(r => [0,1].map(c => <rect key={`${r}${c}`} x={138 + c * 16} y={62 + r * 22} width="8" height="6" fill="#3DD9D6" opacity={0.4 + r * 0.1} />))}
          <text x="200" y="194" fontFamily="Geist Mono, monospace" fontSize="9" fill="#6FE6E2" textAnchor="middle" letterSpacing="0.15em">JHB · 26°S</text>
        </>
      )}
      {kind === 'dbn' && (
        <>
          {/* coast line */}
          <path d="M0 130 Q 100 110 200 130 T 400 130 L 400 200 L 0 200 Z" fill="#11315C" stroke="#5A8CFF" strokeWidth="0.8" />
          <path d="M0 130 Q 100 110 200 130 T 400 130" fill="none" stroke="#3DD9D6" strokeWidth="1" />
          {/* sun */}
          <circle cx="320" cy="60" r="22" fill="none" stroke="#6FE6E2" strokeWidth="1" />
          <circle cx="320" cy="60" r="10" fill="#6FE6E2" opacity="0.3" />
          <text x="200" y="194" fontFamily="Geist Mono, monospace" fontSize="9" fill="#6FE6E2" textAnchor="middle" letterSpacing="0.15em">DBN · 29.8°S</text>
        </>
      )}
      {kind === 'online' && (
        <>
          {/* network nodes */}
          {[[80,60],[200,40],[320,80],[120,120],[280,140],[200,100],[60,140],[340,60]].map(([x,y], i) => (
            <g key={i}>
              <circle cx={x} cy={y} r="4" fill="#5A8CFF" />
              <circle cx={x} cy={y} r="9" fill="none" stroke="#5A8CFF" strokeWidth="0.5" opacity="0.5" />
            </g>
          ))}
          <line x1="80" y1="60" x2="200" y2="100" stroke="#5A8CFF" strokeWidth="0.5" />
          <line x1="200" y1="100" x2="320" y2="80" stroke="#5A8CFF" strokeWidth="0.5" />
          <line x1="200" y1="100" x2="120" y2="120" stroke="#5A8CFF" strokeWidth="0.5" />
          <line x1="200" y1="100" x2="280" y2="140" stroke="#5A8CFF" strokeWidth="0.5" />
          <line x1="200" y1="100" x2="200" y2="40" stroke="#3DD9D6" strokeWidth="0.8" />
          <line x1="200" y1="100" x2="60" y2="140" stroke="#5A8CFF" strokeWidth="0.5" />
          <line x1="200" y1="100" x2="340" y2="60" stroke="#5A8CFF" strokeWidth="0.5" />
          <text x="200" y="194" fontFamily="Geist Mono, monospace" fontSize="9" fill="#6FE6E2" textAnchor="middle" letterSpacing="0.15em">ZA · NATIONWIDE</text>
        </>
      )}
    </svg>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<AboutPage />);
