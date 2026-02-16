import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Kalkulator Pesangon",
  description:
    "Hitung uang pesangon, UPMK, dan UPH sesuai UU Cipta Kerja. Masukkan masa kerja dan gaji pokok untuk perkiraan kompensasi PHK.",
};

export default function KalkulatorLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
