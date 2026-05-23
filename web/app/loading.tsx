export default function RootLoading() {
  return (
    <section className="bg-paper">
      <div className="container-page grid min-h-[40vh] place-items-center py-16">
        <div className="flex items-center gap-3 text-ink-3">
          <span
            className="inline-block h-3 w-3 animate-pulse rounded-full bg-electric-500"
            aria-hidden
          />
          <span className="mono text-[12px] uppercase tracking-wide">Loading</span>
        </div>
      </div>
    </section>
  );
}
