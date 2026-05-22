import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageShell } from '@/components/chrome/page-shell';
import { FinalCTA } from '@/components/ui/final-cta';
import { BreadcrumbJsonLd, CourseJsonLd, FaqJsonLd } from '@/seo/json-ld';
import { CourseVisSvg } from '@/sections/courses/course-vis';
import { COURSES, getCourseById } from '@/data/courses';

export const dynamicParams = false;

export async function generateStaticParams() {
  return COURSES.map((c) => ({ id: c.id }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ id: string }>;
}): Promise<Metadata> {
  const { id } = await params;
  const c = getCourseById(id);
  if (!c) return {};
  return {
    title: c.title,
    description: c.desc,
    alternates: { canonical: `/courses/${c.id}` },
    openGraph: {
      title: c.title,
      description: c.desc,
      url: `/courses/${c.id}`,
      type: 'article',
    },
  };
}

export default async function CourseDetailPage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const c = getCourseById(id);
  if (!c) notFound();

  return (
    <PageShell active="courses" headerTone="light">
      <CourseJsonLd id={c.id} name={c.title} description={c.desc} />
      <FaqJsonLd items={c.faqs} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', href: '/' },
          { name: 'Courses', href: '/courses' },
          { name: c.title, href: `/courses/${c.id}` },
        ]}
      />

      <section className="page-header" data-screen-label="01 Course Header">
        <div className="page ph-inner">
          <div>
            <div className="ph-eyebrow">
              <span className="pill pill-blue-dark">
                <span className="dot" />
                {c.code}
              </span>
              <span className="t-mono-xs" style={{ color: 'var(--ink-on-dark-3)' }}>
                ★ {c.fit}% FIT · {c.level.toUpperCase()}
              </span>
            </div>
            <h1 className="ph-title">{c.title}</h1>
            <p className="ph-sub">{c.desc}</p>
            <div style={{ display: 'flex', gap: 12, marginTop: 24, flexWrap: 'wrap' }}>
              <Link href="/apply" className="btn btn-lg btn-primary">
                Apply for this programme{' '}
                <span className="arr" aria-hidden="true">
                  →
                </span>
              </Link>
              <Link href="/courses" className="btn btn-lg btn-ghost-dark">
                All programmes
              </Link>
            </div>
          </div>
          <div className="ph-meta">
            <div className="ph-meta-cell">
              <span className="ph-meta-k">DURATION</span>
              <span className="ph-meta-v">{c.duration}</span>
              <span className="ph-meta-foot">{c.activeModes.join(' · ')}</span>
            </div>
            <div className="ph-meta-cell">
              <span className="ph-meta-k">EXAM</span>
              <span className="ph-meta-v">{c.exam}</span>
              <span className="ph-meta-foot">Standards-aligned</span>
            </div>
            <div className="ph-meta-cell">
              <span className="ph-meta-k">ENTRY</span>
              <span className="ph-meta-v">{c.entry}</span>
              <span className="ph-meta-foot">Bridging available</span>
            </div>
            <div className="ph-meta-cell">
              <span className="ph-meta-k">INTAKE</span>
              <span className="ph-meta-v">{c.intake}</span>
              <span className="ph-meta-foot">Open enrollment</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-light" data-screen-label="02 Course · Modules">
        <div className="page">
          <div className="sec-head">
            <div className="sec-head-meta">
              <span className="section-label">
                <span className="bar" />
                SECTION 02 / CURRICULUM
              </span>
              <h2 className="sec-head-title">
                What you&apos;ll build. <em style={{ color: 'var(--blue-500)', fontStyle: 'italic', fontWeight: 400 }}>Module by module.</em>
              </h2>
            </div>
            <p className="sec-head-sub">
              {c.modules.length} module{c.modules.length === 1 ? '' : 's'}. Each one ends with
              drawing-office grade output, not academic answers.
            </p>
          </div>
          <div className="course-modules-grid">
            {c.modules.map((m, i) => (
              <div key={m} className="course-module-card">
                <span className="course-module-ix">{String(i + 1).padStart(2, '0')}</span>
                <h3>{m}</h3>
              </div>
            ))}
          </div>
        </div>
      </section>

      <section className="section section-paper" data-screen-label="03 Course · Outcomes">
        <div className="page">
          <div className="course-outcomes-grid">
            <div>
              <span className="section-label">
                <span className="bar" />
                CAREER OUTCOMES
              </span>
              <h2 className="t-h2" style={{ margin: '12px 0 16px' }}>
                Where graduates land.
              </h2>
              <ul className="course-outcomes-list">
                {c.careerOutcomes.map((o) => (
                  <li key={o}>{o}</li>
                ))}
              </ul>
            </div>
            <div className="course-outcomes-data">
              <div className="course-outcomes-data-cell">
                <span className="t-mono-xs">SALARY BAND · ENTRY</span>
                <div className="course-outcomes-data-v">{c.salaryBand}</div>
              </div>
              <div className="course-outcomes-data-cell">
                <span className="t-mono-xs">INDUSTRY DEMAND</span>
                <div className="course-outcomes-data-v">{c.demand}</div>
              </div>
              <div className="course-outcomes-data-cell">
                <span className="t-mono-xs">SOFTWARE COVERED</span>
                <div className="course-outcomes-data-v">{c.software.join(' · ')}</div>
              </div>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-darker" data-screen-label="04 Course · Visual">
        <div className="page" style={{ maxWidth: 980 }}>
          <div
            style={{
              borderRadius: 14,
              overflow: 'hidden',
              border: '1px solid var(--line-on-dark)',
              background: 'rgba(0,0,0,0.2)',
              padding: 32,
              position: 'relative',
            }}
          >
            <CourseVisSvg kind={c.vis} />
          </div>
        </div>
      </section>

      {c.faqs.length > 0 && (
        <section className="section section-light" data-screen-label="05 Course · FAQ">
          <div className="page">
            <div className="sec-head">
              <div className="sec-head-meta">
                <span className="section-label">
                  <span className="bar" />
                  SECTION 05 / FAQ
                </span>
                <h2 className="sec-head-title">Questions, answered.</h2>
              </div>
            </div>
            <div className="course-faqs">
              {c.faqs.map((f) => (
                <details key={f.q} className="course-faq">
                  <summary>{f.q}</summary>
                  <p>{f.a}</p>
                </details>
              ))}
            </div>
          </div>
        </section>
      )}

      <FinalCTA />
    </PageShell>
  );
}
