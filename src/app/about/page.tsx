import type { Metadata } from 'next';
import { PageShell } from '@/components/chrome/page-shell';
import { FinalCTA } from '@/components/ui/final-cta';
import { BreadcrumbJsonLd } from '@/seo/json-ld';
import { AboutHeader } from '@/sections/about/header';
import { AboutBody } from '@/sections/about/body';
import { TimelineSection } from '@/sections/about/timeline';
import { CampusesSection } from '@/sections/about/campuses';

export const metadata: Metadata = {
  title: 'About — 45 years of specialist draughting',
  description:
    'Founded 1981. A specialist drawing-office training institution with campuses in Johannesburg and Durban, plus a full online programme nationwide.',
  alternates: { canonical: '/about' },
};

export default function AboutPage() {
  return (
    <PageShell active="about" headerTone="light">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', href: '/' },
          { name: 'About', href: '/about' },
        ]}
      />
      <AboutHeader />
      <AboutBody />
      <TimelineSection />
      <CampusesSection />
      <FinalCTA />
    </PageShell>
  );
}
