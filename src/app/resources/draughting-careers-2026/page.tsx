import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/components/chrome/page-shell';
import { FinalCTA } from '@/components/ui/final-cta';
import { BreadcrumbJsonLd } from '@/seo/json-ld';
import { CAREERS } from '@/data/careers';
import { formatRand } from '@/data/funding';

export const metadata: Metadata = {
  title: 'SA Draughting Careers & Salary Guide 2026',
  description:
    'A free 2026 guide to draughting careers in South Africa: ZAR salary bands, demand, software by discipline, top employers, and the shortest credible route into each role.',
  alternates: { canonical: '/resources/draughting-careers-2026' },
};

const sorted = [...CAREERS].sort((a, b) => b.median - a.median);

export default function CareersGuidePage() {
  return (
    <PageShell active="career" headerTone="light">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', href: '/' },
          { name: 'Resources', href: '/resources' },
          { name: 'Draughting Careers & Salary Guide 2026', href: '/resources/draughting-careers-2026' },
        ]}
      />

      <section className="section section-paper">
        <div className="page" style={{ maxWidth: 820 }}>
          <span className="section-label">
            <span className="bar" />
            FREE GUIDE · SOUTH AFRICA · 2026
          </span>
          <h1 className="t-h2" style={{ marginTop: 14, marginBottom: 12 }}>
            Draughting careers in South Africa: salaries, demand & pathways
          </h1>
          <p className="t-body-lg" style={{ marginBottom: 20 }}>
            Draughting is one of the most direct routes into the South African built-environment and
            engineering sectors. This guide lays out what each role pays in Rand, how the demand is
            trending, the software you need, and the fastest credible way in.
          </p>

          <h2 className="t-h3" style={{ marginTop: 32, marginBottom: 12 }}>Salary bands at a glance</h2>
          <div style={{ overflowX: 'auto' }}>
            <table style={{ width: '100%', borderCollapse: 'collapse', fontSize: 14 }}>
              <thead>
                <tr style={{ textAlign: 'left', borderBottom: '2px solid var(--line-on-light-2)' }}>
                  <th style={{ padding: '10px 8px' }}>Role</th>
                  <th style={{ padding: '10px 8px' }}>Entry median</th>
                  <th style={{ padding: '10px 8px' }}>Range</th>
                  <th style={{ padding: '10px 8px' }}>Demand (90d)</th>
                </tr>
              </thead>
              <tbody>
                {sorted.map((c) => (
                  <tr key={c.id} style={{ borderBottom: '1px solid var(--line-on-light-2)' }}>
                    <td style={{ padding: '10px 8px', fontWeight: 500 }}>{c.name}</td>
                    <td style={{ padding: '10px 8px' }}>{formatRand(c.median)}/mo</td>
                    <td style={{ padding: '10px 8px', color: 'var(--ink-3)' }}>
                      {formatRand(c.band.low)} – {formatRand(c.band.high)}
                    </td>
                    <td style={{ padding: '10px 8px' }}>
                      {c.openRoles90d} roles · +{Math.round(c.growthYoy * 100)}% YoY
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
          <p className="t-mono-xs" style={{ color: 'var(--ink-4)', marginTop: 10 }}>
            Figures are indicative entry-to-mid bands for Gauteng/KZN, drawn from current SA listings.
          </p>

          <h2 className="t-h3" style={{ marginTop: 40, marginBottom: 12 }}>The roles, in detail</h2>
          {sorted.map((c) => (
            <div
              key={c.id}
              style={{
                border: '1px solid var(--line-on-light-2)',
                borderRadius: 12,
                padding: 22,
                background: 'var(--white)',
                marginBottom: 14,
              }}
            >
              <h3 style={{ fontSize: 18, fontWeight: 600, marginBottom: 6 }}>{c.name}</h3>
              <p className="t-body" style={{ marginBottom: 10 }}>{c.description}</p>
              <p className="t-mono-xs" style={{ color: 'var(--ink-3)', lineHeight: 1.6 }}>
                SOFTWARE · {c.software.join(', ')}<br />
                TYPICAL EMPLOYERS · {c.topEmployers.join(', ')}<br />
                DAY TO DAY · {c.dayToDay}
              </p>
              <Link
                href={`/courses/${c.recommendedPathway}`}
                className="btn btn-sm btn-primary"
                style={{ marginTop: 12 }}
              >
                Recommended pathway →
              </Link>
            </div>
          ))}

          <div style={{ marginTop: 32, padding: 24, border: '1px solid var(--line-on-light-2)', borderRadius: 12 }}>
            <h2 className="t-h3" style={{ marginBottom: 8 }}>Where to start</h2>
            <p className="t-body" style={{ marginBottom: 14 }}>
              Most students start with MDDOP N4/N5 (the broad, DHET-examined base) or a focused short
              course in AutoCAD, Revit or Inventor. Not sure which fits? Work out the fees and talk to
              admissions — no obligation.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/funding" className="btn btn-primary">Calculate fees & funding →</Link>
              <Link href="/book" className="btn btn-ghost-light">Book a consultation</Link>
            </div>
          </div>
        </div>
      </section>

      <FinalCTA />
    </PageShell>
  );
}
