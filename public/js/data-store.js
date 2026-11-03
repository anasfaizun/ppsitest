/**
 * PAD Intelligence Lite — Data Store & State Management
 * Menangani parsing CSV, validasi struktur, penyimpanan lokal (localStorage),
 * riwayat verifikasi append-only, dan sinkronisasi dataset aktif.
 */

const STORAGE_KEYS = {
  ACTIVE_DATASET: 'pad_intel_active_dataset_v2',
  SAVED_DATASETS: 'pad_intel_saved_datasets_v2',
  VERIFICATION_LOG: 'pad_intel_verification_log_v2',
  ANALYSIS_RUNS: 'pad_intel_analysis_runs_v2'
};

const REQUIRED_HEADERS = [
  'object_id',
  'object_name',
  'area',
  'reklame_type',
  'size',
  'size_unit',
  'recorded_at',
  'administrative_status',
  'verification_status',
  'latitude',
  'longitude'
];

class DataStore {
  constructor() {
    this.listeners = [];
    this.init();
  }

  init() {
    // Muat dari localStorage atau setel data awal
    try {
      const savedActive = localStorage.getItem(STORAGE_KEYS.ACTIVE_DATASET);
      if (savedActive) {
        this.activeDataset = JSON.parse(savedActive);
      } else {
        this.activeDataset = null;
      }

      const savedDatasets = localStorage.getItem(STORAGE_KEYS.SAVED_DATASETS);
      this.savedDatasets = savedDatasets ? JSON.parse(savedDatasets) : [];

      const savedVerif = localStorage.getItem(STORAGE_KEYS.VERIFICATION_LOG);
      this.verificationLog = savedVerif ? JSON.parse(savedVerif) : [];

      const savedRuns = localStorage.getItem(STORAGE_KEYS.ANALYSIS_RUNS);
      this.analysisRuns = savedRuns ? JSON.parse(savedRuns) : [];
    } catch (e) {
      console.warn('Gagal membaca localStorage, menggunakan memori:', e);
      this.activeDataset = null;
      this.savedDatasets = [];
      this.verificationLog = [];
      this.analysisRuns = [];
    }

    // Jika belum ada dataset aktif sama sekali, inisialisasi dengan Preset Demo Aktif
    if (!this.activeDataset) {
      this.loadDefaultPreset();
    } else {
      this.runAnalysisOnActive();
    }
  }

  subscribe(listener) {
    this.listeners.push(listener);
    return () => {
      this.listeners = this.listeners.filter(l => l !== listener);
    };
  }

  notify() {
    this.listeners.forEach(fn => {
      try { fn(this); } catch (e) { console.error('Listener error:', e); }
    });
  }

  save() {
    try {
      localStorage.setItem(STORAGE_KEYS.ACTIVE_DATASET, JSON.stringify(this.activeDataset));
      localStorage.setItem(STORAGE_KEYS.SAVED_DATASETS, JSON.stringify(this.savedDatasets));
      localStorage.setItem(STORAGE_KEYS.VERIFICATION_LOG, JSON.stringify(this.verificationLog));
      localStorage.setItem(STORAGE_KEYS.ANALYSIS_RUNS, JSON.stringify(this.analysisRuns));
    } catch (e) {
      console.warn('Gagal menyimpan ke localStorage:', e);
    }
    this.notify();
  }

  /**
   * Parser CSV murni dengan penanganan tanda kutip, spasi, dan newline
   */
  parseCSV(csvText) {
    if (!csvText || typeof csvText !== 'string') {
      return { success: false, error: 'Konten CSV kosong atau tidak valid.' };
    }

    const lines = [];
    let currentLine = [];
    let currentField = '';
    let inQuotes = false;

    // Normalisasi baris
    const cleanText = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    for (let i = 0; i < cleanText.length; i++) {
      const char = cleanText[i];
      const nextChar = cleanText[i + 1];

      if (char === '"') {
        if (inQuotes && nextChar === '"') {
          currentField += '"';
          i++; // Lewati kutip kedua
        } else {
          inQuotes = !inQuotes;
        }
      } else if (char === ',' && !inQuotes) {
        currentLine.push(currentField.trim());
        currentField = '';
      } else if (char === '\n' && !inQuotes) {
        currentLine.push(currentField.trim());
        if (currentLine.some(f => f.length > 0)) {
          lines.push(currentLine);
        }
        currentLine = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }

    // Tangani baris terakhir jika ada
    if (currentField.length > 0 || currentLine.length > 0) {
      currentLine.push(currentField.trim());
      if (currentLine.some(f => f.length > 0)) {
        lines.push(currentLine);
      }
    }

    if (lines.length === 0) {
      return { success: false, error: 'File CSV tidak memiliki baris data.' };
    }

    const headers = lines[0].map(h => h.trim().toLowerCase());
    const rows = lines.slice(1).map((rowArr, idx) => {
      const obj = { _rawRowNumber: idx + 2 };
      headers.forEach((h, hIdx) => {
        obj[h] = rowArr[hIdx] !== undefined ? rowArr[hIdx] : '';
      });
      return obj;
    });

    return { success: true, headers, rows };
  }

  /**
   * Validasi CSV menyeluruh sesuai FR-01
   */
  validateCSV(parsedResult) {
    if (!parsedResult.success) {
      return {
        isValid: false,
        criticalError: parsedResult.error,
        missingHeaders: [],
        acceptedRows: [],
        reviewRows: [],
        rejectedRows: [],
        totalRows: 0
      };
    }

    const { headers, rows } = parsedResult;

    // Periksa kelengkapan header wajib
    const missingHeaders = REQUIRED_HEADERS.filter(h => !headers.includes(h));
    if (missingHeaders.length > 0) {
      return {
        isValid: false,
        criticalError: `Header CSV wajib tidak lengkap. Kolom hilang: ${missingHeaders.join(', ')}.`,
        missingHeaders,
        acceptedRows: [],
        reviewRows: [],
        rejectedRows: [],
        totalRows: rows.length
      };
    }

    const acceptedRows = [];
    const reviewRows = [];
    const rejectedRows = [];

    // Deteksi duplikasi ID pada level impor
    const idCountMap = {};
    rows.forEach(r => {
      const id = r.object_id ? String(r.object_id).trim() : null;
      if (id) {
        idCountMap[id] = (idCountMap[id] || 0) + 1;
      }
    });

    rows.forEach(row => {
      const reasons = [];
      let isRejected = false;
      let needsReview = false;

      // Kriteria penolakan baris (Rejected):
      // Jika semua kolom esensial kosong atau baris korup
      if (!row.object_id && !row.object_name && !row.area) {
        isRejected = true;
        reasons.push('Baris data kosong atau rusak (ID, nama, dan area tidak terisi).');
      }

      // Kriteria perlu peninjauan (Review):
      if (!row.object_id) {
        needsReview = true;
        reasons.push('ID Objek tidak ada/kosong.');
      } else if (idCountMap[row.object_id] > 1) {
        needsReview = true;
        reasons.push(`ID Objek '${row.object_id}' duplikat dalam file (${idCountMap[row.object_id]} baris).`);
      }

      if (!row.object_name || !row.area || !row.reklame_type) {
        needsReview = true;
        reasons.push('Terdapat kolom esensial (nama/area/jenis) yang belum terisi.');
      }

      if (row.size) {
        const sz = parseFloat(row.size);
        if (isNaN(sz) || sz <= 0) {
          needsReview = true;
          reasons.push(`Ukuran '${row.size}' tidak valid.`);
        }
      } else {
        needsReview = true;
        reasons.push('Ukuran reklame belum terisi.');
      }

      const rowEvaluation = {
        data: row,
        rowNumber: row._rawRowNumber,
        objectId: row.object_id || `(Baris ${row._rawRowNumber})`,
        objectName: row.object_name || '(Nama tidak terisi)',
        reasons
      };

      if (isRejected) {
        rowEvaluation.status = 'ditolak';
        rejectedRows.push(rowEvaluation);
      } else if (needsReview) {
        rowEvaluation.status = 'perlu_tinjauan';
        reviewRows.push(rowEvaluation);
        acceptedRows.push(row); // Baris yang perlu ditinjau tetap diterima ke dataset aktif untuk dianalisis di sistem
      } else {
        rowEvaluation.status = 'valid';
        acceptedRows.push(row);
      }
    });

    return {
      isValid: true,
      criticalError: null,
      missingHeaders: [],
      totalRows: rows.length,
      acceptedCount: acceptedRows.length,
      reviewCount: reviewRows.length,
      rejectedCount: rejectedRows.length,
      acceptedRows,
      reviewRows,
      rejectedRows,
      sampleRows: rows.slice(0, 10)
    };
  }

  /**
   * Mengaktifkan dataset baru setelah konfirmasi pengguna
   */
  activateDataset(datasetId, datasetLabel, filename, rows) {
    const timestamp = new Date().toISOString();
    const newDataset = {
      id: datasetId,
      label: datasetLabel,
      filename: filename || `${datasetId}.csv`,
      importedAt: timestamp,
      totalRows: rows.length,
      isSynthetic: true,
      items: rows.map(r => ({
        ...r,
        // Pastikan status verifikasi standar jika belum diisi
        verification_status: r.verification_status || 'belum_diperiksa'
      }))
    };

    this.activeDataset = newDataset;

    // Simpan ke riwayat dataset
    const existingIdx = this.savedDatasets.findIndex(d => d.id === datasetId);
    if (existingIdx >= 0) {
      this.savedDatasets[existingIdx] = {
        id: datasetId,
        label: datasetLabel,
        filename: newDataset.filename,
        importedAt: timestamp,
        totalRows: rows.length
      };
    } else {
      this.savedDatasets.unshift({
        id: datasetId,
        label: datasetLabel,
        filename: newDataset.filename,
        importedAt: timestamp,
        totalRows: rows.length
      });
    }

    this.runAnalysisOnActive();
    this.save();
    return newDataset;
  }

  /**
   * Menjalankan deteksi anomali pada dataset aktif
   */
  runAnalysisOnActive() {
    if (!this.activeDataset || !this.activeDataset.items) {
      this.analysisResult = {
        findings: [],
        itemFindingsMap: {},
        priorityList: [],
        stats: {
          totalFindings: 0,
          ruleCounts: {},
          highPriorityCount: 0,
          mediumPriorityCount: 0,
          reviewPriorityCount: 0,
          cleanCount: 0
        }
      };
      return;
    }

    const result = runAnomalyDetection(this.activeDataset.items, this.activeDataset.id);
    this.analysisResult = result;

    // Sinkronkan status temuan dengan log verifikasi yang pernah dicatat untuk dataset ini
    this.applyVerificationLogToFindings();

    // Catat riwayat eksekusi analisis
    const runEntry = {
      id: `RUN-${Date.now()}`,
      datasetId: this.activeDataset.id,
      timestamp: new Date().toISOString(),
      ruleVersion: 'v2.0-analitis',
      totalItems: this.activeDataset.items.length,
      totalFindings: result.findings.length
    };
    this.analysisRuns.unshift(runEntry);
    if (this.analysisRuns.length > 20) this.analysisRuns.pop();
  }

  /**
   * Menyesuaikan status temuan dengan verifikasi manusia yang tersimpan
   */
  applyVerificationLogToFindings() {
    if (!this.analysisResult || !this.analysisResult.findings) return;

    this.analysisResult.findings.forEach(finding => {
      // Cari catatan verifikasi terakhir untuk objek ini
      const relatedLogs = this.verificationLog.filter(
        v => v.dataset_id === this.activeDataset.id && v.object_id === finding.object_id
      );
      if (relatedLogs.length > 0) {
        const lastLog = relatedLogs[relatedLogs.length - 1];
        if (lastLog.status_after === 'terkonfirmasi_masalah') {
          finding.review_status = 'terbukti';
        } else if (lastLog.status_after === 'tidak_terbukti') {
          finding.review_status = 'tidak_terbukti';
        } else if (lastLog.status_after === 'sedang_diperiksa') {
          finding.review_status = 'sedang_ditinjau';
        }
      }
    });
  }

  /**
   * Memperbarui status verifikasi objek dan menyimpan log append-only
   */
  updateObjectVerification(objectId, newStatus, notes, verifiedBy = 'Pengguna Demo (Analis BAPENDA)') {
    if (!this.activeDataset || !this.activeDataset.items) return false;

    const item = this.activeDataset.items.find(it => it.object_id === objectId);
    if (!item) return false;

    const prevStatus = item.verification_status || 'belum_diperiksa';
    item.verification_status = newStatus;

    // Tambah entri ke riwayat verifikasi append-only
    const logEntry = {
      id: `VRF-${Date.now()}-${Math.floor(Math.random() * 1000)}`,
      dataset_id: this.activeDataset.id,
      object_id: objectId,
      status_before: prevStatus,
      status_after: newStatus,
      notes: notes || 'Pemeriksaan status oleh analis data.',
      verified_at: new Date().toISOString(),
      verified_by: verifiedBy
    };

    this.verificationLog.push(logEntry);

    // Jalankan ulang analisis agar sinkron
    this.runAnalysisOnActive();
    this.save();
    return true;
  }

  /**
   * Mengambil riwayat verifikasi untuk objek tertentu
   */
  getObjectVerificationHistory(objectId) {
    if (!this.activeDataset) return [];
    return this.verificationLog
      .filter(v => v.dataset_id === this.activeDataset.id && v.object_id === objectId)
      .sort((a, b) => new Date(b.verified_at) - new Date(a.verified_at));
  }

  /**
   * Menghitung metrik kelengkapan atribut dataset (%)
   */
  calculateCompleteness() {
    if (!this.activeDataset || !this.activeDataset.items || this.activeDataset.items.length === 0) {
      return 0;
    }
    const items = this.activeDataset.items;
    let totalFields = items.length * REQUIRED_HEADERS.length;
    let filledFields = 0;

    items.forEach(it => {
      REQUIRED_HEADERS.forEach(h => {
        if (it[h] !== undefined && it[h] !== null && String(it[h]).trim() !== '') {
          filledFields++;
        }
      });
    });

    return Math.round((filledFields / totalFields) * 100);
  }

  /**
   * Menghitung statistik koordinat valid
   */
  getCoordinateStats() {
    if (!this.activeDataset || !this.activeDataset.items) {
      return { total: 0, valid: 0, missing: 0, invalid: 0, validPercentage: 0 };
    }
    const items = this.activeDataset.items;
    let valid = 0;
    let missing = 0;
    let invalid = 0;

    items.forEach(it => {
      const hasLat = it.latitude !== undefined && it.latitude !== null && String(it.latitude).trim() !== '';
      const hasLon = it.longitude !== undefined && it.longitude !== null && String(it.longitude).trim() !== '';

      if (!hasLat && !hasLon) {
        missing++;
        return;
      }
      if (!hasLat || !hasLon) {
        invalid++;
        return;
      }
      const lat = parseFloat(it.latitude);
      const lon = parseFloat(it.longitude);
      if (isNaN(lat) || isNaN(lon)) {
        invalid++;
        return;
      }
      if (lat >= -5.60 && lat <= -5.20 && lon >= 105.10 && lon <= 105.45) {
        valid++;
      } else {
        invalid++;
      }
    });

    const validPercentage = items.length > 0 ? Math.round((valid / items.length) * 100) : 0;
    return {
      total: items.length,
      valid,
      missing,
      invalid,
      validPercentage
    };
  }

  /**
   * Menghitung progres verifikasi (%)
   */
  getVerificationProgress() {
    if (!this.activeDataset || !this.activeDataset.items || this.activeDataset.items.length === 0) {
      return { percentage: 0, verifiedCount: 0, pendingCount: 0, inProgressCount: 0, total: 0 };
    }
    const items = this.activeDataset.items;
    let verifiedCount = 0;
    let inProgressCount = 0;
    let pendingCount = 0;

    items.forEach(it => {
      const st = it.verification_status || 'belum_diperiksa';
      if (st === 'terkonfirmasi_masalah' || st === 'tidak_terbukti' || st === 'terbukti_sesuai') {
        verifiedCount++;
      } else if (st === 'sedang_diperiksa' || st === 'perlu_tindak_lanjut') {
        inProgressCount++;
      } else {
        pendingCount++;
      }
    });

    const percentage = Math.round((verifiedCount / items.length) * 100);
    return {
      percentage,
      verifiedCount,
      inProgressCount,
      pendingCount,
      total: items.length
    };
  }

  /**
   * Memuat preset bawaan secara aman (fallback dari file atau template tertanam)
   */
  async loadDefaultPreset() {
    try {
      const resp = await fetch('/data/dataset-aktif.csv');
      if (resp.ok) {
        const text = await resp.text();
        const parsed = this.parseCSV(text);
        if (parsed.success) {
          this.activateDataset('DS-BDL-2026-V1', 'Dataset Reklame Aktif BDL', 'dataset-aktif.csv', parsed.rows);
          return;
        }
      }
    } catch (e) {
      console.warn('Gagal memuat file CSV eksternal, menggunakan preset tertanam:', e);
    }

    // Preset darurat tertanam jika fetch gagal
    this.loadEmbeddedFallbackPreset();
  }

  /**
   * Muat preset tertentu dari folder public/data/
   */
  async loadPresetByName(presetName) {
    const filenameMap = {
      'aktif': { file: 'dataset-aktif.csv', id: 'DS-BDL-2026-V1', label: 'Dataset Reklame Aktif BDL' },
      'bersih': { file: 'dataset-bersih.csv', id: 'DS-BDL-2026-CLEAN', label: 'Dataset Bersih Terverifikasi' },
      'stress': { file: 'dataset-stress.csv', id: 'DS-BDL-2026-STRESS', label: 'Dataset Uji Beban & Anomali' }
    };

    const target = filenameMap[presetName] || filenameMap['aktif'];
    try {
      const resp = await fetch(`/data/${target.file}`);
      if (!resp.ok) throw new Error(`HTTP ${resp.status}`);
      const text = await resp.text();
      const parsed = this.parseCSV(text);
      if (!parsed.success) throw new Error(parsed.error);
      const validation = this.validateCSV(parsed);
      this.activateDataset(target.id, target.label, target.file, validation.acceptedRows);
      return { success: true, validation };
    } catch (err) {
      console.error(`Gagal memuat preset ${presetName}:`, err);
      return { success: false, error: err.message };
    }
  }

  /**
   * Reset seluruh sistem kembali ke kondisi awal demo
   */
  async resetToDefault() {
    try {
      localStorage.removeItem(STORAGE_KEYS.ACTIVE_DATASET);
      localStorage.removeItem(STORAGE_KEYS.SAVED_DATASETS);
      localStorage.removeItem(STORAGE_KEYS.VERIFICATION_LOG);
      localStorage.removeItem(STORAGE_KEYS.ANALYSIS_RUNS);
    } catch (e) {}

    this.savedDatasets = [];
    this.verificationLog = [];
    this.analysisRuns = [];
    await this.loadPresetByName('aktif');
  }

  loadEmbeddedFallbackPreset() {
    const embeddedRows = [
      {
        object_id: 'RKL-001',
        object_name: 'Billboard Bank Lampung Raden Intan',
        area: 'Tanjung Karang Pusat',
        reklame_type: 'Billboard',
        size: '24',
        size_unit: 'm2',
        recorded_at: '2026-01-10',
        administrative_status: 'tercatat',
        verification_status: 'belum_diperiksa',
        latitude: '-5.4168',
        longitude: '105.2582'
      },
      {
        object_id: 'RKL-002',
        object_name: 'Videotron Mall Boemi Kedaton',
        area: 'Kedaton',
        reklame_type: 'Videotron',
        size: '32',
        size_unit: 'm2',
        recorded_at: '2026-01-12',
        administrative_status: 'tercatat',
        verification_status: 'sedang_diperiksa',
        latitude: '-5.3812',
        longitude: '105.2601'
      },
      {
        object_id: 'RKL-003',
        object_name: 'Baliho Promo Provider Way Halim',
        area: 'Way Halim',
        reklame_type: 'Baliho',
        size: '18',
        size_unit: 'm2',
        recorded_at: '2026-01-15',
        administrative_status: 'proses_perpanjangan',
        verification_status: 'belum_diperiksa',
        latitude: '-5.3895',
        longitude: '105.2754'
      },
      {
        object_id: 'RKL-004',
        object_name: 'Bando Jalan Kartini Central',
        area: 'Tanjung Karang Pusat',
        reklame_type: 'Bando Jalan',
        size: '30',
        size_unit: 'm2',
        recorded_at: '2026-01-18',
        administrative_status: 'tercatat',
        verification_status: 'terkonfirmasi_masalah',
        latitude: '-5.4191',
        longitude: '105.2539'
      },
      {
        object_id: 'RKL-005',
        object_name: 'Neon Box Resto Seafood Teluk Betung',
        area: 'Teluk Betung Selatan',
        reklame_type: 'Neon Box',
        size: '8',
        size_unit: 'm2',
        recorded_at: '2026-01-20',
        administrative_status: '',
        verification_status: 'belum_diperiksa',
        latitude: '-5.4482',
        longitude: '105.2711'
      }
    ];

    this.activateDataset('DS-BDL-2026-V1', 'Dataset Reklame Aktif BDL (Fallback)', 'dataset-aktif.csv', embeddedRows);
  }
}

// Inisialisasi singleton data store global
window.padStore = new DataStore();
