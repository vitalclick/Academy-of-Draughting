'use client';

import { useState } from 'react';

export function DataRightsForm() {
  const [email, setEmail] = useState('');
  const [kind, setKind] = useState<'access' | 'delete'>('access');
  const [reason, setReason] = useState('');
  const [status, setStatus] = useState<'idle' | 'pending' | 'done' | 'error'>('idle');
  const [error, setError] = useState<string | null>(null);

  async function submit(e: React.FormEvent) {
    e.preventDefault();
    setStatus('pending');
    setError(null);
    try {
      const res = await fetch('/api/data-rights', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, kind, reason: reason || undefined }),
      });
      if (!res.ok) throw new Error(`HTTP ${res.status}`);
      setStatus('done');
    } catch (err) {
      setStatus('error');
      setError(err instanceof Error ? err.message : 'Request failed');
    }
  }

  if (status === 'done') {
    return (
      <div className="data-rights-card">
        <span className="t-mono-xs" style={{ color: 'var(--cyan-500)' }}>
          ✓ REQUEST RECEIVED
        </span>
        <h2 className="t-h3" style={{ margin: '8px 0 12px' }}>
          Check your inbox.
        </h2>
        <p className="t-body">
          If we have a record of <strong>{email}</strong>, a confirmation link is on its way. The
          link expires in 48 hours.
        </p>
      </div>
    );
  }

  return (
    <form onSubmit={submit} className="data-rights-card">
      <div className="content-editor-block">
        <label className="t-mono-xs">REQUEST TYPE</label>
        <div className="admin-filter-row">
          <button
            type="button"
            className={`filter-chip ${kind === 'access' ? 'is-active' : ''}`}
            onClick={() => setKind('access')}
          >
            Access — copy of my data
          </button>
          <button
            type="button"
            className={`filter-chip ${kind === 'delete' ? 'is-active' : ''}`}
            onClick={() => setKind('delete')}
          >
            Delete — erase my data
          </button>
        </div>
      </div>

      <div className="content-editor-block">
        <label className="t-mono-xs" htmlFor="dr-email">
          EMAIL ON FILE
        </label>
        <input
          id="dr-email"
          type="email"
          required
          value={email}
          onChange={(e) => setEmail(e.target.value)}
          placeholder="you@email.com"
        />
      </div>

      <div className="content-editor-block">
        <label className="t-mono-xs" htmlFor="dr-reason">
          REASON · OPTIONAL
        </label>
        <textarea
          id="dr-reason"
          rows={4}
          value={reason}
          onChange={(e) => setReason(e.target.value)}
          placeholder="Anything you'd like admissions to know"
        />
      </div>

      <button
        type="submit"
        className="btn btn-primary"
        disabled={status === 'pending' || !email}
      >
        {status === 'pending' ? 'Sending…' : 'Send confirmation link'}
      </button>

      {status === 'error' && error && (
        <div className="apply-banner apply-banner-error" role="alert" style={{ marginTop: 12 }}>
          {error}
        </div>
      )}
    </form>
  );
}
