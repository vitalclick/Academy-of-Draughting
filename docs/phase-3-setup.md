# Phase 3 — AI layer setup

The Phase 3 AI features (Claude-powered chatbot, programme recommender, document
OCR) all degrade gracefully when `ANTHROPIC_API_KEY` is missing — the chat
falls back to a hand-off message, the recommender uses a boilerplate rationale,
and OCR returns empty fields. The deterministic scoring layer underneath the
recommender still works without any key.

## 1. Anthropic API key

1. Get an API key from `console.anthropic.com`.
2. Set it server-side:

   ```bash
   ANTHROPIC_API_KEY=sk-ant-...
   ```
3. (Optional) Pin specific models — defaults are sensible:

   ```bash
   ANTHROPIC_MODEL=claude-sonnet-4-6        # chat + recommender rationale
   ANTHROPIC_OCR_MODEL=claude-haiku-4-5-20251001  # cheaper for vision
   ```

## 2. What lights up

### AIDA chatbot
- Endpoint: `POST /api/chat`
- Streams Server-Sent Events with `type: text | effect | tool | error | done`
- System prompt = a single knowledge-base block compiled from
  `src/data/courses.ts` and `src/data/careers.ts` at server start
- Six tools: `lookup_course`, `list_courses`, `get_career_data`,
  `recommend_pathway`, `start_application`, `hand_off_to_human`
- Tool-use loop capped at 4 iterations
- Per-IP rate limit: 20 messages / minute (in-memory token bucket)
- The browser widget consumes the SSE stream and renders any tool effect as a
  CTA inline in the conversation

### Programme recommender
- Endpoint: `POST /api/recommend`
- Deterministic scoring against six programmes; LLM writes a 60-word rationale
- Page: `/career/quiz` (also linked from `/career`)
- Per-IP rate limit: 10 runs / minute

### Document OCR
- Endpoint: `POST /api/applications/ocr` (multipart)
- Claude vision extracts JSON fields from ID or matric images
- Extracted fields auto-fill step 1 of the apply form when the user
  uploads on step 3
- Supports JPEG, PNG, WebP, HEIC up to 6 MB
- Per-IP rate limit: 6 calls / minute

## 3. Tuning the corpus

`src/lib/ai/corpus.ts` compiles the knowledge block. Two ways to extend it:

- Add programmes or careers to `src/data/courses.ts` / `src/data/careers.ts`
  and the corpus picks them up on the next server start.
- For larger corpora (admissions FAQs, employer testimonials, policy docs),
  replace `corpus()` with a retrieval layer — Supabase `pgvector` for
  embeddings, then prepend the top-k chunks before the static block.

## 4. Tool safety

Tools never mutate external systems. The `start_application` tool only
returns a deep link to the apply form — it does **not** create a database
row. The user has to click through and submit themselves, which keeps
adversarial conversations from creating phantom applications.

## 5. Cost expectations (Sonnet 4.6 at list pricing)

| Surface | Avg tokens (in+out) | $ per interaction |
|---|---|---|
| Chat — short Q&A | 1.5K | ~$0.008 |
| Chat — tool-use turn | 4K | ~$0.02 |
| Recommender rationale | 1K | ~$0.005 |
| OCR (Haiku) — single doc | 0.8K | ~$0.0015 |

Heavy traffic? Switch the chat to Haiku for first-pass questions and only
escalate to Sonnet when the conversation crosses a complexity threshold.

## 6. Observability

Every chat turn and recommender completion writes a row to `public.events`
(or `.local-store/events.ndjson` locally). Query the table to see which
programmes the model is recommending, which careers people ask about, and
where conversations bail to human hand-off.
