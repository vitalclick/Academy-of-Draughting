import Link from 'next/link';
import { ImageSlot } from '@/components/ui/image-slot';
import { HeroHeadline } from './hero-headline';
import { ApplyCta } from '@/components/personalization/apply-cta';

function BlueprintDeco() {
  return (
    <svg
      width="100%"
      height="100%"
      viewBox="0 0 480 600"
      fill="none"
      style={{ position: 'absolute', inset: 0, opacity: 0.42 }}
      aria-hidden="true"
      preserveAspectRatio="xMidYMid slice"
    >
      <defs>
        <pattern id="hatch" patternUnits="userSpaceOnUse" width="6" height="6">
          <line x1="0" y1="6" x2="6" y2="0" stroke="rgba(45,111,247,0.25)" strokeWidth="0.5" />
        </pattern>
      </defs>
      <path d="M40 540 L240 420 L440 540" stroke="rgba(255,255,255,0.18)" strokeWidth="1" strokeDasharray="3 3" />
      <path d="M40 540 L40 320 L240 200 L440 320 L440 540" stroke="rgba(255,255,255,0.22)" strokeWidth="1" />
      <path d="M40 320 L440 320" stroke="rgba(255,255,255,0.12)" strokeWidth="1" />
      <path d="M240 200 L240 420" stroke="rgba(255,255,255,0.12)" strokeWidth="1" strokeDasharray="3 3" />
      <rect x="240" y="200" width="200" height="120" fill="url(#hatch)" />
      <line x1="40" y1="570" x2="440" y2="570" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
      <line x1="40" y1="565" x2="40" y2="575" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
      <line x1="440" y1="565" x2="440" y2="575" stroke="rgba(255,255,255,0.4)" strokeWidth="0.8" />
      <text x="240" y="588" fill="rgba(255,255,255,0.5)" fontSize="10" fontFamily="Geist Mono, monospace" textAnchor="middle" letterSpacing="0.06em">
        400.00
      </text>
      {[[40, 540], [240, 420], [440, 540], [40, 320], [240, 200], [440, 320]].map(([x, y]) => (
        <g key={`${x}-${y}`}>
          <circle cx={x} cy={y} r="3" stroke="rgba(45,111,247,0.7)" strokeWidth="1" fill="none" />
          <line x1={x - 6} y1={y} x2={x + 6} y2={y} stroke="rgba(45,111,247,0.5)" strokeWidth="0.6" />
          <line x1={x} y1={y - 6} x2={x} y2={y + 6} stroke="rgba(45,111,247,0.5)" strokeWidth="0.6" />
        </g>
      ))}
    </svg>
  );
}

export function HomeHero() {
  return (
    <section className="home-hero" data-screen-label="01 Hero">
      <div className="page hero-inner">
        <div className="hero-left">
          <HeroHeadline />

          <div className="hero-ctas">
            <ApplyCta size="lg" className="btn-primary" />
            <Link href="/courses" className="btn btn-lg btn-ghost-dark">
              Explore programmes
            </Link>
            <Link href="/career/quiz" className="btn btn-lg btn-ghost-dark">
              Take the recommender
            </Link>
          </div>

          <div className="hero-meta">
            <div className="hero-meta-cell">
              <div className="hero-meta-value">
                45
                <span style={{ color: 'var(--ink-on-dark-3)', fontSize: '60%', marginLeft: 2 }}>yrs</span>
              </div>
              <span className="hero-meta-label">Specialist Heritage</span>
            </div>
            <div className="hero-meta-cell">
              <div className="hero-meta-value">3</div>
              <span className="hero-meta-label">Study Modes</span>
            </div>
            <div className="hero-meta-cell">
              <div className="hero-meta-value">
                8<span style={{ color: 'var(--ink-on-dark-3)', fontSize: '60%', marginLeft: 2 }}>+</span>
              </div>
              <span className="hero-meta-label">Career Pathways</span>
            </div>
          </div>
        </div>

        <div className="hero-right">
          <div className="hero-blueprint">
            <div className="hero-blueprint-label">
              <span className="swatch" />
              <span>DRAWING OFFICE · JHB CAMPUS</span>
            </div>
            <div className="hero-blueprint-tag">
              <span className="axis-mark" /> A2 · 1:50
            </div>
            <BlueprintDeco />
          </div>

          <div className="hero-photo">
            <ImageSlot
              shape="rounded"
              radius={14}
              placeholder="Drop a real photo of students drafting / a CAD workstation / a finished drawing here"
              dark
              height={240}
            />
            <div className="hero-photo-caption">
              <span className="t-mono-xs">MDDOP N4 · CAD STUDIO · WEEK 14</span>
              <span className="t-body-sm" style={{ marginTop: 4, color: 'var(--ink-on-dark-2)' }}>
                Production-standard drawing office practice — exactly as it runs in industry.
              </span>
            </div>
          </div>
        </div>
      </div>
    </section>
  );
}
