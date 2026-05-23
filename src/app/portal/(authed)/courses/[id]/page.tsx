import Link from 'next/link';
import { notFound } from 'next/navigation';
import { currentStudent } from '@/lib/auth/student';
import { listAssignmentsForEnrollment } from '@/lib/db/portal';
import { COURSES } from '@/data/courses';

export const dynamic = 'force-dynamic';

export default async function PortalCoursePage({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  const { id } = await params;
  const session = await currentStudent();
  if (!session) return null;
  const enrollment = session.enrollments.find((e) => e.id === id);
  if (!enrollment) notFound();

  const programme = COURSES.find((c) => c.id === enrollment.programme);
  const items = await listAssignmentsForEnrollment(enrollment);

  return (
    <div>
      <div className="admin-header">
        <Link href="/portal" className="t-mono-xs admin-link">
          ← DASHBOARD
        </Link>
        <h1 className="t-h2" style={{ margin: '6px 0 4px' }}>
          {programme?.title ?? enrollment.programme}
        </h1>
        <div className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>
          {enrollment.cohort.toUpperCase()} · {enrollment.state.toUpperCase()}
        </div>
      </div>

      {items.length === 0 ? (
        <p className="admin-empty">
          No assignments published yet. The first ones land at the start of the cohort.
        </p>
      ) : (
        <table className="admin-table">
          <thead>
            <tr>
              <th>Assignment</th>
              <th>Module</th>
              <th>Kind</th>
              <th>Due</th>
              <th>State</th>
              <th>Grade</th>
            </tr>
          </thead>
          <tbody>
            {items.map((a) => (
              <tr key={a.id}>
                <td>
                  <Link
                    href={`/portal/courses/${enrollment.id}/assignments/${a.id}`}
                    className="admin-link"
                  >
                    {a.title}
                  </Link>
                </td>
                <td>{a.module}</td>
                <td>{a.kind}</td>
                <td className="t-mono-xs">
                  {a.due_at ? new Date(a.due_at).toLocaleString('en-ZA') : '—'}
                </td>
                <td>
                  <span className={`status-pill status-${a.submission?.state ?? 'draft'}`}>
                    {a.submission?.state ?? 'not started'}
                  </span>
                </td>
                <td className="t-mono-sm">{a.submission?.grade ?? '—'}</td>
              </tr>
            ))}
          </tbody>
        </table>
      )}
    </div>
  );
}
