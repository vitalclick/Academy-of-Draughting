import { redirect } from 'next/navigation';
import { currentAdmin } from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';

export default async function AdminSettingsPage() {
  const admin = await currentAdmin();
  if (!admin) redirect('/admin/login');

  return (
    <div>
      <div className="admin-header">
        <span className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>
          SETTINGS
        </span>
        <h1 className="t-h2" style={{ margin: '6px 0 24px' }}>
          Account
        </h1>
      </div>

      <section className="admin-section">
        <div
          style={{
            display: 'grid',
            gridTemplateColumns: '160px 1fr',
            gap: 16,
            maxWidth: 560,
          }}
        >
          <span className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>EMAIL</span>
          <span style={{ fontSize: 15 }}>{admin.email}</span>

          <span className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>ROLE</span>
          <span style={{ fontSize: 15 }}>{admin.role.toUpperCase()}</span>
        </div>
      </section>
    </div>
  );
}
