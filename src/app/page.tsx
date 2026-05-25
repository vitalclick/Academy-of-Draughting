import { PageShell } from '@/components/chrome/page-shell';
import { HomeHero } from '@/sections/home/hero';
import { TrustStrip } from '@/sections/home/trust-strip';
import { AIFeaturesSection } from '@/sections/home/ai-features';
import { CoursesSnapshot } from '@/sections/home/courses-snapshot';
import { FinalCTA } from '@/components/ui/final-cta';

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
