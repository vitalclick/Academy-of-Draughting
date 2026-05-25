import { COURSES, type Course } from './courses';

export type Campus = {
  slug: string;
  city: string;
  region: string;
  /** 'in-person' campuses match Full-time/Part-time courses; 'online' is nationwide. */
  kind: 'in-person' | 'online';
  headline: string;
  intro: string;
  /** Local search synonyms, woven into copy and keywords for SEO/AEO. */
  keywords: string[];
};

export const CAMPUSES: Campus[] = [
  {
    slug: 'johannesburg',
    city: 'Johannesburg',
    region: 'Gauteng',
    kind: 'in-person',
    headline: 'Draughting & CAD courses in Johannesburg',
    intro:
      'Study draughting at our Johannesburg campus — full-time and part-time, with AutoCAD, Revit and Inventor on industry hardware. Gauteng has the highest concentration of drawing-office jobs in South Africa, and we place students into them.',
    keywords: [
      'draughting course Johannesburg',
      'AutoCAD course Johannesburg',
      'CAD training Gauteng',
      'Revit course Johannesburg',
      'draughtsman course JHB',
    ],
  },
  {
    slug: 'durban',
    city: 'Durban',
    region: 'KwaZulu-Natal',
    kind: 'in-person',
    headline: 'Draughting & CAD courses in Durban',
    intro:
      'Learn draughting in Durban — full-time and part-time programmes for KwaZulu-Natal students, taught to the same DHET-examined standard as our Johannesburg campus, with strong links to local engineering and architecture practices.',
    keywords: [
      'draughting course Durban',
      'AutoCAD course Durban',
      'CAD training KZN',
      'draughtsman course Durban',
    ],
  },
  {
    slug: 'online',
    city: 'Online',
    region: 'Nationwide',
    kind: 'online',
    headline: 'Online draughting courses across South Africa',
    intro:
      'Study draughting online from anywhere in South Africa — live cohort sessions, recorded lessons and drawing-office reviews by desk share. The full MDDOP programme and every short course are available with the same recognised outcomes.',
    keywords: [
      'online draughting course South Africa',
      'distance CAD course',
      'study AutoCAD online South Africa',
      'remote draughting training',
    ],
  },
];

export function getCampus(slug: string) {
  return CAMPUSES.find((c) => c.slug === slug);
}

export function coursesForCampus(campus: Campus): Course[] {
  if (campus.kind === 'online') {
    return COURSES.filter((c) => c.activeModes.includes('Online'));
  }
  return COURSES.filter(
    (c) => c.activeModes.includes('Full-time') || c.activeModes.includes('Part-time')
  );
}
