/* ============================================================
   STUDENT PORTAL PAGE — Notion/Linear style dashboard
   ============================================================ */

const PORTAL_NAV = [
  { k: 'dashboard',   l: 'Dashboard',  ic: '▦' },
  { k: 'modules',     l: 'My Modules', ic: '◰' },
  { k: 'assignments', l: 'Assignments', ic: '◇' },
  { k: 'submissions', l: 'CAD Submissions', ic: '⌗' },
  { k: 'tutor',       l: 'Tutor & Help', ic: '✥' },
  { k: 'progress',    l: 'Progress',  ic: '◔' },
  { k: 'certification', l: 'Certification', ic: '☐' },
];

function PortalPage() {
  const [tab, setTab] = React.useState('dashboard');

  return (
    <PageShell active="portal" headerTone="light">
      <div className="portal-shell" data-screen-label="01 Portal">
        <aside className="portal-side">
          <div style={{ display: 'flex', alignItems: 'center', gap: 10, padding: '10px 12px 18px', borderBottom: '1px solid var(--line-on-light-2)', marginBottom: 12 }}>
            <span style={{ width: 32, height: 32, borderRadius: 8, background: 'var(--paper)', border: '1px solid var(--line-on-light)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontWeight: 600, color: 'var(--blue-500)' }}>TM</span>
            <div>
              <div style={{ fontSize: 13.5, fontWeight: 500 }}>Thandi M.</div>
              <div className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>MDDOP N4 · YEAR 1</div>
            </div>
          </div>

          <span className="portal-side-h">WORKSPACE</span>
          {PORTAL_NAV.map(n => (
            <button
              key={n.k}
              type="button"
              className={`portal-side-link ${tab === n.k ? 'is-active' : ''}`}
              onClick={() => setTab(n.k)}
            >
              <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-4)', width: 14, textAlign: 'center' }}>{n.ic}</span>
              <span>{n.l}</span>
            </button>
          ))}

          <span className="portal-side-h" style={{ marginTop: 16 }}>RESOURCES</span>
          <a href="courses.html" className="portal-side-link" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-4)', width: 14, textAlign: 'center' }}>◍</span>
            <span>Programme catalogue</span>
          </a>
          <a href="about.html" className="portal-side-link" style={{ textDecoration: 'none' }}>
            <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-4)', width: 14, textAlign: 'center' }}>◍</span>
            <span>Help & support</span>
          </a>
        </aside>

        <main className="portal-main">
          {tab === 'dashboard' && <PortalDashboard />}
          {tab !== 'dashboard' && <PortalPlaceholder name={PORTAL_NAV.find(n => n.k === tab).l} />}
        </main>
      </div>
    </PageShell>
  );
}

function PortalDashboard() {
  return (
    <>
      <div className="portal-greet">
        <div>
          <h1>Welcome back, Thandi.</h1>
          <p>Week 14 of 40 · MDDOP N4 · Johannesburg cohort. You're on pace.</p>
        </div>
        <div style={{ display: 'flex', gap: 8 }}>
          <button type="button" className="btn btn-sm btn-ghost-light"><span style={{ marginRight: 6 }}>↗</span>Upload drawing</button>
          <button type="button" className="btn btn-sm btn-primary">Ask tutor</button>
        </div>
      </div>

      <div className="portal-kpis">
        <div className="portal-kpi">
          <span className="portal-kpi-k">CURRENT AVERAGE</span>
          <span className="portal-kpi-v">82.4%</span>
          <span className="portal-kpi-d">↑ 3.1 vs last term</span>
        </div>
        <div className="portal-kpi">
          <span className="portal-kpi-k">ATTENDANCE</span>
          <span className="portal-kpi-v">96%</span>
          <span className="portal-kpi-d">Above cohort avg (88%)</span>
        </div>
        <div className="portal-kpi">
          <span className="portal-kpi-k">DUE THIS WEEK</span>
          <span className="portal-kpi-v">3</span>
          <span className="portal-kpi-d" style={{ color: 'var(--blue-400)' }}>2 drawings · 1 quiz</span>
        </div>
        <div className="portal-kpi">
          <span className="portal-kpi-k">PORTFOLIO</span>
          <span className="portal-kpi-v">28<span style={{ color: 'var(--ink-4)', fontSize: '50%' }}>/40</span></span>
          <span className="portal-kpi-d">12 drawings to graduation</span>
        </div>
      </div>

      <div className="portal-grid">
        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="portal-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2>Up next · This week</h2>
                <p className="pc-sub">3 deliverables · Sorted by due date</p>
              </div>
              <span className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>W14 · MAY 2026</span>
            </div>
            <Assignment num="MDDOP-103" title="Floor plan · Single residential dwelling (Rev B)" sub="MDDOP Theory & Practice · 1:50 scale · A2" due="DUE FRI" status="due" />
            <Assignment num="CAD-208"   title="Sectional view exercise · Mechanical part" sub="CAD AutoCAD · 1:1 scale · 3rd-angle projection" due="DUE FRI" status="due" />
            <Assignment num="QZ-014"    title="Pictorial drawing · Quiz module 6" sub="Pictorial Drawing · 20 min · open book" due="DUE SAT" status="due" />
            <Assignment num="MDDOP-101" title="Title block exercise · Rev A" sub="General Draughting · A3 · ISO standard" due="SUBMITTED 11 MAY" status="done" />
          </div>

          <div className="portal-card">
            <h2>Recent CAD submissions</h2>
            <p className="pc-sub">Auto-checked for layer discipline, dimensioning, title block compliance</p>

            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: 12, marginTop: 12 }}>
              {[
                { id: 'MDDOP-101.dwg', score: 91, status: 'PASS', kind: 'plan' },
                { id: 'CAD-207.dwg',   score: 84, status: 'PASS', kind: 'ortho' },
                { id: 'CAD-206.dwg',   score: 78, status: 'REV',  kind: 'iso' },
              ].map(s => (
                <div key={s.id} style={{ border: '1px solid var(--line-on-light-2)', borderRadius: 10, overflow: 'hidden' }}>
                  <div style={{ height: 110, background: '#071B3B', position: 'relative', overflow: 'hidden' }}>
                    {s.kind === 'plan' && <CrsPlan />}
                    {s.kind === 'ortho' && <CrsOrtho />}
                    {s.kind === 'iso'   && <CrsIso />}
                  </div>
                  <div style={{ padding: 12 }}>
                    <div className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>{s.id}</div>
                    <div style={{ display: 'flex', justifyContent: 'space-between', marginTop: 4 }}>
                      <span style={{ fontSize: 14, fontWeight: 500 }}>{s.score}%</span>
                      <span className="t-mono-xs" style={{ color: s.status === 'PASS' ? 'var(--cyan-500)' : 'var(--blue-500)' }}>✓ {s.status}</span>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div style={{ display: 'flex', flexDirection: 'column', gap: 16 }}>
          <div className="portal-card tutor-card">
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start' }}>
              <div>
                <h2>Faculty Tutor</h2>
                <p className="pc-sub">Stuck on layer management?</p>
              </div>
              <span className="pill pill-ai" style={{ height: 22, padding: '0 8px', fontSize: 10 }}>BETA</span>
            </div>
            <div className="tutor-thread">
              <div className="tutor-msg">Hi Thandi — I noticed your last submission used 47 layers on an A3 sheet. That's a lot. Want me to suggest a layer scheme aligned to ISO 13567?</div>
              <div className="tutor-msg me">Yes — show me a clean version of MDDOP-101</div>
              <div className="tutor-msg">Done. I've drafted a layer plan in your workspace · 12 layers · grouped by discipline. <a href="#" style={{ color: 'var(--cyan-400)' }}>Open it →</a></div>
            </div>
            <div style={{ marginTop: 12, padding: 8, border: '1px solid var(--line-on-dark)', borderRadius: 8, background: 'rgba(255,255,255,0.04)', display: 'flex', gap: 8 }}>
              <input style={{ flex: 1, background: 'transparent', border: 0, color: 'white', fontFamily: 'inherit', fontSize: 13, outline: 'none' }} placeholder="Ask the tutor anything…" />
              <button type="button" className="btn btn-sm btn-primary" style={{ height: 28, padding: '0 10px', fontSize: 12 }}>Ask</button>
            </div>
          </div>

          <div className="portal-card">
            <h2>Progress · MDDOP N4</h2>
            <p className="pc-sub">14 of 40 weeks · On track</p>
            <div style={{ height: 6, background: 'var(--paper-2)', borderRadius: 999, overflow: 'hidden', margin: '12px 0 8px' }}>
              <div style={{ height: '100%', width: '35%', background: 'var(--blue-500)', borderRadius: 999 }}></div>
            </div>
            <div className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>NEXT MILESTONE · CAD MIDTERM · WEEK 18</div>

            <div style={{ marginTop: 16, display: 'flex', flexDirection: 'column', gap: 8 }}>
              {[
                ['Building Draughting',       82], ['CAD AutoCAD', 91],
                ['Mechanical Draughting',     78], ['Pictorial Drawing', 84],
                ['General Draughting',        88],
              ].map(([m, p]) => (
                <div key={m}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', fontSize: 13 }}>
                    <span>{m}</span>
                    <span className="t-mono-sm" style={{ color: 'var(--ink-3)' }}>{p}%</span>
                  </div>
                  <div style={{ height: 3, background: 'var(--paper-2)', borderRadius: 999, marginTop: 4, overflow: 'hidden' }}>
                    <div style={{ height: '100%', width: `${p}%`, background: p >= 85 ? 'var(--cyan-500)' : 'var(--blue-400)' }}></div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          <div className="portal-card">
            <span className="aside-k">CAREER OUTLOOK</span>
            <h2 style={{ marginTop: 6 }}>Tracking toward Architectural Draughtsperson</h2>
            <p className="pc-sub">Based on your module performance · 78% match</p>
            <div style={{ marginTop: 10, padding: 12, background: 'var(--paper)', borderRadius: 8 }}>
              <div className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>MEDIAN START · GAUTENG</div>
              <div style={{ fontSize: 22, fontWeight: 500, letterSpacing: '-0.02em', marginTop: 2 }}>R 24 800<span style={{ color: 'var(--cyan-500)', fontSize: 12, fontFamily: 'var(--font-mono)', marginLeft: 8 }}>↑ 4.2%</span></div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

function Assignment({ num, title, sub, due, status }) {
  return (
    <div className="portal-asgn">
      <span className="portal-asgn-num">{num}</span>
      <div>
        <div className="portal-asgn-title">{title}</div>
        <div className="portal-asgn-sub">{sub}</div>
      </div>
      <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'flex-end', gap: 4 }}>
        <span className="portal-asgn-due">{due}</span>
        <span className={`portal-asgn-status pas-${status}`}>{status === 'done' ? '✓ Submitted' : '◇ Due'}</span>
      </div>
    </div>
  );
}

function PortalPlaceholder({ name }) {
  return (
    <div className="portal-greet">
      <div>
        <h1>{name}</h1>
        <p>This area is mocked for the demo. The dashboard tab has the full preview.</p>
      </div>
    </div>
  );
}

/* tiny inline reuse of course visuals */

function CrsPlan() {
  return (
    <svg viewBox="0 0 600 220" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, opacity: 0.7 }} aria-hidden="true">
      <rect x="40" y="50" width="220" height="120" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" fill="none" />
      <rect x="260" y="50" width="140" height="60" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" fill="none" />
      <rect x="260" y="110" width="140" height="60" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" fill="none" />
      <rect x="400" y="50" width="160" height="120" stroke="rgba(45,111,247,0.85)" strokeWidth="1.5" fill="rgba(45,111,247,0.08)" />
    </svg>
  );
}
function CrsOrtho() {
  return (
    <svg viewBox="0 0 600 220" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, opacity: 0.7 }} aria-hidden="true">
      <rect x="60" y="40" width="120" height="80" stroke="rgba(255,255,255,0.55)" fill="none" strokeWidth="1.2" />
      <rect x="240" y="40" width="120" height="80" stroke="rgba(255,255,255,0.55)" fill="none" strokeWidth="1.2" />
      <rect x="60" y="140" width="120" height="60" stroke="rgba(45,111,247,0.85)" fill="rgba(45,111,247,0.05)" strokeWidth="1.2" />
    </svg>
  );
}
function CrsIso() {
  return (
    <svg viewBox="0 0 600 220" preserveAspectRatio="xMidYMid slice" style={{ position: 'absolute', inset: 0, opacity: 0.7 }} aria-hidden="true">
      <g transform="translate(220,40)">
        <path d="M0 80 L80 40 L160 80 L80 120 Z" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" fill="none" />
        <path d="M0 80 L0 140 L80 180 L80 120" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" fill="none" />
        <path d="M80 180 L160 140 L160 80" stroke="rgba(45,111,247,0.85)" strokeWidth="1.2" fill="rgba(45,111,247,0.06)" />
      </g>
    </svg>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<PortalPage />);
