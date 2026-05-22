import { z } from 'zod';
import type Anthropic from '@anthropic-ai/sdk';
import { anthropic, MODELS } from '@/lib/ai/anthropic';
import { ADMISSIONS_SYSTEM_PROMPT } from '@/lib/ai/corpus';
import { CHAT_TOOLS, runTool, type ToolEffect } from '@/lib/ai/tools';
import { clientKey, rateLimit } from '@/lib/ai/rate-limit';
import { logEvent } from '@/lib/db/applications';

export const runtime = 'nodejs';

const TurnSchema = z.object({
  role: z.enum(['user', 'assistant']),
  content: z.string().min(1).max(4000),
});

const RequestSchema = z.object({
  messages: z.array(TurnSchema).min(1).max(40),
});

type ChatEvent =
  | { type: 'text'; text: string }
  | { type: 'effect'; effect: ToolEffect }
  | { type: 'tool'; name: string }
  | { type: 'error'; message: string }
  | { type: 'done' };

function encode(ev: ChatEvent): Uint8Array {
  return new TextEncoder().encode(`data: ${JSON.stringify(ev)}\n\n`);
}

export async function POST(req: Request) {
  const key = clientKey(req.headers);
  const limit = rateLimit(`chat:${key}`, 20, 20);
  if (!limit.ok) {
    return new Response(JSON.stringify({ error: 'rate_limited', retryAfter: limit.retryAfter }), {
      status: 429,
      headers: {
        'Content-Type': 'application/json',
        'Retry-After': String(limit.retryAfter),
      },
    });
  }

  let json: unknown;
  try {
    json = await req.json();
  } catch {
    return Response.json({ error: 'invalid_json' }, { status: 400 });
  }
  const parsed = RequestSchema.safeParse(json);
  if (!parsed.success) {
    return Response.json({ error: 'invalid_payload', detail: parsed.error.issues }, { status: 400 });
  }

  const client = anthropic();
  if (!client) {
    return streamFallback();
  }

  const stream = new ReadableStream<Uint8Array>({
    async start(controller) {
      try {
        await runConversation(client, parsed.data.messages, controller);
      } catch (err) {
        const message = err instanceof Error ? err.message : 'chat error';
        console.error('[chat]', err);
        controller.enqueue(encode({ type: 'error', message }));
      } finally {
        controller.enqueue(encode({ type: 'done' }));
        controller.close();
      }
    },
  });

  return new Response(stream, {
    headers: {
      'Content-Type': 'text/event-stream; charset=utf-8',
      'Cache-Control': 'no-store, no-transform',
      Connection: 'keep-alive',
    },
  });
}

async function runConversation(
  client: Anthropic,
  initial: { role: 'user' | 'assistant'; content: string }[],
  controller: ReadableStreamDefaultController<Uint8Array>
) {
  const messages: Anthropic.MessageParam[] = initial.map((m) => ({ role: m.role, content: m.content }));

  // Cap tool-use iterations to keep latency bounded and prevent runaway loops.
  const MAX_TURNS = 4;

  for (let turn = 0; turn < MAX_TURNS; turn++) {
    const toolUses: { id: string; name: string; input: unknown }[] = [];

    const sdkStream = client.messages.stream({
      model: MODELS.chat(),
      max_tokens: 800,
      system: ADMISSIONS_SYSTEM_PROMPT,
      tools: CHAT_TOOLS,
      messages,
    });

    for await (const event of sdkStream) {
      if (event.type === 'content_block_start' && event.content_block.type === 'tool_use') {
        controller.enqueue(encode({ type: 'tool', name: event.content_block.name }));
      }
      if (event.type === 'content_block_delta') {
        if (event.delta.type === 'text_delta') {
          controller.enqueue(encode({ type: 'text', text: event.delta.text }));
        }
      }
    }

    const final = await sdkStream.finalMessage();
    for (const block of final.content) {
      if (block.type === 'tool_use') {
        toolUses.push({ id: block.id, name: block.name, input: block.input });
      }
    }

    if (final.stop_reason !== 'tool_use' || toolUses.length === 0) {
      logChatEvent('chat_message', { tokens: final.usage?.output_tokens ?? 0 });
      return;
    }

    // Assistant turn was a tool_use; build the next turn with the tool_results
    messages.push({ role: 'assistant', content: final.content });

    const toolResults: Anthropic.ToolResultBlockParam[] = toolUses.map((tu) => {
      const result = runTool(tu.name, tu.input);
      if (result.effect) controller.enqueue(encode({ type: 'effect', effect: result.effect }));
      return { type: 'tool_result', tool_use_id: tu.id, content: result.content };
    });
    messages.push({ role: 'user', content: toolResults });
  }

  // hit the iteration cap; bow out gracefully
  controller.enqueue(
    encode({
      type: 'text',
      text: '\n\n(Conversation is getting long — let me hand you to a human admissions officer.)',
    })
  );
  controller.enqueue(
    encode({ type: 'effect', effect: { kind: 'cta-handoff', reason: 'iteration_cap' } })
  );
}

function streamFallback() {
  // Scripted, single-shot fallback when ANTHROPIC_API_KEY is absent.
  const text =
    "I'm AIDA — the live AI assistant isn't configured in this environment, but our admissions team can help directly. Tap “Talk to admissions” to reach a human, or browse the programmes to see what fits.";
  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      controller.enqueue(encode({ type: 'text', text }));
      controller.enqueue(
        encode({ type: 'effect', effect: { kind: 'cta-handoff', reason: 'ai_disabled' } })
      );
      controller.enqueue(encode({ type: 'done' }));
      controller.close();
    },
  });
  return new Response(stream, {
    headers: { 'Content-Type': 'text/event-stream; charset=utf-8', 'Cache-Control': 'no-store' },
  });
}

function logChatEvent(name: string, payload: Record<string, unknown>) {
  // Fire-and-forget; never throw to the stream.
  logEvent({
    name,
    applicant_id: null,
    application_id: null,
    anonymous_id: null,
    session_id: null,
    payload,
  }).catch(() => {});
}
