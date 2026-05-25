import Link from 'next/link';
import { getProgrammeEnrollmentCounts } from '@/lib/db/admin';
import { COURSES } from '@/data/courses';

export default async function ProgrammesPage() {
  const counts = await getProgrammeEnrollmentCounts();
  const totalActive = Object.values(counts).reduce((sum, c) => sum + c.active, 0);

  return (
    <>
      <div className="adm-page-head">
        <div>
          <div className="breadcrumb">
            ACADEMIC<span className="sep">/</span>PROGRAMMES
          </div>
          <h1>Programmes</h1>
          <p>
            {COURSES.length} programmes in the catalog · {totalActive} active enrolment
            {totalActive === 1 ? '' : 's'}.
          </p>
        </div>
      </div>

      <div className="adm-grid-3">
        {COURSES.map((c) => {
          const count = counts[c.id] ?? { active: 0, completed: 0, total: 0 };
          return (
            <div key={c.id} className="prog-card">
              <div className="prog-card-head">
                <div>
                  <div className="prog-card-code">{c.code}</div>
                  <h3>{c.title}</h3>
                </div>
                <span className="status-pill status-active">{c.level}</span>
              </div>
              <div style={{ fontSize: 13, color: 'var(--ink-3)' }}>
                {c.modules.length} modules · {c.activeModes.join(' / ')}
              </div>
              <div className="prog-card-stats">
                <div>
                  <div className="prog-card-stat-k">DURATION</div>
                  <div className="prog-card-stat-v">{c.duration}</div>
                </div>
                <div>
                  <div className="prog-card-stat-k">ACTIVE</div>
                  <div className="prog-card-stat-v">{count.active}</div>
                </div>
                <div>
                  <div className="prog-card-stat-k">COMPLETED</div>
                  <div className="prog-card-stat-v">{count.completed}</div>
                </div>
              </div>
              <div style={{ display: 'flex', gap: 8 }}>
                <Link href={`/courses/${c.id}`} className="btn btn-sm btn-ghost-light" style={{ flex: 1 }}>
                  View public page ↗
                </Link>
              </div>
            </div>
          );
        })}
      </div>
    </>
  );
}
