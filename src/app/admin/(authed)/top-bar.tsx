'use client';

import Link from 'next/link';
import { usePathname } from 'next/navigation';

const TITLES: { match: (p: string) => boolean; title: string }[] = [
  { match: (p) => p === '/admin', title: 'Operations' },
  { match: (p) => p.startsWith('/admin/applications/new'), title: 'New application' },
  { match: (p) => p.startsWith('/admin/applications'), title: 'Applications' },
  { match: (p) => p.startsWith('/admin/leads'), title: 'Leads' },
  { match: (p) => p.startsWith('/admin/students'), title: 'Students' },
  { match: (p) => p.startsWith('/admin/communications'), title: 'Communications' },
  { match: (p) => p.startsWith('/admin/programmes'), title: 'Programmes' },
  { match: (p) => p.startsWith('/admin/schedule'), title: 'Schedule' },
  { match: (p) => p.startsWith('/admin/faculty'), title: 'Faculty' },
  { match: (p) => p.startsWith('/admin/content'), title: 'Content Studio' },
  { match: (p) => p.startsWith('/admin/signatures'), title: 'Email signatures' },
  { match: (p) => p.startsWith('/admin/events'), title: 'Events' },
  { match: (p) => p.startsWith('/admin/finance'), title: 'Payments' },
  { match: (p) => p.startsWith('/admin/reports'), title: 'Reports' },
  { match: (p) => p.startsWith('/admin/settings'), title: 'Settings' },
];

export function AdminTopBar() {
  const pathname = usePathname();
  const title = TITLES.find((t) => t.match(pathname))?.title ?? 'Admin';

  return (
    <header className="admin-top">
      <div className="admin-top-title">{title}</div>
      <div className="admin-top-actions">
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
