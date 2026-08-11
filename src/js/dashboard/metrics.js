import { parseRecord, getDistrictGoal, normalizarTexto } from './utils.js';
import { distritosLima } from '../config.js';

/**
 * Populates all district dropdown filters across tabs from the fetched registrations and master district list.
 * @param {Array} data - Array of registration row objects.
 */
export function populateDistrictFilter(data) {
  const selects = [
    document.getElementById('filter-distrito'),
    document.getElementById('filter-cap-distrito')
  ].filter(Boolean);

  if (selects.length === 0) return;
  
  const dataDistricts = (data || []).map((r, idx) => {
    const parsed = parseRecord(r, idx);
    return parsed.distrito_asignado || parsed.distrito;
  }).filter(Boolean);

  const combinedDistricts = [...new Set([...distritosLima, ...dataDistricts])]
    .filter(d => d && d !== '-' && d !== 'No especificado')
    .sort((a, b) => a.localeCompare(b, 'es'));

  selects.forEach(select => {
    const currentVal = select.value;
    select.innerHTML = `<option value="">Todos los Distritos</option>`;
    if (select.id === 'filter-distrito') {
      select.innerHTML += `<option value="__incompletos__">⚠️ Distritos Incompletos</option>`;
    }
    combinedDistricts.forEach(d => {
      const opt = document.createElement('option');
      opt.value = d;
      opt.textContent = d;
      select.appendChild(opt);
    });
    if (currentVal) select.value = currentVal;
  });
}

/**
 * Updates the summary metrics counters on the top section of the dashboard.
 * @param {Array} filteredData - Array of filtered registration row objects.
 * @param {Array} allData - Array of all registration row objects.
 */
export function updateMetrics(filteredData = [], allData = []) {
  const dataset = filteredData;
  const total = dataset.length;
  
  // Parse all records for calculations
  const parsedRecords = dataset.map((r, idx) => parseRecord(r, idx));

  // 1. Total Registrados
  const totalEl = document.getElementById('val-total');
  if (totalEl) totalEl.textContent = total.toLocaleString('es-PE');

  // 2. Coordinadores de Local
  const coordinadores = parsedRecords.filter(r => r.rol.includes('Coord')).length;
  const coordEl = document.getElementById('val-coordinadores');
  if (coordEl) coordEl.textContent = coordinadores.toLocaleString('es-PE');

  // 3. Personeros de Mesa
  const personeros = parsedRecords.filter(r => !r.rol.includes('Coord')).length;
  const personerosEl = document.getElementById('val-personeros');
  if (personerosEl) personerosEl.textContent = personeros.toLocaleString('es-PE');

  // 4. Con Experiencia
  const conExp = parsedRecords.filter(r => r.experiencia.toLowerCase() === 'sí' || r.experiencia.toLowerCase() === 'si').length;
  const expEl = document.getElementById('val-experiencia');
  if (expEl) expEl.textContent = conExp.toLocaleString('es-PE');

  // 5. Con Movilidad
  const conMov = parsedRecords.filter(r => r.movilidad.toLowerCase() === 'sí' || r.movilidad.toLowerCase() === 'si').length;
  const movEl = document.getElementById('val-movilidad');
  if (movEl) movEl.textContent = conMov.toLocaleString('es-PE');

  // 6. Compromiso 4 de Octubre
  const conComp = parsedRecords.filter(r => r.compromiso.toLowerCase() === 'sí' || r.compromiso.toLowerCase() === 'si').length;
  const compEl = document.getElementById('val-compromiso');
  if (compEl) compEl.textContent = conComp.toLocaleString('es-PE');

  // 7. KPI Distrito
  const districtSelect = document.getElementById('filter-distrito');
  const selectedDistrict = districtSelect ? districtSelect.value : '';
  
  let kpiDistrict = '';
  let kpiCount = 0;
  
  if (selectedDistrict && selectedDistrict !== '__incompletos__') {
    kpiDistrict = selectedDistrict;
    kpiCount = parsedRecords.filter(r => {
      const cleanSel = normalizarTexto(selectedDistrict);
      return normalizarTexto(r.distrito_asignado) === cleanSel || normalizarTexto(r.distrito) === cleanSel;
    }).length;
  } else {
    kpiDistrict = 'Todos los Distritos';
    kpiCount = total;
  }
  
  const kpiNameEl = document.getElementById('kpi-district-name');
  const kpiTextEl = document.getElementById('kpi-progress-text');
  const kpiPctEl = document.getElementById('kpi-pct-text');
  const kpiBarEl = document.getElementById('kpi-progress-bar');
  const kpiLabelEl = document.querySelector('#metric-kpi-card .metric-label');
  
  if (kpiNameEl) kpiNameEl.textContent = kpiDistrict;
  
  const limit = getDistrictGoal(kpiDistrict);
  if (kpiLabelEl) kpiLabelEl.textContent = `Avance Meta (${limit.toLocaleString('es-PE')})`;
  
  const rawPct = limit > 0 ? (kpiCount / limit) * 100 : 0;
  const pct = Math.min(100, Math.round(rawPct));
  
  if (kpiTextEl) kpiTextEl.textContent = `${kpiCount.toLocaleString('es-PE')} / ${limit.toLocaleString('es-PE')}`;
  if (kpiPctEl) kpiPctEl.textContent = `${Math.round(rawPct * 10) / 10}%`;
  
  if (kpiBarEl) {
    kpiBarEl.style.width = `${pct}%`;
    if (pct >= 80) {
      kpiBarEl.style.backgroundColor = '#10b981'; // Green
    } else if (pct >= 40) {
      kpiBarEl.style.backgroundColor = '#f59e0b'; // Orange
    } else {
      kpiBarEl.style.backgroundColor = '#ef4444'; // Red
    }
  }
}
