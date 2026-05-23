'use client';

import { useMemo, useState, useTransition } from 'react';

import {
  OFFICE_LOCATIONS,
  type SignatureInput,
  type SignatureOptions,
} from '@/lib/signatures/types';
import { TEMPLATES, renderSignature } from '@/lib/signatures/templates';
import type { SignatureRow } from '@/types/database';

import {
  saveSignatureAction,
  updateSignatureAction,
  deleteSignatureAction,
} from './actions';

type Props = {
  initial?: SignatureRow | null;
};

const DEFAULTS = {
  data: {
    full_name: '',
    role: '',
    qualifications: '',
    email: '',
    mobile: '',
    office_phone: '',
    office_location: 'johannesburg',
    linkedin: '',
    website: 'academydraughting.com',
  } as SignatureInput,
  opts: {
    template: TEMPLATES[0].id,
    show_logo: true,
    show_tagline: true,
    show_accreditations: false,
  } as SignatureOptions,
};

function splitInitial(initial: SignatureRow | null | undefined) {
  if (!initial) return DEFAULTS;
  return {
    data: {
      full_name: initial.full_name,
      role: initial.role,
      qualifications: initial.qualifications ?? '',
      email: initial.email,
      mobile: initial.mobile ?? '',
      office_phone: initial.office_phone ?? '',
      office_location: initial.office_location,
      linkedin: initial.linkedin ?? '',
      website: initial.website,
    } as SignatureInput,
    opts: {
      template: initial.template,
      show_logo: initial.show_logo,
      show_tagline: initial.show_tagline,
      show_accreditations: initial.show_accreditations,
    } as SignatureOptions,
  };
}

export function SignatureBuilder({ initial }: Props) {
  const seed = splitInitial(initial);
  const [data, setData] = useState<SignatureInput>(seed.data);
  const [opts, setOpts] = useState<SignatureOptions>(seed.opts);
  const [copied, setCopied] = useState<'html' | 'rich' | null>(null);
  const [pending, start] = useTransition();

  const html = useMemo(() => renderSignature(data, opts), [data, opts]);
  const currentTemplate = TEMPLATES.find((t) => t.id === opts.template) ?? TEMPLATES[0];
  const logoSupported = currentTemplate.supportsLogo;
  const editingId = initial?.id ?? null;

  function update<K extends keyof SignatureInput>(k: K, v: SignatureInput[K]) {
    setData((d) => ({ ...d, [k]: v }));
  }
  function updateOpt<K extends keyof SignatureOptions>(k: K, v: SignatureOptions[K]) {
    setOpts((o) => ({ ...o, [k]: v }));
  }

  async function copyHtml() {
    await navigator.clipboard.writeText(html);
    setCopied('html');
    setTimeout(() => setCopied(null), 1500);
  }

  async function copyRich() {
    try {
      const item = new ClipboardItem({
        'text/html': new Blob([html], { type: 'text/html' }),
        'text/plain': new Blob(
          [html.replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' ').trim()],
          { type: 'text/plain' }
        ),
      });
      await navigator.clipboard.write([item]);
      setCopied('rich');
      setTimeout(() => setCopied(null), 1500);
    } catch {
      const node = document.getElementById('signature-rendered');
      if (!node) return;
      const range = document.createRange();
      range.selectNodeContents(node);
      const sel = window.getSelection();
      sel?.removeAllRanges();
      sel?.addRange(range);
      document.execCommand('copy');
      sel?.removeAllRanges();
      setCopied('rich');
      setTimeout(() => setCopied(null), 1500);
    }
  }

  function onDelete() {
    if (!editingId) return;
    if (!confirm(`Delete the signature for ${data.full_name}? This cannot be undone.`)) return;
    start(async () => {
      await deleteSignatureAction(editingId);
      window.location.href = '/admin/signatures';
    });
  }

  const formAction = editingId
    ? updateSignatureAction.bind(null, editingId)
    : saveSignatureAction;

  return (
    <div className="sig-grid">
      <form action={formAction} className="sig-form">
        <h3 className="sig-form-heading">Template</h3>

        <div className="sig-field">
          <select
            name="template"
            value={opts.template}
            onChange={(e) => updateOpt('template', e.target.value)}
          >
            {TEMPLATES.map((t) => (
              <option key={t.id} value={t.id}>
                {t.name}
              </option>
            ))}
          </select>
          <span className="sig-hint">{currentTemplate.description}</span>
        </div>

        <label className="sig-check" style={{ opacity: logoSupported ? 1 : 0.5 }}>
          <input
            type="checkbox"
            name="show_logo"
            checked={logoSupported && opts.show_logo}
            disabled={!logoSupported}
            onChange={(e) => updateOpt('show_logo', e.target.checked)}
          />
          Show logo
          {!logoSupported && (
            <span style={{ fontSize: 11, color: 'var(--ink-4)', marginLeft: 4 }}>
              (not available — text-only)
            </span>
          )}
        </label>
        <label className="sig-check">
          <input
            type="checkbox"
            name="show_tagline"
            checked={opts.show_tagline}
            onChange={(e) => updateOpt('show_tagline', e.target.checked)}
          />
          Show tagline (&ldquo;Drawing offices, taught right&rdquo;)
        </label>
        <label className="sig-check">
          <input
            type="checkbox"
            name="show_accreditations"
            checked={opts.show_accreditations}
            onChange={(e) => updateOpt('show_accreditations', e.target.checked)}
          />
          Show accreditations strip
        </label>

        <hr className="sig-divider" />
        <h3 className="sig-form-heading">Your details</h3>

        <div className="sig-field">
          <label htmlFor="full_name">Full name *</label>
          <input
            id="full_name"
            name="full_name"
            value={data.full_name}
            onChange={(e) => update('full_name', e.target.value)}
            required
            maxLength={160}
            placeholder="Jane Mokoena"
          />
        </div>

        <div className="sig-field">
          <label htmlFor="role">Role / Title *</label>
          <input
            id="role"
            name="role"
            value={data.role}
            onChange={(e) => update('role', e.target.value)}
            required
            maxLength={160}
            placeholder="Head of Admissions"
          />
        </div>

        <div className="sig-field">
          <label htmlFor="qualifications">Qualifications (optional)</label>
          <input
            id="qualifications"
            name="qualifications"
            value={data.qualifications ?? ''}
            onChange={(e) => update('qualifications', e.target.value)}
            maxLength={160}
            placeholder="ND Mechanical Engineering"
          />
        </div>

        <div className="sig-field">
          <label htmlFor="email">Email *</label>
          <input
            id="email"
            name="email"
            type="email"
            value={data.email}
            onChange={(e) => update('email', e.target.value)}
            required
            maxLength={200}
            placeholder="name@academydraughting.com"
          />
        </div>

        <div className="sig-row">
          <div className="sig-field">
            <label htmlFor="mobile">Mobile</label>
            <input
              id="mobile"
              name="mobile"
              value={data.mobile ?? ''}
              onChange={(e) => update('mobile', e.target.value)}
              maxLength={40}
              placeholder="+27 68 110 0746"
            />
          </div>
          <div className="sig-field">
            <label htmlFor="office_phone">Office</label>
            <input
              id="office_phone"
              name="office_phone"
              value={data.office_phone ?? ''}
              onChange={(e) => update('office_phone', e.target.value)}
              maxLength={40}
            />
          </div>
        </div>

        <div className="sig-field">
          <label htmlFor="office_location">Office / campus</label>
          <select
            id="office_location"
            name="office_location"
            value={data.office_location}
            onChange={(e) => update('office_location', e.target.value)}
          >
            {OFFICE_LOCATIONS.map((o) => (
              <option key={o.value} value={o.value}>
                {o.label}
              </option>
            ))}
          </select>
        </div>

        <div className="sig-field">
          <label htmlFor="linkedin">LinkedIn (optional)</label>
          <input
            id="linkedin"
            name="linkedin"
            value={data.linkedin ?? ''}
            onChange={(e) => update('linkedin', e.target.value)}
            maxLength={200}
            placeholder="linkedin.com/in/your-handle"
          />
        </div>

        <div className="sig-field">
          <label htmlFor="website">Website</label>
          <input
            id="website"
            name="website"
            value={data.website}
            onChange={(e) => update('website', e.target.value)}
            maxLength={200}
          />
        </div>

        <div className="sig-form-actions">
          <button type="submit" className="btn btn-primary" disabled={pending}>
            {editingId ? 'Update signature' : 'Save signature'}
          </button>
          {editingId && (
            <button
              type="button"
              className="btn btn-ghost-light"
              onClick={onDelete}
              disabled={pending}
              style={{ color: '#8B1F1B' }}
            >
              Delete
            </button>
          )}
        </div>
      </form>

      <div className="sig-preview-col">
        <div className="sig-card">
          <div className="sig-card-head">
            <span>Preview</span>
            <span className="sig-card-meta">
              Rendered with the same HTML the recipient will see.
            </span>
          </div>
          <div className="sig-card-body" style={{ background: '#fff' }}>
            <div id="signature-rendered" dangerouslySetInnerHTML={{ __html: html }} />
          </div>
          <div className="sig-card-foot">
            <button type="button" className="btn btn-ghost-light" onClick={copyRich}>
              {copied === 'rich' ? 'Copied ✓' : 'Copy rich (paste into Gmail)'}
            </button>
          </div>
        </div>

        <div className="sig-card">
          <div className="sig-card-head">
            <span>HTML source</span>
            <button type="button" className="btn btn-primary" onClick={copyHtml}>
              {copied === 'html' ? 'Copied ✓' : 'Copy HTML'}
            </button>
          </div>
          <div className="sig-card-body">
            <textarea
              readOnly
              value={html}
              rows={10}
              className="sig-html-source"
            />
            <p className="sig-help">
              <strong>Copy rich</strong> works for Gmail and Outlook signature editors — paste
              straight into the signature field. Use <strong>Copy HTML</strong> when your mail
              client has a raw-HTML signature option (Apple Mail, Thunderbird, FastMail).
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
