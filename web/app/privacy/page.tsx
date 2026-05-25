import Link from "next/link";

export const metadata = { title: "Privacy Policy — Academy of Advanced Draughting" };

const LAST_UPDATED = "2026-05-23";

export default function PrivacyPage() {
  return (
    <section className="bg-paper">
      <div className="container-page max-w-3xl py-16">
        <span className="eyebrow">LEGAL</span>
        <h1 className="mt-3 text-4xl font-medium tracking-tight">Privacy Policy</h1>
        <p className="mt-2 text-sm text-ink-3">Last updated: {LAST_UPDATED}</p>

        <Section title="1. Who we are">
          <p>
            The Academy of Advanced Draughting (&ldquo;the Academy&rdquo;, &ldquo;we&rdquo;,
            &ldquo;us&rdquo;) is the responsible party for the personal information
            collected via this website, in terms of the Protection of Personal
            Information Act, 4 of 2013 (POPIA).
          </p>
          <p>
            Information Officer: <a href="mailto:info@aod.ac.za" className="text-electric-700 underline">info@aod.ac.za</a>
          </p>
        </Section>

        <Section title="2. What we collect">
          <ul>
            <li>
              <strong>Application data</strong>: full name, email, phone number, prior
              qualifications, study mode preference, course of interest, and any free-text
              notes you choose to share.
            </li>
            <li>
              <strong>Account data</strong>: email, optional password, profile photo if
              uploaded, role (student / faculty / admin).
            </li>
            <li>
              <strong>Coursework data</strong>: enrollments, submissions (files + notes),
              grades and feedback, AI tutor conversations linked to specific assignments.
            </li>
            <li>
              <strong>Technical data</strong>: IP address (for rate limiting only), browser
              and device type, timestamps. Stored in server logs for up to 30 days.
            </li>
            <li>
              <strong>Cookies</strong>: see &sect; 7 below.
            </li>
          </ul>
        </Section>

        <Section title="3. Why we process it (lawful basis)">
          <ul>
            <li>Application data &mdash; to assess admission. Lawful basis: consent + legitimate interest in operating an educational institution.</li>
            <li>Account &amp; coursework data &mdash; to deliver our service to enrolled students. Lawful basis: performance of contract.</li>
            <li>AI tutor conversations &mdash; to provide academic support. Inputs are sent to Anthropic (US) for the duration of each request; no persistent training use.</li>
            <li>Technical data &mdash; security, abuse prevention, debugging. Lawful basis: legitimate interest.</li>
          </ul>
        </Section>

        <Section title="4. Who we share it with (operators)">
          <p>
            We rely on the following processors. Each operates under a written
            agreement and processes only what they need to deliver the service:
          </p>
          <ul>
            <li><strong>Supabase</strong> (US/EU regions) &mdash; database, authentication, file storage.</li>
            <li><strong>Vercel</strong> (US/EU) &mdash; web hosting.</li>
            <li><strong>Anthropic</strong> (US) &mdash; AI tutor + admissions assistant inference.</li>
            <li><strong>Resend</strong> (US) &mdash; transactional email.</li>
            <li><strong>Upstash</strong> (US/EU) &mdash; rate limiting.</li>
            <li><strong>Mindee</strong> (FR) &mdash; OCR processing of uploaded qualification documents, when applicable.</li>
          </ul>
          <p>
            We never sell personal information. Cross-border transfers rely on the
            standard safeguards permitted under POPIA Section 72.
          </p>
        </Section>

        <Section title="5. How long we keep it">
          <ul>
            <li>Applications: 5 years (regulatory retention for educational records).</li>
            <li>Account &amp; coursework data: for the duration of enrollment and 5 years thereafter.</li>
            <li>AI conversations: 30 days unless attached to a graded submission, in which case kept with the submission.</li>
            <li>Server logs: 30 days.</li>
          </ul>
        </Section>

        <Section title="6. Your rights (POPIA Sections 23–25)">
          <ul>
            <li><strong>Access</strong> &mdash; download everything we hold about you. Sign in and visit your <Link href="/portal" className="text-electric-700 underline">portal &rarr; Your data</Link>.</li>
            <li><strong>Correction</strong> &mdash; update your profile in the portal, or email us.</li>
            <li><strong>Erasure</strong> &mdash; request account deletion from the same Your-data section. Requests are processed within 30 days.</li>
            <li><strong>Object</strong> &mdash; you can object to processing at any time by emailing the Information Officer.</li>
            <li><strong>Complain</strong> &mdash; the Information Regulator: <a className="text-electric-700 underline" href="https://inforegulator.org.za">inforegulator.org.za</a></li>
          </ul>
        </Section>

        <Section title="7. Cookies">
          <p>
            We use one strictly-necessary cookie for authentication (Supabase
            session). We do not currently use marketing, advertising, or
            third-party analytics cookies. If we add analytics, we will request
            consent first via the banner at the bottom of every page.
          </p>
        </Section>

        <Section title="8. Security">
          <p>
            Database access is gated by row-level security policies. Files are
            stored in private buckets accessible only to the uploading student
            and authorized staff. All traffic is encrypted in transit. Service
            credentials are rotated regularly.
          </p>
        </Section>

        <Section title="9. Changes">
          <p>
            Material changes to this policy will be announced at the top of this
            page and, where relevant, by email to active accounts.
          </p>
        </Section>
      </div>
    </section>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="mt-10">
      <h2 className="text-xl font-medium tracking-tight">{title}</h2>
      <div className="prose-aod mt-3 space-y-3 text-[15px] leading-relaxed text-ink-2">
        {children}
      </div>
    </section>
  );
}
