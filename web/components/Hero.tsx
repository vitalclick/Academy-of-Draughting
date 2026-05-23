import Link from "next/link";

export function Hero() {
  return (
    <section className="section-dark relative overflow-hidden">
      <BlueprintBackdrop />
      <div className="container-page relative grid gap-10 py-24 lg:grid-cols-[1.2fr_0.8fr] lg:py-32">
        <div>
          <span className="mono text-electric-300">SECTION 01 / ENGINEERING CAREERS · EST. 1981</span>
          <h1 className="mt-6 text-4xl font-medium leading-[1.05] tracking-tight sm:text-5xl lg:text-6xl">
            Engineering careers{" "}
            <span className="text-cyan-400 italic font-normal">start here.</span>
          </h1>
          <p className="mt-6 max-w-xl text-base text-white/70">
            South Africa's specialist draughting institution. AI-assisted
            admissions, real CAD software, and a portfolio aligned to the work
            engineering and design offices actually do — since 1981.
          </p>
          <div className="mt-8 flex flex-wrap gap-3">
            <Link href="/apply" className="btn-primary">Start your application →</Link>
            <Link href="/courses" className="btn-ghost-dark">Explore courses</Link>
          </div>
          <dl className="mt-12 grid max-w-md grid-cols-3 gap-6 border-t border-white/10 pt-6">
            <Stat k="44+" v="Years training" />
            <Stat k="96%" v="Completion rate" />
            <Stat k="87%" v="Placed in 12mo" />
          </dl>
        </div>
        <div className="rounded-xl border border-white/10 bg-white/[0.03] p-6 backdrop-blur">
          <span className="mono text-cyan-400">/ AI MATCH PREVIEW</span>
          <p className="mt-3 text-sm text-white/70">
            Tell AIDA what you want to do. She'll suggest a path, the right
            software stack, and what a starting salary looks like in your
            province.
          </p>
          <div className="mt-5 space-y-2 text-sm">
            {[
              ["Architectural Draughtsperson", 96],
              ["Mechanical Draughtsperson", 88],
              ["BIM Coordinator", 76],
            ].map(([name, score]) => (
              <div key={name as string} className="rounded-md border border-white/10 bg-white/[0.02] p-3">
                <div className="flex items-center justify-between">
                  <span>{name}</span>
                  <span className="mono text-cyan-400">{score}%</span>
                </div>
                <div className="mt-2 h-1 overflow-hidden rounded-full bg-white/10">
                  <div className="h-full bg-cyan-400" style={{ width: `${score}%` }} />
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Stat({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="text-2xl font-medium">{k}</dt>
      <dd className="mt-1 text-[12px] uppercase tracking-wider text-white/50">{v}</dd>
    </div>
  );
}

function BlueprintBackdrop() {
  return (
    <svg className="pointer-events-none absolute inset-0 h-full w-full opacity-[0.12]" aria-hidden="true">
      <defs>
        <pattern id="grid" width="40" height="40" patternUnits="userSpaceOnUse">
          <path d="M 40 0 L 0 0 0 40" fill="none" stroke="white" strokeWidth="0.5" />
        </pattern>
      </defs>
      <rect width="100%" height="100%" fill="url(#grid)" />
    </svg>
  );
}
