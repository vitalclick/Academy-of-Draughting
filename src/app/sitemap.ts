import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';
import { COURSES } from '@/data/courses';

export default function sitemap(): MetadataRoute.Sitemap {
  const now = new Date();
  const top = [
    { url: '/', priority: 1.0 },
    { url: '/courses', priority: 0.9 },
    { url: '/career', priority: 0.8 },
    { url: '/about', priority: 0.7 },
    { url: '/apply', priority: 0.9 },
    { url: '/contact', priority: 0.6 },
    { url: '/privacy', priority: 0.2 },
    { url: '/terms', priority: 0.2 },
    { url: '/popia', priority: 0.2 },
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
  ];
}
