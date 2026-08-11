import { parseRecord, getDistrictGoal, normalizarTexto, OFFICIAL_HEADERS } from './utils.js';
import { icons } from '../icons.js';
import { showModal } from './modal.js';
import { updateMetrics } from './metrics.js';
import { renderCharts, renderCapacitacionCharts } from './charts.js';

export let currentFilteredRegistrations = [];

/**
 * Main filter & render function for Overview Tab.
 * @param {Array} allRegistrations - Array of all registration row objects.
 */
export function applyFiltersAndRender(allRegistrations = []) {
  const searchInput = document.getElementById('table-search');
  const districtSelect = document.getElementById('filter-distrito');
  const roleSelect = document.getElementById('filter-rol');
  const experienceSelect = document.getElementById('filter-experiencia');
  const mobilitySelect = document.getElementById('filter-movilidad');

  const searchQuery = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const districtFilter = districtSelect ? districtSelect.value : '';
  const roleFilter = roleSelect ? roleSelect.value : '';
  const experienceFilter = experienceSelect ? experienceSelect.value : '';
  const mobilityFilter = mobilitySelect ? mobilitySelect.value : '';

  // Pre-calculate count per district across all registrations
  const distCounts = {};
  allRegistrations.forEach((r, idx) => {
    const parsed = parseRecord(r, idx);
    const d = parsed.distrito_asignado || parsed.distrito;
    if (d && d !== '-') {
      distCounts[d] = (distCounts[d] || 0) + 1;
    }
  });

  const filtered = allRegistrations.filter((r, idx) => {
    const parsed = parseRecord(r, idx);

    // 1. Search Query
    if (searchQuery) {
      const searchBlob = `
        ${parsed.id} 
        ${parsed.nombres} 
        ${parsed.dni} 
        ${parsed.celular} 
        ${parsed.correo} 
        ${parsed.whatsapp_otro}
        ${parsed.distrito} 
        ${parsed.centro} 
        ${parsed.mesa} 
        ${parsed.rol} 
        ${parsed.distrito_asignado} 
        ${parsed.centro_asignado} 
        ${parsed.mesa_asignada}
        ${parsed.fecha_registro}
      `.toLowerCase();

      if (!searchBlob.includes(searchQuery)) return false;
    }

    // 2. District Filter
    if (districtFilter === '__incompletos__') {
      const d = parsed.distrito_asignado || parsed.distrito;
      const regCount = distCounts[d] || 0;
      const goal = getDistrictGoal(d);
      if (regCount >= goal) return false;
    } else if (districtFilter) {
      const cleanFilter = normalizarTexto(districtFilter);
      const cleanAsig = normalizarTexto(parsed.distrito_asignado);
      const cleanDni = normalizarTexto(parsed.distrito);
      if (cleanAsig !== cleanFilter && cleanDni !== cleanFilter) return false;
    }

    // 3. Role Filter
    if (roleFilter) {
      if (normalizarTexto(parsed.rol) !== normalizarTexto(roleFilter)) return false;
    }

    // 4. Experience Filter
    if (experienceFilter) {
      if (normalizarTexto(parsed.experiencia) !== normalizarTexto(experienceFilter)) return false;
    }

    // 5. Mobility Filter
    if (mobilityFilter) {
      if (normalizarTexto(parsed.movilidad) !== normalizarTexto(mobilityFilter)) return false;
    }

    return true;
  });

  currentFilteredRegistrations = filtered;
  renderTableRows(filtered, allRegistrations.length);
  renderCapacitacionView(allRegistrations);
  updateMetrics(filtered, allRegistrations);
  renderCharts(filtered, districtFilter, allRegistrations);
}

/**
 * Injects row elements for filtered registrations into the DOM table body.
 * @param {Array} data - Filtered registration row objects.
 * @param {number} totalCount - Total number of registrations in the database.
 */
export function renderTableRows(data = [], totalCount = 0) {
  const tbody = document.getElementById('table-body');
  const emptyState = document.getElementById('table-empty');
  if (!tbody || !emptyState) return;

  tbody.innerHTML = '';

  const list = data || [];
  const shownCountEl = document.getElementById('val-shown-count');
  const totalCountEl = document.getElementById('val-total-count');
  
  if (shownCountEl) shownCountEl.textContent = Math.min(list.length, 25);
  if (totalCountEl) totalCountEl.textContent = list.length;

  if (list.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }
  
  emptyState.classList.add('hidden');

  const previewData = list.slice(0, 25);

  previewData.forEach((rawRow, idx) => {
    const r = parseRecord(rawRow, idx);
    const tr = document.createElement('tr');
    tr.className = 'fade-row-in';
    tr.style.animationDelay = `${Math.min(idx * 0.02, 0.25)}s`;

    const roleClass = r.rol.includes('Coord') ? 'badge-role-coord' : 'badge-role-personero';
    const expBadge = r.experiencia.toLowerCase() === 'sí' || r.experiencia.toLowerCase() === 'si' ? '<span class="pill-chip chip-yes">Exp: Sí</span>' : '<span class="pill-chip chip-no">Exp: No</span>';
    const movBadge = r.movilidad.toLowerCase() === 'sí' || r.movilidad.toLowerCase() === 'si' ? '<span class="pill-chip chip-yes">Mov: Sí</span>' : '<span class="pill-chip chip-no">Mov: No</span>';
    const compBadge = r.compromiso.toLowerCase() === 'sí' || r.compromiso.toLowerCase() === 'si' ? '<span class="pill-chip chip-yes">Comp: Sí</span>' : '<span class="pill-chip chip-no">Comp: No</span>';

    tr.innerHTML = `
      <td style="font-weight: 800; color: #38bdf8;">#${r.id}</td>
      <td style="font-size: 0.76rem; color: var(--text-muted);">${r.fecha_registro}</td>
      <td>
        <div style="display: flex; flex-direction: column;">
          <strong class="td-bold" title="${r.nombres}">${r.nombres}</strong>
          <span style="font-size: 0.75rem; color: var(--text-muted); font-family: monospace;">DNI: ${r.dni}</span>
        </div>
      </td>
      <td>
        <span class="badge-role ${roleClass}">${r.rol}</span>
      </td>
      <td>
        <div style="display: flex; flex-direction: column; font-size: 0.8rem;">
          <strong style="color: #0284c7;">${r.distrito_asignado}</strong>
          <span style="font-size: 0.74rem; color: var(--text-main);" title="${r.centro_asignado}">${r.centro_asignado}</span>
          <span style="font-size: 0.72rem; color: var(--text-muted);">Mesa Asignada: <strong>${r.mesa_asignada}</strong></span>
        </div>
      </td>
      <td>
        <div style="display: flex; flex-direction: column; font-size: 0.78rem; color: var(--text-muted);">
          <span>${r.distrito}</span>
          <span style="font-size: 0.72rem;" title="${r.centro}">Local: ${r.centro}</span>
          <span style="font-size: 0.72rem;">Mesa: ${r.mesa}</span>
        </div>
      </td>
      <td>
        <div style="display: flex; flex-direction: column; gap: 2px;">
          <span style="font-size: 0.82rem; font-weight: 600;">${r.celular}</span>
          ${r.waLink ? `
            <a href="${r.waLink}" target="_blank" class="wa-action-link" title="Escribir por WhatsApp">
              ${icons.whatsapp}
              <span>${r.waNumber}</span>
            </a>
          ` : '<span style="font-size: 0.72rem; color: var(--text-muted);">-</span>'}
        </div>
      </td>
      <td>
        <div style="display: flex; flex-direction: column; gap: 2px;">
          ${expBadge}
          ${movBadge}
          ${compBadge}
        </div>
      </td>
      <td class="actions-cell">
        <button class="btn-detail-action" title="Consultar ficha completa">Ver Ficha</button>
      </td>
    `;

    tr.querySelector('.btn-detail-action').addEventListener('click', () => {
      showModal(rawRow, idx);
    });

    tbody.appendChild(tr);
  });
}

/**
 * Renders Capacitación & Credenciales Window View with real-time reactive filters & charts.
 * @param {Array} allRegistrations - Full database array.
 */
export function renderCapacitacionView(allRegistrations = []) {
  const tbody = document.getElementById('table-body-cap');
  const searchInput = document.getElementById('search-cap');
  const estadoSelect = document.getElementById('filter-cap-estado');
  const distSelect = document.getElementById('filter-cap-distrito');
  const rolSelect = document.getElementById('filter-cap-rol');
  if (!tbody) return;

  tbody.innerHTML = '';

  const searchQ = searchInput ? searchInput.value.toLowerCase().trim() : '';
  const estadoQ = estadoSelect ? estadoSelect.value : '';
  const distQ = distSelect ? distSelect.value : '';
  const rolQ = rolSelect ? rolSelect.value : '';

  const list = allRegistrations.filter((r, idx) => {
    const parsed = parseRecord(r, idx);

    if (searchQ) {
      const blob = `${parsed.nombres} ${parsed.dni} ${parsed.distrito_asignado} ${parsed.centro_asignado} ${parsed.rol}`.toLowerCase();
      if (!blob.includes(searchQ)) return false;
    }
    if (estadoQ && normalizarTexto(parsed.credenciales) !== normalizarTexto(estadoQ)) return false;
    if (distQ && normalizarTexto(parsed.distrito_asignado) !== normalizarTexto(distQ)) return false;
    if (rolQ && normalizarTexto(parsed.rol) !== normalizarTexto(rolQ)) return false;

    return true;
  });

  const parsedFiltered = list.map((r, idx) => parseRecord(r, idx));
  
  // Update training stats counters based on filtered data
  const confirmados = parsedFiltered.filter(r => r.isCompleted).length;
  const pendientes = parsedFiltered.length - confirmados;
  const totalVideos = parsedFiltered.filter(r => r.video >= 2).length;
  const totalPdfs = parsedFiltered.filter(r => r.pdf >= 2).length;

  const confEl = document.getElementById('val-cap-confirmados');
  const pendEl = document.getElementById('val-cap-pendientes');
  const vidEl = document.getElementById('val-cap-videos');
  const pdfEl = document.getElementById('val-cap-pdfs');

  if (confEl) confEl.textContent = confirmados.toLocaleString('es-PE');
  if (pendEl) pendEl.textContent = pendientes.toLocaleString('es-PE');
  if (vidEl) vidEl.textContent = totalVideos.toLocaleString('es-PE');
  if (pdfEl) pdfEl.textContent = totalPdfs.toLocaleString('es-PE');

  // Update training charts dynamically
  renderCapacitacionCharts(list);

  if (list.length === 0) {
    tbody.innerHTML = `<tr><td colspan="9" style="text-align: center; color: var(--text-muted); padding: 30px;">No hay registros con los filtros seleccionados.</td></tr>`;
    return;
  }

  const previewCapData = list.slice(0, 25);

  previewCapData.forEach((rawRow, idx) => {
    const r = parseRecord(rawRow, idx);
    const tr = document.createElement('tr');
    tr.className = 'fade-row-in';
    tr.style.animationDelay = `${Math.min(idx * 0.02, 0.25)}s`;
    const credClass = r.isCompleted ? 'badge-cred-confirmado' : 'badge-cred-bloqueado';

    const reminderMsg = encodeURIComponent(`Hola ${r.nombres}, te recordamos completar tus módulos de video y manuales PDF en https://conteolima.com para habilitar tu Credencial Oficial Somos Perú 2026.`);
    const waReminderLink = r.waNumber ? `https://wa.me/51${r.waNumber}?text=${reminderMsg}` : '';

    tr.innerHTML = `
      <td style="font-weight: 800; color: #38bdf8;">#${r.id}</td>
      <td>
        <strong>${r.nombres}</strong>
        <span style="display: block; font-size: 0.74rem; color: var(--text-muted); font-family: monospace;">DNI: ${r.dni}</span>
      </td>
      <td><span class="badge-role ${r.rol.includes('Coord') ? 'badge-role-coord' : 'badge-role-personero'}">${r.rol}</span></td>
      <td>${r.distrito_asignado}</td>
      <td>
        <div style="display: flex; align-items: center; gap: 6px;">
          <div style="width: 50px; height: 6px; background: rgba(0,0,0,0.1); border-radius: 3px; overflow: hidden;">
            <div style="width: ${(r.video / 2) * 100}%; height: 100%; background: #38bdf8;"></div>
          </div>
          <strong>${r.video}/2</strong>
        </div>
      </td>
      <td>
        <div style="display: flex; align-items: center; gap: 6px;">
          <div style="width: 50px; height: 6px; background: rgba(0,0,0,0.1); border-radius: 3px; overflow: hidden;">
            <div style="width: ${(r.pdf / 2) * 100}%; height: 100%; background: #a78bfa;"></div>
          </div>
          <strong>${r.pdf}/2</strong>
        </div>
      </td>
      <td><span class="badge-cred ${credClass}">${r.credenciales}</span></td>
      <td>
        ${waReminderLink ? `
          <a href="${waReminderLink}" target="_blank" class="wa-action-link" style="color: #10b981;" title="Enviar recordatorio de capacitación">
            ${icons.whatsapp} <span>Recordatorio</span>
          </a>
        ` : '-'}
      </td>
      <td class="actions-cell">
        <button class="btn-detail-action btn-cap-action">Ver Ficha</button>
      </td>
    `;

    tr.querySelector('.btn-cap-action').addEventListener('click', () => {
      showModal(rawRow, idx);
    });

    tbody.appendChild(tr);
  });
}

/**
 * Exports registration data to an Excel-compatible CSV file with UTF-8 BOM.
 * @param {Array} data - Array of registration row objects to export.
 */
export function exportToExcel(data = []) {
  if (!data || data.length === 0) {
    alert('No hay registros disponibles para exportar.');
    return;
  }

  let csvContent = '\uFEFF';
  csvContent += OFFICIAL_HEADERS.map(h => `"${h.replace(/"/g, '""')}"`).join(';') + '\r\n';

  data.forEach((rawRow, idx) => {
    const r = parseRecord(rawRow, idx);

    const clean = (val) => {
      if (val === undefined || val === null) return '';
      return String(val).replace(/"/g, '""').trim();
    };

    const row = [
      clean(r.id),
      clean(r.fecha_registro),
      clean(r.nombres),
      clean(r.dni),
      clean(r.celular),
      clean(r.correo),
      clean(r.usa_whatsapp),
      clean(r.whatsapp_otro),
      clean(r.distrito),
      clean(r.mesa),
      clean(r.centro),
      clean(r.rol),
      clean(r.distrito_asignado),
      clean(r.mesa_asignada),
      clean(r.centro_asignado),
      clean(r.experiencia),
      clean(r.movilidad),
      clean(r.compromiso),
      clean(r.video),
      clean(r.pdf),
      clean(r.credenciales)
    ];

    csvContent += row.map(cell => `"${cell}"`).join(';') + '\r\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  
  const now = new Date();
  const dateStr = now.toISOString().slice(0, 10);
  link.setAttribute('href', url);
  link.setAttribute('download', `Padron_SomosPeru_2026_${dateStr}.csv`);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
