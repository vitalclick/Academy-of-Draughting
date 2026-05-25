import Link from 'next/link';
import { listApplications } from '@/lib/db/admin';
import type { ApplicationStatus } from '@/types/database';

export const dynamic = 'force-dynamic';

const STATUS_FILTERS: { value: ApplicationStatus | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'In review' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Declined' },
  { value: 'draft', label: 'Drafts' },
];

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
    <>
      <div className="adm-page-head">
        <div>
          <div className="breadcrumb">
            OPERATIONS<span className="sep">/</span>APPLICATIONS
          </div>
          <h1>Applications</h1>
          <p>Review submissions, track status, and issue offers.</p>
        </div>
        <div className="adm-actions">
          <Link href="/admin/applications/new" className="btn btn-sm btn-primary">
            + New application
          </Link>
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-toolbar">
          <div className="adm-toolbar-left">
            <div className="adm-tabs">
              {STATUS_FILTERS.map((f) => (
                <Link
                  key={f.value}
                  href={f.value === 'all' ? '/admin/applications' : `/admin/applications?status=${f.value}`}
                  className={`adm-tab ${filter === f.value ? 'is-active' : ''}`}
                >
                  {f.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {apps.length === 0 ? (
          <p style={{ padding: 24, color: 'var(--ink-4)', fontSize: 14 }}>No applications match this filter.</p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Applicant</th>
                  <th>Programme · Mode · Campus</th>
                  <th>Funding</th>
                  <th>Status</th>
                  <th>Submitted</th>
                  <th></th>
                </tr>
              </thead>
              <tbody>
                {apps.map((a) => {
                  const name = nameOf(a);
                  return (
                    <tr key={a.id} className="is-link">
                      <td>
                        <span className="cell-id">{a.id.slice(0, 8)}</span>
                      </td>
                      <td>
                        <div className="cell-name">
                          <span className="av">{initialsOf(name)}</span>
                          <div>
                            <div className="n">
                              <Link href={`/admin/applications/${a.id}`}>{name}</Link>
                            </div>
                            <div className="e">
                              {a.applicant?.email}
                              {a.applicant?.phone ? ` · ${a.applicant.phone}` : ''}
                            </div>
                          </div>
                        </div>
                      </td>
                      <td>
                        {a.programme} · {a.mode} · {a.campus}
                      </td>
                      <td>{a.funding_plan}</td>
                      <td>
                        <span className={`status-pill status-${a.status}`}>{a.status}</span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)' }}>
                          {a.submitted_at ? new Date(a.submitted_at).toLocaleDateString('en-ZA') : '—'}
                        </span>
                      </td>
                      <td>
                        <Link href={`/admin/applications/${a.id}`} style={{ color: 'var(--ink-4)', fontSize: 18 }}>
                          ›
                        </Link>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}

        <div className="adm-pager">
          <span>SHOWING {apps.length} APPLICATION{apps.length === 1 ? '' : 'S'}</span>
        </div>
      </div>
    </>
  );
}
