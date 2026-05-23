import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import Link from 'next/link';
import { currentStudent } from '@/lib/auth/student';
import { PortalSignOut } from './sign-out';

export const metadata: Metadata = {
  title: 'Student portal',
  robots: { index: false, follow: false },
};

export default async function PortalAuthedLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await currentStudent();
  if (!session) redirect('/portal/login');

  return (
    <div className="admin-shell">
      <aside className="admin-sidebar">
        <div className="admin-sidebar-brand">
          <span className="t-mono-xs" style={{ color: 'var(--ink-on-dark-3)' }}>
            ACADEMY · PORTAL
          </span>
          <div style={{ marginTop: 4, fontSize: 16, fontWeight: 500 }}>{session.email}</div>
          <div className="t-mono-xs" style={{ color: 'var(--ink-on-dark-3)' }}>
            {session.enrollments.length} ENROLMENT{session.enrollments.length === 1 ? '' : 'S'}
          </div>
        </div>
        <nav className="admin-nav">
          <Link href="/portal" className="admin-nav-link">
            Dashboard
          </Link>
          {session.enrollments.map((e) => (
            <Link key={e.id} href={`/portal/courses/${e.id}`} className="admin-nav-link">
              {e.programme.toUpperCase()}
              <div className="t-mono-xs" style={{ color: 'var(--ink-on-dark-3)' }}>
                {e.cohort}
              </div>
            </Link>
          ))}
        </nav>
        <div className="admin-sidebar-foot">
          <Link href="/" className="t-mono-xs admin-link">
            ← Back to site
          </Link>
          <PortalSignOut />
        </div>
      </aside>
      <main className="admin-main">{children}</main>
    </div>
  );
}
