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
    <div>
      <div className="admin-header">
        <h1 className="t-h2">Events</h1>
        <div className="admin-filter-row">
          {FILTERS.map((f) => (
            <Link
              key={f.value}
              href={f.value === 'all' ? '/admin/events' : `/admin/events?name=${f.value}`}
              className={`filter-chip ${(name ?? 'all') === f.value ? 'is-active' : ''}`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      {events.length === 0 ? (
        <p className="admin-empty">No events match.</p>
      ) : (
        <table className="admin-table">
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
                <td className="t-mono-xs">{new Date(e.occurred_at).toLocaleString('en-ZA')}</td>
                <td>
                  <code>{e.name}</code>
                </td>
                <td className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>
                  {e.application_id ? (
                    <Link href={`/admin/applications/${e.application_id}`} className="admin-link">
                      {e.application_id.slice(0, 8)}…
                    </Link>
                  ) : (
                    '—'
                  )}
                </td>
                <td className="t-mono-xs admin-payload">{JSON.stringify(e.payload)}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
