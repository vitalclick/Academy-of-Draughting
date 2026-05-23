import Link from "next/link";
import { courses } from "@/data/courses";

export function CoursesSnapshot() {
  return (
    <section className="bg-white">
      <div className="container-page py-24">
        <div className="grid gap-8 lg:grid-cols-[1fr_2fr]">
          <div>
            <span className="eyebrow">SECTION 03 / COURSES</span>
            <h2 className="mt-5 text-3xl font-medium leading-tight sm:text-4xl">
              Pick the pathway that fits <span className="italic font-normal text-electric-600">where you are.</span>
            </h2>
            <p className="mt-5 max-w-md text-ink-3">
              The outcomes — drawing office discipline, industry-standard CAD,
              real engineering vocabulary — stay the same across every mode.
            </p>
            <Link href="/courses" className="btn-ghost mt-6">All courses →</Link>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            {courses.map((c) => (
              <article key={c.slug} className="relative rounded-lg border border-paper-3 bg-white p-6 transition hover:border-ink-3">
                {c.recommended && (
                  <span className="absolute right-4 top-4 rounded-full bg-electric-100 px-2 py-0.5 text-[10px] font-mono text-electric-700">
                    ★ MOST POPULAR
                  </span>
                )}
                <span className="mono text-ink-3">{c.code}</span>
                <h3 className="mt-2 text-lg font-medium">{c.title}</h3>
                <p className="mt-2 text-sm text-ink-3">{c.description}</p>
                <dl className="mt-4 grid grid-cols-2 gap-3 border-t border-paper-2 pt-4 text-[12px]">
                  <Meta k="Duration" v={c.duration} />
                  <Meta k="Mode" v={c.mode} />
                  <Meta k="Software" v={c.software.join(" · ")} />
                </dl>
                <div className="mt-4 flex gap-2">
                  <Link href={`/courses#${c.slug}`} className="btn-ghost">View details</Link>
                  <Link href={`/apply?course=${c.slug}`} className="btn-primary">Apply →</Link>
                </div>
              </article>
            ))}
          </div>
        </div>
      </div>
    </section>
  );
}

function Meta({ k, v }: { k: string; v: string }) {
  return (
    <div>
      <dt className="mono text-ink-4">{k}</dt>
      <dd className="mt-1 text-ink-2">{v}</dd>
    </div>
  );
}
