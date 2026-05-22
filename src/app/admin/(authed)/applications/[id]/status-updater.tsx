'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import type { ApplicationStatus } from '@/types/database';
import { updateStatusAction } from './actions';

const OPTIONS: { value: ApplicationStatus; label: string }[] = [
  { value: 'submitted', label: 'Submitted' },
  { value: 'under_review', label: 'Under review' },
  { value: 'accepted', label: 'Accepted' },
  { value: 'rejected', label: 'Rejected' },
  { value: 'withdrawn', label: 'Withdrawn' },
];

export function StatusUpdater({ id, current }: { id: string; current: ApplicationStatus }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [value, setValue] = useState<ApplicationStatus>(current);
  const [error, setError] = useState<string | null>(null);

  function update(next: ApplicationStatus) {
    setValue(next);
    setError(null);
    startTransition(async () => {
      const res = await updateStatusAction({ id, status: next });
      if (!res.ok) {
        setError(res.error);
        setValue(current);
        return;
      }
      router.refresh();
    });
  }

  return (
    <div className="admin-status-updater">
      <div className="t-mono-xs" style={{ color: 'var(--ink-4)', marginBottom: 8 }}>
        CURRENT · <span className={`status-pill status-${value}`}>{value}</span>
      </div>
      <div className="admin-status-opts">
        {OPTIONS.map((o) => (
          <button
            key={o.value}
            type="button"
            className={`filter-chip ${value === o.value ? 'is-active' : ''}`}
            disabled={pending}
            onClick={() => update(o.value)}
          >
            {o.label}
          </button>
        ))}
      </div>
      {error && (
        <div className="apply-banner apply-banner-error" role="alert" style={{ marginTop: 12 }}>
          {error}
        </div>
      )}
    </div>
  );
}
