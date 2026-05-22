import 'server-only';
import { promises as fs } from 'node:fs';
import path from 'node:path';
import { randomUUID } from 'node:crypto';
import type { ApplicantRow, ApplicationRow, EventRow } from '@/types/database';

/**
 * File-backed fallback store used in development when Supabase is not configured.
 * NOT for production — single-process, no concurrency control, no encryption.
 */

const ROOT = path.join(process.cwd(), '.local-store');
const APPLICANTS_DIR = path.join(ROOT, 'applicants');
const APPLICATIONS_DIR = path.join(ROOT, 'applications');
const EVENTS_FILE = path.join(ROOT, 'events.ndjson');

async function ensureDirs() {
  await fs.mkdir(APPLICANTS_DIR, { recursive: true });
  await fs.mkdir(APPLICATIONS_DIR, { recursive: true });
}

async function writeJson(file: string, data: unknown) {
  await fs.writeFile(file, JSON.stringify(data, null, 2));
}

async function readJson<T>(file: string): Promise<T | null> {
  try {
    const buf = await fs.readFile(file, 'utf8');
    return JSON.parse(buf) as T;
  } catch (err) {
    if ((err as NodeJS.ErrnoException).code === 'ENOENT') return null;
    throw err;
  }
}

export async function localUpsertApplicant(input: {
  email: string;
  first_name?: string | null;
  last_name?: string | null;
  phone?: string | null;
  city?: string | null;
  id_number?: string | null;
  matric_year?: string | null;
}): Promise<ApplicantRow> {
  await ensureDirs();
  const key = encodeURIComponent(input.email.toLowerCase());
  const file = path.join(APPLICANTS_DIR, `${key}.json`);
  const existing = await readJson<ApplicantRow>(file);
  const now = new Date().toISOString();
  const row: ApplicantRow = {
    id: existing?.id ?? randomUUID(),
    email: input.email.toLowerCase(),
    first_name: input.first_name ?? existing?.first_name ?? null,
    last_name: input.last_name ?? existing?.last_name ?? null,
    phone: input.phone ?? existing?.phone ?? null,
    city: input.city ?? existing?.city ?? null,
    id_number: input.id_number ?? existing?.id_number ?? null,
    matric_year: input.matric_year ?? existing?.matric_year ?? null,
    created_at: existing?.created_at ?? now,
    updated_at: now,
  };
  await writeJson(file, row);
  return row;
}

export async function localCreateApplication(
  row: Omit<ApplicationRow, 'id' | 'created_at' | 'updated_at'>
): Promise<ApplicationRow> {
  await ensureDirs();
  const id = randomUUID();
  const now = new Date().toISOString();
  const full: ApplicationRow = { ...row, id, created_at: now, updated_at: now };
  await writeJson(path.join(APPLICATIONS_DIR, `${id}.json`), full);
  return full;
}

export async function localUpdateApplication(
  id: string,
  patch: Partial<ApplicationRow>
): Promise<ApplicationRow | null> {
  const file = path.join(APPLICATIONS_DIR, `${id}.json`);
  const existing = await readJson<ApplicationRow>(file);
  if (!existing) return null;
  const updated: ApplicationRow = {
    ...existing,
    ...patch,
    id: existing.id,
    updated_at: new Date().toISOString(),
  };
  await writeJson(file, updated);
  return updated;
}

export async function localGetApplication(id: string): Promise<ApplicationRow | null> {
  return readJson<ApplicationRow>(path.join(APPLICATIONS_DIR, `${id}.json`));
}

export async function localAppendEvent(row: Omit<EventRow, 'id' | 'occurred_at'>) {
  await ensureDirs();
  const line = JSON.stringify({ occurred_at: new Date().toISOString(), ...row }) + '\n';
  await fs.appendFile(EVENTS_FILE, line);
}
