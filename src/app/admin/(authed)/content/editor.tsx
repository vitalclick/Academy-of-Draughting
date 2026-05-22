'use client';

import { useRouter } from 'next/navigation';
import { useState, useTransition } from 'react';
import { saveContentAction, generateDraftAction, changeStateAction } from './actions';
import type { ContentBlockRow, ContentKind, ContentState } from '@/types/database';

const KIND_OPTIONS: { value: ContentKind; label: string }[] = [
  { value: 'blog_post', label: 'Blog post' },
  { value: 'faq', label: 'FAQ' },
  { value: 'testimonial', label: 'Testimonial' },
  { value: 'page_section', label: 'Page section' },
];

const STATE_OPTIONS: { value: ContentState; label: string }[] = [
  { value: 'draft', label: 'Draft' },
  { value: 'review', label: 'In review' },
  { value: 'published', label: 'Published' },
];

function slugify(s: string) {
  return s
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, '-')
    .replace(/^-|-$/g, '')
    .slice(0, 80);
}

export function ContentEditor({ initial }: { initial?: ContentBlockRow }) {
  const router = useRouter();
  const [pending, startTransition] = useTransition();
  const [draftPending, setDraftPending] = useState(false);

  const [kind, setKind] = useState<ContentKind>(initial?.kind ?? 'blog_post');
  const [title, setTitle] = useState(initial?.title ?? '');
  const [slug, setSlug] = useState(initial?.slug ?? '');
  const [summary, setSummary] = useState(initial?.summary ?? '');
  const [body, setBody] = useState(initial?.body ?? '');
  const [state, setState] = useState<ContentState>(initial?.state ?? 'draft');
  const [prompt, setPrompt] = useState('');
  const [aiModel, setAiModel] = useState(initial?.ai_model ?? '');
  const [aiPrompt, setAiPrompt] = useState(initial?.ai_prompt ?? '');
  const [message, setMessage] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  async function generate() {
    if (!prompt.trim()) return;
    setDraftPending(true);
    setError(null);
    setMessage(null);
    const result = await generateDraftAction({ kind, prompt });
    setDraftPending(false);
    if (!result.ok) {
      setError(result.error);
      return;
    }
    setTitle(result.title);
    if (result.slug) setSlug(result.slug);
    if (result.summary) setSummary(result.summary);
    setBody(result.body);
    setAiPrompt(prompt);
    setAiModel(result.model);
    setMessage('Draft generated. Review and save when you are happy.');
  }

  function save(nextState?: ContentState) {
    const finalState = nextState ?? state;
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await saveContentAction({
        id: initial?.id,
        kind,
        state: finalState,
        title,
        slug: slug || undefined,
        summary: summary || undefined,
        body: body || undefined,
        ai_prompt: aiPrompt || undefined,
        ai_model: aiModel || undefined,
      });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setState(finalState);
      setMessage(finalState === 'published' ? 'Published — public pages revalidated.' : 'Saved.');
      if (!initial) router.push(`/admin/content/${result.id}`);
      else router.refresh();
    });
  }

  async function changeState(next: ContentState) {
    if (!initial) {
      setError('Save the draft before changing its state.');
      return;
    }
    setError(null);
    setMessage(null);
    startTransition(async () => {
      const result = await changeStateAction({ id: initial.id, state: next });
      if (!result.ok) {
        setError(result.error);
        return;
      }
      setState(next);
      setMessage(`State → ${next}.`);
      router.refresh();
    });
  }

  return (
    <div className="content-editor">
      <div className="content-editor-grid">
        <div>
          <section className="content-editor-block">
            <label className="t-mono-xs">KIND</label>
            <div className="admin-filter-row">
              {KIND_OPTIONS.map((k) => (
                <button
                  key={k.value}
                  type="button"
                  className={`filter-chip ${kind === k.value ? 'is-active' : ''}`}
                  onClick={() => setKind(k.value)}
                  disabled={Boolean(initial)}
                >
                  {k.label}
                </button>
              ))}
            </div>
          </section>

          <section className="content-editor-block">
            <label className="t-mono-xs" htmlFor="ce-title">
              TITLE
            </label>
            <input
              id="ce-title"
              type="text"
              value={title}
              onChange={(e) => {
                setTitle(e.target.value);
                if (!slug || slug === slugify(title)) setSlug(slugify(e.target.value));
              }}
              placeholder="Title"
            />
          </section>

          {kind === 'blog_post' && (
            <section className="content-editor-block">
              <label className="t-mono-xs" htmlFor="ce-slug">
                SLUG
              </label>
              <input
                id="ce-slug"
                type="text"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                placeholder="url-slug"
              />
              <span className="hint">Public URL: /blog/{slug || 'your-slug'}</span>
            </section>
          )}

          <section className="content-editor-block">
            <label className="t-mono-xs" htmlFor="ce-summary">
              SUMMARY · META DESCRIPTION
            </label>
            <input
              id="ce-summary"
              type="text"
              value={summary}
              onChange={(e) => setSummary(e.target.value)}
              maxLength={200}
              placeholder="One-sentence summary"
            />
          </section>

          <section className="content-editor-block">
            <label className="t-mono-xs" htmlFor="ce-body">
              BODY · MARKDOWN
            </label>
            <textarea
              id="ce-body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              rows={20}
              spellCheck
            />
          </section>
        </div>

        <aside>
          <section className="content-editor-block content-editor-ai">
            <span className="t-mono-xs" style={{ color: 'var(--blue-500)' }}>
              AI DRAFT · CLAUDE
            </span>
            <h3 style={{ margin: '6px 0 12px', fontSize: 17, fontWeight: 500 }}>
              Generate a first cut
            </h3>
            <textarea
              value={prompt}
              onChange={(e) => setPrompt(e.target.value)}
              placeholder={
                kind === 'blog_post'
                  ? 'e.g. "An honest look at career outcomes for Mechanical Draughtspeople in 2026 across SA mining and manufacturing"'
                  : kind === 'faq'
                    ? 'Question to answer (e.g. "Can I study MDDOP if I failed maths?")'
                    : kind === 'testimonial'
                      ? 'Graduate role, year, and what changed for them'
                      : 'Section topic (e.g. "Why our cohort sizes stay small")'
              }
              rows={6}
            />
            <button
              type="button"
              className="btn btn-sm btn-primary"
              onClick={generate}
              disabled={draftPending || !prompt.trim()}
              style={{ marginTop: 10, width: '100%' }}
            >
              {draftPending ? 'Drafting…' : 'Draft with Claude'}
            </button>
            {aiPrompt && (
              <div className="t-mono-xs" style={{ color: 'var(--ink-4)', marginTop: 12 }}>
                LAST PROMPT · {aiPrompt.slice(0, 120)}
                {aiPrompt.length > 120 ? '…' : ''}
              </div>
            )}
          </section>

          <section className="content-editor-block">
            <label className="t-mono-xs">STATE</label>
            <div className="admin-filter-row">
              {STATE_OPTIONS.map((s) => (
                <button
                  key={s.value}
                  type="button"
                  className={`filter-chip ${state === s.value ? 'is-active' : ''}`}
                  onClick={() => (initial ? changeState(s.value) : setState(s.value))}
                  disabled={pending}
                >
                  {s.label}
                </button>
              ))}
            </div>
          </section>

          <section className="content-editor-block">
            <button
              type="button"
              className="btn btn-primary"
              onClick={() => save()}
              disabled={pending || !title.trim()}
              style={{ width: '100%' }}
            >
              {pending ? 'Saving…' : initial ? 'Save changes' : 'Save draft'}
            </button>
            {state !== 'published' && (
              <button
                type="button"
                className="btn btn-ghost-light"
                onClick={() => save('published')}
                disabled={pending || !title.trim() || !body.trim()}
                style={{ width: '100%', marginTop: 8 }}
              >
                Publish now
              </button>
            )}
            {message && (
              <div className="apply-banner apply-banner-success" role="status" style={{ marginTop: 12 }}>
                {message}
              </div>
            )}
            {error && (
              <div className="apply-banner apply-banner-error" role="alert" style={{ marginTop: 12 }}>
                {error}
              </div>
            )}
          </section>
        </aside>
      </div>
    </div>
  );
}
