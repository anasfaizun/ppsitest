/**
 * PAD Intelligence Lite — Modul Peta Interaktif
 * Memenuhi PRD FR-04:
 * - Hanya memetakan objek dengan koordinat valid.
 * - Objek tanpa koordinat / koordinat rusak tidak diberi penanda buatan.
 * - Penanganan anggun jika tile provider atau Leaflet gagal (fallback schematic).
 * - Popup interaktif dengan tautan langsung ke Drawer Detail Objek.
 */

class ReklameMap {
  constructor(containerId = 'leaflet-map-container') {
    this.containerId = containerId;
    this.map = null;
    this.markersLayer = null;
    this.isLeafletLoaded = false;
    this.defaultCenter = [-5.4294, 105.2625]; // Pusat Kota Bandar Lampung (Tugu Adipura)
    this.defaultZoom = 13;
  }

  init() {
    const container = document.getElementById(this.containerId);
    if (!container) return;

    if (typeof L === 'undefined') {
      console.warn('Leaflet tidak terdeteksi di window. Mengaktifkan mode fallback.');
      this.renderFallback(container, 'Pustaka peta (Leaflet) tidak tersedia atau koneksi terputus.');
      return;
    }

    try {
      if (this.map) {
        this.map.remove();
        this.map = null;
      }

      this.map = L.map(this.containerId, {
        center: this.defaultCenter,
        zoom: this.defaultZoom,
        zoomControl: true
      });

      const tileLayer = L.tileLayer('https://{s}.tile.openstreetmap.org/{z}/{x}/{y}.png', {
        attribution: '&copy; <a href="https://www.openstreetmap.org/copyright">OpenStreetMap</a> contributors | Data Simulasi BAPENDA BDL',
        maxZoom: 18,
        minZoom: 11
      });

      tileLayer.on('tileerror', (error) => {
        console.warn('Gagal memuat tile peta OpenStreetMap:', error);
        this.showTileWarning();
      });

      tileLayer.addTo(this.map);
      this.markersLayer = L.layerGroup().addTo(this.map);
      this.isLeafletLoaded = true;

      // Invalidate size setelah DOM siap
      setTimeout(() => {
        if (this.map) this.map.invalidateSize();
      }, 250);
    } catch (err) {
      console.error('Error saat inisialisasi Leaflet map:', err);
      this.renderFallback(container, 'Gagal menginisialisasi peta. Menampilkan data tabular.');
    }
  }

  showTileWarning() {
    const banner = document.getElementById('map-tile-warning-banner');
    if (banner) banner.classList.remove('hidden');
  }

  renderFallback(container, reason) {
    container.innerHTML = `
      <div class="map-fallback-view">
        <span class="material-symbols-outlined text-outline" style="font-size: 40px;">map_off</span>
        <h4 class="text-base font-semibold text-on-surface mt-2">Layanan Peta Tidak Tersedia</h4>
        <p class="text-sm text-outline mt-1 max-w-md text-center">${reason}</p>
        <p class="text-xs text-outline mt-3">Seluruh objek tetap dapat ditinjau melalui tabel Inventaris Reklame.</p>
        <button class="btn btn-secondary mt-4" onclick="window.app.navigate('inventaris')">
          <span class="material-symbols-outlined text-sm">table_view</span>
          Buka Inventaris Reklame
        </button>
      </div>
    `;
  }

  /**
   * Memperbarui marker pada peta berdasarkan filter aktif
   */
  updateMarkers(items, priorityMap = {}) {
    if (!this.map || !this.markersLayer) return;

    this.markersLayer.clearLayers();

    const validItems = [];
    const invalidItems = [];

    items.forEach(item => {
      const lat = parseFloat(item.latitude);
      const lon = parseFloat(item.longitude);

      const isValidLat = !isNaN(lat) && lat >= -5.60 && lat <= -5.20;
      const isValidLon = !isNaN(lon) && lon >= 105.10 && lon <= 105.45;

      if (isValidLat && isValidLon) {
        validItems.push({ item, lat, lon });
      } else {
        invalidItems.push(item);
      }
    });

    // Render penanda untuk objek valid
    const bounds = [];
    validItems.forEach(({ item, lat, lon }) => {
      const pInfo = priorityMap[item.object_id] || { priority: 'Tanpa Masalah' };
      const markerColor = this.getMarkerColor(pInfo.priority);

      const customIcon = L.divIcon({
        className: 'custom-map-pin',
        html: `
          <div class="pin-marker" style="background-color: ${markerColor};">
            <span class="pin-dot"></span>
          </div>
        `,
        iconSize: [24, 24],
        iconAnchor: [12, 12]
      });

      const marker = L.marker([lat, lon], { icon: customIcon });

      const popupContent = `
        <div class="map-popup-card">
          <div class="popup-header">
            <span class="popup-badge badge-${this.getBadgeClass(pInfo.priority)}">${pInfo.priority}</span>
            <span class="popup-id data-tabular">${item.object_id || 'ID Kosong'}</span>
          </div>
          <h5 class="popup-title">${item.object_name || 'Tanpa Nama'}</h5>
          <div class="popup-meta">
            <div><span class="text-outline">Wilayah:</span> ${item.area || '-'}</div>
            <div><span class="text-outline">Tipe:</span> ${item.reklame_type || '-'} (${item.size || 0} ${item.size_unit || 'm2'})</div>
            <div><span class="text-outline">Status:</span> ${item.verification_status || 'belum_diperiksa'}</div>
          </div>
          <div class="popup-coords text-xs text-outline data-tabular mt-2">
            Koordinat: ${lat.toFixed(4)}, ${lon.toFixed(4)}
          </div>
          <button class="btn btn-primary btn-sm w-full mt-3" onclick="window.app.openObjectDrawer('${item.object_id}')">
            <span class="material-symbols-outlined text-xs">visibility</span>
            Buka Detail Objek
          </button>
        </div>
      `;

      marker.bindPopup(popupContent, { maxWidth: 280, className: 'custom-leaflet-popup' });
      this.markersLayer.addLayer(marker);
      bounds.push([lat, lon]);
    });

    // Sesuaikan view jika ada marker valid
    if (bounds.length > 0) {
      this.map.fitBounds(bounds, { padding: [40, 40], maxZoom: 15 });
    } else {
      this.map.setView(this.defaultCenter, this.defaultZoom);
    }

    // Perbarui panel informasi objek tanpa koordinat
    this.updateUnmappedPanel(invalidItems);
  }

  getMarkerColor(priority) {
    switch (priority) {
      case 'Tinggi': return '#BA1A1A';
      case 'Sedang': return '#D97706';
      case 'Perlu Ditinjau': return '#2563EB';
      default: return '#059669';
    }
  }

  getBadgeClass(priority) {
    switch (priority) {
      case 'Tinggi': return 'high';
      case 'Sedang': return 'medium';
      case 'Perlu Ditinjau': return 'review';
      default: return 'clean';
    }
  }

  updateUnmappedPanel(invalidItems) {
    const countEl = document.getElementById('map-unmapped-count');
    const listEl = document.getElementById('map-unmapped-list');
    if (countEl) countEl.innerText = invalidItems.length;

    if (listEl) {
      if (invalidItems.length === 0) {
        listEl.innerHTML = `
          <div class="text-xs text-emerald-700 bg-emerald-50 p-2.5 rounded border border-emerald-200">
            Seluruh objek dalam dataset ini memiliki koordinat valid dan telah dipetakan.
          </div>
        `;
      } else {
        listEl.innerHTML = invalidItems.map(it => `
          <div class="unmapped-item-row" onclick="window.app.openObjectDrawer('${it.object_id}')">
            <div>
              <span class="font-medium text-xs text-on-surface">${it.object_id || '(ID Kosong)'}</span>
              <span class="text-xs text-outline ml-1 truncate inline-block max-w-[140px] align-bottom">${it.object_name || 'Tanpa Nama'}</span>
            </div>
            <span class="text-xs text-error font-medium">${it.latitude ? 'Format Salah' : 'Belum Ada Koordinat'}</span>
          </div>
        `).join('');
      }
    }
  }
}

window.ReklameMap = ReklameMap;
