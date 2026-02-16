import type { Metadata } from "next";

export const metadata: Metadata = {
  title: "Login",
  description: "Masuk ke panel admin Klinik HR.",
  robots: "noindex, nofollow",
};

export default function LoginLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return <>{children}</>;
}
