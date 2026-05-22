type Kind = 'jhb' | 'dbn' | 'online';

function CampusVis({ kind }: { kind: Kind }) {
  return (
    <svg
      viewBox="0 0 400 200"
      width="100%"
      height="100%"
      preserveAspectRatio="xMidYMid slice"
      aria-hidden="true"
      style={{ position: 'absolute', inset: 0 }}
    >
      <rect width="400" height="200" fill="#071B3B" />
      <g opacity="0.18">
        {[0, 1, 2, 3, 4, 5, 6, 7].map((i) => (
          <line key={`v${i}`} x1={i * 50} y1="0" x2={i * 50} y2="200" stroke="white" strokeWidth="0.5" />
        ))}
        {[0, 1, 2, 3, 4].map((i) => (
          <line key={`h${i}`} x1="0" y1={i * 50} x2="400" y2={i * 50} stroke="white" strokeWidth="0.5" />
        ))}
      </g>
      {kind === 'jhb' && (
        <>
          <rect x="80" y="80" width="40" height="100" fill="#11315C" stroke="#5A8CFF" strokeWidth="0.8" />
          <rect x="130" y="50" width="60" height="130" fill="#11315C" stroke="#5A8CFF" strokeWidth="0.8" />
          <rect x="200" y="100" width="40" height="80" fill="#11315C" stroke="#5A8CFF" strokeWidth="0.8" />
          <rect x="250" y="70" width="50" height="110" fill="#11315C" stroke="#5A8CFF" strokeWidth="0.8" />
          {[0, 1, 2, 3].flatMap((r) =>
            [0, 1].map((c) => (
              <rect
                key={`${r}${c}`}
                x={138 + c * 16}
                y={62 + r * 22}
                width="8"
                height="6"
                fill="#3DD9D6"
                opacity={0.4 + r * 0.1}
              />
            ))
          )}
          <text
            x="200"
            y="194"
            fontFamily="Geist Mono, monospace"
            fontSize="9"
            fill="#6FE6E2"
            textAnchor="middle"
            letterSpacing="0.15em"
          >
            JHB · 26°S
          </text>
        </>
      )}
      {kind === 'dbn' && (
        <>
          <path
            d="M0 130 Q 100 110 200 130 T 400 130 L 400 200 L 0 200 Z"
            fill="#11315C"
            stroke="#5A8CFF"
            strokeWidth="0.8"
          />
          <path d="M0 130 Q 100 110 200 130 T 400 130" fill="none" stroke="#3DD9D6" strokeWidth="1" />
          <circle cx="320" cy="60" r="22" fill="none" stroke="#6FE6E2" strokeWidth="1" />
          <circle cx="320" cy="60" r="10" fill="#6FE6E2" opacity="0.3" />
          <text
            x="200"
            y="194"
            fontFamily="Geist Mono, monospace"
            fontSize="9"
            fill="#6FE6E2"
            textAnchor="middle"
            letterSpacing="0.15em"
          >
            DBN · 29.8°S
          </text>
        </>
      )}
      {kind === 'online' && (
        <>
          {[
            [80, 60],
            [200, 40],
            [320, 80],
            [120, 120],
            [280, 140],
            [200, 100],
            [60, 140],
            [340, 60],
          ].map(([x, y]) => (
            <g key={`${x}-${y}`}>
              <circle cx={x} cy={y} r="4" fill="#5A8CFF" />
              <circle cx={x} cy={y} r="9" fill="none" stroke="#5A8CFF" strokeWidth="0.5" opacity="0.5" />
            </g>
          ))}
          <line x1="80" y1="60" x2="200" y2="100" stroke="#5A8CFF" strokeWidth="0.5" />
          <line x1="200" y1="100" x2="320" y2="80" stroke="#5A8CFF" strokeWidth="0.5" />
          <line x1="200" y1="100" x2="120" y2="120" stroke="#5A8CFF" strokeWidth="0.5" />
          <line x1="200" y1="100" x2="280" y2="140" stroke="#5A8CFF" strokeWidth="0.5" />
          <line x1="200" y1="100" x2="200" y2="40" stroke="#3DD9D6" strokeWidth="0.8" />
          <line x1="200" y1="100" x2="60" y2="140" stroke="#5A8CFF" strokeWidth="0.5" />
          <line x1="200" y1="100" x2="340" y2="60" stroke="#5A8CFF" strokeWidth="0.5" />
          <text
            x="200"
            y="194"
            fontFamily="Geist Mono, monospace"
            fontSize="9"
            fill="#6FE6E2"
            textAnchor="middle"
            letterSpacing="0.15em"
          >
            ZA · NATIONWIDE
          </text>
        </>
      )}
    </svg>
  );
}

function CampusCard({
  loc,
  name,
  desc,
  list,
  kind,
  anchor,
}: {
  loc: string;
  name: string;
  desc: string;
  list: string[];
  kind: Kind;
  anchor: string;
}) {
  return (
    <article className="campus-card" id={anchor}>
      <div
        className="campus-img img-placeholder dark"
        style={{
          borderRadius: 0,
          border: 0,
          borderBottom: '1px solid var(--line-on-light-2)',
        }}
      >
        <CampusVis kind={kind} />
      </div>
      <div className="campus-meta">
        <span className="campus-loc">{loc}</span>
        <h3 className="campus-name">{name}</h3>
        <p>{desc}</p>
        <div className="campus-list">
          {list.map((l) => (
            <div key={l}>{l}</div>
          ))}
        </div>
      </div>
    </article>
  );
}

export function CampusesSection() {
  return (
    <section className="section section-light" data-screen-label="04 Campuses">
      <div className="page">
        <div className="sec-head">
          <div className="sec-head-meta">
            <span className="section-label">
              <span className="bar" />
              SECTION 04 / CAMPUSES
            </span>
            <h2 className="sec-head-title">
              Two campuses.{' '}
              <em style={{ color: 'var(--blue-500)', fontStyle: 'italic', fontWeight: 400 }}>
                One nationwide programme.
              </em>
            </h2>
          </div>
          <p className="sec-head-sub">
            Same curriculum, same instructors, same software stack. Pick the campus that fits — or
            go online from anywhere in South Africa.
          </p>
        </div>

        <div className="campus-grid">
          <CampusCard
            loc="GAUTENG · 26.20°S"
            name="Johannesburg"
            anchor="jhb"
            desc="Flagship campus. Full drawing office facilities, plotter room, model shop, library."
            list={['100 seats · capped intakes', 'Mon–Sat operations', 'Walk-ins for consults']}
            kind="jhb"
          />
          <CampusCard
            loc="KZN · 29.86°S"
            name="Durban"
            anchor="dbn"
            desc="KZN campus, opened 2004. Identical programme delivery, smaller cohort cap."
            list={['60 seats · capped intakes', 'Mon–Fri + Sat AM', 'Coastal industrial focus']}
            kind="dbn"
          />
          <CampusCard
            loc="ZA · NATIONWIDE"
            name="Online · Distance"
            anchor="online"
            desc="Full programme available nationwide. Live and recorded sessions, drawing reviews via desk share."
            list={['Self-paced · 8 mo avg', 'Live cohort sessions weekly', 'Same examination standards']}
            kind="online"
          />
        </div>
      </div>
    </section>
  );
}
