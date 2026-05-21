/* ============================================================
   HOME PAGE
   ============================================================ */

function HomePage() {
  return (
    <PageShell active="home" headerTone="light">
      <HomeHero />
      <TrustStrip />
      <AIFeaturesSection />
      <CoursesSnapshot />
      <CareerIntelSection />
      <OutcomesSection />
      <FinalCTA />
    </PageShell>
  );
}

/* ------------------------------------------------------------
   HERO
   ------------------------------------------------------------ */

function HomeHero() {
  return (
    <section className="home-hero" data-screen-label="01 Hero">
      <div className="page hero-inner">
        <div className="hero-left">
          <div className="hero-eyebrow">
            <span className="pill pill-blue-dark"><span className="dot"></span>EST. 1981 · SOUTH AFRICA</span>
            <span className="t-mono-xs" style={{ color: 'var(--ink-on-dark-3)' }}>SAQA 66881 · DHET · QCTO</span>
          </div>

          <h1 className="hero-title">
            Engineering careers <span className="accent">start here.</span>
          </h1>

          <p className="hero-sub">
            Specialist draughting and CAD education, aligned to real engineering and design office environments. Since 1981 &mdash; nationally examined, industry-built, job-ready.
          </p>

          <div className="hero-ctas">
            <a href="apply.html" className="btn btn-lg btn-primary">
              Apply Now <span className="arr" aria-hidden="true">→</span>
            </a>
            <a href="courses.html" className="btn btn-lg btn-ghost-dark">Explore programmes</a>
            <a href="about.html" className="btn btn-lg btn-ghost-dark">About us</a>
          </div>

          <div className="hero-meta">
            <div className="hero-meta-cell">
              <div className="hero-meta-value">45<span style={{ color: 'var(--ink-on-dark-3)', fontSize: '60%', marginLeft: 2 }}>yrs</span></div>
              <span className="hero-meta-label">Specialist Heritage</span>
            </div>
            <div className="hero-meta-cell">
              <div className="hero-meta-value">3</div>
              <span className="hero-meta-label">Study Modes</span>
            </div>
            <div className="hero-meta-cell">
              <div className="hero-meta-value">8<span style={{ color: 'var(--ink-on-dark-3)', fontSize: '60%', marginLeft: 2 }}>+</span></div>
              <span className="hero-meta-label">Career Pathways</span>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-blueprint">
            <div className="hero-blueprint-label">
              <span className="swatch"></span>
              <span>DRAWING OFFICE · JHB CAMPUS</span>
            </div>
            <div className="hero-blueprint-tag">
              <span className="axis-mark"></span> A2 · 1:50
            </div>
            <BlueprintDeco />
          </div>

          <div className="hero-photo">
            <image-slot
              id="hero-demo"
              shape="rounded"
              radius="14"
              placeholder="Drop a real photo of students drafting / a CAD workstation / a finished drawing here"
            ></image-slot>
            <div className="hero-photo-caption">
              <span className="t-mono-xs">MDDOP N4 · CAD STUDIO · WEEK 14</span>
              <span className="t-body-sm" style={{ marginTop: 4, color: 'var(--ink-on-dark-2)' }}>
                Production-standard drawing office practice — exactly as it runs in industry.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function BlueprintDeco() {
  // Decorative blueprint elements drawn in SVG — isometric construction lines etc.
  return (
    <svg
      width="100%" height="100%"
      viewBox="0 0 480 600"
      fill="none"
      style={{ position: 'absolute', inset: 0, opacity: 0.42 }}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="hatch" patternUnits="userSpaceOnUse" width="6" height="6">
          <line x1="0" y1="6" x2="6" y2="0" stroke="rgba(45,111,247,0.25)" strokeWidth="0.5" />
        </pattern>
      </defs>
      {/* Isometric construction lines */}
      <path d="M40 540 L240 420 L440 540" stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeDasharray="3 3" />
      <path d="M40 540 L40 320 L240 200 L440 320 L440 540" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
      <path d="M40 320 L440 320" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <path d="M240 200 L240 420" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="3 3" />

      {/* Hatched accent */}
      <rect x="240" y="200" width="200" height="120" fill="url(#hatch)" />

      {/* Dimension line + tick marks bottom */}
      <line x1="40" y1="570" x2="440" y2="570" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
      <line x1="40" y1="565" x2="40" y2="575" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
      <line x1="440" y1="565" x2="440" y2="575" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
      <text x="240" y="588" fill="rgba(255,255,255,0.5)" fontSize="10" fontFamily="Geist Mono, monospace" textAnchor="middle" letterSpacing="0.06em">400.00</text>

      {/* Crosshair targets */}
      {[[40,540],[240,420],[440,540],[40,320],[240,200],[440,320]].map(([x,y], i) => (
        <g key={i}>
          <circle cx={x} cy={y} r="3" stroke="rgba(45,111,247,0.7)" strokeWidth="1" fill="none" />
          <line x1={x-6} y1={y} x2={x+6} y2={y} stroke="rgba(45,111,247,0.5)" strokeWidth="0.6" />
          <line x1={x} y1={y-6} x2={x} y2={y+6} stroke="rgba(45,111,247,0.5)" strokeWidth="0.6" />
        </g>
      ))}

      {/* Labels */}
      <text x="60" y="312" fill="rgba(255,255,255,0.45)" fontSize="9" fontFamily="Geist Mono, monospace" letterSpacing="0.06em">A.01</text>
      <text x="250" y="192" fill="rgba(255,255,255,0.45)" fontSize="9" fontFamily="Geist Mono, monospace" letterSpacing="0.06em">A.02</text>
      <text x="420" y="312" fill="rgba(255,255,255,0.45)" fontSize="9" fontFamily="Geist Mono, monospace" letterSpacing="0.06em">A.03</text>
    </svg>
  );
}

/* ------------------------------------------------------------
   TRUST STRIP
   ------------------------------------------------------------ */

function TrustStrip() {
  return (
    <section className="trust-strip section-dark">
      <div className="page trust-row">
        <div className="trust-cell">
          <span className="tc-strong">Since 1981</span>
          <span className="tc-soft">45 years specialist</span>
        </div>
        <div className="trust-cell">
          <span className="tc-strong">DHET registered</span>
          <span className="tc-soft">QCTO aligned</span>
        </div>
        <div className="trust-cell">
          <span className="tc-strong">SAQA 66881</span>
          <span className="tc-soft">National Certificate</span>
        </div>
        <div className="trust-cell">
          <span className="tc-strong">Autodesk stack</span>
          <span className="tc-soft">AutoCAD · Revit · Inventor</span>
        </div>
        <div className="trust-cell">
          <span className="tc-strong">JHB · DBN · Online</span>
          <span className="tc-soft">Two campuses + nationwide</span>
        </div>
        <div className="trust-cell">
          <span className="tc-strong">3 sittings / yr</span>
          <span className="tc-soft">Up to 4 subjects each</span>
        </div>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------
   AI FEATURES
   ------------------------------------------------------------ */

function AIFeaturesSection() {
  return (
    <section className="section section-darker" data-screen-label="02 How We Teach">
      <div className="page">
        <div className="sec-head">
          <div className="sec-head-meta">
            <span className="section-label"><span className="bar"></span>SECTION 02 / HOW WE TEACH</span>
            <h2 className="sec-head-title">An academy built around <em style={{ color: 'var(--cyan-400)', fontStyle: 'italic', fontWeight: 400 }}>the way drawing offices work</em>.</h2>
          </div>
          <p className="sec-head-sub">
            We don't do motivation posters. Every part of the academy &mdash; admissions, curriculum, faculty, software stack, examination &mdash; is built backwards from the standards South African engineering and design offices demand on first-week deliverables.
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

function AICard({ grid, label, title, desc, visual }) {
  return (
    <article className={`ai-card ${grid}`}>
      <span className="ai-label">{label}</span>
      <h3 className="ai-title">{title}</h3>
      <p className="ai-desc">{desc}</p>
      <div className="ai-visual">{visual}</div>
    </article>
  );
}

/* ----- Mini preview components for AI cards ----- */

function AidaPreviewMini() {
  return (
    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 8, height: '100%' }}>
      <div style={{ alignSelf: 'flex-start', padding: '8px 10px', borderRadius: 10, background: 'rgba(255,255,255,0.04)', border: '1px solid var(--line-on-dark)', fontSize: 12, maxWidth: '75%' }}>
        Where are you in your journey?
      </div>
      <div style={{ alignSelf: 'flex-end', padding: '8px 10px', borderRadius: 10, background: 'var(--blue-500)', color: 'white', fontSize: 12, maxWidth: '70%' }}>
        Changing careers from sales
      </div>
      <div style={{ alignSelf: 'flex-start', padding: '8px 10px', borderRadius: 10, background: 'rgba(61,217,214,0.08)', border: '1px solid rgba(61,217,214,0.28)', fontSize: 12, maxWidth: '85%', color: 'var(--cyan-400)' }}>
        → Part-time MDDOP (18mo) · 92% fit
      </div>
    </div>
  );
}

function MatchScorePreview() {
  const data = [
    { label: 'Architectural Draughtsperson', score: 96 },
    { label: 'BIM Coordinator',              score: 78 },
    { label: 'Steel Detailer',               score: 64 },
  ];
  return (
    <div style={{ padding: 14, display: 'flex', flexDirection: 'column', gap: 10, height: '100%', justifyContent: 'center' }}>
      {data.map((d, i) => (
        <div key={i}>
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 4 }}>
            <span style={{ fontSize: 12, fontWeight: 500 }}>{d.label}</span>
            <span className="t-mono-sm" style={{ color: i === 0 ? 'var(--cyan-400)' : 'var(--ink-on-dark-3)' }}>{d.score}%</span>
          </div>
          <div style={{ height: 4, background: 'var(--line-on-dark)', borderRadius: 999, overflow: 'hidden' }}>
            <div style={{ height: '100%', width: `${d.score}%`, background: i === 0 ? 'var(--cyan-400)' : 'var(--blue-500)', borderRadius: 999 }}></div>
          </div>
        </div>
      ))}
    </div>
  );
}

function RecMini() {
  return (
    <div style={{ padding: 12, display: 'flex', flexDirection: 'column', gap: 6, height: '100%', justifyContent: 'center' }}>
      {['AutoCAD Essentials', 'Revit Architecture', 'Inventor for Mechanical'].map((s, i) => (
        <div key={i} style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', padding: '8px 10px', background: i === 0 ? 'rgba(45,111,247,0.1)' : 'rgba(255,255,255,0.02)', border: `1px solid ${i === 0 ? 'rgba(45,111,247,0.4)' : 'var(--line-on-dark)'}`, borderRadius: 6, fontSize: 12 }}>
          <span>{s}</span>
          <span className="t-mono-xs" style={{ color: i === 0 ? 'var(--cyan-400)' : 'var(--ink-on-dark-3)' }}>{i === 0 ? '★ TOP' : '—'}</span>
        </div>
      ))}
    </div>
  );
}

function FormMini() {
  return (
    <div style={{ padding: 14, height: '100%', display: 'flex', flexDirection: 'column', gap: 8, justifyContent: 'center' }}>
      <div style={{ display: 'flex', justifyContent: 'space-between' }}>
        <span className="t-mono-xs" style={{ color: 'var(--ink-on-dark-3)' }}>STEP 2 / 4</span>
        <span className="t-mono-xs" style={{ color: 'var(--cyan-400)' }}>OCR · 3 OF 3 PARSED</span>
      </div>
      <div style={{ height: 4, background: 'var(--line-on-dark)', borderRadius: 999, overflow: 'hidden' }}>
        <div style={{ height: '100%', width: '50%', background: 'var(--blue-500)' }}></div>
      </div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 8, marginTop: 6 }}>
        {['ID NUMBER', 'MATRIC YEAR'].map((l, i) => (
          <div key={i} style={{ padding: 8, border: '1px solid var(--line-on-dark)', borderRadius: 6, background: 'rgba(0,0,0,0.16)' }}>
            <span className="t-mono-xs" style={{ color: 'var(--ink-on-dark-3)' }}>{l}</span>
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
    <div style={{ padding: 14, height: '100%', display: 'flex', flexDirection: 'column', gap: 10, justifyContent: 'center' }}>
      <div>
        <span className="t-mono-xs" style={{ color: 'var(--ink-on-dark-3)' }}>MEDIAN · GAUTENG</span>
        <div style={{ display: 'flex', alignItems: 'baseline', gap: 8 }}>
          <span style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em' }}>R 28 400</span>
          <span className="t-mono-sm" style={{ color: 'var(--cyan-400)' }}>↑ 4.2%</span>
        </div>
      </div>
      <svg viewBox="0 0 200 50" width="100%" height="50" aria-hidden="true">
        <polyline points="0,40 25,38 50,32 75,28 100,30 125,22 150,18 175,12 200,8" fill="none" stroke="var(--cyan-400)" strokeWidth="1.5" />
        <polyline points="0,50 25,50 50,50 75,50 100,50 125,50 150,50 175,50 200,50" fill="none" stroke="var(--line-on-dark)" strokeWidth="0.5" />
      </svg>
    </div>
  );
}

/* ------------------------------------------------------------
   COURSES SNAPSHOT
   ------------------------------------------------------------ */

function CoursesSnapshot() {
  return (
    <section className="section section-light" data-screen-label="03 Courses">
      <div className="page">
        <div className="sec-head">
          <div className="sec-head-meta">
            <span className="section-label"><span className="bar"></span>SECTION 03 / PROGRAMMES</span>
            <h2 className="sec-head-title">Three programmes. One standard. <em style={{ color: 'var(--blue-500)', fontStyle: 'italic', fontWeight: 400 }}>Job-ready.</em></h2>
          </div>
          <p className="sec-head-sub">
            Pick the pathway that fits where you are. The outcomes — drawing office discipline, industry-standard CAD, real engineering vocabulary — stay the same across every mode.
          </p>
        </div>

        <div className="course-rail">
          <CourseCard
            code="MDDOP / N4–N5"
            recommended
            title="MDDOP National Certificate"
            desc="Multi-Disciplinary Drawing Office Practice. The flagship — mechanical, civil and architectural draughting with AutoCAD, Revit and Inventor."
            meta={[
              ['DURATION', '10 mo · 18 mo · self-paced'],
              ['MODE',     'Full · Part · Online'],
              ['EXAM',     'DHET national'],
              ['ENTRY',    'Grade 11+'],
            ]}
          />
          <CourseCard
            code="BRIDGING"
            title="Bridging Course"
            desc="For students not yet at N4 entry. Maths fundamentals, technical drawing principles, AutoCAD basics. Builds the foundation for MDDOP."
            meta={[
              ['DURATION', '3–6 months'],
              ['MODE',     'Campus + Online'],
              ['EXAM',     'Internal'],
              ['ENTRY',    'No prerequisites'],
            ]}
          />
          <CourseCard
            code="SHORT / CAD"
            title="Autodesk Short Courses"
            desc="Focused, software-led training for working pros. AutoCAD, Revit, Inventor — each as a standalone stackable module."
            meta={[
              ['DURATION', '4–12 weeks'],
              ['MODE',     'Flexible · Online'],
              ['EXAM',     'Project portfolio'],
              ['ENTRY',    'Open'],
            ]}
          />
        </div>

        <div style={{ display: 'flex', justifyContent: 'center', marginTop: 40 }}>
          <a href="courses.html" className="btn btn-lg btn-solid-dark">
            Explore all programmes <span className="arr" aria-hidden="true">→</span>
          </a>
        </div>
      </div>
    </section>
  );
}

function CourseCard({ code, title, desc, meta, recommended }) {
  return (
    <article className="course-card">
      <div className="cc-head">
        <span className="cc-code">{code}</span>
        {recommended && <span className="cc-rec">★ MOST POPULAR</span>}
      </div>
      <h3>{title}</h3>
      <p className="cc-desc">{desc}</p>
      <div className="cc-meta">
        {meta.map(([k, v], i) => (
          <div key={i} className="cc-meta-cell">
            <span className="cc-meta-label">{k}</span>
            <span className="cc-meta-value">{v}</span>
          </div>
        ))}
      </div>
      <div className="cc-foot">
        <a href="courses.html" className="btn btn-sm btn-ghost-light">View details</a>
        <a href="apply.html" className="btn btn-sm btn-primary">Apply <span className="arr" aria-hidden="true">→</span></a>
      </div>
    </article>
  );
}

/* ------------------------------------------------------------
   INDUSTRY OUTLOOK DASHBOARD PREVIEW
   ------------------------------------------------------------ */

function CareerIntelSection() {
  const paths = [
    { name: 'Architectural Draughtsperson', sub: 'Revit · ArchiCAD', score: 96 },
    { name: 'Mechanical Draughtsperson',    sub: 'Inventor · SolidWorks', score: 88 },
    { name: 'Structural / Steel Detailer',  sub: 'Tekla · AutoCAD', score: 81 },
    { name: 'BIM Coordinator',              sub: 'Revit · Navisworks', score: 76 },
    { name: 'Civil Draughtsperson',         sub: 'AutoCAD Civil 3D', score: 72 },
    { name: 'CAD Technician',               sub: 'AutoCAD', score: 65 },
  ];

  const [active, setActive] = React.useState(0);

  return (
    <section className="section section-darker" data-screen-label="04 Career Intel">
      <div className="page">
        <div className="sec-head">
          <div className="sec-head-meta">
            <span className="section-label"><span className="bar"></span>SECTION 04 / INDUSTRY OUTLOOK</span>
            <h2 className="sec-head-title">A view of the engineering economy. <em style={{ color: 'var(--cyan-400)', fontStyle: 'italic', fontWeight: 400 }}>So you decide with data.</em></h2>
          </div>
          <p className="sec-head-sub">
            We don't quote you yesterday's salaries. Our Industry Outlook tracks median pay, regional demand and software requirements across South African engineering and design offices &mdash; updated quarterly.
          </p>
        </div>

        <div className="dash-wrap">
          <div className="dash-head">
            <div className="dash-tabs">
              <button className="dash-tab is-active" type="button">Career paths</button>
              <button className="dash-tab" type="button">Software demand</button>
              <button className="dash-tab" type="button">Regional hiring</button>
              <button className="dash-tab" type="button">Industry sectors</button>
            </div>
            <span className="t-mono-xs" style={{ color: 'var(--ink-on-dark-3)' }}>UPDATED 14 MAY 2026 · Q2</span>
          </div>

          <div className="dash-body">
            <div className="dash-side">
              <h4 className="dash-side-h">Match Strength · Top 6</h4>
              {paths.map((p, i) => (
                <button
                  key={i}
                  type="button"
                  className={`dash-row ${active === i ? 'is-active' : ''}`}
                  onClick={() => setActive(i)}
                >
                  <div>
                    <div className="dash-row-title">{p.name}</div>
                    <div className="dash-row-sub">{p.sub}</div>
                  </div>
                  <div className="dash-row-bar"><i style={{ width: `${p.score}%`, background: active === i ? 'var(--cyan-400)' : 'var(--blue-400)' }} /></div>
                </button>
              ))}
            </div>

            <div className="dash-main">
              <div className="dash-kpis">
                <div className="dash-kpi">
                  <span className="dash-kpi-label">Median Salary · GP</span>
                  <span className="dash-kpi-value">R28,400</span>
                  <span className="dash-kpi-delta">↑ 4.2% QoQ</span>
                </div>
                <div className="dash-kpi">
                  <span className="dash-kpi-label">Open roles · 90d</span>
                  <span className="dash-kpi-value">1,284</span>
                  <span className="dash-kpi-delta">↑ 11.0% QoQ</span>
                </div>
                <div className="dash-kpi">
                  <span className="dash-kpi-label">Time-to-Hire</span>
                  <span className="dash-kpi-value">42d</span>
                  <span className="dash-kpi-delta neg">↑ 3 days</span>
                </div>
              </div>

              <div className="dash-chart">
                <div className="dash-chart-head">
                  <span className="dash-chart-title">{paths[active].name} · Salary band & demand · 24 mo</span>
                  <div className="dash-chart-legend">
                    <span><i style={{ background: 'var(--cyan-400)' }}></i>SALARY</span>
                    <span><i style={{ background: 'var(--blue-400)' }}></i>OPEN ROLES</span>
                  </div>
                </div>
                <DashChart seed={active} />
              </div>

              <div className="dash-insight">
                <span className="dash-insight-mark">i</span>
                <div className="dash-insight-body">
                  <span className="dik">Faculty note</span>
                  For <strong style={{ color: 'var(--cyan-400)' }}>{paths[active].name}</strong>, the MDDOP N4/N5 + a Revit short course covers 87% of current listings. The bottleneck for first-time hires is portfolio depth &mdash; not credentials.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function DashChart({ seed = 0 }) {
  // Deterministic pseudo-data per seed
  const w = 720, h = 180;
  const pts = React.useMemo(() => {
    const out = [];
    let v = 38 + (seed * 5);
    for (let i = 0; i < 24; i++) {
      v += Math.sin((i + seed) * 0.7) * 4 + ((i + seed) % 3 - 1) * 1.5;
      v = Math.max(20, Math.min(58, v));
      out.push(v);
    }
    return out;
  }, [seed]);

  const pts2 = React.useMemo(() => pts.map((v, i) => Math.max(8, v - 18 + Math.cos(i + seed) * 6)), [pts, seed]);

  const toPath = (arr) => arr.map((v, i) => {
    const x = (i / (arr.length - 1)) * (w - 24) + 12;
    const y = h - v * 2.4;
    return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
  }).join(' ');

  const toArea = (arr) => {
    const path = toPath(arr);
    const lastX = w - 12;
    return `${path} L ${lastX} ${h} L 12 ${h} Z`;
  };

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} aria-hidden="true" style={{ display: 'block' }}>
      {/* gridlines */}
      {[0, 1, 2, 3, 4].map(i => (
        <line key={i} x1="12" x2={w - 12} y1={h * i / 4} y2={h * i / 4} stroke="rgba(255,255,255,0.05)" strokeWidth="0.5" />
      ))}
      {/* salary area */}
      <path d={toArea(pts)} fill="rgba(61,217,214,0.1)" />
      <path d={toPath(pts)} fill="none" stroke="var(--cyan-400)" strokeWidth="1.5" strokeLinejoin="round" />
      {/* demand */}
      <path d={toPath(pts2)} fill="none" stroke="var(--blue-400)" strokeWidth="1.5" strokeDasharray="3 3" />
      {/* y axis labels */}
      <text x="2" y="14" fontFamily="Geist Mono, monospace" fontSize="9" fill="rgba(255,255,255,0.4)">35K</text>
      <text x="2" y={h - 4} fontFamily="Geist Mono, monospace" fontSize="9" fill="rgba(255,255,255,0.4)">15K</text>
      {/* x axis */}
      <text x="12" y={h - 2} fontFamily="Geist Mono, monospace" fontSize="9" fill="rgba(255,255,255,0.4)">Q3 '24</text>
      <text x={w - 38} y={h - 2} fontFamily="Geist Mono, monospace" fontSize="9" fill="rgba(255,255,255,0.4)">Q2 '26</text>
    </svg>
  );
}

/* ------------------------------------------------------------
   OUTCOMES
   ------------------------------------------------------------ */

function OutcomesSection() {
  return (
    <section className="section section-paper" data-screen-label="05 Outcomes">
      <div className="page">
        <div className="sec-head">
          <div className="sec-head-meta">
            <span className="section-label"><span className="bar"></span>SECTION 05 / OUTCOMES</span>
            <h2 className="sec-head-title">We don't do motivation posters.<br /><em style={{ color: 'var(--blue-500)', fontStyle: 'italic', fontWeight: 400 }}>We measure.</em></h2>
          </div>
          <p className="sec-head-sub">
            What employers actually value: accuracy, drawing office discipline, real-software fluency, and a portfolio of work that looks like the work they do. We optimize for those — not slogans.
          </p>
        </div>

        <div className="outcomes-grid">
          <div className="outcome-stat">
            <div className="outcome-stat-value">96<span style={{ color: 'var(--ink-3)', fontSize: '54%' }}>%</span></div>
            <span className="outcome-stat-label">Programme Completion</span>
            <span className="outcome-stat-meta">MDDOP N4/N5 · 2024 cohort</span>
          </div>
          <div className="outcome-stat">
            <div className="outcome-stat-value">87<span style={{ color: 'var(--ink-3)', fontSize: '54%' }}>%</span></div>
            <span className="outcome-stat-label">Job Placement · 12mo</span>
            <span className="outcome-stat-meta">Self-reported graduate survey</span>
          </div>
          <div className="outcome-stat">
            <div className="outcome-stat-value">8</div>
            <span className="outcome-stat-label">Career Pathways</span>
            <span className="outcome-stat-meta">Mapped to live demand</span>
          </div>
          <div className="outcome-stat">
            <div className="outcome-stat-value">R28K<span style={{ color: 'var(--ink-3)', fontSize: '40%' }}>/mo</span></div>
            <span className="outcome-stat-label">Median Entry Salary</span>
            <span className="outcome-stat-meta">Gauteng · Q2 2026 ·  Statistical Median</span>
          </div>
        </div>

        <p className="t-mono-xs" style={{ color: 'var(--ink-4)', marginTop: 32, maxWidth: 720 }}>
          NOTE · OUTCOMES DEPEND ON INDIVIDUAL PERFORMANCE, ATTENDANCE AND MARKET CONDITIONS. THESE ARE COMPETENCE METRICS, NOT GUARANTEES. METHODOLOGY: ANNUAL GRADUATE SURVEY + LINKEDIN ATTESTATION + EMPLOYER CONFIRMATION SAMPLE.
        </p>
      </div>
    </section>
  );
}

/* ------------------------------------------------------------
   FINAL CTA — shared, defined in chrome.jsx
   ------------------------------------------------------------ */

/* ------------------------------------------------------------
   MOUNT
   ------------------------------------------------------------ */

ReactDOM.createRoot(document.getElementById('root')).render(<HomePage />);
