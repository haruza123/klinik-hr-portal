'use client';

import { useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { Loader2, ChevronRight, Inbox } from 'lucide-react';
import { Header } from '@/components/Header';

interface Inquiry {
  id: string;
  question: string;
  email: string | null;
  created_at: string;
}

export default function AdminInquiriesPage() {
  const router = useRouter();
  const [inquiries, setInquiries] = useState<Inquiry[]>([]);
  const [loading, setLoading] = useState(true);
  const [checkingAuth, setCheckingAuth] = useState(true);

  useEffect(() => {
    const init = async () => {
      const {
        data: { session },
      } = await supabase.auth.getSession();
      if (!session) {
        router.replace('/login');
        return;
      }
      const { data, error } = await supabase
        .from('inquiries')
        .select('id, question, email, created_at')
        .order('created_at', { ascending: false });
      if (!error) setInquiries(data ?? []);
      setLoading(false);
      setCheckingAuth(false);
    };
    void init();
  }, [router]);

  function formatDate(iso: string) {
    return new Date(iso).toLocaleDateString('id-ID', {
      day: 'numeric',
      month: 'short',
      year: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  }

  if (checkingAuth) {
    return (
      <div className="min-h-screen bg-white">
        <Header />
        <div className="flex items-center justify-center py-16">
          <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <div className="max-w-4xl mx-auto px-4 py-10">
        <nav className="mb-6 text-sm text-slate-500">
          <Link href="/admin" className="hover:text-emerald-600 transition-colors">
            Admin
          </Link>
          <span className="mx-1.5">/</span>
          <span className="text-slate-900 font-medium">Pertanyaan Masuk</span>
        </nav>
        <header className="mb-8">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
              <Inbox className="h-6 w-6" />
            </div>
            <div>
              <h1 className="text-2xl font-semibold text-slate-900">Pertanyaan Masuk</h1>
              <p className="mt-1 text-slate-600">
                Daftar pertanyaan dari pengunjung yang akan ditinjau tim HR
              </p>
            </div>
          </div>
        </header>

        {loading ? (
          <div className="flex justify-center py-16">
            <Loader2 className="h-8 w-8 animate-spin text-slate-400" />
          </div>
        ) : inquiries.length === 0 ? (
          <div className="rounded-xl border border-slate-200 bg-slate-50/50 p-12 text-center text-slate-500">
            Belum ada pertanyaan masuk.
          </div>
        ) : (
          <ul className="space-y-4">
            {inquiries.map((inq) => (
              <li
                key={inq.id}
                className="rounded-xl border border-slate-200 bg-white p-5 shadow-sm"
              >
                <p className="font-medium text-slate-900 whitespace-pre-wrap">{inq.question}</p>
                <div className="mt-2 flex flex-wrap items-center gap-3 text-sm text-slate-500">
                  {inq.email && (
                    <span>Email: {inq.email}</span>
                  )}
                  <span>{formatDate(inq.created_at)}</span>
                </div>
              </li>
            ))}
          </ul>
        )}

        <div className="mt-8">
          <Link
            href="/admin"
            className="inline-flex items-center gap-1.5 text-sm font-medium text-emerald-600 hover:text-emerald-700"
          >
            <ChevronRight className="h-4 w-4 rotate-180" />
            Kembali ke Admin
          </Link>
        </div>
      </div>
    </div>
  );
}
