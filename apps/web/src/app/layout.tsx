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
    <html lang="en">
      <body className={inter.className}>
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
