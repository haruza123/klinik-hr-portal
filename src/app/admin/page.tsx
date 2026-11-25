'use client';

import { Suspense, useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter, useSearchParams } from 'next/navigation';
import { apiFetch, clearAdminTokenCookie, getAdminTokenFromCookie } from '@/lib/api';
import { RichTextEditor } from '@/components/RichTextEditorClient';
import {
  Loader2,
  Pencil,
  Trash2,
  Plus,
  Inbox,
  LogOut,
  FileText,
  FolderKanban,
  ExternalLink,
  Search,
} from 'lucide-react';
import { cn } from '@/lib/utils';
import { Header } from '@/components/Header';
import { generateSlug } from '@/lib/slug';

interface Category {
  id: string;
  name: string;
  slug: string | null;
  description: string | null;
}

interface Question {
  id: string;
  slug: string | null;
  category_id: string;
  question_text: string;
  answer: string | null;
  views?: number;
  created_at: string;
  categories: { name: string } | null;
}

interface InquirySummary {
  id: string;
  status?: string;
}

function AdminDashboardContent() {
  const router = useRouter();
  const searchParams = useSearchParams();
  const draftTitle = searchParams.get('draftTitle') || '';

  const [categories, setCategories] = useState<Category[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [newInquiriesCount, setNewInquiriesCount] = useState(0);
  const [totalInquiriesCount, setTotalInquiriesCount] = useState(0);

  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [title, setTitle] = useState(draftTitle);
  const [categoryId, setCategoryId] = useState('');
  const [answer, setAnswer] = useState('');
  const [articleSearch, setArticleSearch] = useState('');

  const [activeTab, setActiveTab] = useState<'questions' | 'categories'>('questions');
  const [categoryName, setCategoryName] = useState('');
  const [categoryDescription, setCategoryDescription] = useState('');
  const [categorySlug, setCategorySlug] = useState('');
  const [savingCategory, setSavingCategory] = useState(false);

  useEffect(() => {
    if (draftTitle) {
      setTitle(draftTitle);
      setActiveTab('questions');
    }
  }, [draftTitle]);

  useEffect(() => {
    void Promise.all([fetchCategories(), fetchQuestions(), fetchInquiriesCount()]);
  }, []);

  async function fetchCategories() {
    try {
      const res = await apiFetch<{ data: Category[] }>('/api/categories');
      setCategories(res.data ?? []);
    } catch (err) {
      console.error(err);
    }
  }

  async function fetchQuestions() {
    try {
      const res = await apiFetch<{ data: Question[] }>('/api/questions?limit=100');
      setQuestions(res.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function fetchInquiriesCount() {
    try {
      const token = getAdminTokenFromCookie();
      const res = await apiFetch<{ data: InquirySummary[] }>('/api/inquiries', { token });
      const list = res.data ?? [];
      setTotalInquiriesCount(list.length);
      setNewInquiriesCount(list.filter((i) => (i.status || 'baru') === 'baru').length);
    } catch {
      // Ignore if unauthorized
    }
  }

  function handleLogout() {
    clearAdminTokenCookie();
    router.push('/login');
  }

  function resetForm() {
    setTitle('');
    setCategoryId('');
    setAnswer('');
    setEditingId(null);
  }

  function startEdit(q: Question) {
    setEditingId(q.id);
    setTitle(q.question_text);
    setCategoryId(q.category_id);
    setAnswer(q.answer ?? '');
    setActiveTab('questions');
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !categoryId) return;

    setSaving(true);
    const slug = generateSlug(title);

    try {
      const token = getAdminTokenFromCookie();
      if (editingId) {
        await apiFetch(`/api/questions/${editingId}`, {
          method: 'PUT',
          token,
          body: JSON.stringify({
            question_text: title.trim(),
            category_id: categoryId,
            answer: answer || null,
            slug,
          }),
        });
      } else {
        await apiFetch('/api/questions', {
          method: 'POST',
          token,
          body: JSON.stringify({
            question_text: title.trim(),
            category_id: categoryId,
            answer: answer || null,
            slug,
          }),
        });
      }
      resetForm();
      await fetchQuestions();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan pertanyaan. Pastikan Anda sudah login sebagai admin.');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Yakin ingin menghapus artikel pertanyaan ini?')) return;
    try {
      const token = getAdminTokenFromCookie();
      await apiFetch(`/api/questions/${id}`, { method: 'DELETE', token });
      if (editingId === id) resetForm();
      await fetchQuestions();
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus.');
    }
  }

  function handleCategoryNameChange(value: string) {
    setCategoryName(value);
    setCategorySlug(generateSlug(value));
  }

  async function handleSaveCategory(e: React.FormEvent) {
    e.preventDefault();
    if (!categoryName.trim()) return;

    setSavingCategory(true);
    const slug = categorySlug.trim() || generateSlug(categoryName);

    try {
      const token = getAdminTokenFromCookie();
      await apiFetch('/api/categories', {
        method: 'POST',
        token,
        body: JSON.stringify({
          name: categoryName.trim(),
          slug: slug || null,
          description: categoryDescription.trim() || null,
        }),
      });
      setCategoryName('');
      setCategoryDescription('');
      setCategorySlug('');
      await fetchCategories();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan kategori.');
    } finally {
      setSavingCategory(false);
    }
  }

  const filteredQuestions = questions.filter((q) => {
    if (!articleSearch.trim()) return true;
    const term = articleSearch.toLowerCase();
    return (
      q.question_text.toLowerCase().includes(term) ||
      (q.categories?.name || '').toLowerCase().includes(term)
    );
  });

  return (
    <div className="min-h-screen bg-slate-50/60">
      <Header />

      <div className="mx-auto max-w-6xl px-4 py-8 sm:px-6">
        {/* Top Admin Header */}
        <header className="mb-8 flex flex-wrap items-center justify-between gap-4 rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
          <div>
            <span className="inline-flex items-center rounded-full bg-emerald-50 px-2.5 py-0.5 text-xs font-semibold text-emerald-700">
              Admin Console
            </span>
            <h1 className="mt-1 text-2xl font-bold text-slate-900">Dashboard Klinik HR</h1>
            <p className="text-sm text-slate-500">
              Kelola artikel solusi, kategori, dan pertanyaan konsultasi masuk
            </p>
          </div>

          <div className="flex flex-wrap items-center gap-2.5">
            <Link
              href="/admin/inquiries"
              className="inline-flex items-center gap-2 rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm font-medium text-slate-700 hover:border-emerald-300 hover:bg-emerald-50/40 transition-colors"
            >
              <Inbox className="h-4 w-4 text-emerald-600" />
              <span>Pertanyaan Masuk</span>
              {newInquiriesCount > 0 && (
                <span className="rounded-full bg-emerald-600 px-2 py-0.5 text-xs font-semibold text-white">
                  {newInquiriesCount} baru
                </span>
              )}
            </Link>

            <Link
              href="/"
              className="inline-flex items-center gap-1.5 rounded-xl border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 transition-colors"
            >
              <ExternalLink className="h-4 w-4" />
              <span className="hidden sm:inline">Lihat Portal</span>
            </Link>

            <button
              type="button"
              onClick={handleLogout}
              className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2.5 text-sm font-medium text-rose-700 hover:bg-rose-100 transition-colors"
            >
              <LogOut className="h-4 w-4" />
              <span>Logout</span>
            </button>
          </div>
        </header>

        {/* Stat Cards */}
        <div className="mb-8 grid gap-4 sm:grid-cols-3">
          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Total Artikel Solusi</p>
              <FileText className="h-5 w-5 text-emerald-600" />
            </div>
            <p className="mt-2 text-3xl font-bold text-slate-900">{questions.length}</p>
            <p className="mt-1 text-xs text-slate-500">Siap diakses oleh pekerja &amp; HRD</p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Total Kategori</p>
              <FolderKanban className="h-5 w-5 text-sky-600" />
            </div>
            <p className="mt-2 text-3xl font-bold text-slate-900">{categories.length}</p>
            <p className="mt-1 text-xs text-slate-500">Topik ketenagakerjaan aktif</p>
          </div>

          <Link
            href="/admin/inquiries"
            className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm hover:border-emerald-300 transition-colors"
          >
            <div className="flex items-center justify-between">
              <p className="text-sm font-medium text-slate-500">Pertanyaan Masuk</p>
              <Inbox className="h-5 w-5 text-amber-600" />
            </div>
            <p className="mt-2 text-3xl font-bold text-slate-900">
              {newInquiriesCount}{' '}
              <span className="text-sm font-normal text-slate-500">
                baru / {totalInquiriesCount} total
              </span>
            </p>
            <p className="mt-1 text-xs text-emerald-600 font-medium">Klik untuk kelola &amp; jadikan artikel →</p>
          </Link>
        </div>

        {/* Mode Tabs */}
        <div className="flex gap-1 p-1 rounded-xl bg-white border border-slate-200 w-fit mb-6 shadow-sm">
          <button
            type="button"
            onClick={() => setActiveTab('questions')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
              activeTab === 'questions'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            {editingId ? 'Edit Artikel Solusi' : 'Buat / Kelola Artikel'}
          </button>
          <button
            type="button"
            onClick={() => setActiveTab('categories')}
            className={cn(
              'px-4 py-2 rounded-lg text-sm font-semibold transition-colors',
              activeTab === 'categories'
                ? 'bg-emerald-600 text-white'
                : 'text-slate-600 hover:text-slate-900'
            )}
          >
            Kelola Kategori
          </button>
        </div>

        {activeTab === 'questions' ? (
          <div className="grid gap-8 lg:grid-cols-12">
            {/* Left: Form Editor */}
            <div className="lg:col-span-7">
              <form
                onSubmit={handlePublish}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-5"
              >
                <div className="flex items-center justify-between border-b border-slate-100 pb-4">
                  <h2 className="text-lg font-semibold text-slate-900">
                    {editingId ? 'Edit Artikel Solusi' : 'Tambah Artikel Solusi Baru'}
                  </h2>
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="text-xs font-medium text-slate-500 hover:text-slate-800"
                    >
                      Batal Edit
                    </button>
                  )}
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Judul Pertanyaan / Masalah <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={title}
                    onChange={(e) => setTitle(e.target.value)}
                    placeholder="Contoh: Bagaimana cara menghitung uang lembur hari libur?"
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Kategori <span className="text-red-500">*</span>
                  </label>
                  <select
                    required
                    value={categoryId}
                    onChange={(e) => setCategoryId(e.target.value)}
                    className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    <option value="">-- Pilih Kategori --</option>
                    {categories.map((c) => (
                      <option key={c.id} value={c.id}>
                        {c.name}
                      </option>
                    ))}
                  </select>
                </div>

                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Jawaban &amp; Panduan Lengkap
                  </label>
                  <RichTextEditor
                    content={answer}
                    onChange={setAnswer}
                    placeholder="Tulis jawaban lengkap, dasar hukum, dan langkah praktisnya di sini..."
                  />
                </div>

                <div className="flex items-center gap-3 pt-2">
                  <button
                    type="submit"
                    disabled={saving}
                    className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-60"
                  >
                    {saving ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                    {saving ? 'Menyimpan...' : editingId ? 'Simpan Perubahan' : 'Publish Artikel'}
                  </button>
                  {editingId && (
                    <button
                      type="button"
                      onClick={resetForm}
                      className="rounded-xl border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-600 hover:bg-slate-50"
                    >
                      Batal
                    </button>
                  )}
                </div>
              </form>
            </div>

            {/* Right: Daftar Artikel */}
            <div className="lg:col-span-5 space-y-4">
              <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm">
                <div className="flex items-center justify-between gap-2 mb-4">
                  <h2 className="text-base font-semibold text-slate-900">
                    Daftar Artikel ({filteredQuestions.length})
                  </h2>
                </div>

                <div className="relative mb-4">
                  <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
                  <input
                    type="search"
                    value={articleSearch}
                    onChange={(e) => setArticleSearch(e.target.value)}
                    placeholder="Cari artikel atau kategori..."
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 py-2 pl-9 pr-3 text-sm text-slate-900 focus:border-emerald-500 focus:bg-white focus:outline-none"
                  />
                </div>

                {loading ? (
                  <div className="flex justify-center py-10">
                    <Loader2 className="h-6 w-6 animate-spin text-slate-400" />
                  </div>
                ) : filteredQuestions.length === 0 ? (
                  <p className="text-sm text-slate-500 text-center py-8">
                    Tidak ada artikel ditemukan.
                  </p>
                ) : (
                  <ul className="space-y-2.5 max-h-[620px] overflow-y-auto pr-1">
                    {filteredQuestions.map((q) => (
                      <li
                        key={q.id}
                        className="rounded-xl border border-slate-200 p-3.5 hover:border-emerald-200 transition-colors"
                      >
                        <div className="flex items-start justify-between gap-2">
                          <div className="min-w-0">
                            {q.categories?.name && (
                              <span className="inline-block rounded-full bg-emerald-50 px-2 py-0.5 text-[11px] font-medium text-emerald-700 mb-1">
                                {q.categories.name}
                              </span>
                            )}
                            <p className="text-sm font-medium text-slate-900 line-clamp-2">
                              {q.question_text}
                            </p>
                            <p className="mt-1 text-[11px] text-slate-400">
                              Views: {q.views ?? 0}
                            </p>
                          </div>
                          <div className="flex items-center gap-1 shrink-0">
                            <button
                              type="button"
                              onClick={() => startEdit(q)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-slate-100 hover:text-emerald-700"
                              title="Edit"
                            >
                              <Pencil className="h-4 w-4" />
                            </button>
                            <button
                              type="button"
                              onClick={() => handleDelete(q.id)}
                              className="rounded-lg p-1.5 text-slate-500 hover:bg-rose-50 hover:text-rose-600"
                              title="Hapus"
                            >
                              <Trash2 className="h-4 w-4" />
                            </button>
                          </div>
                        </div>
                      </li>
                    ))}
                  </ul>
                )}
              </div>
            </div>
          </div>
        ) : (
          <div className="grid gap-8 lg:grid-cols-12">
            {/* Form Kategori */}
            <div className="lg:col-span-5">
              <form
                onSubmit={handleSaveCategory}
                className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm space-y-4"
              >
                <h2 className="text-lg font-semibold text-slate-900">Tambah Kategori Baru</h2>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">
                    Nama Kategori <span className="text-red-500">*</span>
                  </label>
                  <input
                    type="text"
                    required
                    value={categoryName}
                    onChange={(e) => handleCategoryNameChange(e.target.value)}
                    placeholder="Contoh: Keselamatan Kerja (K3)"
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Slug URL</label>
                  <input
                    type="text"
                    value={categorySlug}
                    onChange={(e) => setCategorySlug(e.target.value)}
                    placeholder="keselamatan-kerja-k3"
                    className="w-full rounded-xl border border-slate-200 bg-slate-50 px-3.5 py-2 text-sm text-slate-700 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1">Deskripsi</label>
                  <textarea
                    rows={3}
                    value={categoryDescription}
                    onChange={(e) => setCategoryDescription(e.target.value)}
                    placeholder="Ringkasan topik yang dibahas..."
                    className="w-full rounded-xl border border-slate-200 px-3.5 py-2 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none"
                  />
                </div>
                <button
                  type="submit"
                  disabled={savingCategory}
                  className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 disabled:opacity-60"
                >
                  {savingCategory ? <Loader2 className="h-4 w-4 animate-spin" /> : <Plus className="h-4 w-4" />}
                  Simpan Kategori
                </button>
              </form>
            </div>

            {/* List Kategori */}
            <div className="lg:col-span-7">
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
                  Daftar Kategori ({categories.length})
                </h2>
                <div className="space-y-3">
                  {categories.map((c) => (
                    <div
                      key={c.id}
                      className="rounded-xl border border-slate-200 p-4 flex items-start justify-between gap-4"
                    >
                      <div>
                        <p className="font-semibold text-slate-900">{c.name}</p>
                        <p className="text-xs text-slate-400 mt-0.5">/{c.slug}</p>
                        {c.description && (
                          <p className="text-sm text-slate-600 mt-1">{c.description}</p>
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default function AdminPage() {
  return (
    <Suspense
      fallback={
        <div className="min-h-screen flex items-center justify-center bg-slate-50">
          <Loader2 className="h-8 w-8 animate-spin text-emerald-600" />
        </div>
      }
    >
      <AdminDashboardContent />
    </Suspense>
  );
}
