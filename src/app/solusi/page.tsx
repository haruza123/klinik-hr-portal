import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { ChevronRight } from 'lucide-react';
import { Header } from '@/components/Header';
import type { Metadata } from 'next';

export const dynamic = 'force-dynamic';

export const metadata: Metadata = {
  title: 'Semua Solusi',
  description: 'Daftar lengkap solusi dan referensi ketenagakerjaan dari Klinik HR.',
};

interface Question {
  id: string;
  slug: string | null;
  question_text: string;
  categories: { name: string } | null;
}

export default async function SolusiListPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const params = await searchParams;
  const query = params.kategori
    ? `/api/questions?limit=100&categorySlug=${encodeURIComponent(params.kategori)}`
    : '/api/questions?limit=100';

  let questions: Question[] = [];
  let categoryName: string | null = null;

  try {
    const res = await apiFetch<{ data: Question[]; categoryName?: string | null }>(query, {
      cache: 'no-store',
    });
    questions = res.data ?? [];
    categoryName = res.categoryName ?? null;
  } catch (err) {
    console.error(err);
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-6 text-sm text-slate-500" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-emerald-600 transition-colors">
                Beranda
              </Link>
            </li>
            <li>
              <ChevronRight className="h-4 w-4 text-slate-400 inline" />
            </li>
            <li className="text-slate-900 font-medium">
              {categoryName ?? 'Semua Solusi'}
            </li>
          </ol>
        </nav>

        {/* Header */}
        <header className="mb-8">
          <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
            {categoryName ? `Kategori: ${categoryName}` : 'Semua Solusi'}
          </h1>
          <p className="mt-2 text-slate-600">
            {categoryName
              ? `Menampilkan solusi untuk kategori "${categoryName}".`
              : 'Daftar lengkap solusi dan referensi seputar ketenagakerjaan.'}
          </p>
        </header>

        {/* Content */}
        {questions.length === 0 ? (
          <p className="text-slate-500 py-8">
            Tidak ada solusi untuk kategori ini.
          </p>
        ) : (
          <div className="grid grid-cols-1 gap-2 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
            {questions.map((q) => (
              <Link
                key={q.id}
                href={`/solusi/${q.slug ?? q.id}`}
                className="group flex flex-col rounded-xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md sm:rounded-2xl sm:p-5"
              >
                {q.categories?.name && (
                  <span className="inline-flex items-center rounded-full bg-emerald-50 px-2 py-0.5 text-xs font-medium text-emerald-700">
                    {q.categories.name}
                  </span>
                )}

                <p className="mt-1.5 sm:mt-2 font-semibold text-slate-900 group-hover:text-emerald-700 line-clamp-2 text-sm sm:text-base">
                  {q.question_text}
                </p>

                <span className="mt-auto pt-2 sm:pt-3 inline-flex items-center text-xs sm:text-sm text-slate-500 group-hover:text-emerald-600">
                  Baca selengkapnya
                  <ChevronRight className="ml-1 h-3.5 w-3.5 sm:h-4 sm:w-4" />
                </span>
              </Link>
            ))}
          </div>
        )}
      </main>
    </div>
  );
}
