import type { Metadata } from 'next';
import { PageShell } from '@/components/chrome/page-shell';
import { FinalCTA } from '@/components/ui/final-cta';
import { AccreditationStrip } from '@/components/ui/accreditation-strip';
import { FundingCalculator } from '@/sections/funding/funding-calculator';
import { BreadcrumbJsonLd, FaqJsonLd } from '@/seo/json-ld';

export const metadata: Metadata = {
  title: 'Fees & Funding — Calculator, Payment Plans, NSFAS & SETA',
  description:
    'Work out exactly what your draughting course costs in Rand. Monthly payment plans at 0% interest, upfront discounts, NSFAS/bursary screening, SETA learnerships — and secure your seat online.',
  alternates: { canonical: '/funding' },
};

const FAQS = [
  {
    q: 'How do the monthly payment plans work?',
    a: 'You secure your seat with a deposit, then pay the balance in equal monthly instalments over the programme at 0% interest. There are no hidden fees — the calculator shows your exact monthly amount.',
  },
  {
    q: 'Can I get NSFAS or a bursary?',
    a: 'Households under R350,000 a year often qualify for funding support. Use the calculator to flag your interest and admissions will check your eligibility before you commit.',
  },
  {
    q: 'What is SETA / learnership funding?',
    a: 'SETAs such as MERSETA fund learnerships through discretionary grants. Qualifying employers and learners can have fees substantially or fully covered. Speak to admissions about current learnership intakes.',
  },
  {
    q: 'Is the online deposit refundable?',
    a: 'The deposit secures your place and is credited in full toward your course fees. Refund terms are set out in the terms of enrolment.',
  },
  {
    q: 'Can my employer be invoiced directly?',
    a: 'Yes. Choose the employer-funded route and we issue a pro-forma and a tax invoice directly to your company.',
  },
];

export default function FundingPage() {
  return (
    <PageShell active="funding" headerTone="light">
      <FaqJsonLd items={FAQS} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', href: '/' },
          { name: 'Fees & Funding', href: '/funding' },
        ]}
      />

      <FundingCalculator />
      <AccreditationStrip />

      <section id="faq" className="section section-paper" data-screen-label="Funding · FAQ">
        <div className="page">
          <div className="sec-head">
            <div className="sec-head-meta">
              <span className="section-label">
                <span className="bar" />
                FUNDING / FAQ
              </span>
              <h2 className="sec-head-title">Funding questions, answered.</h2>
            </div>
            <p className="sec-head-sub">
              Everything on fees, plans, and funding. Still unsure? WhatsApp admissions — they reply
              in about a minute.
            </p>
          </div>
          <div className="course-faqs">
            {FAQS.map((f) => (
              <details key={f.q} className="course-faq">
                <summary>{f.q}</summary>
                <p>{f.a}</p>
              </details>
            ))}
          </div>
        </div>
      </section>

      <FinalCTA />
    </PageShell>
  );
}
