/* ============================================================
   COURSES PAGE
   ============================================================ */

const COURSES = [
  {
    id: 'mddop',
    code: 'MDDOP / N4–N5',
    title: 'MDDOP National Certificate',
    desc: 'Multi-Disciplinary Drawing Office Practice. The flagship pathway — covers mechanical, civil and architectural draughting with AutoCAD, Revit and Inventor.',
    modes: ['Full-time', 'Part-time', 'Online'],
    activeModes: ['Full-time', 'Part-time', 'Online'],
    duration: '10–18 mo',
    exam: 'DHET national',
    entry: 'Grade 11+',
    intake: 'Jan / May / Sep',
    software: ['AutoCAD', 'Revit', 'Inventor'],
    discipline: ['mechanical', 'architectural', 'civil'],
    fit: 96,
    featured: true,
    modules: [
      'Building Draughting', 'Mechanical Draughting',
      'Electrical Draughting', 'Structural Draughting',
      'CAD (AutoCAD)', 'MDDOP Theory & Practice',
      'Pictorial Drawing', 'General Draughting',
    ],
    vis: 'plan',
  },
  {
    id: 'bridging',
    code: 'BRIDGING',
    title: 'Bridging Course',
    desc: 'For students not yet at N4 entry — maths fundamentals, technical drawing principles, AutoCAD basics. Builds the foundation for MDDOP.',
    modes: ['Full-time', 'Part-time'],
    activeModes: ['Full-time', 'Part-time'],
    duration: '3–6 mo',
    exam: 'Internal',
    entry: 'Open',
    intake: 'Rolling',
    software: ['AutoCAD'],
    discipline: ['foundation'],
    fit: 78,
    modules: [
      'Engineering maths basics', 'Technical drawing principles',
      'CAD fundamentals', 'Drawing office vocabulary',
    ],
    vis: 'compass',
  },
  {
    id: 'autocad',
    code: 'SHORT / 04',
    title: 'AutoCAD Essentials',
    desc: 'Industry-standard 2D + 3D drafting. Production drawings, layout, dimensioning, layer management.',
    modes: ['Online', 'Part-time'],
    activeModes: ['Online', 'Part-time'],
    duration: '8 weeks',
    exam: 'Portfolio',
    entry: 'Open',
    intake: 'Rolling',
    software: ['AutoCAD'],
    discipline: ['cad'],
    fit: 88,
    modules: [
      '2D drafting fundamentals', 'Layer & block management',
      '3D modelling', 'Plotting & sheet sets',
    ],
    vis: 'orthographic',
  },
  {
    id: 'revit',
    code: 'SHORT / 05',
    title: 'Revit Architecture',
    desc: 'BIM-first architectural modelling. Families, schedules, construction documentation, multi-discipline coordination.',
    modes: ['Online', 'Part-time'],
    activeModes: ['Online', 'Part-time'],
    duration: '10 weeks',
    exam: 'Portfolio',
    entry: 'AutoCAD or equiv.',
    intake: 'Rolling',
    software: ['Revit'],
    discipline: ['architectural', 'bim'],
    fit: 84,
    modules: [
      'BIM concepts', 'Walls / floors / roofs',
      'Families & components', 'Sheets & documentation',
    ],
    vis: 'isometric',
  },
  {
    id: 'inventor',
    code: 'SHORT / 06',
    title: 'Inventor for Mechanical',
    desc: 'Parametric 3D modelling for mechanical and manufacturing. Assemblies, drawings, sheet metal, weldments.',
    modes: ['Online'],
    activeModes: ['Online'],
    duration: '10 weeks',
    exam: 'Portfolio',
    entry: 'AutoCAD or equiv.',
    intake: 'Rolling',
    software: ['Inventor'],
    discipline: ['mechanical'],
    fit: 71,
    modules: [
      'Parametric sketches', 'Part modelling',
      'Assembly design', 'Drawing creation',
    ],
    vis: 'part',
  },
  {
    id: 'civil',
    code: 'SPEC / 07',
    title: 'Civil Draughting Specialisation',
    desc: 'Roads, drainage, site plans, contours. Adds Civil 3D to your toolkit on top of AutoCAD.',
    modes: ['Part-time'],
    activeModes: ['Part-time'],
    duration: '12 weeks',
    exam: 'Portfolio',
    entry: 'MDDOP or AutoCAD',
    intake: 'Apr / Oct',
    software: ['AutoCAD', 'Civil 3D'],
    discipline: ['civil'],
    fit: 64,
    modules: [
      'Survey data interpretation', 'Road & street design',
      'Drainage & utilities', 'Site & contour modelling',
    ],
    vis: 'contour',
  },
];

const FILTERS = {
  mode:    [ 'All modes', 'Full-time', 'Part-time', 'Online' ],
  level:   [ 'All levels', 'Foundation', 'Certificate', 'Specialisation' ],
  software:[ 'All software', 'AutoCAD', 'Revit', 'Inventor', 'Civil 3D' ],
};

const SOFT_MARKS = [
  { name: 'AutoCAD',  letter: 'A', color: '#D6312D', desc: 'Industry-standard 2D and 3D drafting — used in 91% of SA drawing offices.', meta: 'PRESENT IN 5 COURSES' },
  { name: 'Revit',    letter: 'R', color: '#0078D4', desc: 'BIM modelling for architecture and MEP — the language of modern construction.', meta: 'PRESENT IN 3 COURSES' },
  { name: 'Inventor', letter: 'I', color: '#36B37E', desc: 'Parametric 3D modelling for mechanical and manufacturing engineering.', meta: 'PRESENT IN 2 COURSES' },
  { name: 'Civil 3D', letter: 'C', color: '#B85C00', desc: 'Roads, drainage, site grading and survey workflows for civil draughting.', meta: 'PRESENT IN 1 COURSE' },
];

function CoursesPage() {
  return (
    <PageShell active="courses" headerTone="light">
      <CoursesHeader />
      <CoursesFilterBar />
      <CoursesList />
      <RecommenderSection />
      <SoftStackSection />
      <FinalCTA />
    </PageShell>
  );
}

function CoursesHeader() {
  return (
    <section className="page-header" data-screen-label="01 Programmes Header">
      <div className="page ph-inner">
        <div>
          <div className="ph-eyebrow">
            <span className="pill pill-blue-dark"><span className="dot"></span>SECTION 01 / PROGRAMMES</span>
            <span className="t-mono-xs" style={{ color: 'var(--ink-on-dark-3)' }}>6 ACTIVE · 8 SUBJECTS · 4 SOFTWARE</span>
          </div>
          <h1 className="ph-title">Programmes built for real <em>drawing offices.</em></h1>
          <p className="ph-sub">
            Six pathways from foundation to specialisation. Every programme is mapped to drawing office discipline, current software demand, and the way South African engineering offices actually work.
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

function CoursesFilterBar() {
  const [mode,     setMode]     = React.useState('All modes');
  const [level,    setLevel]    = React.useState('All levels');
  const [software, setSoftware] = React.useState('All software');
  const [query,    setQuery]    = React.useState('');

  // Expose to children via context-y window mech (light-weight)
  React.useEffect(() => {
    window.__courseFilters = { mode, level, software, query };
    window.dispatchEvent(new CustomEvent('courses:filter'));
  }, [mode, level, software, query]);

  const renderGroup = (label, value, options, onChange) => (
    <div className="filter-group">
      <span className="filter-group-label">{label}</span>
      {options.map(o => (
        <button
          key={o}
          type="button"
          className={`filter-chip ${value === o ? 'is-active' : ''}`}
          onClick={() => onChange(o)}
        >{o}</button>
      ))}
    </div>
  );

  return (
    <div className="filter-bar">
      <div className="page filter-row">
        {renderGroup('MODE',     mode,     FILTERS.mode,     setMode)}
        {renderGroup('LEVEL',    level,    FILTERS.level,    setLevel)}
        {renderGroup('SOFTWARE', software, FILTERS.software, setSoftware)}
        <div className="filter-search">
          <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
            <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" /><path d="M21 21l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
          </svg>
          <input
            type="text"
            placeholder="Search 6 programmes…"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
          />
          <kbd>⌘K</kbd>
        </div>
      </div>
    </div>
  );
}

function CoursesList() {
  const [, force] = React.useReducer(x => x + 1, 0);
  React.useEffect(() => {
    const h = () => force();
    window.addEventListener('courses:filter', h);
    return () => window.removeEventListener('courses:filter', h);
  }, []);

  const f = window.__courseFilters || { mode: 'All modes', level: 'All levels', software: 'All software', query: '' };

  const filtered = COURSES.filter(c => {
    if (f.mode !== 'All modes' && !c.activeModes.includes(f.mode)) return false;
    if (f.software !== 'All software' && !c.software.includes(f.software)) return false;
    if (f.level !== 'All levels') {
      if (f.level === 'Foundation'     && !['bridging'].includes(c.id)) return false;
      if (f.level === 'Certificate'    && !['mddop'].includes(c.id))   return false;
      if (f.level === 'Specialisation' && !['autocad','revit','inventor','civil'].includes(c.id)) return false;
    }
    if (f.query.trim()) {
      const q = f.query.toLowerCase();
      if (!c.title.toLowerCase().includes(q) && !c.desc.toLowerCase().includes(q) && !c.software.join(' ').toLowerCase().includes(q)) return false;
    }
    return true;
  });

  return (
    <section className="section section-paper" data-screen-label="02 Courses Grid">
      <div className="page">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline', marginBottom: 24 }}>
          <span className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>SHOWING {filtered.length} OF {COURSES.length} PROGRAMMES</span>
          <span className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>SORTED BY · FIT</span>
        </div>
        {filtered.length === 0 && (
          <div style={{ padding: 48, textAlign: 'center', background: 'var(--white)', border: '1px dashed var(--line-on-light)', borderRadius: 12 }}>
            <p className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>NO PROGRAMMES MATCH</p>
            <p className="t-body" style={{ marginTop: 8 }}>Try a different combination, or <a href="apply.html" style={{ color: 'var(--blue-500)', textDecoration: 'underline' }}>chat with admissions</a>.</p>
          </div>
        )}
        <div className="courses-grid">
          {filtered.map(c => <CoursesCard key={c.id} c={c} />)}
        </div>
      </div>
    </section>
  );
}

function CoursesCard({ c }) {
  return (
    <article className={`crs-card ${c.featured ? 'crs-card-feature' : ''}`}>
      <div className="crs-card-vis">
        <CrsVisSvg kind={c.vis} />
        <div className="crs-vis-top">
          <span className="crs-vis-code">{c.code}</span>
          <span className="crs-vis-pill">★ {c.fit}% FIT</span>
        </div>
        <div className="crs-vis-tag">
          <em>{c.software.join(' · ')}</em> · {c.duration}
        </div>
      </div>

      <div className="crs-card-body">
        <div>
          <h3 className="crs-title">{c.title}</h3>
          <p className="crs-desc" style={{ marginTop: 8 }}>{c.desc}</p>
        </div>

        <div className="crs-modes">
          {FILTERS.mode.slice(1).map(m => (
            <span key={m} className={`crs-mode ${c.activeModes.includes(m) ? 'is-on' : ''}`}>{m}</span>
          ))}
        </div>

        <div className="crs-stats">
          <div className="crs-stat">
            <div className="crs-stat-k">DURATION</div>
            <div className="crs-stat-v">{c.duration}</div>
          </div>
          <div className="crs-stat">
            <div className="crs-stat-k">EXAM</div>
            <div className="crs-stat-v">{c.exam}</div>
          </div>
          <div className="crs-stat">
            <div className="crs-stat-k">ENTRY</div>
            <div className="crs-stat-v">{c.entry}</div>
          </div>
          <div className="crs-stat">
            <div className="crs-stat-k">INTAKE</div>
            <div className="crs-stat-v">{c.intake}</div>
          </div>
        </div>

        <details>
          <summary className="crs-expand-summary"><span className="chev">›</span> Show modules ({c.modules.length})</summary>
          <div className="crs-modules">
            {c.modules.map((m, i) => (
              <div key={i} className="crs-module">
                <span className="ix">{String(i + 1).padStart(2, '0')}</span>
                <span>{m}</span>
              </div>
            ))}
          </div>
        </details>

        <div className="crs-foot">
          <span className="t-mono-sm" style={{ color: 'var(--ink-4)' }}>
            <span style={{ color: 'var(--cyan-500)' }}>●</span> Open enrollment
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <a href="apply.html" className="btn btn-sm btn-ghost-light">Brochure</a>
            <a href="apply.html" className="btn btn-sm btn-primary">Apply <span className="arr" aria-hidden="true">→</span></a>
          </div>
        </div>
      </div>
    </article>
  );
}

/* ----- Course visual SVG icons ----- */

function CrsVisSvg({ kind }) {
  if (kind === 'plan') return <CrsPlan />;
  if (kind === 'compass') return <CrsCompass />;
  if (kind === 'orthographic') return <CrsOrtho />;
  if (kind === 'isometric') return <CrsIso />;
  if (kind === 'part') return <CrsPart />;
  if (kind === 'contour') return <CrsContour />;
  return null;
}

function CrsPlan() {
  return (
    <svg className="crs-vis-svg" viewBox="0 0 600 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {/* Floor plan: rooms + dimensions */}
      <rect x="40" y="50" width="220" height="120" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" fill="none" />
      <rect x="260" y="50" width="140" height="60" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" fill="none" />
      <rect x="260" y="110" width="140" height="60" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" fill="none" />
      <rect x="400" y="50" width="160" height="120" stroke="rgba(45,111,247,0.8)" strokeWidth="1.5" fill="rgba(45,111,247,0.06)" />
      <line x1="120" y1="50" x2="120" y2="170" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="40" y1="190" x2="560" y2="190" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
      <line x1="40" y1="185" x2="40" y2="195" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
      <line x1="560" y1="185" x2="560" y2="195" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
      <text x="300" y="206" fontFamily="Geist Mono, monospace" fontSize="9" fill="rgba(255,255,255,0.5)" textAnchor="middle" letterSpacing="0.1em">12 800.00</text>
    </svg>
  );
}
function CrsCompass() {
  return (
    <svg className="crs-vis-svg" viewBox="0 0 600 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <circle cx="300" cy="120" r="76" stroke="rgba(255,255,255,0.4)" strokeWidth="1" fill="none" />
      <circle cx="300" cy="120" r="60" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none" />
      <line x1="300" y1="44" x2="300" y2="196" stroke="rgba(255,255,255,0.5)" />
      <line x1="224" y1="120" x2="376" y2="120" stroke="rgba(255,255,255,0.5)" />
      <line x1="300" y1="44" x2="244" y2="178" stroke="rgba(45,111,247,0.8)" strokeWidth="1.5" />
      <line x1="300" y1="44" x2="356" y2="178" stroke="rgba(61,217,214,0.8)" strokeWidth="1.5" />
      <circle cx="300" cy="44" r="3" fill="rgba(45,111,247,1)" />
    </svg>
  );
}
function CrsOrtho() {
  return (
    <svg className="crs-vis-svg" viewBox="0 0 600 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {/* 3 views */}
      <rect x="60" y="40" width="120" height="80" stroke="rgba(255,255,255,0.55)" fill="none" strokeWidth="1.2" />
      <rect x="240" y="40" width="120" height="80" stroke="rgba(255,255,255,0.55)" fill="none" strokeWidth="1.2" />
      <rect x="60" y="140" width="120" height="60" stroke="rgba(45,111,247,0.85)" fill="rgba(45,111,247,0.05)" strokeWidth="1.2" />
      {/* internal cut lines */}
      <line x1="100" y1="40" x2="100" y2="120" stroke="rgba(255,255,255,0.3)" strokeDasharray="3 3" />
      <line x1="280" y1="40" x2="280" y2="120" stroke="rgba(255,255,255,0.3)" strokeDasharray="3 3" />
      {/* projection lines */}
      <line x1="60" y1="130" x2="180" y2="130" stroke="rgba(255,255,255,0.3)" strokeDasharray="2 4" />
      <line x1="180" y1="80" x2="240" y2="80" stroke="rgba(255,255,255,0.3)" strokeDasharray="2 4" />
      {/* labels */}
      <text x="62" y="34" fontFamily="Geist Mono, monospace" fontSize="9" fill="rgba(255,255,255,0.5)" letterSpacing="0.08em">FRONT</text>
      <text x="242" y="34" fontFamily="Geist Mono, monospace" fontSize="9" fill="rgba(255,255,255,0.5)" letterSpacing="0.08em">SIDE</text>
      <text x="62" y="134" fontFamily="Geist Mono, monospace" fontSize="9" fill="rgba(61,217,214,0.8)" letterSpacing="0.08em">TOP</text>
    </svg>
  );
}
function CrsIso() {
  return (
    <svg className="crs-vis-svg" viewBox="0 0 600 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g transform="translate(220,40)">
        <path d="M0 80 L80 40 L160 80 L80 120 Z" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" fill="none" />
        <path d="M0 80 L0 140 L80 180 L80 120" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" fill="none" />
        <path d="M80 180 L160 140 L160 80" stroke="rgba(45,111,247,0.85)" strokeWidth="1.2" fill="rgba(45,111,247,0.06)" />
        <path d="M80 120 L80 180" stroke="rgba(255,255,255,0.3)" strokeDasharray="3 3" />
        {/* roof slope */}
        <path d="M0 80 L80 20 L160 80" stroke="rgba(61,217,214,0.8)" strokeWidth="1" fill="none" />
        <path d="M80 20 L80 40" stroke="rgba(255,255,255,0.3)" strokeDasharray="3 3" />
      </g>
    </svg>
  );
}
function CrsPart() {
  return (
    <svg className="crs-vis-svg" viewBox="0 0 600 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {/* gear-ish mechanical part */}
      <g transform="translate(300,120)">
        <circle r="58" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" fill="none" />
        <circle r="42" stroke="rgba(255,255,255,0.35)" strokeWidth="1" fill="none" />
        <circle r="16" stroke="rgba(45,111,247,0.85)" strokeWidth="1.2" fill="rgba(45,111,247,0.08)" />
        <line x1="-58" y1="0" x2="58" y2="0" stroke="rgba(255,255,255,0.25)" strokeDasharray="3 3" />
        <line x1="0" y1="-58" x2="0" y2="58" stroke="rgba(255,255,255,0.25)" strokeDasharray="3 3" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map(d => (
          <line key={d} x1="0" y1="-58" x2="0" y2="-68" stroke="rgba(255,255,255,0.6)" strokeWidth="1.2" transform={`rotate(${d})`} />
        ))}
      </g>
    </svg>
  );
}
function CrsContour() {
  return (
    <svg className="crs-vis-svg" viewBox="0 0 600 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {/* contour lines */}
      {[40, 60, 80, 100, 120, 140].map((r, i) => (
        <ellipse key={i} cx="300" cy="120" rx={r * 2.2} ry={r * 0.9} stroke={`rgba(${i === 2 ? '45,111,247' : '255,255,255'},${0.2 + i * 0.06})`} strokeWidth="0.8" fill="none" />
      ))}
      {/* contour labels */}
      <text x="40" y="120" fontFamily="Geist Mono, monospace" fontSize="9" fill="rgba(255,255,255,0.5)">142</text>
      <text x="540" y="120" fontFamily="Geist Mono, monospace" fontSize="9" fill="rgba(255,255,255,0.5)">142</text>
    </svg>
  );
}

/* ----- Recommender section ----- */

function RecommenderSection() {
  return (
    <section className="section section-light" data-screen-label="03 Recommender">
      <div className="page">
        <div className="recommender">
          <div>
            <span className="section-label" style={{ marginBottom: 16, color: 'var(--cyan-400)' }}><span className="bar"></span>PROGRAMME RECOMMENDER</span>
            <h2 className="rec-title">Not sure which programme is the right one? <em>We'll help you choose.</em></h2>
            <p className="rec-sub">
              Our recommender looks at your background, software preference, mode of study, and current South African engineering demand &mdash; and ranks the programmes by fit.
            </p>
            <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
              <button type="button" className="btn btn-primary" onClick={() => window.dispatchEvent(new CustomEvent('aida:open'))}>
                Start match · 90 sec
              </button>
              <a href="apply.html" className="btn btn-ghost-dark">Skip to apply</a>
            </div>
          </div>

          <div className="rec-card">
            <div className="rec-card-head">
              <span className="rec-card-h">SAMPLE RESULT · CAREER CHANGER · 28</span>
              <span className="pill pill-blue-dark" style={{ height: 22, padding: '0 8px', fontSize: 9.5 }}>★ MATCHED</span>
            </div>
            <div className="rec-row">
              <div className="rec-row-l">
                <span className="rec-row-title">MDDOP N4/N5 · Part-time</span>
                <span className="rec-row-sub">18 mo · evenings · DBN</span>
              </div>
              <div className="rec-row-bar">
                <span className="pct">96%</span>
                <div className="tr"><i style={{ width: '96%' }} /></div>
              </div>
            </div>
            <div className="rec-row">
              <div className="rec-row-l">
                <span className="rec-row-title">Revit Architecture</span>
                <span className="rec-row-sub">10 wk · stackable</span>
              </div>
              <div className="rec-row-bar">
                <span className="pct" style={{ color: 'var(--blue-400)' }}>84%</span>
                <div className="tr"><i style={{ width: '84%', background: 'var(--blue-400)' }} /></div>
              </div>
            </div>
            <div className="rec-row">
              <div className="rec-row-l">
                <span className="rec-row-title">Bridging Course</span>
                <span className="rec-row-sub">3 mo · pre-req</span>
              </div>
              <div className="rec-row-bar">
                <span className="pct" style={{ color: 'var(--blue-400)' }}>78%</span>
                <div className="tr"><i style={{ width: '78%', background: 'var(--blue-400)' }} /></div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}

function SoftStackSection() {
  return (
    <section className="section section-paper" data-screen-label="04 Software Stack">
      <div className="page">
        <div className="sec-head">
          <div className="sec-head-meta">
            <span className="section-label"><span className="bar"></span>SECTION 04 / SOFTWARE</span>
            <h2 className="sec-head-title">The Autodesk stack, end to end.</h2>
          </div>
          <p className="sec-head-sub">
            Drawing offices in South Africa run on AutoCAD, Revit and Inventor. We teach all three — as native tools, not theory exercises. Specialisations layer Civil 3D and Navisworks on top.
          </p>
        </div>

        <div className="soft-stack">
          {SOFT_MARKS.map(s => (
            <div key={s.name} className="soft-card">
              <span className="soft-mark" style={{ background: s.color }}>{s.letter}</span>
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

ReactDOM.createRoot(document.getElementById('root')).render(<CoursesPage />);
