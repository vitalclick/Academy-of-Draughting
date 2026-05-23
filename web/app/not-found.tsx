import Link from "next/link";

export default function NotFound() {
  return (
    <section className="bg-paper">
      <div className="container-page max-w-2xl py-24">
        <span className="eyebrow">404</span>
        <h1 className="mt-3 text-4xl font-medium tracking-tight">
          That page isn&rsquo;t in the catalogue.
        </h1>
        <p className="mt-4 text-ink-3">
          Whatever you were looking for, it doesn&rsquo;t live here. The
          admissions team can usually find the right answer faster than this
          page can.
        </p>
        <div className="mt-6 flex flex-wrap gap-3">
          <Link href="/" className="btn-primary">
            Home
          </Link>
          <Link href="/courses" className="btn-ghost">
            Browse courses
          </Link>
          <Link href="/apply" className="btn-ghost">
            Apply
          </Link>
        </div>
      </div>
    </section>
  );
}
