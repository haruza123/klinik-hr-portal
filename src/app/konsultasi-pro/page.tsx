'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { apiFetch } from '@/lib/api';
import { MessageSquare, CheckCircle2, Loader2, Send, ShieldCheck, Clock, FileText } from 'lucide-react';

export default function KonsultasiProPage() {
  const [role, setRole] = useState<'Pekerja / Karyawan' | 'Praktisi HRD' | 'Pengusaha / UMKM'>('Pekerja / Karyawan');
  const [topic, setTopic] = useState('Kontrak Kerja & PKWT');
  const [contact, setContact] = useState('');
  const [summary, setSummary] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [submitted, setSubmitted] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    if (!summary.trim()) return;

    setSubmitting(true);
    setError(null);

    try {
      const formattedQuestion = `[Konsultasi Pro | ${role} | Topik: ${topic}]\n${summary.trim()}`;
      await apiFetch('/api/inquiries', {
        method: 'POST',
        body: JSON.stringify({
          question: formattedQuestion,
          email: contact.trim() || null,
        }),
      });
      setSubmitted(true);
      setSummary('');
      setContact('');
    } catch (err) {
      setError(err instanceof Error ? err.message : 'Gagal mengirim permintaan konsultasi.');
    } finally {
      setSubmitting(false);
    }
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto max-w-5xl px-4 py-10 sm:px-6">
        <div className="grid gap-10 lg:grid-cols-5">
          {/* Left: Info & Value Prop */}
          <div className="lg:col-span-2 space-y-6">
            <div>
              <span className="inline-flex items-center rounded-full bg-emerald-100 px-3 py-1 text-xs font-semibold text-emerald-800">
                Konsultasi Terstruktur
              </span>
              <h1 className="mt-3 text-2xl font-bold text-slate-900 sm:text-3xl">
                Konsultasi Pro Klinik HR
              </h1>
              <p className="mt-3 text-slate-600 leading-relaxed">
                Punya kasus ketenagakerjaan yang spesifik dan belum terjawab di artikel? Kirimkan ringkasan kasus Anda secara terstruktur agar tim HR dapat menelaah dengan cepat dan tepat sasaran.
              </p>
            </div>

            <div className="space-y-4 rounded-2xl border border-slate-200 bg-slate-50/70 p-5">
              <div className="flex items-start gap-3">
                <Clock className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Hemat Waktu Tanpa Chat Bertele-tele</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Kronologi Anda langsung tercatat rapi sehingga konsultan bisa memberi solusi yang relevan.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <FileText className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Untuk Pekerja, HRD &amp; Pengusaha</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Review kontrak PKWT/PKWTT, hitungan pesangon, SP, hingga mediasi Disnaker.
                  </p>
                </div>
              </div>
              <div className="flex items-start gap-3">
                <ShieldCheck className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                <div>
                  <p className="text-sm font-semibold text-slate-900">Cek Dulu Solusi Gratis</p>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Sudah cek{' '}
                    <Link href="/solusi" className="text-emerald-600 underline">
                      daftar solusi
                    </Link>{' '}
                    atau{' '}
                    <Link href="/kalkulator" className="text-emerald-600 underline">
                      kalkulator pesangon
                    </Link>
                    ? Banyak kasus bisa selesai dalam 2 menit.
                  </p>
                </div>
              </div>
            </div>
          </div>

          {/* Right: Structured Intake Form */}
          <div className="lg:col-span-3">
            <form
              onSubmit={handleSubmit}
              className="rounded-2xl border border-slate-200 bg-white p-6 sm:p-8 shadow-sm space-y-5"
            >
              <div className="flex items-center gap-2.5 border-b border-slate-100 pb-4">
                <MessageSquare className="h-5 w-5 text-emerald-600" />
                <h2 className="text-lg font-semibold text-slate-900">
                  Formulir Ringkasan Kasus
                </h2>
              </div>

              {submitted && (
                <div className="flex items-start gap-3 rounded-xl border border-emerald-200 bg-emerald-50 p-4 text-sm text-emerald-800">
                  <CheckCircle2 className="h-5 w-5 text-emerald-600 shrink-0 mt-0.5" />
                  <div>
                    <p className="font-semibold">Permintaan konsultasi berhasil dikirim!</p>
                    <p className="mt-1">
                      Tim Klinik HR akan meninjau ringkasan kasus Anda dan menghubungi melalui kontak yang dicantumkan (atau menjadikannya artikel solusi baru).
                    </p>
                  </div>
                </div>
              )}

              <div>
                <label className="block text-sm font-medium text-slate-700 mb-2">
                  Peran Anda
                </label>
                <div className="grid grid-cols-1 sm:grid-cols-3 gap-2">
                  {(['Pekerja / Karyawan', 'Praktisi HRD', 'Pengusaha / UMKM'] as const).map((r) => (
                    <button
                      key={r}
                      type="button"
                      onClick={() => setRole(r)}
                      className={`rounded-xl border px-3 py-2.5 text-sm font-medium transition-colors ${
                        role === r
                          ? 'border-emerald-600 bg-emerald-50 text-emerald-800'
                          : 'border-slate-200 bg-white text-slate-700 hover:bg-slate-50'
                      }`}
                    >
                      {r}
                    </button>
                  ))}
                </div>
              </div>

              <div>
                <label htmlFor="topic" className="block text-sm font-medium text-slate-700 mb-1">
                  Topik Utama
                </label>
                <select
                  id="topic"
                  value={topic}
                  onChange={(e) => setTopic(e.target.value)}
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                >
                  <option>Kontrak Kerja &amp; PKWT</option>
                  <option>Gaji, Lembur &amp; THR</option>
                  <option>PHK, Resign &amp; Pesangon</option>
                  <option>BPJS &amp; Jaminan Sosial</option>
                  <option>Penyusunan Peraturan Perusahaan / SOP HR</option>
                  <option>Sengketa / Pelaporan Disnaker</option>
                </select>
              </div>

              <div>
                <label htmlFor="contact" className="block text-sm font-medium text-slate-700 mb-1">
                  Email / No. WhatsApp (untuk balasan) <span className="text-red-500">*</span>
                </label>
                <input
                  id="contact"
                  type="text"
                  required
                  value={contact}
                  onChange={(e) => setContact(e.target.value)}
                  placeholder="contoh: nama@email.com atau 0812xxxx"
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                />
              </div>

              <div>
                <label htmlFor="summary" className="block text-sm font-medium text-slate-700 mb-1">
                  Kronologi &amp; Pertanyaan Singkat <span className="text-red-500">*</span>
                </label>
                <textarea
                  id="summary"
                  required
                  rows={5}
                  value={summary}
                  onChange={(e) => setSummary(e.target.value)}
                  placeholder="Jelaskan status kerja (PKWT/PKWTT), lama bekerja, dan inti masalah yang ingin dikonsultasikan..."
                  className="w-full rounded-xl border border-slate-200 bg-white px-4 py-2.5 text-sm text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-y"
                />
              </div>

              {error && <p className="text-sm text-red-600">{error}</p>}

              <button
                type="submit"
                disabled={submitting}
                className="w-full inline-flex items-center justify-center gap-2 rounded-xl bg-emerald-600 px-5 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors disabled:opacity-60"
              >
                {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
                {submitting ? 'Mengirim Ringkasan...' : 'Kirim Permintaan Konsultasi'}
              </button>
            </form>
          </div>
        </div>
      </main>
    </div>
  );
}
