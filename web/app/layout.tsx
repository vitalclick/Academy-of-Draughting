import type { Metadata } from "next";
import Script from "next/script";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Aida } from "@/components/Aida";
import { CookieConsent } from "@/components/CookieConsent";
import { env } from "@/lib/env";

const e = env();

export const metadata: Metadata = {
  title: "The Academy of Advanced Draughting — Engineering careers start here",
  description:
    "AI-powered draughting and CAD education aligned to real engineering and design office environments. Since 1981.",
  metadataBase: new URL(e.NEXT_PUBLIC_SITE_URL),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  const plausibleDomain = e.NEXT_PUBLIC_PLAUSIBLE_DOMAIN;
  return (
    <html lang="en">
      <body>
        <a
          href="#main"
          className="sr-only focus:not-sr-only focus:fixed focus:left-3 focus:top-3 focus:z-[100] focus:rounded focus:bg-navy-900 focus:px-3 focus:py-2 focus:text-sm focus:text-white"
        >
          Skip to content
        </a>
        <SiteHeader />
        <main id="main">{children}</main>
        <SiteFooter />
        <Aida />
        <CookieConsent />
        {plausibleDomain && (
          <Script
            defer
            src="https://plausible.io/js/script.js"
            data-domain={plausibleDomain}
            strategy="afterInteractive"
          />
        )}
      </body>
    </html>
  );
}
