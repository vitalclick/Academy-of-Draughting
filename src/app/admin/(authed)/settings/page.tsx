import { currentAdmin } from '@/lib/auth/admin';

export const dynamic = 'force-dynamic';

export default async function SettingsPage() {
  const admin = await currentAdmin();

  return (
    <>
      <div className="adm-page-head">
        <div>
          <div className="breadcrumb">
            SETTINGS<span className="sep">/</span>ACCOUNT
          </div>
          <h1>Settings</h1>
          <p>Your signed-in account, and where academy configuration will live.</p>
        </div>
      </div>

      <div className="adm-card" style={{ maxWidth: 840 }}>
        <div className="adm-card-body">
          <div className="t-mono-xs" style={{ color: 'var(--ink-4)', marginBottom: 20 }}>
            SIGNED IN AS
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '160px 1fr', rowGap: 18, alignItems: 'baseline' }}>
            <span className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>EMAIL</span>
            <span style={{ fontSize: 16, color: 'var(--ink)' }}>{admin?.email ?? '—'}</span>
            <span className="t-mono-xs" style={{ color: 'var(--ink-4)' }}>ROLE</span>
            <span style={{ fontSize: 16, color: 'var(--ink)' }}>{(admin?.role ?? '—').toUpperCase()}</span>
          </div>
        </div>
      </div>
    </>
  );
}
