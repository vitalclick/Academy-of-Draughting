'use server';

import { revalidatePath } from 'next/cache';
import { currentAdmin } from '@/lib/auth/admin';
import { updateApplicationStatus } from '@/lib/db/admin';
import { logEvent } from '@/lib/db/applications';
import type { ApplicationStatus } from '@/types/database';

export async function updateStatusAction(args: {
  id: string;
  status: ApplicationStatus;
}): Promise<{ ok: true } | { ok: false; error: string }> {
  const admin = await currentAdmin();
  if (!admin) return { ok: false, error: 'Not authenticated' };

  try {
    const row = await updateApplicationStatus(args.id, args.status);
    if (!row) return { ok: false, error: 'Application not found' };
    await logEvent({
      name: 'application_status_changed',
      applicant_id: row.applicant_id,
      application_id: row.id,
      anonymous_id: null,
      session_id: null,
      payload: { to: args.status, by: admin.email },
    }).catch(() => {});
    revalidatePath(`/admin/applications/${args.id}`);
    revalidatePath('/admin/applications');
    revalidatePath('/admin');
    return { ok: true };
  } catch (err) {
    return { ok: false, error: err instanceof Error ? err.message : 'update failed' };
  }
}
