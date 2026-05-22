import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { currentAdmin } from '@/lib/auth/admin';
import { SignOut } from './sign-out';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

const NAV = [
  { href: '/admin', label: 'Overview' },
  { href: '/admin/applications', label: 'Applications' },
  { href: '/admin/leads', label: 'Leads' },
  { href: '/admin/events', label: 'Events' },
  { href: '/admin/content', label: 'Content Studio' },
];

export default async function AdminAuthedLayout({ children }: { children: React.ReactNode }) {
  const admin = await currentAdmin();
  if (!admin) redirect('/admin/login');

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <span className="t-mono-xs" style={{ color: 'var(--ink-on-dark-3)' }}>
            ACADEMY · ADMIN
          </span>
          <div style={{ marginTop: 4, fontSize: 16, fontWeight: 500 }}>
            {admin.email}
            <div className="t-mono-xs" style={{ color: 'var(--ink-on-dark-3)' }}>
              {admin.role.toUpperCase()}
            </div>
          </div>
        </div>
        <nav className="admin-nav">
          {NAV.map((n) => (
            <Link key={n.href} href={n.href} className="admin-nav-link">
              {n.label}
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-foot">
          <Link href="/" className="t-mono-xs admin-link">
            ← Back to site
          </Link>
          <SignOut />
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
