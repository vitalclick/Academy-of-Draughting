import { anthropic, MODELS } from '@/lib/ai/anthropic';
import { clientKey, rateLimit } from '@/lib/ai/rate-limit';

export const runtime = 'nodejs';

const MAX_BYTES = 6 * 1024 * 1024;

const ID_PROMPT = `You are extracting fields from a South African ID document image. Return ONLY a JSON object — no prose, no markdown — with these keys (use null when the field is not legible):
{
  "id_number": "string of 13 digits or null",
  "full_name": "string or null",
  "date_of_birth": "ISO 8601 date or null",
  "gender": "M | F | null",
  "citizenship": "string or null"
}

If the image is not an ID document, return {"error": "not_an_id"}.`;

const MATRIC_PROMPT = `You are extracting fields from a South African matric / Grade 12 certificate image. Return ONLY a JSON object — no prose, no markdown:
{
  "full_name": "string or null",
  "matric_year": "4-digit year or null",
  "school": "string or null",
  "aggregate": "string description (e.g. 'L5 · Bachelor pass') or null",
  "mathematics": "string description or null"
}

If the image is not a matric certificate, return {"error": "not_a_matric"}.`;

function extractJson(text: string): unknown {
  const start = text.indexOf('{');
  const end = text.lastIndexOf('}');
  if (start === -1 || end === -1) return null;
  try {
    return JSON.parse(text.slice(start, end + 1));
  } catch {
    return null;
  }
}

export async function POST(req: Request) {
  const key = clientKey(req.headers);
  const limit = rateLimit(`ocr:${key}`, 6, 6);
  if (!limit.ok) {
    return Response.json({ error: 'rate_limited' }, { status: 429 });
  }

  const ct = req.headers.get('content-type') ?? '';
  if (!ct.startsWith('multipart/form-data')) {
    return Response.json({ error: 'expected_multipart' }, { status: 400 });
  }

  const form = await req.formData();
  const file = form.get('file');
  const kind = String(form.get('kind') ?? '');
  if (!(file instanceof File)) return Response.json({ error: 'no_file' }, { status: 400 });
  if (kind !== 'id' && kind !== 'matric') {
    return Response.json({ error: 'invalid_kind' }, { status: 400 });
  }
  if (file.size > MAX_BYTES) {
    return Response.json({ error: 'file_too_large' }, { status: 413 });
  }
  const mime = file.type;
  if (!['image/jpeg', 'image/png', 'image/webp', 'image/heic'].includes(mime)) {
    return Response.json({ error: 'unsupported_type' }, { status: 415 });
  }

  const client = anthropic();
  if (!client) {
    // Fallback: pretend OCR with empty fields. Lets the UI flow without LLM access.
    return Response.json({ ok: true, mocked: true, fields: {} });
  }

  const bytes = Buffer.from(await file.arrayBuffer()).toString('base64');
  const prompt = kind === 'id' ? ID_PROMPT : MATRIC_PROMPT;

  try {
    const msg = await client.messages.create({
      model: MODELS.ocr(),
      max_tokens: 600,
      messages: [
        {
          role: 'user',
          content: [
            {
              type: 'image',
              source: { type: 'base64', media_type: mime as 'image/jpeg', data: bytes },
            },
            { type: 'text', text: prompt },
          ],
        },
      ],
    });
    const text = msg.content
      .filter((b): b is Extract<typeof b, { type: 'text' }> => b.type === 'text')
      .map((b) => b.text)
      .join('');
    const parsed = extractJson(text);
    if (!parsed || typeof parsed !== 'object') {
      return Response.json({ ok: false, error: 'parse_failed' }, { status: 502 });
    }
    return Response.json({ ok: true, mocked: false, fields: parsed });
  } catch (err) {
    console.error('[ocr]', err);
    return Response.json({ ok: false, error: 'ocr_failed' }, { status: 502 });
  }
}
