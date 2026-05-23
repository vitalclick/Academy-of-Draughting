import { listLeads } from '@/lib/db/admin';

export const dynamic = 'force-dynamic';

export default async function LeadsPage() {
  const leads = await listLeads({ limit: 200 });

  return (
    <div>
      <div className="admin-header">
        <h1 className="t-h2">Leads</h1>
        <p className="t-body" style={{ color: 'var(--ink-3)', marginTop: 8 }}>
          Applicants who have submitted a partial profile (lead capture, draft application,
          chat handoff) but have not yet completed a full application.
        </p>
      </div>

      {leads.length === 0 ? (
        <p className="admin-empty">No leads yet.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Name</th>
              <th>Email</th>
              <th>Phone</th>
              <th>City</th>
              <th>First seen</th>
            </tr>
          </thead>
          <tbody>
            {leads.map((l) => (
              <tr key={l.id}>
                <td>
                  {l.first_name || l.last_name
                    ? `${l.first_name ?? ''} ${l.last_name ?? ''}`.trim()
                    : '—'}
                </td>
                <td>
                  <a href={`mailto:${l.email}`}>{l.email}</a>
                </td>
                <td>{l.phone ?? '—'}</td>
                <td>{l.city ?? '—'}</td>
                <td className="t-mono-xs">{new Date(l.created_at).toLocaleString('en-ZA')}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
