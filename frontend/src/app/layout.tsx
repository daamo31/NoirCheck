"use client";

// Root layout for NoirCheck web application
// Sets up global styles, font, metadata, and XION integration

import { Inter } from "next/font/google";
import "./globals.css";
import "../styles/xion-overrides.css";
import "../styles/xion-accessibility.css";
import Navigation from "@/components/layout/Navigation";
import SimpleXIONProvider from "@/components/wallet/SimpleXIONProvider";
import { AuthProvider } from "@/contexts/AuthContext";

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
        <SimpleXIONProvider>
          <AuthProvider>
            <Navigation />
            {children}
          </AuthProvider>
        </SimpleXIONProvider>
      </body>
    </html>
  );
}