export const metadata = { title: "About — Academy of Advanced Draughting" };

export default function AboutPage() {
  return (
    <section className="bg-white">
      <div className="container-page py-20">
        <span className="eyebrow">ABOUT</span>
        <h1 className="mt-4 max-w-3xl text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
          A specialist institution. <span className="italic font-normal text-electric-600">Built for the design office.</span>
        </h1>
        <p className="mt-6 max-w-2xl text-ink-3">
          The Academy of Advanced Draughting was established in 1981 to train
          draughtspeople for South African engineering and design offices. Four
          decades on, the mission hasn't drifted — we still optimize for
          drawing-office discipline, real CAD fluency, and a portfolio that
          mirrors the work employers actually do.
        </p>
        <div className="mt-12 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          <Block title="Mission" body="Train technically excellent draughtspeople for industry. No fluff, no shortcuts, no template assignments." />
          <Block title="Industry alignment" body="Curriculum reviewed quarterly against live job listings, design-office hiring panels, and CAD-software releases." />
          <Block title="Accreditation" body="QCTO registered, Autodesk certified. MDDOP qualifications recognized by SETA and major employer groups." />
          <Block title="Faculty" body="Practising draughtspeople, BIM coordinators, and design-office leads — not career academics." />
          <Block title="Campus" body="Johannesburg-based studio environment modelled on a working design office, with full Autodesk suite per workstation." />
          <Block title="Outcomes" body="96% completion. 87% placement within 12 months. Median starting salary R28,400 (Q2 2026, GP)." />
        </div>
      </div>
    </section>
  );
}

function Block({ title, body }: { title: string; body: string }) {
  return (
    <div className="rounded-lg border border-paper-3 bg-paper p-6">
      <h3 className="text-lg font-medium">{title}</h3>
      <p className="mt-2 text-sm text-ink-3">{body}</p>
    </div>
  );
}
