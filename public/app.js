/**
 * PAD Intelligence Lite — Controller Aplikasi Utama (SPA)
 * Mengontrol navigasi, filter reaktif, drawer detail, validasi impor CSV,
 * pembaruan status verifikasi, dan sinkronisasi tampilan.
 */

class AppController {
  constructor() {
    this.currentView = 'dashboard';
    this.selectedObjectId = null;
    this.stagedImport = null; // Menyimpan dataset sementara saat proses impor
    this.mapInstance = null;
    
    // Status filter
    this.inventoryFilters = { search: '', area: '', type: '', status: '' };
    this.mapFilters = { area: '', priority: '' };
    this.findingsFilters = { rule: '', priority: '', status: '' };
    this.priorityFilters = { category: '', status: '' };

    this.init();
  }

  init() {
    // Inisialisasi router
    window.addEventListener('hashchange', () => this.handleHashChange());
    this.setupEventListeners();

    // Inisialisasi peta
    this.mapInstance = new ReklameMap('leaflet-map-container');

    // Berlangganan perubahan pada data store
    window.padStore.subscribe(() => {
      this.renderAll();
    });

    // Jalankan navigasi awal berdasarkan URL hash
    this.handleHashChange();

    // Render awal
    setTimeout(() => {
      this.renderAll();
    }, 150);
  }

  /* -------------------------------------------------------------------------
     ROUTING & NAVIGASI
     ------------------------------------------------------------------------- */
  handleHashChange() {
    const hash = window.location.hash.replace('#', '') || 'dashboard';
    const validViews = ['dashboard', 'impor', 'inventaris', 'peta', 'temuan', 'prioritas', 'verifikasi', 'laporan'];
    const target = validViews.includes(hash) ? hash : 'dashboard';
    this.navigate(target);
  }

  navigate(viewName) {
    this.currentView = viewName;
    window.location.hash = viewName;

    // Sembunyikan semua view dan tampilkan view aktif
    document.querySelectorAll('.page-view').forEach(el => {
      el.classList.add('hidden');
    });
    const targetEl = document.getElementById(`view-${viewName}`);
    if (targetEl) targetEl.classList.remove('hidden');

    // Perbarui navigasi sidebar aktif
    document.querySelectorAll('.sidebar-nav .nav-link').forEach(link => {
      if (link.dataset.view === viewName) {
        link.classList.add('active');
      } else {
        link.classList.remove('active');
      }
    });

    // Tutup mobile drawer jika terbuka
    const sidebar = document.getElementById('app-sidebar');
    if (sidebar) sidebar.classList.remove('mobile-open');

    // Khusus peta: inisialisasi / invalidate ukuran
    if (viewName === 'peta') {
      setTimeout(() => {
        if (!this.mapInstance.map) {
          this.mapInstance.init();
        } else {
          this.mapInstance.map.invalidateSize();
        }
        this.renderMap();
      }, 100);
    }

    // Scroll ke atas halaman
    window.scrollTo({ top: 0, behavior: 'smooth' });
  }

  /* -------------------------------------------------------------------------
     SETUP EVENT LISTENERS
     ------------------------------------------------------------------------- */
  setupEventListeners() {
    // Tombol Toggle Mobile Sidebar
    const mobileBtn = document.getElementById('mobile-toggle-btn');
    if (mobileBtn) {
      mobileBtn.addEventListener('click', () => {
        const sidebar = document.getElementById('app-sidebar');
        sidebar.classList.toggle('mobile-open');
      });
    }

    // Tombol Reset Demo di Header
    const resetBtn = document.getElementById('btn-reset-demo');
    if (resetBtn) {
      resetBtn.addEventListener('click', () => {
        if (confirm('Apakah Anda yakin ingin mengembalikan seluruh dataset dan verifikasi ke kondisi awal demo?')) {
          window.padStore.resetToDefault().then(() => {
            this.showToast('Data demo berhasil direset ke kondisi awal.', 'success');
          });
        }
      });
    }

    // Modal Tentang Prototipe
    const openAboutBtn = document.getElementById('btn-open-about');
    const closeAboutBtn = document.getElementById('btn-modal-about-close');
    const closeAboutBtn2 = document.getElementById('btn-modal-about-close-btn');
    const modalAbout = document.getElementById('modal-about');

    if (openAboutBtn) openAboutBtn.addEventListener('click', () => modalAbout.classList.add('active'));
    if (closeAboutBtn) closeAboutBtn.addEventListener('click', () => modalAbout.classList.remove('active'));
    if (closeAboutBtn2) closeAboutBtn2.addEventListener('click', () => modalAbout.classList.remove('active'));

    // Drawer Detail Objek Listeners
    const closeDrawerBtn = document.getElementById('btn-close-drawer');
    const closeDrawerBtn2 = document.getElementById('btn-drawer-close-bottom');
    const drawerBackdrop = document.getElementById('object-drawer-backdrop');

    if (closeDrawerBtn) closeDrawerBtn.addEventListener('click', () => this.closeObjectDrawer());
    if (closeDrawerBtn2) closeDrawerBtn2.addEventListener('click', () => this.closeObjectDrawer());
    if (drawerBackdrop) drawerBackdrop.addEventListener('click', () => this.closeObjectDrawer());

    // Form Verifikasi di Drawer
    const formVerif = document.getElementById('form-verify-object');
    if (formVerif) {
      formVerif.addEventListener('submit', (e) => {
        e.preventDefault();
        this.handleVerificationSubmit();
      });
    }

    // Filter Inventaris
    const invSearch = document.getElementById('inv-search');
    const invArea = document.getElementById('inv-filter-area');
    const invType = document.getElementById('inv-filter-type');
    const invStatus = document.getElementById('inv-filter-status');
    const invReset = document.getElementById('inv-btn-reset-filter');

    if (invSearch) {
      invSearch.addEventListener('input', (e) => {
        this.inventoryFilters.search = e.target.value.toLowerCase();
        this.renderInventory();
      });
    }
    if (invArea) {
      invArea.addEventListener('change', (e) => {
        this.inventoryFilters.area = e.target.value;
        this.renderInventory();
      });
    }
    if (invType) {
      invType.addEventListener('change', (e) => {
        this.inventoryFilters.type = e.target.value;
        this.renderInventory();
      });
    }
    if (invStatus) {
      invStatus.addEventListener('change', (e) => {
        this.inventoryFilters.status = e.target.value;
        this.renderInventory();
      });
    }
    if (invReset) {
      invReset.addEventListener('click', () => this.resetInventoryFilters());
    }

    // Filter Peta
    const mapArea = document.getElementById('map-filter-area');
    const mapPrio = document.getElementById('map-filter-priority');
    const mapReset = document.getElementById('map-btn-reset-filter');

    if (mapArea) {
      mapArea.addEventListener('change', (e) => {
        this.mapFilters.area = e.target.value;
        this.renderMap();
      });
    }
    if (mapPrio) {
      mapPrio.addEventListener('change', (e) => {
        this.mapFilters.priority = e.target.value;
        this.renderMap();
      });
    }
    if (mapReset) {
      mapReset.addEventListener('click', () => {
        if (mapArea) mapArea.value = '';
        if (mapPrio) mapPrio.value = '';
        this.mapFilters = { area: '', priority: '' };
        this.renderMap();
      });
    }

    // Filter Temuan Anomali
    const fRule = document.getElementById('findings-filter-rule');
    const fPrio = document.getElementById('findings-filter-priority');
    const fStatus = document.getElementById('findings-filter-status');
    const fReset = document.getElementById('findings-btn-reset-filter');

    if (fRule) {
      fRule.addEventListener('change', (e) => {
        this.findingsFilters.rule = e.target.value;
        this.renderFindings();
      });
    }
    if (fPrio) {
      fPrio.addEventListener('change', (e) => {
        this.findingsFilters.priority = e.target.value;
        this.renderFindings();
      });
    }
    if (fStatus) {
      fStatus.addEventListener('change', (e) => {
        this.findingsFilters.status = e.target.value;
        this.renderFindings();
      });
    }
    if (fReset) {
      fReset.addEventListener('click', () => {
        if (fRule) fRule.value = '';
        if (fPrio) fPrio.value = '';
        if (fStatus) fStatus.value = '';
        this.findingsFilters = { rule: '', priority: '', status: '' };
        this.renderFindings();
      });
    }

    // Filter Prioritas
    const pCat = document.getElementById('prio-filter-category');
    const pVerif = document.getElementById('prio-filter-verif');
    const pReset = document.getElementById('prio-btn-reset-filter');

    if (pCat) {
      pCat.addEventListener('change', (e) => {
        this.priorityFilters.category = e.target.value;
        this.renderPriority();
      });
    }
    if (pVerif) {
      pVerif.addEventListener('change', (e) => {
        this.priorityFilters.status = e.target.value;
        this.renderPriority();
      });
    }
    if (pReset) {
      pReset.addEventListener('click', () => {
        if (pCat) pCat.value = '';
        if (pVerif) pVerif.value = '';
        this.priorityFilters = { category: '', status: '' };
        this.renderPriority();
      });
    }

    // Setup Impor Drag-and-Drop & File Picker
    this.setupImportHandlers();
  }

  /* -------------------------------------------------------------------------
     SETUP IMPOR DATA & VALIDASI CSV
     ------------------------------------------------------------------------- */
  setupImportHandlers() {
    const dropzone = document.getElementById('csv-dropzone');
    const fileInput = document.getElementById('csv-file-input');
    const cancelBtn = document.getElementById('btn-cancel-import');
    const confirmBtn = document.getElementById('btn-confirm-activate-import');
    const modalConfirm = document.getElementById('modal-confirm-import');
    const modalProceedBtn = document.getElementById('btn-modal-import-proceed');
    const modalCancelBtn = document.getElementById('btn-modal-import-cancel');
    const modalCloseBtn = document.getElementById('btn-modal-import-close');

    if (dropzone && fileInput) {
      dropzone.addEventListener('dragover', (e) => {
        e.preventDefault();
        dropzone.classList.add('dragover');
      });

      dropzone.addEventListener('dragleave', () => {
        dropzone.classList.remove('dragover');
      });

      dropzone.addEventListener('drop', (e) => {
        e.preventDefault();
        dropzone.classList.remove('dragover');
        if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
          this.processCSVFile(e.dataTransfer.files[0]);
        }
      });

      fileInput.addEventListener('change', (e) => {
        if (e.target.files && e.target.files.length > 0) {
          this.processCSVFile(e.target.files[0]);
        }
      });
    }

    if (cancelBtn) {
      cancelBtn.addEventListener('click', () => {
        this.stagedImport = null;
        document.getElementById('import-validation-section').classList.add('hidden');
        if (fileInput) fileInput.value = '';
        this.showToast('Proses impor dibatalkan.', 'warning');
      });
    }

    if (confirmBtn) {
      confirmBtn.addEventListener('click', () => {
        if (!this.stagedImport) return;
        document.getElementById('modal-import-filename').innerText = this.stagedImport.filename;
        document.getElementById('modal-import-count').innerText = this.stagedImport.validation.acceptedCount;
        modalConfirm.classList.add('active');
      });
    }

    if (modalCloseBtn) modalCloseBtn.addEventListener('click', () => modalConfirm.classList.remove('active'));
    if (modalCancelBtn) modalCancelBtn.addEventListener('click', () => modalConfirm.classList.remove('active'));

    if (modalProceedBtn) {
      modalProceedBtn.addEventListener('click', () => {
        if (!this.stagedImport) return;
        modalConfirm.classList.remove('active');

        const newId = `DS-BDL-${Date.now().toString().slice(-4)}`;
        const newLabel = `Impor Mandiri (${this.stagedImport.filename})`;

        window.padStore.activateDataset(
          newId,
          newLabel,
          this.stagedImport.filename,
          this.stagedImport.validation.acceptedRows
        );

        this.stagedImport = null;
        document.getElementById('import-validation-section').classList.add('hidden');
        if (fileInput) fileInput.value = '';

        this.showToast(`Dataset ${newLabel} berhasil diaktifkan!`, 'success');
        this.navigate('dashboard');
      });
    }
  }

  processCSVFile(file) {
    if (!file.name.toLowerCase().endsWith('.csv')) {
      alert('Format file harus berupa CSV (.csv).');
      return;
    }

    const reader = new FileReader();
    reader.onload = (e) => {
      const csvText = e.target.result;
      const parsed = window.padStore.parseCSV(csvText);
      const validation = window.padStore.validateCSV(parsed);

      this.stagedImport = {
        filename: file.name,
        rawText: csvText,
        validation: validation
      };

      this.renderImportValidationPreview();
    };
    reader.readAsText(file);
  }

  renderImportValidationPreview() {
    if (!this.stagedImport) return;

    const valSec = document.getElementById('import-validation-section');
    const namePreview = document.getElementById('import-filename-preview');
    const totalEl = document.getElementById('val-total-rows');
    const accEl = document.getElementById('val-accepted-rows');
    const revEl = document.getElementById('val-review-rows');
    const rejEl = document.getElementById('val-rejected-rows');
    const critBox = document.getElementById('val-critical-error-box');
    const tableBody = document.getElementById('import-preview-table-body');
    const confirmBtn = document.getElementById('btn-confirm-activate-import');

    valSec.classList.remove('hidden');
    namePreview.innerText = this.stagedImport.filename;

    const val = this.stagedImport.validation;
    totalEl.innerText = val.totalRows;
    accEl.innerText = val.acceptedCount;
    revEl.innerText = val.reviewCount;
    rejEl.innerText = val.rejectedCount;

    if (!val.isValid && val.criticalError) {
      critBox.classList.remove('hidden');
      critBox.innerText = `Kesalahan Validasi: ${val.criticalError}`;
      if (confirmBtn) confirmBtn.disabled = true;
    } else {
      critBox.classList.add('hidden');
      if (confirmBtn) confirmBtn.disabled = false;
    }

    // Render 10 baris sampel pratinjau
    const sampleRows = val.sampleRows || [];
    if (sampleRows.length === 0) {
      tableBody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-outline">Tidak ada baris data untuk ditampilkan.</td></tr>`;
      return;
    }

    tableBody.innerHTML = sampleRows.map((row, idx) => {
      // Cari status baris dari validation
      const isRej = val.rejectedRows.some(r => r.rowNumber === row._rawRowNumber);
      const isRev = val.reviewRows.some(r => r.rowNumber === row._rawRowNumber);
      let statusBadge = '<span class="badge badge-clean">Valid</span>';
      let note = 'Format data memenuhi skema.';

      if (isRej) {
        statusBadge = '<span class="badge badge-high">Ditolak</span>';
        const err = val.rejectedRows.find(r => r.rowNumber === row._rawRowNumber);
        note = err ? err.reasons.join(', ') : 'Baris rusak';
      } else if (isRev) {
        statusBadge = '<span class="badge badge-medium">Perlu Ditinjau</span>';
        const rev = val.reviewRows.find(r => r.rowNumber === row._rawRowNumber);
        note = rev ? rev.reasons.join(', ') : 'Ada ketidaklengkapan';
      }

      return `
        <tr>
          <td class="data-tabular">${row._rawRowNumber || idx + 1}</td>
          <td>${statusBadge}</td>
          <td class="data-tabular font-medium">${row.object_id || '<span class="text-error italic">(Kosong)</span>'}</td>
          <td>${row.object_name || '<span class="text-outline italic">(Belum terisi)</span>'}</td>
          <td>${row.area || '-'}</td>
          <td>${row.reklame_type || '-'}</td>
          <td class="data-tabular">${row.size || '-'} ${row.size_unit || ''}</td>
          <td class="text-xs text-on-surface-variant">${note}</td>
        </tr>
      `;
    }).join('');
  }

  async loadPreset(name) {
    this.showToast(`Memuat preset: ${name}...`, 'info');
    const res = await window.padStore.loadPresetByName(name);
    if (res.success) {
      this.showToast(`Preset "${name}" berhasil diaktifkan.`, 'success');
      this.navigate('dashboard');
    } else {
      this.showToast(`Gagal memuat preset: ${res.error}`, 'error');
    }
  }

  /* -------------------------------------------------------------------------
     RENDER SELURUH TAMPILAN (REAKTIF TERHADAP STORE)
     ------------------------------------------------------------------------- */
  renderAll() {
    this.renderHeader();
    this.renderDashboard();
    this.renderInventory();
    this.renderMap();
    this.renderFindings();
    this.renderPriority();
    this.renderVerification();
    this.renderReports();
    this.renderSavedDatasets();
  }

  renderHeader() {
    const ds = window.padStore.activeDataset;
    const nameEl = document.getElementById('header-dataset-name');
    if (nameEl) {
      nameEl.innerText = ds ? `${ds.label} (${ds.totalRows} objek)` : 'Tidak ada dataset aktif';
    }

    // Badge counter di sidebar
    const findingsBadge = document.getElementById('sidebar-findings-count');
    const priorityBadge = document.getElementById('sidebar-priority-count');

    const analysis = window.padStore.analysisResult;
    if (analysis && analysis.stats) {
      if (findingsBadge) {
        findingsBadge.innerText = analysis.stats.totalFindings;
        if (analysis.stats.totalFindings > 0) findingsBadge.classList.remove('hidden');
        else findingsBadge.classList.add('hidden');
      }
      if (priorityBadge) {
        priorityBadge.innerText = analysis.stats.highPriorityCount;
        if (analysis.stats.highPriorityCount > 0) priorityBadge.classList.remove('hidden');
        else priorityBadge.classList.add('hidden');
      }
    }
  }

  renderDashboard() {
    const ds = window.padStore.activeDataset;
    const analysis = window.padStore.analysisResult;
    const totalObjs = ds ? ds.totalRows : 0;

    // Metrik KPI
    const totalObjEl = document.getElementById('kpi-total-objects');
    const complEl = document.getElementById('kpi-completeness');
    const complBar = document.getElementById('kpi-completeness-bar');
    const findEl = document.getElementById('kpi-total-findings');
    const needRevEl = document.getElementById('kpi-need-review');
    const verifProgEl = document.getElementById('kpi-verif-progress');
    const verifCountEl = document.getElementById('kpi-verif-count');
    const verifBar = document.getElementById('kpi-verif-bar');
    const validCoordsEl = document.getElementById('kpi-valid-coords');
    const coordsCountEl = document.getElementById('kpi-coords-count');

    const completeness = window.padStore.calculateCompleteness();
    const verifProgress = window.padStore.getVerificationProgress();
    const coordStats = window.padStore.getCoordinateStats();

    if (totalObjEl) totalObjEl.innerText = totalObjs;
    if (complEl) complEl.innerText = `${completeness}%`;
    if (complBar) complBar.style.width = `${completeness}%`;
    if (findEl) findEl.innerText = analysis ? analysis.stats.totalFindings : 0;
    if (needRevEl) needRevEl.innerText = verifProgress.pendingCount;

    if (verifProgEl) verifProgEl.innerText = `${verifProgress.percentage}%`;
    if (verifCountEl) verifCountEl.innerText = `${verifProgress.verifiedCount} dari ${verifProgress.total} selesai`;
    if (verifBar) verifBar.style.width = `${verifProgress.percentage}%`;

    if (validCoordsEl) validCoordsEl.innerText = `${coordStats.validPercentage}%`;
    if (coordsCountEl) coordsCountEl.innerText = `${coordStats.valid} terpetakan di BDL`;

    // Grafik Distribusi Aturan (SVG Bar)
    if (analysis && analysis.stats) {
      window.Charts.renderRuleDistribution(
        'chart-rule-distribution',
        analysis.stats.ruleCounts,
        analysis.stats.totalFindings
      );
    }

    // Grafik Donut Status Verifikasi
    const verifStats = {
      pending: verifProgress.pendingCount,
      inProgress: verifProgress.inProgressCount,
      confirmed: (ds?.items || []).filter(i => i.verification_status === 'terkonfirmasi_masalah').length,
      notProven: (ds?.items || []).filter(i => i.verification_status === 'tidak_terbukti' || i.verification_status === 'terbukti_sesuai').length
    };
    window.Charts.renderVerificationDonut('chart-verification-donut', verifStats);

    // Metadata Dashboard
    const metaId = document.getElementById('dash-meta-id');
    const metaFile = document.getElementById('dash-meta-file');
    const metaTime = document.getElementById('dash-meta-time');
    if (metaId) metaId.innerText = ds ? ds.id : '-';
    if (metaFile) metaFile.innerText = ds ? ds.filename : '-';
    if (metaTime) metaTime.innerText = ds ? new Date(ds.importedAt).toLocaleTimeString('id-ID', { hour: '2-digit', minute: '2-digit' }) + ' WIB' : '-';

    // Tabel Prioritas Teratas di Dashboard (Top 5)
    const topTable = document.getElementById('dashboard-priority-table-body');
    if (topTable && analysis && analysis.priorityList) {
      const top5 = analysis.priorityList.slice(0, 5);
      if (top5.length === 0) {
        topTable.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-outline">Tidak ada antrean prioritas.</td></tr>`;
      } else {
        topTable.innerHTML = top5.map(entry => `
          <tr>
            <td>
              <div class="font-bold text-xs text-primary">${entry.item.object_id || '<span class="text-error italic">ID Kosong</span>'}</div>
              <div class="text-xs text-outline truncate max-w-[180px]">${entry.item.object_name || 'Tanpa Nama'}</div>
            </td>
            <td class="text-xs">${entry.item.area || '-'}</td>
            <td><span class="badge badge-${this.getBadgeClass(entry.priority)}">${entry.priority}</span></td>
            <td class="text-xs text-on-surface-variant max-w-[220px] truncate" title="${entry.reason}">${entry.reason}</td>
            <td><span class="badge ${this.getVerifBadgeClass(entry.item.verification_status)}">${this.formatVerifStatus(entry.item.verification_status)}</span></td>
            <td style="text-align: right;">
              <button class="btn btn-secondary btn-sm" onclick="window.app.openObjectDrawer('${entry.item.object_id}')">
                Periksa
              </button>
            </td>
          </tr>
        `).join('');
      }
    }
  }

  renderInventory() {
    const ds = window.padStore.activeDataset;
    const tbody = document.getElementById('inventory-table-body');
    const emptyState = document.getElementById('inv-empty-state');
    const showingCount = document.getElementById('inv-showing-count');
    const totalCount = document.getElementById('inv-total-count');

    if (!ds || !ds.items || ds.items.length === 0) {
      if (tbody) tbody.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      if (showingCount) showingCount.innerText = '0';
      if (totalCount) totalCount.innerText = '0';
      return;
    }

    if (totalCount) totalCount.innerText = ds.items.length;

    // Terapkan filter
    const filtered = ds.items.filter(item => {
      // Search text
      if (this.inventoryFilters.search) {
        const q = this.inventoryFilters.search;
        const matchId = String(item.object_id || '').toLowerCase().includes(q);
        const matchName = String(item.object_name || '').toLowerCase().includes(q);
        const matchArea = String(item.area || '').toLowerCase().includes(q);
        if (!matchId && !matchName && !matchArea) return false;
      }
      // Area
      if (this.inventoryFilters.area && item.area !== this.inventoryFilters.area) {
        return false;
      }
      // Type
      if (this.inventoryFilters.type && item.reklame_type !== this.inventoryFilters.type) {
        return false;
      }
      // Verification status
      if (this.inventoryFilters.status && item.verification_status !== this.inventoryFilters.status) {
        return false;
      }
      return true;
    });

    if (showingCount) showingCount.innerText = filtered.length;

    if (filtered.length === 0) {
      if (tbody) tbody.innerHTML = '';
      if (emptyState) emptyState.classList.remove('hidden');
      return;
    }

    if (emptyState) emptyState.classList.add('hidden');

    const analysis = window.padStore.analysisResult;
    const findingsMap = analysis ? analysis.itemFindingsMap : {};

    tbody.innerHTML = filtered.map(item => {
      const objKey = item.object_id || '';
      const findings = findingsMap[objKey] || [];
      const hasFindings = findings.length > 0;

      const hasCoords = item.latitude && item.longitude && !isNaN(parseFloat(item.latitude));
      const coordsText = hasCoords 
        ? `<span class="data-tabular text-xs text-outline">${parseFloat(item.latitude).toFixed(3)}, ${parseFloat(item.longitude).toFixed(3)}</span>`
        : `<span class="badge badge-neutral text-[10px]">Belum Ada</span>`;

      return `
        <tr>
          <td class="data-tabular font-bold text-primary">${item.object_id || '<span class="text-error italic">ID Kosong</span>'}</td>
          <td>
            <div class="font-medium text-xs text-on-surface">${item.object_name || '<span class="text-outline italic">Tanpa Nama</span>'}</div>
          </td>
          <td class="text-xs">${item.area || '-'}</td>
          <td class="text-xs">${item.reklame_type || '-'}</td>
          <td class="data-tabular text-xs">${item.size || '-'} ${item.size_unit || ''}</td>
          <td>
            <span class="badge ${item.administrative_status ? 'badge-neutral' : 'badge-medium'}">
              ${item.administrative_status || 'Belum Diisi'}
            </span>
          </td>
          <td>
            <span class="badge ${this.getVerifBadgeClass(item.verification_status)}">
              ${this.formatVerifStatus(item.verification_status)}
            </span>
          </td>
          <td>${coordsText}</td>
          <td>
            ${hasFindings 
              ? `<span class="badge badge-high" title="${findings.map(f => f.rule_code).join(', ')}">${findings.length} Anomali</span>` 
              : `<span class="badge badge-clean">Bersih</span>`}
          </td>
          <td style="text-align: right;">
            <button class="btn btn-secondary btn-sm" onclick="window.app.openObjectDrawer('${item.object_id}')">
              <span class="material-symbols-outlined text-xs">visibility</span>
              Detail
            </button>
          </td>
        </tr>
      `;
    }).join('');
  }

  resetInventoryFilters() {
    const invSearch = document.getElementById('inv-search');
    const invArea = document.getElementById('inv-filter-area');
    const invType = document.getElementById('inv-filter-type');
    const invStatus = document.getElementById('inv-filter-status');

    if (invSearch) invSearch.value = '';
    if (invArea) invArea.value = '';
    if (invType) invType.value = '';
    if (invStatus) invStatus.value = '';

    this.inventoryFilters = { search: '', area: '', type: '', status: '' };
    this.renderInventory();
  }

  renderMap() {
    if (!this.mapInstance) return;

    const ds = window.padStore.activeDataset;
    if (!ds || !ds.items) {
      this.mapInstance.updateMarkers([], {});
      return;
    }

    const analysis = window.padStore.analysisResult;
    const priorityMap = {};
    if (analysis && analysis.priorityList) {
      analysis.priorityList.forEach(p => {
        if (p.item.object_id) priorityMap[p.item.object_id] = p;
      });
    }

    // Filter objek untuk peta
    const filtered = ds.items.filter(item => {
      if (this.mapFilters.area && item.area !== this.mapFilters.area) return false;
      if (this.mapFilters.priority) {
        const p = priorityMap[item.object_id]?.priority || 'Tanpa Masalah';
        if (p !== this.mapFilters.priority) return false;
      }
      return true;
    });

    this.mapInstance.updateMarkers(filtered, priorityMap);
  }

  renderFindings() {
    const analysis = window.padStore.analysisResult;
    const tbody = document.getElementById('findings-table-body');
    const totalStat = document.getElementById('findings-total-stat');
    const structStat = document.getElementById('findings-struct-stat');
    const attrStat = document.getElementById('findings-attr-stat');
    const coordStat = document.getElementById('findings-coord-stat');

    if (!analysis || !analysis.findings) {
      if (tbody) tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-outline">Tidak ada temuan anomali.</td></tr>`;
      return;
    }

    const counts = analysis.stats.ruleCounts || {};
    if (totalStat) totalStat.innerText = analysis.stats.totalFindings;
    if (structStat) structStat.innerText = (counts['RULE-01'] || 0) + (counts['RULE-02'] || 0);
    if (attrStat) attrStat.innerText = (counts['RULE-03'] || 0) + (counts['RULE-06'] || 0);
    if (coordStat) coordStat.innerText = (counts['RULE-05'] || 0) + (counts['RULE-07'] || 0);

    // Filter temuan
    const filtered = analysis.findings.filter(f => {
      if (this.findingsFilters.rule && f.rule_code !== this.findingsFilters.rule) return false;
      if (this.findingsFilters.priority && f.category !== this.findingsFilters.priority) return false;
      if (this.findingsFilters.status && f.review_status !== this.findingsFilters.status) return false;
      return true;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-outline">Tidak ada temuan yang sesuai filter yang dipilih.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map(f => `
      <tr>
        <td class="data-tabular font-bold text-xs text-primary">${f.id}</td>
        <td>
          <a href="javascript:void(0)" onclick="window.app.openObjectDrawer('${f.object_id}')" class="font-semibold text-xs text-secondary hover:underline">
            ${f.object_id}
          </a>
        </td>
        <td><span class="badge badge-neutral font-mono">${f.rule_code}</span></td>
        <td><span class="badge badge-${this.getBadgeClass(f.category)}">${f.category}</span></td>
        <td class="text-xs text-on-surface leading-snug max-w-xs">${f.reason}</td>
        <td class="text-xs text-outline font-mono">${Array.isArray(f.triggered_fields) ? f.triggered_fields.join(', ') : f.triggered_fields}</td>
        <td><span class="badge ${this.getReviewStatusBadge(f.review_status)}">${this.formatReviewStatus(f.review_status)}</span></td>
        <td style="text-align: right;">
          <button class="btn btn-secondary btn-sm" onclick="window.app.openObjectDrawer('${f.object_id}')">
            Tinjau
          </button>
        </td>
      </tr>
    `).join('');
  }

  renderPriority() {
    const analysis = window.padStore.analysisResult;
    const tbody = document.getElementById('priority-table-body');
    const totalCount = document.getElementById('prio-total-count');
    const highCount = document.getElementById('prio-high-count');
    const medCount = document.getElementById('prio-med-count');
    const revCount = document.getElementById('prio-rev-count');

    if (!analysis || !analysis.priorityList) {
      if (tbody) tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-outline">Tidak ada antrean prioritas.</td></tr>`;
      return;
    }

    const pList = analysis.priorityList.filter(p => p.priority !== 'Tanpa Masalah');

    if (totalCount) totalCount.innerText = pList.length;
    if (highCount) highCount.innerText = analysis.stats.highPriorityCount;
    if (medCount) medCount.innerText = analysis.stats.mediumPriorityCount;
    if (revCount) revCount.innerText = analysis.stats.reviewPriorityCount;

    // Filter
    const filtered = pList.filter(entry => {
      if (this.priorityFilters.category && entry.priority !== this.priorityFilters.category) return false;
      if (this.priorityFilters.status && entry.item.verification_status !== this.priorityFilters.status) return false;
      return true;
    });

    if (filtered.length === 0) {
      tbody.innerHTML = `<tr><td colspan="8" class="text-center py-4 text-outline">Tidak ada objek yang sesuai kriteria filter prioritas.</td></tr>`;
      return;
    }

    tbody.innerHTML = filtered.map((entry, idx) => `
      <tr>
        <td class="data-tabular text-center text-outline">${idx + 1}</td>
        <td>
          <div class="font-bold text-xs text-primary">${entry.item.object_id || '<span class="text-error italic">ID Kosong</span>'}</div>
          <div class="text-xs text-outline truncate max-w-[200px]">${entry.item.object_name || 'Tanpa Nama'}</div>
        </td>
        <td class="text-xs">${entry.item.area || '-'}</td>
        <td><span class="badge badge-${this.getBadgeClass(entry.priority)}">${entry.priority}</span></td>
        <td class="text-xs text-on-surface-variant max-w-sm">${entry.reason}</td>
        <td class="data-tabular text-center font-semibold text-xs">${entry.triggerCount} aturan</td>
        <td><span class="badge ${this.getVerifBadgeClass(entry.item.verification_status)}">${this.formatVerifStatus(entry.item.verification_status)}</span></td>
        <td style="text-align: right;">
          <button class="btn btn-primary btn-sm" onclick="window.app.openObjectDrawer('${entry.item.object_id}')">
            Verifikasi
          </button>
        </td>
      </tr>
    `).join('');
  }

  renderVerification() {
    const verifProgress = window.padStore.getVerificationProgress();
    const percentEl = document.getElementById('verif-summary-percent');
    const barEl = document.getElementById('verif-summary-bar');
    const doneEl = document.getElementById('verif-done-count');
    const activeEl = document.getElementById('verif-active-count');
    const pendingEl = document.getElementById('verif-pending-count');

    if (percentEl) percentEl.innerText = `${verifProgress.percentage}%`;
    if (barEl) barEl.style.width = `${verifProgress.percentage}%`;
    if (doneEl) doneEl.innerText = verifProgress.verifiedCount;
    if (activeEl) activeEl.innerText = verifProgress.inProgressCount;
    if (pendingEl) pendingEl.innerText = verifProgress.pendingCount;

    // Tabel Log Audit Riwayat Verifikasi (Append-Only)
    const tbody = document.getElementById('verification-log-table-body');
    const logs = [...(window.padStore.verificationLog || [])].reverse();

    if (tbody) {
      if (logs.length === 0) {
        tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-outline">Belum ada riwayat verifikasi yang dicatat. Buka salah satu objek untuk memperbarui status.</td></tr>`;
      } else {
        tbody.innerHTML = logs.map(l => `
          <tr>
            <td class="data-tabular text-xs">${new Date(l.verified_at).toLocaleString('id-ID')}</td>
            <td class="font-bold text-xs text-primary">${l.object_id}</td>
            <td><span class="badge badge-neutral">${this.formatVerifStatus(l.status_before)}</span></td>
            <td><span class="badge ${this.getVerifBadgeClass(l.status_after)}">${this.formatVerifStatus(l.status_after)}</span></td>
            <td class="text-xs text-on-surface-variant max-w-sm">${l.notes}</td>
            <td class="text-xs text-outline">${l.verified_by}</td>
          </tr>
        `).join('');
      }
    }
  }

  renderReports() {
    const ds = window.padStore.activeDataset;
    const analysis = window.padStore.analysisResult;
    const completeness = window.padStore.calculateCompleteness();
    const coordStats = window.padStore.getCoordinateStats();
    const verifProgress = window.padStore.getVerificationProgress();

    const repDsId = document.getElementById('rep-dataset-id');
    const repTotalObjs = document.getElementById('rep-total-objects');
    const repCompl = document.getElementById('rep-completeness');
    const repCoords = document.getElementById('rep-valid-coords');
    const repFind = document.getElementById('rep-total-findings');
    const repHigh = document.getElementById('rep-high-findings');
    const repDone = document.getElementById('rep-verified-count');
    const repProg = document.getElementById('rep-verif-progress');

    if (repDsId) repDsId.innerText = ds ? ds.id : '-';
    if (repTotalObjs) repTotalObjs.innerText = ds ? ds.totalRows : 0;
    if (repCompl) repCompl.innerText = `${completeness}%`;
    if (repCoords) repCoords.innerText = `${coordStats.valid} dari ${coordStats.total} (${coordStats.validPercentage}%)`;

    if (repFind) repFind.innerText = analysis ? analysis.stats.totalFindings : 0;
    if (repHigh) repHigh.innerText = analysis ? analysis.stats.highPriorityCount : 0;
    if (repDone) repDone.innerText = `${verifProgress.verifiedCount} objek`;
    if (repProg) repProg.innerText = `${verifProgress.percentage}%`;
  }

  renderSavedDatasets() {
    const tbody = document.getElementById('saved-datasets-table-body');
    if (!tbody) return;

    const datasets = window.padStore.savedDatasets || [];
    const activeId = window.padStore.activeDataset?.id;

    if (datasets.length === 0) {
      tbody.innerHTML = `<tr><td colspan="6" class="text-center py-4 text-outline">Belum ada dataset yang tercatat di riwayat.</td></tr>`;
      return;
    }

    tbody.innerHTML = datasets.map(d => {
      const isActive = d.id === activeId;
      return `
        <tr>
          <td class="data-tabular font-bold text-primary">${d.id}</td>
          <td class="font-medium text-xs">${d.label}</td>
          <td class="text-xs text-outline">${d.filename}</td>
          <td class="data-tabular text-xs">${new Date(d.importedAt).toLocaleString('id-ID')}</td>
          <td class="data-tabular text-xs">${d.totalRows} baris</td>
          <td>
            ${isActive 
              ? '<span class="badge badge-clean">Aktif</span>' 
              : `<button class="btn btn-outline btn-sm text-xs" onclick="window.app.loadPreset('${d.id}')">Aktifkan</button>`}
          </td>
        </tr>
      `;
    }).join('');
  }

  /* -------------------------------------------------------------------------
     DRAWER DETAIL OBJEK & FORM VERIFIKASI
     ------------------------------------------------------------------------- */
  openObjectDrawer(objectId) {
    const ds = window.padStore.activeDataset;
    if (!ds || !ds.items) return;

    const item = ds.items.find(it => it.object_id === objectId);
    if (!item) return;

    this.selectedObjectId = objectId;

    // Header Drawer
    document.getElementById('drawer-object-id').innerText = item.object_id || '(ID Kosong)';
    document.getElementById('drawer-object-name').innerText = item.object_name || '(Nama belum terisi)';

    // Tab Atribut Sumber
    document.getElementById('drw-area').innerText = item.area || 'Belum tersedia';
    document.getElementById('drw-type').innerText = item.reklame_type || 'Belum tersedia';
    document.getElementById('drw-size').innerText = item.size ? `${item.size} ${item.size_unit || 'm2'}` : 'Belum tersedia';
    document.getElementById('drw-admin-status').innerHTML = item.administrative_status 
      ? `<span class="badge badge-neutral">${item.administrative_status}</span>`
      : `<span class="badge badge-medium">Belum Diisi</span>`;
    document.getElementById('drw-recorded').innerText = item.recorded_at || 'Belum tersedia';
    document.getElementById('drw-verif-badge').innerHTML = `
      <span class="badge ${this.getVerifBadgeClass(item.verification_status)}">
        ${this.formatVerifStatus(item.verification_status)}
      </span>
    `;

    // Tab Koordinat
    const coordsBox = document.getElementById('drw-coords-box');
    const hasLat = item.latitude !== undefined && item.latitude !== null && String(item.latitude).trim() !== '';
    const hasLon = item.longitude !== undefined && item.longitude !== null && String(item.longitude).trim() !== '';

    if (!hasLat && !hasLon) {
      coordsBox.innerHTML = `
        <div class="text-outline italic">Koordinat belum tersedia untuk objek reklame ini.</div>
        <div class="text-[11px] text-outline mt-1">Objek tetap tercatat dalam inventaris dan dapat diverifikasi melalui survei lapangan.</div>
      `;
    } else {
      const lat = parseFloat(item.latitude);
      const lon = parseFloat(item.longitude);
      const isValid = !isNaN(lat) && !isNaN(lon) && lat >= -5.60 && lat <= -5.20 && lon >= 105.10 && lon <= 105.45;

      coordsBox.innerHTML = `
        <div class="flex justify-between py-1">
          <span class="text-outline">Latitude:</span>
          <span class="data-tabular font-medium">${item.latitude}</span>
        </div>
        <div class="flex justify-between py-1 border-t">
          <span class="text-outline">Longitude:</span>
          <span class="data-tabular font-medium">${item.longitude}</span>
        </div>
        <div class="flex justify-between py-1 border-t items-center mt-1">
          <span class="text-outline">Validitas Wilayah BDL:</span>
          <span>${isValid ? '<span class="badge badge-clean">Valid Kota Bandar Lampung</span>' : '<span class="badge badge-high">Di Luar Batas Wilayah</span>'}</span>
        </div>
      `;
    }

    // Tab Temuan Anomali
    const analysis = window.padStore.analysisResult;
    const findings = (analysis?.itemFindingsMap?.[objectId] || []);
    const fCountEl = document.getElementById('drw-findings-count');
    const fListEl = document.getElementById('drw-findings-list');

    if (fCountEl) fCountEl.innerText = findings.length;

    if (findings.length === 0) {
      fListEl.innerHTML = `
        <div class="p-2.5 bg-emerald-50 text-emerald-800 rounded border border-emerald-200 text-xs">
          Tidak ada indikator anomali yang terpicu untuk objek ini.
        </div>
      `;
    } else {
      fListEl.innerHTML = findings.map(f => `
        <div class="p-2.5 bg-red-50 border border-red-200 rounded text-xs flex flex-col gap-1">
          <div class="flex items-center justify-between">
            <span class="font-bold text-red-900">${f.rule_code}: ${f.rule_name}</span>
            <span class="badge badge-${this.getBadgeClass(f.category)}">${f.category}</span>
          </div>
          <div class="text-on-surface">${f.reason}</div>
          <div class="text-[11px] text-outline">Atribut: ${Array.isArray(f.triggered_fields) ? f.triggered_fields.join(', ') : f.triggered_fields}</div>
        </div>
      `).join('');
    }

    // Set nilai default form verifikasi sesuai status saat ini
    const verifSelect = document.getElementById('form-verif-status');
    const verifNotes = document.getElementById('form-verif-notes');
    if (verifSelect) {
      verifSelect.value = item.verification_status && item.verification_status !== 'belum_diperiksa' 
        ? item.verification_status 
        : 'sedang_diperiksa';
    }
    if (verifNotes) verifNotes.value = '';

    // Tab Riwayat Verifikasi (Append-Only)
    this.renderDrawerHistory(objectId);

    // Buka Drawer
    document.getElementById('object-drawer-backdrop').classList.add('active');
    document.getElementById('object-drawer').classList.add('active');
  }

  closeObjectDrawer() {
    this.selectedObjectId = null;
    document.getElementById('object-drawer-backdrop').classList.remove('active');
    document.getElementById('object-drawer').classList.remove('active');
  }

  renderDrawerHistory(objectId) {
    const historyList = document.getElementById('drw-history-list');
    if (!historyList) return;

    const history = window.padStore.getObjectVerificationHistory(objectId);
    if (history.length === 0) {
      historyList.innerHTML = `<div class="text-xs text-outline italic">Belum ada riwayat verifikasi yang dicatat untuk objek ini.</div>`;
      return;
    }

    historyList.innerHTML = history.map(h => `
      <div class="p-2 bg-surface-low border rounded text-xs flex flex-col gap-1">
        <div class="flex items-center justify-between">
          <span class="badge ${this.getVerifBadgeClass(h.status_after)}">${this.formatVerifStatus(h.status_after)}</span>
          <span class="data-tabular text-[10px] text-outline">${new Date(h.verified_at).toLocaleString('id-ID')}</span>
        </div>
        <div class="text-on-surface">${h.notes}</div>
        <div class="text-[10px] text-outline">Pemeriksa: ${h.verified_by}</div>
      </div>
    `).join('');
  }

  handleVerificationSubmit() {
    if (!this.selectedObjectId) return;

    const status = document.getElementById('form-verif-status').value;
    const notes = document.getElementById('form-verif-notes').value;

    const success = window.padStore.updateObjectVerification(
      this.selectedObjectId,
      status,
      notes,
      'Pengguna Demo (Analis BAPENDA)'
    );

    if (success) {
      this.showToast(`Hasil verifikasi untuk objek ${this.selectedObjectId} berhasil disimpan.`, 'success');
      // Perbarui tampilan di drawer
      this.openObjectDrawer(this.selectedObjectId);
    } else {
      this.showToast('Gagal menyimpan hasil verifikasi.', 'error');
    }
  }

  /* -------------------------------------------------------------------------
     HELPER FORMATTING & TOAST
     ------------------------------------------------------------------------- */
  showToast(message, type = 'success') {
    const container = document.getElementById('toast-container');
    if (!container) return;

    const toast = document.createElement('div');
    toast.className = `toast toast-${type}`;
    
    let icon = 'check_circle';
    if (type === 'error') icon = 'error';
    if (type === 'warning') icon = 'warning';
    if (type === 'info') icon = 'info';

    toast.innerHTML = `
      <span class="material-symbols-outlined text-sm">${icon}</span>
      <span>${message}</span>
    `;

    container.appendChild(toast);
    setTimeout(() => {
      toast.style.opacity = '0';
      toast.style.transform = 'translateY(10px)';
      toast.style.transition = 'all 0.2s ease';
      setTimeout(() => toast.remove(), 200);
    }, 3500);
  }

  getBadgeClass(priority) {
    switch (priority) {
      case 'Tinggi': return 'high';
      case 'Sedang': return 'medium';
      case 'Perlu Ditinjau': return 'review';
      default: return 'clean';
    }
  }

  getVerifBadgeClass(status) {
    switch (status) {
      case 'terkonfirmasi_masalah': return 'badge-high';
      case 'sedang_diperiksa': return 'badge-review';
      case 'tidak_terbukti':
      case 'terbukti_sesuai': return 'badge-clean';
      case 'perlu_tindak_lanjut': return 'badge-medium';
      default: return 'badge-neutral';
    }
  }

  formatVerifStatus(status) {
    switch (status) {
      case 'terkonfirmasi_masalah': return 'Terkonfirmasi Masalah';
      case 'sedang_diperiksa': return 'Sedang Diperiksa';
      case 'tidak_terbukti': return 'Tidak Terbukti';
      case 'terbukti_sesuai': return 'Sesuai / Valid';
      case 'perlu_tindak_lanjut': return 'Perlu Tindak Lanjut';
      default: return 'Belum Diperiksa';
    }
  }

  getReviewStatusBadge(status) {
    switch (status) {
      case 'terbukti': return 'badge-high';
      case 'sedang_ditinjau': return 'badge-review';
      case 'tidak_terbukti': return 'badge-clean';
      default: return 'badge-neutral';
    }
  }

  formatReviewStatus(status) {
    switch (status) {
      case 'terbukti': return 'Terkonfirmasi';
      case 'sedang_ditinjau': return 'Sedang Ditinjau';
      case 'tidak_terbukti': return 'Tidak Terbukti';
      default: return 'Belum Ditinjau';
    }
  }
}

// Inisialisasi controller aplikasi saat DOM siap
document.addEventListener('DOMContentLoaded', () => {
  window.app = new AppController();
});
