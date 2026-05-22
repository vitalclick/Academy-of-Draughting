'use client';

import Link from 'next/link';
import { useEffect, useRef, useState, useTransition } from 'react';
import { useForm, type UseFormReturn } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { useAida } from '@/components/chrome/aida-context';
import { submitApplicationAction, saveDraftAction } from '@/app/apply/actions';
import { track } from '@/lib/analytics/events';
import {
  ApplicationDraftSchema,
  StepAboutSchema,
  StepPathwaySchema,
  type ApplicationDraft,
} from '@/lib/validation/application';

const STEPS = [
  { key: 'about', k: 'STEP 01', label: 'About you' },
  { key: 'pathway', k: 'STEP 02', label: 'Choose pathway' },
  { key: 'docs', k: 'STEP 03', label: 'Verify documents' },
  { key: 'review', k: 'STEP 04', label: 'Review & submit' },
] as const;

const STEP_FIELDS: Record<number, (keyof ApplicationDraft)[]> = {
  0: ['firstName', 'lastName', 'email', 'phone', 'idNumber', 'city'],
  1: ['programme', 'mode', 'campus', 'fundingPlan'],
  2: [],
  3: [],
};

type Form = UseFormReturn<ApplicationDraft>;

function WaIcon() {
  return (
    <svg width="14" height="14" viewBox="0 0 24 24" fill="currentColor" aria-hidden="true">
      <path d="M20.4 3.6A11.9 11.9 0 0 0 12 0C5.4 0 .1 5.3.1 11.9c0 2.1.6 4.1 1.6 5.9L0 24l6.4-1.7a11.9 11.9 0 0 0 5.6 1.4h.01c6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.5-8.2z" />
    </svg>
  );
}

function Field({
  label,
  req,
  error,
  auto,
  verified,
  hint,
  ...inputProps
}: React.InputHTMLAttributes<HTMLInputElement> & {
  label: string;
  req?: boolean;
  error?: string;
  auto?: boolean;
  verified?: boolean;
  hint?: string;
}) {
  return (
    <div className="apply-field">
      <label>
        <span>
          {label} {req && <span className="req">REQ</span>}
        </span>
        {auto && <span className="auto">⚡ PREFILLED</span>}
        {verified && (
          <span className="auto" style={{ color: 'var(--cyan-500)' }}>
            ✓ DOCUMENT VERIFIED
          </span>
        )}
      </label>
      <input {...inputProps} aria-invalid={Boolean(error)} />
      {hint && !error && <span className="hint">{hint}</span>}
      {error && <span className="apply-field-error">{error}</span>}
    </div>
  );
}

function StepAbout({ form }: { form: Form }) {
  const { register, formState } = form;
  const errs = formState.errors;
  return (
    <>
      <h2 className="apply-section-h">Tell us about you</h2>
      <p className="apply-section-sub">
        We&apos;ll use this to verify your identity and route your application to the closest
        campus.
      </p>
      <div className="apply-fields">
        <Field label="FIRST NAME" req auto error={errs.firstName?.message} {...register('firstName')} />
        <Field label="LAST NAME" req auto error={errs.lastName?.message} {...register('lastName')} />
        <Field
          label="EMAIL"
          req
          auto
          type="email"
          hint="We'll send a confirmation here"
          error={errs.email?.message}
          {...register('email')}
        />
        <Field
          label="MOBILE"
          req
          auto
          type="tel"
          hint="For WhatsApp follow-up"
          error={errs.phone?.message}
          {...register('phone')}
        />
        <Field
          label="ID NUMBER"
          req
          verified
          hint="SA ID · 13 digits"
          error={errs.idNumber?.message}
          {...register('idNumber')}
        />
        <Field label="CITY" req error={errs.city?.message} {...register('city')} />
      </div>
    </>
  );
}

function StepPathway({ form }: { form: Form }) {
  const programme = form.watch('programme');
  const mode = form.watch('mode');
  const campus = form.watch('campus');
  const fundingPlan = form.watch('fundingPlan');

  const programmes = [
    { id: 'mddop' as const, title: 'MDDOP National Certificate', sub: 'N4/N5 · 10–18 months', meta: 'Flagship · DHET examined', rec: '96% fit' },
    { id: 'bridging' as const, title: 'Bridging Course', sub: '3–6 months', meta: 'No prerequisites', rec: 'Foundation' },
    { id: 'short' as const, title: 'Autodesk Short Courses', sub: '4–12 weeks', meta: 'AutoCAD · Revit · Inventor', rec: 'Stackable' },
  ];
  const fundings = [
    { id: 'upfront' as const, t: 'Upfront', sub: '15% discount applied', tag: 'BEST VALUE' },
    { id: 'monthly' as const, t: 'Monthly instalments', sub: '0% interest · no hidden fees', tag: 'POPULAR' },
    { id: 'employer' as const, t: 'Employer / sponsor', sub: 'Invoice direct to employer', tag: 'BUSINESS' },
  ];

  return (
    <>
      <h2 className="apply-section-h">Choose your pathway</h2>
      <p className="apply-section-sub">
        Based on your earlier responses, <strong style={{ color: 'var(--ink)' }}>MDDOP N4/N5</strong> is the
        closest match. You can change this — your application stays valid for 12 months.
      </p>

      <div style={{ display: 'flex', flexDirection: 'column', gap: 10 }}>
        {programmes.map((p) => (
          <label
            key={p.id}
            style={{
              display: 'grid',
              gridTemplateColumns: '24px 1fr auto',
              gap: 14,
              padding: 18,
              border: `1px solid ${programme === p.id ? 'var(--blue-500)' : 'var(--line-on-light-2)'}`,
              borderRadius: 10,
              background: programme === p.id ? 'rgba(45,111,247,0.04)' : 'var(--white)',
              cursor: 'pointer',
              alignItems: 'center',
            }}
          >
            <input
              type="radio"
              value={p.id}
              checked={programme === p.id}
              onChange={() => form.setValue('programme', p.id, { shouldDirty: true })}
              style={{ accentColor: 'var(--blue-500)', width: 18, height: 18 }}
            />
            <div>
              <div style={{ display: 'flex', alignItems: 'baseline', gap: 10, flexWrap: 'wrap' }}>
                <span style={{ fontSize: 16, fontWeight: 500 }}>{p.title}</span>
                <span className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>{p.sub}</span>
              </div>
              <div className="t-mono-xs" style={{ color: 'var(--ink-3)', marginTop: 4 }}>{p.meta}</div>
            </div>
            <span className="pill pill-blue">{p.rec}</span>
          </label>
        ))}
      </div>

      <h3 className="apply-section-h" style={{ marginTop: 32, fontSize: 17 }}>
        Study mode &amp; campus
      </h3>

      <div className="apply-fields" style={{ marginTop: 12 }}>
        <div className="apply-field">
          <label><span>MODE <span className="req">REQ</span></span></label>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['Full-time', 'Part-time', 'Online'] as const).map((m) => (
              <button
                key={m}
                type="button"
                onClick={() => form.setValue('mode', m, { shouldDirty: true })}
                className={`filter-chip ${mode === m ? 'is-active' : ''}`}
                style={{ flex: 1 }}
              >
                {m}
              </button>
            ))}
          </div>
          <span className="hint">
            {mode === 'Full-time' ? '10 months · Mon–Fri 8am–3pm' : mode === 'Part-time' ? '18 months · 2 evenings + Saturday' : 'Self-paced · avg 8 months'}
          </span>
        </div>
        <div className="apply-field">
          <label><span>CAMPUS <span className="req">REQ</span></span></label>
          <div style={{ display: 'flex', gap: 6 }}>
            {(['Johannesburg', 'Durban', 'Online'] as const).map((c) => (
              <button
                key={c}
                type="button"
                onClick={() => form.setValue('campus', c, { shouldDirty: true })}
                className={`filter-chip ${campus === c ? 'is-active' : ''}`}
                style={{ flex: 1 }}
              >
                {c}
              </button>
            ))}
          </div>
          <span className="hint">
            {campus === 'Online' ? 'Nationwide · live + recorded' : 'In-person, full facilities'}
          </span>
        </div>
      </div>

      <h3 id="funding" className="apply-section-h" style={{ marginTop: 32, fontSize: 17 }}>
        Funding
      </h3>
      <p className="apply-section-sub">Pick a plan. You can change this with admissions later.</p>

      <div className="apply-fields">
        {fundings.map((f) => (
          <label
            key={f.id}
            style={{
              padding: 16,
              border: `1px solid ${fundingPlan === f.id ? 'var(--blue-500)' : 'var(--line-on-light-2)'}`,
              borderRadius: 10,
              background: fundingPlan === f.id ? 'rgba(45,111,247,0.04)' : 'var(--white)',
              cursor: 'pointer',
              display: 'flex',
              flexDirection: 'column',
              gap: 6,
            }}
          >
            <span style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: 8 }}>
              <span style={{ fontSize: 14, fontWeight: 500, display: 'inline-flex', alignItems: 'center', gap: 8 }}>
                <input
                  type="radio"
                  value={f.id}
                  checked={fundingPlan === f.id}
                  onChange={() => form.setValue('fundingPlan', f.id, { shouldDirty: true })}
                  style={{ accentColor: 'var(--blue-500)' }}
                />
                {f.t}
              </span>
              <span className="pill pill-light" style={{ fontSize: 9 }}>{f.tag}</span>
            </span>
            <span className="hint" style={{ marginLeft: 22 }}>{f.sub}</span>
          </label>
        ))}
      </div>
    </>
  );
}

function StepDocs({ applicationId }: { applicationId: string | null }) {
  const [files, setFiles] = useState<{ kind: string; filename: string; bytes: number }[]>([]);
  const [busy, setBusy] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleFile(kind: 'id' | 'matric', file: File) {
    if (!applicationId) {
      setError('Save your details on step 1 before uploading.');
      return;
    }
    if (file.size > 10 * 1024 * 1024) {
      setError(`${file.name} is over the 10 MB limit.`);
      return;
    }
    setError(null);
    setBusy(true);
    try {
      const signRes = await fetch('/api/applications/documents', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          kind,
          filename: file.name,
          bytes: file.size,
          mimeType: file.type || undefined,
        }),
      });
      if (!signRes.ok) throw new Error((await signRes.json()).error ?? 'sign failed');
      const signed = (await signRes.json()) as { path: string; token: string | null; mocked: boolean };

      if (!signed.mocked && signed.token) {
        const baseUrl = process.env.NEXT_PUBLIC_SUPABASE_URL!;
        const uploadRes = await fetch(
          `${baseUrl}/storage/v1/object/upload/sign/applicant-documents/${signed.path}?token=${signed.token}`,
          { method: 'PUT', body: file, headers: { 'Content-Type': file.type } }
        );
        if (!uploadRes.ok) throw new Error('upload failed');
      }

      await fetch('/api/applications/documents', {
        method: 'PUT',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({
          applicationId,
          kind,
          filename: file.name,
          storagePath: signed.path,
          bytes: file.size,
          mimeType: file.type || undefined,
        }),
      });

      setFiles((f) => [...f, { kind, filename: file.name, bytes: file.size }]);
      track('document_uploaded', { kind, bytes: file.size });
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Upload failed');
    } finally {
      setBusy(false);
    }
  }

  return (
    <>
      <h2 className="apply-section-h">Verify documents</h2>
      <p className="apply-section-sub">
        Upload your ID and matric certificate (PDF or JPG, &lt;10MB). We don&apos;t store images
        longer than 90 days.
      </p>

      <div className="apply-fields" style={{ marginTop: 12 }}>
        <div className="apply-field">
          <label><span>ID DOCUMENT</span></label>
          <input
            type="file"
            accept="application/pdf,image/*"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile('id', f);
            }}
          />
        </div>
        <div className="apply-field">
          <label><span>MATRIC CERTIFICATE</span></label>
          <input
            type="file"
            accept="application/pdf,image/*"
            disabled={busy}
            onChange={(e) => {
              const f = e.target.files?.[0];
              if (f) handleFile('matric', f);
            }}
          />
        </div>
      </div>

      {error && <div className="apply-banner apply-banner-error" role="alert">{error}</div>}

      {files.length > 0 && (
        <div className="ocr-zone" style={{ marginTop: 16 }}>
          <span className="pill pill-blue" style={{ fontSize: 10 }}>
            <span className="dot" />
            {files.length} FILE{files.length > 1 ? 'S' : ''} UPLOADED
          </span>
          {files.map((f) => (
            <div key={f.filename} style={{ marginTop: 8, fontSize: 14 }}>
              <strong>{f.filename}</strong>{' '}
              <span className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>
                · {f.kind.toUpperCase()} · {(f.bytes / 1024).toFixed(0)} KB
              </span>
            </div>
          ))}
        </div>
      )}

      <p className="t-mono-xs" style={{ color: 'var(--ink-4)', marginTop: 18 }}>
        OCR field extraction runs after submit. You can change documents up to the decision point.
      </p>
    </>
  );
}

function StepReview({ form }: { form: Form }) {
  const v = form.getValues();
  return (
    <>
      <h2 className="apply-section-h">Review &amp; submit</h2>
      <p className="apply-section-sub">
        Everything looks right? Submit and you&apos;ll get an email + WhatsApp confirmation.
        Decision within one business day.
      </p>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 0 }}>
        <ReviewRow title="About you">
          <div>{v.firstName} {v.lastName}</div>
          <div className="t-mono-sm" style={{ color: 'var(--ink-3)' }}>{v.email} · {v.phone}</div>
          <div className="t-mono-sm" style={{ color: 'var(--ink-3)' }}>{v.idNumber} · {v.city}</div>
        </ReviewRow>
        <ReviewRow title="Pathway">
          <div><strong style={{ fontWeight: 500 }}>{v.programme.toUpperCase()}</strong></div>
          <div className="t-mono-sm" style={{ color: 'var(--ink-3)' }}>{v.mode} · {v.campus} campus</div>
        </ReviewRow>
        <ReviewRow title="Funding">
          <div>{v.fundingPlan}</div>
        </ReviewRow>
      </div>
      <div
        style={{
          marginTop: 24,
          padding: 14,
          border: '1px solid var(--line-on-light-2)',
          borderRadius: 8,
          fontSize: 13,
          color: 'var(--ink-3)',
          lineHeight: 1.5,
        }}
      >
        By submitting, you agree to the <a href="/popia" style={{ color: 'var(--blue-500)' }}>POPIA notice</a>{' '}
        and the Academy&apos;s <a href="/terms" style={{ color: 'var(--blue-500)' }}>terms of enrollment</a>.
        We never share your details with third parties.
      </div>
    </>
  );
}

function ReviewRow({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <div
      style={{
        display: 'grid',
        gridTemplateColumns: '160px 1fr',
        gap: 16,
        padding: '14px 0',
        borderTop: '1px solid var(--line-on-light-2)',
        alignItems: 'flex-start',
      }}
    >
      <span className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>{title.toUpperCase()}</span>
      <div style={{ fontSize: 14, color: 'var(--ink)' }}>{children}</div>
    </div>
  );
}

function ApplyAsideAida({ onOpen }: { onOpen: () => void }) {
  return (
    <div className="aside-card aside-aida">
      <div style={{ display: 'flex', alignItems: 'center', gap: 10, marginBottom: 10 }}>
        <span className="aida-avatar" style={{ width: 28, height: 28 }}>
          <span className="ai-dot" />
        </span>
        <div>
          <div style={{ fontSize: 14, fontWeight: 500 }}>Admissions support</div>
          <div className="t-mono-xs" style={{ color: 'var(--ink-on-dark-3)' }}>ONLINE · &lt;1 MIN</div>
        </div>
      </div>
      <div className="aside-aida-msg">
        Stuck on a step? AIDA can help mid-application — your data is autosaved.
      </div>
      <button type="button" className="btn btn-sm btn-primary" style={{ width: '100%' }} onClick={onOpen}>
        Open admissions chat
      </button>
    </div>
  );
}

function ApplyAsideSummary({ values }: { values: ApplicationDraft }) {
  return (
    <div className="aside-card">
      <span className="aside-k">YOUR APPLICATION · DRAFT</span>
      <h3 className="aside-h" style={{ marginTop: 6 }}>Application summary</h3>
      <div>
        <div className="aside-row"><span>Programme</span><span style={{ fontWeight: 500 }}>{values.programme.toUpperCase()}</span></div>
        <div className="aside-row"><span>Mode</span><span>{values.mode}</span></div>
        <div className="aside-row"><span>Campus</span><span>{values.campus}</span></div>
        <div className="aside-row"><span>Funding</span><span>{values.fundingPlan}</span></div>
      </div>
    </div>
  );
}

function ApplyAsideHelp() {
  return (
    <div className="aside-card">
      <span className="aside-k">HELP</span>
      <h3 className="aside-h" style={{ marginTop: 6 }}>Stuck? Talk to a human.</h3>
      <div style={{ display: 'flex', flexDirection: 'column', gap: 6, marginTop: 10 }}>
        <a href="https://wa.me/27681100746" className="btn btn-sm btn-ghost-light" style={{ justifyContent: 'flex-start' }}>
          <WaIcon /> WhatsApp Johannesburg
        </a>
        <a href="https://wa.me/27681100746" className="btn btn-sm btn-ghost-light" style={{ justifyContent: 'flex-start' }}>
          <WaIcon /> WhatsApp Durban
        </a>
        <a href="tel:+27681100746" className="btn btn-sm btn-ghost-light" style={{ justifyContent: 'flex-start' }}>
          +27 68 110 0746
        </a>
      </div>
    </div>
  );
}

const DRAFT_STORAGE_KEY = 'aoad_apply_draft_v1';
const APP_ID_STORAGE_KEY = 'aoad_apply_id_v1';

export function ApplyForm() {
  const aida = useAida();
  const [step, setStep] = useState(0);
  const [applicationId, setApplicationId] = useState<string | null>(null);
  const [submitState, setSubmitState] = useState<
    | { kind: 'idle' }
    | { kind: 'error'; message: string }
    | { kind: 'success'; applicationId: string; trackingUrl: string }
  >({ kind: 'idle' });
  const [pending, startTransition] = useTransition();
  const autosaveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);

  const form = useForm<ApplicationDraft>({
    mode: 'onBlur',
    resolver: zodResolver(ApplicationDraftSchema),
    defaultValues: {
      firstName: '',
      lastName: '',
      email: '',
      phone: '',
      idNumber: '',
      city: '',
      programme: 'mddop',
      mode: 'Full-time',
      campus: 'Johannesburg',
      fundingPlan: 'monthly',
      intake: 'Jan 2026',
    },
  });

  // Restore draft from localStorage on mount
  useEffect(() => {
    try {
      const raw = localStorage.getItem(DRAFT_STORAGE_KEY);
      if (raw) form.reset(JSON.parse(raw) as ApplicationDraft);
      const id = localStorage.getItem(APP_ID_STORAGE_KEY);
      if (id) setApplicationId(id);
    } catch {
      // ignore
    }
    track('apply_view', {});
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave: local on every change, server on debounce when email is valid
  useEffect(() => {
    const sub = form.watch((value) => {
      try {
        localStorage.setItem(DRAFT_STORAGE_KEY, JSON.stringify(value));
      } catch {
        // ignore
      }
      if (autosaveTimer.current) clearTimeout(autosaveTimer.current);
      const email = value.email;
      if (!email || !StepAboutSchema.shape.email.safeParse(email).success) return;
      autosaveTimer.current = setTimeout(async () => {
        try {
          const res = await saveDraftAction({
            applicationId,
            email,
            draft: value as Partial<ApplicationDraft>,
          });
          if (res.applicationId !== applicationId) {
            setApplicationId(res.applicationId);
            try {
              localStorage.setItem(APP_ID_STORAGE_KEY, res.applicationId);
            } catch {
              // ignore
            }
          }
        } catch (err) {
          console.warn('[autosave] failed', err);
        }
      }, 1500);
    });
    return () => sub.unsubscribe();
  }, [form, applicationId]);

  async function goNext() {
    const fields = STEP_FIELDS[step];
    const schemas = [StepAboutSchema, StepPathwaySchema];
    const schema = schemas[step];
    if (schema) {
      const slice = Object.fromEntries(fields.map((f) => [f, form.getValues(f)]));
      const result = schema.safeParse(slice);
      if (!result.success) {
        await form.trigger(fields);
        return;
      }
    }
    track('apply_step_complete', { step });
    setStep((s) => Math.min(STEPS.length - 1, s + 1));
  }

  async function handleSubmit() {
    const valid = await form.trigger();
    if (!valid) {
      setSubmitState({ kind: 'error', message: 'Please fix the highlighted fields.' });
      return;
    }
    const values = form.getValues();
    startTransition(async () => {
      const result = await submitApplicationAction(values);
      if (!result.ok) {
        if (result.fieldErrors) {
          for (const [path, message] of Object.entries(result.fieldErrors)) {
            form.setError(path as keyof ApplicationDraft, { message });
          }
        }
        setSubmitState({ kind: 'error', message: result.error });
        return;
      }
      track('application_submitted', {});
      setSubmitState({ kind: 'success', applicationId: result.applicationId, trackingUrl: result.trackingUrl });
      try {
        localStorage.removeItem(DRAFT_STORAGE_KEY);
        localStorage.removeItem(APP_ID_STORAGE_KEY);
      } catch {
        // ignore
      }
    });
  }

  if (submitState.kind === 'success') {
    return (
      <section className="section section-paper">
        <div className="page" style={{ maxWidth: 720 }}>
          <div className="apply-card" style={{ padding: 40 }}>
            <span className="pill pill-blue">
              <span className="dot" />
              APPLICATION RECEIVED
            </span>
            <h2 className="t-h2" style={{ marginTop: 16, marginBottom: 12 }}>
              You&apos;re in the queue.
            </h2>
            <p className="t-body-lg" style={{ marginBottom: 20 }}>
              We&apos;ve emailed you a tracking link. Admissions will reach out within one business
              day — sooner if you&apos;re on WhatsApp.
            </p>
            <div style={{ display: 'flex', gap: 12, flexWrap: 'wrap' }}>
              <Link href={new URL(submitState.trackingUrl).pathname} className="btn btn-primary">
                Track your application →
              </Link>
              <Link href="/courses" className="btn btn-ghost-light">
                See programmes
              </Link>
            </div>
            <p className="t-mono-xs" style={{ color: 'var(--ink-4)', marginTop: 24 }}>
              REFERENCE · {submitState.applicationId}
            </p>
          </div>
        </div>
      </section>
    );
  }

  const values = form.watch();

  return (
    <section className="section section-paper" data-screen-label={`02 Apply · ${STEPS[step].label}`}>
      <div className="page">
        <div className="apply-grid">
          <div className="apply-card">
            <div className="apply-stepper">
              {STEPS.map((s, i) => (
                <button
                  key={s.key}
                  type="button"
                  className={`apply-step ${i === step ? 'is-active' : ''} ${i < step ? 'is-done' : ''}`}
                  onClick={() => setStep(i)}
                >
                  <span className="apply-step-num">{i < step ? '✓' : i + 1}</span>
                  <span className="apply-step-label">
                    <span className="apply-step-label-k">{s.k}</span>
                    <span className="apply-step-label-t">{s.label}</span>
                  </span>
                </button>
              ))}
            </div>

            <form
              className="apply-body"
              onSubmit={(e) => {
                e.preventDefault();
                if (step < STEPS.length - 1) goNext();
                else handleSubmit();
              }}
              noValidate
            >
              {step === 0 && <StepAbout form={form} />}
              {step === 1 && <StepPathway form={form} />}
              {step === 2 && <StepDocs applicationId={applicationId} />}
              {step === 3 && <StepReview form={form} />}

              {submitState.kind === 'error' && (
                <div className="apply-banner apply-banner-error" role="alert">
                  {submitState.message}
                </div>
              )}

              <div className="apply-actions">
                <button
                  type="button"
                  className="btn btn-ghost-light"
                  disabled={step === 0 || pending}
                  onClick={() => setStep((s) => Math.max(0, s - 1))}
                  style={{ opacity: step === 0 ? 0.4 : 1 }}
                >
                  ← Back
                </button>
                <div style={{ display: 'flex', gap: 12, alignItems: 'center' }}>
                  <span className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>
                    {applicationId ? `AUTOSAVED · ${applicationId.slice(0, 8)}` : 'AUTOSAVE ENABLED'}
                  </span>
                  {step < STEPS.length - 1 ? (
                    <button type="submit" className="btn btn-primary" disabled={pending}>
                      Continue <span className="arr" aria-hidden="true">→</span>
                    </button>
                  ) : (
                    <button type="submit" className="btn btn-primary" disabled={pending}>
                      {pending ? 'Submitting…' : 'Submit application →'}
                    </button>
                  )}
                </div>
              </div>
            </form>
          </div>

          <aside className="apply-side">
            <ApplyAsideAida onOpen={() => aida.setOpen(true)} />
            <ApplyAsideSummary values={values} />
            <ApplyAsideHelp />
          </aside>
        </div>
      </div>
    </section>
  );
}
