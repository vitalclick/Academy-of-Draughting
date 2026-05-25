import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/components/chrome/page-shell';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Payment cancelled',
  description: 'Your deposit payment was cancelled.',
  robots: { index: false, follow: false },
  alternates: { canonical: '/funding/deposit/cancel' },
};

export default function DepositCancelPage() {
  return (
    <PageShell active="funding" headerTone="light">
      <section className="section section-paper">
        <div className="page" style={{ maxWidth: 680 }}>
          <div className="apply-card" style={{ padding: 40 }}>
            <span className="pill pill-light">PAYMENT CANCELLED</span>
            <h1 className="t-h2" style={{ marginTop: 16, marginBottom: 12 }}>
              No payment was taken.
            </h1>
            <p className="t-body-lg" style={{ marginBottom: 20 }}>
              Your seat isn&apos;t reserved yet — but nothing was charged. You can try again whenever
              you&apos;re ready, or talk to admissions about other funding options.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href="/funding" className="btn btn-primary">
                Back to the calculator →
              </Link>
              <a href={SITE.whatsappJhb} className="btn btn-ghost-light">
                WhatsApp admissions
              </a>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
