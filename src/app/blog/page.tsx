import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/components/chrome/page-shell';
import { BreadcrumbJsonLd } from '@/seo/json-ld';
import { listPublishedBlogPosts } from '@/lib/db/content';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Insights — careers, software, drawing-office practice',
  description:
    'Articles on draughting careers in South Africa, software, hiring trends, and how design offices actually work.',
  alternates: { canonical: '/blog' },
};

export default async function BlogIndexPage() {
  const posts = await listPublishedBlogPosts();

  return (
    <PageShell active="home" headerTone="light">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', href: '/' },
          { name: 'Insights', href: '/blog' },
        ]}
      />

      <section className="page-header">
        <div className="page ph-inner" style={{ gridTemplateColumns: '1fr' }}>
          <div>
            <div className="ph-eyebrow">
              <span className="pill pill-blue-dark">
                <span className="dot" />
                INSIGHTS · UPDATED CONTINUOUSLY
              </span>
            </div>
            <h1 className="ph-title">
              From the drawing office.
            </h1>
            <p className="ph-sub">
              Career outcomes, software trends, hiring data and the standards real engineering
              and design offices apply in 2026.
            </p>
          </div>
        </div>
      </section>

      <section className="section section-light">
        <div className="page">
          {posts.length === 0 ? (
            <div className="admin-empty" style={{ background: 'var(--white)', border: '1px dashed var(--line-on-light)', padding: 48, borderRadius: 12, textAlign: 'center' }}>
              <p className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>
                NO ARTICLES PUBLISHED YET
              </p>
              <p className="t-body" style={{ marginTop: 8 }}>
                The first insights are queued in the Content Studio. Check back soon.
              </p>
            </div>
          ) : (
            <div className="blog-grid">
              {posts.map((p) => (
                <Link key={p.id} href={`/blog/${p.slug}`} className="blog-card">
                  <span className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>
                    {p.published_at ? new Date(p.published_at).toLocaleDateString('en-ZA', { month: 'short', day: 'numeric', year: 'numeric' }).toUpperCase() : ''}
                  </span>
                  <h2>{p.title}</h2>
                  {p.summary && <p className="blog-card-summary">{p.summary}</p>}
                  <span className="blog-card-cta">
                    Read article →
                  </span>
                </Link>
              ))}
            </div>
          )}
        </div>
      </section>
    </PageShell>
  );
}
