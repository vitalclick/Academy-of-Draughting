export type CourseMode = 'Full-time' | 'Part-time' | 'Online';

export type Course = {
  id: string;
  code: string;
  title: string;
  desc: string;
  modes: CourseMode[];
  activeModes: CourseMode[];
  duration: string;
  exam: string;
  entry: string;
  intake: string;
  software: string[];
  discipline: string[];
  fit: number;
  featured?: boolean;
  modules: string[];
  vis: 'plan' | 'compass' | 'orthographic' | 'isometric' | 'part' | 'contour';
  level: 'Foundation' | 'Certificate' | 'Specialisation';
  careerOutcomes: string[];
  salaryBand: string;
  demand: string;
  faqs: { q: string; a: string }[];
};

export const COURSES: Course[] = [
  {
    id: 'mddop',
    code: 'MDDOP / N4–N5',
    title: 'MDDOP National Certificate',
    desc: 'Multi-Disciplinary Drawing Office Practice. The flagship pathway — covers mechanical, civil and architectural draughting with AutoCAD, Revit and Inventor.',
    modes: ['Full-time', 'Part-time', 'Online'],
    activeModes: ['Full-time', 'Part-time', 'Online'],
    duration: '10–18 mo',
    exam: 'DHET national',
    entry: 'Grade 11+',
    intake: 'Jan / May / Sep',
    software: ['AutoCAD', 'Revit', 'Inventor'],
    discipline: ['mechanical', 'architectural', 'civil'],
    fit: 96,
    featured: true,
    level: 'Certificate',
    modules: [
      'Building Draughting',
      'Mechanical Draughting',
      'Electrical Draughting',
      'Structural Draughting',
      'CAD (AutoCAD)',
      'MDDOP Theory & Practice',
      'Pictorial Drawing',
      'General Draughting',
    ],
    vis: 'plan',
    careerOutcomes: [
      'Architectural Draughtsperson',
      'Mechanical Draughtsperson',
      'Civil Draughtsperson',
      'BIM Coordinator',
      'Structural Detailer',
    ],
    salaryBand: 'R18,000 – R32,000 / month entry level (Gauteng, Q2 2026)',
    demand: 'High · 1,200+ live listings in SA over last 90 days',
    faqs: [
      {
        q: 'Do I need prior CAD experience?',
        a: 'No. MDDOP starts from drawing-office first principles. Grade 11+ mathematics is the prerequisite, not software.',
      },
      {
        q: 'Is this nationally recognised?',
        a: 'Yes. MDDOP N4/N5 is examined under the DHET national framework (SAQA 66881) and is QCTO aligned.',
      },
      {
        q: 'Can I study online?',
        a: 'Yes. The full programme is available in self-paced online mode alongside Johannesburg and Durban campus options.',
      },
    ],
  },
  {
    id: 'bridging',
    code: 'BRIDGING',
    title: 'Bridging Course',
    desc: 'For students not yet at N4 entry — maths fundamentals, technical drawing principles, AutoCAD basics. Builds the foundation for MDDOP.',
    modes: ['Full-time', 'Part-time'],
    activeModes: ['Full-time', 'Part-time'],
    duration: '3–6 mo',
    exam: 'Internal',
    entry: 'Open',
    intake: 'Rolling',
    software: ['AutoCAD'],
    discipline: ['foundation'],
    fit: 78,
    level: 'Foundation',
    modules: [
      'Engineering maths basics',
      'Technical drawing principles',
      'CAD fundamentals',
      'Drawing office vocabulary',
    ],
    vis: 'compass',
    careerOutcomes: ['Progression to MDDOP N4/N5'],
    salaryBand: 'N/A — foundation pathway',
    demand: 'Continuous · rolling intakes',
    faqs: [
      {
        q: 'Who is the bridging course for?',
        a: 'Students whose maths or technical-drawing background needs a boost before MDDOP. No prerequisites required.',
      },
    ],
  },
  {
    id: 'autocad',
    code: 'SHORT / 04',
    title: 'AutoCAD Essentials',
    desc: 'Industry-standard 2D + 3D drafting. Production drawings, layout, dimensioning, layer management.',
    modes: ['Online', 'Part-time'],
    activeModes: ['Online', 'Part-time'],
    duration: '8 weeks',
    exam: 'Portfolio',
    entry: 'Open',
    intake: 'Rolling',
    software: ['AutoCAD'],
    discipline: ['cad'],
    fit: 88,
    level: 'Specialisation',
    modules: [
      '2D drafting fundamentals',
      'Layer & block management',
      '3D modelling',
      'Plotting & sheet sets',
    ],
    vis: 'orthographic',
    careerOutcomes: ['CAD Technician', 'Junior Draughtsperson'],
    salaryBand: 'R14,000 – R22,000 / month entry level',
    demand: 'High · 91% of SA drawing offices use AutoCAD',
    faqs: [
      {
        q: 'Is this enough to work as a draughtsperson?',
        a: 'For CAD Technician roles, yes. For full draughtsperson roles, combine with MDDOP or a discipline specialisation.',
      },
    ],
  },
  {
    id: 'revit',
    code: 'SHORT / 05',
    title: 'Revit Architecture',
    desc: 'BIM-first architectural modelling. Families, schedules, construction documentation, multi-discipline coordination.',
    modes: ['Online', 'Part-time'],
    activeModes: ['Online', 'Part-time'],
    duration: '10 weeks',
    exam: 'Portfolio',
    entry: 'AutoCAD or equiv.',
    intake: 'Rolling',
    software: ['Revit'],
    discipline: ['architectural', 'bim'],
    fit: 84,
    level: 'Specialisation',
    modules: [
      'BIM concepts',
      'Walls / floors / roofs',
      'Families & components',
      'Sheets & documentation',
    ],
    vis: 'isometric',
    careerOutcomes: ['Architectural Draughtsperson', 'BIM Coordinator'],
    salaryBand: 'R22,000 – R38,000 / month',
    demand: 'Growing fast · key BIM hire across major SA practices',
    faqs: [
      {
        q: 'Do I need AutoCAD first?',
        a: 'A working knowledge helps but is not strictly required — we cover BIM concepts from the ground up.',
      },
    ],
  },
  {
    id: 'inventor',
    code: 'SHORT / 06',
    title: 'Inventor for Mechanical',
    desc: 'Parametric 3D modelling for mechanical and manufacturing. Assemblies, drawings, sheet metal, weldments.',
    modes: ['Online'],
    activeModes: ['Online'],
    duration: '10 weeks',
    exam: 'Portfolio',
    entry: 'AutoCAD or equiv.',
    intake: 'Rolling',
    software: ['Inventor'],
    discipline: ['mechanical'],
    fit: 71,
    level: 'Specialisation',
    modules: ['Parametric sketches', 'Part modelling', 'Assembly design', 'Drawing creation'],
    vis: 'part',
    careerOutcomes: ['Mechanical Draughtsperson', 'Manufacturing CAD Technician'],
    salaryBand: 'R20,000 – R34,000 / month',
    demand: 'Steady · mechanical engineering & manufacturing sectors',
    faqs: [
      {
        q: 'Is Inventor better than SolidWorks?',
        a: 'Both are excellent — Inventor is more common in SA mechanical engineering practices and the workflows transfer.',
      },
    ],
  },
  {
    id: 'civil',
    code: 'SPEC / 07',
    title: 'Civil Draughting Specialisation',
    desc: 'Roads, drainage, site plans, contours. Adds Civil 3D to your toolkit on top of AutoCAD.',
    modes: ['Part-time'],
    activeModes: ['Part-time'],
    duration: '12 weeks',
    exam: 'Portfolio',
    entry: 'MDDOP or AutoCAD',
    intake: 'Apr / Oct',
    software: ['AutoCAD', 'Civil 3D'],
    discipline: ['civil'],
    fit: 64,
    level: 'Specialisation',
    modules: [
      'Survey data interpretation',
      'Road & street design',
      'Drainage & utilities',
      'Site & contour modelling',
    ],
    vis: 'contour',
    careerOutcomes: ['Civil Draughtsperson', 'Site CAD Technician'],
    salaryBand: 'R22,000 – R36,000 / month',
    demand: 'Strong · infrastructure investment cycle',
    faqs: [
      {
        q: 'What software is covered?',
        a: 'AutoCAD as the base layer plus Civil 3D for survey, alignments, profiles and corridor modelling.',
      },
    ],
  },
];

export const FILTERS = {
  mode: ['All modes', 'Full-time', 'Part-time', 'Online'] as const,
  level: ['All levels', 'Foundation', 'Certificate', 'Specialisation'] as const,
  software: ['All software', 'AutoCAD', 'Revit', 'Inventor', 'Civil 3D'] as const,
};

export const SOFT_MARKS = [
  {
    name: 'AutoCAD',
    letter: 'A',
    color: '#D6312D',
    desc: 'Industry-standard 2D and 3D drafting — used in 91% of SA drawing offices.',
    meta: 'PRESENT IN 5 COURSES',
  },
  {
    name: 'Revit',
    letter: 'R',
    color: '#0078D4',
    desc: 'BIM modelling for architecture and MEP — the language of modern construction.',
    meta: 'PRESENT IN 3 COURSES',
  },
  {
    name: 'Inventor',
    letter: 'I',
    color: '#36B37E',
    desc: 'Parametric 3D modelling for mechanical and manufacturing engineering.',
    meta: 'PRESENT IN 2 COURSES',
  },
  {
    name: 'Civil 3D',
    letter: 'C',
    color: '#B85C00',
    desc: 'Roads, drainage, site grading and survey workflows for civil draughting.',
    meta: 'PRESENT IN 1 COURSE',
  },
];

export function getCourseById(id: string) {
  return COURSES.find((c) => c.id === id);
}
