import Link from 'next/link';
import { currentStudent } from '@/lib/auth/student';
import { listAssignmentsForEnrollment } from '@/lib/db/portal';
import { COURSES } from '@/data/courses';

export const dynamic = 'force-dynamic';

export default async function PortalDashboard() {
  const session = await currentStudent();
  if (!session) return null;

  const enrollmentsWithCounts = await Promise.all(
    session.enrollments.map(async (e) => {
      const items = await listAssignmentsForEnrollment(e);
      const open = items.filter((i) => !i.submission || i.submission.state === 'draft').length;
      const overdue = items.filter(
        (i) =>
          (!i.submission || i.submission.state === 'draft') &&
          i.due_at &&
          new Date(i.due_at) < new Date()
      ).length;
      const programme = COURSES.find((c) => c.id === e.programme);
      return { enrollment: e, items, open, overdue, programmeTitle: programme?.title ?? e.programme };
    })
  );

  const allAssignments = enrollmentsWithCounts.flatMap((e) =>
    e.items.map((i) => ({ ...i, enrollment: e.enrollment, programmeTitle: e.programmeTitle }))
  );
  const nextDue = allAssignments
    .filter((a) => (!a.submission || a.submission.state === 'draft') && a.due_at)
    .sort((a, b) => new Date(a.due_at!).getTime() - new Date(b.due_at!).getTime())
    .slice(0, 5);

  return (
    <div>
      <div className="admin-header">
        <span className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>
          STUDENT PORTAL · WELCOME
        </span>
        <h1 className="t-h2" style={{ margin: '6px 0 24px' }}>
          Welcome back.
        </h1>
      </div>

      <div className="admin-stats">
        {enrollmentsWithCounts.map((e) => (
          <Link
            key={e.enrollment.id}
            href={`/portal/courses/${e.enrollment.id}`}
            className={`admin-stat ${e.overdue > 0 ? 'admin-stat-blue' : ''}`}
            style={{ textDecoration: 'none', color: 'inherit', display: 'block' }}
          >
            <span className="t-mono-xs">{e.enrollment.cohort.toUpperCase()}</span>
            <div style={{ fontSize: 17, fontWeight: 500, margin: '6px 0' }}>{e.programmeTitle}</div>
            <div className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>
              {e.open} open · {e.overdue} overdue · {e.items.length} total
            </div>
          </Link>
        ))}
      </div>

      <section className="admin-section">
        <div className="admin-section-head">
          <h2>Due soon</h2>
        </div>
        {nextDue.length === 0 ? (
          <p className="admin-empty">Nothing pending — you&apos;re ahead. Or there&apos;s nothing published yet.</p>
        ) : (
          <table className="admin-table">
            <thead>
              <tr>
                <th>Assignment</th>
                <th>Module</th>
                <th>Programme</th>
                <th>Due</th>
                <th>State</th>
              </tr>
            </thead>
            <tbody>
              {nextDue.map((a) => (
                <tr key={a.id}>
                  <td>
                    <Link
                      href={`/portal/courses/${a.enrollment.id}/assignments/${a.id}`}
                      className="admin-link"
                    >
                      {a.title}
                    </Link>
                  </td>
                  <td>{a.module}</td>
                  <td>{a.programmeTitle}</td>
                  <td className="t-mono-xs">
                    {a.due_at ? new Date(a.due_at).toLocaleString('en-ZA') : '—'}
                  </td>
                  <td>
                    <span className={`status-pill status-${a.submission?.state ?? 'draft'}`}>
                      {a.submission?.state ?? 'not started'}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        )}
      </section>
    </div>
  );
}
