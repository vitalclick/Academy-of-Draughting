export type CareerPath = {
  slug: string;
  name: string;
  software: string;
  matchScore: number;
  medianSalary: number;
  openRoles: number;
  timeToHireDays: number;
  facultyNote: string;
};

export type OutcomeStat = {
  value: string;
  unit?: string;
  label: string;
  meta: string;
};

export const careerPaths: CareerPath[] = [
  {
    slug: "architectural-draughtsperson",
    name: "Architectural Draughtsperson",
    software: "Revit · ArchiCAD",
    matchScore: 96,
    medianSalary: 28400,
    openRoles: 1284,
    timeToHireDays: 42,
    facultyNote:
      "MDDOP N4/N5 + a Revit short course covers 87% of current listings. The bottleneck for first-time hires is portfolio depth — not credentials.",
  },
  {
    slug: "mechanical-draughtsperson",
    name: "Mechanical Draughtsperson",
    software: "Inventor · SolidWorks",
    matchScore: 88,
    medianSalary: 31200,
    openRoles: 942,
    timeToHireDays: 38,
    facultyNote:
      "Inventor fluency plus GD&T literacy out-ranks degree letters in 70% of mechanical design-office shortlists.",
  },
  {
    slug: "structural-steel-detailer",
    name: "Structural / Steel Detailer",
    software: "Tekla · AutoCAD",
    matchScore: 81,
    medianSalary: 33800,
    openRoles: 488,
    timeToHireDays: 51,
    facultyNote:
      "Tekla projects with a clean fabrication drawing set are the single strongest signal for steel-detailing employers.",
  },
  {
    slug: "bim-coordinator",
    name: "BIM Coordinator",
    software: "Revit · Navisworks",
    matchScore: 76,
    medianSalary: 38400,
    openRoles: 312,
    timeToHireDays: 56,
    facultyNote:
      "Clash detection workflows and federated-model literacy unlock the largest salary jump in the discipline.",
  },
  {
    slug: "civil-draughtsperson",
    name: "Civil Draughtsperson",
    software: "AutoCAD Civil 3D",
    matchScore: 72,
    medianSalary: 26800,
    openRoles: 618,
    timeToHireDays: 44,
    facultyNote:
      "Civil 3D corridor modelling is the single most-requested skill on infrastructure tenders we tracked this quarter.",
  },
  {
    slug: "cad-technician",
    name: "CAD Technician",
    software: "AutoCAD",
    matchScore: 65,
    medianSalary: 21900,
    openRoles: 1144,
    timeToHireDays: 28,
    facultyNote:
      "Entry-friendly. The MDDOP N4 alone qualifies graduates for the majority of openings tagged 'CAD Technician'.",
  },
];

export const outcomeStats: OutcomeStat[] = [
  { value: "96", unit: "%", label: "Programme Completion", meta: "MDDOP N4/N5 · 2024 cohort" },
  { value: "87", unit: "%", label: "Job Placement · 12mo", meta: "Across all 2023 graduates" },
  { value: "R28.4k", label: "Median Starting Salary", meta: "Gauteng · Q2 2026" },
  { value: "1,284", label: "Open Roles Tracked", meta: "Last 90 days · ZA market" },
];

export const intelUpdatedAt = "Q2 2026 · 14 May 2026";
