'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { bulkImportAction } from './actions';
import { CSV_COLUMNS, EMPTY_IMPORT } from './options';

function downloadTemplate() {
  const header = CSV_COLUMNS.join(',');
  const example = [
    'jane@example.com',
    'Jane',
    'Doe',
    '+27 82 555 0100',
    'Johannesburg',
    '',
    '2023',
    'mddop',
    'Full-time',
    'Johannesburg',
    'monthly',
    '2026-jan',
    'submitted',
  ].join(',');
  const csv = `${header}\n${example}\n`;
  const blob = new Blob([csv], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const a = document.createElement('a');
  a.href = url;
  a.download = 'applications-import-template.csv';
  document.body.appendChild(a);
  a.click();
  a.remove();
  URL.revokeObjectURL(url);
}

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-sm btn-primary" disabled={pending}>
      {pending ? 'Importing…' : 'Import CSV'}
    </button>
  );
}

export function BulkImport() {
  const [state, formAction] = useFormState(bulkImportAction, EMPTY_IMPORT);

  return (
    <div className="adm-card-body">
      <p style={{ fontSize: 13.5, color: 'var(--ink-3)', margin: '0 0 14px', lineHeight: 1.5 }}>
        Upload a CSV to create many applications at once. Each row creates (or reuses, by email) an
        applicant and adds one application. Download the template for the exact column order and an
        example row.
      </p>

      <div style={{ marginBottom: 14 }}>
        <button type="button" className="btn btn-sm btn-ghost-light" onClick={downloadTemplate}>
          ↓ Download CSV template
        </button>
      </div>

      <form action={formAction}>
        <input
          type="file"
          name="file"
          accept=".csv,text/csv"
          required
          style={{ fontSize: 13, marginBottom: 14, display: 'block' }}
        />
        <Submit />
      </form>

      {state.ran && (
        <div style={{ marginTop: 16 }}>
          <div
            role="status"
            style={{
              padding: '10px 12px',
              borderRadius: 'var(--r-sm)',
              background: state.created > 0 ? 'rgba(54,179,126,0.10)' : 'var(--paper-2)',
              color: state.created > 0 ? '#1F6E47' : 'var(--ink-2)',
              fontSize: 13,
            }}
          >
            Imported <strong>{state.created}</strong> application{state.created === 1 ? '' : 's'}
            {state.skipped > 0 && <> · skipped <strong>{state.skipped}</strong></>}.
          </div>
          {state.errors.length > 0 && (
            <ul style={{ margin: '12px 0 0', padding: 0, listStyle: 'none', display: 'flex', flexDirection: 'column', gap: 4 }}>
              {state.errors.map((e, i) => (
                <li key={i} style={{ fontFamily: 'var(--font-mono)', fontSize: 11.5, color: '#8B1F1B' }}>
                  {e.row > 0 ? `Row ${e.row}: ` : ''}
                  {e.message}
                </li>
              ))}
            </ul>
          )}
        </div>
      )}
    </div>
  );
}
