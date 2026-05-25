import {
  getOverviewCounts,
  getPaymentSummary,
  getProgrammeEnrollmentCounts,
} from '@/lib/db/admin';
import { COURSES } from '@/data/courses';
import { Kpi } from '../_components/viz';

export const dynamic = 'force-dynamic';

function rand(n: number) {
  return `R ${Math.round(n).toLocaleString('en-ZA')}`;
}

function pctOf(n: number, total: number) {
  if (!total) return 0;
  return Math.round((n / total) * 1000) / 10;
}

export default async function ReportsPage() {
  const [counts, payments, programmeCounts] = await Promise.all([
    getOverviewCounts(),
    getPaymentSummary(),
    getProgrammeEnrollmentCounts(),
  ]);

  const total = counts.applications_total;
  const decided = counts.applications_accepted;
  const other =
    total -
    counts.applications_submitted -
    counts.applications_under_review -
    counts.applications_accepted;

  const statusRows = [
    { l: 'All applications', s: 'Every status', n: total },
    { l: 'Submitted', s: 'Awaiting first review', n: counts.applications_submitted },
    { l: 'Under review', s: 'In progress', n: counts.applications_under_review },
    { l: 'Accepted', s: 'Offer issued', n: counts.applications_accepted },
    { l: 'Other', s: 'Draft, rejected, withdrawn', n: Math.max(0, other) },
  ];

  const programmeRows = COURSES.map((c) => ({
    code: c.code,
    title: c.title,
    ...(programmeCounts[c.id] ?? { active: 0, completed: 0, total: 0 }),
  }));

  const totalActive = programmeRows.reduce((sum, r) => sum + r.active, 0);
  const totalCompleted = programmeRows.reduce((sum, r) => sum + r.completed, 0);

  return (
    <>
      <div className="adm-page-head">
        <div>
          <div className="breadcrumb">
            FINANCE<span className="sep">/</span>REPORTS
          </div>
          <h1>Reports</h1>
          <p>
            {total} application{total === 1 ? '' : 's'} · {counts.applications_accepted} accepted ·{' '}
            {counts.students_active} active student{counts.students_active === 1 ? '' : 's'} ·{' '}
            {rand(payments.collected)} collected to date.
          </p>
        </div>
      </div>

      <div className="adm-kpi-row">
        <Kpi label="Applications · total" value={total} delta="all-time" direction="up" sparkSeed={5} />
        <Kpi
          label="Accepted"
          value={decided}
          delta={`${pctOf(decided, total)}% of applications`}
          direction="up"
          sparkSeed={6}
        />
        <Kpi label="Active students" value={counts.students_active} delta="enrolled" direction="up" sparkSeed={7} />
        <Kpi label="Leads captured" value={counts.leads_total} delta="all-time" direction="up" sparkSeed={8} />
      </div>

      <div className="adm-grid-2" style={{ marginBottom: 16 }}>
        <div className="adm-card">
          <div className="adm-card-head">
            <div>
              <h3 className="adm-card-title">Applications by status</h3>
              <div className="adm-card-sub">Live · share of all applications</div>
            </div>
          </div>
          <div className="adm-card-body">
            {total === 0 ? (
              <p style={{ color: 'var(--ink-4)', fontSize: 14 }}>No applications yet.</p>
            ) : (
              <div className="adm-funnel">
                {statusRows.map((r) => {
                  const w = pctOf(r.n, total);
                  return (
                    <div key={r.l} className="adm-funnel-row">
                      <div className="adm-funnel-label">
                        <span className="l-k">{r.l}</span>
                        <span className="l-sub">{r.s}</span>
                      </div>
                      <div className="adm-funnel-bar">
                        <i style={{ width: `${w}%` }} />
                        <span className={`c ${w < 30 ? 'outside' : ''}`}>{r.n.toLocaleString()}</span>
                      </div>
                      <div className="adm-funnel-pct">{w}%</div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </div>

        <div className="adm-card">
          <div className="adm-card-head">
            <div>
              <h3 className="adm-card-title">Enrolment by programme</h3>
              <div className="adm-card-sub">
                {totalActive} active · {totalCompleted} completed
              </div>
            </div>
          </div>
          <div className="adm-card-body flush">
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Programme</th>
                  <th>Active</th>
                  <th>Completed</th>
                  <th>Total</th>
                </tr>
              </thead>
              <tbody>
                {programmeRows.map((r) => (
                  <tr key={r.code}>
                    <td>
                      <div className="cell-name">
                        <div>
                          <div className="n">{r.title}</div>
                          <div className="e">{r.code}</div>
                        </div>
                      </div>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{r.active}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13 }}>{r.completed}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 13, color: 'var(--ink-3)' }}>
                        {r.total}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-card-head">
          <div>
            <h3 className="adm-card-title">Payments</h3>
            <div className="adm-card-sub">Fee ledger summary</div>
          </div>
        </div>
        <div className="adm-card-body">
          <div className="adm-grid-3">
            <div>
              <div className="prog-card-stat-k">COLLECTED</div>
              <div className="prog-card-stat-v">{rand(payments.collected)}</div>
            </div>
            <div>
              <div className="prog-card-stat-k">OUTSTANDING</div>
              <div className="prog-card-stat-v">{rand(payments.outstanding)}</div>
            </div>
            <div>
              <div className="prog-card-stat-k">OVERDUE · ON TRACK</div>
              <div className="prog-card-stat-v">
                {payments.overdue_count} · {payments.on_track}
              </div>
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
