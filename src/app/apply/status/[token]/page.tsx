import type { Metadata } from 'next';
import Link from 'next/link';
import { notFound } from 'next/navigation';
import { PageShell } from '@/components/chrome/page-shell';
import { verifyTrackingToken } from '@/lib/auth/tracking-token';
import { getApplication } from '@/lib/db/applications';
import type { ApplicationStatus } from '@/types/database';

export const metadata: Metadata = {
  title: 'Application status',
  description: 'Track the progress of your Academy of Advanced Draughting application.',
  robots: { index: false, follow: false },
};

const STATUS_LABEL: Record<ApplicationStatus, string> = {
  draft: 'Draft',
  submitted: 'Submitted · under review',
  under_review: 'Under review',
  accepted: 'Accepted',
  rejected: 'Not successful this intake',
  withdrawn: 'Withdrawn',
};

const STATUS_PROGRESS: Record<ApplicationStatus, number> = {
  draft: 10,
  submitted: 40,
  under_review: 65,
  accepted: 100,
  rejected: 100,
  withdrawn: 100,
};

const STATUS_HELP: Record<ApplicationStatus, string> = {
  draft: 'You haven’t submitted this application yet. Pick up where you left off any time.',
  submitted:
    'Admissions has received your application. We respond within one business day with a decision.',
  under_review:
    'A real human is reviewing your documents. We’ll WhatsApp or email if we need anything.',
  accepted: 'Congratulations — you’ve been accepted. Check your email for next steps.',
  rejected:
    'Unfortunately we couldn’t place you this intake. Reach out to admissions to discuss alternatives.',
  withdrawn: 'This application has been withdrawn.',
};

export default async function StatusPage({
  params,
}: {
  params: Promise<{ token: string }>;
}) {
  const { token } = await params;
  const verified = await verifyTrackingToken(token);
  if (!verified) notFound();

  const application = await getApplication(verified.applicationId);
  if (!application) notFound();

  const progress = STATUS_PROGRESS[application.status];

  return (
    <PageShell active="apply" headerTone="light">
      <section className="page-header">
        <div className="page ph-inner" style={{ gridTemplateColumns: '1fr' }}>
          <div>
            <div className="ph-eyebrow">
              <span className="pill pill-blue-dark">
                <span className="dot" />
                APPLICATION · {application.id.slice(0, 8).toUpperCase()}
              </span>
              <span className="t-mono-xs" style={{ color: 'var(--ink-on-dark-3)' }}>
                INTAKE · {application.intake ?? 'JAN 2026'}
              </span>
            </div>
            <h1 className="ph-title">
              Your application <em>is {STATUS_LABEL[application.status].toLowerCase()}.</em>
            </h1>
            <p className="ph-sub">{STATUS_HELP[application.status]}</p>
          </div>
        </div>
      </section>

      <section className="section section-light">
        <div className="page" style={{ maxWidth: 760 }}>
          <div className="status-card">
            <div className="status-row">
              <span className="t-mono-xs">PROGRAMME</span>
              <strong>{application.programme.toUpperCase()}</strong>
            </div>
            <div className="status-row">
              <span className="t-mono-xs">MODE</span>
              <strong>{application.mode}</strong>
            </div>
            <div className="status-row">
              <span className="t-mono-xs">CAMPUS</span>
              <strong>{application.campus}</strong>
            </div>
            <div className="status-row">
              <span className="t-mono-xs">FUNDING</span>
              <strong>{application.funding_plan}</strong>
            </div>
            <div className="status-row">
              <span className="t-mono-xs">SUBMITTED</span>
              <strong>
                {application.submitted_at
                  ? new Date(application.submitted_at).toLocaleString('en-ZA')
                  : '—'}
              </strong>
            </div>

            <div style={{ marginTop: 24 }}>
              <div className="t-mono-xs" style={{ marginBottom: 8, color: 'var(--ink-4)' }}>
                STATUS · {STATUS_LABEL[application.status].toUpperCase()}
              </div>
              <div className="status-progress">
                <div className="status-progress-bar" style={{ width: `${progress}%` }} />
              </div>
            </div>

            <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
              <Link href="/contact" className="btn btn-sm btn-primary">
                Contact admissions
              </Link>
              <Link href="/courses" className="btn btn-sm btn-ghost-light">
                Programmes
              </Link>
            </div>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
