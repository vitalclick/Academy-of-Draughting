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

export const runtime = "nodejs";

const MessageSchema = z.object({
  role: z.enum(["user", "assistant"]),
  content: z.string().min(1).max(4000),
});

const BodySchema = z.object({
  messages: z.array(MessageSchema).min(1).max(40),
  assignmentId: z.string().uuid().optional(),
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

    return NextResponse.json({ reply: text });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 502 });
  }
}
