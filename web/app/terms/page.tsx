export const metadata = { title: "Terms of Use — Academy of Advanced Draughting" };

const LAST_UPDATED = "2026-05-23";

export default function TermsPage() {
  return (
    <section className="bg-paper">
      <div className="container-page max-w-3xl py-16">
        <span className="eyebrow">LEGAL</span>
        <h1 className="mt-3 text-4xl font-medium tracking-tight">Terms of Use</h1>
        <p className="mt-2 text-sm text-ink-3">Last updated: {LAST_UPDATED}</p>

        <Section title="1. Acceptance">
          <p>
            By creating an account, applying, or using the student portal, you
            agree to these Terms and our{" "}
            <a className="text-electric-700 underline" href="/privacy">
              Privacy Policy
            </a>
            .
          </p>
        </Section>

        <Section title="2. Eligibility">
          <p>
            You must be 18 or older to create an account, or be 16+ with consent
            from a parent or guardian. The Academy reserves the right to refuse
            admission for any lawful reason.
          </p>
        </Section>

        <Section title="3. Accounts">
          <p>
            You are responsible for keeping your sign-in credentials secure. Do
            not share your account. Notify us immediately if you suspect
            unauthorized use.
          </p>
        </Section>

        <Section title="4. Coursework &amp; intellectual property">
          <p>
            You retain ownership of the work you submit. You grant the Academy a
            non-exclusive licence to display, store, and review your submissions
            for grading and accreditation purposes.
          </p>
          <p>
            Course materials, modules, assignments, and recordings supplied by
            the Academy are owned by the Academy or its licensors and may not be
            redistributed without written permission.
          </p>
        </Section>

        <Section title="5. AI tutor (AIDA)">
          <p>
            AIDA is an assistant, not a teacher. Its responses can be wrong or
            outdated. Do not use it to bypass your own learning. The Academy is
            not liable for academic outcomes that rely solely on AIDA output.
          </p>
        </Section>

        <Section title="6. Acceptable use">
          <ul>
            <li>No uploading of malware, unlawful content, or material that infringes others&rsquo; rights.</li>
            <li>No probing or attempting to bypass our access controls.</li>
            <li>No automated scraping beyond reasonable use.</li>
            <li>No impersonation of other students or staff.</li>
          </ul>
          <p>Violations may result in account suspension and, where applicable, referral to the relevant authorities.</p>
        </Section>

        <Section title="7. Fees, refunds &amp; withdrawals">
          <p>
            Fees, payment terms, and refund policies are course-specific and
            communicated at acceptance. By accepting an offer of admission, you
            agree to the relevant fee schedule. Withdrawal terms are governed by
            the schedule in force at the time of withdrawal.
          </p>
        </Section>

        <Section title="8. Service availability">
          <p>
            We aim for high availability but do not guarantee uninterrupted
            access. Planned maintenance windows will be announced in advance
            where possible. Status of dependent services is reported at the
            <a href="/api/health" className="text-electric-700 underline">{" "}status endpoint</a>.
          </p>
        </Section>

        <Section title="9. Limitation of liability">
          <p>
            To the extent permitted by law, the Academy&rsquo;s liability for any
            claim arising out of these Terms is limited to the fees paid by you
            to the Academy in the 12 months preceding the claim.
          </p>
        </Section>

        <Section title="10. Governing law">
          <p>
            These Terms are governed by the laws of the Republic of South
            Africa. Any dispute will be subject to the jurisdiction of the
            South African courts.
          </p>
        </Section>

        <Section title="11. Contact">
          <p>
            Questions? Email{" "}
            <a className="text-electric-700 underline" href="mailto:info@aod.ac.za">
              info@aod.ac.za
            </a>
            .
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
