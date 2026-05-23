const FEATURES = [
  {
    label: "01 / ADMISSIONS",
    title: "AIDA — your admissions assistant",
    desc: "A real LLM-powered chat that answers admissions questions, qualifies applicants, and books human follow-ups when it matters.",
  },
  {
    label: "02 / CAREER COUNSEL",
    title: "Match against 8 draughting paths",
    desc: "Architectural, Mechanical, Civil, Steel Detailing, MEP, BIM, Construction Docs, Design Office Lead — scored against your goals and experience.",
  },
  {
    label: "03 / RECOMMENDER",
    title: "The right course, not all the courses",
    desc: "AIDA recommends MDDOP, Bridging, AutoCAD, Revit, or Inventor based on where you are today — and where employers say you should head.",
  },
  {
    label: "04 / APP",
    title: "Smart application with auto-save",
    desc: "Multi-step form, OCR document uploads, WhatsApp handoff. Pick up exactly where you left off, on any device.",
  },
  {
    label: "05 / OUTLOOK",
    title: "Industry intel — updated quarterly",
    desc: "Median salaries, regional demand, software requirements, time-to-hire. We don't quote you yesterday's market.",
  },
];

export function AIFeatures() {
  return (
    <section className="section-dark border-t border-white/10">
      <div className="container-page py-24">
        <div className="grid gap-10 lg:grid-cols-[1fr_2fr]">
          <div>
            <span className="mono text-electric-300">SECTION 02 / AI FEATURES</span>
            <h2 className="mt-5 text-3xl font-medium leading-tight sm:text-4xl">
              Built around <span className="italic font-normal text-cyan-400">intelligence,</span> not brochures.
            </h2>
            <p className="mt-5 max-w-md text-white/65">
              Every part of the admissions journey is reinforced by AI — from the
              first question on the homepage to the moment you upload your
              matric certificate.
            </p>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {FEATURES.map((f) => (
              <article key={f.label} className="card-dark">
                <span className="mono text-cyan-400">{f.label}</span>
                <h3 className="mt-3 text-lg font-medium">{f.title}</h3>
                <p className="mt-2 text-sm text-white/65">{f.desc}</p>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}
