import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/components/chrome/page-shell';

export const metadata: Metadata = {
  title: 'Deposit received — your seat is secured',
  description: 'Thank you — your enrolment deposit has been received.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/funding/deposit/success' },
};

export default function DepositSuccessPage() {
  return (
    <PageShell active="funding" headerTone="light">
      <section className="section section-paper">
        <div className="page" style={{ maxWidth: 680 }}>
          <div className="apply-card" style={{ padding: 40 }}>
            <span className="pill pill-blue">
              <span className="dot" />
              SEAT SECURED
            </span>
            <h1 className="t-h2" style={{ marginTop: 16, marginBottom: 12 }}>
              Thank you — your deposit is in.
            </h1>
            <p className="t-body-lg" style={{ marginBottom: 20 }}>
              Your place in the next intake is now reserved. A receipt is on its way to your email,
              and admissions will be in touch within one business day to finalise your enrolment.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/apply" className="btn btn-primary">
                Complete your application →
              </Link>
              <Link href="/courses" className="btn btn-ghost-light">
                Browse programmes
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
