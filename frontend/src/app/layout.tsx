import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "NoirCheck - Verificación de Autenticidad Digital",
  description: "Plataforma de verificación de autenticidad de contenido digital con XION blockchain y zkTLS",
  keywords: "blockchain, verificación, autenticidad, XION, zkTLS, desinformación",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="dark">
      <body className={`${inter.className} antialiased`}>
        {children}
      </body>
    </html>
  );
}
