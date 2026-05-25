export const SITE = {
  name: 'The Academy of Advanced Draughting',
  short: 'Academy of Advanced Draughting',
  established: 1981,
  url: 'https://academydraughting.com',
  email: 'enroll@academydraughting.com',
  phone: '+27 68 110 0746',
  whatsappNumber: '27681100746',
  whatsappJhb: 'https://wa.me/27681100746',
  whatsappDbn: 'https://wa.me/27681100746',
  description:
    'AI-powered draughting and CAD education aligned to real engineering and design office environments. Since 1981.',
  social: {
    linkedin: 'https://www.linkedin.com/company/academy-of-advanced-draughting',
  },
};

// Default social sharing image. Relative path is resolved to an absolute URL
// by Next.js via `metadataBase` (set in the root layout).
export const OG_IMAGE = {
  url: '/og/og-default.jpg',
  width: 1200,
  height: 630,
  type: 'image/jpeg',
  alt: 'The Academy of Advanced Draughting — engineering careers start here. Specialist draughting & CAD training in South Africa since 1981.',
} as const;

export const NAV_ITEMS = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'courses', label: 'Courses', href: '/courses' },
  { key: 'about', label: 'About', href: '/about' },
  { key: 'career', label: 'Career Hub', href: '/career' },
  { key: 'funding', label: 'Fees & Funding', href: '/funding' },
  { key: 'apply', label: 'Apply', href: '/apply' },
  { key: 'contact', label: 'Contact', href: '/contact' },
] as const;

export type NavKey = (typeof NAV_ITEMS)[number]['key'] | 'portal';
