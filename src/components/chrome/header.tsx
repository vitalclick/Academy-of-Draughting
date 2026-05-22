'use client';

import Link from 'next/link';
import { useState } from 'react';
import { Logo } from './logo';
import { useAida } from './aida-context';
import { NAV_ITEMS, SITE, type NavKey } from '@/lib/site';
import { ApplyCta } from '@/components/personalization/apply-cta';

export function SiteHeader({
  active = 'home',
  tone = 'dark',
}: {
  active?: NavKey;
  tone?: 'dark' | 'light';
}) {
  const isDark = tone === 'dark';
  const [open, setOpen] = useState(false);
  const aida = useAida();

  return (
    <header className={`site-header ${isDark ? 'sh-dark' : 'sh-light'}`}>
      <div className="util-strip">
        <div className="page util-row">
          <div className="util-left">
            <span className="t-mono-sm util-item">
              <span className="util-glyph" aria-hidden="true">
                ◇
              </span>
              {SITE.email}
            </span>
            <span className="util-item">
              <span className="util-glyph" aria-hidden="true">
                ◇
              </span>
              <span className="t-mono-sm">{SITE.phone}</span>
            </span>
          </div>
          <div className="util-right">
            <span className="util-item util-status">
              <span className="util-pulse" aria-hidden="true" />
              <span className="t-mono-sm">2026 INTAKE · OPEN</span>
            </span>
            <Link href="/apply" className="util-item util-link">
              <span className="t-mono-sm">APPLY ONLINE →</span>
            </Link>
          </div>
        </div>
      </div>

      <div className="page nav-row">
        <Logo tone={isDark ? 'light' : 'dark'} />

        <nav className="nav-main" aria-label="Main">
          {NAV_ITEMS.map((item) => (
            <Link
              key={item.key}
              href={item.href}
              className={`nav-link ${active === item.key ? 'is-active' : ''}`}
            >
              {item.label}
              {active === item.key && <span className="nav-underline" aria-hidden="true" />}
            </Link>
          ))}
        </nav>

        <div className="nav-actions">
          <button
            type="button"
            className="btn btn-sm btn-ghost-light nav-ai-btn"
            onClick={() => aida.setOpen(true)}
          >
            <span>Admissions Chat</span>
          </button>
          <ApplyCta size="sm" className="btn-primary" />
        </div>

        <button
          type="button"
          className="nav-burger"
          aria-label="Toggle menu"
          aria-expanded={open}
          onClick={() => setOpen((v) => !v)}
        >
          <span />
          <span />
          <span />
        </button>
      </div>

      {open && (
        <div className="nav-mobile">
          <div className="page">
            {NAV_ITEMS.map((item) => (
              <Link
                key={item.key}
                href={item.href}
                className={`nm-link ${active === item.key ? 'is-active' : ''}`}
                onClick={() => setOpen(false)}
              >
                <span>{item.label}</span>
                <span aria-hidden="true">→</span>
              </Link>
            ))}
            <div className="nm-actions">
              <button
                type="button"
                className="btn btn-ghost-light"
                onClick={() => {
                  aida.setOpen(true);
                  setOpen(false);
                }}
              >
                Admissions Chat
              </button>
              <Link href="/apply" className="btn btn-primary" onClick={() => setOpen(false)}>
                Apply Now
              </Link>
            </div>
          </div>
        </div>
      )}
    </header>
  );
}
