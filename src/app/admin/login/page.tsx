import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentAdmin } from '@/lib/auth/admin';
import { LoginForm } from './login-form';
import { features } from '@/lib/env';

export const metadata: Metadata = {
  title: 'Admin sign-in',
  robots: { index: false, follow: false },
};

export default async function LoginPage() {
  const admin = await currentAdmin();
  if (admin) redirect('/admin');

  return (
    <main className="admin-auth-shell">
      <div className="admin-auth-card">
        <div className="t-mono-xs" style={{ color: 'var(--blue-500)' }}>
          ACADEMY · ADMIN
        </div>
        <h1 className="t-h2" style={{ margin: '8px 0 12px' }}>
          Sign in
        </h1>
        <p className="t-body" style={{ marginBottom: 20 }}>
          Restricted to authorized Academy staff. Enter your work email and we&apos;ll send a
          one-time sign-in link — no password to remember.
        </p>
        {features.supabase ? (
          <LoginForm />
        ) : (
          <div className="apply-banner apply-banner-error" role="alert">
            Supabase is not configured in this environment. Admin access is unavailable until
            <code> NEXT_PUBLIC_SUPABASE_URL</code> and{' '}
            <code>NEXT_PUBLIC_SUPABASE_ANON_KEY</code> are set.
          </div>
        )}
      </div>
    </main>
  );
}
