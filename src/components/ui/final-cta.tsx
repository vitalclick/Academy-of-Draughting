import Link from 'next/link';

export function FinalCTA() {
  return (
    <section className="cta-band" data-screen-label="Apply CTA">
      <div className="page cta-inner">
        <div>
          <span className="section-label" style={{ marginBottom: 18 }}>
            <span className="bar" />
            NEXT INTAKE OPEN · GRADE 11+
          </span>
          <h2 className="cta-title">
            Stop researching.{' '}
            <em style={{ color: 'var(--cyan-400)', fontStyle: 'italic', fontWeight: 400 }}>
              Start drawing.
            </em>
          </h2>
          <p className="cta-sub">
            Six minutes to apply. AIDA prefills what we already know. You&apos;ll hear back within
            one business day.
          </p>
          <div className="cta-actions">
            <Link href="/apply" className="btn btn-lg btn-primary">
              Start application{' '}
              <span className="arr" aria-hidden="true">
                →
              </span>
            </Link>
            <Link href="/about" className="btn btn-lg btn-ghost-dark">
              Visit a campus
            </Link>
          </div>
        </div>

        <div className="cta-right">
          <div className="cta-fact">
            <span className="cta-fact-k">PROCESSING TIME</span>
            <span className="cta-fact-v">&lt; 1 business day to decision</span>
          </div>
          <div className="cta-fact">
            <span className="cta-fact-k">PAYMENT</span>
            <span className="cta-fact-v">0% interest plans · 15% upfront discount</span>
          </div>
          <div className="cta-fact">
            <span className="cta-fact-k">GUIDANCE</span>
            <span className="cta-fact-v">WhatsApp admissions · JHB + DBN</span>
          </div>
        </div>
      </div>
    </section>
  );
}
