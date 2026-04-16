import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

import QueryProvider from "@/lib/QueryProvider";
import Navbar from "@/components/layout/Navbar";
import Footer from "@/components/layout/Footer";
import DynamicThemeApplier from "@/components/theme/DynamicThemeApplier";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "CineOS - AI Movie Discovery",
  description: "Multilingual AI-powered movie discovery platform. Discover movies through natural language, group watch party AI, and personalized taste calibration.",
  keywords: "movies, AI, recommendations, discover, cinema, streaming, watch party",
  openGraph: {
    title: "CineOS - AI Movie Discovery",
    description: "Discover your next favorite movie with AI-powered natural language search.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className="dark scroll-smooth">
      <head>
        <link rel="manifest" href="/manifest.json" />
        <meta name="theme-color" content="#050505" />
        <meta name="apple-mobile-web-app-capable" content="yes" />
        <meta name="apple-mobile-web-app-status-bar-style" content="black-translucent" />
      </head>
      <body className={`${inter.className} bg-cinema-void text-white selection:bg-cinema-primary selection:text-black`}>
        <QueryProvider>
          {/* Reads localStorage calibration, applies CSS theme variables */}
          <DynamicThemeApplier />
          <Navbar />
          <main className="min-h-screen">
            {children}
          </main>
          <Footer />
        </QueryProvider>
      </body>
    </html>
  );
}
