'use client';

import { useEffect, useRef } from 'react';
import { usePathname } from 'next/navigation';
import { track } from '@/lib/analytics/events';

/**
 * Records a `page_view` event into our own events pipeline on every route
 * change, so the admin analytics dashboard has first-party traffic data.
 * Admin and portal routes are excluded — internal tooling isn't site traffic.
 */
export function PageViewTracker() {
  const pathname = usePathname();
  const last = useRef<string | null>(null);

  useEffect(() => {
    if (!pathname) return;
    if (pathname.startsWith('/admin') || pathname.startsWith('/portal')) return;
    if (last.current === pathname) return;
    last.current = pathname;
    track('page_view', { path: pathname, referrer: document.referrer || null });
  }, [pathname]);

  return null;
}
