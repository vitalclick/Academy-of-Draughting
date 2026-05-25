import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentAdmin } from '@/lib/auth/admin';
import { getOverviewCounts } from '@/lib/db/admin';
import { AdminSidebar } from './sidebar';
import { AdminTopBar } from './top-bar';

export const metadata: Metadata = {
  title: 'Admin',
  robots: { index: false, follow: false },
};

export const dynamic = 'force-dynamic';

export default async function AdminAuthedLayout({ children }: { children: React.ReactNode }) {
  const admin = await currentAdmin();
  if (!admin) redirect('/admin/login');

  const counts = await getOverviewCounts();

  return (
    <div className="admin-shell">
      <AdminSidebar
        email={admin.email}
        role={admin.role}
        applicationsCount={counts.applications_submitted}
      />
      <div className="admin-main">
        <AdminTopBar />
        <div className="admin-content">{children}</div>
      </div>
    </div>
  );
}
