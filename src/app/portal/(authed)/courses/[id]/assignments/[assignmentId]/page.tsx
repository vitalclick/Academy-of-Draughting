import Link from 'next/link';
import { notFound } from 'next/navigation';
import { currentStudent } from '@/lib/auth/student';
import { getAssignmentWithSubmission } from '@/lib/db/portal';
import { COURSES } from '@/data/courses';
import { SubmissionForm } from './submission-form';

export const dynamic = 'force-dynamic';

export default async function AssignmentDetailPage({
  params,
}: {
  params: Promise<{ id: string; assignmentId: string }>;
}) {
  const { id, assignmentId } = await params;
  const session = await currentStudent();
  if (!session) return null;
  const enrollment = session.enrollments.find((e) => e.id === id);
  if (!enrollment) notFound();

  const detail = await getAssignmentWithSubmission(assignmentId, enrollment.id);
  if (!detail || detail.programme !== enrollment.programme) notFound();

  const programme = COURSES.find((c) => c.id === enrollment.programme);

  return (
    <div>
      <div className="admin-header">
        <Link href={`/portal/courses/${enrollment.id}`} className="t-mono-xs admin-link">
          ← {programme?.title ?? enrollment.programme}
        </Link>
        <h1 className="t-h2" style={{ margin: '6px 0 4px' }}>
          {detail.title}
        </h1>
        <div className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>
          {detail.module.toUpperCase()} · {detail.kind.toUpperCase()}
          {detail.due_at && ` · DUE ${new Date(detail.due_at).toLocaleString('en-ZA').toUpperCase()}`}
          {detail.weight > 0 && ` · WEIGHT ${detail.weight}%`}
        </div>
      </div>

      <div className="admin-detail-grid">
        <div>
          <h2 className="admin-section-title">Brief</h2>
          {detail.brief ? (
            <div
              className="legal-prose"
              style={{ background: 'var(--white)', padding: 24, borderRadius: 10, border: '1px solid var(--line-on-light-2)' }}
            >
              <p style={{ whiteSpace: 'pre-wrap' }}>{detail.brief}</p>
            </div>
          ) : (
            <p className="admin-empty">No brief uploaded yet.</p>
          )}
        </div>

        <aside>
          <h2 className="admin-section-title">Your submission</h2>
          {detail.submission?.state === 'graded' || detail.submission?.state === 'returned' ? (
            <div className="admin-status-updater">
              <div className="t-mono-xs" style={{ color: 'var(--ink-4)', marginBottom: 8 }}>
                GRADED ·{' '}
                <span className={`status-pill status-${detail.submission.state}`}>
                  {detail.submission.state}
                </span>
              </div>
              {typeof detail.submission.grade === 'number' && (
                <div
                  style={{
                    fontSize: 36,
                    fontWeight: 500,
                    letterSpacing: '-0.02em',
                    margin: '8px 0',
                  }}
                >
                  {detail.submission.grade}
                  <span style={{ fontSize: 18, color: 'var(--ink-3)' }}>/100</span>
                </div>
              )}
              {detail.submission.feedback && (
                <div className="t-body-sm" style={{ marginTop: 8 }}>
                  <strong>Feedback:</strong>
                  <p style={{ whiteSpace: 'pre-wrap', marginTop: 4 }}>{detail.submission.feedback}</p>
                </div>
              )}
            </div>
          ) : (
            <SubmissionForm
              enrollmentId={enrollment.id}
              assignmentId={detail.id}
              existing={detail.submission}
            />
          )}
        </aside>
      </div>
    </div>
  );
}
