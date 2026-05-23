'use server';

import { revalidatePath } from 'next/cache';
import { z } from 'zod';
import { currentStudent } from '@/lib/auth/student';
import { supabaseAdmin } from '@/lib/supabase/server';
import { logEvent } from '@/lib/db/applications';

const SaveSchema = z.object({
  enrollmentId: z.string().uuid(),
  assignmentId: z.string().uuid(),
  comment: z.string().max(4000).optional(),
  state: z.enum(['draft', 'submitted']),
});

export async function saveSubmissionAction(
  input: unknown
): Promise<{ ok: true; submissionId: string } | { ok: false; error: string }> {
  const session = await currentStudent();
  if (!session) return { ok: false, error: 'Not signed in' };

  const parsed = SaveSchema.safeParse(input);
  if (!parsed.success) return { ok: false, error: 'Invalid payload' };

  // RLS would catch this, but check explicitly so the error message is useful
  const ownsEnrollment = session.enrollments.some((e) => e.id === parsed.data.enrollmentId);
  if (!ownsEnrollment) return { ok: false, error: 'Not your enrollment' };

  const sb = supabaseAdmin();
  if (!sb) return { ok: false, error: 'Supabase unavailable' };

  const now = new Date().toISOString();
  const { data, error } = await sb
    .from('submissions')
    .upsert(
      {
        enrollment_id: parsed.data.enrollmentId,
        assignment_id: parsed.data.assignmentId,
        comment: parsed.data.comment ?? null,
        state: parsed.data.state,
        submitted_at: parsed.data.state === 'submitted' ? now : null,
        storage_path: null,
        filename: null,
        bytes: null,
        mime_type: null,
        grade: null,
        grader_id: null,
        feedback: null,
        graded_at: null,
      },
      { onConflict: 'enrollment_id,assignment_id' }
    )
    .select()
    .single();
  if (error) return { ok: false, error: error.message };

  await logEvent({
    name: parsed.data.state === 'submitted' ? 'submission_submitted' : 'submission_saved',
    applicant_id: null,
    application_id: null,
    anonymous_id: null,
    session_id: null,
    payload: {
      enrollment_id: parsed.data.enrollmentId,
      assignment_id: parsed.data.assignmentId,
      by: session.email,
    },
  }).catch(() => {});

  revalidatePath(
    `/portal/courses/${parsed.data.enrollmentId}/assignments/${parsed.data.assignmentId}`
  );
  revalidatePath(`/portal/courses/${parsed.data.enrollmentId}`);
  revalidatePath('/portal');
  return { ok: true, submissionId: data.id };
}
