import Link from 'next/link';
import { apiFetch } from '@/lib/api';
import { ChevronRight, MessageCircle, Calculator } from 'lucide-react';
import { Header } from '@/components/Header';
import { notFound } from 'next/navigation';
import type { Metadata } from 'next';
import { Mail } from 'lucide-react';

export const dynamic = 'force-dynamic';

interface Props {
  params: Promise<{ slug: string }>;
}

interface QuestionDetail {
  id: string;
  slug: string | null;
  category_id: string;
  question_text: string;
  answer: string | null;
  categories: { id?: string; name?: string } | null;
}

function stripHtml(html: string, maxLength = 160): string {
  const text = html.replace(/<[^>]*>/g, '').trim().replace(/\s+/g, ' ');
  return text.length <= maxLength ? text : `${text.slice(0, maxLength)}...`;
}

export async function generateMetadata({ params }: Props): Promise<Metadata> {
  const { slug } = await params;
  try {
    const res = await apiFetch<{ data: QuestionDetail }>(
      `/api/questions/${encodeURIComponent(slug)}`,
      { cache: 'no-store' }
    );
    const question = res.data;
    if (!question) return { title: 'Solusi tidak ditemukan' };
    return {
      title: question.question_text,
      description: stripHtml(question.answer || ''),
      openGraph: {
        title: question.question_text,
        description: stripHtml(question.answer || '', 120),
        type: 'article',
      },
    };
  } catch {
    return { title: 'Solusi tidak ditemukan' };
  }
}

export default async function SolusiPage({ params }: Props) {
  const { slug } = await params;

  let question: QuestionDetail | null = null;
  try {
    const res = await apiFetch<{ data: QuestionDetail }>(
      `/api/questions/${encodeURIComponent(slug)}`,
      { cache: 'no-store' }
    );
    question = res.data ?? null;
  } catch {
    question = null;
  }

  if (!question) notFound();

  const category = question.categories;
  const categoryName = category?.name ?? 'Kategori';

  let relatedQuestions: QuestionDetail[] = [];
  try {
    const relRes = await apiFetch<{ data: QuestionDetail[] }>(
      `/api/questions?categoryId=${encodeURIComponent(question.category_id)}&excludeId=${encodeURIComponent(question.id)}&limit=5`,
      { cache: 'no-store' }
    );
    relatedQuestions = relRes.data ?? [];

    if (relatedQuestions.length < 3) {
      const latestRes = await apiFetch<{ data: QuestionDetail[] }>(
        `/api/questions?excludeId=${encodeURIComponent(question.id)}&limit=5`,
        { cache: 'no-store' }
      );
      relatedQuestions = latestRes.data ?? [];
    }
  } catch {
    relatedQuestions = [];
  }

  const relatedQuestionsSafe = relatedQuestions;

const emailUrl = `mailto:admin@konsultasihr.com?subject=${encodeURIComponent(
  'Konsultasi HR'
)}&body=${encodeURIComponent(
  `Halo Pak Dadi,\n\nSaya ingin bertanya mengenai: ${question.question_text}`
)}`;

  const faqSchema = {
    '@context': 'https://schema.org',
    '@type': 'FAQPage',
    mainEntity: [
      {
        '@type': 'Question',
        name: question.question_text,
        acceptedAnswer: {
          '@type': 'Answer',
          text: stripHtml(question.answer || 'Belum ada jawaban.'),
        },
      },
    ],
  };

  return (
    <div className="min-h-screen bg-white">
      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{ __html: JSON.stringify(faqSchema) }}
      />
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
                    href={emailUrl}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-6 inline-flex items-center gap-2 w-full sm:w-auto justify-center rounded-xl bg-emerald-600 px-6 py-4 font-semibold text-white shadow-lg hover:bg-emerald-700 transition-colors"
                  >
                    <Mail className="h-5 w-5" />
                    Konsultasi via Email
                  </a>
                </div>
              </div>
            </div>
          </article>

          {/* Sidebar */}
          <aside className="lg:col-span-1 space-y-6">
            <div className="sticky top-24 space-y-6">
              {/* Kalkulator HR */}
              {/* <Link
                href="/kalkulator"
                className="flex items-center gap-3 rounded-2xl border-2 border-emerald-200 bg-gradient-to-br from-emerald-50 to-white p-4 transition-colors hover:border-emerald-300 hover:from-emerald-100"
              >
                <div className="shrink-0 rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
                  <Calculator className="h-5 w-5" />
                </div>
                <div className="min-w-0">
                  <span className="text-xs font-semibold uppercase tracking-wider text-emerald-700">
                    Tool
                  </span>
                  <h3 className="font-semibold text-slate-900 mt-0.5">Kalkulator HR</h3>
                  <p className="text-xs text-slate-600 mt-0.5">
                    Hitung pesangon, UPMK & UPH
                  </p>
                </div>
                <ChevronRight className="h-4 w-4 shrink-0 text-slate-400" />
              </Link> */}

              {/* Pertanyaan Terkait */}
              <div className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
                <h2 className="text-lg font-semibold text-slate-900 mb-4">
  {relatedQuestions.length > 0 ? 'Pertanyaan Terkait' : 'Solusi Terbaru'}
</h2>
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

              {/* Profil singkat Pak Dadi - compact */}
              <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-4">
                <div className="flex items-center gap-3">
                  <div className="h-12 w-12 shrink-0 rounded-full bg-slate-200 flex items-center justify-center text-slate-600 text-lg font-semibold">
                    D
                  </div>
                  <div className="min-w-0">
                    <p className="font-semibold text-slate-900 text-sm">Pak Dadi</p>
                    <p className="text-xs text-emerald-600 font-medium">Konsultan HR</p>
                  </div>
                </div>
                <a
                  href={emailUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="mt-3 flex items-center justify-center gap-1.5 w-full rounded-lg bg-emerald-600 px-3 py-2 text-xs font-semibold text-white hover:bg-emerald-700 transition-colors"
                >
                  <Mail className="h-4 w-4" />
                  Konsultasi via Email
                </a>
              </div>
            </div>
          </aside>
        </div>
      </main>
    </div>
  );
}
