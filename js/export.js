/**
 * PAD Intelligence Lite — Modul Laporan & Ekspor CSV
 * Sesuai PRD FR-08 dan FR-09:
 * - Menyertakan label DATA SIMULASI di bagian header metadata.
 * - Nilai potensi simulasi dipisahkan dari penerimaan aktual.
 * - Penerimaan aktual yang tidak ada dicantumkan "Tidak tersedia".
 * - File CSV dapat langsung diunduh dan dibuka di Excel/LibreOffice.
 */

const Exporter = {
  /**
   * Mengonversi array of objects menjadi CSV string dengan penanganan kutip dan koma
   */
  formatCSV(rows, headers, headerLabels = null) {
    const labels = headerLabels || headers;
    const lines = [];

    // Header baris kolom
    lines.push(labels.map(l => `"${String(l).replace(/"/g, '""')}"`).join(','));

    // Baris data
    rows.forEach(row => {
      const line = headers.map(h => {
        let val = row[h];
        if (val === undefined || val === null) val = '';
        val = String(val);
        return `"${val.replace(/"/g, '""')}"`;
      });
      lines.push(line.join(','));
    });

    return lines.join('\r\n');
  },

  /**
   * Men-trigger download file CSV di browser
   */
  downloadCSV(filename, content) {
    // Tambahkan UTF-8 BOM agar Excel menampilkan aksen/karakter Indonesia dengan benar
    const bom = '\uFEFF';
    const blob = new Blob([bom + content], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', filename);
    link.style.visibility = 'hidden';
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
    URL.revokeObjectURL(url);
  },

  /**
   * Metadata Header untuk disematkan pada setiap file ekspor
   */
  generateMetaHeader(reportTitle, filterDesc = 'Semua Data') {
    const dateStr = new Date().toLocaleString('id-ID', { timeZoneName: 'short' });
    const dataset = window.padStore.activeDataset;
    return [
      `# ==============================================================================`,
      `# SISTEM INTELIJEN POTENSI PENDAPATAN DAERAH (PAD) — KOTA BANDAR LAMPUNG`,
      `# DOKUMEN: ${reportTitle.toUpperCase()}`,
      `# STATUS DATA: DATA SIMULASI (AKADEMIK MVP - BUKAN BUKTI PELANGGARAN PAJAK)`,
      `# DATASET AKTIF: ${dataset ? `${dataset.label} (${dataset.id})` : 'Tidak ada'}`,
      `# CAKUPAN FILTER: ${filterDesc}`,
      `# TANGGAL EKSPOR: ${dateStr}`,
      `# PENERIMAAN AKTUAL: Tidak tersedia (memerlukan integrasi sistem BAPENDA resmi)`,
      `# ==============================================================================`,
      ``
    ].join('\r\n');
  },

  /**
   * Ekspor Inventaris Reklame
   */
  exportInventory(filteredItems = null, filterDesc = 'Semua Data') {
    const items = filteredItems || (window.padStore.activeDataset ? window.padStore.activeDataset.items : []);
    if (!items || items.length === 0) {
      alert('Tidak ada data inventaris untuk diekspor.');
      return;
    }

    const headers = [
      'object_id',
      'object_name',
      'area',
      'reklame_type',
      'size',
      'size_unit',
      'administrative_status',
      'verification_status',
      'latitude',
      'longitude',
      'recorded_at'
    ];

    const labels = [
      'ID Objek',
      'Nama Reklame',
      'Wilayah / Kecamatan',
      'Jenis Reklame',
      'Ukuran',
      'Satuan',
      'Status Administrasi',
      'Status Verifikasi',
      'Latitude',
      'Longitude',
      'Tanggal Pencatatan'
    ];

    const meta = this.generateMetaHeader('Laporan Inventaris Reklame Kota Bandar Lampung', filterDesc);
    const body = this.formatCSV(items, headers, labels);
    const filename = `Inventaris_Reklame_BDL_${Date.now()}.csv`;
    this.downloadCSV(filename, meta + body);
  },

  /**
   * Ekspor Daftar Temuan Anomali
   */
  exportFindings(filteredFindings = null, filterDesc = 'Semua Temuan') {
    const findings = filteredFindings || (window.padStore.analysisResult ? window.padStore.analysisResult.findings : []);
    if (!findings || findings.length === 0) {
      alert('Tidak ada temuan anomali untuk diekspor.');
      return;
    }

    const headers = [
      'id',
      'dataset_import_id',
      'object_id',
      'rule_code',
      'rule_name',
      'category',
      'reason',
      'triggered_fields',
      'review_status',
      'detected_at'
    ];

    const labels = [
      'ID Temuan',
      'ID Dataset Sumber',
      'ID Objek Terkait',
      'Kode Aturan',
      'Nama Aturan',
      'Kategori Prioritas',
      'Alasan Temuan Teknis',
      'Atribut Pemicu',
      'Status Peninjauan',
      'Waktu Deteksi'
    ];

    const formattedRows = findings.map(f => ({
      ...f,
      triggered_fields: Array.isArray(f.triggered_fields) ? f.triggered_fields.join('; ') : f.triggered_fields
    }));

    const meta = this.generateMetaHeader('Laporan Temuan Anomali & Kualitas Data Reklame', filterDesc);
    const body = this.formatCSV(formattedRows, headers, labels);
    const filename = `Temuan_Anomali_Reklame_BDL_${Date.now()}.csv`;
    this.downloadCSV(filename, meta + body);
  },

  /**
   * Ekspor Riwayat Verifikasi
   */
  exportVerificationLog() {
    const logs = window.padStore.verificationLog || [];
    if (logs.length === 0) {
      alert('Belum ada riwayat verifikasi yang tercatat.');
      return;
    }

    const headers = [
      'id',
      'dataset_id',
      'object_id',
      'status_before',
      'status_after',
      'notes',
      'verified_at',
      'verified_by'
    ];

    const labels = [
      'ID Log Verifikasi',
      'ID Dataset',
      'ID Objek Reklame',
      'Status Sebelumnya',
      'Status Hasil Verifikasi',
      'Catatan Petugas Lapangan',
      'Waktu Verifikasi (UTC)',
      'Nama / Identitas Petugas'
    ];

    const meta = this.generateMetaHeader('Log Riwayat Verifikasi Lapangan Reklame', 'Seluruh Riwayat');
    const body = this.formatCSV(logs, headers, labels);
    const filename = `Riwayat_Verifikasi_Reklame_BDL_${Date.now()}.csv`;
    this.downloadCSV(filename, meta + body);
  },

  /**
   * Ekspor Ringkasan Eksekutif
   */
  exportExecutiveSummary() {
    const store = window.padStore;
    const dataset = store.activeDataset;
    const analysis = store.analysisResult;
    const coordStats = store.getCoordinateStats();
    const verifProgress = store.getVerificationProgress();
    const completeness = store.calculateCompleteness();

    const summaryRows = [
      { Metrik: 'Nama Sistem', Nilai: 'PAD Intelligence Lite (BAPENDA Bandar Lampung)' },
      { Metrik: 'Dataset Aktif', Nilai: dataset ? `${dataset.label} [${dataset.id}]` : 'Tidak ada' },
      { Metrik: 'Total Objek Reklame', Nilai: dataset ? dataset.totalRows : 0 },
      { Metrik: 'Kelengkapan Atribut Wajib', Nilai: `${completeness}%` },
      { Metrik: 'Total Indikator Temuan', Nilai: analysis ? analysis.stats.totalFindings : 0 },
      { Metrik: 'Prioritas Tinggi (Kritis Struktur)', Nilai: analysis ? analysis.stats.highPriorityCount : 0 },
      { Metrik: 'Prioritas Sedang (Kualitas Atribut)', Nilai: analysis ? analysis.stats.mediumPriorityCount : 0 },
      { Metrik: 'Perlu Ditinjau (Koordinat / Status)', Nilai: analysis ? analysis.stats.reviewPriorityCount : 0 },
      { Metrik: 'Progres Verifikasi Objek', Nilai: `${verifProgress.percentage}% (${verifProgress.verifiedCount} dari ${verifProgress.total})` },
      { Metrik: 'Koordinat Valid Terpetakan', Nilai: `${coordStats.valid} dari ${coordStats.total} objek (${coordStats.validPercentage}%)` },
      { Metrik: 'Penerimaan Pajak Aktual', Nilai: 'Tidak tersedia (memerlukan integrasi BAPENDA)' },
      { Metrik: 'Status Integritas Data', Nilai: 'DATA SIMULASI — Indikator awal untuk tinjauan lapangan' }
    ];

    const meta = this.generateMetaHeader('Ringkasan Eksekutif Kualitas Data Reklame BDL', 'Dataset Aktif');
    const body = this.formatCSV(summaryRows, ['Metrik', 'Nilai'], ['Indikator Metrik', 'Nilai / Keterangan']);
    const filename = `Ringkasan_Eksekutif_Reklame_BDL_${Date.now()}.csv`;
    this.downloadCSV(filename, meta + body);
  }
};

window.Exporter = Exporter;
