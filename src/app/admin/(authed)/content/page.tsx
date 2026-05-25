import Link from 'next/link';
import { listContent } from '@/lib/db/admin';
import type { ContentKind, ContentState } from '@/types/database';

export const dynamic = 'force-dynamic';

const KIND_FILTERS: { value: ContentKind | 'all'; label: string }[] = [
  { value: 'all', label: 'All' },
  { value: 'blog_post', label: 'Blog posts' },
  { value: 'faq', label: 'FAQs' },
  { value: 'testimonial', label: 'Testimonials' },
  { value: 'page_section', label: 'Page sections' },
];

const STATE_LABEL: Record<ContentState, string> = {
  draft: 'Draft',
  review: 'In review',
  published: 'Published',
  archived: 'Archived',
};

export default async function ContentListPage({
  searchParams,
}: {
  searchParams: Promise<{ kind?: string }>;
}) {
  const sp = await searchParams;
  const kind = (sp.kind ?? 'all') as ContentKind | 'all';
  const items = await listContent(kind === 'all' ? undefined : { kind: kind as ContentKind });

  return (
    <>
      <div className="adm-page-head">
        <div>
          <div className="breadcrumb">
            CONTENT<span className="sep">/</span>STUDIO
          </div>
          <h1>Content Studio</h1>
          <p>
            AI-assisted drafts that publish straight to the site. Claude writes the first cut from a
            prompt; a human reviews and clicks Publish.
          </p>
        </div>
        <div className="adm-actions">
          <Link href="/admin/content/new" className="btn btn-sm btn-primary">
            New draft →
          </Link>
        </div>
      </div>

      <div className="adm-card">
        <div className="adm-toolbar">
          <div className="adm-toolbar-left">
            <div className="adm-tabs">
              {KIND_FILTERS.map((f) => (
                <Link
                  key={f.value}
                  href={f.value === 'all' ? '/admin/content' : `/admin/content?kind=${f.value}`}
                  className={`adm-tab ${kind === f.value ? 'is-active' : ''}`}
                >
                  {f.label}
                </Link>
              ))}
            </div>
          </div>
        </div>

        {items.length === 0 ? (
          <p style={{ padding: 24, color: 'var(--ink-4)', fontSize: 14 }}>
            No content yet.{' '}
            <Link href="/admin/content/new" style={{ color: 'var(--blue-700)' }}>
              Create the first draft →
            </Link>
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Title</th>
                  <th>Kind</th>
                  <th>State</th>
                  <th>Updated</th>
                  <th>AI</th>
                </tr>
              </thead>
              <tbody>
                {items.map((c) => (
                  <tr key={c.id} className="is-link">
                    <td>
                      <div className="n" style={{ fontWeight: 500 }}>
                        <Link href={`/admin/content/${c.id}`} style={{ color: 'inherit', textDecoration: 'none' }}>
                          {c.title}
                        </Link>
                      </div>
                      {c.slug && (
                        <div className="e" style={{ fontFamily: 'var(--font-mono)', fontSize: 10.5, color: 'var(--ink-4)', marginTop: 2 }}>
                          /{c.slug}
                        </div>
                      )}
                    </td>
                    <td>{c.kind}</td>
                    <td>
                      <span className={`status-pill status-${c.state}`}>{STATE_LABEL[c.state]}</span>
                    </td>
                    <td>
                      <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)' }}>
                        {new Date(c.updated_at).toLocaleString('en-ZA')}
                      </span>
                    </td>
                    <td>
                      {c.ai_model ? (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--cyan-500)' }}>
                          ✓ {c.ai_model}
                        </span>
                      ) : (
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)' }}>
                          manual
                        </span>
                      )}
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
