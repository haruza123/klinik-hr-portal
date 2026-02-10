'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { supabase } from '@/lib/supabase';
import { RichTextEditor } from '@/components/RichTextEditorClient';
import { Loader2, Pencil, Trash2, Plus } from 'lucide-react';
import { cn } from '@/lib/utils';
import { Header } from '@/components/Header';
import { generateSlug } from '@/lib/slug';

interface Category {
  id: string;
  name: string;
  description: string | null;
}

interface Question {
  id: string;
  slug: string | null;
  category_id: string;
  question_text: string;
  answer: string | null;
  question_order: number;
  is_required: boolean;
  created_at: string;
  categories?: { name: string } | null;
}

export default function AdminPage() {
  const router = useRouter();
  const [categories, setCategories] = useState<Category[]>([]);
  const [questions, setQuestions] = useState<Question[]>([]);
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [editingId, setEditingId] = useState<string | null>(null);
  const [checkingAuth, setCheckingAuth] = useState(true);

  const [title, setTitle] = useState('');
  const [categoryId, setCategoryId] = useState('');
  const [answer, setAnswer] = useState('');

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();

      if (!session) {
        router.replace('/login');
        return;
      }

      await Promise.all([fetchCategories(), fetchQuestions()]);
      setCheckingAuth(false);
    };

    void init();
  }, [router]);

  async function fetchCategories() {
    const { data, error } = await supabase
      .from('categories')
      .select('id, name, description')
      .order('name');
    if (!error) setCategories(data ?? []);
  }

  async function fetchQuestions() {
    const { data, error } = await supabase
      .from('questions')
      .select('id, slug, category_id, question_text, answer, question_order, is_required, created_at, categories ( name )')
      .order('created_at', { ascending: false });
    if (!error) setQuestions(data ?? []);
    setLoading(false);
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
  }

  async function handlePublish(e: React.FormEvent) {
    e.preventDefault();
    if (!title.trim() || !categoryId) return;

    setSaving(true);
    const slug = generateSlug(title);

    try {
      if (editingId) {
        const { error } = await supabase
          .from('questions')
          .update({
            question_text: title.trim(),
            category_id: categoryId,
            answer: answer || null,
            slug,
            updated_at: new Date().toISOString(),
          })
          .eq('id', editingId);
        if (error) throw error;
      } else {
        const { error } = await supabase.from('questions').insert({
          question_text: title.trim(),
          category_id: categoryId,
          answer: answer || null,
          slug,
        });
        if (error) throw error;
      }
      resetForm();
      await fetchQuestions();
    } catch (err) {
      console.error(err);
      alert('Gagal menyimpan. Pastikan kolom slug ada di tabel. Lihat supabase-migrations.sql');
    } finally {
      setSaving(false);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Yakin ingin menghapus pertanyaan ini?')) return;
    const { error } = await supabase.from('questions').delete().eq('id', id);
    if (error) {
      console.error(error);
      alert('Gagal menghapus.');
      return;
    }
    if (editingId === id) resetForm();
    await fetchQuestions();
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-10">
        {checkingAuth ? (
          <div className="flex items-center justify-center py-16">
            <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
          </div>
        ) : (
          <>
        <header className="mb-10">
          <h1 className="text-2xl font-semibold text-slate-900">Admin - Kelola Pertanyaan</h1>
          <p className="mt-1 text-slate-600">Tambah, edit, atau hapus pertanyaan FAQ</p>
        </header>

        <form onSubmit={handlePublish} className="space-y-6 mb-12">
          <div className="bg-white rounded-xl shadow-sm border border-slate-200 p-6">
            <h2 className="text-lg font-medium text-slate-900 mb-4">
              {editingId ? 'Edit Pertanyaan' : 'Tambah Pertanyaan Baru'}
            </h2>

            <div className="space-y-4">
              <div>
                <label htmlFor="title" className="block text-sm font-medium text-slate-700 mb-1">
                  Judul Pertanyaan
                </label>
                <input
                  id="title"
                  type="text"
                  value={title}
                  onChange={(e) => setTitle(e.target.value)}
                  placeholder="Contoh: Apa saja benefit karyawan?"
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 placeholder:text-slate-400 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                />
                {title && (
                  <p className="mt-1 text-xs text-slate-500">
                    Slug: /solusi/{generateSlug(title)}
                  </p>
                )}
              </div>

              <div>
                <label htmlFor="category" className="block text-sm font-medium text-slate-700 mb-1">
                  Kategori
                </label>
                <select
                  id="category"
                  value={categoryId}
                  onChange={(e) => setCategoryId(e.target.value)}
                  className="w-full px-4 py-2.5 rounded-lg border border-slate-200 bg-white text-slate-900 focus:outline-none focus:ring-2 focus:ring-emerald-500 focus:border-transparent"
                  required
                >
                  <option value="">Pilih kategori</option>
                  {categories.map((c) => (
                    <option key={c.id} value={c.id}>
                      {c.name}
                    </option>
                  ))}
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-1">Jawaban</label>
                <RichTextEditor
                  content={answer}
                  onChange={setAnswer}
                  placeholder="Tulis jawaban di sini. Gunakan tombol untuk format teks, list, atau upload gambar."
                />
              </div>

              <div className="flex gap-3 pt-2">
                <button
                  type="submit"
                  disabled={saving}
                  className="inline-flex items-center gap-2 px-5 py-2.5 bg-emerald-600 text-white rounded-lg font-medium hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
                >
                  {saving ? <Loader2 className="w-4 h-4 animate-spin" /> : <Plus className="w-4 h-4" />}
                  {saving ? 'Menyimpan...' : 'Publish'}
                </button>
                {editingId && (
                  <button
                    type="button"
                    onClick={resetForm}
                    className="px-5 py-2.5 text-slate-600 hover:text-slate-900 border border-slate-200 rounded-lg font-medium hover:bg-slate-50 transition-colors"
                  >
                    Batal
                  </button>
                )}
              </div>
            </div>
          </div>
        </form>

        <section>
          <h2 className="text-lg font-medium text-slate-900 mb-4">Daftar Pertanyaan</h2>

          {loading ? (
            <div className="flex items-center justify-center py-16">
              <Loader2 className="w-8 h-8 animate-spin text-slate-400" />
            </div>
          ) : questions.length === 0 ? (
            <div className="bg-white rounded-xl border border-slate-200 p-12 text-center text-slate-500">
              Belum ada pertanyaan. Tambah pertanyaan baru di atas.
            </div>
          ) : (
            <ul className="space-y-3">
              {questions.map((q) => (
                <li
                  key={q.id}
                  className={cn(
                    'flex items-start justify-between gap-4 bg-white rounded-xl border border-slate-200 p-4 transition-colors',
                    editingId === q.id
                      ? 'border-emerald-400 ring-2 ring-emerald-100'
                      : 'hover:border-slate-300'
                  )}
                >
                  <div className="min-w-0 flex-1">
                    <p className="font-medium text-slate-900">{q.question_text}</p>
                    <p className="text-sm text-slate-500 mt-0.5">
                      {q.categories?.name ?? '—'}
                    </p>
                  </div>
                  <div className="flex gap-2 shrink-0">
                    <a
                      href={`/solusi/${q.slug ?? q.id}`}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                      title="Lihat"
                    >
                      Lihat
                    </a>
                    <button
                      type="button"
                      onClick={() => startEdit(q)}
                      className="p-2 rounded-lg text-slate-600 hover:bg-slate-100 transition-colors"
                      title="Edit"
                    >
                      <Pencil className="w-4 h-4" />
                    </button>
                    <button
                      type="button"
                      onClick={() => handleDelete(q.id)}
                      className="p-2 rounded-lg text-red-600 hover:bg-red-50 transition-colors"
                      title="Hapus"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>
                </li>
              ))}
            </ul>
          )}
        </section>
          </>
        )}
      </div>
    </div>
  );
}
