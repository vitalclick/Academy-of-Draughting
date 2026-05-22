'use client';

import { useEffect, useState } from 'react';
import { usePathname } from 'next/navigation';

const STORAGE_KEY = 'aoad_cookie_consent_v1';

const HIDDEN_ROUTES = ['/admin', '/data-rights/confirm'];

export function CookieBanner() {
  const pathname = usePathname();
  const [visible, setVisible] = useState(false);

  useEffect(() => {
    if (HIDDEN_ROUTES.some((p) => pathname?.startsWith(p))) return;
    try {
      if (!localStorage.getItem(STORAGE_KEY)) setVisible(true);
    } catch {
      // ignore — storage disabled
    }
  }, [pathname]);

  if (!visible) return null;

  function decide(choice: 'all' | 'essential') {
    try {
      localStorage.setItem(
        STORAGE_KEY,
        JSON.stringify({ choice, at: new Date().toISOString() })
      );
      window.dispatchEvent(new CustomEvent('aoad:consent-change', { detail: { choice } }));
    } catch {
      // ignore
    }
    setVisible(false);
  }

  return (
    <div
      className="cookie-banner"
      role="dialog"
      aria-label="Cookie consent"
      aria-describedby="cookie-banner-text"
    >
      <p id="cookie-banner-text" className="cookie-banner-text">
        <strong>We respect your privacy.</strong> We use essential cookies for the site to function
        and, with your consent, analytics cookies to improve it. See our{' '}
        <a href="/privacy" style={{ color: 'var(--blue-600)', textDecoration: 'underline' }}>
          Privacy Notice
        </a>{' '}
        and{' '}
        <a href="/popia" style={{ color: 'var(--blue-600)', textDecoration: 'underline' }}>
          POPIA
        </a>{' '}
        statement.
      </p>
      <div className="cookie-banner-actions">
        <button
          type="button"
          className="btn btn-sm btn-ghost-light"
          onClick={() => decide('essential')}
        >
          Essential only
        </button>
        <button
          type="button"
          className="btn btn-sm btn-primary"
          onClick={() => decide('all')}
        >
          Accept all
        </button>
      </div>
    </div>
  );
}
