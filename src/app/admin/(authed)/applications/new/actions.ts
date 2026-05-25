'use server';

import { redirect } from 'next/navigation';
import { revalidatePath } from 'next/cache';
import { currentAdmin } from '@/lib/auth/admin';
import { upsertApplicantByEmail } from '@/lib/db/applications';
import { adminCreateApplication } from '@/lib/db/admin';
import { parseCsv } from '@/lib/csv';
import type { ApplicationStatus } from '@/types/database';
import {
  CAMPUS_OPTIONS,
  FUNDING_VALUES,
  MODE_OPTIONS,
  PROGRAMME_IDS,
  STATUS_OPTIONS,
  type CreateState,
  type ImportState,
} from './options';

const emailRe = /^[^@\s]+@[^@\s]+\.[^@\s]+$/;

function blank(v: FormDataEntryValue | null): string {
  return String(v ?? '').trim();
}

function normaliseStatus(raw: string): ApplicationStatus {
  return (STATUS_OPTIONS.includes(raw) ? raw : 'submitted') as ApplicationStatus;
}

// ---------------------------------------------------------------------------
// Single application
// ---------------------------------------------------------------------------
export async function createApplicationAction(
  _prev: CreateState,
  formData: FormData
): Promise<CreateState> {
  const admin = await currentAdmin();
  if (!admin) return { error: 'Unauthorized' };

  const email = blank(formData.get('email')).toLowerCase();
  if (!emailRe.test(email)) return { error: 'A valid email is required.' };

  const programme = blank(formData.get('programme'));
  if (!PROGRAMME_IDS.includes(programme)) return { error: 'Select a programme.' };
  const mode = blank(formData.get('mode'));
  if (!MODE_OPTIONS.includes(mode)) return { error: 'Select a mode.' };
  const campus = blank(formData.get('campus'));
  if (!CAMPUS_OPTIONS.includes(campus)) return { error: 'Select a campus.' };
  const funding = blank(formData.get('funding_plan'));
  if (!FUNDING_VALUES.includes(funding)) return { error: 'Select a funding plan.' };
  const status = normaliseStatus(blank(formData.get('status')) || 'submitted');

  let appId: string;
  try {
    const applicant = await upsertApplicantByEmail({
      email,
      firstName: blank(formData.get('first_name')) || undefined,
      lastName: blank(formData.get('last_name')) || undefined,
      phone: blank(formData.get('phone')) || undefined,
      city: blank(formData.get('city')) || undefined,
      idNumber: blank(formData.get('id_number')) || undefined,
      matricYear: blank(formData.get('matric_year')) || undefined,
    });
    const app = await adminCreateApplication({
      applicantId: applicant.id,
      programme,
      mode,
      campus,
      funding_plan: funding,
      intake: blank(formData.get('intake')) || null,
      status,
    });
    appId = app.id;
  } catch (e) {
    return { error: e instanceof Error ? e.message : 'Failed to create application.' };
  }

  revalidatePath('/admin/applications');
  redirect(`/admin/applications/${appId}`);
}

// ---------------------------------------------------------------------------
// Bulk CSV import
// ---------------------------------------------------------------------------
const REQUIRED_COLUMNS = ['email', 'programme', 'mode', 'campus', 'funding_plan'];

export async function bulkImportAction(
  _prev: ImportState,
  formData: FormData
): Promise<ImportState> {
  const admin = await currentAdmin();
  if (!admin) return { ran: true, created: 0, skipped: 0, errors: [{ row: 0, message: 'Unauthorized.' }] };

  const file = formData.get('file');
  if (!(file instanceof File) || file.size === 0) {
    return { ran: true, created: 0, skipped: 0, errors: [{ row: 0, message: 'Choose a CSV file to import.' }] };
  }

  const rows = parseCsv(await file.text()).filter((r) => r.some((c) => c.trim() !== ''));
  if (rows.length < 2) {
    return { ran: true, created: 0, skipped: 0, errors: [{ row: 0, message: 'The CSV has no data rows.' }] };
  }

  const header = rows[0].map((h) => h.trim().toLowerCase());
  const idx = (name: string) => header.indexOf(name);
  const missing = REQUIRED_COLUMNS.filter((h) => idx(h) === -1);
  if (missing.length) {
    return { ran: true, created: 0, skipped: 0, errors: [{ row: 0, message: `Missing required column(s): ${missing.join(', ')}` }] };
  }

  const cell = (r: string[], name: string) => {
    const i = idx(name);
    return i >= 0 ? (r[i] ?? '').trim() : '';
  };

  let created = 0;
  let skipped = 0;
  const errors: { row: number; message: string }[] = [];

  for (let r = 1; r < rows.length; r++) {
    const row = rows[r];
    const lineNo = r + 1; // 1-based, accounting for header
    const email = cell(row, 'email').toLowerCase();
    const programme = cell(row, 'programme');
    const mode = cell(row, 'mode');
    const campus = cell(row, 'campus');
    const funding = cell(row, 'funding_plan');

    try {
      if (!emailRe.test(email)) throw new Error('invalid email');
      if (!PROGRAMME_IDS.includes(programme)) throw new Error(`unknown programme "${programme}"`);
      if (!MODE_OPTIONS.includes(mode)) throw new Error(`unknown mode "${mode}"`);
      if (!CAMPUS_OPTIONS.includes(campus)) throw new Error(`unknown campus "${campus}"`);
      if (!FUNDING_VALUES.includes(funding)) throw new Error(`unknown funding_plan "${funding}"`);
      const status = normaliseStatus(cell(row, 'status') || 'submitted');

      const applicant = await upsertApplicantByEmail({
        email,
        firstName: cell(row, 'first_name') || undefined,
        lastName: cell(row, 'last_name') || undefined,
        phone: cell(row, 'phone') || undefined,
        city: cell(row, 'city') || undefined,
        idNumber: cell(row, 'id_number') || undefined,
        matricYear: cell(row, 'matric_year') || undefined,
      });
      await adminCreateApplication({
        applicantId: applicant.id,
        programme,
        mode,
        campus,
        funding_plan: funding,
        intake: cell(row, 'intake') || null,
        status,
      });
      created += 1;
    } catch (e) {
      skipped += 1;
      errors.push({ row: lineNo, message: e instanceof Error ? e.message : 'failed' });
    }
  }

  revalidatePath('/admin/applications');
  return { ran: true, created, skipped, errors };
}
