import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/components/chrome/page-shell';
import { FinalCTA } from '@/components/ui/final-cta';
import { BreadcrumbJsonLd } from '@/seo/json-ld';

export const metadata: Metadata = {
  title: 'Career pathways — SA draughting & CAD careers',
  description:
    'Explore the draughting and CAD career pathways the Academy trains for, and the programme stack that leads to each one.',
  alternates: { canonical: '/career' },
};

const CAREERS = [
  {
    name: 'Architectural Draughtsperson',
    software: ['Revit', 'AutoCAD', 'ArchiCAD'],
    pathway: 'mddop',
  },
  {
    name: 'Mechanical Draughtsperson',
    software: ['Inventor', 'AutoCAD', 'SolidWorks'],
    pathway: 'mddop',
  },
  {
    name: 'Civil Draughtsperson',
    software: ['AutoCAD Civil 3D', 'AutoCAD'],
    pathway: 'civil',
  },
  {
    name: 'BIM Coordinator',
    software: ['Revit', 'Navisworks', 'Solibri'],
    pathway: 'revit',
  },
  {
    name: 'Structural / Steel Detailer',
    software: ['Tekla', 'AutoCAD', 'Advance Steel'],
    pathway: 'mddop',
  },
  {
    name: 'CAD Technician',
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
                CAREER PATHWAYS
              </span>
            </div>
            <h1 className="ph-title">
              Where draughting can take you. <em>Mapped to programmes.</em>
            </h1>
            <p className="ph-sub">
              Each pathway maps to a programme stack — see the route from where you are to the role
              you want.
            </p>
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

      <section className="section section-light" data-screen-label="03 Career Cards">
        <div className="page">
          <div className="sec-head">
            <div className="sec-head-meta">
              <span className="section-label">
                <span className="bar" />
                SECTION 03 / CAREER PATHS
              </span>
              <h2 className="sec-head-title">Six pathways. One method.</h2>
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
