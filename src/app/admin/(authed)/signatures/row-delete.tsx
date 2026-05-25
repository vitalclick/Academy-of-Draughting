'use client';

import { useTransition } from 'react';
import { deleteSignatureAction } from './actions';

export function DeleteButton({ id, name }: { id: string; name: string }) {
  const [pending, start] = useTransition();
  return (
    <button
      type="button"
      className="admin-link"
      style={{ color: '#8B1F1B', background: 'none', border: 0, padding: 0, cursor: 'pointer' }}
      disabled={pending}
      onClick={() => {
        if (!confirm(`Delete the signature for ${name}? This cannot be undone.`)) return;
        start(async () => {
          await deleteSignatureAction(id);
          window.location.reload();
        });
      }}
    >
      {pending ? 'Deleting…' : 'Delete'}
    </button>
  );
}
