import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import { Analytics } from "@vercel/analytics/next";
import { SpeedInsights } from "@vercel/speed-insights/next";
import { Toaster } from "sonner";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "MinneT - Plataforma de Conexión Comunitaria",
  description: "Conecta comunidades locales con proyectos mineros. Plataforma integral para el diálogo y la participación ciudadana en proyectos de minería responsable.",
  keywords: ["minería", "comunidades", "participación ciudadana", "proyectos mineros", "Perú"],
  authors: [{ name: "MinneT" }],
  openGraph: {
    title: "MinneT - Plataforma de Conexión Comunitaria",
    description: "Conecta comunidades locales con proyectos mineros",
    type: "website",
    locale: "es_PE",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
        <Toaster
          position="top-right"
          richColors
          closeButton
          duration={4000}
        />
        <Analytics />
        <SpeedInsights />
      </body>
    </html>
  );
}
