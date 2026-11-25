'use client';

import { useEffect, useState } from 'react';
import Link from 'next/link';
import { useRouter } from 'next/navigation';
import { apiFetch, clearAdminTokenCookie, getAdminTokenFromCookie } from '@/lib/api';
import {
  Loader2,
  ChevronRight,
  Inbox,
  CheckCircle2,
  Trash2,
  FilePlus2,
  RotateCcw,
  LogOut,
  Mail,
} from 'lucide-react';
import { Header } from '@/components/Header';

interface Inquiry {
  id: string;
  question: string;
  email: string | null;
  status?: string;
  created_at: string;
}

export default function AdminInquiriesPage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [filter, setFilter] = useState<'all' | 'baru' | 'selesai'>('all');
  const [busyId, setBusyId] = useState<string | null>(null);

  useEffect(() => {
    void loadInquiries();
  }, []);

  async function loadInquiries() {
    try {
      const token = getAdminTokenFromCookie();
      const res = await apiFetch<{ data: Inquiry[] }>('/api/inquiries', { token });
      setInquiries(res.data ?? []);
    } catch (err) {
      console.error(err);
    } finally {
      setLoading(false);
    }
  }

  async function handleToggleStatus(inq: Inquiry) {
    const nextStatus = (inq.status || 'baru') === 'selesai' ? 'baru' : 'selesai';
    setBusyId(inq.id);
    try {
      const token = getAdminTokenFromCookie();
      await apiFetch(`/api/inquiries/${inq.id}`, {
        method: 'PATCH',
        token,
        body: JSON.stringify({ status: nextStatus }),
      });
      setInquiries((prev) =>
        prev.map((item) => (item.id === inq.id ? { ...item, status: nextStatus } : item))
      );
    } catch (err) {
      console.error(err);
      alert('Gagal mengubah status.');
    } finally {
      setBusyId(null);
    }
  }

  async function handleDelete(id: string) {
    if (!confirm('Yakin ingin menghapus pertanyaan masuk ini?')) return;
    setBusyId(id);
    try {
      const token = getAdminTokenFromCookie();
      await apiFetch(`/api/inquiries/${id}`, { method: 'DELETE', token });
      setInquiries((prev) => prev.filter((item) => item.id !== id));
    } catch (err) {
      console.error(err);
      alert('Gagal menghapus pertanyaan.');
    } finally {
      setBusyId(null);
    }
  }

  function handleTurnIntoArticle(inq: Inquiry) {
    const firstLine = inq.question
      .replace(/^\[Konsultasi Pro[^\]]*\]\s*/i, '')
      .split('\n')[0]
      .trim()
      .slice(0, 140);
    router.push(`/admin?draftTitle=${encodeURIComponent(firstLine)}`);
  }

  function handleLogout() {
    clearAdminTokenCookie();
    router.push('/login');
  }

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  const baruCount = inquiries.filter((i) => (i.status || 'baru') === 'baru').length;
  const selesaiCount = inquiries.filter((i) => i.status === 'selesai').length;
  const filtered = inquiries.filter((i) => {
    const st = i.status || 'baru';
    if (filter === 'all') return true;
    return st === filter;
  });

  return (
    <div className="min-h-screen bg-slate-50/60">
      <Header />
      <div className="max-w-5xl mx-auto px-4 py-8 sm:px-6">
        <div className="mb-6 flex flex-wrap items-center justify-between gap-3">
          <nav className="text-sm text-slate-500">
            <Link href="/admin" className="hover:text-emerald-600 transition-colors">
              Dashboard Admin
            </Link>
            <span className="mx-1.5">/</span>
            <span className="text-slate-900 font-medium">Pertanyaan Masuk</span>
          </nav>
          <button
            type="button"
            onClick={handleLogout}
            className="inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-rose-50 px-3.5 py-2 text-xs font-semibold text-rose-700 hover:bg-rose-100 transition-colors"
          >
            <LogOut className="h-3.5 w-3.5" />
            Logout
          </button>
        </div>

        <header className="mb-6 rounded-2xl border border-slate-200 bg-white p-6 shadow-sm flex flex-wrap items-center justify-between gap-4">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
              <Inbox className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-bold text-slate-900">Pertanyaan &amp; Konsultasi Masuk</h1>
              <p className="mt-0.5 text-sm text-slate-600">
                Tandai selesai, hapus, atau ubah pertanyaan berulang menjadi artikel solusi publik.
              </p>
            </div>
          </div>

          <div className="flex gap-1 rounded-xl bg-slate-100 p-1 border border-slate-200 text-xs font-semibold">
            <button
              type="button"
              onClick={() => setFilter('all')}
              className={`rounded-lg px-3 py-1.5 transition-colors ${
                filter === 'all' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Semua ({inquiries.length})
            </button>
            <button
              type="button"
              onClick={() => setFilter('baru')}
              className={`rounded-lg px-3 py-1.5 transition-colors ${
                filter === 'baru' ? 'bg-white text-emerald-700 shadow-sm' : 'text-slate-600'
              }`}
            >
              Baru ({baruCount})
            </button>
            <button
              type="button"
              onClick={() => setFilter('selesai')}
              className={`rounded-lg px-3 py-1.5 transition-colors ${
                filter === 'selesai' ? 'bg-white text-slate-900 shadow-sm' : 'text-slate-600'
              }`}
            >
              Selesai ({selesaiCount})
            </button>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : filtered.length === 0 ? (
          <div className="rounded-2xl border border-slate-200 bg-white p-12 text-center text-slate-500">
            Tidak ada pertanyaan pada filter ini.
          </div>
        ) : (
          <ul className="space-y-4">
            {filtered.map((inq) => {
              const isDone = inq.status === 'selesai';
              const isBusy = busyId === inq.id;
              return (
                <li
                  key={inq.id}
                  className={`rounded-2xl border p-5 shadow-sm transition-colors ${
                    isDone ? 'border-slate-200 bg-slate-50/80' : 'border-slate-200 bg-white'
                  }`}
                >
                  <div className="flex flex-wrap items-center justify-between gap-2 mb-3">
                    <span
                      className={`inline-flex items-center gap-1 rounded-full px-2.5 py-0.5 text-xs font-semibold ${
                        isDone
                          ? 'bg-slate-200 text-slate-700'
                          : 'bg-emerald-100 text-emerald-800'
                      }`}
                    >
                      {isDone ? 'Selesai' : 'Baru'}
                    </span>
                    <span className="text-xs text-slate-400">{formatDate(inq.created_at)}</span>
                  </div>

                  <p className="text-sm sm:text-base font-medium text-slate-900 whitespace-pre-wrap leading-relaxed">
                    {inq.question}
                  </p>

                  {inq.email && (
                    <div className="mt-3 inline-flex items-center gap-1.5 rounded-lg bg-slate-100 px-2.5 py-1 text-xs font-medium text-slate-700">
                      <Mail className="h-3.5 w-3.5 text-slate-500" />
                      <span>Kontak: {inq.email}</span>
                    </div>
                  )}

                  <div className="mt-4 pt-4 border-t border-slate-100 flex flex-wrap items-center gap-2">
                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleToggleStatus(inq)}
                      className={`inline-flex items-center gap-1.5 rounded-xl px-3.5 py-2 text-xs font-semibold transition-colors ${
                        isDone
                          ? 'border border-slate-200 bg-white text-slate-700 hover:bg-slate-100'
                          : 'bg-emerald-600 text-white hover:bg-emerald-700'
                      }`}
                    >
                      {isDone ? (
                        <>
                          <RotateCcw className="h-3.5 w-3.5" />
                          Buka Lagi
                        </>
                      ) : (
                        <>
                          <CheckCircle2 className="h-3.5 w-3.5" />
                          Tandai Selesai
                        </>
                      )}
                    </button>

                    <button
                      type="button"
                      onClick={() => handleTurnIntoArticle(inq)}
                      className="inline-flex items-center gap-1.5 rounded-xl border border-emerald-200 bg-emerald-50 px-3.5 py-2 text-xs font-semibold text-emerald-700 hover:bg-emerald-100 transition-colors"
                    >
                      <FilePlus2 className="h-3.5 w-3.5" />
                      Jadikan Artikel
                    </button>

                    <button
                      type="button"
                      disabled={isBusy}
                      onClick={() => handleDelete(inq.id)}
                      className="ml-auto inline-flex items-center gap-1.5 rounded-xl border border-rose-200 bg-white px-3 py-2 text-xs font-semibold text-rose-600 hover:bg-rose-50 transition-colors"
                    >
                      <Trash2 className="h-3.5 w-3.5" />
                      Hapus
                    </button>
                  </div>
                </li>
              );
            })}
          </ul>
        )}

        <div className="mt-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            Kembali ke Dashboard Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
