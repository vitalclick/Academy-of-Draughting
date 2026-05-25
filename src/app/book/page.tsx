import type { Metadata } from 'next';
import { PageShell } from '@/components/chrome/page-shell';
import { BookingForm } from '@/sections/consultation/booking-form';
import { BreadcrumbJsonLd } from '@/seo/json-ld';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Book a Consultation or Campus Tour',
  description:
    'Book a free, no-obligation consultation or campus tour with admissions — Johannesburg, Durban or online. Talk through your goals, fees and the right draughting pathway.',
  alternates: { canonical: '/book' },
};

export default function BookPage() {
  return (
    <PageShell active="contact" headerTone="light">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', href: '/' },
          { name: 'Book a consultation', href: '/book' },
        ]}
      />
      <section className="section section-paper">
        <div className="page" style={{ maxWidth: 720 }}>
          <span className="section-label">
            <span className="bar" />
            ADMISSIONS · FREE CONSULTATION
          </span>
          <h1 className="t-h2" style={{ marginTop: 14, marginBottom: 8 }}>
            Talk to a human before you commit.
          </h1>
          <p className="t-body-lg" style={{ maxWidth: 600, marginBottom: 24 }}>
            Pick a time and we&apos;ll call or meet you — in Johannesburg, Durban, or online anywhere
            in South Africa. Bring your questions about fees, funding, and which pathway fits your
            goals. WhatsApp {SITE.phone} if you&apos;d rather chat now.
          </p>
          <BookingForm />
        </div>
      </section>
    </PageShell>
  );
}
