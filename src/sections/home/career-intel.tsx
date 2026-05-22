'use client';

import { useMemo, useState } from 'react';

const PATHS = [
  { name: 'Architectural Draughtsperson', sub: 'Revit · ArchiCAD', score: 96 },
  { name: 'Mechanical Draughtsperson', sub: 'Inventor · SolidWorks', score: 88 },
  { name: 'Structural / Steel Detailer', sub: 'Tekla · AutoCAD', score: 81 },
  { name: 'BIM Coordinator', sub: 'Revit · Navisworks', score: 76 },
  { name: 'Civil Draughtsperson', sub: 'AutoCAD Civil 3D', score: 72 },
  { name: 'CAD Technician', sub: 'AutoCAD', score: 65 },
];

function DashChart({ seed = 0 }: { seed?: number }) {
  const w = 720;
  const h = 180;

  const pts = useMemo(() => {
    const out: number[] = [];
    let v = 38 + seed * 5;
    for (let i = 0; i < 24; i++) {
      v += Math.sin((i + seed) * 0.7) * 4 + (((i + seed) % 3) - 1) * 1.5;
      v = Math.max(20, Math.min(58, v));
      out.push(v);
    }
    return out;
  }, [seed]);

  const pts2 = useMemo(
    () => pts.map((v, i) => Math.max(8, v - 18 + Math.cos(i + seed) * 6)),
    [pts, seed]
  );

  const toPath = (arr: number[]) =>
    arr
      .map((v, i) => {
        const x = (i / (arr.length - 1)) * (w - 24) + 12;
        const y = h - v * 2.4;
        return `${i === 0 ? 'M' : 'L'} ${x.toFixed(1)} ${y.toFixed(1)}`;
      })
      .join(' ');

  const toArea = (arr: number[]) => `${toPath(arr)} L ${w - 12} ${h} L 12 ${h} Z`;

  return (
    <svg viewBox={`0 0 ${w} ${h}`} width="100%" height={h} aria-hidden="true" style={{ display: 'block' }}>
      {[0, 1, 2, 3, 4].map((i) => (
        <line
          key={i}
          x1="12"
          x2={w - 12}
          y1={(h * i) / 4}
          y2={(h * i) / 4}
          stroke="rgba(255,255,255,0.05)"
          strokeWidth="0.5"
        />
      ))}
      <path d={toArea(pts)} fill="rgba(61,217,214,0.1)" />
      <path d={toPath(pts)} fill="none" stroke="var(--cyan-400)" strokeWidth="1.5" strokeLinejoin="round" />
      <path d={toPath(pts2)} fill="none" stroke="var(--blue-400)" strokeWidth="1.5" strokeDasharray="3 3" />
      <text x="2" y="14" fontFamily="Geist Mono, monospace" fontSize="9" fill="rgba(255,255,255,0.4)">
        35K
      </text>
      <text x="2" y={h - 4} fontFamily="Geist Mono, monospace" fontSize="9" fill="rgba(255,255,255,0.4)">
        15K
      </text>
      <text x="12" y={h - 2} fontFamily="Geist Mono, monospace" fontSize="9" fill="rgba(255,255,255,0.4)">
        Q3 &apos;24
      </text>
      <text x={w - 38} y={h - 2} fontFamily="Geist Mono, monospace" fontSize="9" fill="rgba(255,255,255,0.4)">
        Q2 &apos;26
      </text>
    </svg>
  );
}

export function CareerIntelSection() {
  const [active, setActive] = useState(0);

  return (
    <section className="section section-darker" data-screen-label="04 Career Intel">
      <div className="page">
        <div className="sec-head">
          <div className="sec-head-meta">
            <span className="section-label">
              <span className="bar" />
              SECTION 04 / INDUSTRY OUTLOOK
            </span>
            <h2 className="sec-head-title">
              A view of the engineering economy.{' '}
              <em style={{ color: 'var(--cyan-400)', fontStyle: 'italic', fontWeight: 400 }}>
                So you decide with data.
              </em>
            </h2>
          </div>
          <p className="sec-head-sub">
            We don&apos;t quote you yesterday&apos;s salaries. Our Industry Outlook tracks median
            pay, regional demand and software requirements across South African engineering and
            design offices — updated quarterly.
          </p>
        </div>

        <div className="dash-wrap">
          <div className="dash-head">
            <div className="dash-tabs">
              <button className="dash-tab is-active" type="button">
                Career paths
              </button>
              <button className="dash-tab" type="button">
                Software demand
              </button>
              <button className="dash-tab" type="button">
                Regional hiring
              </button>
              <button className="dash-tab" type="button">
                Industry sectors
              </button>
            </div>
            <span className="t-mono-xs" style={{ color: 'var(--ink-on-dark-3)' }}>
              UPDATED 14 MAY 2026 · Q2
            </span>
          </div>

          <div className="dash-body">
            <div className="dash-side">
              <h4 className="dash-side-h">Match Strength · Top 6</h4>
              {PATHS.map((p, i) => (
                <button
                  key={p.name}
                  type="button"
                  className={`dash-row ${active === i ? 'is-active' : ''}`}
                  onClick={() => setActive(i)}
                >
                  <div>
                    <div className="dash-row-title">{p.name}</div>
                    <div className="dash-row-sub">{p.sub}</div>
                  </div>
                  <div className="dash-row-bar">
                    <i
                      style={{
                        width: `${p.score}%`,
                        background: active === i ? 'var(--cyan-400)' : 'var(--blue-400)',
                      }}
                    />
                  </div>
                </button>
              ))}
            </div>

            <div className="dash-main">
              <div className="dash-kpis">
                <div className="dash-kpi">
                  <span className="dash-kpi-label">Median Salary · GP</span>
                  <span className="dash-kpi-value">R28,400</span>
                  <span className="dash-kpi-delta">↑ 4.2% QoQ</span>
                </div>
                <div className="dash-kpi">
                  <span className="dash-kpi-label">Open roles · 90d</span>
                  <span className="dash-kpi-value">1,284</span>
                  <span className="dash-kpi-delta">↑ 11.0% QoQ</span>
                </div>
                <div className="dash-kpi">
                  <span className="dash-kpi-label">Time-to-Hire</span>
                  <span className="dash-kpi-value">42d</span>
                  <span className="dash-kpi-delta neg">↑ 3 days</span>
                </div>
              </div>

              <div className="dash-chart">
                <div className="dash-chart-head">
                  <span className="dash-chart-title">
                    {PATHS[active].name} · Salary band &amp; demand · 24 mo
                  </span>
                  <div className="dash-chart-legend">
                    <span>
                      <i style={{ background: 'var(--cyan-400)' }} />
                      SALARY
                    </span>
                    <span>
                      <i style={{ background: 'var(--blue-400)' }} />
                      OPEN ROLES
                    </span>
                  </div>
                </div>
                <DashChart seed={active} />
              </div>

              <div className="dash-insight">
                <span className="dash-insight-mark">i</span>
                <div className="dash-insight-body">
                  <span className="dik">Faculty note</span>
                  For{' '}
                  <strong style={{ color: 'var(--cyan-400)' }}>{PATHS[active].name}</strong>, the
                  MDDOP N4/N5 + a Revit short course covers 87% of current listings. The bottleneck
                  for first-time hires is portfolio depth — not credentials.
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
