import { NextResponse } from "next/server";
import { z } from "zod";
import { getUserWithRole } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { isAllowedOrigin } from "@/lib/origin";
import { gradeLimiter, ipFromRequest } from "@/lib/ratelimit";

export const runtime = "nodejs";

const BodySchema = z.object({
  submissionId: z.string().uuid(),
  score: z.number().int().min(0).max(1000).nullable(),
  feedback: z.string().max(8000).nullable(),
  status: z.enum(["graded", "returned"]),
});

export async function POST(req: Request) {
  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ error: "Origin not allowed." }, { status: 403 });
  }
  const session = await getUserWithRole();
  if (!session || session.role !== "admin") {
    return NextResponse.json({ error: "Admin only." }, { status: 403 });
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
  const { data, error } = await supabase
    .from("submissions")
    .update({
      score: body.score,
      feedback: body.feedback?.trim() || null,
      status: body.status,
      graded_at: new Date().toISOString(),
    })
    .eq("id", body.submissionId)
    .select("id, score, status, graded_at")
    .single();
  if (error) return NextResponse.json({ error: error.message }, { status: 500 });

  return NextResponse.json(data);
}
