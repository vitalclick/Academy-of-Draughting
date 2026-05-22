import type { Metadata } from 'next';
import { LegalPage } from '@/components/ui/legal-page';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Privacy Notice',
  description: `Privacy notice for ${SITE.name} — how we collect, use, store and protect your personal information.`,
  alternates: { canonical: '/privacy' },
};

export default function PrivacyPage() {
  return (
    <LegalPage
      active="home"
      eyebrow="PRIVACY NOTICE"
      title="Your data, handled with care."
      updated="May 2026"
      intro="We collect only the information we need to assess your application and run your studies, and we keep it secure. This notice explains what we collect, why, and what you can ask us to do with it."
    >
      <h2>1. Who we are</h2>
      <p>
        {SITE.name} (&quot;the Academy&quot;) is the data controller for personal information you
        provide on this website. You can reach us at{' '}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or {SITE.phone}.
      </p>

      <h2>2. What we collect</h2>
      <ul>
        <li>Identity and contact details (name, ID number, email, mobile, city).</li>
        <li>Academic records and supporting documents you upload (e.g. matric certificate).</li>
        <li>Application choices (programme, study mode, campus, funding preference).</li>
        <li>Usage data — pages visited, device, approximate location, referral source.</li>
        <li>Communications you send us via chat, WhatsApp, email or phone.</li>
      </ul>

      <h2>3. Why we use it</h2>
      <ul>
        <li>To assess and process your application and offer the right pathway.</li>
        <li>To verify your identity and academic eligibility.</li>
        <li>To communicate with you about your application and intake.</li>
        <li>To improve the site, our admissions process, and the AI assistants that support it.</li>
        <li>To comply with our regulatory obligations.</li>
      </ul>

      <h2>4. How long we keep it</h2>
      <p>
        Uploaded ID and certificate images are retained for no longer than 90 days after a
        decision is made, unless you become a student — in which case academic records are kept for
        the duration of your studies and as required by SAQA and DHET.
      </p>

      <h2>5. Your rights</h2>
      <p>
        You can ask us to confirm what we hold about you, correct it, or delete it. Contact{' '}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a> with the subject line &quot;Data
        request&quot;. We respond within 30 days.
      </p>

      <h2>6. Cookies</h2>
      <p>
        We use essential cookies for site functionality and, with your consent, analytics cookies
        to understand which pages help students find the right programme. You can change your
        choice at any time.
      </p>

      <h2>7. Third parties</h2>
      <p>
        We never sell your data. We use carefully selected processors (hosting, email, analytics,
        AI providers) under contract — each bound to confidentiality and purpose limitation.
      </p>

      <h2>8. Updates</h2>
      <p>
        We may update this notice. The &quot;Last updated&quot; date at the top reflects the most
        recent change.
      </p>
    </LegalPage>
  );
}
