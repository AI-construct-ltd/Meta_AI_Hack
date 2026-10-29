import { Suspense } from "react";
import type { Metadata, Viewport } from "next";
import Script from "next/script";
import { Inter, Manrope, IBM_Plex_Mono } from "next/font/google";
import "./globals.css";
import "./guide.css";
import "./home.css";
import "./scan.css";
import { Analytics } from "@vercel/analytics/next";
import Offline from "@/components/Offline";
import { AuthProvider } from "@/lib/firebase/AuthContext";
import AuthModal from "@/components/auth/AuthModal";
import { SITE_URL } from "@/lib/site";

const inter = Inter({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-inter",
  display: "swap",
});

const manrope = Manrope({
  subsets: ["latin"],
  weight: ["500", "600", "700", "800"],
  variable: "--font-manrope",
  display: "swap",
});

const plexMono = IBM_Plex_Mono({
  subsets: ["latin"],
  weight: ["400", "500", "600"],
  variable: "--font-mono",
  display: "swap",
});

const description = "Interactive 3D visual training manuals for carpentry and construction apprentices. Follow structural framing and assemblies step by step in 3D.";

export const metadata: Metadata = {
  metadataBase: new URL(SITE_URL),
  title: "AIConstruct: 3D Construction & Framing Manuals",
  description,
  applicationName: "AIConstruct",
  appleWebApp: { capable: true, title: "AIConstruct", statusBarStyle: "default" },
  openGraph: { type: "website", siteName: "AIConstruct", title: "AIConstruct: 3D Construction & Framing Manuals", description, url: "/" },
  twitter: { card: "summary_large_image", title: "AIConstruct: 3D Construction & Framing Manuals", description },
};

export const viewport: Viewport = {
  themeColor: "#f8fafc",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en" className={`${inter.variable} ${manrope.variable} ${plexMono.variable}`}>
      <body>
        <AuthProvider>
          {children}
          <AuthModal />
        </AuthProvider>
        <Analytics />
        {/* Plausible, served through our own domain (see the rewrites in next.config.ts) so the CSP stays self-only */}
        <Script src="/pl/script.js" data-domain="aiconstruct.uk" data-api="/pl/event" strategy="afterInteractive" />
        {/* it reads the path, which the prerendered shell doesn't know yet */}
        <Suspense fallback={null}>
          <Offline />
        </Suspense>
      </body>
    </html>
  );
}
