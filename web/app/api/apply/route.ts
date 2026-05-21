import { NextResponse } from "next/server";
import { z } from "zod";
import { getSupabaseAdmin } from "@/lib/supabase";

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
  let input: ApplicationInput;
  try {
    input = ApplicationSchema.parse(await req.json());
  } catch (err) {
    const issues = err instanceof z.ZodError ? err.flatten() : null;
    return NextResponse.json(
      { error: "Validation failed.", issues },
      { status: 400 }
    );
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
      })
      .select("id")
      .single();

    if (error) throw error;
    return NextResponse.json({ id: data.id, status: "received" });
  } catch (err) {
    const message = err instanceof Error ? err.message : "Unknown error";
    return NextResponse.json({ error: message }, { status: 500 });
  }
}
