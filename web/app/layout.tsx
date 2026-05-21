import type { Metadata } from "next";
import "./globals.css";
import { SiteHeader } from "@/components/SiteHeader";
import { SiteFooter } from "@/components/SiteFooter";
import { Aida } from "@/components/Aida";

export const metadata: Metadata = {
  title: "The Academy of Advanced Draughting — Engineering careers start here",
  description:
    "AI-powered draughting and CAD education aligned to real engineering and design office environments. Since 1981.",
  metadataBase: new URL("https://academy-of-draughting.example"),
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en">
      <body>
        <SiteHeader />
        <main>{children}</main>
        <SiteFooter />
        <Aida />
      </body>
    </html>
  );
}
