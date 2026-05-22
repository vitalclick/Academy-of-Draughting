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
    <div>
      <div className="admin-header">
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <h1 className="t-h2">Content Studio</h1>
          <Link href="/admin/content/new" className="btn btn-sm btn-primary">
            New draft →
          </Link>
        </div>
        <p className="t-body" style={{ color: 'var(--ink-3)', marginTop: 8 }}>
          AI-assisted drafts that publish straight to the site. Claude writes the first cut from a
          prompt; a human reviews and clicks Publish.
        </p>
        <div className="admin-filter-row">
          {KIND_FILTERS.map((f) => (
            <Link
              key={f.value}
              href={f.value === 'all' ? '/admin/content' : `/admin/content?kind=${f.value}`}
              className={`filter-chip ${kind === f.value ? 'is-active' : ''}`}
            >
              {f.label}
            </Link>
          ))}
        </div>
      </div>

      {items.length === 0 ? (
        <div className="admin-empty">
          No content yet.{' '}
          <Link href="/admin/content/new" className="admin-link">
            Create the first draft →
          </Link>
        </div>
      ) : (
        <table className="admin-table">
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
              <tr key={c.id}>
                <td>
                  <Link href={`/admin/content/${c.id}`} className="admin-link">
                    {c.title}
                  </Link>
                  {c.slug && (
                    <div className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>
                      /{c.slug}
                    </div>
                  )}
                </td>
                <td>{c.kind}</td>
                <td>
                  <span className={`status-pill status-${c.state}`}>{STATE_LABEL[c.state]}</span>
                </td>
                <td className="t-mono-xs">{new Date(c.updated_at).toLocaleString('en-ZA')}</td>
                <td>
                  {c.ai_model ? (
                    <span className="t-mono-xs" style={{ color: 'var(--cyan-500)' }}>
                      ✓ {c.ai_model}
                    </span>
                  ) : (
                    <span className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>
                      manual
                    </span>
                  )}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
