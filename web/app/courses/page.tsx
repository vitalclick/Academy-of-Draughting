import Link from "next/link";
import { courses } from "@/data/courses";

export const metadata = { title: "Courses — Academy of Advanced Draughting" };

export default function CoursesPage() {
  return (
    <section className="bg-white">
      <div className="container-page py-20">
        <span className="eyebrow">COURSES</span>
        <h1 className="mt-4 max-w-3xl text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
          Programmes built around <span className="italic font-normal text-electric-600">how engineering offices work.</span>
        </h1>
        <div className="mt-12 grid gap-4 lg:grid-cols-2">
          {courses.map((c) => (
            <article id={c.slug} key={c.slug} className="rounded-lg border border-paper-3 bg-white p-8">
              <div className="flex items-baseline justify-between">
                <span className="mono text-ink-3">{c.code}</span>
                {c.recommended && (
                  <span className="rounded-full bg-electric-100 px-2 py-0.5 text-[10px] font-mono text-electric-700">★ MOST POPULAR</span>
                )}
              </div>
              <h2 className="mt-3 text-2xl font-medium">{c.title}</h2>
              <p className="mt-3 text-ink-3">{c.description}</p>
              <dl className="mt-6 grid grid-cols-3 gap-4 border-t border-paper-2 pt-4 text-sm">
                <div><dt className="mono text-ink-4">Duration</dt><dd className="mt-1">{c.duration}</dd></div>
                <div><dt className="mono text-ink-4">Mode</dt><dd className="mt-1">{c.mode}</dd></div>
                <div><dt className="mono text-ink-4">Software</dt><dd className="mt-1">{c.software.join(" · ")}</dd></div>
              </dl>
              <Link href={`/apply?course=${c.slug}`} className="btn-primary mt-6">Apply for {c.code} →</Link>
            </article>
          ))}
        </div>
      </div>
    </section>
  );
}
