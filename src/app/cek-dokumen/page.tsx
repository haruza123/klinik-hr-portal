'use client';

import { useState } from 'react';
import Link from 'next/link';
import { Header } from '@/components/Header';
import { CheckCircle2, AlertTriangle, FileCheck2, ChevronRight } from 'lucide-react';

interface CheckItem {
  id: string;
  label: string;
  hint: string;
  critical?: boolean;
}

const PKWT_ITEMS: CheckItem[] = [
  {
    id: 'pkwt-tertulis',
    label: 'Kontrak dibuat secara tertulis dalam bahasa Indonesia',
    hint: 'PKWT wajib tertulis; jika lisan, statusnya otomatis berubah menjadi karyawan tetap (PKWTT).',
    critical: true,
  },
  {
    id: 'pkwt-no-probation',
    label: 'Tidak ada masa percobaan (probation) di dalam kontrak PKWT',
    hint: 'Pasal 58 UU Ketenagakerjaan melarang probation pada PKWT.',
    critical: true,
  },
  {
    id: 'pkwt-durasi',
    label: 'Total jangka waktu kontrak & perpanjangan maksimal 5 tahun',
    hint: 'Sesuai PP 35/2021, batas maksimal PKWT jangka waktu tertentu adalah 5 tahun.',
  },
  {
    id: 'pkwt-upah',
    label: 'Besaran gaji pokok, tunjangan, dan jadwal pembayaran tertulis jelas',
    hint: 'Upah pokok + tunjangan tetap minimal sesuai UMP/UMK setempat (kecuali UMKM tertentu).',
  },
  {
    id: 'pkwt-kompensasi',
    label: 'Ada kejelasan hak uang kompensasi saat kontrak berakhir',
    hint: 'Pekerja PKWT berhak atas uang kompensasi (1 bulan upah per 12 bulan kerja).',
  },
  {
    id: 'pkwt-no-ijazah',
    label: 'Tidak ada klausul penahanan ijazah asli atau dokumen pribadi',
    hint: 'Penahanan ijazah asli tidak dibenarkan secara prinsip ketenagakerjaan.',
    critical: true,
  },
  {
    id: 'pkwt-bpjs',
    label: 'Perusahaan mendaftarkan ke BPJS Kesehatan & BPJS Ketenagakerjaan',
    hint: 'Wajib untuk semua pekerja sejak mulai bekerja.',
  },
];

const PKWTT_ITEMS: CheckItem[] = [
  {
    id: 'pkwtt-surat',
    label: 'Ada surat pengangkatan atau Perjanjian Kerja PKWTT tertulis',
    hint: 'Menjadi bukti sah hubungan kerja karyawan tetap.',
    critical: true,
  },
  {
    id: 'pkwtt-probation',
    label: 'Jika ada masa percobaan (probation), durasinya maksimal 3 bulan',
    hint: 'Probation lebih dari 3 bulan tidak sah dan gaji probation tidak boleh di bawah UMP/UMK.',
    critical: true,
  },
  {
    id: 'pkwtt-upah',
    label: 'Rincian gaji pokok, tunjangan tetap, dan lembur tercantum jelas',
    hint: 'Upah pokok minimal 75% dari total upah (jika ada komponen tunjangan tetap).',
  },
  {
    id: 'pkwtt-cuti',
    label: 'Hak cuti tahunan (12 hari setelah 12 bulan) & izin sakit diatur jelas',
    hint: 'Sesuai Pasal 79 UU Ketenagakerjaan.',
  },
  {
    id: 'pkwtt-bpjs',
    label: 'Kepesertaan BPJS Kesehatan & Ketenagakerjaan aktif',
    hint: 'Termasuk JHT, JKK, JKM, dan JP/JKP sesuai ketentuan.',
  },
  {
    id: 'pkwtt-no-ijazah',
    label: 'Tidak ada penahanan ijazah asli maupun denda resign tanpa ikatan dinas sah',
    hint: 'PKWTT tidak boleh dikenai denda resign kecuali ada ikatan dinas pelatihan khusus.',
    critical: true,
  },
];

export default function CekDokumenPage() {
  const [contractType, setContractType] = useState<'pkwt' | 'pkwtt'>('pkwt');
  const [checked, setChecked] = useState<Record<string, boolean>>({});

  const items = contractType === 'pkwt' ? PKWT_ITEMS : PKWTT_ITEMS;
  const checkedCount = items.filter((item) => checked[item.id]).length;
  const missingCritical = items.filter((item) => item.critical && !checked[item.id]);
  const score = Math.round((checkedCount / items.length) * 100);

  function toggle(id: string) {
    setChecked((prev) => ({ ...prev, [id]: !prev[id] }));
  }

  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6">
        <div className="flex items-center gap-3">
          <div className="rounded-xl bg-emerald-100 p-2.5 text-emerald-700">
            <FileCheck2 className="h-6 w-6" />
          </div>
          <div>
            <h1 className="text-2xl font-bold text-slate-900 sm:text-3xl">
              Cek Kelengkapan Dokumen Kerja
            </h1>
            <p className="mt-1 text-slate-600">
              Audit mandiri kontrak kerja Anda (untuk Pekerja, HRD, maupun Pengusaha) sebelum tanda tangan.
            </p>
          </div>
        </div>

        {/* Pilih Jenis Kontrak */}
        <div className="mt-8 flex gap-2 rounded-xl bg-slate-100 p-1 w-fit border border-slate-200">
          <button
            type="button"
            onClick={() => setContractType('pkwt')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              contractType === 'pkwt'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Kontrak (PKWT)
          </button>
          <button
            type="button"
            onClick={() => setContractType('pkwtt')}
            className={`rounded-lg px-4 py-2 text-sm font-semibold transition-colors ${
              contractType === 'pkwtt'
                ? 'bg-white text-emerald-700 shadow-sm'
                : 'text-slate-600 hover:text-slate-900'
            }`}
          >
            Karyawan Tetap (PKWTT)
          </button>
        </div>

        {/* Score Summary */}
        <div className="mt-6 rounded-2xl border border-slate-200 bg-slate-50/70 p-6">
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div>
              <p className="text-sm font-medium text-slate-500">Skor Kepatuhan Kontrak</p>
              <p className="mt-1 text-3xl font-bold text-slate-900">
                {score}%{' '}
                <span className="text-base font-normal text-slate-500">
                  ({checkedCount} dari {items.length} poin terpenuhi)
                </span>
              </p>
            </div>
            {missingCritical.length === 0 && checkedCount === items.length ? (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-emerald-100 px-3 py-1.5 text-sm font-semibold text-emerald-800">
                <CheckCircle2 className="h-4 w-4" />
                Kontrak Memenuhi Standar
              </span>
            ) : (
              <span className="inline-flex items-center gap-1.5 rounded-full bg-amber-100 px-3 py-1.5 text-sm font-semibold text-amber-800">
                <AlertTriangle className="h-4 w-4" />
                {missingCritical.length} Poin Kritis Belum Terpenuhi
              </span>
            )}
          </div>
          <div className="mt-4 h-2.5 w-full overflow-hidden rounded-full bg-slate-200">
            <div
              className="h-full bg-emerald-600 transition-all duration-300"
              style={{ width: `${score}%` }}
            />
          </div>
        </div>

        {/* Checklist */}
        <div className="mt-6 space-y-3">
          {items.map((item) => {
            const isChecked = !!checked[item.id];
            return (
              <label
                key={item.id}
                className={`flex items-start gap-3.5 rounded-2xl border p-4 cursor-pointer transition-all ${
                  isChecked
                    ? 'border-emerald-300 bg-emerald-50/40'
                    : 'border-slate-200 bg-white hover:border-slate-300'
                }`}
              >
                <input
                  type="checkbox"
                  checked={isChecked}
                  onChange={() => toggle(item.id)}
                  className="mt-1 h-4 w-4 rounded border-slate-300 text-emerald-600 focus:ring-emerald-500"
                />
                <div className="flex-1">
                  <div className="flex flex-wrap items-center gap-2">
                    <span className="font-medium text-slate-900">{item.label}</span>
                    {item.critical && (
                      <span className="rounded-full bg-rose-50 px-2 py-0.5 text-[11px] font-semibold text-rose-700 border border-rose-200">
                        Kritis
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-sm text-slate-600">{item.hint}</p>
                </div>
              </label>
            );
          })}
        </div>

        {/* CTA jika ada masalah */}
        <div className="mt-8 rounded-2xl border border-emerald-200 bg-emerald-50/50 p-6 flex flex-col sm:flex-row sm:items-center sm:justify-between gap-4">
          <div>
            <h2 className="font-semibold text-slate-900">
              Menemukan klausul bermasalah di kontrak Anda?
            </h2>
            <p className="mt-1 text-sm text-slate-600">
              Kirimkan ringkasan kasus atau draf pertanyaannya melalui Konsultasi Pro untuk ditinjau konsultan HR.
            </p>
          </div>
          <Link
            href="/konsultasi-pro"
            className="inline-flex shrink-0 items-center justify-center gap-1.5 rounded-xl bg-emerald-600 px-5 py-2.5 text-sm font-semibold text-white hover:bg-emerald-700 transition-colors"
          >
            Konsultasi Pro
            <ChevronRight className="h-4 w-4" />
          </Link>
        </div>
      </main>
    </div>
  );
}
