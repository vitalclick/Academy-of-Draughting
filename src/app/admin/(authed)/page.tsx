import Link from 'next/link';
import { getOverviewCounts, listApplications } from '@/lib/db/admin';
import { Activity, IntakeRow, Kpi } from './_components/viz';

export const dynamic = 'force-dynamic';

function nameOf(a: { applicant?: { first_name?: string | null; last_name?: string | null; email?: string | null } | null }) {
  const ap = a.applicant;
  if (!ap) return '—';
  return `${ap.first_name ?? ''} ${ap.last_name ?? ''}`.trim() || ap.email || '—';
}

function initialsOf(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0 || name === '—') return '··';
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

const FUNNEL = [
  { l: 'Site visitors', s: 'Programme + apply page', n: 4280, pct: 100, w: 100 },
  { l: 'Started chat', s: 'Admissions assistant', n: 942, pct: 22, w: 78 },
  { l: 'Started form', s: 'Application step 1', n: 312, pct: 7.3, w: 54 },
  { l: 'Documents parsed', s: 'OCR completed', n: 192, pct: 4.5, w: 38 },
  { l: 'Submitted', s: 'Ready for review', n: 124, pct: 2.9, w: 28 },
  { l: 'Approved', s: 'Offer issued', n: 86, pct: 2.0, w: 18 },
  { l: 'Enrolled', s: 'Paid + signed', n: 58, pct: 1.4, w: 12 },
];

export default async function AdminOverviewPage() {
  const [counts, recentApps] = await Promise.all([
    getOverviewCounts(),
    listApplications({ limit: 5 }),
  ]);

  return (
    <>
      <div className="adm-page-head">
        <div>
          <div className="breadcrumb">
            OPERATIONS<span className="sep">/</span>OVERVIEW
          </div>
          <h1>Operations</h1>
          <p>
            <strong style={{ color: 'var(--blue-700)' }}>
              {counts.applications_submitted} application{counts.applications_submitted === 1 ? '' : 's'}
            </strong>{' '}
            awaiting review · {counts.applications_under_review} under review · {counts.leads_total} leads
            captured.
          </p>
        </div>
        <div className="adm-actions">
          <button type="button" className="btn btn-sm btn-ghost-light">
            Export weekly report
          </button>
          <Link href="/admin/applications" className="btn btn-sm btn-solid-dark">
            Review applications
          </Link>
        </div>
      </div>

      <div className="adm-kpi-row">
        <Kpi label="Applications · total" value={counts.applications_total} delta="all-time" direction="up" sparkSeed={1} />
        <Kpi label="Submitted · pending" value={counts.applications_submitted} delta="awaiting review" direction="up" sparkSeed={2} />
        <Kpi label="Under review" value={counts.applications_under_review} delta="in progress" direction="up" sparkSeed={3} />
        <Kpi label="Accepted · all-time" value={counts.applications_accepted} delta="offers issued" direction="up" sparkSeed={4} />
      </div>

      <div className="adm-grid-2" style={{ marginBottom: 16 }}>
        <div className="adm-card">
          <div className="adm-card-head">
            <div>
              <h3 className="adm-card-title">Enrollment funnel · last 30 days</h3>
              <div className="adm-card-sub">Illustrative · all campuses</div>
            </div>
            <Link href="/admin/applications" className="btn btn-sm btn-ghost-light">
              View applications →
            </Link>
          </div>
          <div className="adm-card-body">
            <div className="adm-funnel">
              {FUNNEL.map((r, i) => (
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
              <div className="adm-card-sub">Next 6 intakes</div>
            </div>
          </div>
          <div className="adm-card-body">
            <div className="adm-intake-list">
              <IntakeRow d="12" m="NOV" t="Jan 2026 · MDDOP N4" s="JHB · Full-time" cap={48} max={50} />
              <IntakeRow d="12" m="NOV" t="Jan 2026 · MDDOP N4" s="DBN · Full-time" cap={38} max={45} />
              <IntakeRow d="08" m="JAN" t="Jan 2026 · MDDOP N4" s="Online · Self-paced" cap={62} max={120} />
              <IntakeRow d="14" m="MAR" t="Bridging Course" s="JHB · DBN · Online" cap={18} max={60} />
              <IntakeRow d="01" m="MAY" t="May 2026 · MDDOP N4" s="All campuses" cap={4} max={150} />
              <IntakeRow d="16" m="MAY" t="Revit Architecture" s="Online · stackable" cap={0} max={40} />
            </div>
          </div>
        </div>
      </div>

      <div className="adm-grid-2">
        <div className="adm-card">
          <div className="adm-card-head">
            <div>
              <h3 className="adm-card-title">Recent applications</h3>
              <div className="adm-card-sub">Latest submissions</div>
            </div>
            <Link href="/admin/applications" className="btn btn-sm btn-ghost-light">
              Open inbox →
            </Link>
          </div>
          <div className="adm-card-body flush">
            {recentApps.length === 0 ? (
              <p style={{ padding: '24px', color: 'var(--ink-4)', fontSize: 14 }}>No applications yet.</p>
            ) : (
              <table className="adm-table">
                <thead>
                  <tr>
                    <th>Applicant</th>
                    <th>Programme</th>
                    <th>Status</th>
                    <th>Submitted</th>
                  </tr>
                </thead>
                <tbody>
                  {recentApps.map((a) => {
                    const name = nameOf(a);
                    return (
                      <tr key={a.id} className="is-link">
                        <td>
                          <div className="cell-name">
                            <span className="av">{initialsOf(name)}</span>
                            <div>
                              <div className="n">
                                <Link href={`/admin/applications/${a.id}`}>{name}</Link>
                              </div>
                              <div className="e">{a.applicant?.email}</div>
                            </div>
                          </div>
                        </td>
                        <td>{a.programme}</td>
                        <td>
                          <span className={`status-pill status-${a.status}`}>{a.status}</span>
                        </td>
                        <td>
                          <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)' }}>
                            {a.submitted_at ? new Date(a.submitted_at).toLocaleDateString('en-ZA') : '—'}
                          </span>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            )}
          </div>
        </div>

        <div className="adm-card">
          <div className="adm-card-head">
            <div>
              <h3 className="adm-card-title">Activity</h3>
              <div className="adm-card-sub">Illustrative · last 24 hours</div>
            </div>
          </div>
          <div className="adm-card-body">
            <div className="adm-activity">
              <Activity dot="cyan" msg={<><strong>Lerato Khumalo</strong> documents verified · <span className="meta">MDDOP N4</span></>} time="14 min ago" />
              <Activity msg={<>You approved <strong>Sipho Dlamini</strong>&apos;s application · <span className="meta">JHB · FT</span></>} time="48 min ago" />
              <Activity dot="warn" msg={<><strong>Aisha Naidoo</strong> matric document failed parse · <span className="meta">manual review</span></>} time="2h ago" />
              <Activity msg={<>WhatsApp · <strong>Brandon Pieterse</strong> asked about Revit short course pricing</>} time="3h ago" />
              <Activity dot="cyan" msg={<>Payment received · <strong>R 12,500</strong> · Lerato K. · <span className="meta">monthly 3/10</span></>} time="5h ago" />
              <Activity dot="red" msg={<><strong>2 applications</strong> missed 48h SLA · <span className="meta">JHB queue</span></>} time="11h ago" />
            </div>
          </div>
        </div>
      </div>
    </>
  );
}
