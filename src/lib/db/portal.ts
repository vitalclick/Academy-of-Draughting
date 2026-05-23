import 'server-only';
import { supabaseAdmin } from '@/lib/supabase/server';
import type {
  AssignmentRow,
  EnrollmentRow,
  SubmissionRow,
} from '@/types/database';

export type AssignmentWithSubmission = AssignmentRow & {
  submission: SubmissionRow | null;
};

export async function listAssignmentsForEnrollment(
  enrollment: EnrollmentRow
): Promise<AssignmentWithSubmission[]> {
  const sb = supabaseAdmin();
  if (!sb) return [];
  const { data: assignments } = await sb
    .from('assignments')
    .select('*')
    .eq('published', true)
    .eq('programme', enrollment.programme)
    .or(`cohort.is.null,cohort.eq.${enrollment.cohort}`)
    .order('due_at', { ascending: true, nullsFirst: false });
  if (!assignments) return [];

  const ids = assignments.map((a) => a.id);
  const { data: subs } = await sb
    .from('submissions')
    .select('*')
    .eq('enrollment_id', enrollment.id)
    .in('assignment_id', ids);
  const subMap = new Map((subs ?? []).map((s) => [s.assignment_id, s]));

  return assignments.map((a) => ({ ...a, submission: subMap.get(a.id) ?? null }));
}

export async function getEnrollment(id: string): Promise<EnrollmentRow | null> {
  const sb = supabaseAdmin();
  if (!sb) return null;
  const { data } = await sb.from('enrollments').select('*').eq('id', id).maybeSingle();
  return data;
}

export async function getAssignmentWithSubmission(
  assignmentId: string,
  enrollmentId: string
): Promise<AssignmentWithSubmission | null> {
  const sb = supabaseAdmin();
  if (!sb) return null;
  const { data: a } = await sb.from('assignments').select('*').eq('id', assignmentId).maybeSingle();
  if (!a) return null;
  const { data: s } = await sb
    .from('submissions')
    .select('*')
    .eq('enrollment_id', enrollmentId)
    .eq('assignment_id', assignmentId)
    .maybeSingle();
  return { ...a, submission: s ?? null };
}
