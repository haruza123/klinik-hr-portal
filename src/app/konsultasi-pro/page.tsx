import Link from 'next/link';
import { Header } from '@/components/Header';
import type { Metadata } from 'next';

export const metadata: Metadata = {
  title: 'Konsultasi Pro',
  description: 'Layanan premium konsultasi mendalam dengan tim ahli HR untuk kasus kompleks.',
};

export default function KonsultasiProPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto max-w-2xl px-4 py-20 text-center">
        <h1 className="text-2xl font-bold text-slate-900">Konsultasi Pro</h1>
        <p className="mt-4 text-slate-600">
          Layanan premium untuk konsultasi mendalam dengan tim ahli HR. Fitur ini sedang dalam pengembangan.
        </p>
        <Link href="/" className="mt-8 inline-block rounded-xl bg-emerald-600 px-6 py-3 font-medium text-white hover:bg-emerald-700">
          Kembali ke Beranda
        </Link>
      </main>
    </div>
  );
}
