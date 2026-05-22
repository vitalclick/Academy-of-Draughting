'use server';

import { ApplicationDraftSchema, type ApplicationDraft } from '@/lib/validation/application';
import {
  createApplication,
  saveDraft,
  updateApplicationDraft,
  upsertApplicantByEmail,
  logEvent,
} from '@/lib/db/applications';
import { sendEmail } from '@/lib/email/resend';
import { applicantConfirmationEmail, internalAdmissionsAlertEmail } from '@/lib/email/templates';
import { sendApplicationReceived } from '@/lib/whatsapp/cloud-api';
import { upsertHubspotContact } from '@/lib/hubspot/contacts';
import { mintTrackingToken } from '@/lib/auth/tracking-token';
import { env, publicSiteUrl } from '@/lib/env';

export type SubmitResult =
  | { ok: true; applicationId: string; trackingUrl: string }
  | { ok: false; error: string; fieldErrors?: Record<string, string> };

/** Final submit — validates, persists, fires side-effects, returns tracking link. */
export async function submitApplicationAction(input: unknown): Promise<SubmitResult> {
  const parsed = ApplicationDraftSchema.safeParse(input);
  if (!parsed.success) {
    const fieldErrors: Record<string, string> = {};
    for (const issue of parsed.error.issues) {
      const path = issue.path.join('.');
      if (path && !fieldErrors[path]) fieldErrors[path] = issue.message;
    }
    return { ok: false, error: 'Validation failed', fieldErrors };
  }

  const draft = parsed.data;

  try {
    const applicant = await upsertApplicantByEmail({
      email: draft.email,
      firstName: draft.firstName,
      lastName: draft.lastName,
      phone: draft.phone,
      city: draft.city,
      idNumber: draft.idNumber,
      matricYear: draft.matricYear,
    });

    const application = await createApplication(applicant.id, draft);

    await logEvent({
      name: 'application_submitted',
      applicant_id: applicant.id,
      application_id: application.id,
      anonymous_id: null,
      session_id: null,
      payload: { programme: draft.programme, mode: draft.mode, campus: draft.campus },
    });

    const token = await mintTrackingToken(application.id);
    const trackingUrl = `${publicSiteUrl()}/apply/status/${token}`;

    // Side effects fire in parallel; failures are logged, never block the submit
    await Promise.allSettled([
      sendApplicantConfirmation({ draft, applicationId: application.id, trackingUrl }),
      sendInternalAlert({ draft, applicationId: application.id }),
      pushToHubspot({ draft, applicationId: application.id }),
      sendWhatsApp({ draft, applicationId: application.id }),
    ]);

    return { ok: true, applicationId: application.id, trackingUrl };
  } catch (err) {
    console.error('[apply.submit]', err);
    return { ok: false, error: 'Something went wrong submitting your application.' };
  }
}

/** Autosave step data; creates a draft row if one doesn't exist yet. */
export async function saveDraftAction(args: {
  applicationId?: string | null;
  email: string;
  draft: Partial<ApplicationDraft>;
}): Promise<{ applicationId: string }> {
  // Need at least an email to anchor an applicant.
  if (!args.email) throw new Error('email required for draft');

  if (args.applicationId) {
    const updated = await updateApplicationDraft(args.applicationId, args.draft);
    if (updated) return { applicationId: updated.id };
  }

  const applicant = await upsertApplicantByEmail({
    email: args.email,
    firstName: args.draft.firstName,
    lastName: args.draft.lastName,
    phone: args.draft.phone,
    city: args.draft.city,
    idNumber: args.draft.idNumber,
    matricYear: args.draft.matricYear,
  });
  const created = await saveDraft(applicant.id, args.draft);
  return { applicationId: created.id };
}

// ---- side-effect helpers ----

async function sendApplicantConfirmation(args: {
  draft: ApplicationDraft;
  applicationId: string;
  trackingUrl: string;
}) {
  const tpl = applicantConfirmationEmail({
    firstName: args.draft.firstName,
    programme: args.draft.programme,
    mode: args.draft.mode,
    campus: args.draft.campus,
    trackingUrl: args.trackingUrl,
    applicationId: args.applicationId,
  });
  return sendEmail({ to: args.draft.email, subject: tpl.subject, html: tpl.html });
}

async function sendInternalAlert(args: { draft: ApplicationDraft; applicationId: string }) {
  if (!env.ADMISSIONS_INBOX) return;
  const tpl = internalAdmissionsAlertEmail({
    firstName: args.draft.firstName,
    lastName: args.draft.lastName,
    email: args.draft.email,
    phone: args.draft.phone,
    programme: args.draft.programme,
    mode: args.draft.mode,
    campus: args.draft.campus,
    applicationId: args.applicationId,
  });
  return sendEmail({
    to: env.ADMISSIONS_INBOX,
    subject: tpl.subject,
    html: tpl.html,
    replyTo: args.draft.email,
  });
}

async function pushToHubspot(args: { draft: ApplicationDraft; applicationId: string }) {
  return upsertHubspotContact({
    email: args.draft.email,
    firstName: args.draft.firstName,
    lastName: args.draft.lastName,
    phone: args.draft.phone,
    programme: args.draft.programme,
    mode: args.draft.mode,
    campus: args.draft.campus,
    applicationId: args.applicationId,
  });
}

async function sendWhatsApp(args: { draft: ApplicationDraft; applicationId: string }) {
  return sendApplicationReceived({
    to: args.draft.phone,
    firstName: args.draft.firstName,
    applicationId: args.applicationId,
  });
}
