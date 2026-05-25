import { Kpi } from './viz';

/* Static, illustrative data — these sections are design placeholders with no backend yet. */

const STUDENTS = [
  { id: 'STU-1042', initials: 'TM', name: 'Thandi Mokoena', email: 'thandi.m@email.com', cohort: 'MDDOP N4 · Jan 2026 · JHB', week: '14/40', avg: 82.4, att: 96, fees: 'On track' },
  { id: 'STU-1041', initials: 'NS', name: 'Naledi Sithole', email: 'naledi.s@email.com', cohort: 'MDDOP N4 · Jan 2026 · JHB', week: '14/40', avg: 88.1, att: 94, fees: 'On track' },
  { id: 'STU-1038', initials: 'SD', name: 'Sipho Dlamini', email: 'sipho.d@email.com', cohort: 'MDDOP N5 · Sep 2025 · DBN', week: '34/40', avg: 76.8, att: 88, fees: 'Overdue' },
  { id: 'STU-1036', initials: 'AN', name: 'Aisha Naidoo', email: 'aisha.n@email.com', cohort: 'Bridging · Mar 2026 · DBN', week: '8/12', avg: 71.2, att: 92, fees: 'On track' },
  { id: 'STU-1029', initials: 'BP', name: 'Brandon Pieterse', email: 'brandon.p@email.com', cohort: 'Revit · Apr 2026 · Online', week: '4/10', avg: 84.4, att: 100, fees: 'Paid upfront' },
  { id: 'STU-1024', initials: 'JV', name: 'Jacques van Wyk', email: 'jvw@email.com', cohort: 'Inventor · Mar 2026 · Online', week: '6/10', avg: 90.2, att: 98, fees: 'Paid upfront' },
  { id: 'STU-1018', initials: 'RM', name: 'Riaan Müller', email: 'riaan.m@email.com', cohort: 'MDDOP N4 · Sep 2025 · JHB', week: '34/40', avg: 79.4, att: 86, fees: 'On track' },
  { id: 'STU-1015', initials: 'KP', name: 'Karabo Phiri', email: 'k.phiri@email.com', cohort: 'MDDOP N4 · Sep 2025 · JHB', week: '34/40', avg: 62.8, att: 71, fees: 'Overdue' },
];

function barColor(v: number, mid: number, low: number, base: string) {
  return v < low ? '#C24545' : v < mid ? '#C97B1A' : base;
}

export function StudentsView() {
  return (
    <>
      <div className="adm-page-head">
        <div>
          <div className="breadcrumb">
            OPERATIONS<span className="sep">/</span>STUDENTS
          </div>
          <h1>Students</h1>
          <p>Illustrative roster · 248 active across 12 cohorts · 18 at-risk.</p>
        </div>
        <div className="adm-actions">
          <button type="button" className="btn btn-sm btn-ghost-light">Export roster</button>
          <button type="button" className="btn btn-sm btn-primary">+ Enroll student</button>
        </div>
      </div>

      <div className="adm-kpi-row">
        <Kpi label="Active students" value="248" delta="+38 vs last term" direction="up" sparkSeed={5} />
        <Kpi label="Avg. attendance" value="89%" delta="↑ 2 pts vs prev." direction="up" sparkSeed={6} />
        <Kpi label="At-risk" value="18" delta="<70% att. or avg." direction="down" sparkSeed={7} />
        <Kpi label="Completion · 24mo" value="91%" delta="last 4 cohorts" direction="up" sparkSeed={8} />
      </div>

      <div className="adm-card">
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
              </tr>
            </thead>
            <tbody>
              {STUDENTS.map((s) => (
                <tr key={s.id}>
                  <td>
                    <span className="cell-id">{s.id}</span>
                  </td>
                  <td>
                    <div className="cell-name">
                      <span className="av">{s.initials}</span>
                      <div>
                        <div className="n">{s.name}</div>
                        <div className="e">{s.email}</div>
                      </div>
                    </div>
                  </td>
                  <td>
                    <span style={{ fontSize: 13 }}>{s.cohort}</span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>{s.week}</span>
                  </td>
                  <td>
                    <span className="fit-bar">
                      <span className="tr">
                        <i style={{ width: `${s.avg}%`, background: barColor(s.avg, 80, 70, 'var(--blue-500)') }} />
                      </span>
                      <span className="v">{s.avg}%</span>
                    </span>
                  </td>
                  <td>
                    <span className="fit-bar">
                      <span className="tr">
                        <i style={{ width: `${s.att}%`, background: barColor(s.att, 85, 75, 'var(--cyan-500)') }} />
                      </span>
                      <span className="v">{s.att}%</span>
                    </span>
                  </td>
                  <td>
                    <span className={`status-pill status-${s.fees === 'Overdue' ? 'overdue' : 'paid'}`}>{s.fees}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="adm-pager">
          <span>SHOWING 8 OF 248 STUDENTS · ILLUSTRATIVE</span>
        </div>
      </div>
    </>
  );
}

const PROGRAMMES = [
  { code: 'MDDOP-N4', title: 'MDDOP N4 — Engineering Drawing', d: '10 mo', e: '142', c: '150', f: 'Full-time', m: 'Faculty: 6 · Modules: 8' },
  { code: 'MDDOP-N5', title: 'MDDOP N5 — Engineering Drawing', d: '8 mo', e: '86', c: '90', f: 'Full-time', m: 'Faculty: 5 · Modules: 8' },
  { code: 'BRIDGE', title: 'Bridging Course', d: '3 mo', e: '24', c: '60', f: 'Mixed', m: 'Faculty: 3 · Modules: 4' },
  { code: 'CAD-A', title: 'AutoCAD Essentials', d: '8 wk', e: '32', c: '40', f: 'Online', m: 'Faculty: 2 · Modules: 4' },
  { code: 'CAD-R', title: 'Revit Architecture', d: '10 wk', e: '18', c: '40', f: 'Online', m: 'Faculty: 2 · Modules: 4' },
  { code: 'CAD-I', title: 'Inventor for Mechanical', d: '10 wk', e: '14', c: '30', f: 'Online', m: 'Faculty: 1 · Modules: 4' },
];

export function ProgrammesView() {
  return (
    <>
      <div className="adm-page-head">
        <div>
          <div className="breadcrumb">
            ACADEMIC<span className="sep">/</span>PROGRAMMES
          </div>
          <h1>Programmes</h1>
          <p>Illustrative · 6 active programmes · 316 active enrollments · 410 seats total.</p>
        </div>
        <div className="adm-actions">
          <button type="button" className="btn btn-sm btn-primary">+ New programme</button>
        </div>
      </div>

      <div className="adm-grid-3">
        {PROGRAMMES.map((p) => {
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
                  <div className="prog-card-stat-v">
                    {p.e}
                    <span style={{ color: 'var(--ink-4)', fontWeight: 400 }}>/{p.c}</span>
                  </div>
                </div>
                <div>
                  <div className="prog-card-stat-k">FORMAT</div>
                  <div className="prog-card-stat-v">{p.f}</div>
                </div>
              </div>
              <div className="cap-vis">
                <div className="bar">
                  <i style={{ width: `${pct}%`, background: pct > 90 ? '#C24545' : pct > 70 ? '#C97B1A' : 'var(--blue-500)' }} />
                </div>
                <span className="lbl">{pct}% capacity</span>
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

const PAYMENTS = [
  { id: 'PAY-3082', student: 'Thandi Mokoena', cohort: 'MDDOP N4 · Jan 2026', plan: 'Monthly 3/10', amt: 'R 3,950', due: '01 Jun 2026', status: 'paid' },
  { id: 'PAY-3081', student: 'Sipho Dlamini', cohort: 'MDDOP N5 · Sep 2025', plan: 'Monthly 8/18', amt: 'R 2,200', due: '01 May 2026', status: 'overdue' },
  { id: 'PAY-3080', student: 'Aisha Naidoo', cohort: 'Bridging · Mar 2026', plan: 'Monthly 2/3', amt: 'R 4,500', due: '01 Jun 2026', status: 'pending' },
  { id: 'PAY-3079', student: 'Naledi Sithole', cohort: 'MDDOP N4 · Jan 2026', plan: 'Monthly 3/10', amt: 'R 3,950', due: '01 Jun 2026', status: 'paid' },
  { id: 'PAY-3078', student: 'Brandon Pieterse', cohort: 'Revit · Apr 2026', plan: 'Upfront', amt: 'R 8,400', due: 'PAID', status: 'paid' },
  { id: 'PAY-3077', student: 'Karabo Phiri', cohort: 'MDDOP N4 · Sep 2025', plan: 'Monthly 8/18', amt: 'R 2,200', due: '01 Apr 2026', status: 'overdue' },
  { id: 'PAY-3076', student: 'Jacques van Wyk', cohort: 'Inventor · Mar 2026', plan: 'Upfront', amt: 'R 7,650', due: 'PAID', status: 'paid' },
];

export function FinanceView() {
  return (
    <>
      <div className="adm-page-head">
        <div>
          <div className="breadcrumb">
            FINANCE<span className="sep">/</span>PAYMENTS
          </div>
          <h1>Payments</h1>
          <p>Illustrative · R 482,400 outstanding · 18 overdue accounts.</p>
        </div>
        <div className="adm-actions">
          <button type="button" className="btn btn-sm btn-ghost-light">Send reminders</button>
          <button type="button" className="btn btn-sm btn-primary">+ Record payment</button>
        </div>
      </div>

      <div className="adm-kpi-row">
        <Kpi label="Collected · MTD" value="R 612K" delta="+R 84K vs prev." direction="up" sparkSeed={9} />
        <Kpi label="Outstanding" value="R 482K" delta="↓ R 64K vs last wk" direction="down" sparkSeed={10} />
        <Kpi label="Overdue · 30d+" value="18" delta="R 198K total" direction="down" sparkSeed={11} />
        <Kpi label="Plans on track" value="216" delta="of 248 active" direction="up" sparkSeed={12} />
      </div>

      <div className="adm-card">
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
              </tr>
            </thead>
            <tbody>
              {PAYMENTS.map((p) => (
                <tr key={p.id}>
                  <td>
                    <span className="cell-id">{p.id}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: 13.5, fontWeight: 500 }}>{p.student}</span>
                  </td>
                  <td>
                    <span style={{ fontSize: 13 }}>{p.cohort}</span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>{p.plan}</span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink)' }}>{p.amt}</span>
                  </td>
                  <td>
                    <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: p.status === 'overdue' ? '#C24545' : 'var(--ink-3)' }}>{p.due}</span>
                  </td>
                  <td>
                    <span className={`status-pill status-${p.status}`}>{p.status}</span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <div className="adm-pager">
          <span>SHOWING 7 RECORDS · ILLUSTRATIVE</span>
        </div>
      </div>
    </>
  );
}

export function PlaceholderView({ title, breadcrumb, desc }: { title: string; breadcrumb: string; desc: string }) {
  return (
    <>
      <div className="adm-page-head">
        <div>
          <div className="breadcrumb">
            {breadcrumb}
            <span className="sep">/</span>
            {title.toUpperCase()}
          </div>
          <h1>{title}</h1>
          <p>{desc}</p>
        </div>
      </div>
      <div className="adm-card adm-placeholder">
        <div className="inner">
          <div className="glyph">◇</div>
          <h3>{title} workspace</h3>
          <p>{desc}</p>
          <div style={{ display: 'flex', gap: 8, marginTop: 8 }}>
            <button type="button" className="btn btn-sm btn-ghost-light">Documentation</button>
            <button type="button" className="btn btn-sm btn-primary">Configure</button>
          </div>
        </div>
      </div>
    </>
  );
}
