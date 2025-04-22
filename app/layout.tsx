import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Chismezón",
  description: "Noticias minimalistas y modernas",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="es" className="h-full">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased min-h-screen bg-gradient-to-br from-blue-50 via-white to-pink-50 h-full`}
      >
        <main className="min-h-screen flex items-center justify-center px-2 sm:px-4 py-4">
          <section
            aria-label="Contenedor principal"
            className="w-full max-w-2xl sm:max-w-3xl bg-white/90 rounded-2xl shadow-2xl border border-gray-100 p-4 sm:p-6 m-2 sm:m-4 backdrop-blur-sm transition-all duration-200"
          >
            {children}
          </section>
        </main>
      </body>
    </html>
  );
}
