import type { MetadataRoute } from 'next';
import { SITE } from '@/lib/site';

export default function manifest(): MetadataRoute.Manifest {
  return {
    name: SITE.name,
    short_name: SITE.short,
    description: SITE.description,
    start_url: '/',
    display: 'standalone',
    background_color: '#F4F6FA',
    theme_color: '#071B3B',
    lang: 'en-ZA',
    categories: ['education'],
    icons: [
      { src: '/assets/logo.png', sizes: '192x192', type: 'image/png', purpose: 'any' },
      { src: '/assets/logo.png', sizes: '512x512', type: 'image/png', purpose: 'any' },
    ],
    shortcuts: [
      { name: 'Apply now', url: '/apply' },
      { name: 'Fees & Funding', url: '/funding' },
      { name: 'Courses', url: '/courses' },
    ],
  };
}
