import type { Metadata, Viewport } from 'next';
import { Geist, Geist_Mono } from 'next/font/google';
import { AidaProvider } from '@/components/chrome/aida-context';
import { AidaWidget } from '@/components/chrome/aida-widget';
import { CookieBanner } from '@/components/chrome/cookie-banner';
import { Analytics } from '@/components/chrome/analytics';
import { PersonalizationProvider } from '@/components/personalization/provider';
import { ExitIntent } from '@/components/personalization/exit-intent';
import { OrganizationJsonLd } from '@/seo/json-ld';
import { SITE } from '@/lib/site';
import './globals.css';

const geistSans = Geist({
  subsets: ['latin'],
  variable: '--font-geist-sans',
  display: 'swap',
});

const geistMono = Geist_Mono({
  subsets: ['latin'],
  variable: '--font-geist-mono',
  display: 'swap',
});

export const metadata: Metadata = {
  metadataBase: new URL(SITE.url),
  title: {
    default: `${SITE.name} — Engineering careers start here`,
    template: `%s · ${SITE.short}`,
  },
  description: SITE.description,
  applicationName: SITE.name,
  authors: [{ name: SITE.name }],
  keywords: [
    'draughting',
    'CAD training',
    'AutoCAD',
    'Revit',
    'Inventor',
    'MDDOP',
    'N4 N5',
    'engineering education',
    'South Africa',
    'design office training',
  ],
  openGraph: {
    type: 'website',
    locale: 'en_ZA',
    url: SITE.url,
    siteName: SITE.name,
    title: `${SITE.name} — Engineering careers start here`,
    description: SITE.description,
  },
  twitter: {
    card: 'summary_large_image',
    title: SITE.name,
    description: SITE.description,
  },
  robots: {
    index: true,
    follow: true,
    googleBot: { index: true, follow: true },
  },
  icons: {
    icon: '/favicon.ico',
  },
};

export const viewport: Viewport = {
  themeColor: '#071B3B',
  width: 'device-width',
  initialScale: 1,
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geistSans.variable} ${geistMono.variable}`}>
      <body>
        <a href="#main" className="skip-link">
          Skip to content
        </a>
        <OrganizationJsonLd />
        <PersonalizationProvider>
          <AidaProvider>
            {children}
            <AidaWidget />
            <CookieBanner />
            <ExitIntent />
            <Analytics
              gaId={process.env.NEXT_PUBLIC_GA_MEASUREMENT_ID}
              pixelId={process.env.NEXT_PUBLIC_META_PIXEL_ID}
              posthogKey={process.env.NEXT_PUBLIC_POSTHOG_KEY}
              posthogHost={process.env.NEXT_PUBLIC_POSTHOG_HOST}
            />
          </AidaProvider>
        </PersonalizationProvider>
      </body>
    </html>
  );
}
