'use client';

import { usePersonalization } from '@/components/personalization/provider';
import type { VariantOf } from '@/lib/personalization/experiments';
import type { Segment } from '@/lib/personalization/segment';
import { useEffect, useRef } from 'react';
import { track } from '@/lib/analytics/events';

type HeadlineKey = `${Segment}::${VariantOf<'home_hero_headline'>}`;

const HEADLINES: Record<HeadlineKey, { eyebrow: string; title: React.ReactNode; sub: string }> = {
  // Matric
  'matric::careers_start': {
    eyebrow: 'GRADE 11–12 · 2026 INTAKE',
    title: (
      <>
        Engineering careers <span className="accent">start here.</span>
      </>
    ),
    sub: 'A nationally examined draughting qualification straight out of matric. Job-ready in 10 months, full-time. Bursary plans available.',
  },
  'matric::specialist_since_1981': {
    eyebrow: 'GRADE 11–12 · SPECIALIST SCHOOL · 1981',
    title: (
      <>
        Forty-five years of <span className="accent">drawing offices.</span>
      </>
    ),
    sub: 'The specialist school for draughting and CAD — alumni in design offices across South Africa since 1981.',
  },
  'matric::drawing_office_ready': {
    eyebrow: 'GRADE 11–12 · 2026 INTAKE',
    title: (
      <>
        Drawing-office ready <span className="accent">on day one.</span>
      </>
    ),
    sub: 'The fastest credible route from matric to a real draughtsperson role. Built around the standards SA engineering offices demand.',
  },

  // Career changer
  'career_changer::careers_start': {
    eyebrow: 'CAREER CHANGER · PART-TIME OR ONLINE',
    title: (
      <>
        A new career <span className="accent">in 18 months.</span>
      </>
    ),
    sub: 'Part-time or online MDDOP for working adults pivoting into draughting. Evenings and weekends, with a real portfolio at the end.',
  },
  'career_changer::specialist_since_1981': {
    eyebrow: 'CAREER CHANGER · SINCE 1981',
    title: (
      <>
        Pivot, properly. <span className="accent">No fluff.</span>
      </>
    ),
    sub: 'Forty-five years of training adult learners into draughting careers. Specialist faculty, real industry standards, flexible study modes.',
  },
  'career_changer::drawing_office_ready': {
    eyebrow: 'CAREER CHANGER · BUILT FOR ADULTS',
    title: (
      <>
        From your current role to <span className="accent">draughting in 2027.</span>
      </>
    ),
    sub: 'Part-time and online pathways into draughting, built around how working adults actually learn.',
  },

  // Working pro (upskill)
  'working_pro::careers_start': {
    eyebrow: 'WORKING PRO · STACKABLE SHORT COURSES',
    title: (
      <>
        Stack the CAD skill <span className="accent">SA hires for.</span>
      </>
    ),
    sub: 'AutoCAD, Revit, Inventor — short, online, portfolio-graded. Mapped to live SA demand data.',
  },
  'working_pro::specialist_since_1981': {
    eyebrow: 'WORKING PRO · SPECIALIST SCHOOL',
    title: (
      <>
        Specialist short courses. <span className="accent">Industry-grade.</span>
      </>
    ),
    sub: 'AutoCAD, Revit and Inventor as they run in production drawing offices — not vendor demos.',
  },
  'working_pro::drawing_office_ready': {
    eyebrow: 'WORKING PRO · UPSKILL',
    title: (
      <>
        New software, <span className="accent">priced for working pros.</span>
      </>
    ),
    sub: 'Stackable Autodesk short courses you can finish around full-time work — and add to your portfolio.',
  },

  // Parent
  'parent::careers_start': {
    eyebrow: 'FOR PARENTS · 2026 INTAKE',
    title: (
      <>
        A real career <span className="accent">after matric.</span>
      </>
    ),
    sub: 'Nationally examined draughting qualification with measurable employment outcomes. Two campuses + online. Funding plans available.',
  },
  'parent::specialist_since_1981': {
    eyebrow: 'FOR PARENTS · ESTABLISHED 1981',
    title: (
      <>
        Specialist since 1981. <span className="accent">12,000+ graduates.</span>
      </>
    ),
    sub: 'A specialist drawing-office school with 45 years of placements into SA engineering and design offices.',
  },
  'parent::drawing_office_ready': {
    eyebrow: 'FOR PARENTS · OUTCOMES MATTER',
    title: (
      <>
        Outcomes you can <span className="accent">point at.</span>
      </>
    ),
    sub: '96% completion, 87% placement within 12 months on MDDOP N4/N5. Hard numbers, not motivation posters.',
  },

  // Returning
  'returning::careers_start': {
    eyebrow: 'WELCOME BACK',
    title: (
      <>
        Still deciding? <span className="accent">Take 60 seconds.</span>
      </>
    ),
    sub: 'Our recommender scores you against the programmes and surfaces the best match in plain English.',
  },
  'returning::specialist_since_1981': {
    eyebrow: 'WELCOME BACK · SPECIALIST SINCE 1981',
    title: (
      <>
        Forty-five years of <span className="accent">drawing offices.</span>
      </>
    ),
    sub: 'Welcome back. When you&apos;re ready, the apply flow takes six minutes and the recommender is even quicker.',
  },
  'returning::drawing_office_ready': {
    eyebrow: 'WELCOME BACK',
    title: (
      <>
        Ready when <span className="accent">you are.</span>
      </>
    ),
    sub: 'Six minutes to apply. We respond inside one business day. The recommender is even quicker.',
  },

  // Unknown — same as the original site
  'unknown::careers_start': {
    eyebrow: 'EST. 1981 · SOUTH AFRICA',
    title: (
      <>
        Engineering careers <span className="accent">start here.</span>
      </>
    ),
    sub: 'Specialist draughting and CAD education, aligned to real engineering and design office environments. Since 1981 — nationally examined, industry-built, job-ready.',
  },
  'unknown::specialist_since_1981': {
    eyebrow: 'EST. 1981 · SOUTH AFRICA',
    title: (
      <>
        Specialist since 1981. <span className="accent">Drawing offices, taught right.</span>
      </>
    ),
    sub: 'Forty-five years of one specialty: training draughtspeople who can walk into a real drawing office and contribute on day one.',
  },
  'unknown::drawing_office_ready': {
    eyebrow: 'EST. 1981 · SOUTH AFRICA',
    title: (
      <>
        Drawing-office ready <span className="accent">on day one.</span>
      </>
    ),
    sub: 'Built backwards from the standards SA engineering and design offices demand. Two campuses plus online, nationally examined.',
  },
};

export function HeroHeadline() {
  const { ready, segment, variantFor, anonId } = usePersonalization();
  const variant = variantFor('home_hero_headline');
  const key = `${segment}::${variant}` as HeadlineKey;
  const copy = HEADLINES[key] ?? HEADLINES['unknown::careers_start'];
  const reportedRef = useRef(false);

  useEffect(() => {
    if (!ready || reportedRef.current) return;
    reportedRef.current = true;
    track('experiment_exposed', {
      experiment: 'home_hero_headline',
      variant,
      segment,
      anonId: anonId ?? undefined,
    });
  }, [ready, variant, segment, anonId]);

  return (
    <>
      <div className="hero-eyebrow">
        <span className="pill pill-blue-dark">
          <span className="dot" />
          {copy.eyebrow}
        </span>
        <span className="t-mono-xs" style={{ color: 'var(--ink-on-dark-3)' }}>
          SAQA 66881 · DHET · QCTO
        </span>
      </div>
      <h1 className="hero-title">{copy.title}</h1>
      <p className="hero-sub">{copy.sub}</p>
    </>
  );
}
