'use client';

import { useState } from 'react';
import { supabase } from '@/lib/supabase';
import { Loader2, Send } from 'lucide-react';

export function FormAjukanPertanyaan() {
  const [question, setQuestion] = useState('');
  const [email, setEmail] = useState('');
  const [submitting, setSubmitting] = useState(false);
  const [success, setSuccess] = useState(false);
  const [error, setError] = useState<string | null>(null);

  async function handleSubmit(e: React.FormEvent) {
    e.preventDefault();
    const q = question.trim();
    if (!q) return;

    setError(null);
    setSubmitting(true);
    try {
      const { error: err } = await supabase.from('inquiries').insert({
        question: q,
        email: email.trim() || null,
      });
      if (err) throw err;
      setSuccess(true);
      setQuestion('');
      setEmail('');
    } catch (err) {
      console.error(err);
      setError('Gagal mengirim. Silakan coba lagi.');
    } finally {
      setSubmitting(false);
    }
  }

  if (success) {
    return (
      <div className="rounded-2xl border border-emerald-200 bg-emerald-50/80 p-6 text-center">
        <p className="font-medium text-emerald-800">
          Pertanyaan Anda telah diterima dan akan ditinjau oleh tim HR.
        </p>
        <p className="mt-1 text-sm text-emerald-700">
          Kami akan menghubungi Anda jika diperlukan (melalui email yang Anda berikan).
        </p>
        <button
          type="button"
          onClick={() => setSuccess(false)}
          className="mt-4 text-sm font-medium text-emerald-700 hover:text-emerald-800 underline"
        >
          Ajukan pertanyaan lain
        </button>
      </div>
    );
  }

  return (
    <form onSubmit={handleSubmit} className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <h2 className="text-lg font-semibold text-slate-900">Ajukan Pertanyaan</h2>
      <p className="mt-1 text-sm text-slate-600">
        Tidak menemukan jawaban? Kirim pertanyaan Anda dan tim HR akan meninjau.
      </p>
      <div className="mt-4 space-y-4">
        <div>
          <label htmlFor="inquiry-question" className="block text-sm font-medium text-slate-700 mb-1">
            Pertanyaan <span className="text-red-500">*</span>
          </label>
          <textarea
            id="inquiry-question"
            value={question}
            onChange={(e) => setQuestion(e.target.value)}
            placeholder="Tulis pertanyaan Anda di sini..."
            rows={4}
            required
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20 resize-y"
          />
        </div>
        <div>
          <label htmlFor="inquiry-email" className="block text-sm font-medium text-slate-700 mb-1">
            Email <span className="text-slate-400">(opsional)</span>
          </label>
          <input
            id="inquiry-email"
            type="email"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            placeholder="email@contoh.com"
            className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
          />
        </div>
        {error && (
          <p className="text-sm text-red-600">{error}</p>
        )}
        <button
          type="submit"
          disabled={submitting}
          className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 font-medium text-white hover:bg-emerald-700 transition-colors disabled:opacity-60 disabled:cursor-not-allowed"
        >
          {submitting ? <Loader2 className="h-4 w-4 animate-spin" /> : <Send className="h-4 w-4" />}
          {submitting ? 'Mengirim...' : 'Kirim Pertanyaan'}
        </button>
      </div>
    </form>
  );
}
