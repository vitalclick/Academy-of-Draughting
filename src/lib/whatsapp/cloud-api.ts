import 'server-only';
import { env, features } from '@/lib/env';

/**
 * Sends a WhatsApp template message via Meta's Cloud API.
 * No-op (with a console log) when WHATSAPP_* env vars aren't set.
 *
 * Template must be approved in Meta Business Manager. The default template
 * accepts two body parameters: first name and application reference.
 */
export async function sendApplicationReceived(args: {
  to: string;
  firstName: string;
  applicationId: string;
}) {
  if (!features.whatsapp) {
    console.info(`[whatsapp:mock] to=${args.to} ref=${args.applicationId}`);
    return { mocked: true };
  }
  const url = `https://graph.facebook.com/v20.0/${env.WHATSAPP_PHONE_ID}/messages`;
  const body = {
    messaging_product: 'whatsapp',
    to: args.to.replace(/^\+/, ''),
    type: 'template',
    template: {
      name: env.WHATSAPP_TEMPLATE_NAME ?? 'application_received',
      language: { code: 'en' },
      components: [
        {
          type: 'body',
          parameters: [
            { type: 'text', text: args.firstName },
            { type: 'text', text: args.applicationId.slice(0, 8) },
          ],
        },
      ],
    },
  };
  const res = await fetch(url, {
    method: 'POST',
    headers: {
      Authorization: `Bearer ${env.WHATSAPP_TOKEN}`,
      'Content-Type': 'application/json',
    },
    body: JSON.stringify(body),
  });
  if (!res.ok) {
    const text = await res.text();
    throw new Error(`whatsapp: ${res.status} ${text.slice(0, 200)}`);
  }
  return { mocked: false, response: await res.json() };
}
