import { listStudents, type StudentRow } from '@/lib/db/admin';
import { COURSES } from '@/data/courses';
import { Kpi } from '../_components/viz';

const COURSE_TITLE = new Map(COURSES.map((c) => [c.id, c.title]));

function nameOf(s: StudentRow) {
  const a = s.applicant;
  if (!a) return '—';
  return `${a.first_name ?? ''} ${a.last_name ?? ''}`.trim() || a.email;
}

function initialsOf(name: string) {
  const parts = name.split(/\s+/).filter(Boolean);
  if (parts.length === 0 || name === '—') return '··';
  return (parts[0][0] + (parts[1]?.[0] ?? '')).toUpperCase();
}

function gradeColor(v: number) {
  return v < 50 ? '#C24545' : v < 65 ? '#C97B1A' : 'var(--blue-500)';
}

export default async function StudentsPage() {
  const students = await listStudents({ limit: 200 });

  const active = students.filter((s) => s.enrollment.state === 'active').length;
  const completed = students.filter((s) => s.enrollment.state === 'completed').length;
  const graded = students.filter((s) => s.avg_grade != null);
  const avgGrade = graded.length
    ? Math.round((graded.reduce((sum, s) => sum + (s.avg_grade ?? 0), 0) / graded.length) * 10) / 10
    : null;
  const atRisk = graded.filter((s) => (s.avg_grade ?? 100) < 50).length;

  return (
    <>
      <div className="adm-page-head">
        <div>
          <div className="breadcrumb">
            OPERATIONS<span className="sep">/</span>STUDENTS
          </div>
          <h1>Students</h1>
          <p>Enrolled students across all programmes and cohorts.</p>
        </div>
      </div>

      <div className="adm-kpi-row">
        <Kpi label="Active students" value={active} delta={`${students.length} enrolled total`} direction="up" sparkSeed={5} />
        <Kpi label="Avg. grade" value={avgGrade != null ? `${avgGrade}%` : '—'} delta={`${graded.length} graded`} direction="up" sparkSeed={6} />
        <Kpi label="At-risk" value={atRisk} delta="< 50% average" direction="down" sparkSeed={7} />
        <Kpi label="Completed" value={completed} delta="all cohorts" direction="up" sparkSeed={8} />
      </div>

      <div className="adm-card">
        {students.length === 0 ? (
          <p style={{ padding: 24, color: 'var(--ink-4)', fontSize: 14 }}>
            No students enrolled yet. Students appear here once an accepted applicant is enrolled into a
            cohort.
          </p>
        ) : (
          <div style={{ overflowX: 'auto' }}>
            <table className="adm-table">
              <thead>
                <tr>
                  <th>Student</th>
                  <th>Programme</th>
                  <th>Cohort</th>
                  <th>State</th>
                  <th>Average</th>
                  <th>Submissions</th>
                  <th>Started</th>
                </tr>
              </thead>
              <tbody>
                {students.map((s) => {
                  const name = nameOf(s);
                  return (
                    <tr key={s.enrollment.id}>
                      <td>
                        <div className="cell-name">
                          <span className="av">{initialsOf(name)}</span>
                          <div>
                            <div className="n">{name}</div>
                            <div className="e">{s.applicant?.email}</div>
                          </div>
                        </div>
                      </td>
                      <td>{COURSE_TITLE.get(s.enrollment.programme) ?? s.enrollment.programme}</td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>
                          {s.enrollment.cohort}
                        </span>
                      </td>
                      <td>
                        <span className={`status-pill status-${s.enrollment.state === 'active' ? 'active' : s.enrollment.state === 'completed' ? 'approved' : s.enrollment.state === 'withdrawn' ? 'rejected' : 'pending'}`}>
                          {s.enrollment.state}
                        </span>
                      </td>
                      <td>
                        {s.avg_grade != null ? (
                          <span className="fit-bar">
                            <span className="tr">
                              <i style={{ width: `${s.avg_grade}%`, background: gradeColor(s.avg_grade) }} />
                            </span>
                            <span className="v">{s.avg_grade}%</span>
                          </span>
                        ) : (
                          <span style={{ color: 'var(--ink-4)', fontSize: 12 }}>—</span>
                        )}
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 12, color: 'var(--ink-3)' }}>
                          {s.graded_count}/{s.submitted_count} graded
                        </span>
                      </td>
                      <td>
                        <span style={{ fontFamily: 'var(--font-mono)', fontSize: 11, color: 'var(--ink-4)' }}>
                          {s.enrollment.started_at
                            ? new Date(s.enrollment.started_at).toLocaleDateString('en-ZA')
                            : '—'}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
        {students.length > 0 && (
          <div className="adm-pager">
            <span>SHOWING {students.length} ENROLLMENT{students.length === 1 ? '' : 'S'}</span>
          </div>
        )}
      </div>
    </>
  );
}
