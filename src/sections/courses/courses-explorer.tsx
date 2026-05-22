'use client';

import Link from 'next/link';
import { useMemo, useState } from 'react';
import { COURSES, FILTERS, type Course } from '@/data/courses';
import { CourseVisSvg } from './course-vis';

function FilterGroup<T extends string>({
  label,
  value,
  options,
  onChange,
}: {
  label: string;
  value: T;
  options: readonly T[];
  onChange: (v: T) => void;
}) {
  return (
    <div className="filter-group">
      <span className="filter-group-label">{label}</span>
      {options.map((o) => (
        <button
          key={o}
          type="button"
          className={`filter-chip ${value === o ? 'is-active' : ''}`}
          onClick={() => onChange(o)}
        >
          {o}
        </button>
      ))}
    </div>
  );
}

function CourseCard({ c }: { c: Course }) {
  return (
    <article className={`crs-card ${c.featured ? 'crs-card-feature' : ''}`}>
      <div className="crs-card-vis">
        <CourseVisSvg kind={c.vis} />
        <div className="crs-vis-top">
          <span className="crs-vis-code">{c.code}</span>
          <span className="crs-vis-pill">★ {c.fit}% FIT</span>
        </div>
        <div className="crs-vis-tag">
          <em>{c.software.join(' · ')}</em> · {c.duration}
        </div>
      </div>

      <div className="crs-card-body">
        <div>
          <h3 className="crs-title">{c.title}</h3>
          <p className="crs-desc" style={{ marginTop: 8 }}>
            {c.desc}
          </p>
        </div>

        <div className="crs-modes">
          {FILTERS.mode.slice(1).map((m) => (
            <span key={m} className={`crs-mode ${c.activeModes.includes(m as Course['activeModes'][number]) ? 'is-on' : ''}`}>
              {m}
            </span>
          ))}
        </div>

        <div className="crs-stats">
          <div className="crs-stat">
            <div className="crs-stat-k">DURATION</div>
            <div className="crs-stat-v">{c.duration}</div>
          </div>
          <div className="crs-stat">
            <div className="crs-stat-k">EXAM</div>
            <div className="crs-stat-v">{c.exam}</div>
          </div>
          <div className="crs-stat">
            <div className="crs-stat-k">ENTRY</div>
            <div className="crs-stat-v">{c.entry}</div>
          </div>
          <div className="crs-stat">
            <div className="crs-stat-k">INTAKE</div>
            <div className="crs-stat-v">{c.intake}</div>
          </div>
        </div>

        <details>
          <summary className="crs-expand-summary">
            <span className="chev">›</span> Show modules ({c.modules.length})
          </summary>
          <div className="crs-modules">
            {c.modules.map((m, i) => (
              <div key={m} className="crs-module">
                <span className="ix">{String(i + 1).padStart(2, '0')}</span>
                <span>{m}</span>
              </div>
            ))}
          </div>
        </details>

        <div className="crs-foot">
          <span className="t-mono-sm" style={{ color: 'var(--ink-4)' }}>
            <span style={{ color: 'var(--cyan-500)' }}>●</span> Open enrollment
          </span>
          <div style={{ display: 'flex', gap: 8 }}>
            <Link href={`/courses/${c.id}`} className="btn btn-sm btn-ghost-light">
              Details
            </Link>
            <Link href="/apply" className="btn btn-sm btn-primary">
              Apply{' '}
              <span className="arr" aria-hidden="true">
                →
              </span>
            </Link>
          </div>
        </div>
      </div>
    </article>
  );
}

type ModeFilter = (typeof FILTERS.mode)[number];
type LevelFilter = (typeof FILTERS.level)[number];
type SoftFilter = (typeof FILTERS.software)[number];

export function CoursesExplorer() {
  const [mode, setMode] = useState<ModeFilter>('All modes');
  const [level, setLevel] = useState<LevelFilter>('All levels');
  const [software, setSoftware] = useState<SoftFilter>('All software');
  const [query, setQuery] = useState('');

  const filtered = useMemo(() => {
    return COURSES.filter((c) => {
      if (mode !== 'All modes' && !c.activeModes.includes(mode as Course['activeModes'][number])) return false;
      if (software !== 'All software' && !c.software.includes(software)) return false;
      if (level !== 'All levels' && c.level !== level) return false;
      if (query.trim()) {
        const q = query.toLowerCase();
        if (
          !c.title.toLowerCase().includes(q) &&
          !c.desc.toLowerCase().includes(q) &&
          !c.software.join(' ').toLowerCase().includes(q)
        )
          return false;
      }
      return true;
    });
  }, [mode, level, software, query]);

  return (
    <>
      <div className="filter-bar">
        <div className="page filter-row">
          <FilterGroup label="MODE" value={mode} options={FILTERS.mode} onChange={setMode} />
          <FilterGroup label="LEVEL" value={level} options={FILTERS.level} onChange={setLevel} />
          <FilterGroup
            label="SOFTWARE"
            value={software}
            options={FILTERS.software}
            onChange={setSoftware}
          />
          <div className="filter-search">
            <svg width="14" height="14" viewBox="0 0 24 24" fill="none" aria-hidden="true">
              <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
              <path d="M21 21l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
            </svg>
            <input
              type="text"
              placeholder="Search 6 programmes…"
              value={query}
              onChange={(e) => setQuery(e.target.value)}
              aria-label="Search courses"
            />
            <kbd>⌘K</kbd>
          </div>
        </div>
      </div>

      <section className="section section-paper" data-screen-label="02 Courses Grid">
        <div className="page">
          <div
            style={{
              display: 'flex',
              justifyContent: 'space-between',
              alignItems: 'baseline',
              marginBottom: 24,
            }}
          >
            <span className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>
              SHOWING {filtered.length} OF {COURSES.length} PROGRAMMES
            </span>
            <span className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>
              SORTED BY · FIT
            </span>
          </div>
          {filtered.length === 0 && (
            <div
              style={{
                padding: 48,
                textAlign: 'center',
                background: 'var(--white)',
                border: '1px dashed var(--line-on-light)',
                borderRadius: 12,
              }}
            >
              <p className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>
                NO PROGRAMMES MATCH
              </p>
              <p className="t-body" style={{ marginTop: 8 }}>
                Try a different combination, or{' '}
                <Link href="/contact" style={{ color: 'var(--blue-500)', textDecoration: 'underline' }}>
                  chat with admissions
                </Link>
                .
              </p>
            </div>
          )}
          <div className="courses-grid">
            {filtered.map((c) => (
              <CourseCard key={c.id} c={c} />
            ))}
          </div>
        </div>
      </section>
    </>
  );
}
