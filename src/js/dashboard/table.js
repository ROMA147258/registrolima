import { getRowValue, getDistrictGoal } from './utils.js';
import { icons } from '../icons.js';
import { showModal } from './modal.js';
import { updateMetrics } from './metrics.js';
import { renderCharts } from './charts.js';

export let currentFilteredRegistrations = [];

/**
 * Filters the list of registrations based on current filter values and renders them in the table.
 * @param {Array} allRegistrations - Array of all registration row objects.
 */
export function applyFiltersAndRender(allRegistrations) {
  const searchInput = document.getElementById('table-search');
  const districtSelect = document.getElementById('filter-distrito');
  const experienceSelect = document.getElementById('filter-experiencia');
  const mobilitySelect = document.getElementById('filter-movilidad');

  if (!searchInput || !districtSelect || !experienceSelect || !mobilitySelect) return;

  const searchQuery = searchInput.value.toLowerCase().trim();
  const districtFilter = districtSelect.value;
  const experienceFilter = experienceSelect.value;
  const mobilityFilter = mobilitySelect.value;

  // Pre-calculate count per district across all registrations
  const distCounts = {};
  allRegistrations.forEach(r => {
    const d = getRowValue(r, ['Distrito de Votación', 'distrito']);
    if (d) distCounts[d] = (distCounts[d] || 0) + 1;
  });

  const filtered = allRegistrations.filter(r => {
    // 1. Search Query
    const name = getRowValue(r, ['Nombres y Apellidos', 'nombres']).toLowerCase();
    const dni = getRowValue(r, ['D.N.I.', 'dni']).toLowerCase();
    const dist = getRowValue(r, ['Distrito de Votación', 'distrito']).toLowerCase();
    const center = getRowValue(r, ['Centro de Votación', 'centro']).toLowerCase();
    const idVal = getRowValue(r, ['ID', 'id']).toLowerCase();
    
    const matchesSearch = !searchQuery || 
      name.includes(searchQuery) || 
      dni.includes(searchQuery) || 
      dist.includes(searchQuery) || 
      center.includes(searchQuery) ||
      idVal.includes(searchQuery);

    // 2. District Filter
    const rDist = getRowValue(r, ['Distrito de Votación', 'distrito']);
    let matchesDistrict = true;
    if (districtFilter === '__incompletos__') {
      const regCount = distCounts[rDist] || 0;
      const goal = getDistrictGoal(rDist);
      matchesDistrict = regCount < goal;
    } else if (districtFilter) {
      matchesDistrict = rDist === districtFilter;
    }

    // 3. Experience Filter
    const rExp = getRowValue(r, ['Experiencia como Personero', 'experiencia_personero']);
    const matchesExperience = !experienceFilter || rExp.toLowerCase() === experienceFilter.toLowerCase();

    // 4. Mobility Filter
    const rMob = getRowValue(r, ['¿Cuenta con Movilidad Propia?', 'movilidad_propia']);
    const matchesMobility = !mobilityFilter || rMob.toLowerCase() === mobilityFilter.toLowerCase();

    return matchesSearch && matchesDistrict && matchesExperience && matchesMobility;
  });

  currentFilteredRegistrations = filtered;
  renderTableRows(filtered, allRegistrations.length);
  updateMetrics(filtered);
  renderCharts(filtered, districtFilter, allRegistrations);
}

/**
 * Injects row elements for filtered registrations into the DOM table body.
 * @param {Array} data - Filtered registration row objects.
 * @param {number} totalCount - Total number of registrations in the database.
 */
function renderTableRows(data, totalCount) {
  const tbody = document.getElementById('table-body');
  const emptyState = document.getElementById('table-empty');
  if (!tbody || !emptyState) return;

  tbody.innerHTML = '';

  const shownCountEl = document.getElementById('val-shown-count');
  const totalCountEl = document.getElementById('val-total-count');
  
  // Mostrar cuántos registros se renderizan en esta vista previa (máximo 10)
  if (shownCountEl) shownCountEl.textContent = Math.min(data.length, 10);
  if (totalCountEl) totalCountEl.textContent = totalCount;

  if (data.length === 0) {
    emptyState.classList.remove('hidden');
    return;
  }
  
  emptyState.classList.add('hidden');

  // Solo mostramos los primeros 10 en la tabla principal del dashboard
  const previewData = data.slice(0, 10);

  previewData.forEach((r) => {
    const tr = document.createElement('tr');
    
    const idVal = getRowValue(r, ['ID', 'id']);
    const name = getRowValue(r, ['Nombres y Apellidos', 'nombres']);
    const dni = getRowValue(r, ['D.N.I.', 'dni']);
    const dist = getRowValue(r, ['Distrito de Votación', 'distrito']);
    const center = getRowValue(r, ['Centro de Votación', 'centro']);
    const mesa = getRowValue(r, ['Mesa Electoral', 'mesa']);
    const cell = getRowValue(r, ['Número de Celular', 'celular']);
    const usesWA = getRowValue(r, ['¿Usa WhatsApp?', 'usa_whatsapp']);
    const waOtro = getRowValue(r, ['WhatsApp Alterno', 'whatsapp_otro']);
    const exp = getRowValue(r, ['Experiencia como Personero', 'experiencia_personero']);
    const comp = getRowValue(r, ['Compromiso 2da Vuelta 2026', 'compromiso_2da_vuelta']);
    const mob = getRowValue(r, ['¿Cuenta con Movilidad Propia?', 'movilidad_propia']);

    const waNumber = (usesWA.toLowerCase() === 'sí') ? cell : waOtro;
    const waLink = waNumber ? `https://wa.me/51${waNumber.trim()}` : '';

    const expClass = exp.toLowerCase() === 'sí' ? 'badge-success' : 'badge-danger';
    const compClass = comp.toLowerCase() === 'sí' ? 'badge-success' : 'badge-danger';
    const mobClass = mob.toLowerCase() === 'sí' ? 'badge-success' : 'badge-danger';

    const videoVal = parseInt(getRowValue(r, ['Video', 'video']) || '0', 10);
    const pdfVal = parseInt(getRowValue(r, ['PDF', 'pdf']) || '0', 10);
    const rawCred = getRowValue(r, ['Credenciales', 'credenciales']);
    const isCompleted = (videoVal >= 2 && pdfVal >= 2) || (rawCred && rawCred.toLowerCase() === 'confirmado');
    const capText = isCompleted ? 'Completado' : 'Bloqueado';
    const capClass = isCompleted ? 'badge-success' : 'badge-danger';

    tr.innerHTML = `
      <td style="font-weight: bold; color: #38bdf8;">${idVal || '-'}</td>
      <td class="td-bold" title="${name}">${name}</td>
      <td>${dni}</td>
      <td title="${dist}">${dist}</td>
      <td title="${center}">${center}</td>
      <td>${mesa}</td>
      <td>${cell}</td>
      <td>
        ${waLink ? `
          <a href="${waLink}" target="_blank" class="wa-action-link" title="Escribir por WhatsApp">
            ${icons.whatsapp}
            <span>${waNumber}</span>
          </a>
        ` : '-'}
      </td>
      <td><span class="table-badge ${capClass}">${capText}</span></td>
      <td><span class="table-badge ${expClass}">${exp}</span></td>
      <td><span class="table-badge ${compClass}">${comp}</span></td>
      <td><span class="table-badge ${mobClass}">${mob}</span></td>
      <td class="actions-cell">
        <button class="btn-detail-action">Ver Todo</button>
      </td>
    `;

    tr.querySelector('.btn-detail-action').addEventListener('click', () => {
      showModal(r);
    });

    tbody.appendChild(tr);
  });
}

/**
 * Renders all records in the full screen table modal.
 * @param {Array} data - Array of filtered registrations.
 */
export function renderFullTableRows(data) {
  const tbody = document.getElementById('full-table-body');
  const countEl = document.getElementById('val-full-table-count');
  if (!tbody) return;

  tbody.innerHTML = '';
  if (countEl) countEl.textContent = data.length;

  if (data.length === 0) {
    const tr = document.createElement('tr');
    tr.innerHTML = `<td colspan="11" style="text-align: center; color: var(--text-muted); padding: 30px;">No hay registros para mostrar.</td>`;
    tbody.appendChild(tr);
    return;
  }

  data.forEach((r) => {
    const tr = document.createElement('tr');
    
    const idVal = getRowValue(r, ['ID', 'id']);
    const name = getRowValue(r, ['Nombres y Apellidos', 'nombres']);
    const dni = getRowValue(r, ['D.N.I.', 'dni']);
    const dist = getRowValue(r, ['Distrito de Votación', 'distrito']);
    const center = getRowValue(r, ['Centro de Votación', 'centro']);
    const mesa = getRowValue(r, ['Mesa Electoral', 'mesa']);
    const cell = getRowValue(r, ['Número de Celular', 'celular']);
    const usesWA = getRowValue(r, ['¿Usa WhatsApp?', 'usa_whatsapp']);
    const waOtro = getRowValue(r, ['WhatsApp Alterno', 'whatsapp_otro']);
    const exp = getRowValue(r, ['Experiencia como Personero', 'experiencia_personero']);
    const comp = getRowValue(r, ['Compromiso 2da Vuelta 2026', 'compromiso_2da_vuelta']);
    const mob = getRowValue(r, ['¿Cuenta con Movilidad Propia?', 'movilidad_propia']);

    const waNumber = (usesWA.toLowerCase() === 'sí') ? cell : waOtro;
    const waLink = waNumber ? `https://wa.me/51${waNumber.trim()}` : '';

    const expClass = exp.toLowerCase() === 'sí' ? 'badge-success' : 'badge-danger';
    const compClass = comp.toLowerCase() === 'sí' ? 'badge-success' : 'badge-danger';
    const mobClass = mob.toLowerCase() === 'sí' ? 'badge-success' : 'badge-danger';

    const videoVal = parseInt(getRowValue(r, ['Video', 'video']) || '0', 10);
    const pdfVal = parseInt(getRowValue(r, ['PDF', 'pdf']) || '0', 10);
    const rawCred = getRowValue(r, ['Credenciales', 'credenciales']);
    const isCompleted = (videoVal >= 2 && pdfVal >= 2) || (rawCred && rawCred.toLowerCase() === 'confirmado');
    const capText = isCompleted ? 'Completado' : 'Bloqueado';
    const capClass = isCompleted ? 'badge-success' : 'badge-danger';

    tr.innerHTML = `
      <td style="font-weight: bold; color: #38bdf8;">${idVal || '-'}</td>
      <td class="td-bold" title="${name}">${name}</td>
      <td>${dni}</td>
      <td title="${dist}">${dist}</td>
      <td title="${center}">${center}</td>
      <td>${mesa}</td>
      <td>${cell}</td>
      <td>
        ${waLink ? `
          <a href="${waLink}" target="_blank" class="wa-action-link" title="Escribir por WhatsApp">
            ${icons.whatsapp}
            <span>${waNumber}</span>
          </a>
        ` : '-'}
      </td>
      <td><span class="table-badge ${capClass}">${capText}</span></td>
      <td><span class="table-badge ${expClass}">${exp}</span></td>
      <td><span class="table-badge ${compClass}">${comp}</span></td>
      <td><span class="table-badge ${mobClass}">${mob}</span></td>
    `;
    tbody.appendChild(tr);
  });
}

/**
 * Exports registration data to an Excel-compatible CSV file with UTF-8 BOM.
 * @param {Array} data - Array of registration row objects to export.
 */
export function exportToExcel(data) {
  if (!data || data.length === 0) {
    alert('No hay registros disponibles para exportar.');
    return;
  }

  const headers = [
    'ID',
    'Nombres y Apellidos',
    'D.N.I.',
    'Distrito de Votación',
    'Centro de Votación',
    'Mesa Electoral',
    'Número de Celular',
    'Usa WhatsApp',
    'WhatsApp Alterno',
    'Correo Electrónico',
    'Experiencia como Personero',
    'Compromiso 2da Vuelta 2026',
    'Movilidad Propia',
    'Fecha de Registro'
  ];

  // UTF-8 BOM byte sequence so Excel correctly displays special characters (accents/ñ)
  let csvContent = '\uFEFF';
  csvContent += headers.map(h => `"${h.replace(/"/g, '""')}"`).join(';') + '\r\n';

  data.forEach((r, idx) => {
    const rawId = getRowValue(r, ['ID', 'id']);
    const rawName = getRowValue(r, ['Nombres y Apellidos', 'nombres']);
    const rawDni = getRowValue(r, ['D.N.I.', 'dni']);
    const rawDist = getRowValue(r, ['Distrito de Votación', 'distrito']);
    const rawCenter = getRowValue(r, ['Centro de Votación', 'centro']);
    const rawMesa = getRowValue(r, ['Mesa Electoral', 'mesa']);
    const rawCell = getRowValue(r, ['Número de Celular', 'celular']);
    const rawUsaWa = getRowValue(r, ['¿Usa WhatsApp?', 'usa_whatsapp']);
    const rawWaOtro = getRowValue(r, ['WhatsApp Alterno', 'whatsapp_otro']);
    const rawMail = getRowValue(r, ['Correo Electrónico', 'correo']);
    const rawExp = getRowValue(r, ['Experiencia como Personero', 'experiencia_personero']);
    const rawComp = getRowValue(r, ['Compromiso 2da Vuelta 2026', 'compromiso_2da_vuelta']);
    const rawMob = getRowValue(r, ['¿Cuenta con Movilidad Propia?', 'movilidad_propia']);
    const rawDate = getRowValue(r, ['Fecha de Registro', 'fecha_registro']);

    const clean = (val, defaultText = 'Sin información') => {
      if (val === undefined || val === null) return defaultText;
      const str = String(val).trim();
      return (str === '' || str === '-') ? defaultText : str;
    };

    const row = [
      clean(rawId, String(idx + 1)),
      clean(rawName, 'Sin Nombre'),
      clean(rawDni, 'Sin DNI'),
      clean(rawDist, 'No especificado'),
      clean(rawCenter, 'No especificado'),
      clean(rawMesa, '000000'),
      clean(rawCell, 'Sin celular'),
      clean(rawUsaWa, 'No'),
      clean(rawWaOtro, 'Mismo número'),
      clean(rawMail, 'Sin correo'),
      clean(rawExp, 'No'),
      clean(rawComp, 'No'),
      clean(rawMob, 'No'),
      clean(rawDate, new Date().toLocaleDateString('es-PE'))
    ];
    csvContent += row.map(v => `"${v.replace(/"/g, '""')}"`).join(';') + '\r\n';
  });

  const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
  const url = URL.createObjectURL(blob);
  const link = document.createElement('a');
  link.setAttribute('href', url);
  const fileName = `Registros_Personeros_ConteoLima_${new Date().toISOString().slice(0, 10)}.csv`;
  link.setAttribute('download', fileName);
  document.body.appendChild(link);
  link.click();
  document.body.removeChild(link);
  URL.revokeObjectURL(url);
}
