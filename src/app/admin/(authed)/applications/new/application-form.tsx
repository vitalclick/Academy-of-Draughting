'use client';

import { useFormState, useFormStatus } from 'react-dom';
import { createApplicationAction } from './actions';
import {
  CAMPUS_OPTIONS,
  FUNDING_OPTIONS,
  MODE_OPTIONS,
  PROGRAMME_OPTIONS,
  STATUS_OPTIONS,
  type CreateState,
} from './options';

const field: React.CSSProperties = {
  width: '100%',
  background: 'var(--paper)',
  border: '1px solid var(--line-on-light)',
  borderRadius: 'var(--r-sm)',
  padding: '8px 10px',
  fontFamily: 'inherit',
  fontSize: 13.5,
  color: 'var(--ink)',
};

const label: React.CSSProperties = {
  display: 'block',
  fontFamily: 'var(--font-mono)',
  fontSize: 10,
  letterSpacing: '0.06em',
  textTransform: 'uppercase',
  color: 'var(--ink-4)',
  marginBottom: 4,
};

function Submit() {
  const { pending } = useFormStatus();
  return (
    <button type="submit" className="btn btn-sm btn-primary" disabled={pending}>
      {pending ? 'Creating…' : 'Create application'}
    </button>
  );
}

export function ApplicationForm() {
  const [state, formAction] = useFormState<CreateState, FormData>(createApplicationAction, {});

  return (
    <form action={formAction} className="adm-card-body">
      {state.error && (
        <div
          role="alert"
          style={{
            marginBottom: 14,
            padding: '10px 12px',
            borderRadius: 'var(--r-sm)',
            background: 'rgba(214,49,45,0.08)',
            color: '#8B1F1B',
            fontSize: 13,
          }}
        >
          {state.error}
        </div>
      )}

      <div className="adm-card-sub" style={{ marginBottom: 10 }}>Applicant</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div style={{ gridColumn: '1 / -1' }}>
          <label style={label} htmlFor="na-email">Email *</label>
          <input id="na-email" name="email" type="email" required style={field} placeholder="applicant@email.com" />
        </div>
        <div>
          <label style={label} htmlFor="na-first">First name</label>
          <input id="na-first" name="first_name" type="text" style={field} />
        </div>
        <div>
          <label style={label} htmlFor="na-last">Last name</label>
          <input id="na-last" name="last_name" type="text" style={field} />
        </div>
        <div>
          <label style={label} htmlFor="na-phone">Phone</label>
          <input id="na-phone" name="phone" type="text" style={field} placeholder="+27 82 555 0100" />
        </div>
        <div>
          <label style={label} htmlFor="na-city">City</label>
          <input id="na-city" name="city" type="text" style={field} />
        </div>
        <div>
          <label style={label} htmlFor="na-id">ID number</label>
          <input id="na-id" name="id_number" type="text" style={field} />
        </div>
        <div>
          <label style={label} htmlFor="na-matric">Matric year</label>
          <input id="na-matric" name="matric_year" type="text" style={field} placeholder="2023" />
        </div>
      </div>

      <div className="adm-card-sub" style={{ margin: '20px 0 10px' }}>Application</div>
      <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: 14 }}>
        <div>
          <label style={label} htmlFor="na-programme">Programme *</label>
          <select id="na-programme" name="programme" required style={field} defaultValue="">
            <option value="" disabled>Select…</option>
            {PROGRAMME_OPTIONS.map((p) => (
              <option key={p.value} value={p.value}>{p.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={label} htmlFor="na-mode">Mode *</label>
          <select id="na-mode" name="mode" required style={field} defaultValue="">
            <option value="" disabled>Select…</option>
            {MODE_OPTIONS.map((m) => (
              <option key={m} value={m}>{m}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={label} htmlFor="na-campus">Campus *</label>
          <select id="na-campus" name="campus" required style={field} defaultValue="">
            <option value="" disabled>Select…</option>
            {CAMPUS_OPTIONS.map((c) => (
              <option key={c} value={c}>{c}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={label} htmlFor="na-funding">Funding plan *</label>
          <select id="na-funding" name="funding_plan" required style={field} defaultValue="">
            <option value="" disabled>Select…</option>
            {FUNDING_OPTIONS.map((f) => (
              <option key={f.value} value={f.value}>{f.label}</option>
            ))}
          </select>
        </div>
        <div>
          <label style={label} htmlFor="na-intake">Intake</label>
          <input id="na-intake" name="intake" type="text" style={field} placeholder="2026-jan" />
        </div>
        <div>
          <label style={label} htmlFor="na-status">Status</label>
          <select id="na-status" name="status" style={field} defaultValue="submitted">
            {STATUS_OPTIONS.map((s) => (
              <option key={s} value={s}>{s}</option>
            ))}
          </select>
        </div>
      </div>

      <div style={{ display: 'flex', justifyContent: 'flex-end', marginTop: 18 }}>
        <Submit />
      </div>
    </form>
  );
}
