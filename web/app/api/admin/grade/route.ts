import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserWithRole } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isAllowedOrigin } from "@/lib/origin";
import { gradeLimiter, ipFromRequest } from "@/lib/ratelimit";
import { sendEmail, gradeFeedbackEmail } from "@/lib/email";
import { env } from "@/lib/env";
import { courses } from "@/data/courses";
import { logAudit } from "@/lib/audit";
import { notifyUser } from "@/lib/notify";

export const runtime = "nodejs";

const BodySchema = z.object({
  submissionId: z.string().uuid(),
  score: z.number().int().min(0).max(100000).nullable(),
  feedback: z.string().max(8000).nullable(),
  status: z.enum(["graded", "returned"]),
  criterionScores: z
    .array(
      z.object({
        criterionId: z.string().uuid(),
        points: z.number().int().min(0).max(1000),
        comment: z.string().max(2000).optional(),
      })
    )
    .max(50)
    .optional(),
});

export async function POST(req: Request) {
  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ error: "Origin not allowed." }, { status: 403 });
  }
  const session = await getUserWithRole();
  if (!session || (session.role !== "admin" && session.role !== "faculty")) {
    return NextResponse.json({ error: "Admin or faculty only." }, { status: 403 });
  }
  const limited = await gradeLimiter().limit(`${session.user.id}:${ipFromRequest(req)}`);
  if (!limited.success) {
    return NextResponse.json({ error: "Too many requests." }, { status: 429 });
  }

  let body: z.infer<typeof BodySchema>;
  try {
    body = BodySchema.parse(await req.json());
  } catch {
    return NextResponse.json({ error: "Invalid request." }, { status: 400 });
  }

  const supabase = getSupabaseAdmin();

  // Rubric path: when criterion scores are supplied, persist them and derive
  // the total score from their sum (overriding any client-sent score).
  let effectiveScore = body.score;
  if (body.criterionScores && body.criterionScores.length) {
    const rows = body.criterionScores.map((c) => ({
      submission_id: body.submissionId,
      criterion_id: c.criterionId,
      points: c.points,
      comment: c.comment?.trim() || null,
    }));
    const { error: scoreErr } = await supabase
      .from("submission_criterion_scores")
      .upsert(rows, { onConflict: "submission_id,criterion_id" });
    if (scoreErr) return NextResponse.json({ error: scoreErr.message }, { status: 500 });
    effectiveScore = body.criterionScores.reduce((sum, c) => sum + c.points, 0);
  }

  const { data, error } = await supabase
    .from("submissions")
    .update({
      score: effectiveScore,
      feedback: body.feedback?.trim() || null,
      status: body.status,
      graded_at: new Date().toISOString(),
    })
    .eq("id", body.submissionId)
    .select(
      "id, score, status, graded_at, user_id, assignment_id, assignments!inner(title, max_score, module_id, modules!inner(course_slug))"
    )
    .single<{
      id: string;
      score: number | null;
      status: "graded" | "returned";
      graded_at: string;
      user_id: string;
      assignment_id: string;
      assignments: {
        title: string;
        max_score: number;
        module_id: string;
        modules: { course_slug: string };
      };
    }>();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  // Fire-and-forget grade email — no-op if Resend isn't configured.
  const { data: profile } = await supabase
    .from("profiles")
    .select("email, full_name")
    .eq("id", data.user_id)
    .maybeSingle();
  if (profile?.email) {
    const courseSlug = data.assignments.modules.course_slug;
    const courseTitle = courses.find((c) => c.slug === courseSlug)?.title ?? courseSlug;
    await sendEmail({
      to: profile.email,
      ...gradeFeedbackEmail({
        fullName: profile.full_name ?? profile.email,
        assignmentTitle: data.assignments.title,
        courseTitle,
        status: data.status,
        score: data.score,
        maxScore: data.assignments.max_score,
        feedback: body.feedback?.trim() || null,
        portalUrl: `${env().NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/portal`,
      }),
    });
  }

  await notifyUser({
    userId: data.user_id,
    kind: data.status === "graded" ? "submission.graded" : "submission.returned",
    title:
      data.status === "graded"
        ? `${data.assignments.title} — graded`
        : `${data.assignments.title} — returned for revision`,
    body:
      data.score != null
        ? `${data.score}/${data.assignments.max_score}`
        : null,
    link: "/portal",
  });

  await logAudit({
    action: "submission.graded",
    entityType: "submission",
    entityId: data.id,
    details: {
      assignment_id: data.assignment_id,
      student_id: data.user_id,
      score: data.score,
      status: data.status,
    },
  });

  return NextResponse.json({
    id: data.id,
    status: data.status,
    score: data.score,
    graded_at: data.graded_at,
  });
}
