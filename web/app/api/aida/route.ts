import { NextResponse } from "next/server";
import { z } from "zod";
import type Anthropic from "@anthropic-ai/sdk";
import {
  anthropic,
  AIDA_MODEL,
  AIDA_SYSTEM_PROMPT,
  TUTOR_SYSTEM_PROMPT,
} from "@/lib/anthropic";
import { env } from "@/lib/env";
import { isAllowedOrigin } from "@/lib/origin";
import { aidaLimiter, ipFromRequest } from "@/lib/ratelimit";
import { getSessionUser } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { courses } from "@/data/courses";
import { moderateAidaMessages } from "@/lib/aida-moderation";
import { log } from "@/lib/log";

export const runtime = "nodejs";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const BodySchema = z.object({
  messages: z.array(MessageSchema).min(1).max(40),
  assignmentId: z.string().uuid().optional(),
  conversationId: z.string().uuid().optional(),
});

type AssignmentContext = {
  courseTitle: string;
  moduleTitle: string;
  moduleDescription: string | null;
  assignmentTitle: string;
  assignmentDescription: string | null;
  maxScore: number;
};

async function loadAssignmentContext(
  assignmentId: string,
  userId: string
): Promise<{ context: AssignmentContext } | { error: string; status: number }> {
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("assignments")
    .select(
      "id, title, description, max_score, module_id, modules!inner(title, description, course_slug)"
    )
    .eq("id", assignmentId)
    .is("deleted_at", null)
    .maybeSingle<{
      id: string;
      title: string;
      description: string | null;
      max_score: number;
      module_id: string;
      modules: { title: string; description: string | null; course_slug: string };
    }>();
  if (error) return { error: error.message, status: 500 };
  if (!data) return { error: "Assignment not found.", status: 404 };

  const courseSlug = data.modules.course_slug;
  const { data: enrollment } = await supabase
    .from("enrollments")
    .select("id")
    .eq("user_id", userId)
    .eq("course_slug", courseSlug)
    .eq("status", "active")
    .maybeSingle();
  if (!enrollment) {
    return { error: "You are not enrolled in this course.", status: 403 };
  }

  return {
    context: {
      courseTitle: courses.find((c) => c.slug === courseSlug)?.title ?? courseSlug,
      moduleTitle: data.modules.title,
      moduleDescription: data.modules.description,
      assignmentTitle: data.title,
      assignmentDescription: data.description,
      maxScore: data.max_score,
    },
  };
}

function buildTutorSystem(ctx: AssignmentContext): string {
  return [
    TUTOR_SYSTEM_PROMPT,
    "",
    "Current assignment context — keep your help scoped to this:",
    `Course: ${ctx.courseTitle}`,
    `Module: ${ctx.moduleTitle}${ctx.moduleDescription ? ` — ${ctx.moduleDescription}` : ""}`,
    `Assignment: ${ctx.assignmentTitle}${ctx.assignmentDescription ? ` — ${ctx.assignmentDescription}` : ""}`,
    `Max score: ${ctx.maxScore}`,
  ].join("\n");
}

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

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request body." }, { status: 400 });
  }

  const mod = moderateAidaMessages(body.messages);
  if (!mod.ok) {
    log.warn("aida.moderation_block", { reason: mod.reason, detail: mod.detail });
    if (mod.reason === "suspicious") {
      return NextResponse.json(
        {
          error:
            "I can't help with that. If you have a real question about the assignment or your application, ask it directly.",
        },
        { status: 400 }
      );
    }
    if (mod.reason === "too_long") {
      return NextResponse.json({ error: "Message too long." }, { status: 413 });
    }
    return NextResponse.json({ error: "Message cannot be empty." }, { status: 400 });
  }

  let system = AIDA_SYSTEM_PROMPT;
  let maxTokens = 512;
  let limitKey = ipFromRequest(req);

  if (body.assignmentId) {
    const user = await getSessionUser();
    if (!user) {
      return NextResponse.json({ error: "Sign in to use the tutor." }, { status: 401 });
    }
    const loaded = await loadAssignmentContext(body.assignmentId, user.id);
    if ("error" in loaded) {
      return NextResponse.json({ error: loaded.error }, { status: loaded.status });
    }
    system = buildTutorSystem(loaded.context);
    maxTokens = 768;
    limitKey = `tutor:${user.id}`;
  }

  const limited = await aidaLimiter().limit(limitKey);
  if (!limited.success) {
    return NextResponse.json(
      { error: "Too many requests. Slow down for a minute." },
      { status: 429, headers: { "Retry-After": "60" } }
    );
  }

  try {
    const result = await anthropic.messages.create({
      model: AIDA_MODEL,
      max_tokens: maxTokens,
      system,
      messages: body.messages,
    });

    const text = result.content
      .filter((block): block is Anthropic.TextBlock => block.type === "text")
      .map((b) => b.text)
      .join("\n")
      .trim();

    // Persist conversation history when signed in. Fire-and-forget — never
    // block the chat response on the audit write.
    const user = await getSessionUser().catch(() => null);
    let conversationId: string | null = body.conversationId ?? null;
    if (user) {
      try {
        const admin = getSupabaseAdmin();
        if (!conversationId) {
          const { data: conv } = await admin
            .from("ai_conversations")
            .insert({
              user_id: user.id,
              scope_type: body.assignmentId ? "tutor" : "admissions",
              scope_id: body.assignmentId ?? null,
              title: body.messages[0]?.content.slice(0, 80) ?? null,
            })
            .select("id")
            .single();
          conversationId = conv?.id ?? null;
        }
        if (conversationId) {
          const lastUser = [...body.messages].reverse().find((m) => m.role === "user");
          const rows: { conversation_id: string; role: "user" | "assistant"; content: string }[] = [];
          if (lastUser) rows.push({ conversation_id: conversationId, role: "user", content: lastUser.content });
          if (text) rows.push({ conversation_id: conversationId, role: "assistant", content: text });
          if (rows.length) await admin.from("ai_messages").insert(rows);
        }
      } catch (err) {
        log.warn("aida.history_write_failed", { err: String(err) });
      }
    }

    return NextResponse.json({ reply: text, conversationId });
  } catch (err) {
    log.error("aida.upstream_failed", { err: err instanceof Error ? err.message : String(err) });
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
