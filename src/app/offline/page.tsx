import type { Metadata } from 'next';
import Link from 'next/link';
import { PageShell } from '@/components/chrome/page-shell';

export const metadata: Metadata = {
  title: 'Offline',
  description: 'You are offline.',
  robots: { index: false, follow: false },
};

export default function OfflinePage() {
  return (
    <PageShell active="home" headerTone="light">
      <section className="section section-paper">
        <div className="page" style={{ maxWidth: 620 }}>
          <div className="apply-card" style={{ padding: 40 }}>
            <span className="pill pill-light">NO CONNECTION</span>
            <h1 className="t-h2" style={{ marginTop: 16, marginBottom: 12 }}>
              You&apos;re offline.
            </h1>
            <p className="t-body-lg" style={{ marginBottom: 20 }}>
              We couldn&apos;t reach the network. Check your data or Wi-Fi and try again — pages you
              visited before will still load.
            </p>
            <Link href="/" className="btn btn-primary">
              Try the homepage →
            </Link>
          </div>
        </div>
      </section>
    </PageShell>
  );
}
