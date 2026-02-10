'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Search, Wallet, FileText, Users, ChevronRight, Loader2, Star } from 'lucide-react';
import { Header } from '@/components/Header';

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface Question {
  id: string;
  slug: string | null;
  question_text: string;
  answer: string | null;
  categories: { name: string } | null;
}

const CATEGORY_ICONS: Record<string, typeof Wallet> = {
  'Gaji & Payroll': Wallet,
  'Gaji': Wallet,
  'Kontrak Kerja': FileText,
  'Kontrak': FileText,
  'Rekrutmen': Users,
  'Rekrutment': Users,
  'PHK': FileText,
  'BPJS': Wallet,
};

function getCategoryIcon(name: string) {
  for (const key of Object.keys(CATEGORY_ICONS)) {
    if (name?.toLowerCase().includes(key.toLowerCase())) return CATEGORY_ICONS[key];
  }
  return FileText;
}

export default function Home() {
  const [categories, setCategories] = useState<Category[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [loading, setLoading] = useState(true);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      const [catRes, qRes] = await Promise.all([
        supabase.from('categories').select('id, name, description').order('name'),
        supabase
          .from('questions')
          .select('id, slug, question_text, answer, categories ( name )')
          .order('created_at', { ascending: false })
          .limit(30),
      ]);
      if (!catRes.error) setCategories(catRes.data ?? []);
      if (!qRes.error) {
        const normalizedQuestions: Question[] = (qRes.data ?? []).map((q: any) => ({
          id: q.id,
          slug: q.slug,
          question_text: q.question_text,
          answer: q.answer,
          categories:
            q.categories && Array.isArray(q.categories) && q.categories.length > 0
              ? { name: q.categories[0].name }
              : null,
        }));
        setQuestions(normalizedQuestions);
      }
      setLoading(false);
    }
    fetchData();
  }, []);

  const searchTerm = search.trim().toLowerCase();
  const suggestions = searchTerm
    ? questions.filter(
        (q) =>
          q.question_text.toLowerCase().includes(searchTerm) ||
          q.categories?.name?.toLowerCase().includes(searchTerm) ||
          (q.answer && q.answer.replace(/<[^>]*>/g, '').toLowerCase().includes(searchTerm))
      )
    : [];
  const showSuggestions = searchFocused && (searchTerm ? suggestions.length > 0 : questions.slice(0, 5).length > 0);

  const featuredQuestions = questions.slice(0, 4);

  // Kelompokkan solusi per kategori untuk seksi (3-4 artikel terbaru per kategori)
  const byCategory = (() => {
    const map: Record<string, Question[]> = {};
    for (const q of questions) {
      const name = q.categories?.name ?? 'Lainnya';
      if (!map[name]) map[name] = [];
      map[name].push(q);
    }
    return map;
  })();
  const categorySections = categories
    .filter((cat) => (byCategory[cat.name]?.length ?? 0) > 0)
    .map((cat) => ({
      category: cat,
      questions: (byCategory[cat.name] ?? []).slice(0, 4),
    }));
  // Jika ada pertanyaan dengan kategori yang tidak ada di daftar categories, tampilkan juga
  const otherCategoryNames = Object.keys(byCategory).filter(
    (name) => !categories.some((c) => c.name === name)
  );
  otherCategoryNames.forEach((name) => {
    if (!categorySections.some((s) => s.category.name === name)) {
      categorySections.push({
        category: { id: name, name, description: null },
        questions: (byCategory[name] ?? []).slice(0, 4),
      });
    }
  });

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        {/* Hero + Smart Search */}
        <section className="relative border-b border-slate-100 bg-slate-50/50 px-4 py-16 sm:py-24">
          <div className="mx-auto max-w-3xl text-center">
            <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Klinik HR Indonesia
            </h1>
            <p className="mt-3 text-lg text-slate-600">
              Referensi & solusi praktis masalah ketenagakerjaan
            </p>
            <div className="mt-10 relative" ref={searchRef}>
              <div className="relative">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  placeholder="Cari solusi masalah HR..."
                  className="w-full rounded-xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  aria-label="Cari solusi HR"
                  aria-autocomplete="list"
                  aria-expanded={showSuggestions}
                />
              </div>
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 z-20 mt-2 max-h-80 overflow-y-auto rounded-xl border border-slate-200 bg-white shadow-lg">
                  {searchTerm ? (
                    suggestions.length > 0 ? (
                      suggestions.slice(0, 8).map((q) => (
                        <Link
                          key={q.id}
                          href={`/solusi/${q.slug ?? q.id}`}
                          className="block border-b border-slate-100 px-4 py-3 text-left hover:bg-emerald-50 transition-colors last:border-0"
                        >
                          <p className="font-medium text-slate-900 line-clamp-1">{q.question_text}</p>
                          {q.categories?.name && (
                            <span className="text-xs text-slate-500 mt-0.5 block">{q.categories.name}</span>
                          )}
                        </Link>
                      ))
                    ) : (
                      <div className="px-4 py-6 text-center text-slate-500">Tidak ada hasil</div>
                    )
                  ) : (
                    <>
                      <p className="px-4 py-2 text-xs font-medium text-slate-500 uppercase">Artikel terbaru</p>
                      {questions.slice(0, 5).map((q) => (
                        <Link
                          key={q.id}
                          href={`/solusi/${q.slug ?? q.id}`}
                          className="block border-b border-slate-100 px-4 py-3 text-left hover:bg-emerald-50 transition-colors last:border-0"
                        >
                          <p className="font-medium text-slate-900 line-clamp-1">{q.question_text}</p>
                          {q.categories?.name && (
                            <span className="text-xs text-slate-500 mt-0.5 block">{q.categories.name}</span>
                          )}
                        </Link>
                      ))}
                    </>
                  )}
                </div>
              )}
            </div>
            <p className="mt-4 flex flex-wrap justify-center gap-2 text-sm text-slate-500">
              <span>Populer:</span>
              {['Gaji & Payroll', 'Kontrak Kerja', 'PHK', 'BPJS', 'Rekrutmen'].map((t) => (
                <Link key={t} href={`/?q=${encodeURIComponent(t)}`} className="hover:text-emerald-600">
                  {t}
                </Link>
              ))}
            </p>
          </div>
        </section>

        {/* Featured - Solusi Unggulan */}
        {!loading && featuredQuestions.length > 0 && (
          <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <h2 className="flex items-center gap-2 text-xl font-semibold text-slate-900">
              <Star className="h-5 w-5 text-emerald-600" />
              Solusi Unggulan
            </h2>
            <p className="mt-1 text-slate-600">Artikel terbaru dari tim HR</p>
            <div className="mt-6 grid gap-4 sm:grid-cols-2">
              {featuredQuestions.map((q) => (
                <Link
                  key={q.id}
                  href={`/solusi/${q.slug ?? q.id}`}
                  className="group flex gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md"
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-semibold text-slate-900 group-hover:text-emerald-700 line-clamp-2">
                      {q.question_text}
                    </p>
                    {q.categories?.name && (
                      <span className="mt-2 inline-block text-sm text-emerald-600">{q.categories.name}</span>
                    )}
                  </div>
                  <ChevronRight className="h-5 w-5 shrink-0 text-slate-400 group-hover:text-emerald-500" />
                </Link>
              ))}
            </div>
          </section>
        )}

        {/* Category Navigation */}
        <section className="border-t border-slate-100 bg-slate-50/30 py-12">
          <div className="mx-auto max-w-6xl px-4 sm:px-6">
            <h2 className="text-xl font-semibold text-slate-900">Kategori</h2>
            <p className="mt-1 text-slate-600">Pilih kategori untuk menemukan solusi yang relevan</p>
            {loading ? (
              <div className="mt-8 flex justify-center py-12">
                <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
              </div>
            ) : categories.length > 0 ? (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {categories.map((cat) => {
                  const Icon = getCategoryIcon(cat.name);
                  return (
                    <Link
                      key={cat.id}
                      href={`/?kategori=${encodeURIComponent(cat.name)}`}
                      className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md"
                    >
                      <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{cat.name}</h3>
                        <p className="mt-1 text-sm text-slate-600">
                          {cat.description || 'Lihat pertanyaan di kategori ini'}
                        </p>
                      </div>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="mt-8 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                {[
                  { name: 'Gaji & Payroll', desc: 'Informasi penggajian, tunjangan, dan BPJS ketenagakerjaan' },
                  { name: 'Kontrak Kerja', desc: 'Perjanjian kerja, PKWT, PKWTT, dan regulasi ketenagakerjaan' },
                  { name: 'Rekrutmen', desc: 'Proses rekrutmen, seleksi, dan onboarding karyawan baru' },
                ].map((cat) => {
                  const Icon = getCategoryIcon(cat.name);
                  return (
                    <div
                      key={cat.name}
                      className="flex items-start gap-4 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm"
                    >
                      <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
                        <Icon className="h-6 w-6" />
                      </div>
                      <div>
                        <h3 className="font-semibold text-slate-900">{cat.name}</h3>
                        <p className="mt-1 text-sm text-slate-600">{cat.desc}</p>
                      </div>
                    </div>
                  );
                })}
              </div>
            )}
          </div>
        </section>

        {/* Daftar Solusi per kategori (seksi) */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
          {loading ? (
            <div className="flex justify-center py-12">
              <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
            </div>
          ) : categorySections.length === 0 && featuredQuestions.length === 0 ? (
            <p className="text-center text-slate-500">Belum ada pertanyaan.</p>
          ) : (
            <div className="space-y-14">
              {categorySections.map(({ category, questions: sectionQuestions }) => {
                const Icon = getCategoryIcon(category.name);
                return (
                  <div key={category.id}>
                    <div className="flex flex-wrap items-center justify-between gap-4">
                      <div className="flex items-center gap-3">
                        <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
                          <Icon className="h-5 w-5" />
                        </div>
                        <div>
                          <h2 className="text-xl font-semibold text-slate-900">
                            Seksi {category.name}
                          </h2>
                          <p className="mt-0.5 text-sm text-slate-600">
                            {category.description || `Artikel terbaru seputar ${category.name}`}
                          </p>
                        </div>
                      </div>
                      <Link
                        href={`/?kategori=${encodeURIComponent(category.name)}`}
                        className="inline-flex items-center gap-1.5 rounded-lg border border-emerald-600 bg-white px-4 py-2.5 text-sm font-medium text-emerald-600 transition-colors hover:bg-emerald-50"
                      >
                        Lihat Semua
                        <ChevronRight className="h-4 w-4" />
                      </Link>
                    </div>
                    <div className="mt-6 grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                      {sectionQuestions.map((q) => (
                        <Link
                          key={q.id}
                          href={`/solusi/${q.slug ?? q.id}`}
                          className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-5 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md"
                        >
                          <p className="font-semibold text-slate-900 group-hover:text-emerald-700 line-clamp-2">
                            {q.question_text}
                          </p>
                          {q.categories?.name && (
                            <span className="mt-2 inline-block text-sm text-emerald-600">
                              {q.categories.name}
                            </span>
                          )}
                          <span className="mt-auto pt-3 inline-flex items-center text-sm text-slate-500 group-hover:text-emerald-600">
                            Baca selengkapnya
                            <ChevronRight className="ml-1 h-4 w-4" />
                          </span>
                        </Link>
                      ))}
                    </div>
                  </div>
                );
              })}
            </div>
          )}
        </section>
      </main>
    </div>
  );
}
