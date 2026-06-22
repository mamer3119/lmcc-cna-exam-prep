import type { Metadata, Viewport } from "next";
import { Crimson_Pro, Source_Sans_3 } from "next/font/google";

import { assetPath } from "@/lib/paths";

import { ClientProviders } from "@/components/ClientProviders";

import "./globals.css";

const crimsonPro = Crimson_Pro({
  subsets: ["latin"],
  weight: ["300", "400", "600", "700"],
  variable: "--font-crimson",
  display: "swap",
});

const sourceSans = Source_Sans_3({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-source",
  display: "swap",
});

export const metadata: Metadata = {
  title: "LMCC CNA Skills Exam Prep — Interactive Checklists",
  description:
    "California CNA state exam skill checklists with official step wording, video links, and saved lab progress.",
  icons: {
    icon: assetPath("images/shield_watermark.png"),
    apple: assetPath("images/shield_watermark.png"),
  },
};

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  themeColor: "#111827",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${crimsonPro.variable} ${sourceSans.variable}`}>
      <head>
        <link rel="preconnect" href="https://www.youtube.com" />
      </head>
      <body className={`${crimsonPro.variable} ${sourceSans.variable}`}>
        <ClientProviders>{children}</ClientProviders>
      </body>
    </html>
  );
}
