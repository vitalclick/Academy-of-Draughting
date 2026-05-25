'use client';

import { usePathname } from 'next/navigation';
import { waLink } from '@/lib/whatsapp/link';
import { track } from '@/lib/analytics/events';

/**
 * Floating click-to-WhatsApp button. South Africa is a WhatsApp-first market,
 * so this is often the highest-converting contact channel. The prefilled
 * message is tailored to the page the visitor is on.
 */
function messageFor(pathname: string): string {
  if (pathname.startsWith('/funding')) {
    return "Hi, I'd like to talk about fees and funding options for a draughting course.";
  }
  if (pathname.startsWith('/apply')) {
    return "Hi, I'm busy with my application and have a quick question.";
  }
  if (pathname.startsWith('/courses/')) {
    const id = pathname.split('/')[2] ?? '';
    return `Hi, I'm interested in the ${id} course — can you tell me more?`;
  }
  if (pathname.startsWith('/courses')) {
    return "Hi, I'd like help choosing the right draughting course.";
  }
  if (pathname.startsWith('/career')) {
    return "Hi, I have a question about draughting careers and where they can lead.";
  }
  return 'Hi, I have a question about studying at the Academy of Advanced Draughting.';
}

export function WhatsAppFab() {
  const pathname = usePathname() ?? '/';
  if (pathname.startsWith('/admin') || pathname.startsWith('/portal')) return null;

  const href = waLink(messageFor(pathname));

  return (
    <a
      className="wa-fab"
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      aria-label="Chat to admissions on WhatsApp"
      onClick={() => track('whatsapp_click', { context: pathname })}
    >
      <span className="wa-fab-mark" aria-hidden="true">
        <svg width="22" height="22" viewBox="0 0 24 24" fill="#052e16">
          <path d="M20.4 3.6A11.9 11.9 0 0 0 12 0C5.4 0 .1 5.3.1 11.9c0 2.1.6 4.1 1.6 5.9L0 24l6.4-1.7a11.9 11.9 0 0 0 5.6 1.4h.01c6.6 0 11.9-5.3 11.9-11.9 0-3.2-1.2-6.2-3.5-8.2zM12 21.5h-.01a9.6 9.6 0 0 1-4.9-1.3l-.35-.2-3.8 1 1-3.7-.23-.38a9.6 9.6 0 0 1-1.5-5.1C2.2 6.6 6.6 2.2 12 2.2c2.6 0 5 1 6.8 2.9a9.5 9.5 0 0 1 2.8 6.8c0 5.3-4.4 9.6-9.6 9.6zm5.3-7.2c-.3-.15-1.7-.84-2-.94s-.46-.15-.66.15-.76.94-.93 1.13-.34.22-.63.07a7.8 7.8 0 0 1-2.3-1.4 8.7 8.7 0 0 1-1.6-2c-.17-.3 0-.45.13-.6s.3-.34.44-.5a2 2 0 0 0 .3-.5.55.55 0 0 0 0-.52c-.07-.15-.66-1.6-.9-2.18s-.48-.5-.66-.5h-.56a1.08 1.08 0 0 0-.78.36 3.3 3.3 0 0 0-1 2.43 5.7 5.7 0 0 0 1.2 3 13.1 13.1 0 0 0 5 4.4c.7.3 1.24.48 1.67.62a4 4 0 0 0 1.84.12c.56-.09 1.7-.7 1.95-1.37s.24-1.25.17-1.37-.27-.2-.57-.35z" />
        </svg>
      </span>
      <span className="wa-fab-text">WhatsApp us</span>
    </a>
  );
}
