import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/components/chrome/page-shell';

export const metadata: Metadata = {
  title: 'Student Portal',
  description: 'Access your application status, course materials, and drawing reviews.',
  alternates: { canonical: '/portal' },
  robots: { index: false, follow: false },
};

export default function PortalPage() {
  return (
    <PageShell active="portal" headerTone="light">
      <section className="section section-dark" style={{ minHeight: '60vh' }}>
        <div className="page" style={{ paddingTop: 96, paddingBottom: 96 }}>
          <span className="section-label">
            <span className="bar" />
            STUDENT PORTAL · COMING SOON
          </span>
          <h1 className="t-display-2" style={{ marginTop: 16, marginBottom: 20 }}>
            Sign in to your portal.
          </h1>
          <p className="t-body-lg" style={{ maxWidth: 620, color: 'var(--ink-on-dark-2)' }}>
            Application status, intake schedule, drawing reviews, downloads. The full student
            portal is launching alongside the 2026 intake. In the meantime, applicants get email
            and WhatsApp updates from admissions.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
            <Link href="/apply" className="btn btn-primary">
              Start an application
            </Link>
            <Link href="/contact" className="btn btn-ghost-dark">
              Contact admissions
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
