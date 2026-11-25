-- Seed data Klinik HR Portal untuk Para Pekerja Indonesia

INSERT OR IGNORE INTO categories (id, name, slug, description) VALUES
  ('cat-kontrak', 'Kontrak Kerja & Status', 'kontrak-kerja', 'Informasi seputar PKWT, PKWTT, masa percobaan (probation), perpanjangan kontrak, dan kompensasi kontrak.'),
  ('cat-gaji', 'Gaji, Lembur & THR', 'gaji-lembur-thr', 'Panduan upah minimum (UMP/UMK), perhitungan lembur, pemotongan gaji, slip gaji, dan THR keagamaan.'),
  ('cat-cuti', 'Cuti & Izin Kerja', 'cuti-izin-kerja', 'Hak cuti tahunan, cuti sakit, cuti melahirkan, cuti haid, serta izin tidak masuk kerja yang dibayar.'),
  ('cat-phk', 'PHK & Pesangon', 'phk-pesangon', 'Hak pesangon, UPMK, uang penggantian hak, prosedur resign, dan langkah saat terkena PHK sepihak.'),
  ('cat-bpjs', 'BPJS & Jaminan Sosial', 'bpjs-jaminan-sosial', 'Hak kepesertaan BPJS Kesehatan, BPJS Ketenagakerjaan (JHT, JKK, JKM, JP, JKP), dan cara klaim.'),
  ('cat-hak', 'Lingkungan & Hak Pekerja', 'hak-pekerja', 'Perlindungan dari penahanan ijazah, jam kerja wajar, intimidasi kerja, dan pelaporan ke Disnaker.'),
  ('cat-rekrutmen', 'Rekrutmen & Onboarding', 'rekrutmen-onboarding', 'Offering letter, penalti resign kontrak, dokumen awal masuk kerja, dan perjanjian kerahasiaan (NDA).');

INSERT OR IGNORE INTO questions (id, category_id, question_text, slug, answer, question_order, is_required, views) VALUES
  (
    'q-pkwt-kompensasi',
    'cat-kontrak',
    'Apakah pekerja kontrak (PKWT) berhak mendapat uang kompensasi saat kontrak berakhir?',
    'apakah-pekerja-kontrak-pkwt-berhak-uang-kompensasi',
    '<p><strong>Ya, berhak.</strong> Berdasarkan PP Nomor 35 Tahun 2021 Pasal 15–17, pengusaha wajib memberikan <strong>uang kompensasi</strong> kepada pekerja PKWT yang hubungan kerjanya berakhir (baik karena jangka waktu kontrak selesai maupun diperpanjang).</p><ul><li><strong>Masa kerja 12 bulan terus-menerus:</strong> berhak atas 1 bulan upah.</li><li><strong>Masa kerja kurang dari 12 bulan (minimal 1 bulan):</strong> dihitung proporsional dengan rumus <code>(Masa Kerja / 12) × 1 Bulan Upah</code>.</li><li><strong>Kontrak diperpanjang:</strong> uang kompensasi untuk kontrak pertama wajib dibayarkan saat masa kontrak pertama berakhir, sebelum perpanjangan dimulai.</li></ul><p><em>Catatan:</em> Ketentuan ini berlaku untuk pekerja WNI. Jika pekerja mengundurkan diri sebelum kontrak selesai, kompensasi tetap dihitung sesuai masa kerja yang sudah dijalani hingga tanggal berakhirnya kontrak berdasarkan kesepakatan/ketentuan.</p>',
    1,
    1,
    145
  ),
  (
    'q-probation-pkwt',
    'cat-kontrak',
    'Bolehkah perusahaan menerapkan masa percobaan (probation) pada pekerja kontrak PKWT?',
    'bolehkah-probation-pada-pekerja-kontrak-pkwt',
    '<p><strong>Tidak boleh.</strong> Sesuai Pasal 58 UU Ketenagakerjaan (yang dipertegas dalam UU Cipta Kerja &amp; PP 35/2021), Perjanjian Kerja Waktu Tertentu (PKWT) <strong>tidak boleh mensyaratkan adanya masa percobaan (probation)</strong>.</p><ul><li>Jika dalam kontrak PKWT tetap dicantumkan klausul masa percobaan, maka masa percobaan tersebut <strong>batal demi hukum</strong> dan masa kerja tetap dihitung penuh sejak hari pertama.</li><li>Masa percobaan maksimal <strong>3 bulan</strong> hanya diperbolehkan untuk pekerja tetap (<strong>PKWTT</strong>), dan selama probation upah tidak boleh di bawah upah minimum yang berlaku.</li></ul>',
    2,
    1,
    98
  ),
  (
    'q-pkwt-maksimal',
    'cat-kontrak',
    'Berapa lama batas maksimal kontrak kerja (PKWT) dapat diperpanjang?',
    'batas-maksimal-kontrak-kerja-pkwt',
    '<p>Berdasarkan PP Nomor 35 Tahun 2021 Pasal 8, jangka waktu PKWT berdasarkan jangka waktu tertentu (termasuk perpanjangannya) adalah <strong>maksimal 5 (lima) tahun</strong>.</p><ul><li>Perusahaan dan pekerja dapat menyepakati durasi kontrak awal maupun perpanjangan selama total keseluruhannya tidak melebihi 5 tahun.</li><li>Jika pekerjaan bersifat tetap dan terus-menerus, seharusnya menggunakan status <strong>PKWTT (karyawan tetap)</strong>, bukan PKWT berulang tanpa batas.</li></ul>',
    3,
    1,
    76
  ),
  (
    'q-lembur-hitungan',
    'cat-gaji',
    'Bagaimana cara menghitung upah lembur yang benar sesuai aturan pemerintah?',
    'cara-menghitung-upah-lembur-sesuai-aturan',
    '<p>Berdasarkan PP Nomor 35 Tahun 2021 Pasal 31, waktu kerja lembur hanya dapat dilakukan paling lama <strong>4 jam per hari</strong> dan <strong>18 jam per minggu</strong> (tidak termasuk lembur di hari istirahat mingguan/hari libur resmi).</p><p><strong>Rumus Upah Sejam:</strong> <code>1 / 173 × Upah Sebulan</code> (upah pokok + tunjangan tetap).</p><ul><li><strong>Lembur di hari kerja biasa:</strong><ul><li>Jam ke-1: <strong>1,5 × upah sejam</strong></li><li>Jam ke-2 dan seterusnya: <strong>2 × upah sejam</strong></li></ul></li><li><strong>Lembur di hari istirahat mingguan / libur nasional (pola 5 hari kerja):</strong><ul><li>Jam ke-1 s.d. ke-8: <strong>2 × upah sejam</strong></li><li>Jam ke-9: <strong>3 × upah sejam</strong></li><li>Jam ke-10 s.d. ke-12: <strong>4 × upah sejam</strong></li></ul></li></ul><p>Selain upah lembur, pekerja yang lembur minimal 4 jam juga berhak mendapat <strong>makanan dan minuman</strong> bergizi (minimal 1.400 kkal) yang tidak boleh diganti uang.</p>',
    1,
    1,
    132
  ),
  (
    'q-thr-hitung',
    'cat-gaji',
    'Kapan THR wajib dibayarkan dan bagaimana perhitungannya untuk karyawan baru?',
    'kapan-thr-wajib-dibayarkan-dan-perhitungannya',
    '<p>Berdasarkan Permenaker Nomor 6 Tahun 2016, Tunjangan Hari Raya (THR) Keagamaan wajib dibayarkan oleh pengusaha paling lambat <strong>7 (tujuh) hari sebelum hari raya keagamaan</strong> dan harus dibayar penuh (tidak boleh dicicil).</p><ul><li><strong>Masa kerja 12 bulan atau lebih secara terus-menerus:</strong> berhak mendapat <strong>1 bulan upah</strong> (gaji pokok + tunjangan tetap).</li><li><strong>Masa kerja 1 bulan sampai kurang dari 12 bulan:</strong> dihitung proporsional dengan rumus <code>(Masa Kerja / 12) × 1 Bulan Upah</code>.</li><li><strong>Masa kerja kurang dari 1 bulan:</strong> belum berhak secara hukum, kecuali diatur lain dalam perjanjian kerja/peraturan perusahaan.</li></ul><p>Ketentuan ini berlaku sama untuk karyawan tetap (<strong>PKWTT</strong>), karyawan kontrak (<strong>PKWT</strong>), maupun pekerja harian lepas yang memenuhi syarat masa kerja.</p>',
    2,
    1,
    160
  ),
  (
    'q-potong-gaji',
    'cat-gaji',
    'Bolehkah perusahaan memotong gaji pekerja karena target tidak tercapai atau terlambat?',
    'bolehkah-perusahaan-memotong-gaji-pekerja',
    '<p>Perusahaan <strong>tidak boleh sembarangan memotong gaji</strong> pekerja. Menurut PP Nomor 36 Tahun 2021 tentang Pengupahan, pemotongan upah hanya diperbolehkan untuk hal-hal tertentu yang sah, antara lain:</p><ul><li>Denda atau ganti rugi yang sudah diatur jelas dan tertulis dalam Perjanjian Kerja, Peraturan Perusahaan (PP), atau PKB.</li><li>Kewajiban pajak penghasilan (PPh 21), iuran BPJS Kesehatan, dan BPJS Ketenagakerjaan.</li><li>Pembayaran utang/cicilan pekerja kepada perusahaan berdasarkan kesepakatan tertulis.</li><li>Kelebihan pembayaran upah atau sewa rumah/fasilitas milik perusahaan.</li></ul><p><strong>Batas maksimal:</strong> Total pemotongan upah (kecuali pajak &amp; BPJS) tidak boleh lebih dari <strong>50%</strong> dari setiap pembayaran upah yang diterima pekerja. Pemotongan sepihak karena target penjualan tidak tercapai tanpa kesepakatan tertulis yang sah tidak dibenarkan.</p>',
    3,
    1,
    88
  ),
  (
    'q-cuti-tahunan',
    'cat-cuti',
    'Berapa hari hak cuti tahunan pekerja dan apakah cuti yang tidak diambil bisa diuangkan?',
    'hak-cuti-tahunan-dan-apakah-bisa-diuangkan',
    '<p>Setiap pekerja yang telah bekerja selama <strong>12 bulan secara terus-menerus</strong> berhak atas cuti tahunan paling sedikit <strong>12 hari kerja</strong> (Pasal 79 UU Ketenagakerjaan).</p><ul><li>Selama menjalankan cuti tahunan, pekerja tetap menerima <strong>upah penuh</strong>.</li><li><strong>Apakah bisa diuangkan?</strong> Selama masih bekerja aktif, cuti tahunan umumnya tidak otomatis diuangkan kecuali diatur khusus dalam Peraturan Perusahaan/PKB. Namun, <strong>jika terjadi PHK atau resign</strong>, sisa cuti tahunan yang belum diambil dan belum gugur wajib diganti uang sebagai bagian dari <strong>Uang Penggantian Hak (UPH)</strong>.</li></ul>',
    1,
    1,
    112
  ),
  (
    'q-cuti-sakit-melahirkan',
    'cat-cuti',
    'Apakah izin sakit dengan surat dokter dan cuti melahirkan tetap dibayar penuh?',
    'izin-sakit-dan-cuti-melahirkan-tetap-dibayar',
    '<p><strong>Ya, wajib dibayar.</strong> Pekerja yang tidak masuk kerja karena sakit (dengan keterangan dokter yang sah) atau cuti melahirkan dilindungi oleh undang-undang (no work no pay tidak berlaku untuk kondisi ini).</p><ul><li><strong>Cuti Melahirkan:</strong> Pekerja perempuan berhak atas istirahat selama <strong>1,5 bulan sebelum</strong> dan <strong>1,5 bulan sesudah</strong> melahirkan (total 3 bulan) dengan upah penuh.</li><li><strong>Sakit berkepanjangan:</strong><ul><li>4 bulan pertama: dibayar <strong>100%</strong> upah.</li><li>4 bulan kedua: dibayar <strong>75%</strong> upah.</li><li>4 bulan ketiga: dibayar <strong>50%</strong> upah.</li><li>Bulan selanjutnya sebelum PHK: dibayar <strong>25%</strong> upah.</li></ul></li></ul>',
    2,
    1,
    84
  ),
  (
    'q-phk-pesangon',
    'cat-phk',
    'Apa saja hak yang diterima pekerja jika terkena PHK dari perusahaan?',
    'hak-yang-diterima-pekerja-jika-terkena-phk',
    '<p>Jika pekerja tetap (PKWTT) mengalami Pemutusan Hubungan Kerja (PHK), perusahaan wajib membayarkan komponen berikut sesuai alasan PHK yang diatur dalam PP Nomor 35 Tahun 2021:</p><ul><li><strong>Uang Pesangon (UP):</strong> Dihitung berdasarkan masa kerja (1 bulan upah untuk masa kerja &lt;1 tahun, hingga maksimal 9 bulan upah untuk masa kerja ≥8 tahun), dikalikan faktor pengali sesuai alasan PHK (misalnya efisiensi, tutup usaha, pensiun, dll.).</li><li><strong>Uang Penghargaan Masa Kerja (UPMK):</strong> Diberikan untuk masa kerja minimal 3 tahun (mulai dari 2 bulan upah hingga 10 bulan upah untuk masa kerja ≥24 tahun).</li><li><strong>Uang Penggantian Hak (UPH):</strong> Meliputi sisa cuti tahunan yang belum diambil dan belum gugur, ongkos pulang ke tempat asal diterima bekerja, serta hal lain yang ditetapkan dalam kontrak/PP/PKB.</li></ul><p>Gunakan fitur <a href="/kalkulator">Kalkulator Pesangon</a> di portal ini untuk simulasi perhitungannya.</p>',
    1,
    1,
    174
  ),
  (
    'q-resign-hak',
    'cat-phk',
    'Jika mengundurkan diri (resign) secara baik-baik, apa saja hak yang masih didapat?',
    'hak-pekerja-saat-resign-baik-baik',
    '<p>Pekerja tetap (PKWTT) yang mengundurkan diri atas kemauan sendiri secara sah (mengajukan surat resign minimal <strong>30 hari sebelumnya</strong>, tidak terikat ikatan dinas, dan tetap menjalankan kewajiban sampai tanggal efektif) berhak menerima:</p><ul><li><strong>Uang Penggantian Hak (UPH):</strong> termasuk penggantian sisa cuti tahunan yang masih aktif.</li><li><strong>Uang Pisah:</strong> besarannya mengikuti aturan dalam Perjanjian Kerja, Peraturan Perusahaan (PP), atau Perjanjian Kerja Bersama (PKB) masing-masing perusahaan.</li><li><strong>Dokumen penting:</strong> Surat Keterangan Pengalaman Kerja (Paklaring) dan pencairan JHT BPJS Ketenagakerjaan.</li></ul><p><em>Catatan:</em> Pekerja yang resign tidak mendapatkan Uang Pesangon maupun UPMK.</p>',
    2,
    1,
    129
  ),
  (
    'q-bpjs-wajib',
    'cat-bpjs',
    'Apakah perusahaan wajib mendaftarkan pekerja ke BPJS Kesehatan dan BPJS Ketenagakerjaan?',
    'kewajiban-perusahaan-mendaftarkan-bpjs-pekerja',
    '<p><strong>Wajib.</strong> Berdasarkan UU Nomor 24 Tahun 2011 tentang BPJS, setiap pemberi kerja wajib mendaftarkan seluruh pekerjanya (baik tetap maupun kontrak) ke dalam program:</p><ul><li><strong>BPJS Kesehatan:</strong> Iuran total 5% dari upah (4% ditanggung perusahaan, 1% dipotong dari upah pekerja).</li><li><strong>BPJS Ketenagakerjaan:</strong><ul><li><strong>JKK (Jaminan Kecelakaan Kerja):</strong> 100% ditanggung perusahaan.</li><li><strong>JKM (Jaminan Kematian):</strong> 100% ditanggung perusahaan.</li><li><strong>JHT (Jaminan Hari Tua):</strong> 3,7% perusahaan + 2% pekerja.</li><li><strong>JP (Jaminan Pensiun):</strong> 2% perusahaan + 1% pekerja (untuk perusahaan skala tertentu).</li><li><strong>JKP (Jaminan Kehilangan Pekerjaan):</strong> Bagi pekerja yang memenuhi syarat jika terkena PHK.</li></ul></li></ul><p>Jika gaji kamu dipotong untuk BPJS tetapi kartu tidak aktif saat dicek di aplikasi <strong>Mobile JKN</strong> atau <strong>JMO</strong>, kamu berhak meminta bukti setor ke HR atau melaporkannya ke BPJS / Disnaker.</p>',
    1,
    1,
    105
  ),
  (
    'q-jkp-klaim',
    'cat-bpjs',
    'Apa itu JKP (Jaminan Kehilangan Pekerjaan) dan syarat klaimnya saat terkena PHK?',
    'apa-itu-jkp-dan-syarat-klaimnya',
    '<p><strong>JKP (Jaminan Kehilangan Pekerjaan)</strong> adalah program BPJS Ketenagakerjaan bagi pekerja yang mengalami PHK agar tetap mendapat bantuan uang tunai, akses informasi lowongan kerja, dan pelatihan kerja.</p><ul><li><strong>Syarat utama:</strong> WNI, belum berusia 54 tahun, terdaftar di BPJS Kesehatan &amp; BPJS Ketenagakerjaan dengan masa iur minimal <strong>12 bulan dalam 24 bulan terakhir</strong> (minimal 6 bulan berturut-turut sebelum PHK).</li><li><strong>Manfaat uang tunai:</strong> Diberikan maksimal selama 6 bulan (45% dari upah untuk 3 bulan pertama, dan 25% dari upah untuk 3 bulan berikutnya, dengan batas atas upah tertentu).</li><li><strong>Penting:</strong> JKP berlaku untuk korban PHK, <strong>bukan</strong> untuk pengunduran diri (resign), pensiun, atau kontrak PKWT yang berakhir normal sesuai tanggalnya.</li></ul>',
    2,
    1,
    67
  ),
  (
    'q-tahan-ijazah',
    'cat-hak',
    'Bolehkah perusahaan menahan ijazah asli karyawan?',
    'bolehkah-perusahaan-menahan-ijazah-asli-karyawan',
    '<p>Secara prinsip ketenagakerjaan, <strong>perusahaan tidak dibenarkan menahan ijazah asli pekerja</strong> secara sepihak, apalagi dijadikan alat untuk memaksa pekerja bertahan atau membayar denda yang tidak wajar.</p><ul><li>Ijazah adalah dokumen pribadi yang melekat pada pemiliknya. Perusahaan cukup meminta salinan/fotokopi terlegalisir atau melakukan verifikasi dokumen asli saat proses rekrutmen.</li><li>Jika ijazah sudah terlanjur ditahan dan perusahaan menolak mengembalikan setelah hubungan kerja berakhir atau hak pekerja diselesaikan, kamu dapat mengirimkan <strong>permintaan tertulis resmi</strong>, lalu melaporkannya ke <strong>Pengawas Ketenagakerjaan Disnaker setempat</strong>.</li></ul>',
    1,
    1,
    151
  ),
  (
    'q-jam-kerja',
    'cat-hak',
    'Berapa batas jam kerja normal per minggu dan aturan waktu istirahat pekerja?',
    'batas-jam-kerja-normal-dan-waktu-istirahat',
    '<p>Sesuai Pasal 77 &amp; 79 UU Ketenagakerjaan (dalam PP 35/2021), jam kerja normal adalah <strong>40 jam dalam 1 minggu</strong> dengan dua pola:</p><ul><li><strong>Pola 6 hari kerja:</strong> 7 jam per hari dan 40 jam per minggu.</li><li><strong>Pola 5 hari kerja:</strong> 8 jam per hari dan 40 jam per minggu.</li></ul><p><strong>Hak istirahat:</strong></p><ul><li>Istirahat antar jam kerja minimal <strong>30 menit</strong> setelah bekerja 4 jam terus-menerus (waktu istirahat ini tidak termasuk jam kerja).</li><li>Istirahat mingguan minimal <strong>1 hari</strong> untuk pola 6 hari kerja, atau <strong>2 hari</strong> untuk pola 5 hari kerja.</li></ul>',
    2,
    1,
    91
  ),
  (
    'q-lapor-disnaker',
    'cat-hak',
    'Bagaimana langkah melapor jika hak pekerja dilanggar atau gaji tidak dibayar?',
    'langkah-melapor-ke-disnaker-jika-hak-pekerja-dilanggar',
    '<p>Jika terjadi pelanggaran hak pekerja (seperti gaji tidak dibayar, THR mangkir, atau PHK sepihak tanpa pesangon), ikuti alur penyelesaian perselisihan hubungan industrial (UU PPHI) berikut:</p><ol><li><strong>Kumpulkan Bukti:</strong> Simpan kontrak kerja, slip gaji, mutasi rekening, absensi, chat/email instruksi kerja, dan surat peringatan/PHK.</li><li><strong>Perundingan Bipartit:</strong> Ajukan pertemuan tertulis dengan pihak HR/manajemen perusahaan untuk musyawarah (maksimal 30 hari kerja) dan buat <strong>risalah perundingan</strong>.</li><li><strong>Mediasi Tripartit di Disnaker:</strong> Jika bipartit gagal, daftarkan pengaduan ke Dinas Ketenagakerjaan (Disnaker) kabupaten/kota setempat untuk mediasi resmi bersama mediator ketenagakerjaan.</li><li><strong>Pengadilan Hubungan Industrial (PHI):</strong> Jika mediasi tidak mencapai kesepakatan, pekerja dapat melanjutkan gugatan ke PHI berdasarkan anjuran tertulis mediator.</li></ol>',
    3,
    1,
    118
  ),
  (
    'q-penalti-resign',
    'cat-rekrutmen',
    'Apakah klausul penalti atau denda jika resign sebelum kontrak habis itu sah?',
    'apakah-klausul-penalti-resign-kontrak-sah',
    '<p><strong>Tergantung jenis kontraknya:</strong></p><ul><li><strong>Untuk pekerja kontrak (PKWT):</strong> Menurut Pasal 62 UU Ketenagakerjaan, apabila salah satu pihak mengakhiri hubungan kerja sebelum jangka waktu berakhir, pihak yang mengakhiri diwajibkan membayar <strong>ganti rugi sebesar upah pekerja sampai batas waktu berakhirnya jangka waktu perjanjian kerja</strong> — <em>kecuali</em> berakhirnya kontrak karena kondisi tertentu seperti pekerja meninggal, pensiun, atau kesepakatan bersama tanpa ganti rugi.</li><li><strong>Untuk pekerja tetap (PKWTT):</strong> Tidak boleh ada denda resign, <strong>kecuali</strong> pekerja menandatangani perjanjian <strong>ikatan dinas</strong> yang sah karena perusahaan membiayai pelatihan/pendidikan khusus dengan nominal yang wajar dan proporsional.</li></ul>',
    1,
    1,
    95
  );
