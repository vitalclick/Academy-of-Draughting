import 'server-only';
import { randomUUID } from 'node:crypto';
import { supabaseAdmin } from './server';
import { features } from '@/lib/env';
import type { DocumentKind } from '@/types/database';

const BUCKET = 'applicant-documents';
const SIGNED_URL_TTL = 60 * 5; // 5 minutes

/**
 * Mints a signed upload URL the browser can PUT a file to.
 * Returns null (with a mock path) when Supabase is not configured.
 */
export async function createSignedUploadUrl(args: {
  applicationId: string;
  kind: DocumentKind;
  filename: string;
}): Promise<{ path: string; token: string | null; mocked: boolean }> {
  const safe = args.filename.replace(/[^a-zA-Z0-9._-]+/g, '_').slice(-120);
  const path = `${args.applicationId}/${args.kind}/${randomUUID()}-${safe}`;

  const sb = supabaseAdmin();
  if (!sb || !features.supabase) {
    return { path, token: null, mocked: true };
  }

  const { data, error } = await sb.storage.from(BUCKET).createSignedUploadUrl(path);
  if (error) throw new Error(`createSignedUploadUrl: ${error.message}`);
  return { path: data.path, token: data.token, mocked: false };
}

export async function createSignedReadUrl(path: string) {
  const sb = supabaseAdmin();
  if (!sb) return null;
  const { data, error } = await sb.storage.from(BUCKET).createSignedUrl(path, SIGNED_URL_TTL);
  if (error) throw new Error(`createSignedReadUrl: ${error.message}`);
  return data.signedUrl;
}

export async function recordDocument(args: {
  applicationId: string;
  kind: DocumentKind;
  filename: string;
  storagePath: string;
  bytes: number;
  mimeType?: string;
}) {
  const sb = supabaseAdmin();
  if (!sb) {
    // In local-only mode we just log; no documents table.
    console.info(`[docs:mock] ${args.kind} ${args.filename} (${args.bytes}B)`);
    return null;
  }
  const { data, error } = await sb
    .from('documents')
    .insert({
      application_id: args.applicationId,
      kind: args.kind,
      filename: args.filename,
      storage_path: args.storagePath,
      bytes: args.bytes,
      mime_type: args.mimeType ?? null,
      ocr_payload: null,
    })
    .select()
    .single();
  if (error) throw new Error(`recordDocument: ${error.message}`);
  return data;
}
