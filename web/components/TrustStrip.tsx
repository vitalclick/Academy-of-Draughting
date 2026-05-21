const ITEMS = [
  "AUTODESK CERTIFIED",
  "QCTO ACCREDITED",
  "ISO 9001:2015",
  "SETA REGISTERED",
  "INDUSTRY PARTNERED",
];

export function TrustStrip() {
  return (
    <section className="border-y border-paper-2 bg-paper">
      <div className="container-page flex flex-wrap items-center justify-center gap-x-10 gap-y-3 py-6 text-[11px] text-ink-3">
        {ITEMS.map((t) => (
          <span key={t} className="mono">{t}</span>
        ))}
      </div>
    </section>
  );
}
