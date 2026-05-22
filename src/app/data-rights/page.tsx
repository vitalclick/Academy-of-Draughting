import type { Metadata } from 'next';
import { PageShell } from '@/components/chrome/page-shell';
import { BreadcrumbJsonLd } from '@/seo/json-ld';
import { DataRightsForm } from './form';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Data rights — access or deletion',
  description:
    'Exercise your rights under POPIA: request a copy of the personal data the Academy holds about you, or request deletion.',
  alternates: { canonical: '/data-rights' },
};

export default function DataRightsPage() {
  return (
    <PageShell active="home" headerTone="light">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', href: '/' },
          { name: 'Data rights', href: '/data-rights' },
        ]}
      />
      <section className="page-header" style={{ paddingBottom: 48 }}>
        <div className="page ph-inner" style={{ gridTemplateColumns: '1fr' }}>
          <div style={{ maxWidth: 720 }}>
            <div className="ph-eyebrow">
              <span className="pill pill-blue-dark">
                <span className="dot" />
                POPIA · DATA SUBJECT RIGHTS
              </span>
            </div>
            <h1 className="ph-title">Your data, your call.</h1>
            <p className="ph-sub">
              Under the Protection of Personal Information Act you can ask us for a copy of
              everything we hold about you, or ask us to remove it. We&apos;ll email a one-time
              confirmation link to the address on record — no impersonation possible.
            </p>
          </div>
        </div>
      </section>

      <section className="section section-light">
        <div className="page" style={{ maxWidth: 560 }}>
          <DataRightsForm />
          <p className="t-mono-xs" style={{ color: 'var(--ink-4)', marginTop: 20 }}>
            Requests are usually fulfilled within 24 hours. For complex cases requiring manual
            review, we&apos;ll respond within the 30-day POPIA window. For questions email{' '}
            <a href={`mailto:${SITE.email}`} style={{ color: 'var(--blue-600)' }}>
              {SITE.email}
            </a>
            .
          </p>
        </div>
      </section>
    </PageShell>
  );
}
