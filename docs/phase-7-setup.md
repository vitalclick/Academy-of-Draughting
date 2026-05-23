# Phase 7 — Student portal setup

The portal replaces the previous `/portal` placeholder with a real LMS-lite:
sign-in by magic link, per-enrolment dashboard, assignment list, and a
comment-based submission flow. File upload + grading by admins are deferred
to 7.x.

## Setup

### 1. Apply the migration

```bash
supabase db push  # runs supabase/migrations/0005_portal.sql
```

This adds `enrollments`, `assignments`, `submissions`, the
`student-submissions` storage bucket, `public.is_student()`, and four RLS
policies that scope students to their own data.

### 2. Configure Supabase Auth redirects

In Project Settings → Authentication → URL Configuration, add:
- `https://academydraughting.com/portal/callback`
- `http://localhost:3000/portal/callback` (for local dev)

Same auth settings as the admin flow — just an additional redirect URL.

### 3. Seed a test student

A student is just an applicant whose application was accepted **and** who
has an `enrollments` row pointing to their `auth.users` UUID. Seed one
manually:

```sql
-- 1. Find the auth user (after they've signed in once via magic link)
select id, email from auth.users where email = 'student@example.com';

-- 2. Find the matching applicant
select id from applicants where email = 'student@example.com';

-- 3. Create the enrollment
insert into enrollments (user_id, applicant_id, application_id, programme, cohort, state, started_at)
values (
  '<auth.users.id>',
  '<applicants.id>',
  '<applications.id>',
  'mddop',
  '2026-jan-jhb-ft',
  'active',
  '2026-01-15'
);
```

### 4. Publish some assignments

```sql
insert into assignments (programme, kind, module, title, brief, due_at, weight, published)
values
  ('mddop', 'drawing', 'CAD (AutoCAD)', 'Workstation orthographic', 'Draw front, side and top elevations of the studio workstation. A2 sheet, 1:20. Production-grade title block. Submit PDF + DWG.', '2026-02-15 17:00+02', 15, true),
  ('mddop', 'theory', 'MDDOP Theory & Practice', 'Drawing office vocabulary quiz', 'Multiple choice — paragraph long-form for the section labels.', '2026-02-08 17:00+02', 5, true),
  ('mddop', 'project', 'Building Draughting', 'Single-storey residential plan', 'Floor plan, two elevations, one section. Conform to local building code symbols.', '2026-03-15 17:00+02', 25, true);
```

## What students see

After a successful magic-link sign-in:

- **Dashboard** (`/portal`) — one card per active enrolment with
  open/overdue/total counts, plus a "due soon" table.
- **Per-course** (`/portal/courses/[id]`) — every published assignment for
  their programme/cohort with state + grade columns.
- **Per-assignment** (`/portal/courses/[id]/assignments/[assignmentId]`) —
  the brief on the left, submission form or feedback on the right.

The submission form is comment-only for now. Students paste links to
external work (Drive, ACC, OneDrive) and click Submit. The schema and
private storage bucket are already in place to swap this for a real file
upload in Phase 7.1.

## Security model

- **No public API.** Every mutation goes through a server action that calls
  `currentStudent()` first.
- **Belt-and-braces RLS.** Even if a server action leaked a query, the
  student-scoped policies on `enrollments`, `assignments` and
  `submissions` deny cross-student reads.
- **Audit trail.** Every save and submit writes a row to `events` with the
  student's email.

## Pending follow-ups

### 7.1 — File-upload submissions
Plumbing is already there:
- `student-submissions` private bucket exists
- `submissions.storage_path` / `filename` / `bytes` / `mime_type` columns
  exist
- The signed-URL helper pattern from the apply form's document upload can
  be lifted verbatim

What's needed: a `/api/portal/submissions/upload` route that mints signed
PUT URLs scoped by enrollment, plus UI in the submission form.

### 7.2 — Admin grading view
`/admin/submissions` with the same table pattern as `/admin/applications`,
filterable by programme/cohort/state. A grading sidebar that writes
`grade` + `feedback` + flips `state` to `graded`. The `submissions_admin_all`
RLS policy already permits this.

### 7.3 — AI drawing critique
Once file upload lands, run Claude vision on uploaded drawings. Two prompts:
- Drawing-office standards check (line weights, dimensioning conventions,
  title block compliance)
- Brief-vs-output gap analysis ("did the student answer the question?")

Both feed an auto-generated draft of `submission.feedback` that the
human grader edits and publishes.

### 7.4 — Cohort calendar
A `cohort_calendars` table (or just `cohorts` with a JSON column) so the
"due soon" view can include lectures and exam dates, not just assignments.
