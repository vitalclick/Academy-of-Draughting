'use client';

import { useState } from 'react';
import { useFormStatus } from 'react-dom';
import type { EnrollmentOption } from '@/lib/db/admin';
import { recordPaymentAction } from './actions';

const fieldStyle: React.CSSProperties = {
  width: '100%',
  background: 'var(--paper)',
  border: '1px solid var(--line-on-light)',
  borderRadius: 'var(--r-sm)',
  padding: '8px 10px',
  fontFamily: 'inherit',
  fontSize: 13.5,
  color: 'var(--ink)',
};

const labelStyle: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--ink-4)',
  marginBottom: 4,
};

function SubmitButton() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-sm btn-primary" disabled={pending}>
      {pending ? 'Saving…' : 'Save payment'}
    </button>
  );
}

export function RecordPaymentForm({ options }: { options: EnrollmentOption[] }) {
  const [open, setOpen] = useState(false);

  return (
    <div className="adm-card" style={{ marginBottom: 16 }}>
      <div className="adm-card-head">
        <div>
          <h3 className="adm-card-title">Record a payment</h3>
          <div className="adm-card-sub">Manual entry · ZAR</div>
        </div>
        <button type="button" className="btn btn-sm btn-ghost-light" onClick={() => setOpen((o) => !o)}>
          {open ? 'Cancel' : '+ Record payment'}
        </button>
      </div>
      {open && (
        <form action={recordPaymentAction} className="adm-card-body">
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle} htmlFor="pay-enrollment">
                Student / enrollment
              </label>
              <select id="pay-enrollment" name="enrollment" style={fieldStyle} defaultValue="">
                <option value="">— Not linked —</option>
                {options.map((o) => (
                  <option key={o.id} value={`${o.id}|${o.applicant_id ?? ''}`}>
                    {o.label}
                  </option>
                ))}
              </select>
            </div>
            <div>
              <label style={labelStyle} htmlFor="pay-amount">
                Amount (ZAR)
              </label>
              <input id="pay-amount" name="amount" type="number" min="0" step="0.01" required style={fieldStyle} placeholder="3950.00" />
            </div>
            <div>
              <label style={labelStyle} htmlFor="pay-plan">
                Plan
              </label>
              <input id="pay-plan" name="plan" type="text" style={fieldStyle} placeholder="Monthly 3/10" />
            </div>
            <div>
              <label style={labelStyle} htmlFor="pay-status">
                Status
              </label>
              <select id="pay-status" name="status" style={fieldStyle} defaultValue="pending">
                <option value="pending">Pending</option>
                <option value="paid">Paid</option>
                <option value="overdue">Overdue</option>
                <option value="waived">Waived</option>
              </select>
            </div>
            <div>
              <label style={labelStyle} htmlFor="pay-due">
                Due date
              </label>
              <input id="pay-due" name="due_date" type="date" style={fieldStyle} />
            </div>
            <div style={{ gridColumn: '1 / -1' }}>
              <label style={labelStyle} htmlFor="pay-note">
                Note
              </label>
              <input id="pay-note" name="note" type="text" style={fieldStyle} placeholder="Optional reference or memo" />
            </div>
          </div>
          <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 14 }}>
            <SubmitButton />
          </div>
        </form>
      )}
    </div>
  );
}
