export type Career = {
  id: string;
  name: string;
  shortName: string;
  description: string;
  median: number; // ZAR / month, Gauteng entry-level
  band: { low: number; high: number };
  growthYoy: number; // 0-1
  software: string[];
  discipline: ('mechanical' | 'architectural' | 'civil' | 'bim' | 'cad' | 'structural')[];
  recommendedPathway: string; // course id
  alternativePathways: string[];
  topEmployers: string[];
  dayToDay: string;
  openRoles90d: number;
};

export const CAREERS: Career[] = [
  {
    id: 'architectural-draughtsperson',
    name: 'Architectural Draughtsperson',
    shortName: 'Architectural Draughtsperson',
    description:
      'Translates architectural designs into construction-ready drawings. Works between architects and contractors, owning the production-drawing set.',
    median: 26800,
    band: { low: 18000, high: 38000 },
    growthYoy: 0.061,
    software: ['Revit', 'AutoCAD', 'ArchiCAD'],
    discipline: ['architectural', 'bim'],
    recommendedPathway: 'mddop',
    alternativePathways: ['revit', 'bridging'],
    topEmployers: ['Studio MAS', 'GAPP Architects', 'Boogertman + Partners'],
    dayToDay:
      'Working drawings, schedules, sections, details. Coordinating with structural and MEP. Revit families and standards.',
    openRoles90d: 412,
  },
  {
    id: 'mechanical-draughtsperson',
    name: 'Mechanical Draughtsperson',
    shortName: 'Mechanical Draughtsperson',
    description:
      'Produces detailed mechanical part and assembly drawings for manufacturing and engineering shops. Lives in parametric 3D.',
    median: 28400,
    band: { low: 20000, high: 42000 },
    growthYoy: 0.042,
    software: ['Inventor', 'AutoCAD', 'SolidWorks'],
    discipline: ['mechanical'],
    recommendedPathway: 'mddop',
    alternativePathways: ['inventor'],
    topEmployers: ['Bell Equipment', 'Sasol Engineering', 'Aveng Trident Steel'],
    dayToDay:
      'Part modelling, assembly design, BOMs, GD&T, weldments, drawing creation for machining and fabrication.',
    openRoles90d: 287,
  },
  {
    id: 'civil-draughtsperson',
    name: 'Civil Draughtsperson',
    shortName: 'Civil Draughtsperson',
    description:
      'Sets out roads, drainage, services, site plans and topographic features for civil infrastructure projects.',
    median: 27200,
    band: { low: 19500, high: 39000 },
    growthYoy: 0.058,
    software: ['AutoCAD Civil 3D', 'AutoCAD'],
    discipline: ['civil'],
    recommendedPathway: 'civil',
    alternativePathways: ['mddop', 'autocad'],
    topEmployers: ['SMEC', 'Aurecon', 'Zutari'],
    dayToDay:
      'Survey interpretation, alignments, profiles, drainage, contour modelling, deliverables for tender and construction.',
    openRoles90d: 198,
  },
  {
    id: 'bim-coordinator',
    name: 'BIM Coordinator',
    shortName: 'BIM Coordinator',
    description:
      'Owns the federated BIM model across disciplines. Runs clash detection, model standards and information delivery plans.',
    median: 38500,
    band: { low: 28000, high: 58000 },
    growthYoy: 0.11,
    software: ['Revit', 'Navisworks', 'Solibri'],
    discipline: ['bim', 'architectural'],
    recommendedPathway: 'revit',
    alternativePathways: ['mddop'],
    topEmployers: ['WSP', 'AECOM', 'Aurecon'],
    dayToDay:
      'Model coordination meetings, clash workflows, ISO 19650 deliverables, training drafters on the BIM execution plan.',
    openRoles90d: 156,
  },
  {
    id: 'structural-detailer',
    name: 'Structural / Steel Detailer',
    shortName: 'Steel Detailer',
    description:
      'Detail-drafts steel and concrete structures for fabrication and erection. Works closely with shop floor and site teams.',
    median: 31000,
    band: { low: 22000, high: 46000 },
    growthYoy: 0.034,
    software: ['Tekla', 'AutoCAD', 'Advance Steel'],
    discipline: ['structural', 'mechanical'],
    recommendedPathway: 'mddop',
    alternativePathways: ['autocad'],
    topEmployers: ['Group Five', 'Stefanutti Stocks', 'Aveng Grinaker-LTA'],
    dayToDay:
      'Connections, member sizing, mark plans, bolt and weld schedules, shop drawings.',
    openRoles90d: 142,
  },
  {
    id: 'cad-technician',
    name: 'CAD Technician',
    shortName: 'CAD Technician',
    description:
      'Entry-level 2D/3D drafter. Cleans up drawings, runs production output, supports senior draughtspeople.',
    median: 18500,
    band: { low: 14000, high: 24000 },
    growthYoy: 0.021,
    software: ['AutoCAD'],
    discipline: ['cad'],
    recommendedPathway: 'autocad',
    alternativePathways: ['bridging'],
    topEmployers: ['Mid-tier design offices', 'Government infrastructure', 'Property developers'],
    dayToDay:
      'Drawing redlines, layer cleanup, plotting, sheet sets, layout fixes.',
    openRoles90d: 89,
  },
];

export function getCareerById(id: string) {
  return CAREERS.find((c) => c.id === id) ?? null;
}
