import { getGoogleScriptUrl, setGoogleScriptUrl } from '../config.js';
import { fetchRegistrations } from '../api.js';
import { populateDistrictFilter, updateMetrics } from './metrics.js';
import { renderCharts } from './charts.js';
import { applyFiltersAndRender, renderFullTableRows, currentFilteredRegistrations, exportToExcel } from './table.js';
import { hideModal } from './modal.js';

let allRegistrations = [];

/**
 * Displays a non-intrusive floating toast notification.
 * @param {string} message - Notification text.
 * @param {string} type - 'success', 'error', or 'info'.
 */
function showToast(message, type = 'success') {
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
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" x2="12" y1="8" y2="12"/><line x1="12" x2="12.01" y1="16" y2="16"/></svg>` :
    `<svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><line x1="12" x2="12" y1="2" y2="6"/><line x1="12" x2="12" y1="18" y2="22"/><line x1="4.93" x2="7.76" y1="4.93" y2="7.76"/><line x1="16.24" x2="19.07" y1="16.24" y2="19.07"/><line x1="2" x2="6" y1="12" y2="12"/><line x1="18" x2="22" y1="12" y2="12"/><line x1="4.93" x2="7.76" y1="19.07" y2="16.24"/><line x1="16.24" x2="19.07" y1="7.76" y2="4.93"/></svg>`;

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
 * Initializes the dashboard view elements, binds DOM event handlers, and loads initial spreadsheet data.
 * @param {Function} onLogout - Callback function executed when logging out.
 */
export function initDashboard(onLogout) {
  // Set default theme from localStorage (default to 'light')
  const savedTheme = localStorage.getItem('dashboard-theme') || 'light';
  if (savedTheme === 'light') {
    document.body.classList.add('theme-light');
  } else {
    document.body.classList.remove('theme-light');
  }

  // Initialize Theme Toggle UI
  const toggleThemeBtn = document.getElementById('btn-toggle-theme');
  function updateThemeUI() {
    const isLight = document.body.classList.contains('theme-light');
    const themeIconSpan = document.getElementById('theme-toggle-icon');
    const themeTextSpan = document.getElementById('theme-toggle-text');
    
    if (isLight) {
      if (themeIconSpan) themeIconSpan.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><path d="M21 12.79A9 9 0 1 1 11.21 3 7 7 0 0 0 21 12.79z"></path></svg>`;
      if (themeTextSpan) themeTextSpan.textContent = 'Modo Oscuro';
    } else {
      if (themeIconSpan) themeIconSpan.innerHTML = `<svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 6px;"><circle cx="12" cy="12" r="5"></circle><line x1="12" y1="1" x2="12" y2="3"></line><line x1="12" y1="21" x2="12" y2="23"></line><line x1="4.22" y1="4.22" x2="5.64" y2="5.64"></line><line x1="18.36" y1="18.36" x2="19.78" y2="19.78"></line><line x1="1" y1="12" x2="3" y2="12"></line><line x1="21" y1="12" x2="23" y2="12"></line><line x1="4.22" y1="19.78" x2="5.64" y2="18.36"></line><line x1="18.36" y1="5.64" x2="19.78" y2="4.22"></line></svg>`;
      if (themeTextSpan) themeTextSpan.textContent = 'Modo Día';
    }
  }
  updateThemeUI();

  if (toggleThemeBtn) {
    toggleThemeBtn.addEventListener('click', () => {
      document.body.classList.toggle('theme-light');
      const currentTheme = document.body.classList.contains('theme-light') ? 'light' : 'dark';
      localStorage.setItem('dashboard-theme', currentTheme);
      updateThemeUI();
      // Re-render charts so their scale/label colors adjust to the new theme
      if (allRegistrations.length > 0) {
        const dFilter = document.getElementById('filter-distrito')?.value || '';
        renderCharts(allRegistrations, dFilter, allRegistrations);
      }
    });
  }

  // Mobile Sidebar Toggle Listeners
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

  // Set app container to wide mode and full screen body mode
  document.body.classList.add('full-screen-mode');
  const appContainer = document.getElementById('app');
  if (appContainer) {
    appContainer.classList.add('wide-layout');
  }

  // Load current Sheet URL into config Modal textarea
  const urlInput = document.getElementById('input-sheet-url');
  if (urlInput) {
    urlInput.value = getGoogleScriptUrl();
  }

  // Config Modal open/close listeners
  const configModal = document.getElementById('config-modal');
  const btnSidebarConfig = document.getElementById('btn-sidebar-config');
  const btnCloseConfig = document.getElementById('btn-close-config');

  if (btnSidebarConfig && configModal) {
    btnSidebarConfig.addEventListener('click', () => {
      configModal.classList.remove('hidden');
    });
  }

  if (btnCloseConfig && configModal) {
    btnCloseConfig.addEventListener('click', () => {
      configModal.classList.add('hidden');
    });
  }

  if (configModal) {
    configModal.addEventListener('click', (e) => {
      if (e.target.id === 'config-modal') {
        configModal.classList.add('hidden');
      }
    });
  }

  // Handle Sheet URL submission
  const urlForm = document.getElementById('form-sheet-url');
  if (urlForm) {
    urlForm.addEventListener('submit', (e) => {
      e.preventDefault();
      const newUrl = urlInput.value.trim();
      setGoogleScriptUrl(newUrl);

      const msg = document.getElementById('url-status-msg');
      if (msg) {
        msg.textContent = 'URL Guardada con éxito';
        msg.classList.remove('hidden');
        setTimeout(() => {
          msg.classList.add('hidden');
        }, 3000);
      }

      showToast("Configuración guardada. Sincronizando...", "success");

      // Reload dashboard data using new URL
      loadDashboardData();

      // Close modal after saving
      setTimeout(() => {
        if (configModal) configModal.classList.add('hidden');
      }, 1200);
    });
  }

  // Handle Sheet URL Reset
  const resetUrlBtn = document.getElementById('btn-reset-url');
  if (resetUrlBtn) {
    resetUrlBtn.addEventListener('click', () => {
      setGoogleScriptUrl(''); // resets to default
      if (urlInput) {
        urlInput.value = getGoogleScriptUrl();
      }

      const msg = document.getElementById('url-status-msg');
      if (msg) {
        msg.textContent = 'URL por defecto cargada';
        msg.classList.remove('hidden');
        setTimeout(() => {
          msg.classList.add('hidden');
        }, 3000);
      }

      showToast("URL por defecto restaurada.", "info");
      loadDashboardData();

      // Close modal after resetting
      setTimeout(() => {
        if (configModal) configModal.classList.add('hidden');
      }, 1200);
    });
  }

  // Logout button
  const logoutBtn = document.getElementById('btn-logout-dashboard');
  if (logoutBtn) {
    logoutBtn.addEventListener('click', () => {
      document.body.classList.remove('full-screen-mode');
      if (appContainer) {
        appContainer.classList.remove('wide-layout');
      }
      onLogout();
    });
  }

  // Refresh and retry buttons
  const refreshBtn = document.getElementById('btn-refresh');
  if (refreshBtn) {
    refreshBtn.addEventListener('click', loadDashboardData);
  }

  const retryBtn = document.getElementById('btn-retry-dashboard');
  if (retryBtn) {
    retryBtn.addEventListener('click', loadDashboardData);
  }

  // Set up search and filter listeners
  const tableSearch = document.getElementById('table-search');
  const filterDistrito = document.getElementById('filter-distrito');
  const filterExperiencia = document.getElementById('filter-experiencia');
  const filterMovilidad = document.getElementById('filter-movilidad');

  if (tableSearch) tableSearch.addEventListener('input', () => applyFiltersAndRender(allRegistrations));
  if (filterDistrito) filterDistrito.addEventListener('change', () => applyFiltersAndRender(allRegistrations));
  if (filterExperiencia) filterExperiencia.addEventListener('change', () => applyFiltersAndRender(allRegistrations));
  if (filterMovilidad) filterMovilidad.addEventListener('change', () => applyFiltersAndRender(allRegistrations));

  // Close modal listeners
  const btnCloseModal = document.getElementById('btn-close-modal');
  const btnModalClose = document.getElementById('btn-modal-close');
  const detailModal = document.getElementById('detail-modal');

  if (btnCloseModal) btnCloseModal.addEventListener('click', hideModal);
  if (btnModalClose) btnModalClose.addEventListener('click', hideModal);
  if (detailModal) {
    detailModal.addEventListener('click', (e) => {
      if (e.target.id === 'detail-modal') hideModal();
    });
  }

  // Listeners para el modal de visualización completa de registros
  const btnViewAll = document.getElementById('btn-view-all-records');
  const fullTableModal = document.getElementById('full-table-modal');
  const btnCloseFullTable = document.getElementById('btn-close-full-table');
  const btnCloseFullTableBottom = document.getElementById('btn-close-full-table-bottom');

  if (btnViewAll && fullTableModal) {
    btnViewAll.addEventListener('click', () => {
      renderFullTableRows(currentFilteredRegistrations);
      fullTableModal.classList.remove('hidden');
    });
  }

  if (btnCloseFullTable) {
    btnCloseFullTable.addEventListener('click', () => {
      fullTableModal.classList.add('hidden');
    });
  }

  if (btnCloseFullTableBottom) {
    btnCloseFullTableBottom.addEventListener('click', () => {
      fullTableModal.classList.add('hidden');
    });
  }

  if (fullTableModal) {
    fullTableModal.addEventListener('click', (e) => {
      if (e.target.id === 'full-table-modal') {
        fullTableModal.classList.add('hidden');
      }
    });
  }

  // Listeners para exportar a Excel
  const btnExportExcel = document.getElementById('btn-export-excel');
  const btnExportExcelModal = document.getElementById('btn-export-excel-modal');

  if (btnExportExcel) {
    btnExportExcel.addEventListener('click', () => {
      const dataToExport = currentFilteredRegistrations.length > 0 ? currentFilteredRegistrations : allRegistrations;
      exportToExcel(dataToExport);
    });
  }

  if (btnExportExcelModal) {
    btnExportExcelModal.addEventListener('click', () => {
      const dataToExport = currentFilteredRegistrations.length > 0 ? currentFilteredRegistrations : allRegistrations;
      exportToExcel(dataToExport);
    });
  }

  // Load initial data
  loadDashboardData();
}

/**
 * Fetches registrations from Google Sheets Apps Script API, then triggers metrics update, charts render and table render.
 */
async function loadDashboardData() {
  const loader = document.getElementById('dashboard-loader');
  const errorCard = document.getElementById('dashboard-error');
  const content = document.getElementById('dashboard-content');
  const refreshIcon = document.querySelector('.btn-refresh-custom svg');

  if (refreshIcon) refreshIcon.classList.add('spinning');
  
  // Show standard loader overlay ONLY on first load (when allRegistrations is empty)
  // Otherwise, do a smooth background sync with a Toast notification!
  const isFirstLoad = allRegistrations.length === 0;
  if (isFirstLoad) {
    if (loader) loader.classList.remove('hidden');
    if (content) content.classList.add('hidden');
  } else {
    showToast("Sincronizando con Google Sheets...", "info");
  }
  
  if (errorCard) errorCard.classList.add('hidden');

  try {
    const data = await fetchRegistrations();
    allRegistrations = data;
    
    // Populate district select filter
    populateDistrictFilter(data);

    // Compute metrics
    updateMetrics(data);

    // Hide/show charts container and metrics divider depending on database occupancy
    const chartsContainer = document.getElementById('charts-section-container');
    const metricsDivider = document.getElementById('metrics-divider');
    if (chartsContainer) {
      if (data.length === 0) {
        chartsContainer.classList.add('hidden');
        if (metricsDivider) metricsDivider.classList.add('hidden');
      } else {
        chartsContainer.classList.remove('hidden');
        if (metricsDivider) metricsDivider.classList.remove('hidden');
        const dFilter = document.getElementById('filter-distrito')?.value || '';
        renderCharts(data, dFilter, data);
      }
    }

    // Render Table
    applyFiltersAndRender(allRegistrations);

    if (content) content.classList.remove('hidden');
    
    if (isFirstLoad) {
      showToast("Datos sincronizados con éxito.", "success");
    } else {
      showToast(`Sincronización exitosa: ${data.length} registros cargados.`, "success");
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
