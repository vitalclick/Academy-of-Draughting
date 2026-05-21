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

function escape(s: string) {
  return s.replace(/[<>&"]/g, (c) => ({ "<": "&lt;", ">": "&gt;", "&": "&amp;", '"': "&quot;" }[c] || c));
}
