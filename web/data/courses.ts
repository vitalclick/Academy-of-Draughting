export type Course = {
  slug: string;
  code: string;
  title: string;
  description: string;
  duration: string;
  mode: string;
  software: string[];
  recommended?: boolean;
};

export const courses: Course[] = [
  {
    slug: "mddop-n4-n5",
    code: "MDDOP",
    title: "Mechanical Draughting & Design — N4/N5",
    description:
      "The flagship full-time programme. Drawing office discipline, GD&T, sectioning, assemblies, and a portfolio aligned to South African design-office workflows.",
    duration: "12 months",
    mode: "Full-time, on-campus",
    software: ["AutoCAD", "Inventor", "Revit"],
    recommended: true,
  },
  {
    slug: "bridging",
    code: "BRIDGE",
    title: "Engineering Bridging Course",
    description:
      "For learners without an engineering matric. Covers mathematics, drawing fundamentals, and CAD basics — bridges directly into N4.",
    duration: "6 months",
    mode: "Full-time or evening",
    software: ["AutoCAD"],
  },
  {
    slug: "autocad",
    code: "ACAD",
    title: "AutoCAD Professional",
    description:
      "Industry-standard 2D and 3D modelling. From draughting setups to advanced annotation, blocks, and sheet-set workflows.",
    duration: "8 weeks",
    mode: "Evening · part-time",
    software: ["AutoCAD"],
  },
  {
    slug: "revit",
    code: "RVT",
    title: "Revit & BIM Fundamentals",
    description:
      "Architectural and structural Revit, families, schedules, and clash workflows — the BIM stack employers actually hire for.",
    duration: "10 weeks",
    mode: "Evening · part-time",
    software: ["Revit", "Navisworks"],
  },
  {
    slug: "inventor",
    code: "INV",
    title: "Inventor for Mechanical Design",
    description:
      "Parametric modelling, sheet metal, weldments, and full mechanical assembly drawings to ISO/ASME standard.",
    duration: "10 weeks",
    mode: "Evening · part-time",
    software: ["Inventor"],
  },
];
