import type { Metadata } from 'next';
import { notFound } from 'next/navigation';
import Link from 'next/link';
import { PageShell } from '@/components/chrome/page-shell';
import { FinalCTA } from '@/components/ui/final-cta';
import { AccreditationStrip } from '@/components/ui/accreditation-strip';
import { BookingForm } from '@/sections/consultation/booking-form';
import { BreadcrumbJsonLd, CourseJsonLd } from '@/seo/json-ld';
import { CAMPUSES, getCampus, coursesForCampus } from '@/data/campuses';
import { FEES, formatRand } from '@/data/funding';

export function generateStaticParams() {
  return CAMPUSES.map((c) => ({ city: c.slug }));
}

export async function generateMetadata({
  params,
}: {
  params: Promise<{ city: string }>;
}): Promise<Metadata> {
  const { city } = await params;
  const campus = getCampus(city);
  if (!campus) return {};
  return {
    title: campus.headline,
    description: campus.intro,
    keywords: campus.keywords,
    alternates: { canonical: `/campus/${campus.slug}` },
    openGraph: { title: campus.headline, description: campus.intro },
  };
}

export default async function CampusPage({ params }: { params: Promise<{ city: string }> }) {
  const { city } = await params;
  const campus = getCampus(city);
  if (!campus) notFound();

  const courses = coursesForCampus(campus);
  const defaultCampus = campus.kind === 'online' ? 'Online' : (campus.city as 'Johannesburg' | 'Durban');

  return (
    <PageShell active="courses" headerTone="light">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', href: '/' },
          { name: 'Courses', href: '/courses' },
          { name: campus.city, href: `/campus/${campus.slug}` },
        ]}
      />
      {courses.slice(0, 3).map((c) => (
        <CourseJsonLd key={c.id} id={c.id} name={`${c.title} — ${campus.city}`} description={c.desc} />
      ))}

      <section className="section section-paper" data-screen-label={`Campus · ${campus.city}`}>
        <div className="page">
          <span className="section-label">
            <span className="bar" />
            {campus.region.toUpperCase()} · {campus.kind === 'online' ? 'NATIONWIDE' : 'CAMPUS'}
          </span>
          <h1 className="t-h2" style={{ marginTop: 14, marginBottom: 12, maxWidth: 760 }}>
            {campus.headline}
          </h1>
          <p className="t-body-lg" style={{ maxWidth: 680, marginBottom: 24 }}>
            {campus.intro}
          </p>
          <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
            <Link href="/apply" className="btn btn-primary">Apply now →</Link>
            <Link href="/funding" className="btn btn-ghost-light">See fees & funding</Link>
          </div>
        </div>
      </section>

      <section className="section section-light">
        <div className="page">
          <h2 className="t-h3" style={{ marginBottom: 18 }}>
            Programmes available {campus.kind === 'online' ? 'online' : `in ${campus.city}`}
          </h2>
          <div
            style={{
              display: 'grid',
              gridTemplateColumns: 'repeat(auto-fill, minmax(260px, 1fr))',
              gap: 14,
            }}
          >
            {courses.map((c) => {
              const fee = FEES[c.id];
              return (
                <Link
                  key={c.id}
                  href={`/courses/${c.id}`}
                  style={{
                    border: '1px solid var(--line-on-light-2)',
                    borderRadius: 12,
                    padding: 20,
                    background: 'var(--white)',
                    textDecoration: 'none',
                    color: 'var(--ink)',
                    display: 'flex',
                    flexDirection: 'column',
                    gap: 8,
                  }}
                >
                  <span className="t-mono-xs" style={{ color: 'var(--blue-500)' }}>{c.code}</span>
                  <span style={{ fontSize: 17, fontWeight: 600 }}>{c.title}</span>
                  <span className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>
                    {c.duration} · {c.activeModes.join(' / ')}
                  </span>
                  {fee && (
                    <span className="t-mono-xs" style={{ color: 'var(--ink-3)', marginTop: 'auto' }}>
                      From {formatRand(fee.deposit)} deposit
                    </span>
                  )}
                </Link>
              );
            })}
          </div>
        </div>
      </section>

      <AccreditationStrip />

      <section className="section section-paper">
        <div className="page" style={{ maxWidth: 720 }}>
          <BookingForm
            defaultCampus={defaultCampus}
            heading={`Book a ${campus.kind === 'online' ? 'call' : `${campus.city} campus`} consultation`}
          />
        </div>
      </section>

      <FinalCTA />
    </PageShell>
  );
}
