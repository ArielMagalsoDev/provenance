import type { Metadata } from "next";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";
import { SiteNav } from "./components/SiteNav";
import { SiteFooter } from "./components/SiteFooter";

const spaceGrotesk = Space_Grotesk({ subsets: ["latin"], variable: "--font-space" });
const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  metadataBase: new URL("https://provenance.arielmagalso.com"),
  title: {
    default: "Provenance — AI automation case study by Ariel Magalso",
    template: "%s — Provenance",
  },
  description: "An auditable AI support workflow designed and built by Ariel Magalso.",
  openGraph: {
    type: "website",
    siteName: "Provenance",
    title: "Provenance — Reliable AI automation by Ariel Magalso",
    description: "An auditable AI support workflow that answers, escalates, or blocks based on evidence.",
  },
  twitter: {
    card: "summary_large_image",
    title: "Provenance — Reliable AI automation by Ariel Magalso",
    description: "An auditable AI support workflow that answers, escalates, or blocks based on evidence.",
  },
};

export default function RootLayout({ children }: LayoutProps<"/">) {
  return (
    <html lang="en" className={`${spaceGrotesk.variable} ${inter.variable} h-full antialiased`}>
      <body className="min-h-full flex flex-col">
        <a className="skip-link" href="#main-content">Skip to content</a>
        <SiteNav />
        <div id="main-content">{children}</div>
        <SiteFooter />
      </body>
    </html>
  );
}
