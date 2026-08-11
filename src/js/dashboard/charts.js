import { getRowValue, getDistrictGoal, parseRecord, normalizarTexto } from './utils.js';
import { distritosLima } from '../config.js';
import Chart from 'chart.js/auto';

let distritosChartInstance = null;
let capCredencialesChartInstance = null;
let capModulosChartInstance = null;

/**
 * Destroys all active chart instances to prevent stale canvas attachments on re-login or tab switch.
 */
export function destroyAllDashboardCharts() {
  if (distritosChartInstance) {
    try { distritosChartInstance.destroy(); } catch (e) {}
    distritosChartInstance = null;
  }
  if (capCredencialesChartInstance) {
    try { capCredencialesChartInstance.destroy(); } catch (e) {}
    capCredencialesChartInstance = null;
  }
  if (capModulosChartInstance) {
    try { capModulosChartInstance.destroy(); } catch (e) {}
    capModulosChartInstance = null;
  }
}

/**
 * Renders bar chart for districts in Overview Tab.
 * Updates dynamically with role-specific distinct colors and labels.
 * @param {Array} filteredData - Currently filtered registration row objects.
 * @param {string} districtFilter - Active district filter value.
 * @param {Array} allRegistrations - Array of all registration row objects.
 */
export function renderCharts(filteredData = [], districtFilter = '', allRegistrations = []) {
  const currentDataset = (filteredData && filteredData.length >= 0) ? filteredData : allRegistrations;

  // Detect active role filter
  const roleSelect = document.getElementById('filter-rol');
  const roleFilter = roleSelect ? roleSelect.value : '';
  const isCoordinador = normalizarTexto(roleFilter).includes('coord');
  const isPersonero = normalizarTexto(roleFilter).includes('personero');

  const distritosCount = {};
  currentDataset.forEach((r, idx) => {
    const parsed = parseRecord(r, idx);
    const d = parsed.distrito_asignado || parsed.distrito;
    if (d && d !== '-' && d !== 'No especificado') {
      distritosCount[d] = (distritosCount[d] || 0) + 1;
    }
  });

  const masterDistricts = [...new Set([...distritosLima, ...Object.keys(distritosCount)])]
    .filter(d => d && d !== '-' && d !== 'No especificado')
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

  const totalRegistrados = currentDataset.length;
  const totalMeta = metasValues.reduce((a, b) => a + b, 0);
  const totalFaltan = Math.max(0, totalMeta - totalRegistrados);

  const regEl = document.getElementById('distrib-registrados-count');
  const faltEl = document.getElementById('distrib-faltan-count');
  const metaEl = document.getElementById('distrib-meta-count');

  if (regEl) {
    regEl.textContent = totalRegistrados.toLocaleString('es-PE');
    regEl.style.color = isCoordinador ? '#06b6d4' : '#0ea5e9';
  }
  if (faltEl) faltEl.textContent = totalFaltan.toLocaleString('es-PE');
  if (metaEl) metaEl.textContent = totalMeta.toLocaleString('es-PE');

  const ChartClass = Chart || window.Chart;
  if (!ChartClass) return;

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

  // Theme colors based on role selection
  // Coordinador = Vibrant Cyan (#06b6d4), Personero = Sky Blue (#0ea5e9)
  const roleColor = isCoordinador ? '#06b6d4' : '#0ea5e9';
  const roleBorderColor = isCoordinador ? '#0891b2' : '#0284c7';
  const roleLabel = isCoordinador ? 'Coordinadores de Local' : isPersonero ? 'Personeros de Mesa' : 'Personeros y Coordinadores';

  if (districtFilter === '__incompletos__') {
    if (chartTitleEl) {
      chartTitleEl.innerHTML = `<span style="color: #ef4444; font-weight: 800;">⚠️ Distritos Incompletos</span> ${isCoordinador ? '<span style="color: #06b6d4; font-weight: 700; font-size: 0.8rem;">(Coordinadores)</span>' : ''}`;
    }
    datasets = [
      {
        label: roleLabel,
        data: registradosValues,
        backgroundColor: roleColor,
        borderColor: roleBorderColor,
        borderWidth: 1.5,
        borderRadius: 4
      },
      {
        label: 'Faltan para Meta',
        data: faltanValues,
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        borderWidth: 1,
        borderRadius: 4
      }
    ];
  } else if (districtFilter && districtFilter !== '') {
    if (chartTitleEl) {
      if (isCoordinador) {
        chartTitleEl.innerHTML = `⭐ Coordinadores en <span style="color: #06b6d4; font-weight: 800;">${districtFilter}</span>`;
      } else {
        chartTitleEl.textContent = `Detalle de Distrito: ${districtFilter}`;
      }
    }
    datasets = [
      {
        label: roleLabel,
        data: registradosValues,
        backgroundColor: roleColor,
        borderColor: roleBorderColor,
        borderWidth: 1.5,
        borderRadius: 4
      },
      {
        label: 'Faltan para Meta',
        data: faltanValues,
        backgroundColor: '#ef4444',
        borderColor: '#dc2626',
        borderWidth: 1,
        borderRadius: 4
      }
    ];
  } else {
    if (chartTitleEl) {
      if (isCoordinador) {
        chartTitleEl.innerHTML = `⭐ Distribución de <span style="color: #06b6d4; font-weight: 800;">Coordinadores de Local</span> en Lima`;
      } else if (isPersonero) {
        chartTitleEl.innerHTML = `🛡️ Distribución de <span style="color: #0ea5e9; font-weight: 800;">Personeros de Mesa</span> en Lima`;
      } else {
        chartTitleEl.textContent = `Resultado Lima Metropolitana`;
      }
    }
    datasets = [
      {
        label: roleLabel,
        data: registradosValues,
        backgroundColor: roleColor,
        borderColor: roleBorderColor,
        borderWidth: 1.5,
        borderRadius: 4
      }
    ];
  }

  const chartDistritosEl = document.getElementById('chart-distritos');
  if (!chartDistritosEl) return;

  // Fluid transition: Only update if instance belongs to the current active canvas in DOM
  if (distritosChartInstance && distritosChartInstance.canvas === chartDistritosEl) {
    distritosChartInstance.data.labels = distritosLabels;
    distritosChartInstance.data.datasets = datasets;
    distritosChartInstance.options.scales.x.ticks.font.size = isSingleDistrict ? 12 : 10;
    distritosChartInstance.options.scales.x.ticks.maxRotation = isSingleDistrict ? 0 : 90;
    distritosChartInstance.options.scales.x.ticks.minRotation = isSingleDistrict ? 0 : 45;
    distritosChartInstance.update();
    return;
  }

  if (distritosChartInstance) {
    try { distritosChartInstance.destroy(); } catch (e) {}
    distritosChartInstance = null;
  }

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
      animation: {
        duration: 450,
        easing: 'easeOutQuart'
      },
      transitions: {
        active: {
          animation: {
            duration: 350
          }
        }
      },
      plugins: {
        legend: {
          display: true,
          position: 'top',
          labels: {
            color: textColor,
            font: { family: 'Outfit', size: 12, weight: 'bold' },
            padding: 10,
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
              return ` ${label}: ${val} personas`;
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

/**
 * Renders the dedicated training charts in Tab 2 with fluid transitions.
 * Updates dynamically when ANY filter changes in the Capacitación tab.
 * @param {Array} filteredCapData - Filtered array of registrations.
 */
export function renderCapacitacionCharts(filteredCapData = []) {
  const ChartClass = Chart || window.Chart;
  if (!ChartClass) return;

  const parsed = (filteredCapData || []).map((r, idx) => parseRecord(r, idx));
  const confirmados = parsed.filter(r => r.isCompleted).length;
  const bloqueados = parsed.length - confirmados;

  const isLight = document.body.classList.contains('theme-light');
  const textColor = isLight ? '#0f172a' : '#f8fafc';
  const mutedTextColor = isLight ? '#64748b' : '#94a3b8';
  const gridColor = isLight ? 'rgba(0, 0, 0, 0.06)' : 'rgba(255, 255, 255, 0.08)';

  // 1. Chart Credenciales (Doughnut)
  const chartCredEl = document.getElementById('chart-cap-credenciales');
  if (chartCredEl) {
    if (capCredencialesChartInstance && capCredencialesChartInstance.canvas === chartCredEl) {
      capCredencialesChartInstance.data.datasets[0].data = [confirmados, bloqueados];
      capCredencialesChartInstance.update();
    } else {
      if (capCredencialesChartInstance) {
        try { capCredencialesChartInstance.destroy(); } catch (e) {}
        capCredencialesChartInstance = null;
      }
      const ctxCred = chartCredEl.getContext('2d');
      capCredencialesChartInstance = new ChartClass(ctxCred, {
        type: 'doughnut',
        data: {
          labels: ['Confirmados (OK)', 'Bloqueados (Pendiente)'],
          datasets: [{
            data: [confirmados, bloqueados],
            backgroundColor: ['#10b981', '#f59e0b'],
            borderColor: ['#059669', '#d97706'],
            borderWidth: 1.5
          }]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 450,
            easing: 'easeOutQuart'
          },
          plugins: {
            legend: {
              position: 'bottom',
              labels: { color: textColor, font: { family: 'Outfit', size: 11, weight: 'bold' }, padding: 10 }
            }
          }
        }
      });
    }
  }

  // 2. Chart Módulos Video vs PDF (Bar)
  const chartModEl = document.getElementById('chart-cap-modulos');
  if (chartModEl) {
    const video0 = parsed.filter(r => r.video === 0).length;
    const video1 = parsed.filter(r => r.video === 1).length;
    const video2 = parsed.filter(r => r.video >= 2).length;

    const pdf0 = parsed.filter(r => r.pdf === 0).length;
    const pdf1 = parsed.filter(r => r.pdf === 1).length;
    const pdf2 = parsed.filter(r => r.pdf >= 2).length;

    if (capModulosChartInstance && capModulosChartInstance.canvas === chartModEl) {
      capModulosChartInstance.data.datasets[0].data = [video0, video1, video2];
      capModulosChartInstance.data.datasets[1].data = [pdf0, pdf1, pdf2];
      capModulosChartInstance.update();
    } else {
      if (capModulosChartInstance) {
        try { capModulosChartInstance.destroy(); } catch (e) {}
        capModulosChartInstance = null;
      }
      const ctxMod = chartModEl.getContext('2d');
      capModulosChartInstance = new ChartClass(ctxMod, {
        type: 'bar',
        data: {
          labels: ['0/2 (Sin iniciar)', '1/2 (En proceso)', '2/2 (Completado)'],
          datasets: [
            {
              label: 'Videos Vistos',
              data: [video0, video1, video2],
              backgroundColor: '#38bdf8',
              borderColor: '#0284c7',
              borderWidth: 1,
              borderRadius: 4
            },
            {
              label: 'Manuales PDF',
              data: [pdf0, pdf1, pdf2],
              backgroundColor: '#a78bfa',
              borderColor: '#7c3aed',
              borderWidth: 1,
              borderRadius: 4
            }
          ]
        },
        options: {
          responsive: true,
          maintainAspectRatio: false,
          animation: {
            duration: 450,
            easing: 'easeOutQuart'
          },
          plugins: {
            legend: {
              position: 'top',
              labels: { color: textColor, font: { family: 'Outfit', size: 11, weight: 'bold' } }
            }
          },
          scales: {
            y: {
              beginAtZero: true,
              ticks: { color: mutedTextColor, font: { family: 'Outfit' }, callback: v => Number.isInteger(v) ? v : '' },
              grid: { color: gridColor }
            },
            x: {
              ticks: { color: mutedTextColor, font: { family: 'Outfit', weight: 'bold' } },
              grid: { display: false }
            }
          }
        }
      });
    }
  }
}
