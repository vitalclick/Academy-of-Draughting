import Link from 'next/link';
import { PageShell } from '@/components/chrome/page-shell';

export default function NotFound() {
  return (
    <PageShell active="home" headerTone="light">
      <section className="section section-dark" style={{ minHeight: '60vh' }}>
        <div className="page" style={{ paddingTop: 96, paddingBottom: 96 }}>
          <span className="section-label">
            <span className="bar" />
            ERROR · 404
          </span>
          <h1 className="t-display-2" style={{ marginTop: 16, marginBottom: 20 }}>
            That drawing isn&apos;t on file.
          </h1>
          <p className="t-body-lg" style={{ maxWidth: 560, color: 'var(--ink-on-dark-2)' }}>
            The page you&apos;re looking for has moved or never existed. Try one of the routes
            below.
          </p>
          <div style={{ display: 'flex', gap: 12, marginTop: 28, flexWrap: 'wrap' }}>
            <Link href="/" className="btn btn-primary">
              Back to home
            </Link>
            <Link href="/courses" className="btn btn-ghost-dark">
              See programmes
            </Link>
            <Link href="/contact" className="btn btn-ghost-dark">
              Contact us
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
