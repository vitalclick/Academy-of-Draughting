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

export const NAV_ITEMS = [
  { key: 'home', label: 'Home', href: '/' },
  { key: 'courses', label: 'Courses', href: '/courses' },
  { key: 'career', label: 'Career Hub', href: '/career' },
  { key: 'funding', label: 'Fees & Funding', href: '/funding' },
  { key: 'about', label: 'About', href: '/about' },
  { key: 'apply', label: 'Apply', href: '/apply' },
  { key: 'contact', label: 'Contact', href: '/contact' },
] as const;

export type NavKey = (typeof NAV_ITEMS)[number]['key'] | 'portal';
