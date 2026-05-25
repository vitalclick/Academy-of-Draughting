/* eslint-disable no-console */
/**
 * Seed a realistic demo dataset into the Supabase project pointed at by
 * SUPABASE_URL + SUPABASE_SERVICE_ROLE_KEY (or DEMO_SUPABASE_* overrides).
 *
 * Creates:
 *   1 admin (admin@demo.aod.local)
 *   1 faculty (faculty@demo.aod.local)
 *   4 students (student1..4@demo.aod.local)
 *   Applications for each student, mixed statuses
 *   Enrollments for the accepted students in mddop-n4-n5
 *   Submissions across the seeded assignments (mix of submitted and graded)
 *
 * Idempotent: re-running cleans up demo data first via reset-demo.ts logic.
 *
 * NEVER run this against a production project.
 */

import { clientFromEnv, DEMO_PASSWORD, DEMO_TAG, purgeDemo } from "./_demo-shared";

const COURSE = "mddop-n4-n5";
const COHORT = "MDDOP Demo Cohort";

const supabase = clientFromEnv();

async function createUser(opts: {
  email: string;
  fullName: string;
  role?: "student" | "admin" | "faculty";
}): Promise<string> {
  const { data, error } = await supabase.auth.admin.createUser({
    email: opts.email,
    password: DEMO_PASSWORD,
    email_confirm: true,
    user_metadata: { full_name: opts.fullName },
  });
  if (error || !data.user) throw new Error(`createUser ${opts.email}: ${error?.message}`);
  if (opts.role && opts.role !== "student") {
    const { error: upErr } = await supabase
      .from("profiles")
      .update({ role: opts.role })
      .eq("id", data.user.id);
    if (upErr) throw new Error(`role ${opts.email}: ${upErr.message}`);
  }
  console.log(`  ✓ ${opts.role ?? "student"}  ${opts.email}`);
  return data.user.id;
}

async function seed() {
  console.log("\n→ Purging existing demo data…");
  await purgeDemo(supabase);

  console.log("\n→ Creating users…");
  await createUser({ email: `admin${DEMO_TAG}`, fullName: "Demo Admin", role: "admin" });
  await createUser({ email: `faculty${DEMO_TAG}`, fullName: "Demo Faculty", role: "faculty" });
  const studentIds: { id: string; email: string; name: string }[] = [];
  for (let i = 1; i <= 4; i += 1) {
    const email = `student${i}${DEMO_TAG}`;
    const name = `Demo Student ${i}`;
    const id = await createUser({ email, fullName: name });
    studentIds.push({ id, email, name });
  }

  console.log("\n→ Creating applications…");
  // App 1: received (no admin action yet)
  // App 2: reviewing
  // App 3-4: accepted (with linked user)
  const statuses = ["received", "reviewing", "accepted", "accepted"] as const;
  for (let i = 0; i < studentIds.length; i += 1) {
    const s = studentIds[i]!;
    const { error } = await supabase.from("applications").insert({
      full_name: s.name,
      email: s.email,
      phone: `+27 11 555 010${i + 1}`,
      course_slug: COURSE,
      study_mode: i % 2 === 0 ? "full-time" : "evening",
      status: statuses[i]!,
      user_id: s.id,
      prev_qualification: i === 0 ? "Matric · Mathematics + Engineering Graphics" : null,
    });
    if (error) throw new Error(`application ${s.email}: ${error.message}`);
    console.log(`  ✓ ${statuses[i]}\t${s.email}`);
  }

  console.log("\n→ Creating enrollments for accepted students…");
  for (const s of studentIds.slice(2)) {
    const { error } = await supabase
      .from("enrollments")
      .upsert(
        { user_id: s.id, course_slug: COURSE, cohort_label: COHORT },
        { onConflict: "user_id,course_slug" }
      );
    if (error) throw new Error(`enroll ${s.email}: ${error.message}`);
    console.log(`  ✓ enrolled ${s.email}`);
  }

  console.log("\n→ Creating submissions…");
  // Pull all assignments for the course so we can submit against the real ids.
  const { data: assignments, error: aErr } = await supabase
    .from("assignments")
    .select("id, max_score, order_index, modules!inner(course_slug)")
    .eq("modules.course_slug", COURSE)
    .order("order_index", { ascending: true });
  if (aErr) throw new Error(`assignments: ${aErr.message}`);
  if (!assignments?.length) {
    console.warn(
      `  ! no assignments found for ${COURSE} — apply migration 0003 first.`
    );
    return;
  }

  const enrolled = studentIds.slice(2);
  // Student 3 (index 0 of enrolled): two submitted, one graded
  // Student 4 (index 1 of enrolled): one submitted only
  const plans: Array<{
    user: { id: string; email: string };
    items: Array<{
      assignmentIdx: number;
      status: "submitted" | "graded";
      score?: number;
      feedback?: string;
      notes?: string;
    }>;
  }> = [
    {
      user: enrolled[0]!,
      items: [
        {
          assignmentIdx: 0,
          status: "graded",
          score: 86,
          feedback:
            "Strong title block. Tighten the lineweight contrast on the revision table — visible vs. hidden should be a clearer step.",
          notes: "First pass — ISO 7200 sheet, A3 landscape, 1:1.",
        },
        {
          assignmentIdx: 1,
          status: "submitted",
          notes: "Twelve lines per ISO 128. Phantom line might be slightly heavy.",
        },
      ],
    },
    {
      user: enrolled[1]!,
      items: [
        {
          assignmentIdx: 0,
          status: "submitted",
          notes: "Used inherited template — please flag if the title block needs rework.",
        },
      ],
    },
  ];

  for (const plan of plans) {
    for (const item of plan.items) {
      const a = assignments[item.assignmentIdx];
      if (!a) continue;
      const now = new Date();
      const submittedAt = new Date(now.getTime() - 3 * 24 * 60 * 60 * 1000);
      const { error } = await supabase
        .from("submissions")
        .upsert(
          {
            assignment_id: a.id,
            user_id: plan.user.id,
            status: item.status,
            notes: item.notes ?? null,
            score: item.score ?? null,
            feedback: item.feedback ?? null,
            submitted_at: submittedAt.toISOString(),
            graded_at: item.status === "graded" ? now.toISOString() : null,
          },
          { onConflict: "assignment_id,user_id" }
        );
      if (error) throw new Error(`submission ${plan.user.email} ${a.id}: ${error.message}`);
      console.log(
        `  ✓ ${item.status.padEnd(10)} ${plan.user.email} → assignment #${item.assignmentIdx + 1}`
      );
    }
  }

  console.log("\n✓ Demo seed complete.\n");
  console.log("Sign in as:");
  console.log(`  admin${DEMO_TAG}        / ${DEMO_PASSWORD}`);
  console.log(`  faculty${DEMO_TAG}      / ${DEMO_PASSWORD}`);
  console.log(`  student[1-4]${DEMO_TAG} / ${DEMO_PASSWORD}`);
}

seed().catch((err) => {
  console.error("\nSeed failed:", err);
  process.exit(1);
});
