import { getRowValue, getDistrictGoal } from './utils.js';
import { distritosLima } from '../config.js';
import Chart from 'chart.js/auto';

let distritosChartInstance = null;

/**
 * Renders bar chart for districts.
 * - When no district filter is selected (total view), shows ONLY the "🔴 Faltan" bars for all districts.
 * - When a district filter is applied (specific district or incomplete districts), shows BOTH "🟢 Registrados" (verde) and "🔴 Faltan" (rojo) bars.
 * @param {Array} data - Filtered registration row objects.
 * @param {string} districtFilter - Active district filter value.
 * @param {Array} allRegistrations - Array of all registration row objects.
 */
export function renderCharts(data, districtFilter = '', allRegistrations = []) {
  const sourceData = (allRegistrations && allRegistrations.length > 0) ? allRegistrations : data;

  const distritosCount = {};
  if (sourceData && sourceData.length > 0) {
    sourceData.forEach(r => {
      const d = getRowValue(r, ['Distrito de Votación', 'distrito']);
      if (d) distritosCount[d] = (distritosCount[d] || 0) + 1;
    });
  }

  // Combined master district list (distritosLima + any existing in data)
  const masterDistricts = [...new Set([...distritosLima, ...Object.keys(distritosCount)])]
    .sort((a, b) => a.localeCompare(b, 'es'));

  let targetDistricts = masterDistricts;

  if (districtFilter === '__incompletos__') {
    targetDistricts = masterDistricts.filter(d => {
      const reg = distritosCount[d] || 0;
      const goal = getDistrictGoal(d);
      return reg < goal;
    });
  } else if (districtFilter && districtFilter !== '') {
    targetDistricts = masterDistricts.filter(d => d.toLowerCase() === districtFilter.toLowerCase());
    if (targetDistricts.length === 0) targetDistricts = [districtFilter];
  }

  const distritosLabels = targetDistricts;
  const isSingleDistrict = targetDistricts.length === 1;
  const registradosValues = targetDistricts.map(d => distritosCount[d] || 0);
  const metasValues = targetDistricts.map(d => getDistrictGoal(d));
  const faltanValues = targetDistricts.map((d, i) => Math.max(0, metasValues[i] - registradosValues[i]));

  // Distribution totals calculation
  const totalRegistrados = registradosValues.reduce((a, b) => a + b, 0);
  const totalMeta = metasValues.reduce((a, b) => a + b, 0);
  const totalFaltan = Math.max(0, totalMeta - totalRegistrados);

  const regEl = document.getElementById('distrib-registrados-count');
  const faltEl = document.getElementById('distrib-faltan-count');
  const metaEl = document.getElementById('distrib-meta-count');

  if (regEl) regEl.textContent = totalRegistrados;
  if (faltEl) faltEl.textContent = totalFaltan;
  if (metaEl) metaEl.textContent = totalMeta;

  const ChartClass = Chart || window.Chart;
  if (!ChartClass) {
    console.warn("Chart.js is not loaded.");
    return;
  }

  if (distritosChartInstance) distritosChartInstance.destroy();

  const isLight = document.body.classList.contains('theme-light');
  const gridColor = isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)';
  const textColor = isLight ? '#0f172a' : '#f8fafc';
  const mutedTextColor = isLight ? '#64748b' : '#94a3b8';
  
  const tooltipBg = isLight ? '#ffffff' : '#1e293b';
  const tooltipTitle = isLight ? '#0f172a' : '#ffffff';
  const tooltipBody = isLight ? '#334155' : '#cbd5e1';
  const tooltipBorder = isLight ? '#e2e8f0' : '#475569';

  const chartTitleEl = document.querySelector('.chart-card-title');
  let datasets = [];

  if (districtFilter === '__incompletos__') {
    if (chartTitleEl) chartTitleEl.innerHTML = `<span style="color: #ef4444; font-weight: 800;">⚠️ Distritos Incompletos (Faltan Personeros)</span>`;
    datasets = [
      {
        label: 'Registrados',
        data: registradosValues,
        backgroundColor: '#10b981',
        borderColor: '#059669',
        borderWidth: 1,
        borderRadius: 4
      },
      {
        label: 'Faltan Personeros',
        data: faltanValues,
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        borderWidth: 1,
        borderRadius: 4
      }
    ];
  } else if (districtFilter && districtFilter !== '') {
    if (chartTitleEl) chartTitleEl.textContent = `Detalle de Distrito: ${districtFilter}`;
    datasets = [
      {
        label: 'Registrados',
        data: registradosValues,
        backgroundColor: '#10b981',
        borderColor: '#059669',
        borderWidth: 1,
        borderRadius: 4
      },
      {
        label: 'Faltan Personeros',
        data: faltanValues,
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        borderWidth: 1,
        borderRadius: 4
      }
    ];
  } else {
    if (chartTitleEl) chartTitleEl.textContent = `Resultado Lima Metropolitana (Todos los Distritos)`;
    datasets = [
      {
        label: 'Personeros Registrados',
        data: registradosValues,
        backgroundColor: '#0ea5e9',
        borderColor: '#0284c7',
        borderWidth: 1,
        borderRadius: 4
      }
    ];
  }

  const chartDistritosEl = document.getElementById('chart-distritos');
  if (chartDistritosEl) {
    const ctxDistritos = chartDistritosEl.getContext('2d');
    distritosChartInstance = new ChartClass(ctxDistritos, {
      type: 'bar',
      data: {
        labels: distritosLabels,
        datasets: datasets
      },
      options: {
        responsive: true,
        maintainAspectRatio: false,
        plugins: {
          legend: {
            display: true,
            position: 'top',
            labels: {
              color: textColor,
              font: { family: 'Outfit', size: 12, weight: 'bold' },
              padding: 14,
              usePointStyle: true
            }
          },
          tooltip: {
            backgroundColor: tooltipBg,
            titleColor: tooltipTitle,
            bodyColor: tooltipBody,
            titleFont: { family: 'Outfit', size: 13, weight: 'bold' },
            bodyFont: { family: 'Outfit', size: 12 },
            padding: 10,
            cornerRadius: 6,
            borderColor: tooltipBorder,
            borderWidth: 1,
            callbacks: {
              label: function(context) {
                const label = context.dataset.label || '';
                const val = context.raw || 0;
                return ` ${label}: ${val} personeros`;
              }
            }
          }
        },
        scales: {
          y: {
            beginAtZero: true,
            stacked: false,
            ticks: {
              precision: 0,
              color: mutedTextColor,
              font: { family: 'Outfit' },
              callback: function(v) { return Number.isInteger(v) ? v : ''; }
            },
            grid: { color: gridColor }
          },
          x: {
            stacked: false,
            ticks: {
              color: mutedTextColor,
              font: { family: 'Outfit', weight: 'bold', size: isSingleDistrict ? 12 : 10 },
              maxRotation: isSingleDistrict ? 0 : 90,
              minRotation: isSingleDistrict ? 0 : 45,
              autoSkip: false
            },
            grid: { display: false }
          }
        }
      }
    });
  }
}
