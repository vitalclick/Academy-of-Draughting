/* ============================================================
   ADMIN DASHBOARD — staff console
   ============================================================ */

const ADMIN_NAV = [
  { sec: 'OPERATIONS' },
  { k: 'overview',       l: 'Overview',         ic: '◫', count: null },
  { k: 'applications',   l: 'Applications',     ic: '◇', count: 47, urgent: true },
  { k: 'students',       l: 'Students',         ic: '◍', count: 248 },
  { k: 'communications', l: 'Communications',   ic: '✉', count: 12 },
  { sec: 'ACADEMIC' },
  { k: 'programmes',     l: 'Programmes',       ic: '◰' },
  { k: 'schedule',       l: 'Schedule',         ic: '☰' },
  { k: 'faculty',        l: 'Faculty',          ic: '◐' },
  { sec: 'FINANCE' },
  { k: 'finance',        l: 'Payments',         ic: 'R' },
  { k: 'reports',        l: 'Reports',          ic: '⌗' },
  { sec: 'SETTINGS' },
  { k: 'settings',       l: 'Settings',         ic: '⚙' },
];

function AdminPage() {
  const [tab, setTab] = React.useState('overview');
  const [drawer, setDrawer] = React.useState(null);

  return (
    <>
      <div className="admin-shell" data-screen-label={`Admin · ${tab}`}>
        <AdminSidebar tab={tab} setTab={setTab} />
        <div className="admin-main">
          <AdminTopBar tab={tab} />
          <div className="admin-content">
            {tab === 'overview'       && <OverviewView setTab={setTab} setDrawer={setDrawer} />}
            {tab === 'applications'   && <ApplicationsView setDrawer={setDrawer} />}
            {tab === 'students'       && <StudentsView />}
            {tab === 'communications' && <CommsView />}
            {tab === 'programmes'     && <ProgrammesView />}
            {tab === 'finance'        && <FinanceView />}
            {tab === 'schedule'       && <PlaceholderView title="Schedule" desc="Cohort and module schedule editor — drag-and-drop weekly grid, conflict detection, room assignments." />}
            {tab === 'faculty'        && <PlaceholderView title="Faculty" desc="Instructor roster, load balancing, industry-active hours, contract status." />}
            {tab === 'reports'        && <PlaceholderView title="Reports" desc="Enrollment funnel reports, completion rates, employer outcomes, regulatory exports (DHET, QCTO)." />}
            {tab === 'settings'       && <PlaceholderView title="Settings" desc="Academy profile, intake calendar, fee structure, document requirements, integrations." />}
          </div>
        </div>
      </div>

      {drawer && <ApplicationDrawer app={drawer} onClose={() => setDrawer(null)} />}
    </>
  );
}

/* ------------------------------------------------------------
   SIDEBAR
   ------------------------------------------------------------ */

function AdminSidebar({ tab, setTab }) {
  return (
    <aside className="admin-side">
      <div className="admin-side-brand">
        <img src="assets/logo-light.png" alt="Academy of Advanced Draughting" />
      </div>
      <div className="admin-side-brand" style={{ padding: '10px 20px', borderBottom: '1px solid var(--line-on-dark)' }}>
        <div className="admin-side-brand-meta">
          <span className="t-mono-xs">CONSOLE</span>
          <span className="as-env">Admissions & Operations</span>
        </div>
      </div>

      {ADMIN_NAV.map((item, i) => {
        if (item.sec) return <div key={i} className="admin-side-sec">{item.sec}</div>;
        return (
          <button
            key={item.k}
            type="button"
            className={`admin-side-link ${tab === item.k ? 'is-active' : ''}`}
            onClick={() => setTab(item.k)}
          >
            <span className="icn">{item.ic}</span>
            <span>{item.l}</span>
            {item.count != null && (
              <span className={`count ${item.urgent ? 'urgent' : ''}`}>{item.count}</span>
            )}
          </button>
        );
      })}

      <div className="admin-side-foot">
        <span className="av">SM</span>
        <div className="who">
          <div className="who-name">Sarah Mthembu</div>
          <div className="who-role">ADMISSIONS LEAD</div>
        </div>
      </div>
    </aside>
  );
}

/* ------------------------------------------------------------
   TOP BAR
   ------------------------------------------------------------ */

function AdminTopBar({ tab }) {
  const titles = {
    overview: 'Operations',
    applications: 'Applications',
    students: 'Students',
    communications: 'Communications',
    programmes: 'Programmes',
    finance: 'Payments',
    schedule: 'Schedule',
    faculty: 'Faculty',
    reports: 'Reports',
    settings: 'Settings',
  };
  return (
    <header className="admin-top">
      <div className="admin-top-search">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="M21 21l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input type="text" placeholder={`Search ${titles[tab].toLowerCase()}, students, programmes…`} />
        <kbd>⌘K</kbd>
      </div>

      <div className="admin-top-actions">
        <button type="button" className="iconbtn" aria-label="Notifications">
          🔔
          <span className="badge">5</span>
        </button>
        <button type="button" className="iconbtn" aria-label="Help">?</button>
        <a href="index.html" className="btn btn-sm btn-ghost-light">View public site ↗</a>
        <button type="button" className="btn btn-sm btn-primary">+ New application</button>
      </div>
    </header>
  );
}

/* ------------------------------------------------------------
   OVERVIEW
   ------------------------------------------------------------ */

function OverviewView({ setTab, setDrawer }) {
  return (
    <>
      <div className="adm-page-head">
        <div>
          <div className="breadcrumb">OPERATIONS<span className="sep">/</span>OVERVIEW</div>
          <h1>Good morning, Sarah.</h1>
          <p>You have <strong style={{ color: 'var(--blue-700)' }}>47 applications</strong> awaiting review — 12 flagged as time-sensitive. Jan 2026 intake closes in 18 days.</p>
        </div>
        <div className="adm-actions">
          <button type="button" className="btn btn-sm btn-ghost-light">Export weekly report</button>
          <button type="button" className="btn btn-sm btn-solid-dark">Run intake forecast</button>
        </div>
      </div>

      <div className="adm-kpi-row">
        <Kpi label="Applications · 7d" value="64" delta="+12 vs prev." direction="up" sparkSeed={1} />
        <Kpi label="Approved · 30d"    value="38" delta="71% rate"      direction="up" sparkSeed={2} />
        <Kpi label="Enrolled · live"   value="248" delta="JHB 142 · DBN 86 · Online 20" direction="up" sparkSeed={3} />
        <Kpi label="Outstanding · ZAR" value="R 482K" delta="-R 64K vs last wk" direction="down" sparkSeed={4} />
      </div>

      <div className="adm-grid-2" style={{ marginBottom: 16 }}>
        <div className="adm-card">
          <div className="adm-card-head">
            <div>
              <h3 className="adm-card-title">Enrollment funnel · last 30 days</h3>
              <div className="adm-card-sub">JAN 2026 INTAKE · ALL CAMPUSES</div>
            </div>
            <button type="button" className="btn btn-sm btn-ghost-light" onClick={() => setTab('applications')}>View applications →</button>
          </div>
          <div className="adm-card-body">
            <div className="adm-funnel">
              {[
                { l: 'Site visitors',     s: 'Programme + apply page', n: 4280, pct: 100, w: 100 },
                { l: 'Started chat',      s: 'Admissions assistant',   n: 942,  pct: 22,  w: 78 },
                { l: 'Started form',      s: 'Application step 1',     n: 312,  pct: 7.3, w: 54 },
                { l: 'Documents parsed',  s: 'OCR completed',          n: 192,  pct: 4.5, w: 38 },
                { l: 'Submitted',         s: 'Ready for review',       n: 124,  pct: 2.9, w: 28 },
                { l: 'Approved',          s: 'Offer issued',           n: 86,   pct: 2.0, w: 18 },
                { l: 'Enrolled',          s: 'Paid + signed',          n: 58,   pct: 1.4, w: 12 },
              ].map((r, i) => (
                <div key={i} className="adm-funnel-row">
                  <div className="adm-funnel-label">
                    <span className="l-k">{r.l}</span>
                    <span className="l-sub">{r.s}</span>
                  </div>
                  <div className="adm-funnel-bar">
                    <i style={{ width: `${r.w}%` }} />
                    <span className={`c ${r.w < 30 ? 'outside' : ''}`}>{r.n.toLocaleString()}</span>
                  </div>
                  <div className="adm-funnel-pct">{r.pct}%</div>
                </div>
              ))}
            </div>
          </div>
        </div>

        <div className="adm-card">
          <div className="adm-card-head">
            <div>
              <h3 className="adm-card-title">Intake calendar</h3>
              <div className="adm-card-sub">NEXT 6 INTAKES</div>
            </div>
            <button type="button" className="btn btn-sm btn-ghost-light">Manage</button>
          </div>
          <div className="adm-card-body">
            <div className="adm-intake-list">
              <IntakeRow d="12" m="NOV" t="Jan 2026 · MDDOP N4" s="JHB · Full-time" cap={48} max={50} state="warn" />
              <IntakeRow d="12" m="NOV" t="Jan 2026 · MDDOP N4" s="DBN · Full-time" cap={38} max={45} state="ok" />
              <IntakeRow d="08" m="JAN" t="Jan 2026 · MDDOP N4" s="Online · Self-paced" cap={62} max={120} state="ok" />
              <IntakeRow d="14" m="MAR" t="Bridging Course" s="JHB · DBN · Online" cap={18} max={60} state="ok" />
              <IntakeRow d="01" m="MAY" t="May 2026 · MDDOP N4" s="All campuses" cap={4} max={150} state="ok" />
              <IntakeRow d="16" m="MAY" t="Revit Architecture" s="Online · stackable" cap={0} max={40} state="ok" />
            </div>
          </div>
        </div>
      </div>

      <div className="adm-grid-2">
        <div className="adm-card">
          <div className="adm-card-head">
            <div>
              <h3 className="adm-card-title">Recent applications · needs review</h3>
              <div className="adm-card-sub">SHOWING 5 OF 47 PENDING</div>
            </div>
            <button type="button" className="btn btn-sm btn-ghost-light" onClick={() => setTab('applications')}>Open inbox →</button>
          </div>
          <div className="adm-card-body flush">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Applicant</th>
                  <th>Programme</th>
                  <th>Fit</th>
                  <th>Status</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {RECENT_APPS.slice(0, 5).map(a => (
                  <tr key={a.id} onClick={() => setDrawer(a)}>
                    <td><span className="cell-id">{a.id}</span></td>
                    <td>
                      <div className="cell-name">
                        <span className="av">{a.initials}</span>
                        <div>
                          <div className="n">{a.name}</div>
                          <div className="e">{a.email}</div>
                        </div>
                      </div>
                    </td>
                    <td>{a.programme}</td>
                    <td>
                      <span className="fit-bar">
                        <span className="tr"><i style={{ width: `${a.fit}%` }} /></span>
                        <span className="v">{a.fit}%</span>
                      </span>
                    </td>
                    <td><span className={`status-pill status-${a.status}`}>{a.statusLabel}</span></td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)' }}>{a.age}</span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>

        <div className="adm-card">
          <div className="adm-card-head">
            <div>
              <h3 className="adm-card-title">Activity</h3>
              <div className="adm-card-sub">LAST 24 HOURS</div>
            </div>
          </div>
          <div className="adm-card-body">
            <div className="adm-activity">
              <Activity dot="cyan" msg={<><strong>Lerato Khumalo</strong> documents verified · <span className="meta">MDDOP N4</span></>} time="14 min ago" />
              <Activity        msg={<>You approved <strong>Sipho Dlamini</strong>'s application · <span className="meta">JHB · FT</span></>} time="48 min ago" />
              <Activity dot="warn" msg={<><strong>Aisha Naidoo</strong> matric document failed parse · <span className="meta">manual review</span></>} time="2h ago" />
              <Activity msg={<>WhatsApp · <strong>Brandon Pieterse</strong> asked about Revit short course pricing</>} time="3h ago" />
              <Activity dot="cyan" msg={<>Payment received · <strong>R 12,500</strong> · Lerato K. · <span className="meta">monthly 3/10</span></>} time="5h ago" />
              <Activity msg={<>New application · <strong>Zinhle Mokoena</strong> · Bridging Course</>} time="8h ago" />
              <Activity dot="red" msg={<><strong>2 applications</strong> missed 48h SLA · <span className="meta">JHB queue</span></>} time="11h ago" />
              <Activity msg={<>Intake forecast updated · <strong>Jan 2026</strong> 96% full at JHB</>} time="14h ago" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* Recent applications data (also used by ApplicationsView) */
const RECENT_APPS = [
  { id: 'APP-2046', initials: 'LK', name: 'Lerato Khumalo',   email: 'lerato.k@email.com',     programme: 'MDDOP N4 · Full-time',  campus: 'JHB',     fit: 96, status: 'review',    statusLabel: 'In review',   age: '12 min', source: 'Admissions chat', applied: '14 May 2026 · 09:42', mode: 'Full-time', funding: 'Monthly', city: 'Soweto', phone: '+27 82 555 0184', idn: '0408265104084', matric: '2024 · L5 Bachelor', school: "St. Anne's College" },
  { id: 'APP-2045', initials: 'SD', name: 'Sipho Dlamini',    email: 'sipho.d@gmail.com',      programme: 'MDDOP N4 · Part-time',  campus: 'JHB',     fit: 88, status: 'new',       statusLabel: 'New',         age: '36 min', source: 'Direct',           applied: '14 May 2026 · 09:18', mode: 'Part-time', funding: 'Upfront', city: 'Johannesburg', phone: '+27 73 555 0102', idn: '9706085012089', matric: '2014 · Bachelor', school: 'Pretoria Boys High' },
  { id: 'APP-2044', initials: 'AN', name: 'Aisha Naidoo',     email: 'aisha.naidoo@email.com', programme: 'Bridging Course',       campus: 'DBN',     fit: 78, status: 'review',    statusLabel: 'Docs flagged',age: '1h 12m', source: 'Programme recommender', applied: '14 May 2026 · 08:42', mode: 'Full-time', funding: 'Monthly', city: 'Durban', phone: '+27 84 555 0145', idn: '0512115016082', matric: '2023 · Higher Cert.', school: 'Durban Girls High' },
  { id: 'APP-2043', initials: 'BP', name: 'Brandon Pieterse', email: 'brandon.p@email.com',    programme: 'Revit Architecture',    campus: 'Online',  fit: 71, status: 'review',    statusLabel: 'Pricing Q', age: '3h',     source: 'WhatsApp · DBN',     applied: '14 May 2026 · 06:48', mode: 'Online', funding: 'Employer', city: 'Cape Town', phone: '+27 71 555 0119', idn: '8809115082083', matric: '2006', school: 'Bishops College' },
  { id: 'APP-2042', initials: 'ZM', name: 'Zinhle Mokoena',   email: 'z.mokoena@email.com',    programme: 'Bridging Course',       campus: 'JHB',     fit: 64, status: 'new',       statusLabel: 'New',         age: '8h',     source: 'Direct',           applied: '13 May 2026 · 23:12', mode: 'Full-time', funding: 'Monthly', city: 'Soweto', phone: '+27 82 555 0163', idn: '0211135102083', matric: '2024 · L3', school: 'Soweto Sec.' },
  { id: 'APP-2041', initials: 'TM', name: 'Thandi Mokoena',   email: 'thandi.m@email.com',     programme: 'MDDOP N4 · Full-time',  campus: 'JHB',     fit: 96, status: 'approved',  statusLabel: 'Approved',    age: '1d',     source: 'Admissions chat',  applied: '13 May 2026 · 14:08', mode: 'Full-time', funding: 'Monthly', city: 'Johannesburg', phone: '+27 82 555 0188', idn: '0408265104084', matric: '2024 · Bachelor', school: "St. Anne's College" },
  { id: 'APP-2040', initials: 'JV', name: 'Jacques van Wyk',  email: 'jvw@email.com',          programme: 'Inventor Mechanical',   campus: 'Online',  fit: 82, status: 'approved',  statusLabel: 'Approved',    age: '1d',     source: 'Direct',           applied: '13 May 2026 · 11:20', mode: 'Online', funding: 'Upfront', city: 'Bloemfontein', phone: '+27 82 555 0211', idn: '9501175026081', matric: '2012', school: 'Grey College' },
  { id: 'APP-2039', initials: 'NS', name: 'Nomvula Sithole',  email: 'nomvula.s@email.com',    programme: 'MDDOP N4 · Online',     campus: 'Online',  fit: 79, status: 'waitlist',  statusLabel: 'Waitlist',    age: '2d',     source: 'Direct',           applied: '12 May 2026 · 16:34', mode: 'Online', funding: 'Monthly', city: 'Polokwane', phone: '+27 82 555 0145', idn: '9905115078081', matric: '2017 · Diploma', school: 'Capricorn TVET' },
  { id: 'APP-2038', initials: 'RM', name: 'Riaan Müller',     email: 'riaan.m@email.com',      programme: 'Civil Specialisation',  campus: 'JHB',     fit: 90, status: 'review',    statusLabel: 'In review',   age: '2d',     source: 'Admissions chat',  applied: '12 May 2026 · 10:08', mode: 'Part-time', funding: 'Employer', city: 'Johannesburg', phone: '+27 82 555 0212', idn: '8504175102083', matric: '2003', school: 'Hoërskool Voortrekker' },
  { id: 'APP-2037', initials: 'KP', name: 'Karabo Phiri',     email: 'k.phiri@email.com',      programme: 'MDDOP N4 · Full-time',  campus: 'DBN',     fit: 72, status: 'rejected',  statusLabel: 'Declined',    age: '3d',     source: 'Direct',           applied: '11 May 2026 · 14:08', mode: 'Full-time', funding: 'Monthly', city: 'Pietermaritzburg', phone: '+27 82 555 0188', idn: '0408265104084', matric: '2025 · L2', school: 'PMB Tech' },
];

function Kpi({ label, value, delta, direction, sparkSeed }) {
  return (
    <div className="adm-kpi">
      <div className="adm-kpi-head">
        <span className="adm-kpi-label">{label}</span>
        <span className={`adm-kpi-pill ${direction === 'up' ? 'up' : 'down'}`}>{direction === 'up' ? '↑' : '↓'}</span>
      </div>
      <div className="adm-kpi-value">{value}</div>
      <div className="adm-kpi-meta">{delta}</div>
      <div className="adm-kpi-spark"><Sparkline seed={sparkSeed} /></div>
    </div>
  );
}

function Sparkline({ seed = 0 }) {
  const pts = React.useMemo(() => {
    const out = [];
    let v = 20;
    for (let i = 0; i < 18; i++) {
      v += Math.sin((i + seed * 2) * 0.6) * 4 + ((i + seed) % 3 - 1) * 2;
      v = Math.max(8, Math.min(28, v));
      out.push(v);
    }
    return out;
  }, [seed]);
  const d = pts.map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i / (pts.length - 1)) * 200} ${28 - v}`).join(' ');
  return (
    <svg className="spark" viewBox="0 0 200 28" preserveAspectRatio="none" aria-hidden="true">
      <path d={d} fill="none" stroke="var(--blue-500)" strokeWidth="1.5" strokeLinejoin="round" />
      <path d={`${d} L 200 28 L 0 28 Z`} fill="var(--blue-100)" opacity="0.5" />
    </svg>
  );
}

function IntakeRow({ d, m, t, s, cap, max, state }) {
  const pct = max ? Math.min(100, Math.round((cap / max) * 100)) : 0;
  return (
    <div className="adm-intake-row">
      <div className="adm-intake-date">
        <div className="m">{m}</div>
        <div className="d">{d}</div>
      </div>
      <div>
        <div className="adm-intake-meta-h">{t}</div>
        <div className="adm-intake-meta-s">{s}</div>
      </div>
      <div className="adm-intake-cap">
        <span className="seats">{cap}<span style={{ color: 'var(--ink-4)' }}>/{max}</span></span>
        <span className="cap-bar"><i className={pct > 90 ? 'full' : pct > 70 ? 'warn' : ''} style={{ width: `${pct}%` }} /></span>
      </div>
    </div>
  );
}

function Activity({ dot, msg, time }) {
  return (
    <div className="adm-act">
      <span className={`adm-act-dot ${dot || ''}`}></span>
      <div className="adm-act-msg">{msg}</div>
      <span className="adm-act-time">{time}</span>
    </div>
  );
}

/* ------------------------------------------------------------
   APPLICATIONS — inbox + drawer
   ------------------------------------------------------------ */

function ApplicationsView({ setDrawer }) {
  const [filter, setFilter] = React.useState('all');
  const counts = {
    all: RECENT_APPS.length, new: 2, review: 4, approved: 2, waitlist: 1, rejected: 1,
  };
  const filtered = filter === 'all' ? RECENT_APPS : RECENT_APPS.filter(a => a.status === filter);

  return (
    <>
      <div className="adm-page-head">
        <div>
          <div className="breadcrumb">OPERATIONS<span className="sep">/</span>APPLICATIONS</div>
          <h1>Applications</h1>
          <p>47 pending review · 12 flagged time-sensitive · 48h SLA target</p>
        </div>
        <div className="adm-actions">
          <button type="button" className="btn btn-sm btn-ghost-light">Export CSV</button>
          <button type="button" className="btn btn-sm btn-ghost-light">Bulk approve</button>
          <button type="button" className="btn btn-sm btn-primary">+ New application</button>
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-toolbar">
          <div className="adm-toolbar-left">
            <div className="adm-tabs">
              {[
                ['all', 'All',         counts.all],
                ['new', 'New',         counts.new],
                ['review', 'In review', counts.review],
                ['approved', 'Approved', counts.approved],
                ['waitlist', 'Waitlist', counts.waitlist],
                ['rejected', 'Declined', counts.rejected],
              ].map(([k, l, c]) => (
                <button
                  key={k}
                  type="button"
                  className={`adm-tab ${filter === k ? 'is-active' : ''}`}
                  onClick={() => setFilter(k)}
                >{l}<span className="count">{c}</span></button>
              ))}
            </div>
          </div>
          <div className="adm-toolbar-right">
            <select className="btn btn-sm btn-ghost-light" style={{ paddingRight: 24 }}>
              <option>All programmes</option>
              <option>MDDOP N4/N5</option>
              <option>Bridging</option>
              <option>Short courses</option>
            </select>
            <select className="btn btn-sm btn-ghost-light" style={{ paddingRight: 24 }}>
              <option>All campuses</option>
              <option>Johannesburg</option>
              <option>Durban</option>
              <option>Online</option>
            </select>
            <button type="button" className="btn btn-sm btn-ghost-light">⌄ Sort: Newest</button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th style={{ width: 30 }}><input type="checkbox" /></th>
                <th>ID</th>
                <th>Applicant</th>
                <th>Programme</th>
                <th>Campus</th>
                <th>Source</th>
                <th>Fit</th>
                <th>Status</th>
                <th>Age</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(a => (
                <tr key={a.id} onClick={() => setDrawer(a)}>
                  <td onClick={(e) => e.stopPropagation()}><input type="checkbox" /></td>
                  <td><span className="cell-id">{a.id}</span></td>
                  <td>
                    <div className="cell-name">
                      <span className="av">{a.initials}</span>
                      <div>
                        <div className="n">{a.name}</div>
                        <div className="e">{a.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>{a.programme}</td>
                  <td>{a.campus}</td>
                  <td><span className="t-mono-sm" style={{ color: 'var(--ink-3)' }}>{a.source}</span></td>
                  <td>
                    <span className="fit-bar">
                      <span className="tr"><i style={{ width: `${a.fit}%` }} /></span>
                      <span className="v">{a.fit}%</span>
                    </span>
                  </td>
                  <td><span className={`status-pill status-${a.status}`}>{a.statusLabel}</span></td>
                  <td><span className="t-mono-sm" style={{ color: 'var(--ink-4)' }}>{a.age}</span></td>
                  <td>
                    <span style={{ color: 'var(--ink-4)', fontSize: 18 }}>›</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="adm-pager">
          <span>SHOWING {filtered.length} OF {filter === 'all' ? 47 : counts[filter]}</span>
          <div className="adm-pager-controls">
            <button type="button" className="adm-pager-btn">‹</button>
            <button type="button" className="adm-pager-btn is-active">1</button>
            <button type="button" className="adm-pager-btn">2</button>
            <button type="button" className="adm-pager-btn">3</button>
            <button type="button" className="adm-pager-btn">4</button>
            <button type="button" className="adm-pager-btn">5</button>
            <button type="button" className="adm-pager-btn">›</button>
          </div>
        </div>
      </div>
    </>
  );
}

function ApplicationDrawer({ app, onClose }) {
  return (
    <>
      <div className="adm-drawer-backdrop" onClick={onClose}></div>
      <div className="adm-drawer" role="dialog">
        <div className="adm-drawer-head">
          <div style={{ flex: 1 }}>
            <div className="adm-drawer-h-meta">{app.id} <span className="sep">·</span> Applied {app.applied} <span className="sep">·</span> via {app.source}</div>
            <h2 className="adm-drawer-h-title">{app.name}</h2>
            <div className="adm-drawer-h-sub">
              <span className={`status-pill status-${app.status}`} style={{ marginRight: 8 }}>{app.statusLabel}</span>
              {app.programme} · {app.campus} campus
            </div>
          </div>
          <button type="button" className="adm-drawer-close" onClick={onClose} aria-label="Close">×</button>
        </div>

        <div className="adm-drawer-body">
          <div className="adm-drawer-section">
            <h4>Applicant details</h4>
            <div className="adm-kv-grid">
              <Kv k="Full name" v={app.name} />
              <Kv k="Email"     v={app.email} />
              <Kv k="Mobile"    v={app.phone} />
              <Kv k="City"      v={app.city} />
              <Kv k="ID number" v={app.idn} />
              <Kv k="Matric"    v={app.matric} />
            </div>
          </div>

          <div className="adm-drawer-section">
            <h4>Programme & mode</h4>
            <div className="adm-kv-grid">
              <Kv k="Programme"   v={app.programme} />
              <Kv k="Campus"      v={app.campus} />
              <Kv k="Mode"        v={app.mode} />
              <Kv k="Funding"     v={app.funding} />
            </div>
          </div>

          <div className="adm-drawer-section">
            <h4>Documents</h4>
            <div className="adm-doc">
              <span className="adm-doc-icn">PDF</span>
              <div>
                <div className="adm-doc-name">matric_certificate.pdf</div>
                <div className="adm-doc-meta">1.8 MB · uploaded 14 May 2026 · 09:14</div>
              </div>
              <span className="adm-doc-check">✓ PARSED · 6/6</span>
            </div>
            <div className="adm-doc">
              <span className="adm-doc-icn">JPG</span>
              <div>
                <div className="adm-doc-name">id_document.jpg</div>
                <div className="adm-doc-meta">2.4 MB · uploaded 14 May 2026 · 09:14</div>
              </div>
              <span className="adm-doc-check">✓ PARSED · 4/4</span>
            </div>
          </div>

          <div className="adm-drawer-section">
            <h4>Fit assessment</h4>
            <div style={{ padding: 14, border: '1px solid var(--line-on-light-2)', borderRadius: 8, background: 'var(--paper)' }}>
              <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'baseline' }}>
                <span style={{ fontSize: 15, fontWeight: 500 }}>{app.programme}</span>
                <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--blue-700)' }}>{app.fit}% match</span>
              </div>
              <div style={{ height: 6, background: 'var(--paper-2)', borderRadius: 999, overflow: 'hidden', marginTop: 8 }}>
                <div style={{ height: '100%', width: `${app.fit}%`, background: 'var(--blue-500)' }} />
              </div>
              <p style={{ fontSize: 13, color: 'var(--ink-3)', marginTop: 12, lineHeight: 1.5 }}>
                Strong matric pass with mathematics. Profile aligns with the cohort baseline. No bridging required. Recommended for approval.
              </p>
            </div>
          </div>

          <div className="adm-drawer-section">
            <h4>Communication history</h4>
            <div className="adm-activity">
              <Activity msg={<><strong>You</strong> noted: "Strong portfolio interest — expedite review"</>} time="12 min ago" />
              <Activity dot="cyan" msg={<>Email sent · <strong>application received</strong> confirmation</>} time="22 min ago" />
              <Activity msg={<>Applicant completed <strong>step 4 · submitted</strong></>} time="38 min ago" />
              <Activity msg={<>Started application via admissions chat · session 4 min 12 sec</>} time="2h ago" />
            </div>
          </div>
        </div>

        <div className="adm-drawer-foot">
          <div className="l">
            <button type="button" className="btn btn-sm btn-ghost-light">Request more info</button>
            <button type="button" className="btn btn-sm btn-ghost-light">Add note</button>
          </div>
          <div className="r">
            <button type="button" className="btn btn-sm btn-ghost-light">Decline</button>
            <button type="button" className="btn btn-sm btn-primary">Approve & issue offer</button>
          </div>
        </div>
      </div>
    </>
  );
}

function Kv({ k, v }) {
  return (
    <div className="adm-kv">
      <div className="adm-kv-k">{k}</div>
      <div className="adm-kv-v">{v}</div>
    </div>
  );
}

/* ------------------------------------------------------------
   STUDENTS
   ------------------------------------------------------------ */

const STUDENTS = [
  { id: 'STU-1042', initials: 'TM', name: 'Thandi Mokoena',  email: 'thandi.m@email.com',  cohort: 'MDDOP N4 · Jan 2026 · JHB', week: '14/40', avg: 82.4, att: 96, fees: 'On track',     status: 'active' },
  { id: 'STU-1041', initials: 'NS', name: 'Naledi Sithole',  email: 'naledi.s@email.com',  cohort: 'MDDOP N4 · Jan 2026 · JHB', week: '14/40', avg: 88.1, att: 94, fees: 'On track',     status: 'active' },
  { id: 'STU-1038', initials: 'SD', name: 'Sipho Dlamini',   email: 'sipho.d@email.com',   cohort: 'MDDOP N5 · Sep 2025 · DBN', week: '34/40', avg: 76.8, att: 88, fees: 'Overdue',      status: 'active' },
  { id: 'STU-1036', initials: 'AN', name: 'Aisha Naidoo',    email: 'aisha.n@email.com',   cohort: 'Bridging · Mar 2026 · DBN', week: '8/12',  avg: 71.2, att: 92, fees: 'On track',     status: 'active' },
  { id: 'STU-1029', initials: 'BP', name: 'Brandon Pieterse', email: 'brandon.p@email.com', cohort: 'Revit · Apr 2026 · Online', week: '4/10',  avg: 84.4, att: 100, fees: 'Paid upfront', status: 'active' },
  { id: 'STU-1024', initials: 'JV', name: 'Jacques van Wyk', email: 'jvw@email.com',       cohort: 'Inventor · Mar 2026 · Online', week: '6/10', avg: 90.2, att: 98, fees: 'Paid upfront', status: 'active' },
  { id: 'STU-1018', initials: 'RM', name: 'Riaan Müller',    email: 'riaan.m@email.com',   cohort: 'MDDOP N4 · Sep 2025 · JHB', week: '34/40', avg: 79.4, att: 86, fees: 'On track',     status: 'active' },
  { id: 'STU-1015', initials: 'KP', name: 'Karabo Phiri',    email: 'k.phiri@email.com',   cohort: 'MDDOP N4 · Sep 2025 · JHB', week: '34/40', avg: 62.8, att: 71, fees: 'Overdue',      status: 'active' },
];

function StudentsView() {
  return (
    <>
      <div className="adm-page-head">
        <div>
          <div className="breadcrumb">OPERATIONS<span className="sep">/</span>STUDENTS</div>
          <h1>Students</h1>
          <p>248 active across 12 cohorts · 18 at-risk · 6 awaiting onboarding</p>
        </div>
        <div className="adm-actions">
          <button type="button" className="btn btn-sm btn-ghost-light">Export roster</button>
          <button type="button" className="btn btn-sm btn-ghost-light">At-risk report</button>
          <button type="button" className="btn btn-sm btn-primary">+ Enroll student</button>
        </div>
      </div>

      <div className="adm-kpi-row">
        <Kpi label="Active students" value="248"  delta="+38 vs last term" direction="up"   sparkSeed={5} />
        <Kpi label="Avg. attendance" value="89%"  delta="↑ 2 pts vs prev." direction="up"   sparkSeed={6} />
        <Kpi label="At-risk"         value="18"   delta="<70% att. or avg." direction="down" sparkSeed={7} />
        <Kpi label="Completion · 24mo" value="91%" delta="last 4 cohorts"  direction="up"   sparkSeed={8} />
      </div>

      <div className="adm-card">
        <div className="adm-toolbar">
          <div className="adm-toolbar-left">
            <div className="adm-tabs">
              {['All','MDDOP N4','MDDOP N5','Bridging','Short courses'].map(t => (
                <button key={t} type="button" className={`adm-tab ${t === 'All' ? 'is-active' : ''}`}>{t}</button>
              ))}
            </div>
          </div>
          <div className="adm-toolbar-right">
            <select className="btn btn-sm btn-ghost-light" style={{ paddingRight: 24 }}>
              <option>All cohorts</option>
              <option>Jan 2026</option>
              <option>Sep 2025</option>
              <option>May 2025</option>
            </select>
            <button type="button" className="btn btn-sm btn-ghost-light">⌄ Sort: Avg.</button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Student</th>
                <th>Cohort</th>
                <th>Week</th>
                <th>Average</th>
                <th>Attendance</th>
                <th>Fees</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {STUDENTS.map(s => (
                <tr key={s.id}>
                  <td><span className="cell-id">{s.id}</span></td>
                  <td>
                    <div className="cell-name">
                      <span className="av">{s.initials}</span>
                      <div>
                        <div className="n">{s.name}</div>
                        <div className="e">{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td><span style={{ fontSize: 13 }}>{s.cohort}</span></td>
                  <td><span className="t-mono-sm" style={{ color: 'var(--ink-3)' }}>{s.week}</span></td>
                  <td>
                    <span className="fit-bar">
                      <span className="tr"><i style={{ width: `${s.avg}%`, background: s.avg < 70 ? '#C24545' : s.avg < 80 ? '#C97B1A' : 'var(--blue-500)' }} /></span>
                      <span className="v">{s.avg}%</span>
                    </span>
                  </td>
                  <td>
                    <span className="fit-bar">
                      <span className="tr"><i style={{ width: `${s.att}%`, background: s.att < 75 ? '#C24545' : s.att < 85 ? '#C97B1A' : 'var(--cyan-500)' }} /></span>
                      <span className="v">{s.att}%</span>
                    </span>
                  </td>
                  <td><span className={`status-pill status-${s.fees === 'Overdue' ? 'overdue' : 'paid'}`}>{s.fees}</span></td>
                  <td><span style={{ color: 'var(--ink-4)', fontSize: 18 }}>›</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="adm-pager">
          <span>SHOWING 8 OF 248 STUDENTS</span>
          <div className="adm-pager-controls">
            <button type="button" className="adm-pager-btn">‹</button>
            <button type="button" className="adm-pager-btn is-active">1</button>
            <button type="button" className="adm-pager-btn">2</button>
            <button type="button" className="adm-pager-btn">31</button>
            <button type="button" className="adm-pager-btn">›</button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------
   PROGRAMMES
   ------------------------------------------------------------ */

function ProgrammesView() {
  const programmes = [
    { code: 'MDDOP-N4', title: 'MDDOP N4 — Engineering Drawing', d: '10 mo', e: '142', c: '150', f: 'Full-time', m: 'Faculty: 6 · Modules: 8' },
    { code: 'MDDOP-N5', title: 'MDDOP N5 — Engineering Drawing', d: '8 mo',  e: '86',  c: '90',  f: 'Full-time', m: 'Faculty: 5 · Modules: 8' },
    { code: 'BRIDGE',   title: 'Bridging Course',                 d: '3 mo',  e: '24',  c: '60',  f: 'Mixed',     m: 'Faculty: 3 · Modules: 4' },
    { code: 'CAD-A',    title: 'AutoCAD Essentials',              d: '8 wk',  e: '32',  c: '40',  f: 'Online',    m: 'Faculty: 2 · Modules: 4' },
    { code: 'CAD-R',    title: 'Revit Architecture',              d: '10 wk', e: '18',  c: '40',  f: 'Online',    m: 'Faculty: 2 · Modules: 4' },
    { code: 'CAD-I',    title: 'Inventor for Mechanical',         d: '10 wk', e: '14',  c: '30',  f: 'Online',    m: 'Faculty: 1 · Modules: 4' },
  ];

  return (
    <>
      <div className="adm-page-head">
        <div>
          <div className="breadcrumb">ACADEMIC<span className="sep">/</span>PROGRAMMES</div>
          <h1>Programmes</h1>
          <p>6 active programmes · 316 active enrollments · 410 seats total</p>
        </div>
        <div className="adm-actions">
          <button type="button" className="btn btn-sm btn-ghost-light">Curriculum changelog</button>
          <button type="button" className="btn btn-sm btn-primary">+ New programme</button>
        </div>
      </div>

      <div className="adm-grid-3">
        {programmes.map(p => {
          const pct = Math.round((parseInt(p.e) / parseInt(p.c)) * 100);
          return (
            <div key={p.code} className="prog-card">
              <div className="prog-card-head">
                <div>
                  <div className="prog-card-code">{p.code}</div>
                  <h3>{p.title}</h3>
                </div>
                <span className="status-pill status-active">Active</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>{p.m}</div>
              <div className="prog-card-stats">
                <div>
                  <div className="prog-card-stat-k">DURATION</div>
                  <div className="prog-card-stat-v">{p.d}</div>
                </div>
                <div>
                  <div className="prog-card-stat-k">ENROLLED</div>
                  <div className="prog-card-stat-v">{p.e}<span style={{ color: 'var(--ink-4)', fontWeight: 400 }}>/{p.c}</span></div>
                </div>
                <div>
                  <div className="prog-card-stat-k">FORMAT</div>
                  <div className="prog-card-stat-v">{p.f}</div>
                </div>
              </div>
              <div>
                <div className="cap-vis">
                  <div className="bar"><i style={{ width: `${pct}%`, background: pct > 90 ? '#C24545' : pct > 70 ? '#C97B1A' : 'var(--blue-500)' }} /></div>
                  <span className="lbl">{pct}% capacity</span>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <button type="button" className="btn btn-sm btn-ghost-light" style={{ flex: 1 }}>Edit</button>
                <button type="button" className="btn btn-sm btn-ghost-light" style={{ flex: 1 }}>Schedule</button>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}

/* ------------------------------------------------------------
   FINANCE
   ------------------------------------------------------------ */

const PAYMENTS = [
  { id: 'PAY-3082', student: 'Thandi Mokoena',  cohort: 'MDDOP N4 · Jan 2026', plan: 'Monthly 3/10', amt: 'R 3,950',  due: '01 Jun 2026', status: 'paid' },
  { id: 'PAY-3081', student: 'Sipho Dlamini',   cohort: 'MDDOP N5 · Sep 2025', plan: 'Monthly 8/18', amt: 'R 2,200',  due: '01 May 2026', status: 'overdue' },
  { id: 'PAY-3080', student: 'Aisha Naidoo',    cohort: 'Bridging · Mar 2026', plan: 'Monthly 2/3',  amt: 'R 4,500',  due: '01 Jun 2026', status: 'pending' },
  { id: 'PAY-3079', student: 'Naledi Sithole',  cohort: 'MDDOP N4 · Jan 2026', plan: 'Monthly 3/10', amt: 'R 3,950',  due: '01 Jun 2026', status: 'paid' },
  { id: 'PAY-3078', student: 'Brandon Pieterse', cohort: 'Revit · Apr 2026',    plan: 'Upfront',      amt: 'R 8,400',  due: 'PAID',       status: 'paid' },
  { id: 'PAY-3077', student: 'Karabo Phiri',    cohort: 'MDDOP N4 · Sep 2025', plan: 'Monthly 8/18', amt: 'R 2,200',  due: '01 Apr 2026', status: 'overdue' },
  { id: 'PAY-3076', student: 'Jacques van Wyk', cohort: 'Inventor · Mar 2026', plan: 'Upfront',      amt: 'R 7,650',  due: 'PAID',       status: 'paid' },
];

function FinanceView() {
  return (
    <>
      <div className="adm-page-head">
        <div>
          <div className="breadcrumb">FINANCE<span className="sep">/</span>PAYMENTS</div>
          <h1>Payments</h1>
          <p>R 482,400 outstanding · 18 overdue accounts · next batch run 01 Jun</p>
        </div>
        <div className="adm-actions">
          <button type="button" className="btn btn-sm btn-ghost-light">Export ledger</button>
          <button type="button" className="btn btn-sm btn-ghost-light">Send reminders</button>
          <button type="button" className="btn btn-sm btn-primary">+ Record payment</button>
        </div>
      </div>

      <div className="adm-kpi-row">
        <Kpi label="Collected · MTD"  value="R 612K" delta="+R 84K vs prev." direction="up"   sparkSeed={9} />
        <Kpi label="Outstanding"      value="R 482K" delta="↓ R 64K vs last wk" direction="down" sparkSeed={10} />
        <Kpi label="Overdue · 30d+"   value="18"     delta="R 198K total"     direction="down" sparkSeed={11} />
        <Kpi label="Plans on track"   value="216"    delta="of 248 active"    direction="up"   sparkSeed={12} />
      </div>

      <div className="adm-card">
        <div className="adm-toolbar">
          <div className="adm-toolbar-left">
            <div className="adm-tabs">
              {['All','Paid','Pending','Overdue','Plans'].map(t => (
                <button key={t} type="button" className={`adm-tab ${t === 'All' ? 'is-active' : ''}`}>{t}</button>
              ))}
            </div>
          </div>
          <div className="adm-toolbar-right">
            <select className="btn btn-sm btn-ghost-light" style={{ paddingRight: 24 }}>
              <option>This month</option>
              <option>This term</option>
              <option>Year-to-date</option>
            </select>
            <button type="button" className="btn btn-sm btn-ghost-light">⌄ Sort: Due date</button>
          </div>
        </div>

        <div style={{ overflowX: 'auto' }}>
          <table className="adm-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Student</th>
                <th>Cohort</th>
                <th>Plan</th>
                <th>Amount</th>
                <th>Due / paid</th>
                <th>Status</th>
                <th></th>
              </tr>
            </thead>
            <tbody>
              {PAYMENTS.map(p => (
                <tr key={p.id}>
                  <td><span className="cell-id">{p.id}</span></td>
                  <td><span style={{ fontSize: 13.5, fontWeight: 500 }}>{p.student}</span></td>
                  <td><span style={{ fontSize: 13 }}>{p.cohort}</span></td>
                  <td><span className="t-mono-sm" style={{ color: 'var(--ink-3)' }}>{p.plan}</span></td>
                  <td><span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink)', letterSpacing: '-0.01em' }}>{p.amt}</span></td>
                  <td><span className="t-mono-sm" style={{ color: p.status === 'overdue' ? '#C24545' : 'var(--ink-3)' }}>{p.due}</span></td>
                  <td><span className={`status-pill status-${p.status}`}>{p.status}</span></td>
                  <td><span style={{ color: 'var(--ink-4)', fontSize: 18 }}>›</span></td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>

        <div className="adm-pager">
          <span>SHOWING 7 OF 1,284 RECORDS</span>
          <div className="adm-pager-controls">
            <button type="button" className="adm-pager-btn">‹</button>
            <button type="button" className="adm-pager-btn is-active">1</button>
            <button type="button" className="adm-pager-btn">2</button>
            <button type="button" className="adm-pager-btn">3</button>
            <button type="button" className="adm-pager-btn">›</button>
          </div>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------
   COMMUNICATIONS
   ------------------------------------------------------------ */

const THREADS = [
  { id: 1, initials: 'BP', name: 'Brandon Pieterse', ch: 'wa', time: '14m', prev: 'Thanks — what does the Revit short course cost...', unread: true,  app: 'APP-2043' },
  { id: 2, initials: 'AN', name: 'Aisha Naidoo',     ch: 'em', time: '1h',  prev: 'Hi, my matric upload keeps failing. Can I send it via...', unread: true,  app: 'APP-2044' },
  { id: 3, initials: 'LK', name: 'Lerato Khumalo',   ch: 'wa', time: '2h',  prev: 'Confirmed — see you Monday at 8am!', unread: false, app: 'APP-2046' },
  { id: 4, initials: 'TM', name: 'Thandi Mokoena',   ch: 'em', time: '4h',  prev: 'Re: Offer accepted. I will be at JHB campus on...', unread: false, app: 'APP-2041' },
  { id: 5, initials: 'JV', name: 'Jacques van Wyk',  ch: 'em', time: '1d',  prev: 'Could you send the Inventor module breakdown?', unread: false, app: 'APP-2040' },
  { id: 6, initials: 'ZM', name: 'Zinhle Mokoena',   ch: 'wa', time: '1d',  prev: 'Hello — I would like to apply for the bridging...', unread: false, app: 'APP-2042' },
  { id: 7, initials: 'KP', name: 'Karabo Phiri',     ch: 'sm', time: '2d',  prev: 'SMS · Auto-reminder: application status update', unread: false, app: null },
  { id: 8, initials: 'RM', name: 'Riaan Müller',     ch: 'em', time: '2d',  prev: 'Employer wants to pay upfront. Where do I send...', unread: false, app: 'APP-2038' },
];

function CommsView() {
  const [active, setActive] = React.useState(1);
  const thread = THREADS.find(t => t.id === active);

  return (
    <>
      <div className="adm-page-head">
        <div>
          <div className="breadcrumb">OPERATIONS<span className="sep">/</span>COMMUNICATIONS</div>
          <h1>Communications</h1>
          <p>12 unread · 4 WhatsApp · 8 email · avg reply &lt; 1 hour</p>
        </div>
        <div className="adm-actions">
          <button type="button" className="btn btn-sm btn-ghost-light">Templates</button>
          <button type="button" className="btn btn-sm btn-ghost-light">Broadcast</button>
          <button type="button" className="btn btn-sm btn-primary">+ New message</button>
        </div>
      </div>

      <div className="comm-grid">
        <div className="comm-list">
          <div className="adm-toolbar" style={{ borderBottom: '1px solid var(--line-on-light-2)' }}>
            <div className="adm-tabs">
              <button type="button" className="adm-tab is-active">Inbox <span className="count">12</span></button>
              <button type="button" className="adm-tab">Sent</button>
              <button type="button" className="adm-tab">Archived</button>
            </div>
          </div>
          {THREADS.map(t => (
            <div
              key={t.id}
              className={`comm-item ${active === t.id ? 'is-active' : ''}`}
              onClick={() => setActive(t.id)}
            >
              <span className="av">{t.initials}</span>
              <div style={{ minWidth: 0 }}>
                <div className="comm-item-head">
                  <span className="comm-item-name">{t.name}</span>
                  <span className="comm-item-time">{t.time}</span>
                </div>
                <div className="comm-item-prev">{t.prev}</div>
                <div style={{ marginTop: 6, display: 'flex', gap: 6, alignItems: 'center' }}>
                  <span className={`ch ${t.ch}`}>{t.ch === 'wa' ? 'WHATSAPP' : t.ch === 'em' ? 'EMAIL' : 'SMS'}</span>
                  {t.app && <span style={{ fontFamily: 'var(--font-mono)', fontSize: 10, color: 'var(--ink-4)' }}>{t.app}</span>}
                </div>
              </div>
              {t.unread && <span className="unread"></span>}
            </div>
          ))}
        </div>

        <div className="comm-thread">
          <div className="comm-thread-head">
            <div className="comm-thread-h-l">
              <span className="av" style={{ width: 36, height: 36, borderRadius: 8, background: 'var(--paper-2)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontWeight: 600, fontSize: 12 }}>{thread.initials}</span>
              <div>
                <div style={{ fontSize: 14.5, fontWeight: 500 }}>{thread.name}</div>
                <div style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-4)', letterSpacing: '0.04em' }}>
                  {thread.ch === 'wa' ? 'WHATSAPP · +27 71 555 0119' : thread.ch === 'em' ? `EMAIL · ${thread.name.toLowerCase().replace(' ', '.')}@email.com` : 'SMS'}
                  {thread.app && <> · <a href="#" style={{ color: 'var(--blue-700)' }}>{thread.app}</a></>}
                </div>
              </div>
            </div>
            <div style={{ display: 'flex', gap: 6 }}>
              <button type="button" className="btn btn-sm btn-ghost-light">Open in CRM</button>
              <button type="button" className="btn btn-sm btn-ghost-light">Archive</button>
            </div>
          </div>

          <div className="comm-thread-body">
            <div className="comm-msg">
              Hi, I'm interested in the Revit Architecture short course but the website only shows the duration. Could you send me the full price list and the next intake dates? My employer will be paying.
              <div className="meta">14:18 · WhatsApp</div>
            </div>
            <div className="comm-msg me">
              Hi Brandon — happy to help. The Revit short course runs 10 weeks online, R 8,400 if paid upfront or R 950/month over 9 months. Next intake is 1 May 2026.
              <div className="meta">14:22 · Sent</div>
            </div>
            <div className="comm-msg me">
              For employer billing I'll send a pro-forma invoice — what's their company name and VAT number?
              <div className="meta">14:22 · Sent</div>
            </div>
            <div className="comm-msg">
              Perfect. Company is <strong>Cape Engineering Consultants (Pty) Ltd</strong>, VAT 4520198765. Could you also confirm the software access is included?
              <div className="meta">14:24 · WhatsApp</div>
            </div>
            <div className="comm-msg">
              Thanks — what does the Revit short course cost for employer billing? Need to send PO this week.
              <div className="meta">14:32 · WhatsApp</div>
            </div>
          </div>

          <div className="comm-input">
            <textarea placeholder={`Reply to ${thread.name}…`} defaultValue=""></textarea>
            <div style={{ display: 'flex', flexDirection: 'column', gap: 6 }}>
              <button type="button" className="btn btn-sm btn-ghost-light">📎</button>
              <button type="button" className="btn btn-sm btn-primary">Send →</button>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}

/* ------------------------------------------------------------
   PLACEHOLDER for unbuilt views
   ------------------------------------------------------------ */

function PlaceholderView({ title, desc }) {
  return (
    <>
      <div className="adm-page-head">
        <div>
          <div className="breadcrumb">ADMIN<span className="sep">/</span>{title.toUpperCase()}</div>
          <h1>{title}</h1>
          <p>{desc}</p>
        </div>
      </div>
      <div className="adm-card" style={{ padding: 48, textAlign: 'center' }}>
        <div style={{ display: 'inline-flex', flexDirection: 'column', alignItems: 'center', gap: 12, maxWidth: 480, margin: '0 auto' }}>
          <div style={{ width: 56, height: 56, borderRadius: 12, background: 'var(--paper)', display: 'inline-flex', alignItems: 'center', justifyContent: 'center', fontFamily: 'var(--font-mono)', fontSize: 22, color: 'var(--ink-4)' }}>◇</div>
          <h3 style={{ fontSize: 18, fontWeight: 500, margin: 0 }}>{title} workspace</h3>
          <p style={{ fontSize: 14, color: 'var(--ink-3)', margin: 0, lineHeight: 1.5 }}>{desc}</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type="button" className="btn btn-sm btn-ghost-light">Documentation</button>
            <button type="button" className="btn btn-sm btn-primary">Configure</button>
          </div>
        </div>
      </div>
    </>
  );
}

ReactDOM.createRoot(document.getElementById('root')).render(<AdminPage />);
