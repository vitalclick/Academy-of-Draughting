import Link from 'next/link';
import { notFound } from 'next/navigation';
import { getApplicationDetail } from '@/lib/db/admin';
import { createSignedReadUrl } from '@/lib/supabase/storage';
import { StatusUpdater } from './status-updater';

export const dynamic = 'force-dynamic';

export default async function ApplicationDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const detail = await getApplicationDetail(id);
  if (!detail) notFound();
  const { application: a, documents } = detail;
  const signedUrls = new Map<string, string>();
  await Promise.all(
    documents.map(async (d) => {
      try {
        const url = await createSignedReadUrl(d.storage_path);
        if (url) signedUrls.set(d.id, url);
      } catch {
        // ignore — link just won't render
      }
    })
  );

  return (
    <div>
      <div className="admin-header">
        <Link href="/admin/applications" className="t-mono-xs admin-link">
          ← APPLICATIONS
        </Link>
        <h1 className="t-h2" style={{ margin: '6px 0 0' }}>
          {a.applicant
            ? `${a.applicant.first_name ?? ''} ${a.applicant.last_name ?? ''}`.trim() ||
              a.applicant.email
            : 'Application'}
        </h1>
        <div className="t-mono-xs" style={{ color: 'var(--ink-4)', marginTop: 4 }}>
          ID · {a.id}
        </div>
      </div>

      <div className="admin-detail-grid">
        <div>
          <h2 className="admin-section-title">Applicant</h2>
          <dl className="admin-dl">
            <dt>Name</dt>
            <dd>
              {a.applicant?.first_name} {a.applicant?.last_name}
            </dd>
            <dt>Email</dt>
            <dd>
              <a href={`mailto:${a.applicant?.email}`}>{a.applicant?.email}</a>
            </dd>
            <dt>Phone</dt>
            <dd>
              <a href={`tel:${(a.applicant?.phone ?? '').replace(/\s/g, '')}`}>{a.applicant?.phone}</a>
            </dd>
            <dt>City</dt>
            <dd>{a.applicant?.city ?? '—'}</dd>
            <dt>ID</dt>
            <dd className="t-mono-sm">{a.applicant?.id_number ?? '—'}</dd>
            <dt>Matric</dt>
            <dd>{a.applicant?.matric_year ?? '—'}</dd>
          </dl>

          <h2 className="admin-section-title">Application</h2>
          <dl className="admin-dl">
            <dt>Programme</dt>
            <dd>{a.programme}</dd>
            <dt>Mode</dt>
            <dd>{a.mode}</dd>
            <dt>Campus</dt>
            <dd>{a.campus}</dd>
            <dt>Funding</dt>
            <dd>{a.funding_plan}</dd>
            <dt>Intake</dt>
            <dd>{a.intake ?? '—'}</dd>
            <dt>Submitted</dt>
            <dd>{a.submitted_at ? new Date(a.submitted_at).toLocaleString('en-ZA') : '—'}</dd>
            <dt>Decided</dt>
            <dd>{a.decided_at ? new Date(a.decided_at).toLocaleString('en-ZA') : '—'}</dd>
          </dl>

          <h2 className="admin-section-title">Documents ({documents.length})</h2>
          {documents.length === 0 ? (
            <p className="admin-empty">No documents uploaded.</p>
          ) : (
            <table className="admin-table">
              <thead>
                <tr>
                  <th>Kind</th>
                  <th>Filename</th>
                  <th>Size</th>
                  <th>Uploaded</th>
                </tr>
              </thead>
              <tbody>
                {documents.map((d) => {
                  const href = signedUrls.get(d.id);
                  return (
                    <tr key={d.id}>
                      <td>{d.kind}</td>
                      <td className="t-mono-sm">
                        {href ? (
                          <a
                            href={href}
                            target="_blank"
                            rel="noreferrer"
                            className="admin-link"
                          >
                            {d.filename}
                          </a>
                        ) : (
                          d.filename
                        )}
                      </td>
                      <td className="t-mono-sm">{(d.bytes / 1024).toFixed(0)} KB</td>
                      <td className="t-mono-xs">{new Date(d.uploaded_at).toLocaleString('en-ZA')}</td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          )}
        </div>

        <aside>
          <h2 className="admin-section-title">Status</h2>
          <StatusUpdater id={a.id} current={a.status} />
        </aside>
      </div>
    </div>
  );
}
