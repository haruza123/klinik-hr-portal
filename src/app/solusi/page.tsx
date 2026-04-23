import Link from 'next/link';
import { createSupabaseServerClient } from '@/lib/supabase-server';
import { ChevronRight } from 'lucide-react';
import { Header } from '@/components/Header';
import type { Metadata } from 'next';

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

function normalizeCategories(cat: unknown): { name: string } | null {
  if (!cat) return null;
  if (Array.isArray(cat) && cat.length > 0) {
    return { name: (cat[0] as { name?: string }).name ?? '' };
  }
  return cat as { name: string };
}

export default async function SolusiListPage({
  searchParams,
}: {
  searchParams: Promise<{ kategori?: string }>;
}) {
  const supabase = createSupabaseServerClient();
  const params = await searchParams; // 🔥 WAJIB {
  // 🔥 BASE QUERY
  let query = supabase
    .from('questions')
    .select('id, slug, question_text, categories ( name ), category_id')
    .order('created_at', { ascending: false });

  let categoryName: string | null = null;

  // 🔥 FILTER BERDASARKAN SLUG
  if (params.kategori) {
    const { data: cat } = await supabase
      .from('categories')
      .select('id, name')
      .eq('slug', params.kategori) // ✅ pakai slug
      .single();

    if (cat) {
      query = query.eq('category_id', cat.id);
      categoryName = cat.name; // buat display
    }
  }

  const { data, error } = await query;

  const questions: Question[] =
    !error && data
      ? data.map((q: any) => ({
          id: q.id,
          slug: q.slug,
          question_text: q.question_text,
          categories: normalizeCategories(q.categories),
        }))
      : [];

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
