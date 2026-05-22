import 'server-only';
import { Resend } from 'resend';
import { env, features } from '@/lib/env';

let cached: Resend | null = null;

function client() {
  if (!features.resend) return null;
  if (cached) return cached;
  cached = new Resend(env.RESEND_API_KEY!);
  return cached;
}

export async function sendEmail(args: {
  to: string | string[];
  subject: string;
  html: string;
  replyTo?: string;
}) {
  const resend = client();
  if (!resend) {
    console.info(
      `[email:mock] to=${Array.isArray(args.to) ? args.to.join(',') : args.to} subject="${args.subject}"`
    );
    return { id: `mock_${Date.now()}` };
  }
  const result = await resend.emails.send({
    from: env.RESEND_FROM!,
    to: args.to,
    subject: args.subject,
    html: args.html,
    replyTo: args.replyTo,
  });
  if (result.error) throw new Error(`resend: ${result.error.message}`);
  return { id: result.data?.id ?? '' };
}
