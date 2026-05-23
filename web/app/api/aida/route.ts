import { NextResponse } from "next/server";
import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";
import { anthropic, AIDA_MODEL, AIDA_SYSTEM_PROMPT } from "@/lib/anthropic";
import { env } from "@/lib/env";
import { isAllowedOrigin } from "@/lib/origin";
import { aidaLimiter, ipFromRequest } from "@/lib/ratelimit";

export const runtime = "nodejs";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const BodySchema = z.object({
  messages: z.array(MessageSchema).min(1).max(40),
});

export async function POST(req: Request) {
  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ error: "Origin not allowed." }, { status: 403 });
  }
  if (!env().ANTHROPIC_API_KEY) {
    return NextResponse.json(
      { error: "ANTHROPIC_API_KEY is not configured on the server." },
      { status: 503 }
    );
  }

  const ip = ipFromRequest(req);
  const limited = await aidaLimiter().limit(ip);
  if (!limited.success) {
    return NextResponse.json(
      { error: "Too many requests. Slow down for a minute." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  try {
    const result = await anthropic.messages.create({
      model: AIDA_MODEL,
      max_tokens: 512,
      system: AIDA_SYSTEM_PROMPT,
      messages: body.messages,
    });

    const text = result.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    return NextResponse.json({ reply: text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
