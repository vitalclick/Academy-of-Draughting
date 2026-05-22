import { NextResponse } from 'next/server';
import { z } from 'zod';
import { createSignedUploadUrl, recordDocument } from '@/lib/supabase/storage';

const MAX_BYTES = 10 * 1024 * 1024; // 10 MB
const ALLOWED_MIME = new Set([
  'application/pdf',
  'image/jpeg',
  'image/png',
  'image/webp',
  'image/heic',
]);

const RequestSchema = z.object({
  applicationId: z.string().uuid(),
  kind: z.enum(['id', 'matric', 'cv', 'other']),
  filename: z.string().min(1).max(200),
  bytes: z.number().int().positive().max(MAX_BYTES),
  mimeType: z
    .string()
    .optional()
    .refine((v) => !v || ALLOWED_MIME.has(v), 'Unsupported file type'),
});

export async function POST(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = RequestSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
  }
  const signed = await createSignedUploadUrl({
    applicationId: parsed.data.applicationId,
    kind: parsed.data.kind,
    filename: parsed.data.filename,
  });
  return NextResponse.json(signed);
}

const CommitSchema = z.object({
  applicationId: z.string().uuid(),
  kind: z.enum(['id', 'matric', 'cv', 'other']),
  filename: z.string().min(1).max(200),
  storagePath: z.string(),
  bytes: z.number().int().positive(),
  mimeType: z.string().optional(),
});

export async function PUT(req: Request) {
  const json = await req.json().catch(() => null);
  const parsed = CommitSchema.safeParse(json);
  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.issues[0]?.message ?? 'Invalid input' }, { status: 400 });
  }
  const row = await recordDocument(parsed.data);
  return NextResponse.json({ ok: true, document: row });
}
