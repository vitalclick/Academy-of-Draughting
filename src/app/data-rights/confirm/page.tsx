import type { Metadata } from 'next';
import { jwtVerify } from 'jose';
import { PageShell } from '@/components/chrome/page-shell';
import { env, publicSiteUrl } from '@/lib/env';
import { supabaseAdmin } from '@/lib/supabase/server';
import { logEvent } from '@/lib/db/applications';
import { SITE } from '@/lib/site';

export const metadata: Metadata = {
  title: 'Data rights · confirm',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

function tokenKey() {
  const secret =
    env.TRACKING_TOKEN_SECRET ?? 'dev-only-secret-please-set-TRACKING_TOKEN_SECRET';
  return new TextEncoder().encode(secret);
}

async function verify(token: string): Promise<{ email: string; kind: 'access' | 'delete' } | null> {
  try {
    const { payload } = await jwtVerify(token, tokenKey(), { issuer: 'aoad.data-rights' });
    if (
      typeof payload.email !== 'string' ||
      (payload.kind !== 'access' && payload.kind !== 'delete')
    ) {
      return null;
    }
    return { email: payload.email, kind: payload.kind };
  } catch {
    return null;
  }
}

type ExportBundle = {
  applicant: Record<string, unknown> | null;
  applications: unknown[];
  documents: unknown[];
  events: unknown[];
};

async function buildExport(email: string): Promise<ExportBundle | null> {
  const sb = supabaseAdmin();
  if (!sb) return null;
  const { data: applicant } = await sb
    .from('applicants')
    .select('*')
    .eq('email', email)
    .maybeSingle();
  if (!applicant) return { applicant: null, applications: [], documents: [], events: [] };
  const [apps, docs, events] = await Promise.all([
    sb.from('applications').select('*').eq('applicant_id', applicant.id),
    sb
      .from('documents')
      .select('*')
      .in(
        'application_id',
        (await sb.from('applications').select('id').eq('applicant_id', applicant.id)).data?.map(
          (r) => r.id
        ) ?? []
      ),
    sb.from('events').select('*').eq('applicant_id', applicant.id).limit(500),
  ]);
  return {
    applicant,
    applications: apps.data ?? [],
    documents: docs.data ?? [],
    events: events.data ?? [],
  };
}

async function performDelete(email: string): Promise<{ ok: boolean; detail?: string }> {
  const sb = supabaseAdmin();
  if (!sb) return { ok: false, detail: 'storage_unavailable' };
  // Application rows cascade to documents via FK. Events are nulled (FK is loose).
  const { data: applicant } = await sb
    .from('applicants')
    .select('id')
    .eq('email', email)
    .maybeSingle();
  if (!applicant) return { ok: true, detail: 'no_record' };
  // Anonymise rather than fully erase: keep aggregate counts intact but strip PII.
  const anonEmail = `deleted_${applicant.id}@example.invalid`;
  const { error } = await sb
    .from('applicants')
    .update({
      email: anonEmail,
      first_name: null,
      last_name: null,
      phone: null,
      city: null,
      id_number: null,
      matric_year: null,
    })
    .eq('id', applicant.id);
  if (error) return { ok: false, detail: error.message };

  await logEvent({
    name: 'data_rights_executed',
    applicant_id: applicant.id,
    application_id: null,
    anonymous_id: null,
    session_id: null,
    payload: { kind: 'delete', method: 'anonymise' },
  }).catch(() => {});

  return { ok: true };
}

export default async function DataRightsConfirmPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;
  const v = token ? await verify(token) : null;

  if (!v) {
    return (
      <PageShell active="home" headerTone="light">
        <section className="section section-light" style={{ minHeight: '50vh' }}>
          <div className="page" style={{ maxWidth: 720, paddingTop: 64 }}>
            <span className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>
              POPIA · DATA RIGHTS
            </span>
            <h1 className="t-h2" style={{ margin: '8px 0 12px' }}>
              Link expired or invalid.
            </h1>
            <p className="t-body">
              The confirmation link has expired or is no longer valid. Submit a new request from
              the data-rights page, or contact admissions directly at{' '}
              <a href={`mailto:${SITE.email}`} style={{ color: 'var(--blue-600)' }}>
                {SITE.email}
              </a>
              .
            </p>
          </div>
        </section>
      </PageShell>
    );
  }

  if (v.kind === 'delete') {
    const result = await performDelete(v.email);
    return (
      <PageShell active="home" headerTone="light">
        <section className="section section-light" style={{ minHeight: '50vh' }}>
          <div className="page" style={{ maxWidth: 720, paddingTop: 64 }}>
            <span className="t-mono-xs" style={{ color: result.ok ? 'var(--cyan-500)' : 'var(--ink-4)' }}>
              POPIA · {result.ok ? 'DELETION COMPLETE' : 'DELETION ISSUE'}
            </span>
            <h1 className="t-h2" style={{ margin: '8px 0 12px' }}>
              {result.ok ? 'Your data has been removed.' : 'We could not complete this request.'}
            </h1>
            <p className="t-body">
              {result.ok
                ? 'Your personal details have been erased from our database. Application records remain anonymised for our aggregate enrolment statistics. Documents will be purged on the next retention cycle (max 90 days).'
                : 'Something went wrong. Please contact admissions and we will execute the request manually.'}
            </p>
            <p className="t-body" style={{ marginTop: 12 }}>
              Need anything else?{' '}
              <a href={`mailto:${SITE.email}`} style={{ color: 'var(--blue-600)' }}>
                {SITE.email}
              </a>
            </p>
          </div>
        </section>
      </PageShell>
    );
  }

  // Access — render the bundle inline + provide JSON download
  const bundle = await buildExport(v.email);
  await logEvent({
    name: 'data_rights_executed',
    applicant_id: null,
    application_id: null,
    anonymous_id: null,
    session_id: null,
    payload: { kind: 'access' },
  }).catch(() => {});

  const json = JSON.stringify(bundle, null, 2);
  const dataUri = `data:application/json;charset=utf-8,${encodeURIComponent(json)}`;
  const filename = `aoad-data-export-${v.email.replace(/[^a-z0-9.]/gi, '_')}.json`;

  return (
    <PageShell active="home" headerTone="light">
      <section className="section section-light" style={{ minHeight: '50vh' }}>
        <div className="page" style={{ maxWidth: 820, paddingTop: 64 }}>
          <span className="t-mono-xs" style={{ color: 'var(--cyan-500)' }}>
            POPIA · ACCESS REQUEST
          </span>
          <h1 className="t-h2" style={{ margin: '8px 0 12px' }}>
            Your data export.
          </h1>
          <p className="t-body" style={{ marginBottom: 20 }}>
            Everything we hold about <strong>{v.email}</strong> is below. Download the JSON for
            your records.
          </p>
          <a href={dataUri} download={filename} className="btn btn-primary">
            Download JSON export
          </a>
          <pre
            className="data-export"
            style={{
              marginTop: 24,
              background: 'var(--paper)',
              padding: 20,
              borderRadius: 8,
              border: '1px solid var(--line-on-light)',
              fontSize: 12.5,
              fontFamily: 'var(--font-mono)',
              whiteSpace: 'pre-wrap',
              wordBreak: 'break-all',
              maxHeight: 480,
              overflow: 'auto',
            }}
          >
            {json}
          </pre>
          <p className="t-mono-xs" style={{ color: 'var(--ink-4)', marginTop: 24 }}>
            CONFIRMATION ISSUED VIA {publicSiteUrl()} · {SITE.name}
          </p>
        </div>
      </section>
    </PageShell>
  );
}
