---
name: skill-desain-pad-intelligence-lite
description: Panduan desain UI/UX dashboard web PAD Intelligence Lite berdasarkan kode HTML dan Tailwind yang diberikan, untuk menjaga konsistensi visual, hierarki data, navigasi, dan pola interaksi prototipe.
---

# Skill Desain UI/UX — PAD Intelligence Lite

## 1. Tujuan Skill

Gunakan panduan ini ketika merancang, memperbaiki, atau mengembangkan antarmuka **PAD Intelligence Lite**, prototipe dashboard analitik untuk membantu analis BAPENDA meninjau inventaris reklame, memeriksa kualitas data, membaca temuan anomali, menentukan prioritas pemeriksaan, dan mengelola dataset simulasi.

Skill ini menurunkan aturan desain dari kode HTML/Tailwind yang diberikan. Pertahankan pola yang memang terlihat pada kode. Jika perilaku atau kebutuhan belum ditentukan oleh kode, tandai sebagai keputusan yang perlu dikonfirmasi—jangan mengarang aturan bisnis.

## 2. Karakter Produk dan Prinsip Desain

- **Produk:** PAD Intelligence Lite.
- **Organisasi yang ditampilkan:** BAPENDA Kota Bandar Lampung.
- **Pengguna antarmuka yang dicontohkan:** analis pajak / analis BAPENDA.
- **Platform:** dashboard web, berorientasi desktop dengan layout responsif.
- **Gaya visual:** profesional, administratif, analitis, rapi, dan padat informasi.
- **Fokus utama:** keterbacaan data, pemindaian cepat, penelusuran temuan, dan tindakan yang jelas.
- **Bahasa UI:** Bahasa Indonesia.
- **Status prototipe:** kode menampilkan versi akademik/demo dan data sintetis; jangan menyajikan data simulasi sebagai data resmi.

### Prinsip wajib

1. **Data lebih penting daripada dekorasi.** Gunakan kartu, tabel, indikator, dan grafik untuk membantu keputusan.
2. **Jaga hierarki visual.** Judul halaman, metrik utama, temuan penting, rincian data, lalu aksi lanjutan.
3. **Buat status mudah dipindai.** Label teks harus menyertai warna status.
4. **Tampilkan konteks data.** Sertakan dataset aktif, waktu analisis/pembaruan, dan cakupan data jika tersedia.
5. **Bedakan indikator dengan kesimpulan.** Temuan otomatis adalah sinyal untuk ditinjau, bukan bukti pelanggaran.
6. **Pertahankan konsistensi antarlayar.** Navigasi, warna, tipografi, kartu, tombol, tabel, dan status harus memakai pola yang sama.
7. **Hindari klaim palsu.** Jangan menambahkan integrasi, kalkulasi, atau aksi yang tidak didukung implementasi.

## 3. Design Tokens

### 3.1 Tipografi

Gunakan **Inter** sebagai keluarga font utama. Kode memuat Google Fonts Inter dengan bobot 400, 500, 600, dan 700.

| Token | Ukuran | Line height | Bobot | Penggunaan |
|---|---:|---:|---:|---|
| `display-lg` | 32 px | 40 px | 700 | Angka KPI utama |
| `headline-lg` | 24 px | 32 px | 600 | Judul besar |
| `headline-md` | 20 px | 28 px | 600 | Judul bagian utama |
| `headline-sm` | 16 px | 24 px | 600 | Judul kartu dan panel |
| `title-md` | 14 px | 20 px | 600 | Label kuat, nama objek, judul baris |
| `body-lg` | 16 px | 24 px | 400 | Teks isi yang perlu lebih menonjol |
| `body-md` | 14 px | 20 px | 400 | Teks isi standar |
| `body-sm` | 13 px | 18 px | 400 | Deskripsi, tabel, bantuan |
| `label-md` | 12 px | 16 px | 500 | Label kontrol dan metadata |
| `label-sm` | 11 px | 14 px | 600 | Label kecil, badge, kategori |
| `data-tabular` | 14 px | 20 px | 500 | Angka, ID, nilai statistik |

Aturan:
- Gunakan ukuran besar hanya untuk angka KPI dan judul penting.
- Gunakan label kecil untuk metadata, bukan paragraf penjelasan utama.
- Terapkan angka tabular secara konsisten pada metrik, ID, persentase, dan nilai kuantitatif.
- Hindari teks abu-abu berkontras rendah untuk informasi penting.
- Jangan membuat tabel padat menjadi terlalu kecil hingga sulit dibaca.

### 3.2 Palet Warna

Palet berikut diambil dari konfigurasi Tailwind pada kode.

| Token | Hex | Penggunaan |
|---|---|---|
| `primary` | `#002043` | Aksi utama, judul utama, penekanan data |
| `primary-container` | `#17365D` | Latar item navigasi aktif dan elemen primer |
| `on-primary` | `#FFFFFF` | Teks/ikon di atas warna primer |
| `secondary` | `#2C6195` | Aksen analitis, tautan, grafik sekunder |
| `secondary-container` | `#94C5FF` | Aksen sekunder yang lebih terang |
| `tertiary` | `#00213C` | Warna pendukung gelap |
| `tertiary-container` | `#00375F` | Variasi visual untuk kategori grafik |
| `background` / `surface` | `#F8F9FF` | Latar halaman |
| `surface-container-lowest` | `#FFFFFF` | Kartu utama dan area konten |
| `surface-container-low` | `#EFF4FF` | Latar lembut, baris informasi |
| `surface-container` | `#E5EEFF` | Panel sekunder, badge netral |
| `surface-container-high` | `#DCE9FF` | Hover, track, atau permukaan lebih kuat |
| `surface-container-highest` | `#D3E4FE` | Permukaan dengan penekanan tambahan |
| `on-surface` | `#0B1C30` | Teks utama |
| `on-surface-variant` | `#43474E` | Teks sekunder |
| `outline` | `#74777F` | Metadata dan garis batas sekunder |
| `outline-variant` | `#C4C6CF` | Border halus |
| `error` | `#BA1A1A` | Temuan bermasalah dan kondisi error |
| `error-container` | `#FFDAD6` | Latar status error |

Warna status tambahan yang digunakan di kode:
- **Peringatan / perlu ditinjau:** amber, misalnya `amber-50`, `amber-100`, `amber-200`, `amber-800`, `amber-900`.
- **Berhasil / terverifikasi:** emerald, misalnya `emerald-50`, `emerald-100`, `emerald-700`, `emerald-800`.
- **Sedang diproses:** biru muda/biru, misalnya `blue-100` dan `blue-900`.

Aturan penggunaan warna:
- Primer gelap menjadi jangkar visual aplikasi.
- Latar halaman tetap terang dan tenang; kartu putih memisahkan kelompok informasi.
- Merah hanya untuk kondisi yang membutuhkan perhatian atau kesalahan.
- Amber digunakan untuk peringatan atau item yang perlu ditinjau, bukan otomatis berarti pelanggaran.
- Hijau menandai kondisi berhasil/terverifikasi, bukan sekadar elemen dekoratif.
- Jangan mengandalkan warna saja untuk menyampaikan status; selalu sertakan label.
- Jangan mengganti palet dengan warna acak per halaman.

### 3.3 Spacing, Border, dan Elevation

Konfigurasi spacing yang tampak pada kode:

| Token | Nilai |
|---|---:|
| `space-xs` | 4 px |
| `space-sm` | 8 px |
| `space-md` | 12 px |
| `space-lg` | 16 px |
| `space-xl` | 24 px |
| `space-2xl` | 32 px |
| `gutter` | 16 px |
| `gutter-desktop` | 24 px |
| `margin-tablet` | 24 px |
| `margin-desktop` | 32 px |

Gunakan ritme spacing yang konsisten. Kelompokkan informasi terkait dengan jarak kecil; pisahkan bagian utama dengan jarak yang lebih besar.

Radius Tailwind yang didefinisikan pada kode:
- `DEFAULT`: 2 px
- `lg`: 4 px
- `xl`: 8 px
- `full`: 12 px

Karena kode banyak menggunakan `rounded-xl`, kartu utama umumnya memakai sudut sekitar 8 px. Gunakan bayangan tipis untuk mengangkat kartu dari latar, bukan bayangan berat. Border dan bayangan harus mendukung struktur, bukan menjadi fokus visual.

## 4. Layout dan Navigasi

### 4.1 Shell Dashboard

Shell desktop yang terlihat di kode memiliki:
- Sidebar tetap di sisi kiri dengan lebar sekitar 256 px (`w-64`).
- Header tetap di bagian atas dengan tinggi sekitar 64 px (`h-16`).
- Area konten utama dimulai setelah sidebar dan header.
- Latar halaman terang dengan konten dikelompokkan ke dalam kartu.
- Sidebar putih dengan bayangan ringan; header putih semi-transparan dengan efek blur.

Pertahankan pola shell ini pada halaman-halaman yang memakai dashboard. Untuk layar sempit, buat adaptasi responsif agar konten tidak terpotong; pola drawer/menu mobile tidak ditentukan secara eksplisit dalam kode, jadi pilih implementasi yang konsisten dan dapat digunakan.

### 4.2 Navigasi yang Ditampilkan

Menu utama di sidebar:
1. Dashboard
2. Impor Data
3. Inventaris Reklame
4. Peta Reklame
5. Temuan Anomali
6. Prioritas Pemeriksaan
7. Verifikasi
8. Laporan

Area bagian bawah:
- Tentang Prototipe
- Versi sistem, ditampilkan sebagai `v0.9.4-lite (Akademik MVP)` pada contoh dashboard.

Aturan navigasi:
- Ikon Material Symbols berada sebelum label.
- Menu aktif menggunakan latar primer dan teks putih.
- Menu nonaktif memakai teks sekunder dan perubahan latar saat hover.
- Gunakan label Bahasa Indonesia yang konsisten.
- Header dapat menampilkan identitas aplikasi, organisasi, status data simulasi, dataset aktif, tombol Panduan, notifikasi, dan profil pengguna sebagaimana pada contoh.
- Jangan menampilkan nama atau identitas pengguna demo sebagai data pengguna sungguhan.

### 4.3 Ikon

Kode menggunakan **Material Symbols Outlined**. Gunakan gaya ikon ini secara konsisten, dengan ukuran yang mengikuti konteks:
- Ikon navigasi: sekitar 18 px.
- Ikon aksi kecil: sekitar 14–18 px.
- Ikon header atau ilustrasi status: sekitar 20–22 px.

Pilih ikon berdasarkan makna tindakan atau data; hindari mencampur gaya ikon berbeda tanpa alasan.

## 5. Pola Komponen

### 5.1 Kartu

Kartu standar:
- Latar putih (`surface-container-lowest`).
- Padding umumnya 16 px, dengan bagian analisis dapat memakai padding yang sama atau lebih besar sesuai kepadatan.
- Radius sekitar 8 px.
- Bayangan tipis.
- Judul di atas, konten utama di tengah, metadata atau aksi di bawah bila diperlukan.

Gunakan kartu untuk KPI, grafik, ringkasan status, dataset, petunjuk, dan panel detail. Jangan membuat setiap baris tabel menjadi kartu terpisah.

### 5.2 KPI / Metric Cards

Dashboard menampilkan enam KPI:
- Total Objek
- Kelengkapan
- Total Temuan
- Perlu Ditinjau
- Progres Verifikasi
- Koordinat Valid

Pola kartu:
1. Label kategori kecil.
2. Ikon dalam wadah kecil di sudut.
3. Angka utama yang besar.
4. Keterangan pendukung atau pembanding.
5. Progress bar atau strip ringkasan bila relevan.

Desktop menggunakan grid responsif yang berkembang dari satu kolom menjadi beberapa kolom hingga enam kolom pada layar lebar. Jangan memaksakan enam kolom pada viewport sempit.

Angka, persentase, jumlah total, dan keterangan harus berasal dari sumber data yang sama. Jangan menampilkan nilai visual yang saling bertentangan.

### 5.3 Banner Data Simulasi dan Disclaimer

Kode menampilkan penanda `DATA SIMULASI`, mode akademik, serta catatan bahwa temuan otomatis adalah indikator untuk ditinjau dan bukan bukti pelanggaran pajak.

Aturan:
- Tampilkan pemberitahuan simulasi dengan jelas dan dekat konteks data.
- Gunakan latar amber lembut, ikon peringatan/verifikasi, dan teks yang mudah dibaca.
- Jangan menyembunyikan disclaimer di footer saja.
- Jangan menyebut dataset sebagai data resmi jika sumbernya simulasi.
- Jika aplikasi dipakai di luar konteks akademik, status data dan disclaimer harus disesuaikan berdasarkan keputusan pemilik produk.

### 5.4 Badge Status

Gunakan badge dengan teks dan warna yang konsisten:
- Prioritas tinggi: merah.
- Prioritas sedang: amber.
- Belum diperiksa: netral.
- Sedang diperiksa: biru.
- Terverifikasi/berhasil: hijau.
- Data simulasi: amber dengan penekanan kuat.

Status yang ditampilkan pada tabel dan ringkasan harus menggunakan label yang sama. Jangan mengandalkan warna saja untuk membedakan status.

### 5.5 Tombol dan Tautan Aksi

- **Aksi utama:** latar `primary`, teks putih.
- **Aksi sekunder:** latar `surface-container`, teks primer.
- **Tautan:** warna sekunder/primer dengan penekanan hover.
- Gunakan label tindakan yang spesifik, misalnya “Impor Dataset Baru”, “Periksa”, “Lihat Semua Prioritas”, atau “Ekspor Ringkasan Analisis (CSV)”.
- Tombol harus menunjukkan hasil yang diharapkan; hindari label generik seperti “Klik di sini”.
- Sediakan keadaan hover/focus/disabled bila implementasi mendukungnya.
- Jangan membuat tombol yang tampak aktif tetapi tidak memiliki perilaku.

### 5.6 Tabel Data

Tabel dipakai untuk informasi operasional padat. Pola yang tampak:
- Header tabel dengan latar lembut, label kecil, dan huruf kapital.
- Baris dipisahkan dengan garis halus.
- Hover baris menggunakan latar lembut.
- ID objek dan nilai numerik memakai gaya data tabular.
- Status menggunakan badge.
- Aksi cepat ditempatkan pada kolom terpisah.
- Area tabel dapat digulir horizontal ketika viewport tidak cukup lebar.

Contoh kolom tabel prioritas:
- ID & Objek Reklame
- Area / Lokasi
- Prioritas
- Deskripsi Anomali
- Aturan
- Status Verifikasi
- Aksi Cepat

Aturan:
- Pertahankan alignment kolom: teks rata kiri, angka/persentase konsisten, aksi rata kanan bila sesuai.
- Potong teks panjang secara terkendali dan sediakan cara untuk melihat rincian penuh.
- Jangan menghapus informasi penting hanya untuk menghemat ruang.
- Sertakan pagination, jumlah item, atau keadaan kosong bila diperlukan oleh data.
- Pastikan tabel tetap dapat dipahami ketika digulir pada layar kecil.

### 5.7 Grafik dan Visualisasi

Pola yang terlihat:
- Bar horizontal untuk distribusi temuan menurut aturan.
- Donut chart untuk status verifikasi.
- Progress bar untuk kelengkapan dan progres.
- Keterangan legenda dengan label, jumlah, dan persentase.

Aturan:
- Selalu tampilkan judul grafik dan konteks metrik.
- Sertakan angka atau persentase sebagai teks, jangan hanya grafik.
- Gunakan warna yang konsisten dengan kategori status.
- Pastikan total, persentase, dan panjang bar berasal dari nilai yang sama.
- Hindari 3D, ornamen berlebihan, dan animasi yang mengganggu pembacaan.
- Sediakan label/legenda agar makna grafik tidak hanya bergantung pada warna.

### 5.8 Drawer, Dialog, Toast

Kode menunjukkan panel detail bergaya slide-over/drawer pada inventaris, serta drawer/modal detail pada temuan anomali dan dialog konfirmasi aktivasi dataset.

Gunakan pola ini untuk:
- Melihat detail tanpa kehilangan konteks halaman.
- Menampilkan identitas objek, data sumber, anomali, riwayat, dan aksi verifikasi.
- Meminta konfirmasi sebelum mengaktifkan dataset.
- Menampilkan umpan balik singkat melalui toast.

Aturan:
- Judul drawer/dialog harus menjelaskan objek atau tindakan yang sedang dibuka.
- Kelompokkan detail dalam bagian atau tab yang jelas.
- Tombol utama dan batal harus mudah dibedakan.
- Jangan menutup panel secara otomatis sebelum pengguna memahami hasil tindakan.
- Toast harus menyampaikan keberhasilan atau kegagalan secara spesifik.
- Perilaku keyboard, fokus, dan penguncian scroll perlu ditentukan pada implementasi; jangan menganggapnya telah tersedia hanya karena visual mockup ada.

## 6. Panduan per Halaman

File kode yang diberikan secara eksplisit memuat lima halaman utama berikut.

### 6.1 Dashboard

Tujuan: memberi ringkasan cepat tentang inventaris reklame, kualitas data, temuan, prioritas, progres verifikasi, dan status dataset.

Struktur:
1. Shell navigasi dan header.
2. Banner pemberitahuan data simulasi/kepatuhan.
3. Header halaman “Dashboard Pengawasan Reklame” dengan konteks wilayah, dataset aktif, dan waktu analisis.
4. Aksi utama: lihat laporan komprehensif dan impor dataset.
5. Grid enam KPI.
6. Area analisis dua kolom: distribusi aturan dan tabel prioritas di kolom utama; status verifikasi, status dataset/audit, dan petunjuk langkah selanjutnya di kolom samping.
7. Tautan menuju daftar lengkap temuan, prioritas, inventaris, dan antrean verifikasi.

Aturan:
- Susun konten berdasarkan urutan keputusan: ringkasan → pola temuan → objek prioritas → status verifikasi/dataset → tindakan lanjutan.
- Jangan membuat grafik lebih dominan daripada data yang perlu ditindaklanjuti.
- Gunakan tanggal/waktu dan identitas dataset secara konsisten.

### 6.2 Inventaris Reklame

Tujuan: menelusuri dan memeriksa daftar objek reklame.

Struktur yang terlihat:
- Header halaman dan tombol tindakan.
- Strip metrik ringkas.
- Toolbar pencarian dan reset.
- Filter area, jenis, kelengkapan, temuan, prioritas, dan status verifikasi.
- Tabel objek reklame.
- Panel detail slide-over di sisi kanan untuk objek terpilih, berisi identitas/data sumber, kartu lokasi/peta, temuan anomali, dan riwayat verifikasi/analisis.
- Footer tabel dengan pagination.

Aturan:
- Pertahankan hubungan visual antara baris yang dipilih dan panel detailnya.
- Filter aktif harus terlihat dan mudah dihapus/reset.
- Jangan mengubah data objek hanya dengan membuka detail.
- Pisahkan data sumber, hasil aturan, dan riwayat verifikasi.
- Jika koordinat tidak valid/kosong, tampilkan statusnya dengan jelas; jangan menampilkan lokasi seolah-olah akurat.

### 6.3 Impor Data

Tujuan: memilih atau meninjau dataset, memvalidasi struktur, melihat kualitas data, dan memahami konsekuensi sebelum aktivasi.

Struktur yang terlihat:
- Banner simulasi akademik.
- Header dan chip status dataset aktif.
- Area upload di sisi kiri dan preset simulasi di sisi kanan.
- Zona drag-and-drop.
- Informasi skema/kolom yang diharapkan.
- Preset dataset demo: contoh aktif, bersih, dan stress test.
- Ringkasan validasi: total baris, valid, ditinjau, dan ditolak.
- Rincian anomali struktural.
- Preview beberapa baris data.
- Bar aksi/keputusan akhir.
- Riwayat impor.
- Modal konfirmasi aktivasi dataset.

Aturan:
- Bedakan tahap memilih file, memvalidasi, meninjau hasil, dan mengaktifkan dataset.
- Tampilkan format atau skema yang diharapkan sebelum pengguna mengimpor.
- Jelaskan baris valid, perlu ditinjau, dan ditolak secara terpisah.
- Beri peringatan untuk duplikat, kolom wajib kosong, ukuran tidak valid, ID kosong, dan koordinat salah bila hasil validasi memang mendeteksinya.
- Jangan mengaktifkan dataset tanpa konfirmasi yang jelas.
- Kode memperlihatkan preset simulasi; jangan menyiratkan bahwa preset tersebut adalah data produksi.
- Perilaku backend, batas ukuran file, dan format file final harus dikonfirmasi jika belum ditentukan.

### 6.4 Temuan Anomali

Tujuan: memberi daftar temuan yang dapat ditelusuri, dijelaskan, dan diverifikasi oleh manusia.

Struktur yang terlihat:
- Header bergaya audit/governance.
- Tombol aksi.
- Disclaimer bahwa temuan adalah indikator untuk ditinjau.
- Empat kartu metrik ringkas.
- Toolbar filter: kode aturan, prioritas, status peninjauan, dan area kerja.
- Badge filter cepat/reset.
- Tabel temuan dengan pagination.
- Drawer/modal detail untuk temuan terpilih.
- Penjelasan aturan, atribut pemicu teknis, objek sumber terkait, dan aksi verifikasi.
- Toast notifikasi simulasi.

Aturan:
- Setiap temuan harus dapat ditelusuri ke objek sumber dan aturan pemicunya.
- Jelaskan mengapa aturan aktif, bukan hanya memberi label “anomali”.
- Pisahkan status hasil deteksi dari status hasil verifikasi manusia.
- Hindari bahasa yang menyimpulkan kesalahan atau pelanggaran sebelum diverifikasi.
- Sediakan filter dan reset yang jelas.
- Status, jumlah, dan isi detail harus konsisten.

### 6.5 Prioritas Pemeriksaan

Tujuan: membantu petugas menentukan objek mana yang perlu diperiksa lebih dahulu.

Struktur yang terlihat:
- Breadcrumb dan judul halaman.
- Tombol aksi.
- Empat kartu metrik: total, prioritas tinggi, prioritas sedang, dan perlu ditinjau.
- Panel penjelasan logika deterministik.
- Pencarian dan filter kategori prioritas, status verifikasi, serta area/kecamatan.
- Kontrol tambahan.
- Tabel prioritas, footer metadata, empty state, dialog detail, toast, dan catatan legalitas.

Aturan:
- Jelaskan bahwa prioritas berasal dari logika/rule yang deterministik.
- Kode dashboard menunjukkan bobot contoh: Kritis = 3.0, Tinggi = 2.0, Sedang = 1.0. Jangan mengubah bobot tanpa keputusan produk.
- Prioritas membantu mengurutkan pemeriksaan, bukan menggantikan keputusan petugas.
- Sediakan empty state yang memberi tahu bahwa tidak ada hasil yang cocok dan bagaimana menghapus filter.
- Jaga konsistensi peringkat dengan data temuan dan status verifikasi.

### 6.6 Menu yang Ada di Navigasi tetapi Tidak Terlihat sebagai Halaman Lengkap dalam Potongan Kode

Navigasi juga mencantumkan **Peta Reklame**, **Verifikasi**, **Laporan**, dan **Tentang Prototipe**. Kode yang diberikan pada potongan ini tidak menunjukkan implementasi halaman lengkapnya. Karena itu:
- Jangan mengarang susunan detail halaman atau aturan bisnisnya.
- Jika diminta merancang halaman tersebut, gunakan token, shell, dan komponen pada skill ini.
- Tandai konten, kolom, filter, alur, dan aksi yang belum didefinisikan sebagai pertanyaan terbuka.

## 7. Aturan Data dan Bahasa Antarmuka

- Gunakan istilah Bahasa Indonesia yang sudah muncul dalam kode: **Objek**, **Inventaris Reklame**, **Temuan Anomali**, **Prioritas Pemeriksaan**, **Verifikasi**, **Dataset**, **Perlu Ditinjau**, dan **Data Simulasi**.
- Pertahankan ID yang terlihat seperti `RKL-003`, `ANM-001`, `DS-BDL-2026-V1`, dan kode aturan seperti `RULE-01` bila dipakai sebagai data contoh.
- Format tanggal/waktu secara konsisten dan sertakan WIB ketika konteks mengharuskannya.
- Jangan mengubah istilah “indikator untuk ditinjau” menjadi “pelanggaran terbukti”.
- Gunakan teks yang spesifik untuk error, warning, keberhasilan, dan konfirmasi.
- Jika data adalah sintetis, labeli sebagai simulasi di tempat yang relevan.
- Hindari angka placeholder yang tidak konsisten antara KPI, grafik, tabel, dan ringkasan.
- Jangan menampilkan nama pribadi pada profil demo seolah-olah identitas nyata.

## 8. Responsivitas dan Aksesibilitas

Kode menggunakan breakpoint Tailwind seperti `sm`, `lg`, dan `xl`, grid responsif, serta area tabel yang dapat digulir horizontal. Pertahankan prinsip berikut:
- Desktop: gunakan sidebar, header, grid KPI, dan layout analisis multi-kolom.
- Tablet: kurangi jumlah kolom dan beri ruang untuk filter.
- Mobile: susun kartu secara vertikal, hindari konten yang melampaui lebar layar, dan pastikan aksi utama tetap terjangkau.
- Tabel lebar dapat digulir horizontal, tetapi berikan petunjuk visual bahwa area bisa digulir jika diperlukan.
- Semua tombol dan kontrol harus memiliki label yang jelas.
- Jaga kontras teks, terutama pada badge dan metadata.
- Jangan menggunakan warna sebagai satu-satunya penanda status.
- Pastikan fokus keyboard terlihat, urutan tab logis, dialog dapat ditutup dengan cara yang wajar, dan label kontrol dapat dibaca teknologi bantu.
- Pertimbangkan `prefers-reduced-motion` untuk transisi jika animasi digunakan.

## 9. Interaksi dan Keadaan UI yang Perlu Dipikirkan

Untuk setiap halaman, desain keadaan berikut bila relevan:
- Default/normal.
- Hover dan focus.
- Loading/proses.
- Berhasil.
- Gagal/error.
- Kosong/tidak ada hasil.
- Filter aktif.
- Data tidak lengkap atau tidak valid.
- Konfirmasi tindakan yang berisiko.
- Panel detail terbuka dan tertutup.

Contoh perilaku yang sesuai dengan pola kode:
- Pencarian dan filter memperbarui daftar.
- Tombol reset membersihkan filter yang aktif.
- Memilih baris menampilkan detail objek yang sesuai.
- Aktivasi dataset meminta konfirmasi.
- Aksi verifikasi memberikan umpan balik status.
- Ekspor memberikan umpan balik keberhasilan/kegagalan.
- Toast memberi informasi hasil tindakan.

Catatan: kode berisi sejumlah elemen visual dan mockup interaksi. Jangan menganggap setiap tombol, filter, toast, drawer, atau modal telah terhubung ke logika aplikasi hanya karena sudah dirender.

## 10. Panduan Implementasi Tailwind

Kode menggunakan Tailwind CSS melalui CDN dan konfigurasi tema khusus. Untuk prototipe yang mengikuti kode:
- Gunakan token warna yang sudah didefinisikan, bukan nilai hex acak.
- Gunakan kelas spacing yang konsisten (`space-sm`, `space-md`, `space-lg`, `space-xl`) sesuai konfigurasi.
- Gunakan grid responsif untuk KPI dan layout analisis.
- Gunakan `overflow-x-auto` untuk tabel lebar.
- Gunakan transisi singkat untuk hover/focus dan perubahan visual sederhana.
- Gunakan Material Symbols Outlined untuk ikon.
- Hindari menyembunyikan scrollbar global jika hal itu membuat pengguna tidak menyadari area yang dapat digulir; evaluasi kembali aturan `::-webkit-scrollbar` dari kode ketika implementasi diperbaiki.
- Untuk produksi, pertimbangkan pengelolaan dependensi dan build Tailwind yang lebih terkontrol daripada CDN; ini merupakan rekomendasi implementasi, bukan karakteristik yang sudah dibuktikan oleh kode.

## 11. Hal yang Tidak Boleh Dilakukan

Jangan:
- Mengganti warna navy/biru dan permukaan terang dengan tema yang tidak berkaitan.
- Menambahkan gradien, efek kaca, ilustrasi dekoratif, atau animasi mencolok yang tidak mendukung tugas analitis.
- Membuat dashboard terlihat seperti aplikasi konsumen atau landing page pemasaran.
- Mengubah istilah dan status antarhalaman tanpa alasan.
- Menampilkan temuan otomatis sebagai bukti final pelanggaran.
- Menyembunyikan label data simulasi.
- Membuat nilai KPI, grafik, tabel, dan status saling bertentangan.
- Menambah aturan pajak, bobot prioritas, kolom data, atau integrasi eksternal tanpa sumber atau persetujuan.
- Menganggap menu navigasi berarti halaman sudah diimplementasikan.
- Membuat kontrol visual yang tidak memiliki perilaku, tanpa menandainya sebagai mockup.

## 12. Checklist Review Desain

Sebelum menyatakan desain selesai, pastikan:

- [ ] Inter memakai tipografi dan skala yang konsisten.
- [ ] Palet navy/biru, permukaan terang, dan warna status konsisten.
- [ ] Sidebar dan header mengikuti shell dashboard pada desktop.
- [ ] Navigasi aktif terlihat jelas.
- [ ] Hierarki halaman dimulai dari konteks, ringkasan, analisis, lalu tindakan.
- [ ] KPI memiliki label, angka, dan konteks yang jelas.
- [ ] Grafik memiliki judul, legenda, dan angka pendukung.
- [ ] Tabel mudah dipindai dan tetap dapat digunakan pada layar sempit.
- [ ] Filter, reset, pagination, drawer, modal, dan toast memiliki perilaku yang jelas.
- [ ] Status selalu ditulis sebagai teks, bukan hanya warna.
- [ ] Label `DATA SIMULASI` dan disclaimer temuan otomatis terlihat.
- [ ] Data pada KPI, grafik, tabel, dan drawer konsisten.
- [ ] Empty state, error state, dan loading state dipertimbangkan.
- [ ] Kontras, keyboard focus, label kontrol, dan responsivitas diperiksa.
- [ ] Tidak ada aturan bisnis atau fitur baru yang diasumsikan tanpa dasar.

## 13. Instruksi Singkat untuk AI Designer

> Rancang dan kembangkan UI PAD Intelligence Lite sebagai dashboard web analitik pemerintahan yang profesional, ringkas, dan berorientasi data. Ikuti token Inter, palet navy/biru dengan permukaan terang, sidebar tetap dan header dashboard, kartu KPI, tabel padat, filter, grafik analitis, badge status, drawer detail, modal konfirmasi, serta pemberitahuan `DATA SIMULASI` yang dijelaskan dalam skill ini. Pertahankan istilah Bahasa Indonesia dan konsistensi status antarlayar. Temuan otomatis harus ditampilkan sebagai indikator untuk ditinjau, bukan bukti pelanggaran. Jangan mengarang data, aturan pajak, perilaku backend, atau halaman yang belum ditentukan. Pastikan layout responsif, aksesibel, dan semua kontrol yang ditampilkan memiliki perilaku yang jelas atau diberi label sebagai mockup.
