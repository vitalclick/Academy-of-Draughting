import Link from 'next/link';
import { getOverviewCounts, listApplications } from '@/lib/db/admin';
import { Kpi } from './_components/viz';

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

export default async function AdminOverviewPage() {
  const [counts, recentApps] = await Promise.all([
    getOverviewCounts(),
    listApplications({ limit: 8 }),
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
    </>
  );
}
