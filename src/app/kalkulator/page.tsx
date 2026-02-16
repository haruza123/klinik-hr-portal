'use client';

import { useState, useCallback } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { Calculator, FileText, MessageCircle, ChevronRight } from 'lucide-react';

const ALASAN_PHK_OPTIONS = [
  { value: 'efisiensi', label: 'Efisiensi Perusahaan' },
  { value: 'pelanggaran', label: 'Pelanggaran / Indisipliner' },
  { value: 'pensiun', label: 'Pensiun' },
  { value: 'meninggal', label: 'Meninggal Dunia' },
  { value: 'sakit_berkepanjangan', label: 'Sakit Berkepanjangan' },
  { value: 'force_majeure', label: 'Force Majeure' },
  { value: 'lainnya', label: 'Lainnya' },
] as const;

/**
 * Uang Pesangon (UP) – UU Cipta Kerja / PP 35/2021
 * Masa kerja (bulan) → kelipatan gaji
 */
function getPesangonMultiplier(monthsWorked: number): number {
  if (monthsWorked < 12) return 1;
  if (monthsWorked < 24) return 2;
  if (monthsWorked < 36) return 3;
  if (monthsWorked < 48) return 4;
  if (monthsWorked < 60) return 5;
  if (monthsWorked < 72) return 6;
  if (monthsWorked < 84) return 7;
  if (monthsWorked < 96) return 8;
  return 9;
}

/**
 * Uang Penghargaan Masa Kerja (UPMK)
 * Hanya untuk masa kerja ≥ 3 tahun
 */
function getUPMKMultiplier(monthsWorked: number): number {
  if (monthsWorked < 36) return 0;
  if (monthsWorked < 72) return 2;
  if (monthsWorked < 108) return 3;
  if (monthsWorked < 144) return 4;
  if (monthsWorked < 180) return 5;
  if (monthsWorked < 216) return 6;
  if (monthsWorked < 252) return 7;
  if (monthsWorked < 288) return 8;
  return 10;
}

function formatRupiah(value: number): string {
  return new Intl.NumberFormat('id-ID', {
    style: 'currency',
    currency: 'IDR',
    minimumFractionDigits: 0,
    maximumFractionDigits: 0,
  }).format(value);
}

export default function KalkulatorPesangonPage() {
  const [years, setYears] = useState<number>(3);
  const [months, setMonths] = useState<number>(0);
  const [gajiPokok, setGajiPokok] = useState<string>('5000000');
  const [alasanPHK, setAlasanPHK] = useState<string>('efisiensi');

  const gajiNum = Number(gajiPokok.replace(/\D/g, '')) || 0;
  const totalMonths = years * 12 + months;

  const result = useCallback(() => {
    const upMultiplier = getPesangonMultiplier(totalMonths);
    const upmkMultiplier = getUPMKMultiplier(totalMonths);
    const up = gajiNum * upMultiplier;
    const upmk = gajiNum * upmkMultiplier;
    const uph = (up + upmk) * 0.15;
    const total = up + upmk + uph;
    return { up, upmk, uph, total, upMultiplier, upmkMultiplier };
  }, [totalMonths, gajiNum]);

  const calculated = result();
  const hasValidInput = gajiNum > 0 && totalMonths >= 0;

  const handleGajiChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const raw = e.target.value.replace(/\D/g, '');
    setGajiPokok(raw ? parseInt(raw, 10).toLocaleString('id-ID') : '');
  };

  const whatsappMessage = encodeURIComponent(
    `Halo, saya ingin konsultasi hasil kalkulator pesangon:\n` +
      `• Masa kerja: ${years} tahun ${months} bulan\n` +
      `• Gaji pokok: Rp ${gajiPokok}\n` +
      `• Alasan PHK: ${ALASAN_PHK_OPTIONS.find((o) => o.value === alasanPHK)?.label ?? alasanPHK}\n` +
      `• Perkiraan total: ${formatRupiah(calculated.total)}`
  );
  const whatsappUrl = `https://wa.me/628XXXXXXXXXX?text=${whatsappMessage}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        {/* Breadcrumb */}
        <nav className="mb-8 text-sm text-slate-500" aria-label="Breadcrumb">
          <ol className="flex flex-wrap items-center gap-1.5">
            <li>
              <Link href="/" className="hover:text-emerald-600 transition-colors">
                Beranda
              </Link>
            </li>
            <li>
              <ChevronRight className="h-4 w-4 text-slate-400 inline" />
            </li>
            <li className="text-slate-900 font-medium">Kalkulator Pesangon</li>
          </ol>
        </nav>

        <header className="mb-10">
          <div className="flex items-center gap-3">
            <div className="rounded-xl bg-emerald-100 p-3 text-emerald-700">
              <Calculator className="h-8 w-8" />
            </div>
            <div>
              <h1 className="text-2xl font-bold tracking-tight text-slate-900 sm:text-3xl">
                Kalkulator Pesangon Smart
              </h1>
              <p className="mt-1 text-slate-600">
                Perkiraan uang pesangon, UPMK, dan UPH sesuai UU Cipta Kerja
              </p>
            </div>
          </div>
        </header>

        <div className="grid gap-8 lg:grid-cols-5">
          {/* Form */}
          <section className="lg:col-span-2">
            <div className="rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
              <h2 className="text-lg font-semibold text-slate-900 mb-4">Data Perhitungan</h2>
              <div className="space-y-5">
                <div>
                  <label className="block text-sm font-medium text-slate-700 mb-1.5">
                    Masa Kerja
                  </label>
                  <div className="flex gap-3 items-center">
                    <div className="flex-1">
                      <input
                        type="number"
                        min={0}
                        max={50}
                        value={years}
                        onChange={(e) => setYears(Math.max(0, parseInt(e.target.value, 10) || 0))}
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                      <span className="block text-xs text-slate-500 mt-0.5">Tahun</span>
                    </div>
                    <div className="flex-1">
                      <input
                        type="number"
                        min={0}
                        max={11}
                        value={months}
                        onChange={(e) =>
                          setMonths(Math.min(11, Math.max(0, parseInt(e.target.value, 10) || 0)))
                        }
                        className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                      />
                      <span className="block text-xs text-slate-500 mt-0.5">Bulan</span>
                    </div>
                  </div>
                </div>

                <div>
                  <label htmlFor="gaji" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Gaji Pokok (Rp)
                  </label>
                  <input
                    id="gaji"
                    type="text"
                    inputMode="numeric"
                    value={gajiPokok}
                    onChange={handleGajiChange}
                    placeholder="5.000.000"
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 placeholder:text-slate-400 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  />
                </div>

                <div>
                  <label htmlFor="alasan" className="block text-sm font-medium text-slate-700 mb-1.5">
                    Alasan PHK
                  </label>
                  <select
                    id="alasan"
                    value={alasanPHK}
                    onChange={(e) => setAlasanPHK(e.target.value)}
                    className="w-full rounded-lg border border-slate-200 bg-white px-4 py-2.5 text-slate-900 focus:border-emerald-500 focus:outline-none focus:ring-2 focus:ring-emerald-500/20"
                  >
                    {ALASAN_PHK_OPTIONS.map((opt) => (
                      <option key={opt.value} value={opt.value}>
                        {opt.label}
                      </option>
                    ))}
                  </select>
                </div>
              </div>
            </div>
          </section>

          {/* Hasil */}
          <section className="lg:col-span-3">
            <div className="rounded-2xl border border-emerald-200 bg-white p-6 shadow-sm print:border-slate-200">
              <h2 className="text-lg font-semibold text-slate-900 mb-4 flex items-center gap-2">
                <FileText className="h-5 w-5 text-emerald-600" />
                Ringkasan Hasil
              </h2>

              {!hasValidInput ? (
                <p className="text-slate-500 py-4">
                  Isi gaji pokok dan masa kerja untuk melihat perhitungan.
                </p>
              ) : (
                <>
                  <div className="space-y-3 mb-6">
                    <div className="flex justify-between items-baseline py-2 border-b border-slate-100">
                      <span className="text-slate-600">Uang Pesangon (UP)</span>
                      <span className="font-semibold text-slate-900">
                        {calculated.upMultiplier} × gaji = {formatRupiah(calculated.up)}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline py-2 border-b border-slate-100">
                      <span className="text-slate-600">Uang Penghargaan Masa Kerja (UPMK)</span>
                      <span className="font-semibold text-slate-900">
                        {calculated.upmkMultiplier > 0
                          ? `${calculated.upmkMultiplier} × gaji = ${formatRupiah(calculated.upmk)}`
                          : '—'}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline py-2 border-b border-slate-100">
                      <span className="text-slate-600">Uang Penggantian Hak (UPH) 15%</span>
                      <span className="font-semibold text-slate-900">
                        {formatRupiah(calculated.uph)}
                      </span>
                    </div>
                    <div className="flex justify-between items-baseline pt-4 mt-2 border-t-2 border-emerald-100">
                      <span className="font-semibold text-slate-900">Total Perkiraan</span>
                      <span className="text-xl font-bold text-emerald-700">
                        {formatRupiah(calculated.total)}
                      </span>
                    </div>
                  </div>

                  <p className="text-xs text-slate-500 mb-6">
                    Perhitungan mengacu pada ketentuan umum UU Cipta Kerja dan PP 35/2021. Hasil
                    bersifat perkiraan; untuk kepastian hukum disarankan konsultasi dengan ahli.
                  </p>

                  <div className="flex flex-wrap gap-3 print:hidden">
                    <button
                      type="button"
                      onClick={handlePrint}
                      className="inline-flex items-center gap-2 rounded-xl border-2 border-emerald-600 bg-white px-5 py-2.5 text-sm font-semibold text-emerald-600 hover:bg-emerald-50 transition-colors"
                    >
                      <FileText className="h-4 w-4" />
                      Cetak PDF
                    </button>
                    <a
                      href={whatsappUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="inline-flex items-center gap-2 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
                    >
                      <MessageCircle className="h-4 w-4" />
                      Konsultasi Hasil Ini via WA
                    </a>
                  </div>
                </>
              )}
            </div>
          </section>
        </div>

        {/* Info singkat */}
        <section className="mt-10 rounded-2xl border border-slate-200 bg-slate-50/50 p-6">
          <h3 className="font-semibold text-slate-900 mb-2">Tentang Perhitungan</h3>
          <ul className="text-sm text-slate-600 space-y-1 list-disc list-inside">
            <li>
              <strong>UP (Uang Pesangon):</strong> 1–9 bulan gaji sesuai masa kerja (tabel UU Cipta
              Kerja).
            </li>
            <li>
              <strong>UPMK:</strong> Diberikan jika masa kerja ≥ 3 tahun; 2–10 bulan gaji sesuai
              blok 3 tahunan.
            </li>
            <li>
              <strong>UPH:</strong> 15% dari (UP + UPMK) untuk penggantian hak (cuti, kesehatan,
              perumahan, dll.).
            </li>
            <li>
              Alasan PHK dapat mempengaruhi hak pesangon; untuk kasus khusus disarankan konsultasi
              dengan konsultan HR atau advokat ketenagakerjaan.
            </li>
          </ul>
        </section>
      </main>
    </div>
  );
}
