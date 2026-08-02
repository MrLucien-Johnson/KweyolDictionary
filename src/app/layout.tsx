import type { Metadata } from "next";
import { Fraunces, Source_Sans_3 } from "next/font/google";
import { ContentAccuracyNotice } from "@/components/layout/ContentAccuracyNotice";
import { SiteFooter } from "@/components/layout/SiteFooter";
import { SiteHeader } from "@/components/layout/SiteHeader";
import { MISSION_STATEMENT, PROJECT_NAME } from "@/lib/content/editorial";
import "./globals.css";

const displayFont = Fraunces({
  variable: "--font-display",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const bodyFont = Source_Sans_3({
  variable: "--font-body",
  subsets: ["latin"],
  weight: ["400", "600", "700"],
});

export const metadata: Metadata = {
  title: {
    default: PROJECT_NAME,
    template: `%s · ${PROJECT_NAME}`,
  },
  description: MISSION_STATEMENT,
  metadataBase: new URL(
    process.env.NEXT_PUBLIC_SITE_URL ?? "http://localhost:3000",
  ),
  openGraph: {
    title: PROJECT_NAME,
    description: MISSION_STATEMENT,
    locale: "en_DM",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${displayFont.variable} ${bodyFont.variable} h-full`}
    >
      <body className="page-shell antialiased">
        <SiteHeader />
        <ContentAccuracyNotice variant="banner" />
        <main className="page-main">{children}</main>
        <SiteFooter />
      </body>
    </html>
  );
}
