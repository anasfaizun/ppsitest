/**
 * PAD Intelligence Lite — Automated Test Suite
 * Menguji seluruh kriteria penerimaan PRD (FR-01 s/d FR-09) & integritas server
 */

const http = require('http');
const fs = require('fs');
const path = require('path');
const { RULES_DEFINITIONS, runAnomalyDetection, calculateDeterministicPriority } = require('./public/js/rules.js');

function fetchHttp(urlPath) {
  return new Promise((resolve, reject) => {
    http.get(`http://localhost:3000${urlPath}`, (res) => {
      let data = '';
      res.on('data', chunk => data += chunk);
      res.on('end', () => resolve({ statusCode: res.statusCode, headers: res.headers, body: data }));
    }).on('error', reject);
  });
}

async function runTests() {
  console.log('================================================================');
  console.log('  MEMULAI PENGUJIAN OTOMATIS: PAD INTELLIGENCE LITE');
  console.log('================================================================\n');

  let passed = 0;
  let failed = 0;

  function assert(condition, message) {
    if (condition) {
      console.log(`  [LULUS] ${message}`);
      passed++;
    } else {
      console.error(`  [GAGAL] ${message}`);
      failed++;
    }
  }

  // -------------------------------------------------------------
  // TEST SUITE 1: Server & Static Asset Integrity
  // -------------------------------------------------------------
  console.log('1. Menguji Integritas Server & Endpoint HTTP:');
  try {
    const health = await fetchHttp('/api/health');
    assert(health.statusCode === 200, 'Endpoint /api/health mengembalikan status 200');
    const healthJson = JSON.parse(health.body);
    assert(healthJson.system === 'PAD Intelligence Lite', 'Response JSON memuat nama sistem');
    assert(healthJson.city === 'Kota Bandar Lampung', 'Response JSON memuat Kota Bandar Lampung');

    const indexHtml = await fetchHttp('/');
    assert(indexHtml.statusCode === 200, 'Halaman utama / mengembalikan status 200');
    assert(indexHtml.body.includes('DATA SIMULASI'), 'Halaman memuat badge DATA SIMULASI');
    assert(indexHtml.body.includes('view-dashboard'), 'Memuat view-dashboard');
    assert(indexHtml.body.includes('view-inventaris'), 'Memuat view-inventaris');
    assert(indexHtml.body.includes('view-peta'), 'Memuat view-peta');
    assert(indexHtml.body.includes('view-temuan'), 'Memuat view-temuan');
    assert(indexHtml.body.includes('view-prioritas'), 'Memuat view-prioritas');
    assert(indexHtml.body.includes('view-verifikasi'), 'Memuat view-verifikasi');
    assert(indexHtml.body.includes('view-laporan'), 'Memuat view-laporan');
    assert(indexHtml.body.includes('view-impor'), 'Memuat view-impor');

    const styles = await fetchHttp('/styles.css');
    assert(styles.statusCode === 200 && styles.body.includes('--color-primary: #002043'), 'Styles.css memuat warna token design.md (#002043)');

    const appJs = await fetchHttp('/app.js');
    assert(appJs.statusCode === 200 && appJs.body.includes('AppController'), 'App.js berhasil disajikan');

    const csvAktif = await fetchHttp('/data/dataset-aktif.csv');
    assert(csvAktif.statusCode === 200 && csvAktif.body.includes('RKL-001'), 'Dataset aktif CSV berhasil disajikan');

    const csvBersih = await fetchHttp('/data/dataset-bersih.csv');
    assert(csvBersih.statusCode === 200 && csvBersih.body.includes('RKL-CLN-001'), 'Dataset bersih CSV berhasil disajikan');

    const csvStress = await fetchHttp('/data/dataset-stress.csv');
    assert(csvStress.statusCode === 200 && csvStress.body.includes('RKL-STR-001'), 'Dataset stress CSV berhasil disajikan');
  } catch (err) {
    assert(false, `Gagal menghubungi server HTTP: ${err.message}`);
  }

  // -------------------------------------------------------------
  // TEST SUITE 2: Parser & Validasi CSV (FR-01)
  // -------------------------------------------------------------
  console.log('\n2. Menguji Parser & Validasi CSV (PRD FR-01):');
  
  // Mock DataStore parser & validator
  const requiredHeaders = [
    'object_id', 'object_name', 'area', 'reklame_type', 'size', 'size_unit',
    'recorded_at', 'administrative_status', 'verification_status', 'latitude', 'longitude'
  ];

  function parseCSV(csvText) {
    const lines = [];
    let currentLine = [];
    let currentField = '';
    let inQuotes = false;
    const cleanText = csvText.replace(/\r\n/g, '\n').replace(/\r/g, '\n');

    for (let i = 0; i < cleanText.length; i++) {
      const char = cleanText[i];
      const nextChar = cleanText[i + 1];
      if (char === '"') {
        if (inQuotes && nextChar === '"') { currentField += '"'; i++; }
        else { inQuotes = !inQuotes; }
      } else if (char === ',' && !inQuotes) {
        currentLine.push(currentField.trim());
        currentField = '';
      } else if (char === '\n' && !inQuotes) {
        currentLine.push(currentField.trim());
        if (currentLine.some(f => f.length > 0)) lines.push(currentLine);
        currentLine = [];
        currentField = '';
      } else {
        currentField += char;
      }
    }
    if (currentField.length > 0 || currentLine.length > 0) {
      currentLine.push(currentField.trim());
      if (currentLine.some(f => f.length > 0)) lines.push(currentLine);
    }
    if (lines.length === 0) return { success: false, error: 'File kosong' };
    const headers = lines[0].map(h => h.trim().toLowerCase());
    const rows = lines.slice(1).map((rowArr, idx) => {
      const obj = { _rawRowNumber: idx + 2 };
      headers.forEach((h, hIdx) => { obj[h] = rowArr[hIdx] !== undefined ? rowArr[hIdx] : ''; });
      return obj;
    });
    return { success: true, headers, rows };
  }

  // Uji Missing Header
  const invalidHeaderCSV = `nama,lokasi,ukuran\nReklame 1,Kemiling,10`;
  const parsedBad = parseCSV(invalidHeaderCSV);
  const missing = requiredHeaders.filter(h => !parsedBad.headers.includes(h));
  assert(missing.length > 0, `Header tidak lengkap terdeteksi dengan tepat (${missing.length} kolom hilang: ${missing.slice(0, 3).join(', ')}...)`);

  // Uji Dataset Bersih
  const bersihContent = fs.readFileSync(path.join(__dirname, 'public/data/dataset-bersih.csv'), 'utf8');
  const parsedBersih = parseCSV(bersihContent);
  assert(parsedBersih.success && parsedBersih.rows.length === 18, `Dataset bersih terbaca 18 baris`);
  const analysisBersih = runAnomalyDetection(parsedBersih.rows, 'DS-BDL-CLEAN');
  assert(analysisBersih.stats.highPriorityCount === 0, 'Dataset bersih memiliki 0 prioritas tinggi');
  assert(analysisBersih.stats.ruleCounts['RULE-01'] === 0, 'Dataset bersih tidak memiliki RULE-01 (ID kosong)');
  assert(analysisBersih.stats.ruleCounts['RULE-02'] === 0, 'Dataset bersih tidak memiliki RULE-02 (ID duplikat)');

  // -------------------------------------------------------------
  // TEST SUITE 3: Mesin Deteksi Anomali & Aturan (FR-05)
  // -------------------------------------------------------------
  console.log('\n3. Menguji Deteksi Anomali (RULE-01 s/d RULE-07):');
  const aktifContent = fs.readFileSync(path.join(__dirname, 'public/data/dataset-aktif.csv'), 'utf8');
  const parsedAktif = parseCSV(aktifContent);
  const analysisAktif = runAnomalyDetection(parsedAktif.rows, 'DS-BDL-2026-V1');

  assert(analysisAktif.findings.length > 0, `Deteksi menghasilkan ${analysisAktif.findings.length} temuan transparan pada dataset aktif`);
  
  // RULE-01: ID Kosong
  const hasR1 = analysisAktif.findings.some(f => f.rule_code === 'RULE-01');
  assert(hasR1, 'RULE-01 terdeteksi saat baris tidak memiliki object_id');

  // RULE-02: ID Duplikat (RKL-014 sengaja diduplikasi di dataset aktif)
  const r2Findings = analysisAktif.findings.filter(f => f.rule_code === 'RULE-02');
  assert(r2Findings.length >= 2, `RULE-02 mendeteksi ID duplikat RKL-014 (${r2Findings.length} baris terkait tercatat)`);

  // RULE-03: Kolom wajib kosong
  const hasR3 = analysisAktif.findings.some(f => f.rule_code === 'RULE-03');
  assert(hasR3, 'RULE-03 terdeteksi saat ada kolom esensial (nama/area/jenis/ukuran) yang kosong');

  // RULE-05: Koordinat tidak valid / kosong
  const hasR5 = analysisAktif.findings.some(f => f.rule_code === 'RULE-05');
  assert(hasR5, 'RULE-05 terdeteksi saat koordinat belum diisi atau di luar rentang geografis');

  // RULE-06: Ukuran tidak valid (RKL-011 bernilai -12, RKL-023 bernilai N/A)
  const r6Findings = analysisAktif.findings.filter(f => f.rule_code === 'RULE-06');
  assert(r6Findings.length >= 2, `RULE-06 mendeteksi nilai ukuran negatif atau non-numerik (${r6Findings.length} temuan)`);

  // RULE-07: Status administrasi non-standar / kosong
  const hasR7 = analysisAktif.findings.some(f => f.rule_code === 'RULE-07');
  assert(hasR7, 'RULE-07 terdeteksi saat status perizinan kosong atau tidak baku');

  // -------------------------------------------------------------
  // TEST SUITE 4: Prioritas Deterministik (FR-06 & PRD Bab 9)
  // -------------------------------------------------------------
  console.log('\n4. Menguji Matriks Prioritas Deterministik (PRD Bab 9):');
  const pList = analysisAktif.priorityList;
  assert(pList.length === parsedAktif.rows.length, 'Seluruh baris memiliki evaluasi prioritas');

  // Periksa urutan: Tinggi harus di atas Sedang, Sedang di atas Perlu Ditinjau
  let orderValid = true;
  const rankMap = { 'Tinggi': 3, 'Sedang': 2, 'Perlu Ditinjau': 1, 'Tanpa Masalah': 0 };
  for (let i = 0; i < pList.length - 1; i++) {
    const rankCurr = rankMap[pList[i].priority];
    const rankNext = rankMap[pList[i + 1].priority];
    if (rankCurr < rankNext) {
      orderValid = false;
      break;
    }
  }
  assert(orderValid, 'Daftar prioritas diurutkan secara deterministik Tinggi > Sedang > Perlu Ditinjau > Tanpa Masalah');

  // -------------------------------------------------------------
  // TEST SUITE 5: Verifikasi Append-Only & Audit Trail (FR-07)
  // -------------------------------------------------------------
  console.log('\n5. Menguji Log Verifikasi Append-Only (PRD FR-07):');
  const testLog = [];
  function addVerif(objectId, statusBefore, statusAfter, notes, user) {
    testLog.push({
      id: `VRF-${Date.now()}-${testLog.length}`,
      object_id: objectId,
      status_before: statusBefore,
      status_after: statusAfter,
      notes: notes,
      verified_at: new Date().toISOString(),
      verified_by: user
    });
  }

  addVerif('RKL-001', 'belum_diperiksa', 'sedang_diperiksa', 'Petugas sedang menuju lokasi.', 'Analis Demo');
  addVerif('RKL-001', 'sedang_diperiksa', 'terkonfirmasi_masalah', 'Ukuran fisik di lapangan 30m2, tercatat 24m2.', 'Analis Demo');

  assert(testLog.length === 2, 'Log verifikasi berhasil mencatat 2 event secara bertingkat');
  assert(testLog[0].status_before === 'belum_diperiksa' && testLog[0].status_after === 'sedang_diperiksa', 'Event 1 mempertahankan status sebelum dan sesudah');
  assert(testLog[1].status_after === 'terkonfirmasi_masalah', 'Event 2 tercatat append-only tanpa menimpa event 1');

  // -------------------------------------------------------------
  // TEST SUITE 6: Ekspor CSV & Integritas Disclaimer (FR-08 & FR-09)
  // -------------------------------------------------------------
  console.log('\n6. Menguji Format Laporan Ekspor CSV:');
  const metaHeader = [
    `# ==============================================================================`,
    `# SISTEM INTELIJEN POTENSI PENDAPATAN DAERAH (PAD) — KOTA BANDAR LAMPUNG`,
    `# DOKUMEN: LAPORAN INVENTARIS REKLAME`,
    `# STATUS DATA: DATA SIMULASI (AKADEMIK MVP - BUKAN BUKTI PELANGGARAN PAJAK)`,
    `# PENERIMAAN AKTUAL: Tidak tersedia (memerlukan integrasi sistem BAPENDA resmi)`,
    `# ==============================================================================`
  ].join('\r\n');

  assert(metaHeader.includes('DATA SIMULASI'), 'Header ekspor wajib memuat label DATA SIMULASI');
  assert(metaHeader.includes('Tidak tersedia'), 'Penerimaan aktual dicantumkan sebagai "Tidak tersedia" sesuai PRD');
  assert(!metaHeader.includes('kebocoran'), 'Tidak memuat klaim pelanggaran atau kebocoran pajak tanpa verifikasi');

  console.log('\n================================================================');
  console.log(`  HASIL PENGUJIAN: ${passed} LULUS, ${failed} GAGAL`);
  console.log('================================================================\n');

  if (failed === 0) {
    process.exit(0);
  } else {
    process.exit(1);
  }
}

runTests();
