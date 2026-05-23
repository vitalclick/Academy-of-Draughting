import { ApplyForm } from "@/components/ApplyForm";

export const metadata = { title: "Apply — Academy of Advanced Draughting" };

export default function ApplyPage({
  searchParams,
}: {
  searchParams: { course?: string };
}) {
  return (
    <section className="bg-paper">
      <div className="container-page py-20">
        <div className="grid gap-12 lg:grid-cols-[1fr_1.4fr]">
          <div>
            <span className="eyebrow">ADMISSIONS</span>
            <h1 className="mt-4 text-4xl font-medium leading-tight tracking-tight sm:text-5xl">
              Start your <span className="italic font-normal text-electric-600">application.</span>
            </h1>
            <p className="mt-6 text-ink-3">
              The form auto-saves as you go. AIDA can answer admissions
              questions in the chat panel any time. Most applicants finish in
              under 8 minutes.
            </p>
            <ul className="mt-8 space-y-3 text-sm text-ink-2">
              <li>· Step 1 — Personal details</li>
              <li>· Step 2 — Course & study mode</li>
              <li>· Step 3 — Background & notes</li>
              <li>· Step 4 — Document uploads (optional, can be done later)</li>
            </ul>
          </div>
          <ApplyForm defaultCourse={searchParams.course} />
        </div>
      </div>
    </section>
  );
}
