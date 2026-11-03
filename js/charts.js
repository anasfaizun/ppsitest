/**
 * PAD Intelligence Lite — Modul Grafik Analitis (SVG Murni)
 * Mengikuti prinsip visual design.md:
 * - Bersih, presisi, tanpa ornamen 3D yang mengaburkan data.
 * - Menggunakan palet token BAPENDA: #002043 (primary), #2C6195 (secondary),
 *   amber untuk peringatan/tinjauan, emerald untuk terverifikasi, slate/gray untuk netral.
 */

const Charts = {
  /**
   * Render Bar Chart Horizontal untuk Distribusi Aturan Temuan Anomali
   * @param {string} containerId - Elemen DOM target
   * @param {Object} ruleCounts - { 'RULE-01': 2, ... }
   * @param {number} totalFindings - Total temuan
   */
  renderRuleDistribution(containerId, ruleCounts, totalFindings) {
    const el = document.getElementById(containerId);
    if (!el) return;

    if (!ruleCounts || totalFindings === 0) {
      el.innerHTML = `
        <div class="empty-chart-state">
          <span class="material-symbols-outlined text-outline">verified</span>
          <p class="text-sm font-medium text-outline mt-2">Tidak ada anomali terdeteksi pada dataset aktif.</p>
        </div>
      `;
      return;
    }

    const rules = [
      { code: 'RULE-01', label: 'ID Objek Kosong', color: '#BA1A1A' },
      { code: 'RULE-02', label: 'ID Duplikat', color: '#BA1A1A' },
      { code: 'RULE-03', label: 'Kolom Wajib Kosong', color: '#D97706' },
      { code: 'RULE-04', label: 'Kandidat Duplikat', color: '#2563EB' },
      { code: 'RULE-05', label: 'Koordinat Tidak Valid', color: '#4B5563' },
      { code: 'RULE-06', label: 'Ukuran Tidak Valid', color: '#D97706' },
      { code: 'RULE-07', label: 'Status Non-Standar', color: '#6B7280' }
    ];

    // Temukan nilai maksimum untuk skala proporsional
    const maxVal = Math.max(...rules.map(r => ruleCounts[r.code] || 0), 1);

    let html = `<div class="rule-distribution-bars">`;
    rules.forEach(r => {
      const count = ruleCounts[r.code] || 0;
      const pctOfTotal = totalFindings > 0 ? Math.round((count / totalFindings) * 100) : 0;
      const barWidth = Math.max(Math.round((count / maxVal) * 100), count > 0 ? 3 : 0);

      html += `
        <div class="bar-row" title="${r.code}: ${r.label} — ${count} temuan (${pctOfTotal}%)">
          <div class="bar-header">
            <span class="bar-code">${r.code}</span>
            <span class="bar-label">${r.label}</span>
            <span class="bar-value data-tabular font-semibold">${count}</span>
          </div>
          <div class="bar-track">
            <div class="bar-fill" style="width: ${barWidth}%; background-color: ${r.color};"></div>
          </div>
        </div>
      `;
    });
    html += `</div>`;

    el.innerHTML = html;
  },

  /**
   * Render Donut Chart SVG untuk Status Verifikasi
   * @param {string} containerId - Target DOM element
   * @param {Object} verifStats - { pending, inProgress, confirmed, notProven }
   */
  renderVerificationDonut(containerId, verifStats) {
    const el = document.getElementById(containerId);
    if (!el) return;

    const total = (verifStats.pending || 0) +
                  (verifStats.inProgress || 0) +
                  (verifStats.confirmed || 0) +
                  (verifStats.notProven || 0);

    if (total === 0) {
      el.innerHTML = `
        <div class="empty-chart-state">
          <p class="text-sm text-outline">Belum ada data verifikasi.</p>
        </div>
      `;
      return;
    }

    const segments = [
      { key: 'confirmed', label: 'Terkonfirmasi Masalah', count: verifStats.confirmed || 0, color: '#BA1A1A' },
      { key: 'inProgress', label: 'Sedang Diperiksa', count: verifStats.inProgress || 0, color: '#2563EB' },
      { key: 'notProven', label: 'Tidak Terbukti', count: verifStats.notProven || 0, color: '#059669' },
      { key: 'pending', label: 'Belum Diperiksa', count: verifStats.pending || 0, color: '#9CA3AF' }
    ];

    // Hitung persentase progres verifikasi (selain pending)
    const verifiedOrHandled = total - (verifStats.pending || 0);
    const progressPct = Math.round((verifiedOrHandled / total) * 100);

    // Hitung sudut donut SVG
    const size = 160;
    const center = size / 2;
    const radius = 58;
    const strokeWidth = 24;
    const circumference = 2 * Math.PI * radius;

    let accumulatedPct = 0;
    let paths = '';

    segments.forEach(seg => {
      const pct = seg.count / total;
      if (pct <= 0) return;

      const strokeDashoffset = circumference - (pct * circumference);
      const rotate = accumulatedPct * 360 - 90;

      paths += `
        <circle
          cx="${center}"
          cy="${center}"
          r="${radius}"
          fill="none"
          stroke="${seg.color}"
          stroke-width="${strokeWidth}"
          stroke-dasharray="${circumference}"
          stroke-dashoffset="${strokeDashoffset}"
          transform="rotate(${rotate} ${center} ${center})"
          class="donut-segment"
        >
          <title>${seg.label}: ${seg.count} objek (${Math.round(pct * 100)}%)</title>
        </circle>
      `;
      accumulatedPct += pct;
    });

    let legendHtml = `<div class="donut-legend">`;
    segments.forEach(s => {
      const pct = Math.round((s.count / total) * 100);
      legendHtml += `
        <div class="legend-item">
          <span class="legend-color-dot" style="background-color: ${s.color};"></span>
          <span class="legend-label">${s.label}</span>
          <span class="legend-count data-tabular font-semibold">${s.count} (${pct}%)</span>
        </div>
      `;
    });
    legendHtml += `</div>`;

    el.innerHTML = `
      <div class="donut-container">
        <div class="donut-svg-wrapper">
          <svg width="${size}" height="${size}" viewBox="0 0 ${size} ${size}">
            <circle cx="${center}" cy="${center}" r="${radius}" fill="none" stroke="#E5E7EB" stroke-width="${strokeWidth}" />
            ${paths}
          </svg>
          <div class="donut-center-text">
            <span class="donut-center-val data-tabular">${progressPct}%</span>
            <span class="donut-center-label">Ditinjau</span>
          </div>
        </div>
        ${legendHtml}
      </div>
    `;
  }
};

window.Charts = Charts;
