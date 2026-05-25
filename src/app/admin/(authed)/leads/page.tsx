import { listLeads } from '@/lib/db/admin';

export const dynamic = 'force-dynamic';

export default async function LeadsPage() {
  const leads = await listLeads({ limit: 200 });

  return (
    <>
      <div className="adm-page-head">
        <div>
          <div className="breadcrumb">
            OPERATIONS<span className="sep">/</span>LEADS
          </div>
          <h1>Leads</h1>
          <p>
            Applicants who have submitted a partial profile (lead capture, draft application, chat
            handoff) but have not yet completed a full application.
          </p>
        </div>
      </div>

      <div className="adm-card">
        {leads.length === 0 ? (
          <p style={{ padding: 24, color: 'var(--ink-4)', fontSize: 14 }}>No leads yet.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="adm-table">
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
                    <td style={{ fontWeight: 500 }}>
                      {l.first_name || l.last_name
                        ? `${l.first_name ?? ''} ${l.last_name ?? ''}`.trim()
                        : '—'}
                    </td>
                    <td>
                      <a href={`mailto:${l.email}`} style={{ color: 'var(--blue-700)' }}>
                        {l.email}
                      </a>
                    </td>
                    <td>{l.phone ?? '—'}</td>
                    <td>{l.city ?? '—'}</td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)' }}>
                        {new Date(l.created_at).toLocaleString('en-ZA')}
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
