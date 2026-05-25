import { OUTCOME_STATS, TESTIMONIALS, EMPLOYERS } from '@/data/outcomes';

/**
 * Outcome-based social proof: placement stats, student testimonials, and the
 * employers graduates work for. Outcome transparency is both a qualifier and
 * a differentiator in SA private education.
 */
export function SocialProof() {
  return (
    <section className="section section-light" data-screen-label="Outcomes & proof">
      <div className="page">
        <span className="section-label">
          <span className="bar" />
          OUTCOMES · WHERE OUR GRADUATES GO
        </span>
        <h2 className="t-h2" style={{ marginTop: 12, marginBottom: 22, fontSize: 24 }}>
          Trained for the drawing office, hired by it.
        </h2>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(150px, 1fr))',
            gap: 12,
            marginBottom: 28,
          }}
        >
          {OUTCOME_STATS.map((s) => (
            <div
              key={s.k}
              style={{
                border: '1px solid var(--line-on-light-2)',
                borderRadius: 12,
                padding: 18,
                background: 'var(--white)',
              }}
            >
              <div style={{ fontSize: 26, fontWeight: 600, letterSpacing: '-0.02em' }}>{s.v}</div>
              <div className="t-mono-xs" style={{ color: 'var(--blue-500)', marginTop: 4 }}>{s.k}</div>
              <div className="t-mono-xs" style={{ color: 'var(--ink-4)', marginTop: 4, lineHeight: 1.4 }}>{s.note}</div>
            </div>
          ))}
        </div>

        <div
          style={{
            display: 'grid',
            gridTemplateColumns: 'repeat(auto-fit, minmax(260px, 1fr))',
            gap: 14,
            marginBottom: 28,
          }}
        >
          {TESTIMONIALS.map((t) => (
            <figure
              key={t.name}
              style={{
                border: '1px solid var(--line-on-light-2)',
                borderRadius: 12,
                padding: 22,
                background: 'var(--white)',
                margin: 0,
              }}
            >
              <blockquote style={{ margin: 0, fontSize: 15, lineHeight: 1.6, color: 'var(--ink-2)' }}>
                &ldquo;{t.quote}&rdquo;
              </blockquote>
              <figcaption style={{ marginTop: 14 }}>
                <div style={{ fontWeight: 600, fontSize: 14 }}>{t.name}</div>
                <div className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>{t.role}</div>
              </figcaption>
            </figure>
          ))}
        </div>

        <div className="t-mono-xs" style={{ color: 'var(--ink-4)', marginBottom: 10 }}>
          GRADUATES WORK AT
        </div>
        <div style={{ display: 'flex', flexWrap: 'wrap', gap: 8 }}>
          {EMPLOYERS.map((e) => (
            <span
              key={e}
              className="pill pill-light"
              style={{ fontSize: 12, padding: '6px 12px' }}
            >
              {e}
            </span>
          ))}
        </div>
      </div>
    </section>
  );
}
