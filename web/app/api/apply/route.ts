import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { getSessionUser } from "@/lib/supabase/server";
import { env } from "@/lib/env";
import { isAllowedOrigin } from "@/lib/origin";
import { applyLimiter, ipFromRequest } from "@/lib/ratelimit";
import { applicationReceivedEmail, sendEmail } from "@/lib/email";

export const runtime = "nodejs";

const ApplicationSchema = z.object({
  fullName: z.string().min(2).max(120),
  email: z.string().email().max(200),
  phone: z.string().min(7).max(30),
  courseSlug: z.string().min(2).max(60),
  studyMode: z.enum(["full-time", "evening", "online"]),
  prevQualification: z.string().max(200).optional(),
  notes: z.string().max(2000).optional(),
});

export type ApplicationInput = z.infer<typeof ApplicationSchema>;

export async function POST(req: Request) {
  if (!isAllowedOrigin(req)) {
    return NextResponse.json({ error: "Origin not allowed." }, { status: 403 });
  }

  const ip = ipFromRequest(req);
  const limited = await applyLimiter().limit(ip);
  if (!limited.success) {
    return NextResponse.json(
      { error: "Too many applications from this address. Try again later." },
      { status: 429, headers: { "Retry-After": "600" } }
    );
  }

  let input: ApplicationInput;
  try {
    input = ApplicationSchema.parse(await req.json());
  } catch (err) {
    const issues = err instanceof z.ZodError ? err.flatten() : null;
    return NextResponse.json({ error: "Validation failed.", issues }, { status: 400 });
  }

  // Optional: associate the submission with the signed-in user.
  let userId: string | null = null;
  try {
    const user = await getSessionUser();
    if (user) userId = user.id;
  } catch {
    // Supabase public env may be missing in dev — that's fine.
  }

  try {
    const supabase = getSupabaseAdmin();
    const { data, error } = await supabase
      .from("applications")
      .insert({
        full_name: input.fullName,
        email: input.email,
        phone: input.phone,
        course_slug: input.courseSlug,
        study_mode: input.studyMode,
        prev_qualification: input.prevQualification ?? null,
        notes: input.notes ?? null,
        status: "received",
        user_id: userId,
      })
      .select("id")
      .single();

    if (error) throw error;

    // Fire-and-await notifications. Failures don't block the response.
    await notify(input, data.id).catch(() => undefined);

    return NextResponse.json({ id: data.id, status: "received" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}

async function notify(input: ApplicationInput, id: string) {
  const e = env();
  const applicantMail = applicationReceivedEmail({
    fullName: input.fullName,
    courseSlug: input.courseSlug,
    id,
  });
  await sendEmail({ to: input.email, ...applicantMail });

  if (e.ADMISSIONS_NOTIFY_EMAIL) {
    await sendEmail({
      to: e.ADMISSIONS_NOTIFY_EMAIL,
      subject: `New application — ${input.fullName} · ${input.courseSlug}`,
      html: `<p><strong>${input.fullName}</strong> applied for <strong>${input.courseSlug}</strong> (${input.studyMode}).</p>
        <p>Email: ${input.email}<br/>Phone: ${input.phone}</p>
        <p>Reference: <code>${id}</code></p>`,
    });
  }
}
