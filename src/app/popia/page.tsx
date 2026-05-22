import type { Metadata } from 'next';
import { LegalPage } from '@/components/ui/legal-page';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'POPIA Statement',
  description: `Protection of Personal Information Act (POPIA) statement for ${SITE.name}.`,
  alternates: { canonical: '/popia' },
};

export default function PopiaPage() {
  return (
    <LegalPage
      active="home"
      eyebrow="POPIA"
      title="Protection of Personal Information Act."
      updated="May 2026"
      intro="We process personal information in line with the Protection of Personal Information Act, 2013 (Act 4 of 2013). This statement summarises how POPIA applies to your interaction with the Academy."
    >
      <h2>1. Lawful basis</h2>
      <p>
        We process your personal information either with your consent, to perform a contract you
        have with us (your enrollment), or to comply with a legal obligation.
      </p>

      <h2>2. Information Officer</h2>
      <p>
        The Information Officer for {SITE.name} can be contacted at{' '}
        <a href={`mailto:${SITE.email}`}>{SITE.email}</a> for any access or correction requests
        under POPIA.
      </p>

      <h2>3. Your rights under POPIA</h2>
      <ul>
        <li>To know what personal information we hold about you.</li>
        <li>To request that it is corrected or deleted where appropriate.</li>
        <li>To object to processing for direct marketing.</li>
        <li>To complain to the Information Regulator (South Africa).</li>
      </ul>

      <h2>4. Special personal information</h2>
      <p>
        We do not collect special personal information (e.g. health, biometrics, criminal history)
        unless it is specifically required to assess a bursary or accommodation request and you
        have provided express consent.
      </p>

      <h2>5. Cross-border processing</h2>
      <p>
        Some of our processors (e.g. email and AI providers) may operate outside South Africa.
        Where this happens, we ensure adequate protection is in place per POPIA Section 72.
      </p>

      <h2>6. Information Regulator</h2>
      <p>
        Complaints can be lodged with the Information Regulator (South Africa) at{' '}
        <a href="https://inforegulator.org.za">inforegulator.org.za</a>.
      </p>
    </LegalPage>
  );
}
