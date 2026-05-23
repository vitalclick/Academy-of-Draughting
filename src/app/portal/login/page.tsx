import type { Metadata } from 'next';
import { redirect } from 'next/navigation';
import { currentStudent } from '@/lib/auth/student';
import { LoginForm } from './login-form';
import { features } from '@/lib/env';

export const metadata: Metadata = {
  title: 'Student portal — sign in',
  robots: { index: false, follow: false },
};

export default async function PortalLoginPage() {
  const session = await currentStudent();
  if (session) redirect('/portal');

  return (
    <main className="admin-auth-shell">
      <div className="admin-auth-card">
        <div className="t-mono-xs" style={{ color: 'var(--blue-500)' }}>
          ACADEMY · STUDENT PORTAL
        </div>
        <h1 className="t-h2" style={{ margin: '8px 0 12px' }}>
          Sign in
        </h1>
        <p className="t-body" style={{ marginBottom: 20 }}>
          Use the email you applied with. We&apos;ll send a one-time sign-in link — no password to
          remember.
        </p>
        {features.supabase ? (
          <LoginForm />
        ) : (
          <div className="apply-banner apply-banner-error" role="alert">
            The student portal is not configured in this environment yet.
          </div>
        )}
      </div>
    </main>
  );
}
