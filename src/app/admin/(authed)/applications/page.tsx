import Link from 'next/link';
import { listApplications } from '@/lib/db/admin';
import type { ApplicationStatus } from '@/types/database';

export const dynamic = 'force-dynamic';

const STATUS_FILTERS: { value: ApplicationStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under review' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'draft', label: 'Drafts' },
];

export default async function ApplicationsPage({
  searchParams,
}: {
  searchParams: Promise<{ status?: string }>;
}) {
  const sp = await searchParams;
  const filter = (sp.status ?? 'all') as ApplicationStatus | 'all';
  const apps = await listApplications({
    status: filter === 'all' ? undefined : (filter as ApplicationStatus),
    limit: 100,
  });

  return (
    <div>
      <div className="admin-header">
        <h1 className="t-h2">Applications</h1>
        <div className="admin-filter-row">
          {STATUS_FILTERS.map((f) => (
            <Link
              key={f.value}
              href={f.value === 'all' ? '/admin/applications' : `/admin/applications?status=${f.value}`}
              className={`filter-chip ${filter === f.value ? 'is-active' : ''}`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      {apps.length === 0 ? (
        <p className="admin-empty">No applications match this filter.</p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Applicant</th>
              <th>Programme · Mode · Campus</th>
              <th>Funding</th>
              <th>Status</th>
              <th>Submitted</th>
            </tr>
          </thead>
          <tbody>
            {apps.map((a) => (
              <tr key={a.id}>
                <td>
                  <Link href={`/admin/applications/${a.id}`} className="admin-link">
                    {a.applicant
                      ? `${a.applicant.first_name ?? ''} ${a.applicant.last_name ?? ''}`.trim() ||
                        a.applicant.email
                      : '—'}
                  </Link>
                  <div className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>
                    {a.applicant?.email} · {a.applicant?.phone}
                  </div>
                </td>
                <td>
                  {a.programme} · {a.mode} · {a.campus}
                </td>
                <td>{a.funding_plan}</td>
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
    </div>
  );
}
