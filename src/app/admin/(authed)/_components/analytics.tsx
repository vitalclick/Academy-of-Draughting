import type { BarDatum, GeoDatum, SeriesPoint } from '@/lib/analytics/web';

export function fmtNum(n: number): string {
  return n.toLocaleString('en-ZA');
}

export function fmtDuration(sec: number): string {
  const m = Math.floor(sec / 60);
  const s = sec % 60;
  return m > 0 ? `${m}m ${s}s` : `${s}s`;
}

export function fmtPct(frac: number): string {
  return `${Math.round(frac * 100)}%`;
}

function MiniSpark({ values }: { values: number[] }) {
  if (values.length < 2) return null;
  const max = Math.max(...values, 1);
  const min = Math.min(...values);
  const span = max - min || 1;
  const d = values
    .map((v, i) => `${i === 0 ? 'M' : 'L'} ${(i / (values.length - 1)) * 200} ${28 - ((v - min) / span) * 24 - 2}`)
    .join(' ');
  return (
    <svg className="spark" viewBox="0 0 200 28" preserveAspectRatio="none" aria-hidden="true">
      <path d={d} fill="none" stroke="var(--blue-500)" strokeWidth="1.5" strokeLinejoin="round" />
      <path d={`${d} L 200 28 L 0 28 Z`} fill="var(--blue-100)" opacity="0.5" />
    </svg>
  );
}

export function MetricCard({
  label,
  value,
  delta,
  meta,
  spark,
}: {
  label: string;
  value: string;
  delta?: number;
  meta?: string;
  spark?: number[];
}) {
  const dir = delta == null ? null : delta >= 0 ? 'up' : 'down';
  return (
    <div className="adm-kpi">
      <div className="adm-kpi-head">
        <span className="adm-kpi-label">{label}</span>
        {dir && <span className={`adm-kpi-pill ${dir}`}>{dir === 'up' ? '↑' : '↓'} {Math.abs(delta!)}%</span>}
      </div>
      <div className="adm-kpi-value">{value}</div>
      <div className="adm-kpi-meta">{meta ?? 'vs previous period'}</div>
      {spark && spark.length > 1 && (
        <div className="adm-kpi-spark">
          <MiniSpark values={spark} />
        </div>
      )}
    </div>
  );
}

export function TrafficChart({ series }: { series: SeriesPoint[] }) {
  const W = 760;
  const H = 200;
  const pad = { t: 12, r: 8, b: 22, l: 8 };
  const max = Math.max(...series.map((p) => p.pageViews), 1);
  const n = series.length;
  const x = (i: number) => pad.l + (i / Math.max(1, n - 1)) * (W - pad.l - pad.r);
  const y = (v: number) => pad.t + (1 - v / max) * (H - pad.t - pad.b);

  const line = (key: 'pageViews' | 'visitors') =>
    series.map((p, i) => `${i === 0 ? 'M' : 'L'} ${x(i).toFixed(1)} ${y(p[key]).toFixed(1)}`).join(' ');

  const pvPath = line('pageViews');
  const area = `${pvPath} L ${x(n - 1).toFixed(1)} ${H - pad.b} L ${x(0).toFixed(1)} ${H - pad.b} Z`;

  // a handful of x-axis labels
  const ticks = n <= 8 ? series.map((_, i) => i) : [0, Math.floor(n / 4), Math.floor(n / 2), Math.floor((3 * n) / 4), n - 1];

  return (
    <div className="an-chart">
      <svg viewBox={`0 0 ${W} ${H}`} preserveAspectRatio="none" role="img" aria-label="Traffic over time">
        {[0.25, 0.5, 0.75].map((g) => (
          <line key={g} x1={pad.l} x2={W - pad.r} y1={pad.t + g * (H - pad.t - pad.b)} y2={pad.t + g * (H - pad.t - pad.b)} className="an-grid" />
        ))}
        <path d={area} className="an-area" />
        <path d={pvPath} className="an-line pv" />
        <path d={line('visitors')} className="an-line vis" />
      </svg>
      <div className="an-xaxis">
        {ticks.map((i) => (
          <span key={i} style={{ left: `${(i / Math.max(1, n - 1)) * 100}%` }}>{series[i]?.label}</span>
        ))}
      </div>
      <div className="an-legend">
        <span><i className="dot pv" /> Page views</span>
        <span><i className="dot vis" /> Visitors</span>
      </div>
    </div>
  );
}

export function BarList({ items, unit }: { items: BarDatum[]; unit?: string }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  if (items.length === 0) return <p className="an-empty">No data in range.</p>;
  return (
    <div className="an-bars">
      {items.map((it) => (
        <div key={it.label} className="an-bar-row">
          <span className="an-bar-label" title={it.label}>{it.label}</span>
          <span className="an-bar-track"><i style={{ width: `${(it.value / max) * 100}%` }} /></span>
          <span className="an-bar-val">
            {fmtNum(it.value)}
            <span className="an-bar-pct">{Math.round((it.value / total) * 100)}%</span>
          </span>
        </div>
      ))}
      {unit && <div className="an-bar-unit">{unit}</div>}
    </div>
  );
}

export function GeoList({ items }: { items: GeoDatum[] }) {
  const max = Math.max(...items.map((i) => i.value), 1);
  const total = items.reduce((s, i) => s + i.value, 0) || 1;
  if (items.length === 0) return <p className="an-empty">No geographic data in range.</p>;
  return (
    <div className="an-bars">
      {items.map((it) => (
        <div key={it.code} className="an-bar-row">
          <span className="an-bar-label">
            <span style={{ marginRight: 8 }}>{it.flag}</span>
            {it.name}
          </span>
          <span className="an-bar-track"><i style={{ width: `${(it.value / max) * 100}%` }} /></span>
          <span className="an-bar-val">
            {fmtNum(it.value)}
            <span className="an-bar-pct">{Math.round((it.value / total) * 100)}%</span>
          </span>
        </div>
      ))}
    </div>
  );
}

const DEVICE_LABELS: Record<string, string> = { mobile: 'Mobile', desktop: 'Desktop', tablet: 'Tablet' };

export function DeviceDonut({ items }: { items: BarDatum[] }) {
  const total = items.reduce((s, i) => s + i.value, 0);
  if (total === 0) return <p className="an-empty">No device data in range.</p>;
  const colors: Record<string, string> = { mobile: 'var(--blue-500)', desktop: 'var(--cyan-500)', tablet: 'var(--blue-300)' };
  const C = 2 * Math.PI * 42;
  let offset = 0;
  return (
    <div className="an-donut-wrap">
      <svg viewBox="0 0 110 110" className="an-donut" role="img" aria-label="Device breakdown">
        <circle cx="55" cy="55" r="42" className="an-donut-bg" />
        {items.map((it) => {
          const frac = it.value / total;
          const seg = (
            <circle
              key={it.label}
              cx="55"
              cy="55"
              r="42"
              fill="none"
              stroke={colors[it.label] ?? 'var(--ink-4)'}
              strokeWidth="14"
              strokeDasharray={`${frac * C} ${C}`}
              strokeDashoffset={-offset * C}
              transform="rotate(-90 55 55)"
            />
          );
          offset += frac;
          return seg;
        })}
      </svg>
      <div className="an-donut-legend">
        {items.map((it) => (
          <div key={it.label} className="an-donut-leg-row">
            <span className="dot" style={{ background: colors[it.label] ?? 'var(--ink-4)' }} />
            <span className="lbl">{DEVICE_LABELS[it.label] ?? it.label}</span>
            <span className="val">{Math.round((it.value / total) * 100)}%</span>
          </div>
        ))}
      </div>
    </div>
  );
}
