import type { Metadata } from 'next';
import { PageShell } from '@/components/chrome/page-shell';
import { HomeHero } from '@/sections/home/hero';
import { TrustStrip } from '@/sections/home/trust-strip';
import { AIFeaturesSection } from '@/sections/home/ai-features';
import { CoursesSnapshot } from '@/sections/home/courses-snapshot';
import { FinalCTA } from '@/components/ui/final-cta';

export const metadata: Metadata = {
  title: { absolute: 'Draughting & CAD Training in South Africa | Est. 1981' },
  description:
    'Specialist draughting & CAD courses since 1981 — AutoCAD, Revit & Inventor, nationally examined and job-ready in 10 months. Apply for the 2026 intake today.',
  alternates: { canonical: '/' },
};

export default function HomePage() {
  return (
    <PageShell active="home" headerTone="light">
      <HomeHero />
      <TrustStrip />
      <AIFeaturesSection />
      <CoursesSnapshot />
      <FinalCTA />
    </PageShell>
  );
}
