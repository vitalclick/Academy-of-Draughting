'use client';

import { useEffect, useRef, useState, useTransition } from 'react';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import { RANGES, SEGMENTS, type RangeKey, type SegmentKey } from '@/lib/analytics/web';

const REFRESH_MS = 30_000;

export function AnalyticsFilters({
  range,
  segment,
  generatedAt,
}: {
  range: RangeKey;
  segment: SegmentKey;
  generatedAt: string;
}) {
  const router = useRouter();
  const pathname = usePathname();
  const params = useSearchParams();
  const [, startTransition] = useTransition();
  const [live, setLive] = useState(true);
  const [ago, setAgo] = useState(0);
  const timer = useRef<ReturnType<typeof setInterval> | null>(null);

  function setParam(key: string, value: string) {
    const next = new URLSearchParams(params.toString());
    next.set(key, value);
    startTransition(() => router.push(`${pathname}?${next.toString()}`, { scroll: false }));
  }

  // "updated Ns ago" ticker, reset whenever fresh data arrives
  useEffect(() => {
    setAgo(0);
    const t = setInterval(() => setAgo((a) => a + 1), 1000);
    return () => clearInterval(t);
  }, [generatedAt]);

  // live auto-refresh
  useEffect(() => {
    if (!live) {
      if (timer.current) clearInterval(timer.current);
      return;
    }
    timer.current = setInterval(() => router.refresh(), REFRESH_MS);
    return () => {
      if (timer.current) clearInterval(timer.current);
    };
  }, [live, router]);

  return (
    <div className="an-filters">
      <div className="an-range">
        {RANGES.map((r) => (
          <button
            key={r.key}
            type="button"
            className={`an-range-btn ${range === r.key ? 'is-active' : ''}`}
            onClick={() => setParam('range', r.key)}
          >
            {r.key}
          </button>
        ))}
      </div>

      <select
        className="an-segment"
        value={segment}
        onChange={(e) => setParam('segment', e.target.value)}
        aria-label="User segment"
      >
        {SEGMENTS.map((s) => (
          <option key={s.key} value={s.key}>{s.label}</option>
        ))}
      </select>

      <button
        type="button"
        className={`an-live ${live ? 'is-on' : ''}`}
        onClick={() => setLive((v) => !v)}
        title={live ? 'Live — auto-refreshing every 30s' : 'Paused'}
      >
        <span className="an-live-dot" />
        {live ? `Live · ${ago}s ago` : 'Paused'}
      </button>
    </div>
  );
}
