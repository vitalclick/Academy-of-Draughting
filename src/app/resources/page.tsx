import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/components/chrome/page-shell';
import { LeadMagnet } from '@/components/ui/lead-magnet';
import { BreadcrumbJsonLd } from '@/seo/json-ld';

export const metadata: Metadata = {
  title: 'Resources — Guides for Aspiring Draughtspeople',
  description:
    'Free guides and tools for anyone considering a draughting career in South Africa — salary data, demand projections and pathway advice.',
  alternates: { canonical: '/resources' },
};

const RESOURCES = [
  {
    href: '/resources/draughting-careers-2026',
    title: 'SA Draughting Careers & Salary Guide 2026',
    desc: 'ZAR salary bands, demand, software-by-discipline and the shortest route into each role.',
  },
];

export default function ResourcesPage() {
  return (
    <PageShell active="career" headerTone="light">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', href: '/' },
          { name: 'Resources', href: '/resources' },
        ]}
      />
      <section className="section section-paper">
        <div className="page">
          <span className="section-label">
            <span className="bar" />
            RESOURCES
          </span>
          <h1 className="t-h2" style={{ marginTop: 14, marginBottom: 24 }}>
            Free guides for your draughting career.
          </h1>
          <div className="apply-grid">
            <div style={{ display: 'flex', flexDirection: 'column', gap: 14 }}>
              {RESOURCES.map((r) => (
                <Link
                  key={r.href}
                  href={r.href}
                  style={{
                    border: '1px solid var(--line-on-light-2)',
                    borderRadius: 12,
                    padding: 22,
                    background: 'var(--white)',
                    textDecoration: 'none',
                    color: 'var(--ink)',
                    display: 'block',
                  }}
                >
                  <h2 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>{r.title}</h2>
                  <p className="t-body" style={{ color: 'var(--ink-3)' }}>{r.desc}</p>
                </Link>
              ))}
            </div>
            <aside className="apply-side">
              <LeadMagnet source="resources_page" />
            </aside>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
