"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getUserWithRole } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import { sendEmail, enrollmentWelcomeEmail } from "@/lib/email";
import { courses } from "@/data/courses";

const StatusSchema = z.enum(["received", "reviewing", "accepted", "rejected", "withdrawn"]);
const EnrollmentStatusSchema = z.enum(["active", "completed", "withdrawn"]);
const EmailSchema = z.string().email().max(254);
const SlugSchema = z
  .string()
  .min(2)
  .max(80)
  .regex(/^[a-z0-9-]+$/, "Invalid course slug");

function portalUrl(): string {
  return `${env().NEXT_PUBLIC_SITE_URL.replace(/\/$/, "")}/portal`;
}

function courseTitle(slug: string): string {
  return courses.find((c) => c.slug === slug)?.title ?? slug;
}

async function requireAdmin() {
  const session = await getUserWithRole();
  if (!session || session.role !== "admin") throw new Error("Not authorized");
  return session;
}

export async function setApplicationStatus(id: string, status: string) {
  await requireAdmin();
  const parsed = StatusSchema.safeParse(status);
  if (!parsed.success) throw new Error("Invalid status");

  const supabase = getSupabaseAdmin();
  const { data: existing, error: readErr } = await supabase
    .from("applications")
    .select("id, status, user_id, course_slug, full_name, email")
    .eq("id", id)
    .maybeSingle();
  if (readErr) throw new Error(readErr.message);
  if (!existing) throw new Error("Application not found");

  const { error: updErr } = await supabase
    .from("applications")
    .update({ status: parsed.data })
    .eq("id", id);
  if (updErr) throw new Error(updErr.message);

  if (
    parsed.data === "accepted" &&
    existing.status !== "accepted" &&
    existing.user_id
  ) {
    const { data: enrollment } = await supabase
      .from("enrollments")
      .select("cohort_label")
      .eq("user_id", existing.user_id)
      .eq("course_slug", existing.course_slug)
      .maybeSingle();
    await sendEmail({
      to: existing.email,
      ...enrollmentWelcomeEmail({
        fullName: existing.full_name,
        courseTitle: courseTitle(existing.course_slug),
        cohortLabel: enrollment?.cohort_label ?? null,
        portalUrl: portalUrl(),
      }),
    });
  }

  revalidatePath(`/admin/applications/${id}`);
  revalidatePath("/admin");
  revalidatePath("/admin/cohorts");
}

export async function linkApplicationToUser(id: string, email: string) {
  await requireAdmin();
  const parsedEmail = EmailSchema.safeParse(email.trim().toLowerCase());
  if (!parsedEmail.success) throw new Error("Invalid email");

  const supabase = getSupabaseAdmin();
  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("id, email")
    .eq("email", parsedEmail.data)
    .maybeSingle();
  if (pErr) throw new Error(pErr.message);
  if (!profile) {
    throw new Error(
      `No account found for ${parsedEmail.data}. Ask the applicant to sign up first, then retry.`
    );
  }

  const { error: updErr } = await supabase
    .from("applications")
    .update({ user_id: profile.id })
    .eq("id", id);
  if (updErr) throw new Error(updErr.message);

  revalidatePath(`/admin/applications/${id}`);
  revalidatePath("/admin");
}

export async function manualEnroll(args: {
  email: string;
  courseSlug: string;
  cohortLabel?: string;
}) {
  await requireAdmin();
  const email = EmailSchema.parse(args.email.trim().toLowerCase());
  const courseSlug = SlugSchema.parse(args.courseSlug);
  const cohortLabel = args.cohortLabel?.trim() || null;

  const supabase = getSupabaseAdmin();
  const { data: profile, error: pErr } = await supabase
    .from("profiles")
    .select("id, email, full_name")
    .eq("email", email)
    .maybeSingle();
  if (pErr) throw new Error(pErr.message);
  if (!profile) {
    throw new Error(`No account for ${email}. Have them sign up first, then retry.`);
  }

  const { data: inserted, error: insErr } = await supabase
    .from("enrollments")
    .upsert(
      { user_id: profile.id, course_slug: courseSlug, cohort_label: cohortLabel },
      { onConflict: "user_id,course_slug" }
    )
    .select("id")
    .single();
  if (insErr) throw new Error(insErr.message);

  await sendEmail({
    to: profile.email,
    ...enrollmentWelcomeEmail({
      fullName: profile.full_name ?? profile.email,
      courseTitle: courseTitle(courseSlug),
      cohortLabel,
      portalUrl: portalUrl(),
    }),
  });

  revalidatePath(`/admin/cohorts/${courseSlug}`);
  revalidatePath("/admin/cohorts");
  return { enrollmentId: inserted.id };
}

export async function updateEnrollmentStatus(enrollmentId: string, status: string) {
  await requireAdmin();
  const parsed = EnrollmentStatusSchema.safeParse(status);
  if (!parsed.success) throw new Error("Invalid status");

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("enrollments")
    .update({ status: parsed.data })
    .eq("id", enrollmentId)
    .select("course_slug")
    .single();
  if (error) throw new Error(error.message);

  revalidatePath(`/admin/cohorts/${data.course_slug}`);
  revalidatePath("/admin/cohorts");
}
