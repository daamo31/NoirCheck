// Root layout for NoirCheck web application
// Sets up global styles, font, and metadata for SEO and accessibility

import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

// Load Inter font with Latin subset
const inter = Inter({ subsets: ["latin"] });

// Metadata for the application (used by Next.js for SEO)
export const metadata: Metadata = {
  title: "NoirCheck - Digital Content Authenticity Verification",
  description: "Platform for verifying digital content authenticity with XION blockchain and zkTLS",
  keywords: "blockchain, verification, authenticity, XION, zkTLS, misinformation",
};

// Main layout component wrapping all pages
export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    // Set language to English and enable dark mode by default
    <html lang="en" className="dark">
      {/* Apply Inter font and antialiasing to body */}
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}