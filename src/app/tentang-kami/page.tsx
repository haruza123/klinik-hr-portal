import type { Metadata } from 'next';
import { Header } from '@/components/Header';

export const metadata: Metadata = {
  title: 'Tentang Kami',
  description:
    'Klinik HR merupakan platform konsultasi dan edukasi hukum ketenagakerjaan yang praktis, terpercaya, dan mudah diakses bagi karyawan serta praktisi HR di Indonesia.',
};

export default function TentangKamiPage() {
  return (
    <div className="min-h-screen bg-white">
      <Header />
      <main className="mx-auto max-w-4xl px-4 py-10 sm:px-6 lg:px-8">
        <section className="mb-12">
          <h1 className="text-3xl font-bold tracking-tight text-slate-900 sm:text-4xl">
            Tentang Klinik HR
          </h1>
          <p className="mt-6 text-lg text-slate-700 leading-relaxed">
            Klinik HR adalah platform konsultasi dan edukasi hukum ketenagakerjaan yang dirancang secara khusus untuk mendampingi karyawan serta praktisi HR dalam memahami hak, kewajiban, dan praktik terbaik di lingkungan kerja sesuai regulasi Indonesia.
          </p>
          <p className="mt-4 text-slate-600 leading-relaxed">
            Kami berkomitmen menyajikan informasi yang praktis, jelas, dan selalu selaras dengan ketentuan hukum ketenagakerjaan terkini—baik bagi karyawan berstatus <span className="font-semibold">Perjanjian Kerja Waktu Tertentu (PKWT)</span> maupun <span className="font-semibold">Perjanjian Kerja Waktu Tidak Tertentu (PKWTT)</span>.
          </p>
          <p className="mt-4 text-slate-600 leading-relaxed">
            Melalui koleksi tanya jawab, artikel mendalam, serta panduan singkat, Klinik HR hadir sebagai mitra diskusi yang dapat diandalkan dalam menghadapi berbagai isu ketenagakerjaan, mulai dari pengaturan gaji, penyusunan kontrak kerja, pemutusan hubungan kerja (PHK), hak pesangon, hingga penyelesaian hubungan industrial di perusahaan.
          </p>
        </section>

        <section className="grid gap-8 md:grid-cols-2">
          <div className="rounded-2xl border border-slate-200 bg-slate-50/70 p-7 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">Visi</h2>
            <p className="mt-4 text-slate-700 leading-relaxed">
              Menjadi rujukan utama dan terpercaya bagi karyawan serta pelaku HR di Indonesia dalam memahami serta menerapkan ketentuan ketenagakerjaan secara praktis, akurat, dan mudah diakses kapan pun dibutuhkan.
            </p>
          </div>

          <div className="rounded-2xl border border-slate-200 bg-white p-7 shadow-sm">
            <h2 className="text-2xl font-semibold text-slate-900">Misi</h2>
            <ul className="mt-4 space-y-3 text-slate-700 leading-relaxed">
              <li className="flex items-start">
                <span className="mr-3 text-slate-500">•</span>
                Menyediakan jawaban serta referensi hukum ketenagakerjaan dalam bahasa yang sederhana, jelas, dan mudah dipahami oleh berbagai kalangan.
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-slate-500">•</span>
                Membantu karyawan PKWT dan PKWTT untuk secara penuh memahami hak serta kewajiban mereka di tempat kerja.
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-slate-500">•</span>
                Mendukung praktisi HR dalam mengambil keputusan yang tepat dan sesuai dengan peraturan perundang-undangan ketenagakerjaan yang berlaku.
              </li>
              <li className="flex items-start">
                <span className="mr-3 text-slate-500">•</span>
                Menyediakan ruang konsultasi dan edukasi yang berbasis pada kasus-kasus nyata di lapangan kerja Indonesia.
              </li>
            </ul>
          </div>
        </section>
      </main>
    </div>
  );
}