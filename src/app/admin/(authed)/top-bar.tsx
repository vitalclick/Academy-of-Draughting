'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TITLES: { match: (p: string) => boolean; title: string }[] = [
  { match: (p) => p === '/admin', title: 'operations' },
  { match: (p) => p.startsWith('/admin/applications'), title: 'applications' },
  { match: (p) => p.startsWith('/admin/leads'), title: 'leads' },
  { match: (p) => p.startsWith('/admin/students'), title: 'students' },
  { match: (p) => p.startsWith('/admin/communications'), title: 'communications' },
  { match: (p) => p.startsWith('/admin/programmes'), title: 'programmes' },
  { match: (p) => p.startsWith('/admin/content'), title: 'content' },
  { match: (p) => p.startsWith('/admin/signatures'), title: 'signatures' },
  { match: (p) => p.startsWith('/admin/events'), title: 'events' },
  { match: (p) => p.startsWith('/admin/finance'), title: 'payments' },
];

export function AdminTopBar() {
  const pathname = usePathname();
  const title = TITLES.find((t) => t.match(pathname))?.title ?? 'records';

  return (
    <header className="admin-top">
      <div className="admin-top-search">
        <svg width="13" height="13" viewBox="0 0 24 24" fill="none" aria-hidden="true">
          <circle cx="11" cy="11" r="7" stroke="currentColor" strokeWidth="2" />
          <path d="M21 21l-4-4" stroke="currentColor" strokeWidth="2" strokeLinecap="round" />
        </svg>
        <input type="text" placeholder={`Search ${title}, students, programmes…`} />
        <kbd>⌘K</kbd>
      </div>

      <div className="admin-top-actions">
        <button type="button" className="iconbtn" aria-label="Notifications">
          🔔<span className="badge">5</span>
        </button>
        <button type="button" className="iconbtn" aria-label="Help">
          ?
        </button>
        <Link href="/" className="btn btn-sm btn-ghost-light">
          View public site ↗
        </Link>
        <Link href="/admin/applications/new" className="btn btn-sm btn-primary">
          + New application
        </Link>
      </div>
    </header>
  );
}
