/**
 * PAD Intelligence Lite — Mesin Aturan & Deteksi Anomali
 * Mengacu pada PRD Bagian 6 (FR-05, FR-06) dan Bagian 9.
 * Seluruh aturan transparan, deterministik, dan dapat ditelusuri ke objek sumber.
 */

const RULES_DEFINITIONS = [
  {
    code: 'RULE-01',
    name: 'ID Objek Kosong',
    category: 'Tinggi',
    weight: 3.0,
    description: 'Catatan tidak memiliki pengenal unik sehingga menghambat penelusuran.',
    check: (item, index) => {
      if (!item.object_id || String(item.object_id).trim() === '') {
        return {
          triggered: true,
          reason: `Baris ke-${index + 1} tidak memiliki ID Objek (object_id kosong).`,
          fields: ['object_id']
        };
      }
      return { triggered: false };
    }
  },
  {
    code: 'RULE-02',
    name: 'ID Objek Duplikat',
    category: 'Tinggi',
    weight: 3.0,
    description: 'ID Objek muncul lebih dari satu kali dalam dataset aktif.',
    // Evaluasi berbasis koleksi
    collectionCheck: (items) => {
      const idCounts = {};
      items.forEach(it => {
        const id = it.object_id ? String(it.object_id).trim() : null;
        if (id) {
          idCounts[id] = (idCounts[id] || 0) + 1;
        }
      });
      return idCounts;
    }
  },
  {
    code: 'RULE-03',
    name: 'Kolom Wajib Kosong',
    category: 'Sedang',
    weight: 2.0,
    description: 'Atribut esensial inventaris reklame belum terisi.',
    check: (item) => {
      const required = ['object_name', 'area', 'reklame_type', 'size'];
      const missing = [];
      required.forEach(f => {
        if (item[f] === undefined || item[f] === null || String(item[f]).trim() === '') {
          missing.push(f);
        }
      });
      if (missing.length > 0) {
        return {
          triggered: true,
          reason: `Atribut wajib belum terisi: ${missing.join(', ')}.`,
          fields: missing
        };
      }
      return { triggered: false };
    }
  },
  {
    code: 'RULE-04',
    name: 'Kandidat Duplikat',
    category: 'Sedang',
    weight: 2.0,
    description: 'Indikasi objek yang sama tercatat lebih dari sekali (nama mirip dan area sama).',
    // Evaluasi berbasis koleksi
    collectionCheckCandidates: (items) => {
      const map = {};
      const candidates = new Set();
      items.forEach((it, idx) => {
        if (!it.object_name || !it.area) return;
        const normName = String(it.object_name).toLowerCase().replace(/[^a-z0-9]/g, '').slice(0, 15);
        const normArea = String(it.area).toLowerCase().trim();
        const key = `${normName}_${normArea}`;
        if (!map[key]) {
          map[key] = [];
        }
        map[key].push({ id: it.object_id || `ROW-${idx + 1}`, name: it.object_name, area: it.area });
      });

      const resultMap = {};
      Object.keys(map).forEach(k => {
        if (map[k].length > 1) {
          map[k].forEach(entry => {
            const others = map[k].filter(x => x.id !== entry.id).map(x => x.id);
            resultMap[entry.id] = {
              triggered: true,
              otherIds: others,
              reason: `Kandidat duplikat dengan objek [${others.join(', ')}] berdasarkan kesamaan nama dan area simulasi.`,
              fields: ['object_name', 'area']
            };
          });
        }
      });
      return resultMap;
    }
  },
  {
    code: 'RULE-05',
    name: 'Koordinat Tidak Valid / Di Luar Wilayah',
    category: 'Perlu Ditinjau',
    weight: 1.0,
    description: 'Koordinat tidak lengkap, non-numerik, atau di luar rentang geografis Bandar Lampung.',
    check: (item) => {
      const hasLat = item.latitude !== undefined && item.latitude !== null && String(item.latitude).trim() !== '';
      const hasLon = item.longitude !== undefined && item.longitude !== null && String(item.longitude).trim() !== '';

      if (!hasLat && !hasLon) {
        return {
          triggered: true,
          reason: 'Koordinat belum tersedia (latitude dan longitude kosong). Objek tidak dapat dipetakan.',
          fields: ['latitude', 'longitude'],
          isMissingOnly: true
        };
      }

      if ((hasLat && !hasLon) || (!hasLat && hasLon)) {
        return {
          triggered: true,
          reason: 'Koordinat parsial: hanya salah satu dari latitude atau longitude yang terisi.',
          fields: ['latitude', 'longitude']
        };
      }

      const lat = parseFloat(item.latitude);
      const lon = parseFloat(item.longitude);

      if (isNaN(lat) || isNaN(lon)) {
        return {
          triggered: true,
          reason: `Format koordinat non-numerik: lat="${item.latitude}", lon="${item.longitude}".`,
          fields: ['latitude', 'longitude']
        };
      }

      // Rentang Kota Bandar Lampung dan sekitarnya: Lat -5.55 s/d -5.30, Lon 105.10 s/d 105.40
      const validLat = lat >= -5.60 && lat <= -5.20;
      const validLon = lon >= 105.10 && lon <= 105.45;

      if (!validLat || !validLon) {
        return {
          triggered: true,
          reason: `Koordinat (${lat}, ${lon}) berada di luar batas rentang geografis Kota Bandar Lampung (-5.60 s.d -5.20, 105.10 s.d 105.45).`,
          fields: ['latitude', 'longitude']
        };
      }

      return { triggered: false };
    }
  },
  {
    code: 'RULE-06',
    name: 'Ukuran Tidak Valid',
    category: 'Sedang',
    weight: 2.0,
    description: 'Nilai dimensi reklame kosong, non-numerik, atau tidak bernilai positif.',
    check: (item) => {
      if (item.size === undefined || item.size === null || String(item.size).trim() === '') {
        return {
          triggered: true,
          reason: 'Nilai ukuran reklame (size) belum diisi.',
          fields: ['size']
        };
      }

      const val = parseFloat(item.size);
      if (isNaN(val)) {
        return {
          triggered: true,
          reason: `Ukuran reklame '${item.size}' bukan angka valid.`,
          fields: ['size']
        };
      }

      if (val <= 0) {
        return {
          triggered: true,
          reason: `Ukuran reklame bernilai ${val} m2 (harus lebih besar dari 0).`,
          fields: ['size']
        };
      }

      return { triggered: false };
    }
  },
  {
    code: 'RULE-07',
    name: 'Status Administrasi Tidak Standar / Kosong',
    category: 'Perlu Ditinjau',
    weight: 1.0,
    description: 'Status perizinan/pencatatan belum diisi atau tidak sesuai kamus data baku.',
    check: (item) => {
      const validStatuses = ['tercatat', 'proses_perpanjangan', 'tidak_aktif'];
      const current = item.administrative_status ? String(item.administrative_status).trim().toLowerCase() : '';

      if (!current) {
        return {
          triggered: true,
          reason: 'Status administrasi belum diisi.',
          fields: ['administrative_status']
        };
      }

      if (!validStatuses.includes(current)) {
        return {
          triggered: true,
          reason: `Status administrasi '${item.administrative_status}' tidak sesuai daftar standar (${validStatuses.join(', ')}).`,
          fields: ['administrative_status']
        };
      }

      return { triggered: false };
    }
  }
];

/**
 * Menjalankan seluruh aturan deteksi anomali pada sekumpulan item reklame
 * @param {Array} items - Daftar objek reklame
 * @param {string} datasetId - ID dataset
 * @returns {Object} { findings: Array, priorityMap: Object, stats: Object }
 */
function runAnomalyDetection(items, datasetId = 'DS-BDL-2026-V1') {
  const findings = [];
  const itemFindingsMap = {}; // object_id or rowRef -> array of findings

  // Pre-kalkulasi aturan koleksi
  const rule2 = RULES_DEFINITIONS.find(r => r.code === 'RULE-02');
  const idCounts = rule2 ? rule2.collectionCheck(items) : {};

  const rule4 = RULES_DEFINITIONS.find(r => r.code === 'RULE-04');
  const candidateDuplicates = rule4 ? rule4.collectionCheckCandidates(items) : {};

  items.forEach((item, index) => {
    const rowRef = item.object_id ? String(item.object_id).trim() : `BARIS-${index + 1}`;
    const objectKey = item.object_id || rowRef;
    if (!itemFindingsMap[objectKey]) {
      itemFindingsMap[objectKey] = [];
    }

    // RULE-01: ID Kosong
    const r1 = RULES_DEFINITIONS.find(r => r.code === 'RULE-01');
    const res1 = r1.check(item, index);
    if (res1.triggered) {
      const f = createFinding(datasetId, objectKey, r1, res1.reason, res1.fields);
      findings.push(f);
      itemFindingsMap[objectKey].push(f);
    }

    // RULE-02: ID Duplikat
    if (item.object_id && idCounts[String(item.object_id).trim()] > 1) {
      const cnt = idCounts[String(item.object_id).trim()];
      const r2 = RULES_DEFINITIONS.find(r => r.code === 'RULE-02');
      const f = createFinding(
        datasetId,
        objectKey,
        r2,
        `ID Objek '${item.object_id}' terdeteksi ${cnt} kali dalam dataset aktif (konflik unik).`,
        ['object_id']
      );
      findings.push(f);
      itemFindingsMap[objectKey].push(f);
    }

    // RULE-03: Kolom Wajib Kosong
    const r3 = RULES_DEFINITIONS.find(r => r.code === 'RULE-03');
    const res3 = r3.check(item);
    if (res3.triggered) {
      const f = createFinding(datasetId, objectKey, r3, res3.reason, res3.fields);
      findings.push(f);
      itemFindingsMap[objectKey].push(f);
    }

    // RULE-04: Kandidat Duplikat
    if (candidateDuplicates[objectKey]) {
      const r4 = RULES_DEFINITIONS.find(r => r.code === 'RULE-04');
      const cand = candidateDuplicates[objectKey];
      const f = createFinding(datasetId, objectKey, r4, cand.reason, cand.fields);
      findings.push(f);
      itemFindingsMap[objectKey].push(f);
    }

    // RULE-05: Koordinat
    const r5 = RULES_DEFINITIONS.find(r => r.code === 'RULE-05');
    const res5 = r5.check(item);
    if (res5.triggered) {
      const f = createFinding(datasetId, objectKey, r5, res5.reason, res5.fields);
      findings.push(f);
      itemFindingsMap[objectKey].push(f);
    }

    // RULE-06: Ukuran
    const r6 = RULES_DEFINITIONS.find(r => r.code === 'RULE-06');
    const res6 = r6.check(item);
    if (res6.triggered) {
      const f = createFinding(datasetId, objectKey, r6, res6.reason, res6.fields);
      findings.push(f);
      itemFindingsMap[objectKey].push(f);
    }

    // RULE-07: Status Administrasi
    const r7 = RULES_DEFINITIONS.find(r => r.code === 'RULE-07');
    const res7 = r7.check(item);
    if (res7.triggered) {
      const f = createFinding(datasetId, objectKey, r7, res7.reason, res7.fields);
      findings.push(f);
      itemFindingsMap[objectKey].push(f);
    }
  });

  // Tentukan Kategori Prioritas Deterministik per objek
  const priorityList = [];
  items.forEach((item, index) => {
    const objectKey = item.object_id || `BARIS-${index + 1}`;
    const objFindings = itemFindingsMap[objectKey] || [];
    const priorityInfo = calculateDeterministicPriority(item, objFindings);
    priorityList.push({
      item,
      findings: objFindings,
      priority: priorityInfo.priority,
      reason: priorityInfo.reason,
      triggerCount: objFindings.length,
      rules: objFindings.map(f => f.rule_code)
    });
  });

  // Urutkan prioritas secara deterministik:
  // 1. Kategori: Tinggi (3) > Sedang (2) > Perlu Ditinjau (1) > Tanpa Temuan (0)
  // 2. Jumlah aturan pemicu (desc)
  // 3. ID objek alfabetis (asc)
  priorityList.sort((a, b) => {
    const rankMap = { 'Tinggi': 3, 'Sedang': 2, 'Perlu Ditinjau': 1, 'Tanpa Masalah': 0 };
    const rankA = rankMap[a.priority] || 0;
    const rankB = rankMap[b.priority] || 0;
    if (rankA !== rankB) return rankB - rankA;
    if (b.triggerCount !== a.triggerCount) return b.triggerCount - a.triggerCount;
    return String(a.item.object_id || '').localeCompare(String(b.item.object_id || ''));
  });

  // Hitung agregasi statistik
  const ruleCounts = {};
  RULES_DEFINITIONS.forEach(r => { ruleCounts[r.code] = 0; });
  findings.forEach(f => {
    ruleCounts[f.rule_code] = (ruleCounts[f.rule_code] || 0) + 1;
  });

  return {
    findings,
    itemFindingsMap,
    priorityList,
    stats: {
      totalFindings: findings.length,
      ruleCounts,
      highPriorityCount: priorityList.filter(p => p.priority === 'Tinggi').length,
      mediumPriorityCount: priorityList.filter(p => p.priority === 'Sedang').length,
      reviewPriorityCount: priorityList.filter(p => p.priority === 'Perlu Ditinjau').length,
      cleanCount: priorityList.filter(p => p.priority === 'Tanpa Masalah').length
    }
  };
}

let findingIdCounter = 1;
function createFinding(datasetId, objectKey, ruleDef, reason, fields) {
  const padNum = String(findingIdCounter++).padStart(3, '0');
  return {
    id: `ANM-${padNum}`,
    dataset_import_id: datasetId,
    object_id: objectKey,
    rule_code: ruleDef.code,
    rule_name: ruleDef.name,
    category: ruleDef.category,
    reason: reason,
    triggered_fields: fields || [],
    detected_at: new Date().toISOString(),
    review_status: 'belum_ditinjau' // belum_ditinjau, terbukti, tidak_terbukti
  };
}

/**
 * Menghitung matriks prioritas deterministik sesuai PRD Bab 9
 */
function calculateDeterministicPriority(item, findings) {
  if (!findings || findings.length === 0) {
    return {
      priority: 'Tanpa Masalah',
      reason: 'Tidak ada anomali atau ketidaklengkapan data yang terdeteksi.'
    };
  }

  const ruleCodes = findings.map(f => f.rule_code);
  const hasR1 = ruleCodes.includes('RULE-01');
  const hasR2 = ruleCodes.includes('RULE-02');
  const hasR3 = ruleCodes.includes('RULE-03');
  const hasR4 = ruleCodes.includes('RULE-04');
  const hasR6 = ruleCodes.includes('RULE-06');

  // Prioritas Tinggi: Masalah struktural integritas atau banyak temuan
  if (hasR1 || hasR2 || findings.length >= 3) {
    const reasons = [];
    if (hasR1) reasons.push('ID objek kosong');
    if (hasR2) reasons.push('konflik ID duplikat');
    if (findings.length >= 3) reasons.push(`${findings.length} indikator temuan sekaligus`);
    return {
      priority: 'Tinggi',
      reason: `Masalah struktur data kritis: ${reasons.join(', ')}.`
    };
  }

  // Prioritas Sedang: Kualitas data substansial atau kandidat duplikat
  if (hasR3 || hasR4 || hasR6) {
    const reasons = [];
    if (hasR3) reasons.push('kolom esensial kosong');
    if (hasR4) reasons.push('kandidat duplikat lapangan');
    if (hasR6) reasons.push('dimensi/ukuran tidak valid');
    return {
      priority: 'Sedang',
      reason: `Perlu peninjauan kualitas atribut: ${reasons.join(', ')}.`
    };
  }

  // Prioritas Perlu Ditinjau: Kelengkapan koordinat atau status administrasi
  return {
    priority: 'Perlu Ditinjau',
    reason: 'Koordinat belum lengkap/di luar batas atau status administrasi belum terstandarisasi.'
  };
}

// Ekspor untuk browser atau node jika dibutuhkan
if (typeof module !== 'undefined' && module.exports) {
  module.exports = {
    RULES_DEFINITIONS,
    runAnomalyDetection,
    calculateDeterministicPriority
  };
}
