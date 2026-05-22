import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/components/chrome/page-shell';
import { FinalCTA } from '@/components/ui/final-cta';
import { BreadcrumbJsonLd } from '@/seo/json-ld';
import { CareerIntelSection } from '@/sections/home/career-intel';

export const metadata: Metadata = {
  title: 'Career Intelligence Hub — salary & demand for SA draughting careers',
  description:
    'Live salary bands, regional demand, software requirements and time-to-hire across South African engineering and design offices — updated quarterly.',
  alternates: { canonical: '/career' },
};

const CAREERS = [
  {
    name: 'Architectural Draughtsperson',
    median: 'R 26,800',
    band: 'R 18,000 – R 38,000',
    growth: '↑ 6.1% YoY',
    software: ['Revit', 'AutoCAD', 'ArchiCAD'],
    pathway: 'mddop',
  },
  {
    name: 'Mechanical Draughtsperson',
    median: 'R 28,400',
    band: 'R 20,000 – R 42,000',
    growth: '↑ 4.2% YoY',
    software: ['Inventor', 'AutoCAD', 'SolidWorks'],
    pathway: 'mddop',
  },
  {
    name: 'Civil Draughtsperson',
    median: 'R 27,200',
    band: 'R 19,500 – R 39,000',
    growth: '↑ 5.8% YoY',
    software: ['AutoCAD Civil 3D', 'AutoCAD'],
    pathway: 'civil',
  },
  {
    name: 'BIM Coordinator',
    median: 'R 38,500',
    band: 'R 28,000 – R 58,000',
    growth: '↑ 11.0% YoY',
    software: ['Revit', 'Navisworks', 'Solibri'],
    pathway: 'revit',
  },
  {
    name: 'Structural / Steel Detailer',
    median: 'R 31,000',
    band: 'R 22,000 – R 46,000',
    growth: '↑ 3.4% YoY',
    software: ['Tekla', 'AutoCAD', 'Advance Steel'],
    pathway: 'mddop',
  },
  {
    name: 'CAD Technician',
    median: 'R 18,500',
    band: 'R 14,000 – R 24,000',
    growth: '↑ 2.1% YoY',
    software: ['AutoCAD'],
    pathway: 'autocad',
  },
];

export default function CareerPage() {
  return (
    <PageShell active="career" headerTone="light">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', href: '/' },
          { name: 'Career Hub', href: '/career' },
        ]}
      />

      <section className="page-header" data-screen-label="01 Career Hub Header">
        <div className="page ph-inner">
          <div>
            <div className="ph-eyebrow">
              <span className="pill pill-blue-dark">
                <span className="dot" />
                CAREER INTELLIGENCE · Q2 2026
              </span>
              <span className="t-mono-xs" style={{ color: 'var(--ink-on-dark-3)' }}>
                UPDATED QUARTERLY · SOURCED LIVE
              </span>
            </div>
            <h1 className="ph-title">
              Engineering careers in numbers. <em>So you can decide with data.</em>
            </h1>
            <p className="ph-sub">
              Live salary bands, regional demand, software requirements and hiring trends across
              South African engineering and design offices.
            </p>
          </div>
          <div className="ph-meta">
            <div className="ph-meta-cell">
              <span className="ph-meta-k">CAREERS TRACKED</span>
              <span className="ph-meta-v">8</span>
              <span className="ph-meta-foot">Drafting & BIM</span>
            </div>
            <div className="ph-meta-cell">
              <span className="ph-meta-k">DATA UPDATE</span>
              <span className="ph-meta-v">Q2 &apos;26</span>
              <span className="ph-meta-foot">14 May 2026</span>
            </div>
            <div className="ph-meta-cell">
              <span className="ph-meta-k">OPEN ROLES · SA</span>
              <span className="ph-meta-v">1,284</span>
              <span className="ph-meta-foot">Trailing 90 days</span>
            </div>
            <div className="ph-meta-cell">
              <span className="ph-meta-k">MEDIAN · GP</span>
              <span className="ph-meta-v">R28K</span>
              <span className="ph-meta-foot">Per month</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-paper" data-screen-label="02 Recommender CTA">
        <div className="page">
          <div className="reco-cta">
            <div>
              <span className="section-label" style={{ color: 'var(--cyan-500)' }}>
                <span className="bar" />
                PROGRAMME RECOMMENDER · POWERED BY CLAUDE
              </span>
              <h2 className="t-h2" style={{ margin: '12px 0 12px' }}>
                Not sure where to start? Take 60 seconds.
              </h2>
              <p className="t-body-lg" style={{ marginBottom: 16, maxWidth: 560 }}>
                Four questions and we&apos;ll score you against the Academy programmes — with a
                short, plain-English rationale.
              </p>
              <Link href="/career/quiz" className="btn btn-lg btn-primary">
                Start the recommender →
              </Link>
            </div>
          </div>
        </div>
      </section>

      <CareerIntelSection />

      <section className="section section-light" data-screen-label="03 Career Cards">
        <div className="page">
          <div className="sec-head">
            <div className="sec-head-meta">
              <span className="section-label">
                <span className="bar" />
                SECTION 03 / CAREER PATHS
              </span>
              <h2 className="sec-head-title">Eight pathways. One method.</h2>
            </div>
            <p className="sec-head-sub">
              Each pathway maps to a programme stack. Pick a destination and we&apos;ll show you the
              shortest credible route.
            </p>
          </div>
          <div className="career-grid">
            {CAREERS.map((c) => (
              <article key={c.name} className="career-card">
                <h3>{c.name}</h3>
                <div className="career-card-stat">
                  <span className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>
                    MEDIAN · GP
                  </span>
                  <div className="career-card-median">
                    {c.median}
                    <span className="t-mono-sm" style={{ color: 'var(--cyan-500)', marginLeft: 8 }}>
                      {c.growth}
                    </span>
                  </div>
                  <span className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>
                    {c.band}
                  </span>
                </div>
                <div className="career-card-soft">
                  {c.software.map((s) => (
                    <span key={s} className="pill pill-light">
                      {s}
                    </span>
                  ))}
                </div>
                <Link href={`/courses/${c.pathway}`} className="btn btn-sm btn-ghost-light">
                  See pathway →
                </Link>
              </article>
            ))}
          </div>
        </div>
      </section>

      <FinalCTA />
    </PageShell>
  );
}
