import { CAREERS } from './careers';

/**
 * Outcome stats and testimonials shown as social proof.
 *
 * NOTE: replace the testimonials and headline figures below with real,
 * consented student quotes and verified placement statistics before launch.
 * They are seeded here so the component renders meaningfully in development.
 */
export const OUTCOME_STATS = [
  { k: 'Since', v: '1981', note: 'Four decades training draughtspeople' },
  { k: 'Graduates placed', v: '4,800+', note: 'Into SA drawing offices' },
  { k: 'Employed within 6 months', v: '86%', note: 'Of job-seeking graduates' },
  { k: 'Live SA listings / 90 days', v: `${CAREERS.reduce((s, c) => s + c.openRoles90d, 0)}+`, note: 'Across the roles we train for' },
];

export type Testimonial = {
  name: string;
  role: string;
  quote: string;
};

export const TESTIMONIALS: Testimonial[] = [
  {
    name: 'Thabo M.',
    role: 'Architectural Draughtsperson, Johannesburg',
    quote:
      'I came in with matric and no CAD experience. Eight months after MDDOP I was on a production-drawing team at a Joburg practice. The portfolio they made me build is what got me hired.',
  },
  {
    name: 'Aisha P.',
    role: 'BIM Coordinator, Durban',
    quote:
      'The Revit training was hands-on from day one. I went from drafting to coordinating a federated model in under two years. The lecturers actually worked in the industry.',
  },
  {
    name: 'Sipho N.',
    role: 'Mechanical Draughtsperson, Gauteng',
    quote:
      'Studying online meant I could keep my job while I retrained. Inventor and the assembly work translated straight into my new role on a fabrication floor.',
  },
];

/** Distinct employer names drawn from our career dataset. */
export const EMPLOYERS = Array.from(new Set(CAREERS.flatMap((c) => c.topEmployers)))
  .filter((e) => !e.toLowerCase().includes('mid-tier') && !e.toLowerCase().includes('government') && !e.toLowerCase().includes('property'))
  .slice(0, 12);
