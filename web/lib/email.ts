import { Resend } from "resend";
import { env } from "@/lib/env";

let cached: Resend | null = null;

function client(): Resend | null {
  const e = env();
  if (!e.RESEND_API_KEY) return null;
  if (cached) return cached;
  cached = new Resend(e.RESEND_API_KEY);
  return cached;
}

type SendArgs = { to: string; subject: string; html: string; text?: string };

export async function sendEmail(args: SendArgs): Promise<{ sent: boolean; error?: string }> {
  const c = client();
  if (!c) return { sent: false, error: "RESEND_API_KEY not configured" };
  const e = env();
  try {
    const { error } = await c.emails.send({
      from: e.RESEND_FROM_EMAIL,
      to: args.to,
      subject: args.subject,
      html: args.html,
      text: args.text,
    });
    if (error) return { sent: false, error: error.message };
    return { sent: true };
  } catch (err) {
    return { sent: false, error: err instanceof Error ? err.message : "send failed" };
  }
}

export function applicationReceivedEmail(args: {
  fullName: string;
  courseSlug: string;
  id: string;
}) {
  return {
    subject: `We received your application — ref ${args.id.slice(0, 8)}`,
    html: `<p>Hi ${escape(args.fullName)},</p>
      <p>Thanks for applying to <strong>${escape(args.courseSlug)}</strong> at The Academy of Advanced Draughting.</p>
      <p>Your reference is <code>${args.id}</code>. Admissions will be in touch within one working day.</p>
      <p>— AIDA, Admissions</p>`,
    text: `Hi ${args.fullName},\nThanks for applying to ${args.courseSlug}. Reference: ${args.id}. Admissions will be in touch within one working day.`,
  };
}

export function enrollmentWelcomeEmail(args: {
  fullName: string;
  courseTitle: string;
  cohortLabel: string | null;
  portalUrl: string;
}) {
  const cohort = args.cohortLabel ? ` (${escape(args.cohortLabel)})` : "";
  return {
    subject: `You're in — welcome to ${args.courseTitle}`,
    html: `<p>Hi ${escape(args.fullName)},</p>
      <p>Congratulations — you've been enrolled in <strong>${escape(args.courseTitle)}</strong>${cohort}.</p>
      <p>Your modules and first assignments are already waiting in the student portal:</p>
      <p><a href="${args.portalUrl}">Open your portal →</a></p>
      <p>Drawing standards, GD&amp;T, assemblies. Let's build a portfolio that gets you hired.</p>
      <p>— The Academy of Advanced Draughting</p>`,
    text: `Hi ${args.fullName},\n\nYou've been enrolled in ${args.courseTitle}${cohort}. Open your portal: ${args.portalUrl}`,
  };
}

export function gradeFeedbackEmail(args: {
  fullName: string;
  assignmentTitle: string;
  courseTitle: string;
  status: "graded" | "returned";
  score: number | null;
  maxScore: number;
  feedback: string | null;
  portalUrl: string;
}) {
  const verb = args.status === "graded" ? "graded" : "returned for revision";
  const scoreLine =
    args.score != null
      ? `<p><strong>Score:</strong> ${args.score} / ${args.maxScore}</p>`
      : "";
  const feedbackBlock = args.feedback
    ? `<p><strong>Reviewer feedback:</strong></p><blockquote style="border-left:3px solid #ccc;padding-left:.6em;color:#444">${escape(args.feedback).replace(/\n/g, "<br>")}</blockquote>`
    : "";
  return {
    subject: `${args.assignmentTitle} — ${verb}`,
    html: `<p>Hi ${escape(args.fullName)},</p>
      <p>Your submission for <strong>${escape(args.assignmentTitle)}</strong> in ${escape(args.courseTitle)} has been ${verb}.</p>
      ${scoreLine}
      ${feedbackBlock}
      <p><a href="${args.portalUrl}">Open your portal →</a></p>
      <p>— The Academy of Advanced Draughting</p>`,
    text: `Hi ${args.fullName},\n\n${args.assignmentTitle} has been ${verb}${
      args.score != null ? ` — ${args.score}/${args.maxScore}` : ""
    }.${args.feedback ? `\n\nFeedback:\n${args.feedback}` : ""}\n\nPortal: ${args.portalUrl}`,
  };
}

function escape(s: string) {
  return s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c] || c));
}
