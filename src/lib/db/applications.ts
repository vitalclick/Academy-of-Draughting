import 'server-only';
import { features } from '@/lib/env';
import { supabaseAdmin } from '@/lib/supabase/server';
import {
  localUpsertApplicant,
  localCreateApplication,
  localUpdateApplication,
  localGetApplication,
  localAppendEvent,
} from './local-store';
import type { ApplicantRow, ApplicationRow, EventRow } from '@/types/database';
import type { ApplicationDraft } from '@/lib/validation/application';

export async function upsertApplicantByEmail(input: {
  email: string;
  firstName?: string;
  lastName?: string;
  phone?: string;
  city?: string;
  idNumber?: string;
  matricYear?: string;
}): Promise<ApplicantRow> {
  const payload = {
    email: input.email.toLowerCase(),
    first_name: input.firstName ?? null,
    last_name: input.lastName ?? null,
    phone: input.phone ?? null,
    city: input.city ?? null,
    id_number: input.idNumber ?? null,
    matric_year: input.matricYear ?? null,
  };

  const sb = supabaseAdmin();
  if (!sb) return localUpsertApplicant(payload);

  const { data, error } = await sb
    .from('applicants')
    .upsert(payload, { onConflict: 'email' })
    .select()
    .single();
  if (error) throw new Error(`upsertApplicant: ${error.message}`);
  return data;
}

export async function createApplication(
  applicantId: string,
  draft: ApplicationDraft
): Promise<ApplicationRow> {
  const payload = {
    applicant_id: applicantId,
    status: 'submitted' as const,
    programme: draft.programme,
    mode: draft.mode,
    campus: draft.campus,
    funding_plan: draft.fundingPlan,
    intake: draft.intake ?? null,
    submitted_at: new Date().toISOString(),
    decided_at: null,
    draft_payload: draft as unknown as Record<string, unknown>,
  };

  const sb = supabaseAdmin();
  if (!sb) return localCreateApplication(payload);

  const { data, error } = await sb.from('applications').insert(payload).select().single();
  if (error) throw new Error(`createApplication: ${error.message}`);
  return data;
}

export async function saveDraft(
  applicantId: string,
  draft: Partial<ApplicationDraft>
): Promise<ApplicationRow> {
  const sb = supabaseAdmin();
  const payload = {
    applicant_id: applicantId,
    status: 'draft' as const,
    programme: draft.programme ?? 'mddop',
    mode: draft.mode ?? 'Full-time',
    campus: draft.campus ?? 'Johannesburg',
    funding_plan: draft.fundingPlan ?? 'monthly',
    intake: draft.intake ?? null,
    submitted_at: null,
    decided_at: null,
    draft_payload: draft as Record<string, unknown>,
  };
  if (!sb) return localCreateApplication(payload);
  const { data, error } = await sb.from('applications').insert(payload).select().single();
  if (error) throw new Error(`saveDraft: ${error.message}`);
  return data;
}

export async function updateApplicationDraft(
  id: string,
  draft: Partial<ApplicationDraft>
): Promise<ApplicationRow | null> {
  const sb = supabaseAdmin();
  const patch = { draft_payload: draft as Record<string, unknown> };
  if (!sb) return localUpdateApplication(id, patch);
  const { data, error } = await sb
    .from('applications')
    .update(patch)
    .eq('id', id)
    .select()
    .single();
  if (error) throw new Error(`updateDraft: ${error.message}`);
  return data;
}

export async function getApplication(id: string): Promise<ApplicationRow | null> {
  const sb = supabaseAdmin();
  if (!sb) return localGetApplication(id);
  const { data, error } = await sb.from('applications').select('*').eq('id', id).single();
  if (error && error.code !== 'PGRST116') throw new Error(`getApplication: ${error.message}`);
  return data ?? null;
}

export async function logEvent(row: Omit<EventRow, 'id' | 'occurred_at'>) {
  const sb = supabaseAdmin();
  if (!sb) {
    if (!features.supabase) {
      // Don't crash the request if logging the event fails
      try {
        await localAppendEvent(row);
      } catch (err) {
        console.warn('[events] local append failed', err);
      }
    }
    return;
  }
  const { error } = await sb.from('events').insert({ ...row, occurred_at: new Date().toISOString() });
  if (error) console.warn('[events] insert failed', error.message);
}
