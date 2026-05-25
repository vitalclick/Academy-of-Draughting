import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PageShell } from '@/components/chrome/page-shell';
import { BreadcrumbJsonLd } from '@/seo/json-ld';
import { getPublishedBlogPostBySlug } from '@/lib/db/content';
import { renderMarkdown } from '@/lib/markdown';
import { OG_IMAGE } from '@/lib/site';

export const dynamic = 'force-dynamic';

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) return {};
  return {
    title: post.title,
    description: post.summary ?? undefined,
    alternates: { canonical: `/blog/${slug}` },
    openGraph: {
      type: 'article',
      title: post.title,
      description: post.summary ?? undefined,
      publishedTime: post.published_at ?? undefined,
      images: [{ url: OG_IMAGE.url, width: OG_IMAGE.width, height: OG_IMAGE.height, alt: OG_IMAGE.alt }],
    },
  };
}

export default async function BlogPostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;
  const post = await getPublishedBlogPostBySlug(slug);
  if (!post) notFound();

  return (
    <PageShell active="home" headerTone="light">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', href: '/' },
          { name: 'Insights', href: '/blog' },
          { name: post.title, href: `/blog/${slug}` },
        ]}
      />
      <section className="page-header" style={{ paddingBottom: 48 }}>
        <div className="page ph-inner" style={{ gridTemplateColumns: '1fr' }}>
          <div style={{ maxWidth: 820 }}>
            <Link href="/blog" className="t-mono-xs" style={{ color: 'var(--ink-on-dark-3)' }}>
              ← ALL ARTICLES
            </Link>
            <h1 className="ph-title" style={{ marginTop: 12 }}>
              {post.title}
            </h1>
            {post.summary && <p className="ph-sub">{post.summary}</p>}
            <div className="t-mono-xs" style={{ color: 'var(--ink-on-dark-3)', marginTop: 16 }}>
              {post.published_at
                ? new Date(post.published_at).toLocaleDateString('en-ZA', {
                    month: 'short',
                    day: 'numeric',
                    year: 'numeric',
                  }).toUpperCase()
                : ''}
              {post.ai_model && ` · ${post.ai_model} draft, human-reviewed`}
            </div>
          </div>
        </div>
      </section>

      <section className="section section-light">
        <div className="page" style={{ maxWidth: 760 }}>
          <article
            className="legal-prose blog-prose"
            dangerouslySetInnerHTML={{ __html: renderMarkdown(post.body ?? '') }}
          />
        </div>
      </section>
    </PageShell>
  );
}
