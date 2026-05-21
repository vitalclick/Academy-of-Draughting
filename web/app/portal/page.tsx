export const metadata = { title: "Student Portal — Academy of Advanced Draughting" };

export default function PortalPage() {
  return (
    <section className="bg-navy-900 text-white">
      <div className="container-page py-20">
        <span className="mono text-electric-300">PORTAL · PREVIEW</span>
        <h1 className="mt-4 text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
          The student portal is <span className="italic font-normal text-cyan-400">coming online.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-white/70">
          Once your application is accepted, you'll get access to the LMS:
          assignments, CAD project uploads, faculty feedback, AI-tutor
          assistance, and live progress against your portfolio targets.
        </p>
        <div className="mt-12 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
          {[
            ["Assignments", "Brief, due date, faculty annotations, version history."],
            ["CAD Uploads", "Drag-drop DWG / RVT / IPT. Auto-validated against the brief checklist."],
            ["AI Tutor", "Stuck on a constraint? Ask Claude — context-aware on your active drawing."],
            ["Progress", "Portfolio depth, software coverage, employer-readiness score."],
            ["Schedule", "Lectures, studio sessions, peer-review slots."],
            ["Career Hub", "Portfolio-ready job listings, sourced from partner offices."],
          ].map(([t, d]) => (
            <div key={t} className="card-dark">
              <h3 className="text-lg font-medium">{t}</h3>
              <p className="mt-2 text-sm text-white/65">{d}</p>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
