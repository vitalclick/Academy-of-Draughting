import type { ReactNode } from 'react';
import { PageShell } from '@/components/chrome/page-shell';
import type { NavKey } from '@/lib/site';

export function LegalPage({
  active,
  eyebrow,
  title,
  intro,
  updated,
  children,
}: {
  active: NavKey;
  eyebrow: string;
  title: string;
  intro: string;
  updated: string;
  children: ReactNode;
}) {
  return (
    <PageShell active={active} headerTone="light">
      <section className="page-header" style={{ paddingBottom: 48 }}>
        <div className="page ph-inner" style={{ gridTemplateColumns: '1fr' }}>
          <div>
            <div className="ph-eyebrow">
              <span className="pill pill-blue-dark">
                <span className="dot" />
                {eyebrow}
              </span>
              <span className="t-mono-xs" style={{ color: 'var(--ink-on-dark-3)' }}>
                LAST UPDATED · {updated.toUpperCase()}
              </span>
            </div>
            <h1 className="ph-title">{title}</h1>
            <p className="ph-sub">{intro}</p>
          </div>
        </div>
      </section>

      <section className="section section-light">
        <div className="page" style={{ maxWidth: 820 }}>
          <article className="legal-prose">{children}</article>
        </div>
      </section>
    </PageShell>
  );
}
