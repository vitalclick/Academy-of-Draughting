"use server";

import { revalidatePath } from "next/cache";
import { z } from "zod";
import { getUserWithRole } from "@/lib/supabase/server";
import { getSupabaseAdmin } from "@/lib/supabase/admin";
import { env } from "@/lib/env";
import { sendEmail, enrollmentWelcomeEmail } from "@/lib/email";
import { courses } from "@/data/courses";
import type { Database } from "@/lib/database.types";

type ModuleUpdate = Database["public"]["Tables"]["modules"]["Update"];
type AssignmentUpdate = Database["public"]["Tables"]["assignments"]["Update"];

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

async function requireAdminOrFaculty() {
  const session = await getUserWithRole();
  if (!session || (session.role !== "admin" && session.role !== "faculty")) {
    throw new Error("Not authorized");
  }
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

// ---------------------------------------------------------------------------
// Curriculum CRUD — admin or faculty.
// ---------------------------------------------------------------------------

const ModuleInputSchema = z.object({
  courseSlug: SlugSchema,
  title: z.string().min(1).max(200),
  description: z.string().max(2000).optional(),
  orderIndex: z.number().int().min(0).max(10000),
});

const AssignmentInputSchema = z.object({
  moduleId: z.string().uuid(),
  title: z.string().min(1).max(200),
  description: z.string().max(4000).optional(),
  dueAt: z
    .string()
    .datetime({ offset: true })
    .or(z.literal(""))
    .optional(),
  maxScore: z.number().int().min(1).max(1000),
  orderIndex: z.number().int().min(0).max(10000),
});

export async function createModule(input: z.infer<typeof ModuleInputSchema>) {
  await requireAdminOrFaculty();
  const v = ModuleInputSchema.parse(input);
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("modules")
    .insert({
      course_slug: v.courseSlug,
      title: v.title,
      description: v.description?.trim() || null,
      order_index: v.orderIndex,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/curriculum/${v.courseSlug}`);
  revalidatePath("/admin/curriculum");
  return { id: data.id };
}

export async function updateModule(
  id: string,
  input: Partial<z.infer<typeof ModuleInputSchema>>
) {
  await requireAdminOrFaculty();
  const patch: ModuleUpdate = {};
  if (input.title != null) patch.title = z.string().min(1).max(200).parse(input.title);
  if (input.description !== undefined)
    patch.description = input.description?.trim() || null;
  if (input.orderIndex != null)
    patch.order_index = z.number().int().min(0).max(10000).parse(input.orderIndex);

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("modules")
    .update(patch)
    .eq("id", id)
    .select("course_slug")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/curriculum/${data.course_slug}`);
}

export async function deleteModule(id: string) {
  await requireAdminOrFaculty();
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("modules")
    .delete()
    .eq("id", id)
    .select("course_slug")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/curriculum/${data.course_slug}`);
  revalidatePath("/admin/curriculum");
}

export async function createAssignment(input: z.infer<typeof AssignmentInputSchema>) {
  await requireAdminOrFaculty();
  const v = AssignmentInputSchema.parse(input);
  const supabase = getSupabaseAdmin();
  // Resolve courseSlug via module → for revalidation.
  const { data: m, error: mErr } = await supabase
    .from("modules")
    .select("course_slug")
    .eq("id", v.moduleId)
    .single();
  if (mErr) throw new Error(mErr.message);
  const { data, error } = await supabase
    .from("assignments")
    .insert({
      module_id: v.moduleId,
      title: v.title,
      description: v.description?.trim() || null,
      due_at: v.dueAt && v.dueAt !== "" ? v.dueAt : null,
      max_score: v.maxScore,
      order_index: v.orderIndex,
    })
    .select("id")
    .single();
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/curriculum/${m.course_slug}`);
  return { id: data.id };
}

export async function updateAssignment(
  id: string,
  input: Partial<z.infer<typeof AssignmentInputSchema>>
) {
  await requireAdminOrFaculty();
  const patch: AssignmentUpdate = {};
  if (input.title != null) patch.title = z.string().min(1).max(200).parse(input.title);
  if (input.description !== undefined)
    patch.description = input.description?.trim() || null;
  if (input.dueAt !== undefined)
    patch.due_at = input.dueAt && input.dueAt !== "" ? input.dueAt : null;
  if (input.maxScore != null)
    patch.max_score = z.number().int().min(1).max(1000).parse(input.maxScore);
  if (input.orderIndex != null)
    patch.order_index = z.number().int().min(0).max(10000).parse(input.orderIndex);

  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("assignments")
    .update(patch)
    .eq("id", id)
    .select("modules!inner(course_slug)")
    .single<{ modules: { course_slug: string } }>();
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/curriculum/${data.modules.course_slug}`);
}

export async function deleteAssignment(id: string) {
  await requireAdminOrFaculty();
  const supabase = getSupabaseAdmin();
  const { data, error } = await supabase
    .from("assignments")
    .delete()
    .eq("id", id)
    .select("modules!inner(course_slug)")
    .single<{ modules: { course_slug: string } }>();
  if (error) throw new Error(error.message);
  revalidatePath(`/admin/curriculum/${data.modules.course_slug}`);
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
