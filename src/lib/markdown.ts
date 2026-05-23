/**
 * Minimal markdown renderer for trusted admin-authored content.
 *
 * Trusted = authored by signed-in admins, who have already been vetted.
 * We still escape HTML in the body to avoid accidental XSS via copy-paste,
 * then convert a small subset of markdown:
 *   - # / ## / ### headings
 *   - **bold** and *italic*
 *   - inline `code`
 *   - blockquotes (> )
 *   - paragraphs and line breaks
 *   - links [label](url) — http(s) only
 *   - unordered lists (- or *)
 *
 * For richer rendering, swap this for `remark`/`micromark` later.
 */

function escapeHtml(s: string) {
  return s.replace(/[&<>"']/g, (c) =>
    c === '&' ? '&amp;' : c === '<' ? '&lt;' : c === '>' ? '&gt;' : c === '"' ? '&quot;' : '&#39;'
  );
}

function inline(s: string): string {
  return s
    .replace(/`([^`]+)`/g, (_, code) => `<code>${escapeHtml(code)}</code>`)
    .replace(/\*\*([^*]+)\*\*/g, (_, t) => `<strong>${t}</strong>`)
    .replace(/(^|[^*])\*([^*]+)\*/g, (_, p, t) => `${p}<em>${t}</em>`)
    .replace(/\[([^\]]+)\]\((https?:\/\/[^)]+|\/[^)]*)\)/g, (_, label, href) => `<a href="${href}">${label}</a>`);
}

export function renderMarkdown(input: string): string {
  const escaped = escapeHtml(input);
  const lines = escaped.split('\n');
  const out: string[] = [];
  let paragraph: string[] = [];
  let listOpen = false;
  let quoteOpen = false;

  function flushParagraph() {
    if (paragraph.length) {
      out.push(`<p>${inline(paragraph.join(' '))}</p>`);
      paragraph = [];
    }
  }
  function flushList() {
    if (listOpen) {
      out.push('</ul>');
      listOpen = false;
    }
  }
  function flushQuote() {
    if (quoteOpen) {
      out.push('</blockquote>');
      quoteOpen = false;
    }
  }
  function flushAll() {
    flushParagraph();
    flushList();
    flushQuote();
  }

  for (const raw of lines) {
    const line = raw.trimEnd();
    if (!line.trim()) {
      flushAll();
      continue;
    }
    let m: RegExpMatchArray | null;
    if ((m = line.match(/^###\s+(.+)/))) {
      flushAll();
      out.push(`<h3>${inline(m[1])}</h3>`);
      continue;
    }
    if ((m = line.match(/^##\s+(.+)/))) {
      flushAll();
      out.push(`<h2>${inline(m[1])}</h2>`);
      continue;
    }
    if ((m = line.match(/^#\s+(.+)/))) {
      flushAll();
      out.push(`<h1>${inline(m[1])}</h1>`);
      continue;
    }
    if ((m = line.match(/^[-*]\s+(.+)/))) {
      flushParagraph();
      flushQuote();
      if (!listOpen) {
        out.push('<ul>');
        listOpen = true;
      }
      out.push(`<li>${inline(m[1])}</li>`);
      continue;
    }
    if ((m = line.match(/^>\s+(.+)/))) {
      flushParagraph();
      flushList();
      if (!quoteOpen) {
        out.push('<blockquote>');
        quoteOpen = true;
      }
      out.push(`<p>${inline(m[1])}</p>`);
      continue;
    }
    flushList();
    flushQuote();
    paragraph.push(line);
  }
  flushAll();
  return out.join('\n');
}
