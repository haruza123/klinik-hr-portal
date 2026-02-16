import type { Metadata, Viewport } from "next";
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

export const viewport: Viewport = {
  width: "device-width",
  initialScale: 1,
  maximumScale: 5,
};

export const metadata: Metadata = {
  metadataBase: new URL(process.env.NEXT_PUBLIC_SITE_URL || "https://klinikhr.example.com"),
  title: {
    default: "Klinik HR - Referensi & Solusi Praktis Ketenagakerjaan",
    template: "%s | Klinik HR",
  },
  description:
    "Temukan solusi untuk pertanyaan HR Anda. Gaji, kontrak kerja, rekrutmen, pesangon, dan lebih banyak lagi.",
  keywords: ["HR Indonesia", "ketenagakerjaan", "gaji", "kontrak kerja", "pesangon", "rekrutmen"],
  openGraph: {
    type: "website",
    locale: "id_ID",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="id">
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        {children}
      </body>
    </html>
  );
}
