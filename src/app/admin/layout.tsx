import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Admin - Kelola Pertanyaan & Kategori",
  description: "Panel admin Klinik HR untuk mengelola pertanyaan FAQ dan kategori.",
  robots: "noindex, nofollow",
};

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
