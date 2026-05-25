import { redirect } from 'next/navigation';
import { currentAdmin } from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const admin = await currentAdmin();
  if (!admin) redirect('/admin/login');

  return (
    <>
      <div className="adm-page-head">
        <div>
          <div className="breadcrumb">
            SETTINGS
            <span className="sep">/</span>
            ACCOUNT
          </div>
          <h1>Settings</h1>
          <p>Your signed-in account, and where academy configuration will live.</p>
        </div>
      </div>

      <div className="adm-card" style={{ padding: 24, maxWidth: 560 }}>
        <div className="t-mono-xs" style={{ color: 'var(--ink-4)', marginBottom: 16 }}>
          SIGNED IN AS
        </div>
        <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr', gap: 14 }}>
          <span className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>EMAIL</span>
          <span style={{ fontSize: 15, fontWeight: 500 }}>{admin.email}</span>

          <span className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>ROLE</span>
          <span style={{ fontSize: 15 }}>{admin.role.toUpperCase()}</span>
        </div>
      </div>
    </>
  );
}
