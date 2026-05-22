import type { Course } from '@/data/courses';

function CrsPlan() {
  return (
    <svg
      className="crs-vis-svg"
      viewBox="0 0 600 220"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
    >
      <rect x="40" y="50" width="220" height="120" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" fill="none" />
      <rect x="260" y="50" width="140" height="60" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" fill="none" />
      <rect x="260" y="110" width="140" height="60" stroke="rgba(255,255,255,0.6)" strokeWidth="1.5" fill="none" />
      <rect x="400" y="50" width="160" height="120" stroke="rgba(45,111,247,0.8)" strokeWidth="1.5" fill="rgba(45,111,247,0.06)" />
      <line x1="120" y1="50" x2="120" y2="170" stroke="rgba(255,255,255,0.3)" strokeWidth="1" strokeDasharray="3 3" />
      <line x1="40" y1="190" x2="560" y2="190" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
      <line x1="40" y1="185" x2="40" y2="195" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
      <line x1="560" y1="185" x2="560" y2="195" stroke="rgba(255,255,255,0.5)" strokeWidth="0.8" />
      <text x="300" y="206" fontFamily="Geist Mono, monospace" fontSize="9" fill="rgba(255,255,255,0.5)" textAnchor="middle" letterSpacing="0.1em">
        12 800.00
      </text>
    </svg>
  );
}

function CrsCompass() {
  return (
    <svg className="crs-vis-svg" viewBox="0 0 600 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <circle cx="300" cy="120" r="76" stroke="rgba(255,255,255,0.4)" strokeWidth="1" fill="none" />
      <circle cx="300" cy="120" r="60" stroke="rgba(255,255,255,0.3)" strokeWidth="1" fill="none" />
      <line x1="300" y1="44" x2="300" y2="196" stroke="rgba(255,255,255,0.5)" />
      <line x1="224" y1="120" x2="376" y2="120" stroke="rgba(255,255,255,0.5)" />
      <line x1="300" y1="44" x2="244" y2="178" stroke="rgba(45,111,247,0.8)" strokeWidth="1.5" />
      <line x1="300" y1="44" x2="356" y2="178" stroke="rgba(61,217,214,0.8)" strokeWidth="1.5" />
      <circle cx="300" cy="44" r="3" fill="rgba(45,111,247,1)" />
    </svg>
  );
}

function CrsOrtho() {
  return (
    <svg className="crs-vis-svg" viewBox="0 0 600 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <rect x="60" y="40" width="120" height="80" stroke="rgba(255,255,255,0.55)" fill="none" strokeWidth="1.2" />
      <rect x="240" y="40" width="120" height="80" stroke="rgba(255,255,255,0.55)" fill="none" strokeWidth="1.2" />
      <rect x="60" y="140" width="120" height="60" stroke="rgba(45,111,247,0.85)" fill="rgba(45,111,247,0.05)" strokeWidth="1.2" />
      <line x1="100" y1="40" x2="100" y2="120" stroke="rgba(255,255,255,0.3)" strokeDasharray="3 3" />
      <line x1="280" y1="40" x2="280" y2="120" stroke="rgba(255,255,255,0.3)" strokeDasharray="3 3" />
      <line x1="60" y1="130" x2="180" y2="130" stroke="rgba(255,255,255,0.3)" strokeDasharray="2 4" />
      <line x1="180" y1="80" x2="240" y2="80" stroke="rgba(255,255,255,0.3)" strokeDasharray="2 4" />
      <text x="62" y="34" fontFamily="Geist Mono, monospace" fontSize="9" fill="rgba(255,255,255,0.5)" letterSpacing="0.08em">FRONT</text>
      <text x="242" y="34" fontFamily="Geist Mono, monospace" fontSize="9" fill="rgba(255,255,255,0.5)" letterSpacing="0.08em">SIDE</text>
      <text x="62" y="134" fontFamily="Geist Mono, monospace" fontSize="9" fill="rgba(61,217,214,0.8)" letterSpacing="0.08em">TOP</text>
    </svg>
  );
}

function CrsIso() {
  return (
    <svg className="crs-vis-svg" viewBox="0 0 600 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g transform="translate(220,40)">
        <path d="M0 80 L80 40 L160 80 L80 120 Z" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" fill="none" />
        <path d="M0 80 L0 140 L80 180 L80 120" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" fill="none" />
        <path d="M80 180 L160 140 L160 80" stroke="rgba(45,111,247,0.85)" strokeWidth="1.2" fill="rgba(45,111,247,0.06)" />
        <path d="M80 120 L80 180" stroke="rgba(255,255,255,0.3)" strokeDasharray="3 3" />
        <path d="M0 80 L80 20 L160 80" stroke="rgba(61,217,214,0.8)" strokeWidth="1" fill="none" />
        <path d="M80 20 L80 40" stroke="rgba(255,255,255,0.3)" strokeDasharray="3 3" />
      </g>
    </svg>
  );
}

function CrsPart() {
  return (
    <svg className="crs-vis-svg" viewBox="0 0 600 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      <g transform="translate(300,120)">
        <circle r="58" stroke="rgba(255,255,255,0.55)" strokeWidth="1.2" fill="none" />
        <circle r="42" stroke="rgba(255,255,255,0.35)" strokeWidth="1" fill="none" />
        <circle r="16" stroke="rgba(45,111,247,0.85)" strokeWidth="1.2" fill="rgba(45,111,247,0.08)" />
        <line x1="-58" y1="0" x2="58" y2="0" stroke="rgba(255,255,255,0.25)" strokeDasharray="3 3" />
        <line x1="0" y1="-58" x2="0" y2="58" stroke="rgba(255,255,255,0.25)" strokeDasharray="3 3" />
        {[0, 45, 90, 135, 180, 225, 270, 315].map((d) => (
          <line
            key={d}
            x1="0"
            y1="-58"
            x2="0"
            y2="-68"
            stroke="rgba(255,255,255,0.6)"
            strokeWidth="1.2"
            transform={`rotate(${d})`}
          />
        ))}
      </g>
    </svg>
  );
}

function CrsContour() {
  return (
    <svg className="crs-vis-svg" viewBox="0 0 600 220" preserveAspectRatio="xMidYMid slice" aria-hidden="true">
      {[40, 60, 80, 100, 120, 140].map((r, i) => (
        <ellipse
          key={r}
          cx="300"
          cy="120"
          rx={r * 2.2}
          ry={r * 0.9}
          stroke={`rgba(${i === 2 ? '45,111,247' : '255,255,255'},${0.2 + i * 0.06})`}
          strokeWidth="0.8"
          fill="none"
        />
      ))}
      <text x="40" y="120" fontFamily="Geist Mono, monospace" fontSize="9" fill="rgba(255,255,255,0.5)">
        142
      </text>
      <text x="540" y="120" fontFamily="Geist Mono, monospace" fontSize="9" fill="rgba(255,255,255,0.5)">
        142
      </text>
    </svg>
  );
}

export function CourseVisSvg({ kind }: { kind: Course['vis'] }) {
  switch (kind) {
    case 'plan':
      return <CrsPlan />;
    case 'compass':
      return <CrsCompass />;
    case 'orthographic':
      return <CrsOrtho />;
    case 'isometric':
      return <CrsIso />;
    case 'part':
      return <CrsPart />;
    case 'contour':
      return <CrsContour />;
  }
}
