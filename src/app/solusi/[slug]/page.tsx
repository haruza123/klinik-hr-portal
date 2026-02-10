import Link from 'next/link';
import { supabase } from '@/lib/supabase';
import { ChevronRight, MessageCircle, Shield, FileCheck } from 'lucide-react';
import { Header } from '@/components/Header';
import { notFound } from 'next/navigation';

interface Props {
  params: Promise<{ slug: string }>;
}

const UUID_REGEX = /^[0-9a-f]{8}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{4}-[0-9a-f]{12}$/i;

export default async function SolusiPage({ params }: Props) {
  const { slug } = await params;
  const isUuid = UUID_REGEX.test(slug);

  const query = supabase
    .from('questions')
    .select('id, slug, category_id, question_text, answer, categories ( id, name )')
    .order('created_at', { ascending: false });

  const { data: question, error } = isUuid
    ? await query.eq('id', slug).single()
    : await query.eq('slug', slug).single();

  if (error || !question) notFound();

  const category = question.categories as { id?: string; name?: string } | null;
  const categoryName = category?.name ?? 'Kategori';

  const { data: relatedQuestions = [] } = await supabase
    .from('questions')
    .select('id, slug, question_text, categories ( name )')
    .eq('category_id', question.category_id)
    .neq('id', question.id)
    .order('created_at', { ascending: false })
    .limit(5);

  const relatedQuestionsSafe = relatedQuestions ?? [];

  const whatsappUrl = `https://wa.me/628XXXXXXXXXX?text=${encodeURIComponent(
    `Halo Pak Dadi, saya ingin bertanya mengenai: ${question.question_text}`
  )}`;

  return (
    <div className="min-h-screen bg-white">
      <Header />

      <main className="mx-auto max-w-6xl px-4 py-8 sm:px-6 lg:px-8">
        {/* Breadcrumbs: Beranda > [Kategori] > [Judul] */}
        <nav className="mb-8" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5 text-sm text-slate-500">
            <li>
              <Link href="/" className="hover:text-emerald-600 transition-colors">
                Beranda
              </Link>
            </li>
            <li><ChevronRight className="h-4 w-4 text-slate-400" /></li>
            <li>
              <span className="text-slate-900 font-medium">{categoryName}</span>
            </li>
            <li><ChevronRight className="h-4 w-4 text-slate-400" /></li>
            <li className="truncate max-w-[180px] sm:max-w-sm" aria-current="page">
              <span className="text-slate-600 truncate block">{question.question_text}</span>
            </li>
          </ol>
        </nav>

        <div className="grid grid-cols-1 gap-10 lg:grid-cols-3">
          {/* Main content */}
          <article className="lg:col-span-2">
            <header className="mb-8">
              <span className="inline-block text-sm font-medium text-emerald-700 bg-emerald-50 px-3 py-1 rounded-full mb-3">
                {categoryName}
              </span>
              <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl leading-relaxed">
                {question.question_text}
              </h1>
            </header>

            <div
              className="prose prose-emerald prose-lg max-w-none prose-p:leading-relaxed prose-p:mb-4 prose-img:rounded-xl prose-img:shadow-lg"
              dangerouslySetInnerHTML={{
                __html: question.answer || '<p>Belum ada jawaban.</p>',
              }}
            />

            {/* Expert Card */}
            <div className="mt-12 rounded-2xl border border-slate-200 bg-slate-50/50 p-6 sm:p-8">
              <div className="flex flex-col sm:flex-row gap-6 items-start">
                <div className="shrink-0">
                  <div className="h-24 w-24 rounded-full bg-slate-200 flex items-center justify-center text-slate-500 text-3xl font-semibold">
                    D
                  </div>
                </div>
                <div className="min-w-0 flex-1">
                  <h3 className="text-lg font-semibold text-slate-900">Pak Dadi</h3>
                  <p className="text-emerald-600 font-medium mt-0.5">
                    Konsultan HR - TDA Tangerang Raya
                  </p>
                  <p className="mt-3 text-slate-600 leading-relaxed">
                    Berpengalaman membantu perusahaan dan karyawan dalam berbagai aspek ketenagakerjaan, mulai dari rekrutmen, kontrak kerja, hingga penggajian.
                  </p>
                  <a
                    href={whatsappUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-2 w-full sm:w-auto justify-center rounded-xl bg-emerald-600 px-6 py-4 font-semibold text-white shadow-lg hover:bg-emerald-700 transition-colors"
                  >
                    <MessageCircle className="h-5 w-5" />
                    Konsultasi Privat via WhatsApp
                  </a>
                </div>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="sticky top-24 space-y-6">
              {/* Konsultasi Pro - Monetisasi */}
              <div className="rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-6">
                <div className="flex items-center gap-2 mb-3">
                  <Shield className="h-5 w-5 text-emerald-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Layanan Premium
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Konsultasi Pro</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Konsultasi mendalam dengan tim ahli HR untuk kasus kompleks. Dukungan dokumen & follow-up.
                </p>
                <a
                  href="/konsultasi-pro"
                  className="block w-full text-center rounded-xl bg-emerald-600 px-4 py-3 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
                >
                  Mulai Konsultasi Pro
                </a>
              </div>

              {/* Pro Tools - Cek Dokumen Kerja */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <div className="flex items-center gap-2 mb-3">
                  <FileCheck className="h-5 w-5 text-emerald-600" />
                  <span className="text-xs font-bold uppercase tracking-wider text-emerald-700">
                    Pro Tools
                  </span>
                </div>
                <h3 className="font-semibold text-slate-900 mb-2">Cek Dokumen Kerja</h3>
                <p className="text-sm text-slate-600 mb-4">
                  Validasi kontrak kerja, surat peringatan, dan dokumen ketenagakerjaan Anda.
                </p>
                <a
                  href="/cek-dokumen"
                  className="block w-full text-center rounded-xl border-2 border-emerald-600 px-4 py-3 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors"
                >
                  Cek Dokumen Sekarang
                </a>
              </div>

              {/* Pertanyaan Terkait */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">Pertanyaan Terkait</h2>
                {relatedQuestionsSafe.length > 0 ? (
                  <ul className="space-y-3">
                    {relatedQuestionsSafe.map((q) => {
                      const qSlug = (q as { slug?: string }).slug ?? q.id;
                      return (
                        <li key={q.id}>
                          <Link
                            href={`/solusi/${qSlug}`}
                            className="block rounded-xl border border-slate-100 p-4 text-sm font-medium text-slate-900 hover:border-emerald-200 hover:bg-emerald-50/50 transition-colors"
                          >
                            <span className="line-clamp-2">{q.question_text}</span>
                          </Link>
                        </li>
                      );
                    })}
                  </ul>
                ) : (
                  <p className="text-sm text-slate-500">Belum ada pertanyaan lain di kategori ini.</p>
                )}
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
