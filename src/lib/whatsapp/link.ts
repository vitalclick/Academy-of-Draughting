import { SITE } from '@/lib/site';

/** Builds a click-to-chat WhatsApp deep link with an optional prefilled message. */
export function waLink(message?: string): string {
  const base = `https://wa.me/${SITE.whatsappNumber}`;
  return message ? `${base}?text=${encodeURIComponent(message)}` : base;
}
