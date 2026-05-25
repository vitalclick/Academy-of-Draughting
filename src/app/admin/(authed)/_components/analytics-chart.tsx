'use client';

import { useRef, useState } from 'react';
import type { SeriesPoint } from '@/lib/analytics/web';

const fmt = (n: number) => n.toLocaleString('en-ZA');

/** Rounds a value up to a "nice" axis number (1/2/5 × 10ⁿ). */
function niceNum(range: number, round: boolean): number {
  if (range <= 0) return 1;
  const exp = Math.floor(Math.log10(range));
  const frac = range / Math.pow(10, exp);
  let nice: number;
  if (round) nice = frac < 1.5 ? 1 : frac < 3 ? 2 : frac < 7 ? 5 : 10;
  else nice = frac <= 1 ? 1 : frac <= 2 ? 2 : frac <= 5 ? 5 : 10;
  return nice * Math.pow(10, exp);
}

const W = 760;
const H = 200;
const PAD_T = 12;
const PAD_B = 4;

export function TrafficChart({ series }: { series: SeriesPoint[] }) {
  const plotRef = useRef<HTMLDivElement>(null);
  const [hover, setHover] = useState<number | null>(null);

  const n = series.length;
  const rawMax = Math.max(...series.map((p) => p.pageViews), 1);
  const step = niceNum(rawMax / 4, true);
  const top = Math.max(step, Math.ceil(rawMax / step) * step);
  const ticks: number[] = [];
  for (let v = 0; v <= top + 1e-9; v += step) ticks.push(Math.round(v));

  const x = (i: number) => (n <= 1 ? 0 : (i / (n - 1)) * W);
  const y = (v: number) => PAD_T + (1 - v / top) * (H - PAD_T - PAD_B);
  const yPct = (v: number) => (y(v) / H) * 100;
  const xPct = (i: number) => (n <= 1 ? 50 : (i / (n - 1)) * 100);

  const line = (key: 'pageViews' | 'visitors') =>
    series.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(p[key]).toFixed(1)}`).join(' ');
  const pvPath = line('pageViews');
  const area = `${pvPath} L ${x(n - 1).toFixed(1)} ${H - PAD_B} L ${x(0).toFixed(1)} ${H - PAD_B} Z`;

  const xTicks =
    n <= 8 ? series.map((_, i) => i) : [0, Math.floor(n / 4), Math.floor(n / 2), Math.floor((3 * n) / 4), n - 1];

  function onMove(e: React.MouseEvent<HTMLDivElement>) {
    const rect = plotRef.current?.getBoundingClientRect();
    if (!rect || rect.width === 0) return;
    const frac = Math.min(1, Math.max(0, (e.clientX - rect.left) / rect.width));
    setHover(Math.round(frac * (n - 1)));
  }

  const hp = hover != null ? series[hover] : null;
  const hoverLeft = hover != null ? xPct(hover) : 0;
  const flip = hoverLeft > 65;

  return (
    <div className="an-chart">
      <div className="an-chart-body">
        <div className="an-yaxis" aria-hidden="true">
          {[...ticks].reverse().map((t) => (
            <span key={t} style={{ top: `${yPct(t)}%` }}>{fmt(t)}</span>
          ))}
        </div>

        <div
          className="an-plot"
          ref={plotRef}
          onMouseMove={onMove}
          onMouseLeave={() => setHover(null)}
        >
          <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Traffic over time">
            {ticks.map((t) => (
              <line key={t} x1={0} x2={W} y1={y(t)} y2={y(t)} className="an-grid" />
            ))}
            <path d={area} className="an-area" />
            <path d={pvPath} className="an-line pv" />
            <path d={line('visitors')} className="an-line vis" />
          </svg>

          {hp && (
            <>
              <span className="an-hover-line" style={{ left: `${hoverLeft}%` }} />
              <span className="an-hover-dot pv" style={{ left: `${hoverLeft}%`, top: `${yPct(hp.pageViews)}%` }} />
              <span className="an-hover-dot vis" style={{ left: `${hoverLeft}%`, top: `${yPct(hp.visitors)}%` }} />
              <div className={`an-tooltip ${flip ? 'flip' : ''}`} style={{ left: `${hoverLeft}%` }}>
                <div className="an-tt-label">{hp.label}</div>
                <div className="an-tt-row"><span className="dot pv" /> Page views<b>{fmt(hp.pageViews)}</b></div>
                <div className="an-tt-row"><span className="dot vis" /> Visitors<b>{fmt(hp.visitors)}</b></div>
              </div>
            </>
          )}
        </div>
      </div>

      <div className="an-xaxis">
        {xTicks.map((i) => (
          <span key={i} style={{ left: `${xPct(i)}%` }}>{series[i]?.label}</span>
        ))}
      </div>
      <div className="an-legend">
        <span><i className="dot pv" /> Page views</span>
        <span><i className="dot vis" /> Visitors</span>
      </div>
    </div>
  );
}
