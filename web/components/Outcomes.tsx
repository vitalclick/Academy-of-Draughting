import { outcomeStats } from "@/data/career-intel";

export function Outcomes() {
  return (
    <section className="bg-paper">
      <div className="container-page py-24">
        <div className="grid gap-8 lg:grid-cols-[1fr_1fr] lg:items-end">
          <div>
            <span className="eyebrow">SECTION 05 / OUTCOMES</span>
            <h2 className="mt-5 text-3xl font-medium leading-tight sm:text-4xl">
              We don't do motivation posters.<br />
              <span className="italic font-normal text-electric-600">We measure.</span>
            </h2>
          </div>
          <p className="text-ink-3">
            What employers actually value: accuracy, drawing office discipline,
            real-software fluency, and a portfolio of work that looks like the
            work they do. We optimize for those — not slogans.
          </p>
        </div>
        <div className="mt-10 grid gap-4 sm:grid-cols-2 lg:grid-cols-4">
          {outcomeStats.map((s) => (
            <div key={s.label} className="rounded-lg border border-paper-3 bg-white p-6">
              <div className="text-4xl font-medium tracking-tight">
                {s.value}
                {s.unit && <span className="text-ink-3 text-2xl">{s.unit}</span>}
              </div>
              <div className="mt-3 text-sm font-medium text-ink-2">{s.label}</div>
              <div className="mt-1 mono text-ink-4">{s.meta}</div>
            </div>
          ))}
        </div>
      </div>
    </section>
  );
}
