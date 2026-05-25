import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/server';
import { captureError } from '@/lib/observability';
import type {
  ApplicantRow,
  ApplicationRow,
  ApplicationStatus,
  ContentBlockRow,
  ContentKind,
  ContentState,
  DocumentRow,
  EnrollmentRow,
  EventRow,
  PaymentRow,
  PaymentStatus,
} from '@/types/database';

export type ApplicationWithApplicant = ApplicationRow & { applicant: ApplicantRow | null };

const PAGE_SIZE_DEFAULT = 50;

export async function listApplications(opts?: {
  status?: ApplicationStatus;
  limit?: number;
}): Promise<ApplicationWithApplicant[]> {
  const sb = supabaseAdmin();
  if (!sb) return [];
  const limit = opts?.limit ?? PAGE_SIZE_DEFAULT;
  let query = sb
    .from('applications')
    .select('*, applicant:applicants(*)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (opts?.status) query = query.eq('status', opts.status);
  const { data, error } = await query;
  if (error) {
    await captureError('listApplications failed', error);
    return [];
  }
  return (data ?? []) as unknown as ApplicationWithApplicant[];
}

export async function getApplicationDetail(
  id: string
): Promise<{ application: ApplicationWithApplicant; documents: DocumentRow[] } | null> {
  const sb = supabaseAdmin();
  if (!sb) return null;
  const { data: app, error } = await sb
    .from('applications')
    .select('*, applicant:applicants(*)')
    .eq('id', id)
    .single();
  if (error || !app) return null;
  const { data: docs } = await sb
    .from('documents')
    .select('*')
    .eq('application_id', id)
    .order('uploaded_at', { ascending: false });
  return { application: app as unknown as ApplicationWithApplicant, documents: (docs ?? []) as DocumentRow[] };
}

export async function updateApplicationStatus(
  id: string,
  status: ApplicationStatus
): Promise<ApplicationRow | null> {
  const sb = supabaseAdmin();
  if (!sb) return null;
  const patch = {
    status,
    decided_at:
      status === 'accepted' || status === 'rejected'
        ? new Date().toISOString()
        : null,
  } satisfies Partial<Omit<ApplicationRow, 'id'>>;
  const { data, error } = await sb
    .from('applications')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(`updateApplicationStatus: ${error.message}`);
  return data;
}

export async function listLeads(opts?: { limit?: number }) {
  const sb = supabaseAdmin();
  if (!sb) return [];
  const limit = opts?.limit ?? PAGE_SIZE_DEFAULT;
  // Leads are applicants who have not yet submitted an application
  const { data: applicants } = await sb
    .from('applicants')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(200);
  if (!applicants) return [];
  const { data: apps } = await sb.from('applications').select('applicant_id, status');
  const submittedSet = new Set((apps ?? []).filter((a) => a.status !== 'draft').map((a) => a.applicant_id));
  return applicants.filter((a) => !submittedSet.has(a.id)).slice(0, limit);
}

export async function listEvents(opts?: { name?: string; limit?: number }): Promise<EventRow[]> {
  const sb = supabaseAdmin();
  if (!sb) return [];
  const limit = opts?.limit ?? 100;
  let query = sb.from('events').select('*').order('occurred_at', { ascending: false }).limit(limit);
  if (opts?.name) query = query.eq('name', opts.name);
  const { data, error } = await query;
  if (error) {
    await captureError('listEvents failed', error);
    return [];
  }
  return data ?? [];
}

export async function listContent(opts?: {
  kind?: ContentKind;
  state?: ContentState;
}): Promise<ContentBlockRow[]> {
  const sb = supabaseAdmin();
  if (!sb) return [];
  let query = sb
    .from('content_blocks')
    .select('*')
    .order('updated_at', { ascending: false })
    .limit(100);
  if (opts?.kind) query = query.eq('kind', opts.kind);
  if (opts?.state) query = query.eq('state', opts.state);
  const { data, error } = await query;
  if (error) {
    await captureError('listContent failed', error);
    return [];
  }
  return data ?? [];
}

export async function getContent(id: string): Promise<ContentBlockRow | null> {
  const sb = supabaseAdmin();
  if (!sb) return null;
  const { data, error } = await sb.from('content_blocks').select('*').eq('id', id).maybeSingle();
  if (error) throw new Error(`getContent: ${error.message}`);
  return data;
}

export async function upsertContent(
  patch: Partial<ContentBlockRow> & { kind: ContentKind; title: string }
): Promise<ContentBlockRow> {
  const sb = supabaseAdmin();
  if (!sb) throw new Error('Supabase unavailable');
  if (patch.id) {
    const { id, ...rest } = patch;
    const { data, error } = await sb
      .from('content_blocks')
      .update(rest)
      .eq('id', id)
      .select()
      .single();
    if (error) throw new Error(`updateContent: ${error.message}`);
    return data;
  }
  const { data, error } = await sb
    .from('content_blocks')
    .insert({
      kind: patch.kind,
      title: patch.title,
      state: patch.state ?? 'draft',
      slug: patch.slug ?? null,
      summary: patch.summary ?? null,
      body: patch.body ?? null,
      metadata: patch.metadata ?? {},
      author_id: patch.author_id ?? null,
      ai_prompt: patch.ai_prompt ?? null,
      ai_model: patch.ai_model ?? null,
      published_at: patch.state === 'published' ? new Date().toISOString() : null,
    })
    .select()
    .single();
  if (error) throw new Error(`insertContent: ${error.message}`);
  return data;
}

export async function patchContent(
  id: string,
  patch: Partial<Omit<ContentBlockRow, 'id'>>
): Promise<ContentBlockRow | null> {
  const sb = supabaseAdmin();
  if (!sb) return null;
  const { data, error } = await sb
    .from('content_blocks')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(`patchContent: ${error.message}`);
  return data;
}

export async function getOverviewCounts(): Promise<{
  applications_total: number;
  applications_submitted: number;
  applications_under_review: number;
  applications_accepted: number;
  leads_total: number;
  events_24h: number;
  content_drafts: number;
  students_active: number;
}> {
  const sb = supabaseAdmin();
  if (!sb) {
    return {
      applications_total: 0,
      applications_submitted: 0,
      applications_under_review: 0,
      applications_accepted: 0,
      leads_total: 0,
      events_24h: 0,
      content_drafts: 0,
      students_active: 0,
    };
  }

  const since = new Date(Date.now() - 24 * 60 * 60 * 1000).toISOString();
  const [
    apps,
    submitted,
    underReview,
    accepted,
    applicants,
    events24,
    drafts,
    studentsActive,
  ] = await Promise.all([
    sb.from('applications').select('id', { count: 'exact', head: true }),
    sb.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'submitted'),
    sb.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'under_review'),
    sb.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'accepted'),
    sb.from('applicants').select('id', { count: 'exact', head: true }),
    sb.from('events').select('id', { count: 'exact', head: true }).gte('occurred_at', since),
    sb.from('content_blocks').select('id', { count: 'exact', head: true }).eq('state', 'draft'),
    sb.from('enrollments').select('id', { count: 'exact', head: true }).eq('state', 'active'),
  ]);

  return {
    applications_total: apps.count ?? 0,
    applications_submitted: submitted.count ?? 0,
    applications_under_review: underReview.count ?? 0,
    applications_accepted: accepted.count ?? 0,
    leads_total: applicants.count ?? 0,
    events_24h: events24.count ?? 0,
    content_drafts: drafts.count ?? 0,
    students_active: studentsActive.count ?? 0,
  };
}

// ============================================================================
// Students — enrollments joined to applicants, with grade aggregates
// ============================================================================
export type StudentRow = {
  enrollment: EnrollmentRow;
  applicant: ApplicantRow | null;
  avg_grade: number | null;
  graded_count: number;
  submitted_count: number;
};

export async function listStudents(opts?: { limit?: number }): Promise<StudentRow[]> {
  const sb = supabaseAdmin();
  if (!sb) return [];
  const limit = opts?.limit ?? 100;
  const { data, error } = await sb
    .from('enrollments')
    .select('*, applicant:applicants(*)')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (error || !data) {
    if (error) await captureError('listStudents failed', error);
    return [];
  }
  const rows = data as unknown as (EnrollmentRow & { applicant: ApplicantRow | null })[];
  const ids = rows.map((e) => e.id);

  const agg = new Map<string, { sum: number; graded: number; submitted: number }>();
  if (ids.length) {
    const { data: subs } = await sb
      .from('submissions')
      .select('enrollment_id, grade, state')
      .in('enrollment_id', ids);
    for (const s of subs ?? []) {
      const a = agg.get(s.enrollment_id) ?? { sum: 0, graded: 0, submitted: 0 };
      if (s.state === 'submitted' || s.state === 'graded' || s.state === 'returned') a.submitted += 1;
      if (s.grade != null) {
        a.sum += s.grade;
        a.graded += 1;
      }
      agg.set(s.enrollment_id, a);
    }
  }

  return rows.map((row) => {
    const { applicant, ...enrollment } = row;
    const a = agg.get(row.id);
    return {
      enrollment: enrollment as EnrollmentRow,
      applicant: applicant ?? null,
      avg_grade: a && a.graded > 0 ? Math.round((a.sum / a.graded) * 10) / 10 : null,
      graded_count: a?.graded ?? 0,
      submitted_count: a?.submitted ?? 0,
    };
  });
}

// ============================================================================
// Programmes — live enrollment counts per programme id
// ============================================================================
export async function getProgrammeEnrollmentCounts(): Promise<
  Record<string, { active: number; completed: number; total: number }>
> {
  const sb = supabaseAdmin();
  if (!sb) return {};
  const { data } = await sb.from('enrollments').select('programme, state');
  const map: Record<string, { active: number; completed: number; total: number }> = {};
  for (const row of data ?? []) {
    const m = map[row.programme] ?? { active: 0, completed: 0, total: 0 };
    m.total += 1;
    if (row.state === 'active') m.active += 1;
    if (row.state === 'completed') m.completed += 1;
    map[row.programme] = m;
  }
  return map;
}

// ============================================================================
// Communications — real contacts inbox (applicants/leads + event activity)
// ============================================================================
export type ContactRow = ApplicantRow & {
  application_id: string | null;
  application_status: ApplicationStatus | null;
  last_activity: string | null;
  event_count: number;
};

export async function listContacts(opts?: { limit?: number }): Promise<ContactRow[]> {
  const sb = supabaseAdmin();
  if (!sb) return [];
  const limit = opts?.limit ?? 100;
  const { data: applicants } = await sb
    .from('applicants')
    .select('*')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (!applicants) return [];
  const ids = applicants.map((a) => a.id);

  const appMap = new Map<string, { id: string; status: ApplicationStatus }>();
  if (ids.length) {
    const { data: apps } = await sb
      .from('applications')
      .select('id, applicant_id, status, created_at')
      .in('applicant_id', ids)
      .order('created_at', { ascending: false });
    for (const a of apps ?? []) {
      if (!appMap.has(a.applicant_id)) appMap.set(a.applicant_id, { id: a.id, status: a.status });
    }
  }

  const actMap = new Map<string, { last: string; count: number }>();
  if (ids.length) {
    const { data: evs } = await sb
      .from('events')
      .select('applicant_id, occurred_at')
      .in('applicant_id', ids)
      .order('occurred_at', { ascending: false })
      .limit(2000);
    for (const ev of evs ?? []) {
      if (!ev.applicant_id) continue;
      const cur = actMap.get(ev.applicant_id);
      if (cur) cur.count += 1;
      else actMap.set(ev.applicant_id, { last: ev.occurred_at, count: 1 });
    }
  }

  return applicants.map((a) => {
    const app = appMap.get(a.id);
    const act = actMap.get(a.id);
    return {
      ...a,
      application_id: app?.id ?? null,
      application_status: app?.status ?? null,
      last_activity: act?.last ?? null,
      event_count: act?.count ?? 0,
    };
  });
}

export async function getContactDetail(applicantId: string): Promise<{
  applicant: ApplicantRow;
  application: ApplicationRow | null;
  events: EventRow[];
} | null> {
  const sb = supabaseAdmin();
  if (!sb) return null;
  const { data: applicant } = await sb
    .from('applicants')
    .select('*')
    .eq('id', applicantId)
    .maybeSingle();
  if (!applicant) return null;
  const { data: apps } = await sb
    .from('applications')
    .select('*')
    .eq('applicant_id', applicantId)
    .order('created_at', { ascending: false });
  const application = (apps ?? [])[0] ?? null;
  const appIds = (apps ?? []).map((a) => a.id);

  let query = sb.from('events').select('*').order('occurred_at', { ascending: false }).limit(100);
  query = appIds.length
    ? query.or(`applicant_id.eq.${applicantId},application_id.in.(${appIds.join(',')})`)
    : query.eq('applicant_id', applicantId);
  const { data: events } = await query;
  return { applicant, application, events: events ?? [] };
}

// ============================================================================
// Payments — fees ledger
// ============================================================================
export type PaymentWithContext = PaymentRow & {
  enrollment: (EnrollmentRow & { applicant: ApplicantRow | null }) | null;
};

function effectivePaymentStatus(p: { status: PaymentStatus; due_date: string | null }): PaymentStatus {
  if (p.status === 'pending' && p.due_date && new Date(p.due_date) < new Date()) return 'overdue';
  return p.status;
}

export async function listPayments(opts?: {
  status?: PaymentStatus;
  limit?: number;
}): Promise<PaymentWithContext[]> {
  const sb = supabaseAdmin();
  if (!sb) return [];
  const limit = opts?.limit ?? 100;
  let query = sb
    .from('payments')
    .select('*, enrollment:enrollments(*, applicant:applicants(*))')
    .order('created_at', { ascending: false })
    .limit(limit);
  if (opts?.status) query = query.eq('status', opts.status);
  const { data, error } = await query;
  if (error) {
    await captureError('listPayments failed', error);
    return [];
  }
  return (data ?? []).map((row) => {
    const r = row as unknown as PaymentWithContext;
    return { ...r, amount: Number(r.amount), status: effectivePaymentStatus(r) };
  });
}

export async function getPaymentSummary(): Promise<{
  collected: number;
  outstanding: number;
  overdue_count: number;
  on_track: number;
}> {
  const sb = supabaseAdmin();
  if (!sb) return { collected: 0, outstanding: 0, overdue_count: 0, on_track: 0 };
  const { data } = await sb.from('payments').select('amount, status, due_date');
  let collected = 0;
  let outstanding = 0;
  let overdue_count = 0;
  let on_track = 0;
  for (const row of data ?? []) {
    const amount = Number(row.amount);
    const st = effectivePaymentStatus(row);
    if (st === 'paid') collected += amount;
    else if (st === 'overdue') {
      outstanding += amount;
      overdue_count += 1;
    } else if (st === 'pending') {
      outstanding += amount;
      on_track += 1;
    }
  }
  return { collected, outstanding, overdue_count, on_track };
}

export type EnrollmentOption = { id: string; applicant_id: string | null; label: string };

export async function listEnrollmentOptions(): Promise<EnrollmentOption[]> {
  const sb = supabaseAdmin();
  if (!sb) return [];
  const { data } = await sb
    .from('enrollments')
    .select('id, applicant_id, programme, cohort, applicant:applicants(first_name, last_name, email)')
    .order('created_at', { ascending: false })
    .limit(500);
  return (data ?? []).map((e) => {
    const ap = (e as unknown as { applicant: { first_name: string | null; last_name: string | null; email: string } | null }).applicant;
    const name = ap ? `${ap.first_name ?? ''} ${ap.last_name ?? ''}`.trim() || ap.email : 'Unknown';
    return { id: e.id, applicant_id: e.applicant_id, label: `${name} — ${e.programme} · ${e.cohort}` };
  });
}

export async function recordPayment(input: {
  enrollment_id: string | null;
  applicant_id: string | null;
  amount: number;
  plan: string | null;
  status: PaymentStatus;
  due_date: string | null;
  note: string | null;
  created_by: string | null;
}): Promise<PaymentRow> {
  const sb = supabaseAdmin();
  if (!sb) throw new Error('Supabase unavailable');
  const { data, error } = await sb
    .from('payments')
    .insert({
      enrollment_id: input.enrollment_id,
      applicant_id: input.applicant_id,
      amount: input.amount,
      currency: 'ZAR',
      plan: input.plan,
      status: input.status,
      due_date: input.due_date,
      paid_at: input.status === 'paid' ? new Date().toISOString() : null,
      note: input.note,
      created_by: input.created_by,
    })
    .select()
    .single();
  if (error) throw new Error(`recordPayment: ${error.message}`);
  return data as PaymentRow;
}
