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
  EventRow,
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
  ] = await Promise.all([
    sb.from('applications').select('id', { count: 'exact', head: true }),
    sb.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'submitted'),
    sb.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'under_review'),
    sb.from('applications').select('id', { count: 'exact', head: true }).eq('status', 'accepted'),
    sb.from('applicants').select('id', { count: 'exact', head: true }),
    sb.from('events').select('id', { count: 'exact', head: true }).gte('occurred_at', since),
    sb.from('content_blocks').select('id', { count: 'exact', head: true }).eq('state', 'draft'),
  ]);

  return {
    applications_total: apps.count ?? 0,
    applications_submitted: submitted.count ?? 0,
    applications_under_review: underReview.count ?? 0,
    applications_accepted: accepted.count ?? 0,
    leads_total: applicants.count ?? 0,
    events_24h: events24.count ?? 0,
    content_drafts: drafts.count ?? 0,
  };
}
