'use client';

import { useEffect, useState, useRef } from 'react';
import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import {
  Search,
  Wallet,
  FileText,
  Users,
  ChevronRight,
  Loader2,
  Flame,
  Briefcase,
  Building2,
  Calculator,
  FileCheck2,
  MessageSquare,
} from 'lucide-react';
import { Header } from '@/components/Header';
import { FormAjukanPertanyaan } from '@/components/FormAjukanPertanyaan';
import { generateSlug } from '@/lib/slug';

interface Category {
  id: string;
  name: string;
  description: string | null;
  slug: string;
}

interface Question {
  id: string;
  slug: string | null;
  question_text: string;
  answer: string | null;
  categories: { name: string } | null;
}

function getAnswerPreview(answer: string | null, maxLength = 100) {
  if (!answer) return 'Belum ada jawaban.';
  const plain = answer.replace(/<[^>]*>/g, '').trim();
  if (plain.length <= maxLength) return plain;
  return `${plain.slice(0, maxLength)}...`;
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
  const [hotQuestions, setHotQuestions] = useState<Question[]>([]);
  const [search, setSearch] = useState('');
  const [searchFocused, setSearchFocused] = useState(false);
  const [searchResults, setSearchResults] = useState<Question[]>([]);
  const [searchLoading, setSearchLoading] = useState(false);
  const [loading, setLoading] = useState(true);
  const searchRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    async function fetchData() {
      try {
        const [catRes, qRes] = await Promise.all([
          apiFetch<{ data: Category[] }>('/api/categories'),
          apiFetch<{ data: Question[] }>('/api/questions?limit=30'),
        ]);
        setCategories(catRes.data ?? []);
        const normalizedQuestions = qRes.data ?? [];
        setQuestions(normalizedQuestions);
        setHotQuestions(selectFallbackHotQuestions(normalizedQuestions));
      } catch (err) {
        console.error(err);
      } finally {
        setLoading(false);
      }
    }
    fetchData();
  }, []);

  // Ambil 3 solusi terpopuler berdasarkan kolom views.
  useEffect(() => {
    async function fetchHotByViews() {
      try {
        const res = await apiFetch<{ data: Question[] }>('/api/questions?sort=views&limit=3');
        if (res.data && res.data.length > 0) {
          setHotQuestions(res.data.slice(0, 3));
        }
      } catch {
        // Abaikan error tak terduga dan tetap gunakan fallback
      }
    }

    fetchHotByViews();
  }, []);

  const searchTerm = search.trim().toLowerCase();
  const showSuggestions =
    searchFocused &&
    (searchTerm
      ? searchTerm.length >= 3
      : questions.slice(0, 5).length > 0);

  // Smart Suggestion - debounced search
  useEffect(() => {
    if (searchTerm.length < 3) {
      setSearchResults([]);
      setSearchLoading(false);
      return;
    }

    let active = true;
    setSearchLoading(true);

    const handler = setTimeout(async () => {
      try {
        const res = await apiFetch<{ data: Question[] }>(
          `/api/questions?search=${encodeURIComponent(searchTerm)}&limit=10`
        );
        if (!active) return;
        setSearchResults(res.data ?? []);
      } catch {
        if (active) setSearchResults([]);
      } finally {
        if (active) {
          setSearchLoading(false);
        }
      }
    }, 300);

    return () => {
      active = false;
      clearTimeout(handler);
    };
  }, [searchTerm]);

  const featuredQuestions = questions.slice(0, 4);

  function selectFallbackHotQuestions(allQuestions: Question[]): Question[] {
    if (allQuestions.length <= 3) return allQuestions;
    // Ambil 8 terbaru lalu acak 3 di antaranya supaya tetap relevan dan bervariasi
    const latest = allQuestions.slice(0, 8);
    const shuffled = [...latest].sort(() => Math.random() - 0.5);
    return shuffled.slice(0, 3);
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main>
        {/* Hero + Smart Search */}
        <section className="relative border-b border-slate-100 bg-gradient-to-b from-emerald-50/50 via-slate-50/40 to-white py-14 sm:py-20 pl-[max(1rem,env(safe-area-inset-left))] pr-[max(1rem,env(safe-area-inset-right))] sm:pl-4 sm:pr-4">
          <div className="mx-auto max-w-3xl text-center w-full">
            <span className="inline-flex items-center rounded-full bg-emerald-100/80 px-3 py-1 text-xs font-semibold text-emerald-800">
              Portal Konsultasi &amp; Solusi Ketenagakerjaan
            </span>
            <h1 className="mt-4 text-2xl font-bold tracking-tight text-slate-900 sm:text-4xl">
              Solusi Praktis HR untuk Pekerja, HRD &amp; Pengusaha
            </h1>
            <p className="mt-3 text-base sm:text-lg text-slate-600">
              Temukan jawaban cepat seputar kontrak kerja, gaji, lembur, THR, cuti, hingga PHK—tanpa perlu menunggu antrean konsultasi satu per satu.
            </p>
            <div className="mt-10 relative w-full" ref={searchRef}>
              <div className="relative w-full">
                <Search className="absolute left-4 top-1/2 h-5 w-5 -translate-y-1/2 text-slate-400" />
                <input
                  type="search"
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  onFocus={() => setSearchFocused(true)}
                  onBlur={() => setTimeout(() => setSearchFocused(false), 200)}
                  placeholder="Cari solusi masalah HR..."
                  className="w-full rounded-2xl border border-slate-200 bg-white py-4 pl-12 pr-4 text-slate-900 shadow-sm placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  aria-label="Cari solusi HR"
                  aria-autocomplete="list"
                  aria-expanded={showSuggestions}
                />
              </div>
              {showSuggestions && (
                <div className="absolute top-full left-0 right-0 z-20 mt-2 max-h-80 overflow-y-auto rounded-2xl border border-slate-200 bg-white shadow-lg">
                  {searchTerm ? (
                    searchTerm.length < 3 ? (
                      <div className="px-4 py-3 text-sm text-slate-500 text-left">
                        Ketik minimal <span className="font-semibold text-emerald-600">3 karakter</span> untuk mencari.
                      </div>
                    ) : searchLoading ? (
                      <div className="px-4 py-6 text-center text-slate-500 text-sm">Mencari solusi...</div>
                    ) : searchResults.length > 0 ? (
                      searchResults.slice(0, 8).map((q) => (
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
                      <div className="px-4 py-6 text-center text-slate-500 text-sm">
                        Tidak ada hasil. Ajukan pertanyaan di bawah halaman.
                      </div>
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
              {[
                { label: 'Gaji, Lembur & THR', slug: 'gaji-lembur-thr' },
                { label: 'Kontrak Kerja', slug: 'kontrak-kerja' },
                { label: 'PHK & Pesangon', slug: 'phk-pesangon' },
                { label: 'BPJS', slug: 'bpjs-jaminan-sosial' },
                { label: 'Hak Pekerja', slug: 'hak-pekerja' },
              ].map((t) => (
                <Link
                  key={t.slug}
                  href={`/solusi?kategori=${t.slug}`}
                  className="rounded-full bg-white px-2.5 py-0.5 border border-slate-200 text-slate-600 hover:border-emerald-300 hover:text-emerald-700 transition-colors"
                >
                  {t.label}
                </Link>
              ))}
            </p>
          </div>
        </section>

        {/* Jalur Cepat Sesuai Peran: Pekerja, HRD, Pengusaha */}
        <section className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
          <div className="flex flex-col sm:flex-row sm:items-end sm:justify-between gap-2 mb-6">
            <div>
              <h2 className="text-xl font-semibold text-slate-900">Mulai Sesuai Kebutuhan Anda</h2>
              <p className="mt-1 text-sm text-slate-600">
                Pilih peran Anda untuk langsung menuju panduan dan alat bantu yang paling relevan.
              </p>
            </div>
            <Link href="/solusi" className="text-sm font-medium text-emerald-600 hover:text-emerald-700 inline-flex items-center">
              Lihat semua solusi
              <ChevronRight className="ml-1 h-4 w-4" />
            </Link>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <Link
              href="/solusi?kategori=hak-pekerja"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md"
            >
              <div className="inline-flex rounded-xl bg-emerald-100 p-3 text-emerald-700">
                <Users className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 group-hover:text-emerald-700">
                Untuk Pekerja &amp; Karyawan
              </h3>
              <p className="mt-1.5 text-sm text-slate-600">
                Pahami hak PKWT/PKWTT, upah lembur, THR, cuti, BPJS, penahanan ijazah, hingga langkah menghadapi PHK.
              </p>
              <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-600">
                Cek hak pekerja <ChevronRight className="ml-1 h-4 w-4" />
              </span>
            </Link>

            <Link
              href="/solusi?kategori=kontrak-kerja"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md"
            >
              <div className="inline-flex rounded-xl bg-sky-100 p-3 text-sky-700">
                <Briefcase className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 group-hover:text-emerald-700">
                Untuk Praktisi HRD
              </h3>
              <p className="mt-1.5 text-sm text-slate-600">
                Referensi cepat aturan PP 35/2021 &amp; PP 36/2021 untuk kontrak, SP, cuti, dan kepatuhan administrasi SDM.
              </p>
              <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-600">
                Lihat panduan HRD <ChevronRight className="ml-1 h-4 w-4" />
              </span>
            </Link>

            <Link
              href="/konsultasi-pro"
              className="group rounded-2xl border border-slate-200 bg-white p-6 shadow-sm transition-all hover:border-emerald-300 hover:shadow-md"
            >
              <div className="inline-flex rounded-xl bg-amber-100 p-3 text-amber-700">
                <Building2 className="h-6 w-6" />
              </div>
              <h3 className="mt-4 text-lg font-semibold text-slate-900 group-hover:text-emerald-700">
                Untuk Pengusaha &amp; UMKM
              </h3>
              <p className="mt-1.5 text-sm text-slate-600">
                Susun hubungan kerja yang aman dari sengketa Disnaker, hitung kompensasi/pesangon, atau ajukan konsultasi kasus.
              </p>
              <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-600">
                Konsultasi &amp; solusi bisnis <ChevronRight className="ml-1 h-4 w-4" />
              </span>
            </Link>
          </div>

          {/* Alat Bantu Mandiri */}
          <div className="mt-6 grid gap-3 sm:grid-cols-3">
            <Link
              href="/kalkulator"
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors"
            >
              <Calculator className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Kalkulator Pesangon &amp; HR</p>
                <p className="text-xs text-slate-500">Simulasi hitungan mandiri</p>
              </div>
            </Link>
            <Link
              href="/cek-dokumen"
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors"
            >
              <FileCheck2 className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Cek Kelengkapan Kontrak</p>
                <p className="text-xs text-slate-500">Audit mandiri PKWT / PKWTT</p>
              </div>
            </Link>
            <Link
              href="/konsultasi-pro"
              className="flex items-center gap-3 rounded-xl border border-slate-200 bg-slate-50/70 px-4 py-3 hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors"
            >
              <MessageSquare className="h-5 w-5 text-emerald-600 shrink-0" />
              <div>
                <p className="text-sm font-semibold text-slate-900">Konsultasi Pro</p>
                <p className="text-xs text-slate-500">Kirim kasus kompleks terstruktur</p>
              </div>
            </Link>
          </div>
        </section>

        {/* Hot / Trending Topics - Featured Section */}
        {!loading && hotQuestions.length > 0 && (
          <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6">
            <h2 className="flex items-center gap-2 text-2xl font-semibold text-slate-900">
              <Flame className="h-6 w-6 text-emerald-600" />
              Hot / Trending Topics
            </h2>
            <p className="mt-1 text-slate-600">
              Tiga solusi yang paling sering diakses atau terbaru dari pengguna Klinik HR.
            </p>
            <div className="mt-8 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {hotQuestions.slice(0, 3).map((q) => (
                <Link
                  key={q.id}
                  href={`/solusi/${q.slug ?? q.id}`}
                  className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-6 shadow-md transition-transform transition-shadow duration-200 hover:border-emerald-200 hover:shadow-lg hover:-translate-y-1"
                >
                  <div className="flex items-center justify-between gap-2">
                    {q.categories?.name && (
                      <span className="inline-flex items-center rounded-full bg-emerald-50 px-3 py-1 text-xs font-semibold text-emerald-700">
                        {q.categories.name}
                      </span>
                    )}
                    <span className="inline-flex items-center rounded-full bg-emerald-600/10 px-3 py-1 text-[11px] font-semibold uppercase tracking-wide text-emerald-700">
                      <Flame className="mr-1 h-3 w-3" />
                      HOT
                    </span>
                  </div>
                  <h3 className="mt-3 text-lg sm:text-xl font-semibold text-slate-900 line-clamp-2 group-hover:text-emerald-700">
                    {q.question_text}
                  </h3>
                  <p className="mt-3 text-sm text-slate-600 line-clamp-3">
                    {getAnswerPreview(q.answer)}
                  </p>
                  <span className="mt-4 inline-flex items-center text-sm font-medium text-emerald-600 group-hover:text-emerald-700">
                    Baca selengkapnya
                    <ChevronRight className="ml-1 h-4 w-4" />
                  </span>
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
              <>
                {/* Mobile: horizontal scroll, kartu compact, ikon di atas teks */}
                <div className="mt-8 md:hidden relative -mx-4 px-4">
                  <div className="flex gap-3 overflow-x-auto overflow-y-hidden pb-2 scrollbar-hide snap-x snap-mandatory">
                    {categories.map((cat) => {
                      const Icon = getCategoryIcon(cat.name);
                      return (
                        <Link
                          key={cat.id}
                          href={`/solusi?kategori=${cat.slug}`}
                          className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-4 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md flex-shrink-0 w-[120px] snap-start"
                        >
                          <div className="rounded-lg bg-emerald-100 p-2.5 text-emerald-700">
                            <Icon className="h-5 w-5" />
                          </div>
                          <h3 className="mt-2 text-xs font-semibold text-slate-900 text-center line-clamp-2 leading-tight">
                            {cat.name}
                          </h3>
                        </Link>
                      );
                    })}
                  </div>
                  <div className="pointer-events-none absolute top-0 right-0 bottom-2 w-14 bg-gradient-to-l from-slate-50/95 to-transparent" aria-hidden />
                </div>
                {/* Desktop: grid seperti sebelumnya */}
                <div className="mt-8 hidden md:grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
                  {categories.map((cat) => {
                    const Icon = getCategoryIcon(cat.name);
                    return (
                      <Link
                        key={cat.id}
                        href={`/solusi?kategori=${cat.slug}`}
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
              </>
            ) : (
              <>
                {/* Mobile: horizontal scroll fallback */}
                <div className="mt-8 md:hidden relative -mx-4 px-4">
                  <div className="flex gap-3 overflow-x-auto overflow-y-hidden pb-2 scrollbar-hide">
                    {[
                      { name: 'Gaji & Payroll', desc: 'Informasi penggajian, tunjangan, dan BPJS ketenagakerjaan' },
                      { name: 'Kontrak Kerja', desc: 'Perjanjian kerja, PKWT, PKWTT, dan regulasi ketenagakerjaan' },
                      { name: 'Rekrutmen', desc: 'Proses rekrutmen, seleksi, dan onboarding karyawan baru' },
                    ].map((cat) => {
                      const Icon = getCategoryIcon(cat.name);
                      return (
                        <Link
                          key={cat.name}
                          href={`/solusi?kategori=${generateSlug(cat.name)}`}
                          className="flex flex-col items-center rounded-2xl border border-slate-200 bg-white p-4 shadow-sm flex-shrink-0 w-[120px]"
                        >
                          <div className="rounded-lg bg-emerald-100 p-2.5 text-emerald-700">
                            <Icon className="h-5 w-5" />
                          </div>
                          <h3 className="mt-2 text-xs font-semibold text-slate-900 text-center line-clamp-2 leading-tight">
                            {cat.name}
                          </h3>
                        </Link>
                      );
                    })}
                  </div>
                  <div className="pointer-events-none absolute top-0 right-0 bottom-2 w-14 bg-gradient-to-l from-slate-50/95 to-transparent" aria-hidden />
                </div>
                {/* Desktop: grid fallback */}
                <div className="mt-8 hidden md:grid gap-4 sm:grid-cols-2 lg:grid-cols-3">
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
              </>
            )}
          </div>
        </section>

        {/* Daftar Solusi - maksimal 4 terbaru, mobile 1 kolom ramping */}
        {!loading && featuredQuestions.length > 0 && (
          <section className="mx-auto max-w-6xl px-4 pb-4 sm:px-6">
            <h2 className="text-xl font-semibold text-slate-900">Daftar Solusi</h2>
            <p className="mt-1 text-slate-600">
              Kumpulan solusi terbaru dari berbagai kategori.
            </p>
            <div className="mt-4 md:mt-6 grid grid-cols-1 gap-2 sm:gap-4 sm:grid-cols-2 lg:grid-cols-3">
              {featuredQuestions.map((q) => (
                <Link
                  key={q.id}
                  href={`/solusi/${q.slug ?? q.id}`}
                  className="group flex flex-col rounded-2xl border border-slate-200 bg-white p-3 shadow-sm transition-all hover:border-emerald-200 hover:shadow-md hover:-translate-y-0.5 sm:p-5"
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
            <Link
              href="/solusi"
              className="mt-4 sm:mt-6 flex items-center justify-center gap-2 rounded-2xl bg-emerald-600 px-5 py-3.5 text-sm font-semibold text-white shadow-md hover:bg-emerald-700 transition-colors w-full sm:w-auto sm:inline-flex"
            >
              Lihat Semua Solusi
              <ChevronRight className="h-4 w-4" />
            </Link>
          </section>
        )}

        {/* Form Ajukan Pertanyaan */}
        <section className="mx-auto max-w-6xl px-4 py-12 sm:px-6 border-t border-slate-100">
          <div className="max-w-2xl">
            <FormAjukanPertanyaan />
          </div>
        </section>
      </main>
    </div>
  );
}
