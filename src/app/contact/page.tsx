import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/components/chrome/page-shell';
import { FinalCTA } from '@/components/ui/final-cta';
import { BreadcrumbJsonLd, FaqJsonLd } from '@/seo/json-ld';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Contact — Johannesburg, Durban, Online',
  description:
    'Get in touch with admissions. WhatsApp, phone, email, and campus visits — Monday to Saturday. Online support nationwide.',
  alternates: { canonical: '/contact' },
};

const FAQS = [
  {
    q: 'Do I need a matric certificate to apply?',
    a: 'For MDDOP N4/N5 you need Grade 11 or higher with mathematics. Without a matric you can start with the Bridging Course and progress to MDDOP from there.',
  },
  {
    q: 'How long does an application take?',
    a: 'About six minutes online. We respond with a decision within one business day.',
  },
  {
    q: 'Can I study online from anywhere in South Africa?',
    a: 'Yes. The full MDDOP programme and all short courses are available online. You join live cohort sessions weekly and complete drawing-office reviews via desk share.',
  },
  {
    q: 'What does it cost?',
    a: 'Funding plans include monthly instalments at 0% interest or a 15% upfront discount. Employer-sponsored invoicing is also supported. Speak to admissions for the current fee schedule.',
  },
  {
    q: 'Are the qualifications recognised?',
    a: 'Yes. MDDOP is examined under the DHET national framework (SAQA 66881) and the Academy is QCTO aligned.',
  },
];

export default function ContactPage() {
  return (
    <PageShell active="contact" headerTone="light">
      <FaqJsonLd items={FAQS} />
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', href: '/' },
          { name: 'Contact', href: '/contact' },
        ]}
      />

      <section className="page-header" data-screen-label="01 Contact">
        <div className="page ph-inner">
          <div>
            <div className="ph-eyebrow">
              <span className="pill pill-blue-dark">
                <span className="dot" />
                ADMISSIONS · ONLINE NOW
              </span>
              <span className="t-mono-xs" style={{ color: 'var(--ink-on-dark-3)' }}>
                AVG REPLY · &lt;1 MIN ON CHAT · &lt;1 BUSINESS DAY ON EMAIL
              </span>
            </div>
            <h1 className="ph-title">
              Talk to admissions. <em>Or to AIDA.</em>
            </h1>
            <p className="ph-sub">
              We answer everything from entry requirements to funding. Pick the channel that suits
              you — WhatsApp is usually quickest.
            </p>
          </div>
          <div className="ph-meta">
            <div className="ph-meta-cell">
              <span className="ph-meta-k">EMAIL</span>
              <span className="ph-meta-v" style={{ fontSize: 18 }}>
                {SITE.email}
              </span>
              <span className="ph-meta-foot">Replies in 1 business day</span>
            </div>
            <div className="ph-meta-cell">
              <span className="ph-meta-k">PHONE</span>
              <span className="ph-meta-v" style={{ fontSize: 18 }}>
                {SITE.phone}
              </span>
              <span className="ph-meta-foot">Mon–Sat 08:00–17:00</span>
            </div>
            <div className="ph-meta-cell">
              <span className="ph-meta-k">JHB CAMPUS</span>
              <span className="ph-meta-v">Walk-ins</span>
              <span className="ph-meta-foot">Mon–Sat</span>
            </div>
            <div className="ph-meta-cell">
              <span className="ph-meta-k">DBN CAMPUS</span>
              <span className="ph-meta-v">By appt.</span>
              <span className="ph-meta-foot">Mon–Fri + Sat AM</span>
            </div>
          </div>
        </div>
      </section>

      <section className="section section-light" data-screen-label="02 Contact options">
        <div className="page">
          <div className="contact-grid">
            <div className="contact-card">
              <span className="t-mono-xs">FASTEST</span>
              <h3>WhatsApp</h3>
              <p>Snap a question to admissions and get a real human reply, usually inside a minute.</p>
              <div style={{ display: 'flex', gap: 8, flexWrap: 'wrap' }}>
                <a href={SITE.whatsappJhb} className="btn btn-sm btn-primary">
                  WhatsApp JHB
                </a>
                <a href={SITE.whatsappDbn} className="btn btn-sm btn-primary">
                  WhatsApp DBN
                </a>
              </div>
            </div>
            <div className="contact-card">
              <span className="t-mono-xs">24/7</span>
              <h3>Admissions Chat (AIDA)</h3>
              <p>
                Our AI admissions assistant matches you to the right pathway, prefills your
                application, and books a call with a human when needed.
              </p>
              <Link href="/apply" className="btn btn-sm btn-ghost-light">
                Start application →
              </Link>
            </div>
            <div className="contact-card">
              <span className="t-mono-xs">FORMAL</span>
              <h3>Email &amp; phone</h3>
              <p>
                Prefer a paper trail? Email <a href={`mailto:${SITE.email}`}>{SITE.email}</a> or
                call <a href={`tel:${SITE.phone.replace(/\s/g, '')}`}>{SITE.phone}</a>.
              </p>
            </div>
          </div>
        </div>
      </section>

      <section id="faq" className="section section-paper" data-screen-label="03 Contact · FAQ">
        <div className="page">
          <div className="sec-head">
            <div className="sec-head-meta">
              <span className="section-label">
                <span className="bar" />
                SECTION 03 / FAQ
              </span>
              <h2 className="sec-head-title">Frequently asked.</h2>
            </div>
            <p className="sec-head-sub">
              The most common admissions questions. Still stuck? Open AIDA or WhatsApp us.
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
