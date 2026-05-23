'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { currentAdmin } from '@/lib/auth/admin';
import { upsertContent, patchContent, getContent } from '@/lib/db/admin';
import { logEvent } from '@/lib/db/applications';
import { anthropic, MODELS } from '@/lib/ai/anthropic';
import { corpus } from '@/lib/ai/corpus';
import { features } from '@/lib/env';
import type { ContentKind, ContentState } from '@/types/database';

const Schema = z.object({
  id: z.string().uuid().optional(),
  kind: z.enum(['blog_post', 'faq', 'testimonial', 'page_section']),
  state: z.enum(['draft', 'review', 'published', 'archived']),
  title: z.string().min(2).max(200),
  slug: z.string().max(120).optional(),
  summary: z.string().max(400).optional(),
  body: z.string().max(20_000).optional(),
  ai_prompt: z.string().optional(),
  ai_model: z.string().optional(),
});

export type SaveResult =
  | { ok: true; id: string }
  | { ok: false; error: string };

export async function saveContentAction(input: unknown): Promise<SaveResult> {
  const admin = await currentAdmin();
  if (!admin) return { ok: false, error: 'Not authenticated' };
  const parsed = Schema.safeParse(input);
  if (!parsed.success) {
    return { ok: false, error: parsed.error.issues[0]?.message ?? 'Invalid input' };
  }

  try {
    const row = await upsertContent({
      ...parsed.data,
      author_id: admin.userId,
      slug: parsed.data.slug ?? null,
      summary: parsed.data.summary ?? null,
      body: parsed.data.body ?? null,
      ai_prompt: parsed.data.ai_prompt ?? null,
      ai_model: parsed.data.ai_model ?? null,
    });

    await logEvent({
      name: 'content_saved',
      applicant_id: null,
      application_id: null,
      anonymous_id: null,
      session_id: null,
      payload: { id: row.id, kind: row.kind, state: row.state, by: admin.email },
    }).catch(() => {});

    revalidatePath('/admin/content');
    revalidatePath(`/admin/content/${row.id}`);
    if (row.state === 'published') {
      revalidatePath('/blog');
      if (row.slug) revalidatePath(`/blog/${row.slug}`);
    }
    return { ok: true, id: row.id };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'save failed' };
  }
}

const DraftSchema = z.object({
  kind: z.enum(['blog_post', 'faq', 'testimonial', 'page_section']),
  prompt: z.string().min(8).max(2000),
});

const PROMPT_PREAMBLE: Record<ContentKind, string> = {
  blog_post: `You are drafting a blog post for The Academy of Advanced Draughting. Voice: direct, technical, warm. South African English. No emojis. No bullet-soup.
Structure: a strong opening paragraph, then a few markdown headings (## Heading) with substantive paragraphs under each. Aim for 500–700 words.
Return STRICTLY this JSON shape — no surrounding prose:
{
  "title": "string",
  "slug": "kebab-case-slug",
  "summary": "1-2 sentence meta description",
  "body": "markdown body (no front matter)"
}`,
  faq: `You are writing a single FAQ entry for The Academy of Advanced Draughting. Voice: direct, warm, factual. Use only facts from the knowledge base — if the answer isn't there, return {"error":"unknown"}.
Return STRICTLY:
{
  "title": "the question (1 sentence, ends with ?)",
  "summary": "optional category label or null",
  "body": "the answer in 1–3 short paragraphs, markdown"
}`,
  testimonial: `You are drafting a *plausible* graduate testimonial for editorial inspiration only — admissions will check accuracy with the named graduate before publishing.
Return STRICTLY:
{
  "title": "Graduate name and role (e.g. 'Thandi Mokoena · BIM Coordinator at WSP')",
  "summary": "1 sentence about the graduate's pathway",
  "body": "120–180 word quote, first person, markdown"
}`,
  page_section: `You are drafting a marketing page section for The Academy of Advanced Draughting.
Return STRICTLY:
{
  "title": "Section heading",
  "summary": "1-sentence eyebrow or kicker",
  "body": "Section body in markdown, with 1-2 subheadings if useful"
}`,
};

export type DraftResult =
  | {
      ok: true;
      title: string;
      slug?: string;
      summary?: string;
      body: string;
      model: string;
    }
  | { ok: false; error: string };

export async function generateDraftAction(input: unknown): Promise<DraftResult> {
  const admin = await currentAdmin();
  if (!admin) return { ok: false, error: 'Not authenticated' };
  const parsed = DraftSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Invalid input' };

  if (!features.ai) {
    // Fallback when Claude isn't configured — return a stub draft.
    return {
      ok: true,
      title: `Draft: ${parsed.data.prompt.slice(0, 60)}`,
      slug: parsed.data.prompt
        .toLowerCase()
        .replace(/[^a-z0-9]+/g, '-')
        .replace(/^-|-$/g, '')
        .slice(0, 60),
      summary: 'AI draft unavailable — Anthropic key not configured.',
      body: `> The AI Content Studio is not configured in this environment. Set \`ANTHROPIC_API_KEY\` to enable Claude-drafted content. Until then, the editor still works as a regular CMS — write the body manually below.\n\n## ${parsed.data.prompt}\n\nFill in the rest of the post here.`,
      model: 'fallback',
    };
  }

  const client = anthropic();
  if (!client) return { ok: false, error: 'AI client unavailable' };

  const system = `${PROMPT_PREAMBLE[parsed.data.kind as ContentKind]}\n\nKnowledge base (use as the source of truth):\n\n${corpus()}`;

  try {
    const msg = await client.messages.create({
      model: MODELS.chat(),
      max_tokens: 1800,
      system,
      messages: [{ role: 'user', content: parsed.data.prompt }],
    });
    const text = msg.content
      .filter((b): b is Extract<typeof b, { type: 'text' }> => b.type === 'text')
      .map((b) => b.text)
      .join('');
    const start = text.indexOf('{');
    const end = text.lastIndexOf('}');
    if (start === -1 || end === -1) return { ok: false, error: 'Model did not return JSON' };
    const json = JSON.parse(text.slice(start, end + 1)) as {
      title?: string;
      slug?: string;
      summary?: string;
      body?: string;
      error?: string;
    };
    if (json.error || !json.title || !json.body) {
      return { ok: false, error: json.error ?? 'Model returned an empty draft' };
    }
    return {
      ok: true,
      title: json.title,
      slug: json.slug,
      summary: json.summary,
      body: json.body,
      model: MODELS.chat(),
    };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'AI generation failed' };
  }
}

export async function changeStateAction(args: {
  id: string;
  state: ContentState;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await currentAdmin();
  if (!admin) return { ok: false, error: 'Not authenticated' };
  try {
    const row = await patchContent(args.id, {
      state: args.state,
      published_at: args.state === 'published' ? new Date().toISOString() : null,
    });
    if (!row) return { ok: false, error: 'Not found' };
    await logEvent({
      name: 'content_state_changed',
      applicant_id: null,
      application_id: null,
      anonymous_id: null,
      session_id: null,
      payload: { id: row.id, kind: row.kind, to: args.state, by: admin.email },
    }).catch(() => {});
    revalidatePath('/admin/content');
    revalidatePath(`/admin/content/${row.id}`);
    revalidatePath('/blog');
    if (row.slug) revalidatePath(`/blog/${row.slug}`);
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'state change failed' };
  }
}

export async function deleteContentAction(id: string): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await currentAdmin();
  if (!admin) return { ok: false, error: 'Not authenticated' };
  const existing = await getContent(id);
  if (!existing) return { ok: false, error: 'Not found' };
  // Soft delete by archiving — we don't actually remove rows.
  await patchContent(id, { state: 'archived' });
  revalidatePath('/admin/content');
  return { ok: true };
}
