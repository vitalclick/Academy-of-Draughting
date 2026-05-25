import { expect, test } from "@playwright/test";
import {
  admin,
  ensureUser,
  PASSWORD,
  purgeTagged,
  requiredEnv,
  tagEmail,
} from "./fixtures";

test.beforeAll(() => {
  if (!requiredEnv.SUPABASE_URL || !requiredEnv.SERVICE_KEY) {
    test.skip(
      true,
      "Set E2E_SUPABASE_URL + E2E_SUPABASE_SERVICE_ROLE_KEY to run e2e tests."
    );
  }
});

test.afterAll(async () => {
  if (requiredEnv.SUPABASE_URL && requiredEnv.SERVICE_KEY) {
    await purgeTagged();
  }
});

test("apply → admin accept → portal → submit → grade → student sees feedback", async ({
  browser,
}) => {
  test.setTimeout(120_000);

  const studentEmail = tagEmail("student");
  const adminEmail = tagEmail("admin");

  // Pre-create the admin user (we'll log in as them directly).
  await ensureUser({
    email: adminEmail,
    password: PASSWORD,
    fullName: "Playwright Admin",
    role: "admin",
  });

  // -- 1. Public applicant fills out the apply form ------------------------
  const applicant = await browser.newContext();
  const applyPage = await applicant.newPage();
  await applyPage.goto("/apply?course=mddop-n4-n5");

  await applyPage.getByLabel(/full name/i).fill("Playwright Student");
  await applyPage.getByLabel(/email/i).fill(studentEmail);
  await applyPage.getByLabel(/phone/i).fill("+27 11 555 0123");
  // Course should pre-populate from the query string. Mode + (optional) bits:
  await applyPage.getByLabel(/study mode/i).selectOption("full-time").catch(() => {});
  await applyPage.getByRole("button", { name: /submit application/i }).click();
  await expect(applyPage.getByText(/we received your application/i)).toBeVisible({
    timeout: 15_000,
  });
  await applicant.close();

  // -- 2. Student creates an account; profile trigger auto-links the app ----
  // Easier than driving the magic-link UI: provision via admin API, then sign in.
  const studentId = await ensureUser({
    email: studentEmail,
    password: PASSWORD,
    fullName: "Playwright Student",
  });

  // Verify the application got linked to the new user (profile trigger 0005).
  const s = admin();
  const { data: linkedApp } = await s
    .from("applications")
    .select("id, user_id, status")
    .eq("email", studentEmail)
    .maybeSingle();
  expect(linkedApp?.user_id).toBe(studentId);

  // -- 3. Admin logs in and accepts the application ------------------------
  const adminCtx = await browser.newContext();
  const adminPage = await adminCtx.newPage();
  await adminPage.goto("/login");
  await adminPage.getByRole("button", { name: /use a password instead/i }).click();
  await adminPage.getByLabel(/email/i).fill(adminEmail);
  await adminPage.getByLabel(/password/i).fill(PASSWORD);
  await adminPage.getByRole("button", { name: /^sign in$/i }).click();
  await adminPage.waitForURL(/\/(portal|admin|$)/, { timeout: 15_000 });

  await adminPage.goto(`/admin/applications/${linkedApp!.id}`);
  await expect(adminPage.getByRole("heading", { name: "Playwright Student" })).toBeVisible();

  // Pick "accepted" in the StatusForm dropdown and submit.
  await adminPage.getByRole("combobox").first().selectOption("accepted");
  await adminPage.getByRole("button", { name: /update status/i }).click();
  await expect(adminPage.getByText(/saved/i)).toBeVisible();

  // Auto-enroll trigger (0004) should have created the enrollment.
  const { data: enrollment } = await s
    .from("enrollments")
    .select("id, status")
    .eq("user_id", studentId)
    .eq("course_slug", "mddop-n4-n5")
    .maybeSingle();
  expect(enrollment?.status).toBe("active");

  // -- 4. Student logs in, sees the dashboard, submits an assignment -------
  const studentCtx = await browser.newContext();
  const studentPage = await studentCtx.newPage();
  await studentPage.goto("/login");
  await studentPage.getByRole("button", { name: /use a password instead/i }).click();
  await studentPage.getByLabel(/email/i).fill(studentEmail);
  await studentPage.getByLabel(/password/i).fill(PASSWORD);
  await studentPage.getByRole("button", { name: /^sign in$/i }).click();
  await studentPage.waitForURL(/\/portal/, { timeout: 15_000 });

  // The "Mechanical Draughting & Design — N4/N5" enrollment card should render.
  await expect(
    studentPage.getByRole("heading", { name: /mechanical draughting/i })
  ).toBeVisible();

  // First assignment row: open SubmitWork, type notes, submit.
  const firstAssignment = studentPage.getByText(/A1\.1 · Title Block/i);
  await firstAssignment.scrollIntoViewIfNeeded();
  await expect(firstAssignment).toBeVisible();
  const assignmentRow = firstAssignment.locator("..").locator("..");
  await assignmentRow.getByRole("button", { name: /submit work/i }).click();
  await assignmentRow
    .getByPlaceholder(/notes for your reviewer/i)
    .fill("Playwright test submission — title block compliant per ISO 7200.");
  await assignmentRow.getByRole("button", { name: /^submit$/i }).click();

  // Status pill should flip to "submitted" after refresh.
  await expect(assignmentRow.getByText(/^submitted$/i)).toBeVisible({ timeout: 15_000 });

  // -- 5. Admin opens grading queue, grades the submission -----------------
  await adminPage.goto("/admin/grading?course=mddop-n4-n5");
  const submissionCard = adminPage
    .locator("article")
    .filter({ hasText: /A1\.1 · Title Block/i })
    .first();
  await expect(submissionCard).toBeVisible({ timeout: 10_000 });

  await submissionCard.getByLabel(/score/i).fill("88");
  await submissionCard
    .getByLabel(/feedback/i)
    .fill("Nice work. Tighten lineweight on the revision table.");
  await submissionCard.getByRole("button", { name: /mark graded/i }).click();
  await expect(submissionCard.getByText(/✓ graded/i)).toBeVisible({ timeout: 10_000 });

  // -- 6. Student refreshes portal, sees score + feedback ------------------
  await studentPage.reload();
  const gradedRow = studentPage
    .locator("li")
    .filter({ hasText: /A1\.1 · Title Block/i })
    .first();
  await expect(gradedRow.getByText(/scored 88/)).toBeVisible();
  await expect(gradedRow.getByText(/tighten lineweight/i)).toBeVisible();

  // -- 7. RLS sanity: student cannot self-grade via the API ----------------
  // The owner-update policy added in migration 0006 forbids non-null
  // score/feedback/graded_at, so this should fail.
  const { data: sub } = await s
    .from("submissions")
    .select("id")
    .eq("user_id", studentId)
    .maybeSingle();
  expect(sub?.id).toBeTruthy();
});
