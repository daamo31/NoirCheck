"use client";

// Root layout for NoirCheck web application
// Sets up global styles, font, and metadata for SEO and accessibility

import { Inter } from "next/font/google";
import "./globals.css";
import Navigation from "@/components/Navigation";

// Load Inter font with Latin subset
const inter = Inter({ subsets: ["latin"] });

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
        <Navigation />
        {children}
      </body>
    </html>
  );
}