import type { Metadata } from 'next';
import { PageShell } from '@/components/chrome/page-shell';
import { FinalCTA } from '@/components/ui/final-cta';
import { BreadcrumbJsonLd } from '@/seo/json-ld';
import { ApplyForm } from '@/sections/apply/apply-form';

export const metadata: Metadata = {
  title: 'Apply — 2026 intake',
  description:
    'Six minutes to apply. Smart form with OCR document parsing, autofill, and a decision in under one business day. JHB · DBN · Online.',
  alternates: { canonical: '/apply' },
};

export default function ApplyPage() {
  return (
    <PageShell active="apply" headerTone="light">
      <BreadcrumbJsonLd
        items={[
          { name: 'Home', href: '/' },
          { name: 'Apply', href: '/apply' },
        ]}
      />
      <section className="page-header" data-screen-label="01 Apply Header">
        <div className="page ph-inner">
          <div>
            <div className="ph-eyebrow">
              <span className="pill pill-blue-dark">
                <span className="dot" />
                ENROLLMENT · 2026 INTAKE
              </span>
              <span className="t-mono-xs" style={{ color: 'var(--ink-on-dark-3)' }}>
                APPLICATIONS OPEN · DEC INTAKE CLOSING 12 NOV
              </span>
            </div>
            <h1 className="ph-title">
              Six minutes. <em>One application.</em>
            </h1>
            <p className="ph-sub">
              Our streamlined form prefills what you&apos;ve already shared. Document parsing
              handles your matric and ID. You&apos;ll have a decision within one business day.
            </p>
          </div>
          <div className="ph-meta">
            <div className="ph-meta-cell" id="entry">
              <span className="ph-meta-k">ENTRY</span>
              <span className="ph-meta-v">G11+</span>
              <span className="ph-meta-foot">Bridging available</span>
            </div>
            <div className="ph-meta-cell">
              <span className="ph-meta-k">DECISION</span>
              <span className="ph-meta-v">&lt; 24h</span>
              <span className="ph-meta-foot">Business days</span>
            </div>
            <div className="ph-meta-cell" id="funding">
              <span className="ph-meta-k">PAYMENT</span>
              <span className="ph-meta-v">0% int.</span>
              <span className="ph-meta-foot">Or 15% upfront</span>
            </div>
            <div className="ph-meta-cell" id="intake">
              <span className="ph-meta-k">INTAKE</span>
              <span className="ph-meta-v">Jan&apos;26</span>
              <span className="ph-meta-foot">May · Sep also</span>
            </div>
          </div>
        </div>
      </section>

      <ApplyForm />
      <FinalCTA />
    </PageShell>
  );
}
