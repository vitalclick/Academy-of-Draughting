import Link from 'next/link';
import { getOverviewCounts, listApplications, listEvents } from '@/lib/db/admin';

export const dynamic = 'force-dynamic';

export default async function AdminOverviewPage() {
  const [counts, recentApps, recentEvents] = await Promise.all([
    getOverviewCounts(),
    listApplications({ limit: 5 }),
    listEvents({ limit: 10 }),
  ]);

  return (
    <div>
      <div className="admin-header">
        <span className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>
          OVERVIEW · LAST 24H
        </span>
        <h1 className="t-h2" style={{ margin: '6px 0 24px' }}>
          What&apos;s happening
        </h1>
      </div>

      <div className="admin-stats">
        <Stat label="Applications · total" value={counts.applications_total} />
        <Stat label="Submitted · pending review" value={counts.applications_submitted} accent="blue" />
        <Stat label="Under review" value={counts.applications_under_review} accent="cyan" />
        <Stat label="Accepted · all-time" value={counts.applications_accepted} />
        <Stat label="Leads" value={counts.leads_total} />
        <Stat label="Events · 24h" value={counts.events_24h} />
        <Stat label="Content drafts" value={counts.content_drafts} />
      </div>

      <section className="admin-section">
        <div className="admin-section-head">
          <h2>Recent applications</h2>
          <Link href="/admin/applications" className="t-mono-xs admin-link">
            VIEW ALL →
          </Link>
        </div>
        {recentApps.length === 0 ? (
          <p className="admin-empty">No applications yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Applicant</th>
                <th>Programme</th>
                <th>Mode</th>
                <th>Status</th>
                <th>Submitted</th>
              </tr>
            </thead>
            <tbody>
              {recentApps.map((a) => (
                <tr key={a.id}>
                  <td>
                    <Link href={`/admin/applications/${a.id}`} className="admin-link">
                      {a.applicant
                        ? `${a.applicant.first_name ?? ''} ${a.applicant.last_name ?? ''}`.trim() ||
                          a.applicant.email
                        : '—'}
                    </Link>
                    <div className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>
                      {a.applicant?.email}
                    </div>
                  </td>
                  <td>{a.programme}</td>
                  <td>{a.mode}</td>
                  <td>
                    <span className={`status-pill status-${a.status}`}>{a.status}</span>
                  </td>
                  <td className="t-mono-xs">
                    {a.submitted_at ? new Date(a.submitted_at).toLocaleString('en-ZA') : '—'}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>

      <section className="admin-section">
        <div className="admin-section-head">
          <h2>Recent events</h2>
          <Link href="/admin/events" className="t-mono-xs admin-link">
            VIEW ALL →
          </Link>
        </div>
        {recentEvents.length === 0 ? (
          <p className="admin-empty">No events yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>When</th>
                <th>Event</th>
                <th>Payload</th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.map((e) => (
                <tr key={e.id}>
                  <td className="t-mono-xs">{new Date(e.occurred_at).toLocaleString('en-ZA')}</td>
                  <td>
                    <code>{e.name}</code>
                  </td>
                  <td className="t-mono-xs" style={{ maxWidth: 360, overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                    {JSON.stringify(e.payload)}
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}

function Stat({ label, value, accent }: { label: string; value: number; accent?: 'blue' | 'cyan' }) {
  return (
    <div className={`admin-stat ${accent ? `admin-stat-${accent}` : ''}`}>
      <span className="t-mono-xs">{label.toUpperCase()}</span>
      <div className="admin-stat-value">{value.toLocaleString('en-ZA')}</div>
    </div>
  );
}
