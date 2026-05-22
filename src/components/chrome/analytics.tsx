'use client';

import Script from 'next/script';
import { useEffect, useState } from 'react';

const STORAGE_KEY = 'aoad_cookie_consent_v1';

function readConsent(): 'all' | 'essential' | null {
  try {
    const raw = localStorage.getItem(STORAGE_KEY);
    if (!raw) return null;
    const parsed = JSON.parse(raw) as { choice?: 'all' | 'essential' };
    return parsed.choice ?? null;
  } catch {
    return null;
  }
}

export function Analytics({ gaId, pixelId }: { gaId?: string; pixelId?: string }) {
  const [consent, setConsent] = useState<'all' | 'essential' | null>(null);

  useEffect(() => {
    setConsent(readConsent());
    const handler = () => setConsent(readConsent());
    window.addEventListener('storage', handler);
    window.addEventListener('aoad:consent-change', handler);
    return () => {
      window.removeEventListener('storage', handler);
      window.removeEventListener('aoad:consent-change', handler);
    };
  }, []);

  if (consent !== 'all') return null;

  return (
    <>
      {gaId && (
        <>
          <Script src={`https://www.googletagmanager.com/gtag/js?id=${gaId}`} strategy="afterInteractive" />
          <Script id="ga-init" strategy="afterInteractive">{`
            window.dataLayer = window.dataLayer || [];
            function gtag(){dataLayer.push(arguments);}
            window.gtag = gtag;
            gtag('js', new Date());
            gtag('config', '${gaId}', { anonymize_ip: true });
          `}</Script>
        </>
      )}
      {pixelId && (
        <Script id="fb-pixel" strategy="afterInteractive">{`
          !function(f,b,e,v,n,t,s){if(f.fbq)return;n=f.fbq=function(){n.callMethod?
          n.callMethod.apply(n,arguments):n.queue.push(arguments)};if(!f._fbq)f._fbq=n;
          n.push=n;n.loaded=!0;n.version='2.0';n.queue=[];t=b.createElement(e);t.async=!0;
          t.src=v;s=b.getElementsByTagName(e)[0];s.parentNode.insertBefore(t,s)}(window,
          document,'script','https://connect.facebook.net/en_US/fbevents.js');
          fbq('init', '${pixelId}'); fbq('track', 'PageView');
        `}</Script>
      )}
    </>
  );
}
