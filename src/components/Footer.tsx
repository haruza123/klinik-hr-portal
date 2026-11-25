import Link from 'next/link';
import { Scale } from 'lucide-react';

export function Footer() {
  return (
    <footer className="border-t border-slate-200 bg-slate-50/80 text-slate-600">
      <div className="mx-auto max-w-6xl px-4 py-10 sm:px-6">
        <div className="grid gap-8 md:grid-cols-3">
          {/* Brand */}
          <div>
            <Link href="/" className="inline-flex items-center gap-2 text-base font-bold text-slate-900">
              <span className="inline-flex h-7 w-7 items-center justify-center rounded-lg bg-emerald-600 text-xs font-bold text-white">
                HR
              </span>
              <span>Klinik HR Indonesia</span>
            </Link>
            <p className="mt-3 text-sm leading-relaxed text-slate-600">
              Portal edukasi dan konsultasi ketenagakerjaan praktis untuk Pekerja, Praktisi HRD, serta Pengusaha &amp; UMKM di Indonesia.
            </p>
          </div>

          {/* Navigasi Cepat */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <p className="font-semibold text-slate-900 mb-2.5">Layanan</p>
              <ul className="space-y-2">
                <li>
                  <Link href="/solusi" className="hover:text-emerald-600 transition-colors">
                    Semua Solusi
                  </Link>
                </li>
                <li>
                  <Link href="/kalkulator" className="hover:text-emerald-600 transition-colors">
                    Kalkulator HR
                  </Link>
                </li>
                <li>
                  <Link href="/cek-dokumen" className="hover:text-emerald-600 transition-colors">
                    Cek Dokumen
                  </Link>
                </li>
                <li>
                  <Link href="/konsultasi-pro" className="hover:text-emerald-600 transition-colors">
                    Konsultasi Pro
                  </Link>
                </li>
              </ul>
            </div>
            <div>
              <p className="font-semibold text-slate-900 mb-2.5">Portal</p>
              <ul className="space-y-2">
                <li>
                  <Link href="/tentang-kami" className="hover:text-emerald-600 transition-colors">
                    Tentang Kami
                  </Link>
                </li>
                <li>
                  <Link href="/login" className="hover:text-emerald-600 transition-colors">
                    Portal Admin
                  </Link>
                </li>
              </ul>
            </div>
          </div>

          {/* Disclaimer Hukum */}
          <div className="rounded-xl border border-slate-200 bg-white p-4">
            <div className="flex items-center gap-2 text-xs font-semibold uppercase tracking-wide text-slate-800">
              <Scale className="h-4 w-4 text-emerald-600 shrink-0" />
              <span>Disclaimer Hukum</span>
            </div>
            <p className="mt-2 text-xs leading-relaxed text-slate-500">
              Seluruh artikel, kalkulator, dan panduan di Klinik HR bersifat{' '}
              <strong className="font-medium text-slate-700">edukasi dan referensi umum</strong>{' '}
              berdasarkan peraturan ketenagakerjaan Indonesia (UU Ketenagakerjaan, UU Cipta Kerja, PP 35/2021, PP 36/2021) dan bukan merupakan nasihat hukum resmi pengacara. Untuk sengketa hukum formal, konsultasikan kasus Anda dengan praktisi hukum/mediator ketenagakerjaan berwenang.
            </p>
          </div>
        </div>

        <div className="mt-8 border-t border-slate-200 pt-6 flex flex-col sm:flex-row items-center justify-between gap-2 text-xs text-slate-500">
          <p>&copy; {new Date().getFullYear()} Klinik HR Indonesia. Seluruh hak cipta dilindungi.</p>
          <p>Dibangun untuk membantu Pekerja, HRD &amp; Pengusaha.</p>
        </div>
      </div>
    </footer>
  );
}
