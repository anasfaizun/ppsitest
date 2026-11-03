# PAD Intelligence Lite — Sistem Intelijen Potensi Pendapatan Daerah Kota Bandar Lampung

Aplikasi web prototipe analitis untuk pengawasan inventaris reklame, audit kualitas data, deteksi anomali berbasis aturan transparan, penyusunan prioritas pemeriksaan lapangan, dan pencatatan riwayat verifikasi append-only.

> **Status Prototipe:** Akademik MVP v0.9.4-lite  
> **Label Data:** **DATA SIMULASI** (Bukan data penetapan pajak resmi dan tidak terhubung ke sistem Pemkot)  
> **Target Pengguna:** Analis Data & Petugas Verifikasi BAPENDA Kota Bandar Lampung  

---

## 1. Menjalankan Aplikasi Secara Lokal

Aplikasi menggunakan Node.js native tanpa ketergantungan paket eksternal (`npm install` tidak diperlukan).

```bash
# Menjalankan server lokal
node server.js
```
Akses aplikasi melalui browser:
👉 **[http://localhost:3000](http://localhost:3000)**

---

## 2. Fitur MVP yang Telah Berfungsi Penuh

| No | Modul | Deskripsi Fungsi |
|---|---|---|
| 1 | **Dashboard Pengawasan** | 6 Kartu KPI (Total Objek, Kelengkapan %, Total Temuan, Perlu Ditinjau, Progres Verifikasi %, Koordinat Valid), Grafik Batang SVG Distribusi Aturan, Donut Chart Status Verifikasi, Tabel Prioritas Teratas, dan Konteks Audit Dataset. |
| 2 | **Impor Data & Validasi CSV** | Drag-and-drop CSV, pemilih file lokal, validasi header wajib, pengelompokan baris (Valid, Perlu Ditinjau, Ditolak), pratinjau data, modal konfirmasi aktivasi dataset, dan 3 preset demo terkontrol (Aktif, Bersih, Stress Test). |
| 3 | **Inventaris Reklame** | Pencarian instan (ID, Nama, Area), filter multi-kriteria (Wilayah, Jenis Reklame, Status Verifikasi), tombol reset filter, penanganan status koordinat, dan Slide-over Drawer Detail Objek. |
| 4 | **Peta Reklame (Leaflet)** | Pemetaan koordinat valid di Kota Bandar Lampung, penanda warna prioritas, popup interaktif menuju detail, dan panel khusus **Objek Tanpa Koordinat** (tidak membuat penanda buatan sesuai PRD FR-04). |
| 5 | **Temuan Anomali** | Mesin aturan transparan `RULE-01` s/d `RULE-07`, penelusuran atribut pemicu, alasan teknis, 4 metrik kategori, dan filter aturan/status review. |
| 6 | **Prioritas Pemeriksaan** | Pengurutan deterministik (Tinggi > Sedang > Perlu Ditinjau > Tanpa Masalah, jumlah aturan pemicu, ID alfabetis) berdasarkan PRD Bab 9. |
| 7 | **Verifikasi & Tindak Lanjut** | Formulir verifikasi status (Terkonfirmasi Masalah, Sedang Diperiksa, Tidak Terbukti, Perlu Tindak Lanjut), input catatan lapangan, dan tabel **Audit Log Append-Only** permanen. |
| 8 | **Laporan & Ekspor CSV** | Ekspor Inventaris Reklame (CSV), Ekspor Temuan Anomali (CSV), Ekspor Log Verifikasi (CSV), dan Ringkasan Eksekutif (CSV/Cetak). Semua ekspor menyertakan header **DATA SIMULASI** dan status penerimaan aktual *Tidak tersedia*. |

---

## 3. Kamus Aturan Deteksi Anomali

- **`RULE-01` — ID Objek Kosong** *(Prioritas Tinggi - Kritis Struktur)*: Catatan tidak memiliki ID unik untuk penelusuran.
- **`RULE-02` — ID Objek Duplikat** *(Prioritas Tinggi - Konflik Identitas)*: ID yang sama muncul lebih dari 1 kali dalam dataset.
- **`RULE-03` — Kolom Wajib Kosong** *(Prioritas Sedang - Kualitas Atribut)*: Nama reklame, wilayah, jenis, atau ukuran belum terisi.
- **`RULE-04` — Kandidat Duplikat** *(Prioritas Sedang - Duplikasi Lapangan)*: Kesamaan nama dan area simulasi.
- **`RULE-05` — Koordinat Tidak Valid** *(Prioritas Perlu Ditinjau)*: Koordinat kosong, parsial, atau di luar rentang geografis Kota Bandar Lampung (-5.60 s.d -5.20, 105.10 s.d 105.45).
- **`RULE-06` — Ukuran Tidak Valid** *(Prioritas Sedang)*: Dimensi bernilai negatif, nol, atau non-numerik.
- **`RULE-07` — Status Non-Standar** *(Prioritas Perlu Ditinjau)*: Status administrasi kosong atau di luar kamus data resmi demo.

---

## 4. Pengujian Otomatis

Jalankan test suite otomatis yang mencakup 38 skenario uji kriteria penerimaan PRD:

```bash
node test_suite.js
```

Hasil: **38 LULUS, 0 GAGAL** (100% lolos).
