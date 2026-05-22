import type { Metadata } from 'next';
import { PageShell } from '@/components/chrome/page-shell';
import { FinalCTA } from '@/components/ui/final-cta';
import { BreadcrumbJsonLd } from '@/seo/json-ld';
import { CoursesHeader } from '@/sections/courses/header';
import { CoursesExplorer } from '@/sections/courses/courses-explorer';
import { SoftStackSection } from '@/sections/courses/soft-stack';

export const metadata: Metadata = {
  title: 'Programmes — MDDOP N4/N5, Bridging, AutoCAD, Revit, Inventor',
  description:
    'Six draughting and CAD pathways from foundation to specialisation. Each programme is mapped to drawing-office discipline, current software demand, and SA engineering hiring.',
  alternates: { canonical: '/courses' },
};

export default function CoursesPage() {
  return (
    <PageShell active="courses" headerTone="light">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', href: '/' },
          { name: 'Courses', href: '/courses' },
        ]}
      />
      <CoursesHeader />
      <CoursesExplorer />
      <SoftStackSection />
      <FinalCTA />
    </PageShell>
  );
}
