import { getGoogleScriptUrl, setGoogleScriptUrl } from '../config.js';
import { fetchRegistrations } from '../api.js';
import { populateDistrictFilter, updateMetrics } from './metrics.js';
import { renderCharts, renderCapacitacionCharts, destroyAllDashboardCharts } from './charts.js';
import { 
  applyFiltersAndRender, 
  renderCapacitacionView, 
  currentFilteredRegistrations, 
  exportToExcel 
} from './table.js';
import { hideModal } from './modal.js';

let allRegistrations = [];

/**
 * Displays a non-intrusive floating toast notification.
 * @param {string} message - Notification text.
 * @param {string} type - 'success', 'error', or 'info'.
 */
function showToast(message, type = 'success') {
  if (!message || message.includes('undefined')) return;

  let toastContainer = document.getElementById('toast-container');
  if (!toastContainer) {
    toastContainer = document.createElement('div');
    toastContainer.id = 'toast-container';
    document.body.appendChild(toastContainer);
  }

  const toast = document.createElement('div');
  toast.className = `toast toast-${type}`;

  const icon = type === 'success' ? 
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M22 11.08V12a10 10 0 1 1-5.93-9.14"/><polyline points="22 4 12 14.01 9 11.01"/></svg>` :
    type === 'error' ?
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>` :
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>`;

  toast.innerHTML = `${icon} <span>${message}</span>`;
  toastContainer.appendChild(toast);

  setTimeout(() => {
    toast.style.animation = 'slideOut 0.3s cubic-bezier(0.4, 0, 0.2, 1) forwards';
    setTimeout(() => {
      toast.remove();
    }, 300);
  }, 4000);
}

/**
 * Initializes the dashboard view elements, binds tab navigation, and loads spreadsheet data.
 * @param {Function} onLogout - Callback function executed when logging out.
 */
export function initDashboard(onLogout) {
  destroyAllDashboardCharts();
  // Set default theme from localStorage (default to 'light')
  const savedTheme = localStorage.getItem('dashboard-theme') || 'light';
  if (savedTheme === 'light') {
    document.body.classList.add('theme-light');
  } else {
    document.body.classList.remove('theme-light');
  }

  // Initialize Theme Toggle Icon in Header
  const toggleThemeBtn = document.getElementById('btn-toggle-theme');
  function updateThemeUI() {
    const isLight = document.body.classList.contains('theme-light');
    const themeIconSpan = document.getElementById('theme-toggle-icon');
    
    if (isLight) {
      if (themeIconSpan) {
        themeIconSpan.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
      }
      if (toggleThemeBtn) toggleThemeBtn.title = 'Cambiar a Modo Oscuro';
    } else {
      if (themeIconSpan) {
        themeIconSpan.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
      }
      if (toggleThemeBtn) toggleThemeBtn.title = 'Cambiar a Modo Día';
    }
  }
  updateThemeUI();

  if (toggleThemeBtn) {
    toggleThemeBtn.addEventListener('click', () => {
      document.body.classList.toggle('theme-light');
      const currentTheme = document.body.classList.contains('theme-light') ? 'light' : 'dark';
      localStorage.setItem('dashboard-theme', currentTheme);
      updateThemeUI();
      if (allRegistrations.length > 0) {
        const dFilter = document.getElementById('filter-distrito')?.value || '';
        renderCharts(allRegistrations, dFilter, allRegistrations);
        renderCapacitacionCharts(allRegistrations);
      }
    });
  }

  // Mobile Sidebar Toggle
  const btnToggleSidebarMobile = document.getElementById('btn-toggle-sidebar-mobile');
  const btnCloseSidebarMobile = document.getElementById('btn-close-sidebar-mobile');
  const sidebarBackdrop = document.getElementById('sidebar-backdrop');
  const dashboardView = document.getElementById('dashboard-view');

  function openMobileSidebar() {
    if (dashboardView) dashboardView.classList.add('mobile-sidebar-open');
  }

  function closeMobileSidebar() {
    if (dashboardView) dashboardView.classList.remove('mobile-sidebar-open');
  }

  if (btnToggleSidebarMobile) btnToggleSidebarMobile.addEventListener('click', openMobileSidebar);
  if (btnCloseSidebarMobile) btnCloseSidebarMobile.addEventListener('click', closeMobileSidebar);
  if (sidebarBackdrop) sidebarBackdrop.addEventListener('click', closeMobileSidebar);

  document.body.classList.add('full-screen-mode');
  const appContainer = document.getElementById('app');
  if (appContainer) {
    appContainer.classList.add('wide-layout');
  }

  // ====================================================
  // TAB NAVIGATION (4 WINDOWS SOLICITADAS)
  // ====================================================
  const tabWindows = {
    overview: {
      el: document.getElementById('tab-view-overview'),
      btn: document.getElementById('btn-tab-overview'),
      title: 'Control Electoral y Monitoreo',
      subtitle: 'Gestión centralizada de personeros, asignaciones electorales y acreditaciones en tiempo real'
    },
    capacitacion: {
      el: document.getElementById('tab-view-capacitacion'),
      btn: document.getElementById('btn-tab-capacitacion'),
      title: 'Progreso de las Capacitaciones en Gráficas',
      subtitle: 'Monitoreo gráfico de avance en videos, manuales PDF y estado de credenciales oficiales'
    },
    config: {
      el: document.getElementById('tab-view-config'),
      btn: document.getElementById('btn-tab-config'),
      title: 'Conexión al Google Sheet',
      subtitle: 'Administración del enlace web de Google Apps Script y estado de sincronización'
    }
  };

  const headerTitle = document.getElementById('header-view-title');
  const headerSubtitle = document.getElementById('header-view-subtitle');

  function switchTab(tabKey) {
    Object.keys(tabWindows).forEach(k => {
      const tab = tabWindows[k];
      if (tab.el) {
        if (k === tabKey) {
          tab.el.classList.remove('hidden');
          tab.el.classList.add('active');
        } else {
          tab.el.classList.add('hidden');
          tab.el.classList.remove('active');
        }
      }
      if (tab.btn) {
        if (k === tabKey) {
          tab.btn.classList.add('active');
        } else {
          tab.btn.classList.remove('active');
        }
      }
    });

    const activeInfo = tabWindows[tabKey];
    if (activeInfo) {
      if (headerTitle) headerTitle.textContent = activeInfo.title;
      if (headerSubtitle) headerSubtitle.textContent = activeInfo.subtitle;
    }

    closeMobileSidebar();

    // Trigger tab-specific actions
    if (tabKey === 'overview') {
      applyFiltersAndRender(allRegistrations);
    } else if (tabKey === 'capacitacion') {
      renderCapacitacionView(allRegistrations);
      renderCapacitacionCharts(allRegistrations);
    } else if (tabKey === 'config') {
      loadConfigTab();
    }
  }

  // Bind Sidebar Buttons
  Object.keys(tabWindows).forEach(k => {
    const tab = tabWindows[k];
    if (tab.btn) {
      tab.btn.addEventListener('click', () => switchTab(k));
    }
  });

  // KPI Capacitados Card Click -> Go to Capacitacion Tab
  const kpiCardCap = document.getElementById('kpi-card-capacitados');
  if (kpiCardCap) {
    kpiCardCap.addEventListener('click', () => switchTab('capacitacion'));
  }

  // ====================================================
  // TAB-SPECIFIC EVENT LISTENERS
  // ====================================================

  // Overview Tab Filters
  const tableSearch = document.getElementById('table-search');
  const filterDistrito = document.getElementById('filter-distrito');
  const filterRol = document.getElementById('filter-rol');
  const filterExperiencia = document.getElementById('filter-experiencia');
  const filterMovilidad = document.getElementById('filter-movilidad');
  const btnResetFilters = document.getElementById('btn-reset-filters');

  let overviewDebounce = null;
  const triggerOverviewFilter = () => applyFiltersAndRender(allRegistrations);
  const triggerOverviewFilterDebounced = () => {
    if (overviewDebounce) clearTimeout(overviewDebounce);
    overviewDebounce = setTimeout(triggerOverviewFilter, 70);
  };

  if (tableSearch) tableSearch.addEventListener('input', triggerOverviewFilterDebounced);
  if (filterDistrito) filterDistrito.addEventListener('change', triggerOverviewFilter);
  if (filterRol) filterRol.addEventListener('change', triggerOverviewFilter);
  if (filterExperiencia) filterExperiencia.addEventListener('change', triggerOverviewFilter);
  if (filterMovilidad) filterMovilidad.addEventListener('change', triggerOverviewFilter);

  if (btnResetFilters) {
    btnResetFilters.addEventListener('click', () => {
      if (tableSearch) tableSearch.value = '';
      if (filterDistrito) filterDistrito.value = '';
      if (filterRol) filterRol.value = '';
      if (filterExperiencia) filterExperiencia.value = '';
      if (filterMovilidad) filterMovilidad.value = '';
      triggerOverviewFilter();
      showToast("Filtros restablecidos.", "info");
    });
  }

  // Capacitación Tab Symmetrical Filters
  const searchCap = document.getElementById('search-cap');
  const filterCapEstado = document.getElementById('filter-cap-estado');
  const filterCapDistrito = document.getElementById('filter-cap-distrito');
  const filterCapRol = document.getElementById('filter-cap-rol');
  const btnResetCapFilters = document.getElementById('btn-reset-cap-filters');

  let capDebounce = null;
  const triggerCap = () => renderCapacitacionView(allRegistrations);
  const triggerCapDebounced = () => {
    if (capDebounce) clearTimeout(capDebounce);
    capDebounce = setTimeout(triggerCap, 70);
  };

  if (searchCap) searchCap.addEventListener('input', triggerCapDebounced);
  if (filterCapEstado) filterCapEstado.addEventListener('change', triggerCap);
  if (filterCapDistrito) filterCapDistrito.addEventListener('change', triggerCap);
  if (filterCapRol) filterCapRol.addEventListener('change', triggerCap);

  if (btnResetCapFilters) {
    btnResetCapFilters.addEventListener('click', () => {
      if (searchCap) searchCap.value = '';
      if (filterCapEstado) filterCapEstado.value = '';
      if (filterCapDistrito) filterCapDistrito.value = '';
      if (filterCapRol) filterCapRol.value = '';
      triggerCap();
      showToast("Filtros de capacitación restablecidos.", "info");
    });
  }

  // Config Tab Setup & Save
  function loadConfigTab() {
    const inputUrl = document.getElementById('input-tab-sheet-url');
    const syncCountEl = document.getElementById('cfg-sync-count');
    const syncTimeEl = document.getElementById('cfg-sync-time');

    if (inputUrl) inputUrl.value = getGoogleScriptUrl();
    if (syncCountEl) syncCountEl.textContent = `${allRegistrations.length} registros`;
    if (syncTimeEl) syncTimeEl.textContent = new Date().toLocaleTimeString('es-PE');
  }

  const formTabSheet = document.getElementById('form-tab-sheet-url');
  if (formTabSheet) {
    formTabSheet.addEventListener('submit', (e) => {
      e.preventDefault();
      const inputUrl = document.getElementById('input-tab-sheet-url');
      if (inputUrl) {
        setGoogleScriptUrl(inputUrl.value.trim());
        const msg = document.getElementById('tab-url-status-msg');
        if (msg) {
          msg.textContent = 'URL Guardada con éxito';
          msg.classList.remove('hidden');
          setTimeout(() => msg.classList.add('hidden'), 3000);
        }
        showToast("Configuración guardada.", "success");
        loadDashboardData();
      }
    });
  }

  const btnTabResetUrl = document.getElementById('btn-tab-reset-url');
  if (btnTabResetUrl) {
    btnTabResetUrl.addEventListener('click', () => {
      setGoogleScriptUrl('');
      const inputUrl = document.getElementById('input-tab-sheet-url');
      if (inputUrl) inputUrl.value = getGoogleScriptUrl();
      showToast("URL por defecto restaurada.", "info");
      loadDashboardData();
    });
  }

  // Export to Excel Button
  const handleExport = () => {
    const dataToExport = currentFilteredRegistrations.length > 0 ? currentFilteredRegistrations : allRegistrations;
    exportToExcel(dataToExport);
    showToast(`Exportando ${dataToExport.length} registros a Excel...`, "success");
  };

  const btnExportExcel = document.getElementById('btn-export-excel');
  if (btnExportExcel) btnExportExcel.addEventListener('click', handleExport);

  // Detail Modal Close
  const btnCloseModal = document.getElementById('btn-close-modal');
  const detailModal = document.getElementById('detail-modal');

  if (btnCloseModal) btnCloseModal.addEventListener('click', hideModal);
  if (detailModal) {
    detailModal.addEventListener('click', (e) => {
      if (e.target.id === 'detail-modal') hideModal();
    });
  }

  // Logout button
  const logoutBtn = document.getElementById('btn-logout-dashboard');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      destroyAllDashboardCharts();
      document.body.classList.remove('full-screen-mode');
      if (appContainer) appContainer.classList.remove('wide-layout');
      onLogout();
    });
  }

  // Refresh & Retry
  const refreshBtn = document.getElementById('btn-refresh');
  if (refreshBtn) refreshBtn.addEventListener('click', loadDashboardData);

  const retryBtn = document.getElementById('btn-retry-dashboard');
  if (retryBtn) retryBtn.addEventListener('click', loadDashboardData);

  // Load initial data
  loadDashboardData();
}

/**
 * Fetches registrations from Google Sheets Apps Script API, then updates views.
 */
async function loadDashboardData() {
  const loader = document.getElementById('dashboard-loader');
  const errorCard = document.getElementById('dashboard-error');
  const content = document.getElementById('dashboard-content');
  const refreshIcon = document.querySelector('.btn-refresh-custom svg');

  if (refreshIcon) refreshIcon.classList.add('spinning');
  
  const isFirstLoad = allRegistrations.length === 0;
  if (isFirstLoad) {
    if (loader) loader.classList.remove('hidden');
    if (content) content.classList.add('hidden');
  }
  
  if (errorCard) errorCard.classList.add('hidden');

  try {
    const data = await fetchRegistrations();
    allRegistrations = data;
    
    populateDistrictFilter(data);
    updateMetrics(data, data);

    const chartsContainer = document.getElementById('charts-section-container');
    if (chartsContainer) {
      if (data.length === 0) {
        chartsContainer.classList.add('hidden');
      } else {
        chartsContainer.classList.remove('hidden');
        const dFilter = document.getElementById('filter-distrito')?.value || '';
        renderCharts(data, dFilter, data);
        renderCapacitacionCharts(data);
      }
    }

    applyFiltersAndRender(allRegistrations);

    if (content) content.classList.remove('hidden');
    
    if (isFirstLoad) {
      showToast(`¡Sincronización completada! ${data.length} registros cargados.`, "success");
    } else {
      showToast(`Sincronización completada: ${data.length} registros cargados.`, "success");
    }
  } catch (err) {
    console.error("Error loading dashboard data:", err);
    
    if (isFirstLoad) {
      const errText = document.getElementById('dashboard-error-text');
      if (errText) {
        errText.innerHTML = `
          <strong>No se pudo conectar con Google Apps Script.</strong><br/>
          <span style="font-size: 0.85rem; color: #94a3b8; display: block; margin-top: 6px;">
            ${err.message || 'Error de red.'}<br/>
            💡 <em>Asegúrese de que en Google Sheets la implementación esté configurada con <strong>Acceso: "Cualquiera"</strong> y haya publicado una <strong>"Nueva versión"</strong>.</em>
          </span>
        `;
      }
      if (errorCard) errorCard.classList.remove('hidden');
    } else {
      showToast("Error al sincronizar con Google Sheets.", "error");
    }
  } finally {
    if (loader) loader.classList.add('hidden');
    if (refreshIcon) refreshIcon.classList.remove('spinning');
  }
}
