# PAD Intelligence Lite
## Product Requirements Document (PRD) — Versi Revisi 2.0

**Produk:** PAD Intelligence Lite — Sistem Intelijen Potensi Pendapatan Daerah Kota Bandar Lampung  
**Versi:** 2.0 (revisi analitis)  
**Tanggal:** 20 Oktober 2026  
**Target pengguna utama:** Analis pendapatan BAPENDA  
**Platform:** Aplikasi web responsif desktop dan mobile  
**Batasan utama:** Prototipe berbasis data sintetis; tidak terhubung ke sistem Pemkot  
**Status:** Rekomendasi rancangan untuk prototipe; aturan bisnis dan kebutuhan operasional tetap perlu divalidasi

---

## 1. Ringkasan Eksekutif

PAD Intelligence Lite adalah prototipe untuk membantu analis menata inventaris reklame, memvalidasi dataset, menemukan catatan yang perlu ditinjau berdasarkan aturan transparan, menyusun prioritas pemeriksaan, mencatat hasil verifikasi, dan menghasilkan laporan.

**Nilai utama MVP** adalah alur kerja yang utuh dan dapat ditelusuri dari impor data sampai ekspor laporan. Produk tidak menetapkan pelanggaran, tidak menghitung kewajiban pajak resmi, dan tidak membuktikan kebocoran PAD secara otomatis.

Semua data contoh, lokasi, dan nilai potensi wajib diberi label **DATA SIMULASI**. Nilai penerimaan aktual hanya boleh ditampilkan jika memang ada sumber data terverifikasi; jika tidak, tampilkan “Tidak tersedia”.

### Alur utama

Impor CSV → validasi → tinjau hasil impor → inventaris dan peta → deteksi aturan → prioritas pemeriksaan → verifikasi manusia → laporan/ekspor.

### Keputusan desain utama

1. Prioritaskan alur end-to-end yang berfungsi daripada banyak fitur tambahan.
2. Pisahkan validasi kualitas data, temuan otomatis, hasil verifikasi manusia, estimasi simulasi, dan penerimaan aktual.
3. Gunakan kategori prioritas berbasis aturan yang mudah dijelaskan; jangan memakai skor numerik yang belum divalidasi.
4. Simpan riwayat analisis dan verifikasi agar hasil sebelumnya tidak hilang ketika dataset berubah.
5. Jadikan dataset sintetis dan skenario uji sebagai bagian dari produk, bukan sekadar data dekoratif.

---

## 2. Problem Statement

### 2.1 Hipotesis masalah

Dalam suatu dataset inventaris reklame, analis mungkin menghadapi atribut kosong, ID duplikat, informasi tidak konsisten, koordinat tidak valid, atau kesulitan menelusuri status pemeriksaan. Hipotesis ini perlu diuji; dokumen ini tidak menyatakan bahwa kondisi tersebut telah terbukti terjadi pada proses aktual BAPENDA Bandar Lampung.

### 2.2 Pernyataan masalah

Bagaimana membantu analis pendapatan meninjau inventaris reklame secara terstruktur, menemukan catatan yang perlu diperiksa dengan aturan yang transparan, menentukan urutan peninjauan, mencatat hasil verifikasi, dan menghasilkan laporan yang konsisten tanpa integrasi sistem pemerintah?

### 2.3 Pihak yang terdampak

- **Analis pendapatan:** melihat kualitas dataset, menemukan catatan relevan, dan menyiapkan laporan.
- **Petugas verifikasi:** memahami alasan peninjauan dan mencatat hasil pemeriksaan.
- **Pimpinan terkait:** meninjau progres dan ringkasan hasil; bukan target utama validasi MVP.
- **Pemerintah daerah:** berpotensi memperoleh proses data yang lebih tertata, tetapi dampak terhadap penerimaan aktual belum dapat diasumsikan.

### 2.4 Batas klaim

- Anomali bukan bukti pelanggaran.
- Data yang belum diverifikasi bukan otomatis bermasalah.
- Estimasi potensi bukan tarif, tagihan, kewajiban pajak, atau penerimaan aktual.
- Banyaknya temuan tidak membuktikan peningkatan PAD.
- Kesesuaian operasional dan manfaat harus diuji bersama calon pengguna.

---

## 3. Target Pengguna dan Persona

### Persona 1 — Analis Data Pendapatan

**Status:** Persona hipotetis untuk desain, bukan individu nyata.

**Tujuan**
- Mengimpor dan memvalidasi dataset.
- Menemukan data kosong, duplikat, atau tidak konsisten.
- Memahami alasan setiap temuan dan urutan prioritas.
- Memantau progres verifikasi dan mengekspor laporan.

**Kriteria keberhasilan**
- Dapat mengimpor file contoh tanpa bantuan teknis khusus.
- Dapat menelusuri temuan hingga objek sumber.
- Dapat menjelaskan alasan prioritas.
- Dapat menghasilkan laporan yang konsisten dengan dataset aktif.

### Persona 2 — Petugas Verifikasi Reklame

**Status:** Persona pendukung berdasarkan alur kerja yang diusulkan.

**Tujuan**
- Membuka objek yang perlu diperiksa.
- Memahami temuan dan atribut terkait.
- Mencatat hasil, catatan, dan tindak lanjut.
- Melihat riwayat status.

**Kriteria keberhasilan**
- Dapat memperbarui status dan menyimpan catatan.
- Hasil pemeriksaan tidak menghapus temuan awal.
- Status “terkonfirmasi” hanya muncul melalui tindakan manusia yang tercatat.

**Catatan:** Kewenangan, istilah status, dan prosedur resmi perlu dikonfirmasi kepada calon pengguna.

---

## 4. Goals, Non-goals, dan Prinsip

### 4.1 Goals MVP

1. Mengimpor CSV sintetis dan memvalidasi strukturnya.
2. Menyediakan inventaris, pencarian, filter, dan detail objek.
3. Menampilkan dashboard berdasarkan data aktif.
4. Menampilkan objek dengan koordinat valid pada peta.
5. Menjalankan deteksi anomali berbasis aturan yang dapat dijelaskan.
6. Menyediakan daftar prioritas pemeriksaan yang transparan.
7. Mencatat hasil verifikasi, catatan, dan riwayat perubahan.
8. Membuat laporan dan ekspor CSV.
9. Menandai simulasi secara konsisten pada seluruh tampilan dan keluaran.
10. Menyelesaikan skenario demo dari impor sampai laporan pada desktop dan menguji akses fungsi inti pada mobile.

### 4.2 Non-goals

- Menggantikan sistem pajak atau sistem resmi Pemkot.
- Memungut, membayar, atau memproses transaksi pajak.
- Integrasi dengan BAPENDA, BPKAD, atau sistem pemerintah lain.
- Menetapkan pelanggaran, tagihan, atau kewajiban pajak otomatis.
- Mengklaim kebocoran PAD tanpa verifikasi dan bukti.
- AI/ML prediktif yang membutuhkan data historis terverifikasi.
- Mengelola semua jenis pajak dan retribusi.
- Sistem produksi dengan jaminan keamanan, ketersediaan, atau kepatuhan yang belum diuji.

### 4.3 Prinsip produk

- **Transparan:** setiap temuan menunjukkan aturan dan alasan.
- **Berbasis bukti:** sistem menandai catatan untuk ditinjau, bukan menyimpulkan pelanggaran.
- **Dapat ditelusuri:** dataset sumber, hasil analisis, dan riwayat verifikasi saling terhubung.
- **Tidak menyesatkan:** data kosong/tidak tersedia tidak ditampilkan sebagai nol.
- **Konsisten:** dashboard, tabel, laporan, dan ekspor menggunakan definisi yang sama.
- **Terbatas secara sadar:** fitur tambahan tidak masuk MVP tanpa kebutuhan yang tervalidasi.

---

## 5. Ruang Lingkup dan Prioritas

### 5.1 MVP — wajib untuk demo

1. Impor CSV, validasi, ringkasan hasil, dan contoh dataset.
2. Inventaris, pencarian, filter, dan detail objek.
3. Dashboard ringkasan dan kualitas data.
4. Peta interaktif dengan penanganan koordinat kosong/tidak valid.
5. Deteksi anomali berbasis aturan.
6. Prioritas pemeriksaan berbasis kategori dan alasan.
7. Status verifikasi, catatan, dan riwayat.
8. Laporan dan ekspor CSV.
9. Label data simulasi pada UI dan file keluaran.
10. State loading, empty, error, dan success.

### 5.2 V2 — setelah MVP tervalidasi

- Autentikasi dan hak akses berbasis peran.
- Unggah foto/dokumen bukti dengan kontrol akses.
- Perbandingan antarperiode dan riwayat perubahan atribut objek.
- Penugasan pemeriksaan.
- Uji kegunaan dengan calon pengguna BAPENDA.
- Ekspor PDF jika format dan kebutuhan telah ditetapkan.

### 5.3 Nanti — bergantung validasi

- Integrasi resmi setelah izin, kebutuhan, dan antarmuka tersedia.
- Perluasan ke jenis objek atau sumber PAD lain.
- Analisis tren potensi/penerimaan dengan data historis tepercaya.
- Notifikasi dan analitik lanjutan jika manfaatnya terbukti.

### 5.4 Aturan pemotongan ruang lingkup

Jika waktu terbatas, pertahankan alur inti: **impor dan validasi → inventaris → aturan dan prioritas → verifikasi → laporan**. Peta dapat menggunakan pustaka sederhana atau tampilan alternatif yang jelas bila kendala konektivitas menghambat demo, tetapi keterbatasan harus dinyatakan. Autentikasi penuh, integrasi, unggah bukti, dan prediksi tidak boleh menghambat alur inti.

---

## 6. Persyaratan Fungsional dan Kriteria Penerimaan

### FR-01 — Impor dan Validasi CSV

**Persyaratan**
- FR-01.1 Pengguna dapat mengunggah CSV dan juga memuat dataset contoh.
- FR-01.2 Sistem memeriksa file, header, kolom wajib, format tanggal, tipe nilai, ID, dan koordinat.
- FR-01.3 Sistem menampilkan jumlah baris valid, ditolak, dan perlu ditinjau beserta alasan per baris.
- FR-01.4 Sistem tidak diam-diam menghapus atau memperbaiki nilai yang tidak valid.
- FR-01.5 Pengguna dapat melihat pratinjau hasil sebelum menjadikan impor sebagai dataset aktif.
- FR-01.6 Impor yang gagal tidak boleh meninggalkan dataset aktif dalam keadaan setengah terproses.
- FR-01.7 Setiap impor mendapat ID dataset dan waktu impor.
- FR-01.8 Dataset dan layar hasil impor menampilkan label DATA SIMULASI.
- FR-01.9 Kebijakan baris dengan ID duplikat harus konsisten dan terlihat: baris terkait ditandai; tidak ada penggabungan otomatis.

**Kriteria penerimaan**
- File uji valid berhasil dimuat dengan jumlah baris yang sesuai.
- Header wajib yang hilang menghasilkan pesan spesifik.
- Baris bermasalah dapat ditelusuri dan alasan kesalahannya ditampilkan.
- Pengguna dapat membatalkan atau mengulang impor tanpa merusak dataset aktif sebelumnya.

### FR-02 — Inventaris dan Detail Objek

**Persyaratan**
- Tabel mendukung pencarian berdasarkan ID/nama dan filter area, jenis, kelengkapan, kategori temuan, serta status verifikasi bila atribut tersedia.
- Detail objek menampilkan atribut sumber, dataset asal, temuan, status, dan riwayat verifikasi.
- Atribut kosong ditampilkan sebagai “Belum tersedia”.
- Data sumber dibedakan secara visual dari hasil analisis.
- Objek tanpa koordinat tetap dapat dibuka melalui tabel.
- Filter aktif dan jumlah hasil terlihat; pengguna dapat menghapus filter.

**Kriteria penerimaan**
- Pengguna dapat mencari objek, membuka detail, dan kembali ke daftar tanpa kehilangan filter yang aktif.

### FR-03 — Dashboard

**Persyaratan**
- Menampilkan jumlah objek dalam dataset aktif.
- Menampilkan kelengkapan berdasarkan definisi kolom wajib yang dipakai.
- Menampilkan jumlah temuan per kategori aturan dan status verifikasi.
- Menampilkan jumlah objek dengan koordinat valid/tidak tersedia bila relevan.
- Menampilkan progres verifikasi.
- Nilai potensi simulasi, jika ada, terpisah dari penerimaan aktual.
- Setiap metrik memiliki definisi singkat atau tooltip.
- Semua angka dihitung dari dataset aktif dan filter yang berlaku sesuai definisi yang konsisten.
- Setelah data/status berubah, ringkasan diperbarui.
- Nilai yang tidak memiliki data pendukung ditampilkan sebagai “Tidak tersedia”, bukan nol.

**Kriteria penerimaan**
- Angka dashboard dapat direkonsiliasi dengan inventaris, daftar temuan, dan status verifikasi untuk dataset uji.

### FR-04 — Peta

**Persyaratan**
- Menampilkan penanda hanya untuk koordinat yang valid.
- Penanda membuka ringkasan dan tautan ke detail objek.
- Filter yang relevan diterapkan konsisten pada peta.
- Objek tanpa koordinat tidak diberi lokasi buatan.
- Antarmuka menjelaskan bahwa posisi mengikuti kualitas koordinat sumber.
- Jika pustaka peta/tile tidak tersedia, tampilkan pesan kegagalan dan pertahankan akses ke tabel.

**Kriteria penerimaan**
- Objek berkordinat valid dapat ditelusuri dari peta ke detail; objek tanpa koordinat tetap tersedia di inventaris.

### FR-05 — Deteksi Anomali Berbasis Aturan

**Aturan awal yang dapat diimplementasikan**
1. ID kosong.
2. ID duplikat dalam ruang lingkup dataset.
3. Kolom wajib kosong.
4. Kandidat duplikat berdasarkan kombinasi atribut yang ditentukan untuk dataset demo.
5. Koordinat di luar rentang yang valid atau hanya satu koordinat terisi.
6. Nilai ukuran kosong, nonnumerik, atau tidak positif, jika satuan dan aturan dataset telah didefinisikan.
7. Status administrasi/verifikasi kosong atau di luar daftar nilai yang diizinkan.

**Persyaratan**
- Setiap temuan menyimpan ID objek atau referensi baris, ID dataset, kode aturan, alasan, waktu analisis, dan status tinjauan.
- Sistem menampilkan atribut yang memicu aturan.
- Kandidat duplikat tidak otomatis dianggap duplikat terkonfirmasi.
- Aturan dan parameter yang dipakai dapat dilihat pengguna.
- Menjalankan ulang analisis membuat hasil analisis baru atau versi yang dapat ditelusuri; tidak menghapus riwayat verifikasi.
- Temuan otomatis terpisah dari keputusan manusia.
- Aturan bisnis yang belum diketahui tidak boleh dikarang; tandai sebagai konfigurasi demo/asumsi.

**Kriteria penerimaan**
- Setiap temuan memiliki alasan dan sumber yang dapat ditelusuri.
- Kasus uji positif dan negatif menghasilkan hasil sesuai spesifikasi aturan.
- UI tidak menyebut temuan otomatis sebagai pelanggaran pajak.

### FR-06 — Prioritas Pemeriksaan

**Persyaratan**
- Daftar prioritas diturunkan dari aturan yang transparan.
- Untuk MVP gunakan kategori **Tinggi / Sedang / Perlu ditinjau**, berdasarkan matriks aturan demo yang didokumentasikan, bukan skor risiko resmi.
- Setiap item menunjukkan alasan prioritas dan aturan pemicu.
- Prioritas dapat difilter menurut kategori temuan dan status.
- Nilai potensi simulasi tidak digunakan sebagai bukti pelanggaran.
- Jika dua item memiliki kategori sama, gunakan urutan deterministik yang terdokumentasi, misalnya jumlah aturan pemicu lalu ID objek.
- Pengguna dapat melihat definisi kategori dan batasannya.

**Kriteria penerimaan**
- Dataset sama dan versi aturan sama menghasilkan urutan yang sama.
- Pengguna dapat menjelaskan alasan item masuk kategori tertentu.
- Label prioritas tidak disajikan sebagai prediksi risiko resmi.

### FR-07 — Verifikasi dan Tindak Lanjut

**Status kerja awal**
- Belum diperiksa
- Sedang diperiksa
- Terkonfirmasi sebagai masalah data
- Tidak terbukti setelah pemeriksaan
- Perlu tindak lanjut

Status ini adalah status kerja prototipe, bukan nomenklatur resmi.

**Persyaratan**
- Pengguna dapat membuka objek dan temuan terkait dari daftar prioritas.
- Pengguna dapat mengubah status dan menambahkan catatan.
- Setiap perubahan menyimpan waktu, status sebelumnya, status baru, catatan, dan identitas pengguna jika tersedia.
- Jika identitas pengguna tidak tersedia, tampilkan “Pengguna demo” atau “Identitas tidak tersedia” secara eksplisit; jangan mengarang identitas.
- Riwayat bersifat append-only pada tingkat aplikasi: perubahan baru menambah catatan, tidak menimpa sejarah sebelumnya.
- Temuan dapat dinyatakan tidak terbukti tanpa menghapus temuan awal.
- Status terkonfirmasi hanya berasal dari tindakan verifikasi manusia.
- Perubahan dataset tidak boleh mengaitkan verifikasi lama secara keliru dengan catatan baru; referensi dataset harus dipertahankan.

**Kriteria penerimaan**
- Perubahan status dan catatan tersimpan, terlihat setelah halaman dimuat ulang jika penyimpanan persisten tersedia, dan dapat ditelusuri dalam riwayat.

### FR-08 — Laporan dan Ekspor

**Laporan MVP**
- Ringkasan inventaris dan kualitas data.
- Daftar temuan berdasarkan kategori aturan dan status.
- Progres serta hasil verifikasi.
- Metadata dataset, filter yang digunakan, waktu pembuatan, dan label DATA SIMULASI.

**Persyaratan**
- Ekspor CSV untuk tabel/laporan relevan.
- Laporan mengikuti filter aktif atau menyatakan secara eksplisit bahwa laporan mencakup seluruh dataset.
- Angka laporan dan file ekspor konsisten dengan tampilan.
- Nilai potensi simulasi dipisahkan dari penerimaan aktual.
- Jika penerimaan aktual tidak tersedia, tulis “Tidak tersedia”.
- PDF bersifat opsional dan tidak menjadi penghambat MVP.
- Kegagalan ekspor menampilkan alasan yang diketahui dan opsi mencoba kembali.

**Kriteria penerimaan**
- File ekspor dapat dibuka, memiliki header yang jelas, dan cocok dengan dataset/filter uji.

### FR-09 — Label Simulasi dan Integritas Informasi

**Persyaratan**
- Label DATA SIMULASI tampak di header aplikasi, dashboard, detail, peta, dan laporan/ekspor.
- Estimasi disebut “Estimasi simulasi”, bukan tagihan.
- Temuan otomatis, hasil verifikasi, dan penerimaan aktual memiliki label yang berbeda.
- Data sintetis tidak dicampur dengan data produksi.
- Data penerimaan aktual yang tidak tersedia tidak diwakili dengan angka nol.
- Contoh koordinat tidak boleh ditampilkan sebagai lokasi reklame nyata.

**Kriteria penerimaan**
- Pengguna yang melihat layar utama dan hasil ekspor memahami bahwa sistem adalah prototipe berbasis data sintetis.

### FR-10 — Responsivitas dan State Antarmuka

**Persyaratan**
- Alur inti tersedia pada desktop dan dapat diakses pada mobile.
- Tabel memiliki tampilan responsif atau alternatif kartu pada layar sempit.
- Form memberi validasi yang spesifik.
- Setiap proses relevan memiliki state loading, success, empty, dan error.
- Pesan error menyebut penyebab yang diketahui dan langkah pemulihan.
- Navigasi mendukung perpindahan dari dashboard → temuan/prioritas → detail → verifikasi.
- Kontrol utama memiliki label yang jelas dan dapat digunakan dengan keyboard sejauh didukung implementasi.

**Kriteria penerimaan**
- Skenario inti dapat diselesaikan pada ukuran layar uji yang ditentukan tanpa tindakan penting terpotong atau tersembunyi.

---

## 7. Skema Dataset dan Model Data

### 7.1 Format CSV awal

Kolom yang diusulkan untuk dataset demo:

`object_id,object_name,area,reklame_type,size,size_unit,recorded_at,administrative_status,verification_status,latitude,longitude`

Ketentuan:
- `object_id`: ID pada dataset; ruang lingkup keunikannya perlu didefinisikan.
- `object_name`: nama sintetis.
- `area`: label area simulasi, bukan klaim wilayah objek nyata.
- `reklame_type`: kategori dari daftar nilai yang disepakati untuk demo.
- `size` dan `size_unit`: harus konsisten; jika satuan belum ditetapkan, jangan menggunakan nilai untuk kesimpulan bisnis.
- `recorded_at`: format tanggal yang ditentukan, disarankan ISO `YYYY-MM-DD`.
- `administrative_status` dan `verification_status`: nilai dari daftar yang disepakati.
- `latitude`/`longitude`: boleh kosong; hanya koordinat valid yang dipetakan.

Contoh baris sintetis:
```csv
object_id,object_name,area,reklame_type,size,size_unit,recorded_at,administrative_status,verification_status,latitude,longitude
RKL-001,Reklame Simulasi 001,Area A,Billboard,12,m2,2026-01-15,tercatat,belum_diperiksa,-5.42,105.26
RKL-002,Reklame Simulasi 002,Area B,Signage,8,m2,2026-02-10,,belum_diperiksa,,
```
Contoh di atas hanya untuk menguji alur aplikasi; bukan data aktual atau koordinat terverifikasi.

### 7.2 Entitas

**DatasetImport**
- `id`, `filename`, `imported_at`, `dataset_label`, `total_rows`, `accepted_rows`, `rejected_rows`, `status`, `schema_version`

**ReklameObject**
- `id`, `dataset_import_id`, `object_id`, `object_name`, `area`, `reklame_type`, `size`, `size_unit`, `recorded_at`, `administrative_status`, `latitude`, `longitude`, `is_synthetic`

**AnalysisRun**
- `id`, `dataset_import_id`, `rule_version`, `started_at`, `completed_at`, `status`

**AnomalyFinding**
- `id`, `analysis_run_id`, `dataset_import_id`, `object_id` atau `row_reference`, `rule_code`, `reason`, `triggered_fields`, `detected_at`, `review_status`

**VerificationRecord**
- `id`, `finding_id`, `object_id`, `status_before`, `status_after`, `notes`, `verified_at`, `verified_by`

**ReportExport**
- `id`, `dataset_import_id`, `report_type`, `filters`, `created_at`, `created_by`, `dataset_label`

### 7.3 Aturan integritas

- Satu impor menghasilkan banyak objek.
- Satu dataset dapat memiliki beberapa AnalysisRun.
- Satu AnalysisRun menghasilkan banyak temuan.
- Satu objek dapat memiliki banyak temuan dan catatan verifikasi.
- Temuan dan verifikasi disimpan terpisah.
- Dataset lama tidak boleh diam-diam diganti tanpa identitas versi.
- ID objek minimal unik dalam satu dataset; aturan lintas dataset perlu diputuskan.
- Tidak diperlukan data personal atau alamat pribadi dalam dataset demo.
- Jika aplikasi hanya memakai penyimpanan sementara, jelaskan bahwa data dapat hilang ketika sesi ditutup. Untuk demo yang perlu melewati reload, gunakan penyimpanan persisten sederhana dan uji pemulihan data.

---

## 8. Edge Cases dan Failure States

| Kondisi | Perilaku wajib |
|---|---|
| File bukan CSV/tidak terbaca | Tolak dengan alasan yang jelas. |
| Kolom wajib hilang | Sebutkan nama kolom yang hilang. |
| Dataset kosong | Tampilkan empty state dan petunjuk memuat dataset contoh. |
| ID kosong/duplikat | Tandai baris terkait; jangan menggabungkan otomatis. |
| Banyak atribut kosong | Tampilkan indikator kualitas; jangan mengisi otomatis. |
| Koordinat kosong/tidak valid | Jangan buat penanda peta palsu; tetap tampilkan di tabel. |
| Tidak ada temuan | Tampilkan nol temuan untuk dataset dan versi aturan aktif; jangan membuat temuan dummy. |
| Kandidat duplikat banyak | Jelaskan atribut pembanding; tandai sebagai kandidat. |
| Temuan tidak terbukti | Pertahankan temuan dan catatan verifikasi dalam riwayat. |
| Dataset berubah setelah verifikasi | Kaitkan hasil dengan dataset/versi asal; jangan menganggapnya otomatis berlaku pada versi baru. |
| Impor gagal di tengah proses | Dataset aktif sebelumnya tetap konsisten. |
| Ekspor gagal | Tampilkan error dan opsi coba lagi. |
| Peta tidak tersedia | Beri pesan; tabel dan verifikasi tetap dapat digunakan. |
| Nilai potensi tidak tersedia | Tampilkan “Tidak tersedia”; jangan mengarang tarif. |
| Identitas pengguna tidak tersedia | Nyatakan keterbatasan identitas audit. |
| Filter tidak menghasilkan data | Tampilkan empty state yang membedakan “tidak ada hasil” dari error. |
| Hasil analisis berubah setelah aturan diperbarui | Simpan versi aturan dan waktu analisis; jelaskan bahwa hasil dapat berubah. |
| Layar sempit | Sediakan layout responsif tanpa menghilangkan tindakan utama. |
| Pengguna mengira temuan sebagai pelanggaran | Tampilkan penjelasan bahwa temuan hanya perlu ditinjau. |

---

## 9. Prioritas dan Definisi Aturan Demo

Aturan bisnis final belum didukung oleh data atau konfirmasi resmi. Untuk demo, buat **konfigurasi aturan** yang terdokumentasi dan mudah diubah.

### 9.1 Contoh matriks prioritas prototipe

- **Tinggi:** masalah struktur yang menghambat identifikasi/penelusuran, misalnya ID kosong atau konflik ID yang membuat catatan tidak dapat dibedakan.
- **Sedang:** beberapa indikator kualitas data atau kandidat duplikat yang layak ditinjau.
- **Perlu ditinjau:** satu atribut opsional kosong, koordinat tidak tersedia, atau status belum diisi.

Matriks ini hanya contoh teknis. Jangan menggunakannya sebagai standar resmi pemeriksaan atau dasar penetapan pajak. Definisi kolom wajib, aturan kandidat duplikat, dan kategori prioritas harus ditinjau sebelum dipakai oleh calon pengguna.

### 9.2 Determinisme

Untuk dataset dan versi aturan yang sama, temuan serta urutan prioritas harus konsisten. Aturan pengurutan harus ditulis, misalnya:
1. kategori prioritas;
2. jumlah aturan pemicu;
3. ID objek secara alfabetis.

---

## 10. Metrik Keberhasilan

### 10.1 Metrik rekayasa/demo

| Metrik | Definisi | Target awal |
|---|---|---|
| Keberhasilan impor | File uji valid diproses benar | 100% kasus uji yang ditetapkan |
| Validasi | Hasil validasi cocok dengan kasus uji | 100% kasus uji |
| Konsistensi dashboard | Angka cocok dengan dataset aktif | 100% pada dataset uji |
| Konsistensi ekspor | Isi ekspor cocok dengan laporan/filter | 100% skenario uji |
| Alur end-to-end | Impor sampai ekspor berhasil | 100% skenario demo utama |
| Keterlacakan temuan | Temuan punya sumber, aturan, dan alasan | 100% temuan yang ditampilkan |
| Keterlacakan verifikasi | Perubahan status masuk riwayat | 100% skenario uji |
| Responsivitas | Fungsi inti dapat diakses pada perangkat uji | Semua skenario inti yang ditentukan |

Target ini adalah target pengujian prototipe, bukan hasil pengukuran BAPENDA.

### 10.2 Metrik deskriptif pada dataset simulasi

- Jumlah objek.
- Persentase kelengkapan atribut yang didefinisikan.
- Jumlah temuan per aturan.
- Jumlah temuan yang ditinjau, terkonfirmasi sebagai masalah data, tidak terbukti, dan perlu tindak lanjut.
- Waktu penyelesaian verifikasi pada skenario uji.
- Jumlah laporan yang berhasil dibuat.

### 10.3 Dampak PAD yang belum boleh diklaim

Potensi PAD, kewajiban pajak terverifikasi, penerimaan tambahan aktual, efisiensi pemeriksaan, dan pengurangan data bermasalah membutuhkan definisi, data pembanding, sumber yang dapat diverifikasi, serta validasi pihak berwenang. Jumlah anomali bukan ukuran langsung peningkatan PAD.

---

## 11. Definition of Done

MVP dinyatakan selesai jika:

- [ ] Dataset sintetis contoh tersedia dan diberi label.
- [ ] CSV dapat diimpor dan hasil validasi dapat ditinjau.
- [ ] Baris bermasalah menampilkan alasan.
- [ ] Data valid tampil di inventaris dan detail.
- [ ] Dashboard dihitung dari dataset aktif.
- [ ] Peta hanya menampilkan koordinat valid.
- [ ] Aturan anomali menghasilkan alasan yang dapat dijelaskan.
- [ ] Daftar prioritas menunjukkan kategori dan dasar urutan.
- [ ] Pengguna dapat menyimpan hasil verifikasi dan melihat riwayat.
- [ ] Laporan/ekspor konsisten dan menyertakan label simulasi.
- [ ] Empty, loading, success, dan error states telah diuji.
- [ ] Skenario end-to-end lulus pada desktop dan fungsi inti diperiksa pada mobile.
- [ ] Keterbatasan prototipe, asumsi, dan pertanyaan terbuka terdokumentasi.

---

## 12. Rencana Pengujian Minimum

Gunakan dataset uji terkontrol dengan kasus yang diketahui hasil yang diharapkan. Jangan hanya menguji satu dataset “normal”.

1. CSV valid tanpa anomali.
2. Header wajib hilang.
3. ID kosong.
4. ID duplikat.
5. Kolom wajib kosong.
6. Kandidat duplikat dengan atribut pembanding sama dan berbeda.
7. Koordinat kosong, hanya satu koordinat terisi, dan koordinat di luar rentang.
8. Nilai ukuran kosong, nonnumerik, nol, dan negatif jika aturan ukuran digunakan.
9. Dataset kosong.
10. Filter yang menghasilkan nol hasil.
11. Temuan yang ditandai tidak terbukti.
12. Dataset baru diimpor setelah ada verifikasi pada dataset lama.
13. Ekspor dengan dan tanpa filter.
14. Kegagalan layanan peta.
15. Tampilan desktop dan layar mobile.

Untuk setiap kasus, dokumentasikan input, hasil yang diharapkan, hasil aktual, dan status lulus/gagal. Dataset uji dan ekspektasi hasil harus dikunci versinya agar perubahan aturan tidak membuat hasil pengujian ambigu.

---

## 13. Open Questions

### Data dan aturan bisnis
1. Kolom apa yang benar-benar wajib?
2. Apa definisi objek reklame dan cakupan MVP?
3. Apakah objek, lokasi pemasangan, dan catatan administrasi merupakan entitas berbeda?
4. Atribut apa yang sah untuk kandidat duplikat?
5. Data lokasi tersedia sebagai koordinat, alamat, atau wilayah administratif?
6. Adakah data publik yang diizinkan untuk penelitian, selain data sintetis?

### Deteksi dan prioritas
7. Aturan mana yang paling relevan menurut calon analis?
8. Apakah kategori prioritas cukup, atau dibutuhkan skor?
9. Jika skor diperlukan, siapa yang menentukan dan memvalidasi bobot?
10. Siapa yang berwenang mengonfirmasi hasil pemeriksaan?
11. Bukti apa yang dibutuhkan untuk menutup temuan?

### Verifikasi dan pelaporan
12. Apakah penugasan petugas wajib untuk MVP?
13. Apakah catatan cukup, atau diperlukan lampiran bukti?
14. Apakah format laporan cukup CSV, atau PDF juga diperlukan?
15. Apakah ada format laporan resmi yang harus diikuti?
16. Bagaimana hasil verifikasi diperlakukan saat dataset baru diimpor?

### Teknologi dan operasional
17. Demo dijalankan lokal atau di-host?
18. Apakah data harus bertahan setelah browser ditutup atau halaman dimuat ulang?
19. Apakah demo menggunakan satu pengguna atau beberapa peran?
20. Apa kebutuhan minimum kontrol akses untuk penilaian?
21. Pustaka peta apa yang sesuai dengan biaya dan konektivitas?

### Validasi dan dampak
22. Apakah calon pengguna BAPENDA dapat diwawancarai atau diminta meninjau prototipe?
23. Bagaimana memastikan produk tidak menduplikasi sistem yang sudah ada?
24. Jika calon pengguna tidak tersedia, bagaimana skenario kegunaan akan dievaluasi?
25. Bukti apa yang diperlukan untuk mengukur efisiensi atau kontribusi terhadap PAD aktual?

---

## 14. Rekomendasi Implementasi

Urutan implementasi yang disarankan:

1. Tetapkan skema CSV, daftar nilai, dataset sintetis, dan hasil yang diharapkan untuk kasus uji.
2. Bangun impor, pratinjau, dan validasi.
3. Bangun inventaris, pencarian, filter, dan detail.
4. Tambahkan dashboard dengan definisi metrik yang konsisten.
5. Tambahkan peta untuk koordinat valid.
6. Implementasikan aturan anomali dan versi analisis.
7. Implementasikan prioritas transparan.
8. Implementasikan verifikasi dan riwayat.
9. Implementasikan laporan dan ekspor.
10. Uji alur end-to-end, kasus gagal, responsivitas, dan konsistensi angka.

Pilih stack berdasarkan kemampuan tim, kemudahan menjalankan demo, dan waktu yang tersedia. React dengan TypeScript dan backend sederhana dapat menjadi opsi, tetapi bukan keputusan final. Database, hosting, pustaka peta, dan kebutuhan persistensi harus diputuskan sebelum implementasi.

---

## 15. Catatan Revisi dan Keputusan yang Dipertahankan

### Keunggulan yang dipertahankan dari PRD sebelumnya
- Ruang lingkup prototipe jelas dan realistis.
- Data sintetis serta batas klaim PAD dinyatakan secara eksplisit.
- Alur inti mencakup impor, inventaris, peta, anomali, prioritas, verifikasi, dan laporan.
- Persyaratan fungsional disertai kriteria penerimaan.
- Model data, edge cases, metrik, open questions, dan Definition of Done sudah disediakan.
- Tidak memaksakan teknologi, integrasi, AI/ML, atau autentikasi penuh sebelum kebutuhan tervalidasi.

### Kelemahan yang diperbaiki
- **Aturan prioritas:** ditetapkan agar MVP memakai kategori transparan dan pengurutan deterministik, bukan skor yang belum tervalidasi.
- **Jejak analisis:** ditambahkan entitas `AnalysisRun` dan versi aturan agar hasil analisis dapat dibandingkan dan ditelusuri.
- **Impor lebih aman:** ditambahkan pratinjau dan perlindungan agar kegagalan impor tidak merusak dataset aktif.
- **Perubahan dataset:** ditegaskan bahwa verifikasi harus terikat pada dataset/versi asal.
- **Status verifikasi:** istilah status awal disusun lebih konsisten dan dinyatakan sebagai status prototipe, bukan nomenklatur resmi.
- **Pengujian:** ditambahkan rencana kasus uji yang eksplisit untuk membuktikan kriteria penerimaan.
- **Konsistensi produk:** ditegaskan bahwa dashboard, laporan, dan ekspor harus menggunakan definisi metrik serta filter yang konsisten.
- **Keterbatasan teknis:** persistensi, identitas pengguna, dan ketersediaan peta harus dijelaskan, bukan disamarkan.
- **Pengendalian ruang lingkup:** urutan implementasi dan aturan pemotongan fitur dibuat lebih jelas.

### Hal yang sengaja tidak diasumsikan
- Kolom wajib resmi, tarif, rumus kewajiban pajak, bobot risiko resmi, format laporan resmi, data aktual, integrasi, dan peran/otorisasi BAPENDA.
- Teknologi, database, hosting, dan penyedia peta final.
- Klaim dampak pada penerimaan PAD.

---

## Kesimpulan

PAD Intelligence Lite sebaiknya dinilai berdasarkan keberhasilan alur data yang dapat ditelusuri, transparansi aturan, konsistensi laporan, dan kemudahan verifikasi pada dataset sintetis. Prototipe baru layak diperluas setelah kebutuhan dan aturan bisnis ditinjau calon pengguna. Sistem tidak boleh menyamakan anomali dengan pelanggaran atau estimasi dengan penerimaan PAD aktual.
