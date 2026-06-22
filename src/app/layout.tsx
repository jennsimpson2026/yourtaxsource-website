import type { Metadata } from "next";
import { Geist, Geist_Mono, Playfair_Display } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

const playfair = Playfair_Display({
  variable: "--font-playfair",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Your Tax Source | Secure Admin & Client Portal",
  description: "Nationwide tax preparation and advisory for more than a decade. Secure digital portal, plain-English advice, and personalized service.",
};

import { Providers } from "@/components/Providers";

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} ${playfair.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        {/* Force Deploy: 2026-06-17 11:30 (Sync Trigger) */}
        <Providers>{children}</Providers>
      </body>
    </html>
  );
}
// Final authentic deployment trigger - Jun 16 2026
// Force redeploy Wed Jun 17 20:43:34 UTC 2026
