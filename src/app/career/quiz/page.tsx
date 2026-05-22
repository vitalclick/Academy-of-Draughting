import type { Metadata } from 'next';
import { PageShell } from '@/components/chrome/page-shell';
import { BreadcrumbJsonLd } from '@/seo/json-ld';
import { RecommenderQuiz } from '@/sections/recommender/recommender-quiz';

export const metadata: Metadata = {
  title: 'Programme recommender — find your fit in 60 seconds',
  description:
    'A four-question recommender scores you against the Academy programmes using your starting point, interest, mode and CAD background — plus an AI-generated rationale.',
  alternates: { canonical: '/career/quiz' },
};

export default function RecommenderPage() {
  return (
    <PageShell active="career" headerTone="light">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', href: '/' },
          { name: 'Career Hub', href: '/career' },
          { name: 'Programme Recommender', href: '/career/quiz' },
        ]}
      />
      <section className="page-header">
        <div className="page ph-inner" style={{ gridTemplateColumns: '1fr' }}>
          <div>
            <div className="ph-eyebrow">
              <span className="pill pill-blue-dark">
                <span className="dot" />
                PROGRAMME RECOMMENDER · 60 SECONDS
              </span>
              <span className="t-mono-xs" style={{ color: 'var(--ink-on-dark-3)' }}>
                AI-WRITTEN RATIONALE · LIVE PROGRAMME DATA
              </span>
            </div>
            <h1 className="ph-title">
              Four questions. <em>Your best-fit programme.</em>
            </h1>
            <p className="ph-sub">
              We score your answers against the Academy programmes and surface the closest match
              with a short rationale you can act on.
            </p>
          </div>
        </div>
      </section>

      <section className="section section-light">
        <div className="page" style={{ maxWidth: 720 }}>
          <div className="reco-card">
            <RecommenderQuiz />
          </div>
        </div>
      </section>
    </PageShell>
  );
}
