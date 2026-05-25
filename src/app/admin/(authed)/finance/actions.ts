'use server';

import { revalidatePath } from 'next/cache';
import { currentAdmin } from '@/lib/auth/admin';
import { recordPayment } from '@/lib/db/admin';
import type { PaymentStatus } from '@/types/database';

const STATUSES: PaymentStatus[] = ['pending', 'paid', 'overdue', 'waived'];

export async function recordPaymentAction(formData: FormData) {
  const admin = await currentAdmin();
  if (!admin) throw new Error('Unauthorized');

  const enrollmentRaw = String(formData.get('enrollment') ?? '');
  const [enrollmentId, applicantId] = enrollmentRaw.includes('|')
    ? enrollmentRaw.split('|')
    : [enrollmentRaw, ''];

  const amount = Number(formData.get('amount'));
  if (!Number.isFinite(amount) || amount <= 0) throw new Error('Amount must be greater than zero');

  const statusRaw = String(formData.get('status') ?? 'pending');
  const status: PaymentStatus = STATUSES.includes(statusRaw as PaymentStatus)
    ? (statusRaw as PaymentStatus)
    : 'pending';

  await recordPayment({
    enrollment_id: enrollmentId || null,
    applicant_id: applicantId || null,
    amount,
    plan: String(formData.get('plan') ?? '').trim() || null,
    status,
    due_date: String(formData.get('due_date') ?? '').trim() || null,
    note: String(formData.get('note') ?? '').trim() || null,
    created_by: admin.userId,
  });

  revalidatePath('/admin/finance');
}
