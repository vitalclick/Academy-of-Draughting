import type { ReactNode } from 'react';

export function Sparkline({ seed = 0 }: { seed?: number }) {
  const pts: number[] = [];
  let v = 20;
  for (let i = 0; i < 18; i++) {
    v += Math.sin((i + seed * 2) * 0.6) * 4 + (((i + seed) % 3) - 1) * 2;
    v = Math.max(8, Math.min(28, v));
    pts.push(v);
  }
  const d = pts.map((p, i) => `${i === 0 ? 'M' : 'L'} ${(i / (pts.length - 1)) * 200} ${28 - p}`).join(' ');
  return (
    <svg className="spark" viewBox="0 0 200 28" preserveAspectRatio="none" aria-hidden="true">
      <path d={d} fill="none" stroke="var(--blue-500)" strokeWidth="1.5" strokeLinejoin="round" />
      <path d={`${d} L 200 28 L 0 28 Z`} fill="var(--blue-100)" opacity="0.5" />
    </svg>
  );
}

export function Kpi({
  label,
  value,
  delta,
  direction,
  sparkSeed,
}: {
  label: string;
  value: ReactNode;
  delta: string;
  direction: 'up' | 'down';
  sparkSeed: number;
}) {
  return (
    <div className="adm-kpi">
      <div className="adm-kpi-head">
        <span className="adm-kpi-label">{label}</span>
        <span className={`adm-kpi-pill ${direction}`}>{direction === 'up' ? '↑' : '↓'}</span>
      </div>
      <div className="adm-kpi-value">{value}</div>
      <div className="adm-kpi-meta">{delta}</div>
      <div className="adm-kpi-spark">
        <Sparkline seed={sparkSeed} />
      </div>
    </div>
  );
}
