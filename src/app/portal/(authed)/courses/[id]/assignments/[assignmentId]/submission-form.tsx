'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { saveSubmissionAction } from './actions';
import type { SubmissionRow } from '@/types/database';

export function SubmissionForm({
  enrollmentId,
  assignmentId,
  existing,
}: {
  enrollmentId: string;
  assignmentId: string;
  existing: SubmissionRow | null;
}) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [comment, setComment] = useState(existing?.comment ?? '');
  const [error, setError] = useState<string | null>(null);
  const [message, setMessage] = useState<string | null>(null);
  const submitted = existing?.state === 'submitted';

  function save(state: 'draft' | 'submitted') {
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const res = await saveSubmissionAction({
        enrollmentId,
        assignmentId,
        comment,
        state,
      });
      if (!res.ok) {
        setError(res.error);
        return;
      }
      setMessage(
        state === 'submitted'
          ? 'Submitted — your instructor will review.'
          : 'Draft saved.'
      );
      router.refresh();
    });
  }

  return (
    <div className="content-editor-block">
      <div className="t-mono-xs" style={{ color: 'var(--ink-4)', marginBottom: 8 }}>
        STATE ·{' '}
        <span className={`status-pill status-${existing?.state ?? 'draft'}`}>
          {existing?.state ?? 'not started'}
        </span>
      </div>
      <label className="t-mono-xs" htmlFor="sub-comment">
        COMMENT TO INSTRUCTOR
      </label>
      <textarea
        id="sub-comment"
        rows={6}
        value={comment}
        onChange={(e) => setComment(e.target.value)}
        placeholder="Describe your approach, link a file, ask a question…"
        disabled={submitted || pending}
      />
      <p className="t-mono-xs" style={{ color: 'var(--ink-4)', marginTop: 8 }}>
        File-upload submissions land in Phase 7.1. For now, paste links to your work (Google Drive,
        Autodesk Construction Cloud, etc.) in the comment.
      </p>
      <div style={{ display: 'flex', gap: 8, marginTop: 12 }}>
        <button
          type="button"
          className="btn btn-ghost-light"
          onClick={() => save('draft')}
          disabled={pending || submitted}
        >
          {pending ? 'Saving…' : 'Save draft'}
        </button>
        <button
          type="button"
          className="btn btn-primary"
          onClick={() => save('submitted')}
          disabled={pending || submitted || !comment.trim()}
        >
          {submitted ? 'Submitted' : 'Submit'}
        </button>
      </div>
      {message && (
        <div className="apply-banner apply-banner-success" role="status" style={{ marginTop: 12 }}>
          {message}
        </div>
      )}
      {error && (
        <div className="apply-banner apply-banner-error" role="alert" style={{ marginTop: 12 }}>
          {error}
        </div>
      )}
    </div>
  );
}
