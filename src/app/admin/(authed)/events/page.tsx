import Link from 'next/link';
import { listEvents } from '@/lib/db/admin';

export const dynamic = 'force-dynamic';

const FILTERS = [
  { value: 'all', label: 'All' },
  { value: 'application_submitted', label: 'Submitted' },
  { value: 'application_status_changed', label: 'Status changes' },
  { value: 'lead_captured', label: 'Leads' },
  { value: 'recommender_completed', label: 'Recommender' },
  { value: 'experiment_exposed', label: 'A/B exposures' },
  { value: 'apply_cta_clicked', label: 'CTA clicks' },
];

export default async function EventsPage({
  searchParams,
}: {
  searchParams: Promise<{ name?: string }>;
}) {
  const sp = await searchParams;
  const name = sp.name && sp.name !== 'all' ? sp.name : undefined;
  const events = await listEvents({ name, limit: 200 });

  return (
    <>
      <div className="adm-page-head">
        <div>
          <div className="breadcrumb">
            CONTENT<span className="sep">/</span>EVENTS
          </div>
          <h1>Events</h1>
          <p>Analytics and lifecycle events captured across the site.</p>
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-toolbar">
          <div className="adm-toolbar-left">
            <div className="adm-tabs">
              {FILTERS.map((f) => (
                <Link
                  key={f.value}
                  href={f.value === 'all' ? '/admin/events' : `/admin/events?name=${f.value}`}
                  className={`adm-tab ${(name ?? 'all') === f.value ? 'is-active' : ''}`}
                >
                  {f.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {events.length === 0 ? (
          <p style={{ padding: 24, color: 'var(--ink-4)', fontSize: 14 }}>No events match.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>When</th>
                  <th>Event</th>
                  <th>Application</th>
                  <th>Payload</th>
                </tr>
              </thead>
              <tbody>
                {events.map((e) => (
                  <tr key={e.id}>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)' }}>
                        {new Date(e.occurred_at).toLocaleString('en-ZA')}
                      </span>
                    </td>
                    <td>
                      <code>{e.name}</code>
                    </td>
                    <td>
                      {e.application_id ? (
                        <Link
                          href={`/admin/applications/${e.application_id}`}
                          style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--blue-700)' }}
                        >
                          {e.application_id.slice(0, 8)}…
                        </Link>
                      ) : (
                        <span style={{ color: 'var(--ink-4)' }}>—</span>
                      )}
                    </td>
                    <td className="adm-payload-cell">
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-3)' }}>
                        {JSON.stringify(e.payload)}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </>
  );
}
