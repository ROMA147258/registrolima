import { getRowValue, getDistrictGoal } from './utils.js';
import { distritosLima } from '../config.js';

/**
 * Populates the district dropdown filter from the fetched registrations and master district list.
 * @param {Array} data - Array of registration row objects.
 */
export function populateDistrictFilter(data) {
  const select = document.getElementById('filter-distrito');
  if (!select) return;
  
  const currentVal = select.value;
  select.innerHTML = `
    <option value="">Todos los Distritos</option>
    <option value="__incompletos__">⚠️ Distritos Incompletos (Faltan Personeros)</option>
  `;
  
  const dataDistricts = (data || []).map(r => getRowValue(r, ['Distrito de Votación', 'distrito'])).filter(Boolean);
  const combinedDistricts = [...new Set([...distritosLima, ...dataDistricts])].sort((a, b) => a.localeCompare(b, 'es'));

  combinedDistricts.forEach(d => {
    const opt = document.createElement('option');
    opt.value = d;
    opt.textContent = d;
    select.appendChild(opt);
  });

  if (currentVal) select.value = currentVal;
}

/**
 * Updates the summary metrics counters on the top section of the dashboard.
 * @param {Array} data - Array of registration row objects.
 */
export function updateMetrics(data) {
  const total = data.length;
  
  const totalEl = document.getElementById('val-total');
  if (totalEl) totalEl.textContent = total;

  // 1. Experiencia
  const conExp = data.filter(r => {
    const val = getRowValue(r, ['Experiencia como Personero', 'experiencia_personero']);
    return val && val.toLowerCase() === 'sí';
  }).length;
  const expEl = document.getElementById('val-experiencia');
  if (expEl) expEl.textContent = conExp;

  // 2. Compromiso 2da Vuelta
  const conComp = data.filter(r => {
    const val = getRowValue(r, ['Compromiso 2da Vuelta 2026', 'compromiso_2da_vuelta']);
    return val && val.toLowerCase() === 'sí';
  }).length;
  const compEl = document.getElementById('val-compromiso');
  if (compEl) compEl.textContent = conComp;

  // 3. Movilidad
  const conMov = data.filter(r => {
    const val = getRowValue(r, ['¿Cuenta con Movilidad Propia?', 'movilidad_propia']);
    return val && val.toLowerCase() === 'sí';
  }).length;
  const movEl = document.getElementById('val-movilidad');
  if (movEl) movEl.textContent = conMov;

  // 4. KPI Distrito
  const districtSelect = document.getElementById('filter-distrito');
  const selectedDistrict = districtSelect ? districtSelect.value : '';
  
  let kpiDistrict = '';
  let kpiCount = 0;
  
  if (selectedDistrict && selectedDistrict !== '__incompletos__') {
    kpiDistrict = selectedDistrict;
    kpiCount = data.length;
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
  if (kpiLabelEl) kpiLabelEl.textContent = `Progreso KPI (Meta ${limit.toLocaleString('es-PE')})`;
  
  const rawPct = limit > 0 ? (kpiCount / limit) * 100 : 0;
  const pct = Math.min(100, Math.round(rawPct));
  
  if (kpiTextEl) kpiTextEl.textContent = `${kpiCount.toLocaleString('es-PE')} / ${limit.toLocaleString('es-PE')}`;
  if (kpiPctEl) kpiPctEl.textContent = `${Math.round(rawPct * 10) / 10}%`;
  
  if (kpiBarEl) {
    kpiBarEl.style.width = `${pct}%`;
    if (pct >= 80) {
      kpiBarEl.style.backgroundColor = '#10b981'; // Green: High completion
    } else if (pct >= 40) {
      kpiBarEl.style.backgroundColor = '#f59e0b'; // Orange: Medium completion
    } else {
      kpiBarEl.style.backgroundColor = '#ef4444'; // Red: Low completion / Urgent
    }
  }
}
