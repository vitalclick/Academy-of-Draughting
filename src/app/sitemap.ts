import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';
import { COURSES } from '@/data/courses';
import { CAMPUSES } from '@/data/campuses';
import { listPublishedBlogPosts } from '@/lib/db/content';

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const now = new Date();
  const posts = await listPublishedBlogPosts();
  const top = [
    { url: '/', priority: 1.0 },
    { url: '/courses', priority: 0.9 },
    { url: '/career', priority: 0.8 },
    { url: '/career/quiz', priority: 0.7 },
    { url: '/funding', priority: 0.9 },
    { url: '/blog', priority: 0.6 },
    { url: '/about', priority: 0.7 },
    { url: '/apply', priority: 0.9 },
    { url: '/contact', priority: 0.6 },
    { url: '/book', priority: 0.8 },
    { url: '/privacy', priority: 0.2 },
    { url: '/terms', priority: 0.2 },
    { url: '/popia', priority: 0.2 },
    { url: '/data-rights', priority: 0.3 },
  ];

  return [
    ...top.map((t) => ({
      url: `${SITE.url}${t.url}`,
      lastModified: now,
      changeFrequency: 'weekly' as const,
      priority: t.priority,
    })),
    ...COURSES.map((c) => ({
      url: `${SITE.url}/courses/${c.id}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.7,
    })),
    ...CAMPUSES.map((c) => ({
      url: `${SITE.url}/campus/${c.slug}`,
      lastModified: now,
      changeFrequency: 'monthly' as const,
      priority: 0.8,
    })),
    ...posts
      .filter((p) => p.slug)
      .map((p) => ({
        url: `${SITE.url}/blog/${p.slug}`,
        lastModified: p.published_at ? new Date(p.published_at) : now,
        changeFrequency: 'monthly' as const,
        priority: 0.5,
      })),
  ];
}
