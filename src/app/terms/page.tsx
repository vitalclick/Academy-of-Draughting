import type { Metadata } from 'next';
import { LegalPage } from '@/components/ui/legal-page';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Terms of Use',
  description: `Terms of use for the ${SITE.name} website and online enrollment system.`,
  alternates: { canonical: '/terms' },
};

export default function TermsPage() {
  return (
    <LegalPage
      active="home"
      eyebrow="TERMS OF USE"
      title="The fine print."
      updated="May 2026"
      intro="These terms govern your use of this website and the online enrollment system. By using either you agree to them."
    >
      <h2>1. Website use</h2>
      <p>
        You may browse this site, submit applications, and contact admissions in good faith. You
        must not attempt to compromise its security, scrape it at scale without permission, or
        misrepresent your identity.
      </p>

      <h2>2. Applications</h2>
      <p>
        Submitting an application does not guarantee admission. We assess each application against
        published entry requirements and intake capacity. Decisions are communicated by email and,
        where you&apos;ve opted in, WhatsApp.
      </p>

      <h2>3. Fees &amp; refunds</h2>
      <p>
        Tuition fees, payment schedules and refund terms are confirmed in your offer letter and the
        enrollment agreement. Nothing on this website constitutes a binding fee schedule.
      </p>

      <h2>4. Intellectual property</h2>
      <p>
        Content on this site, including the design system, code, written content and AI assistant
        responses, is the property of {SITE.name} or used under licence. You may not copy or
        republish it without written permission.
      </p>

      <h2>5. AI assistants</h2>
      <p>
        AIDA, our admissions assistant, is a software aid. It is not a substitute for a formal
        decision from admissions. We may log interactions to improve the experience — see our{' '}
        <a href="/privacy">Privacy Notice</a>.
      </p>

      <h2>6. Limitation of liability</h2>
      <p>
        We work hard to keep the site accurate and available, but provide it &quot;as is&quot;.
        Where the law permits, our liability for loss arising from website use is limited to
        statutory minimums.
      </p>

      <h2>7. Contact</h2>
      <p>
        Questions about these terms: <a href={`mailto:${SITE.email}`}>{SITE.email}</a>.
      </p>
    </LegalPage>
  );
}
