import { icons } from '../icons.js';

/**
 * Generates the main HTML structure of the Superadmin Dashboard.
 * @returns {string} HTML string.
 */
export function getDashboardHTML() {
  return `
    <div class="dashboard-wrapper" id="dashboard-view">
      <!-- MOBILE BACKDROP OVERLAY -->
      <div class="sidebar-backdrop" id="sidebar-backdrop"></div>

      <!-- PANEL 1: SIDEBAR LATERAL (Distinct Color Block - Slate 800) -->
      <aside class="dashboard-sidebar" id="dashboard-sidebar">
        <div class="sidebar-header">
          <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <span class="brand-badge-dashboard">${icons.dashboard} ConteoLima</span>
            <button id="btn-close-sidebar-mobile" class="btn-mobile-close" title="Cerrar Menú">&times;</button>
          </div>
          <span class="sidebar-title">Administración</span>
        </div>

        <nav class="sidebar-nav">
          <div class="sidebar-menu">
            <button id="btn-sidebar-dashboard" class="sidebar-menu-btn active">
              ${icons.dashboard} <span>Dashboard</span>
            </button>
            <button id="btn-sidebar-config" class="sidebar-menu-btn">
              <svg xmlns="http://www.w3.org/2000/svg" width="24" height="24" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 .33-1.82 1.65 1.65 0 0 0-1.51-1H3a2 2 0 0 1 0-4h.09A1.65 1.65 0 0 0 4.6 9a1.65 1.65 0 0 0-.33-1.82l-.06-.06a2 2 0 1 1 2.83-2.83l.06.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83 2.83l-.06.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              <span>Configuración</span>
            </button>
            <button id="btn-toggle-theme" class="sidebar-menu-btn">
              <span id="theme-toggle-icon" style="display: flex; align-items: center;"></span> 
              <span id="theme-toggle-text">Modo Oscuro</span>
            </button>
          </div>
        </nav>

        <div class="sidebar-footer">
          <span>© 2026 Elecciones v1.2</span>
        </div>
      </aside>

      <!-- MAIN WRAPPER -->
      <div class="dashboard-main-area">
        <!-- PANEL 2: ENCABEZADO SUPERIOR (Distinct Color Block - Slate 900) -->
        <header class="dashboard-header-top">
          <div class="header-left" style="display: flex; align-items: center; gap: 10px;">
            <button id="btn-toggle-sidebar-mobile" class="btn-mobile-menu" title="Abrir Menú">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div>
              <h1 class="dashboard-title-top">Panel de Control</h1>
              <p class="dashboard-subtitle-top">Visualización y monitoreo en tiempo real de personeros registrados</p>
            </div>
          </div>
          <div class="header-actions">
            <button id="btn-refresh" class="btn-refresh-custom" title="Actualizar datos">
              ${icons.refresh}
              <span>Actualizar</span>
            </button>
            <button id="btn-logout-dashboard" class="btn-logout-dashboard" title="Cerrar Sesión">
              ${icons.logout}
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </header>

        <!-- PANEL 3: CONTENIDO PRINCIPAL (Distinct Color Block - Slate 950) -->
        <main class="dashboard-content-body">
          
          <!-- LOADER -->
          <div id="dashboard-loader" class="dashboard-loader-overlay">
            <div class="loader-spinner"></div>
            <p>Sincronizando registros con Google Sheets...</p>
          </div>

          <!-- ERROR STATE -->
          <div id="dashboard-error" class="dashboard-error-card hidden">
            ${icons.alert}
            <h3>Error al sincronizar datos</h3>
            <p id="dashboard-error-text">No se pudo establecer conexión con el URL de Google Sheets provisto.</p>
            <button id="btn-retry-dashboard" class="btn-secondary" style="margin-top: 12px; width: auto; padding: 10px 20px;">Reintentar</button>
          </div>

          <!-- MAIN CONTENT -->
          <div id="dashboard-content" class="dashboard-content hidden">
            <!-- GLOBAL FILTERS (Top placement) -->
            <div class="table-filters-container" style="margin: 0 0 14px 0; width: 100%; display: flex; flex-wrap: wrap; gap: 12px; align-items: center; justify-content: space-between; background: var(--card-bg); padding: 12px 16px; border-radius: var(--radius-sm); border: 1px solid var(--card-border);">
              <div style="display: flex; align-items: center; gap: 8px; font-weight: bold; color: var(--secondary-color); font-size: 0.85rem;">
                <span>🔍 Filtros de Búsqueda:</span>
              </div>
              <div style="display: flex; flex-wrap: wrap; gap: 10px; flex: 1; justify-content: flex-end;">
                <!-- Search -->
                <div class="search-box" style="min-width: 250px;">
                  <span class="search-box-icon">${icons.search}</span>
                  <input type="text" id="table-search" placeholder="Buscar por nombre, DNI, distrito, centro..." class="search-box-input">
                </div>

                <!-- Filter select 1: Distrito -->
                <select id="filter-distrito" class="filter-select">
                  <option value="">Todos los Distritos</option>
                  <option value="__incompletos__">⚠️ Distritos Incompletos (Faltan Personeros)</option>
                </select>

                <!-- Filter select 2: Experiencia -->
                <select id="filter-experiencia" class="filter-select">
                  <option value="">Cualquier Experiencia</option>
                  <option value="Sí">Con Experiencia</option>
                  <option value="No">Sin Experiencia</option>
                </select>

                <!-- Filter select 3: Movilidad -->
                <select id="filter-movilidad" class="filter-select">
                  <option value="">Cualquier Movilidad</option>
                  <option value="Sí">Con Movilidad</option>
                  <option value="No">Sin Movilidad</option>
                </select>
              </div>
            </div>

            <!-- SECTION 1: METRICS -->
            <h2 class="section-title-dashboard">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 2px;"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>
              Resumen de Métricas
            </h2>
            
            <section class="metrics-grid">
              <!-- Card 1: Total Registrados -->
              <div class="metric-card card-blue">
                <div class="metric-icon-wrapper">${icons.users}</div>
                <div class="metric-details">
                  <span class="metric-label">Total Registrados</span>
                  <h2 class="metric-value" id="val-total">0</h2>
                </div>
              </div>
              
              <!-- Card 2: Con Experiencia -->
              <div class="metric-card card-green">
                <div class="metric-icon-wrapper">${icons.checkCircle}</div>
                <div class="metric-details">
                  <span class="metric-label">Con Experiencia</span>
                  <h2 class="metric-value" id="val-experiencia">0</h2>
                </div>
              </div>

              <!-- Card 3: Compromiso 2da Vuelta -->
              <div class="metric-card card-purple">
                <div class="metric-icon-wrapper">${icons.calendar}</div>
                <div class="metric-details">
                  <span class="metric-label">Compromiso 2da Vuelta</span>
                  <h2 class="metric-value" id="val-compromiso">0</h2>
                </div>
              </div>

              <!-- Card 4: Con Movilidad Propia -->
              <div class="metric-card card-orange">
                <div class="metric-icon-wrapper">${icons.car}</div>
                <div class="metric-details">
                  <span class="metric-label">Con Movilidad</span>
                  <h2 class="metric-value" id="val-movilidad">0</h2>
                </div>
              </div>

              <!-- Card 5: KPI Distrito -->
              <div class="metric-card card-kpi" id="metric-kpi-card" style="display: flex; flex-direction: column; align-items: stretch; justify-content: center; gap: 8px;">
                <div style="display: flex; align-items: center; gap: 10px;">
                  <div class="metric-icon-wrapper" style="border-color: #f59e0b; color: #f59e0b; background: var(--bg-color);">
                    <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="stroke: #f59e0b;"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                  </div>
                  <div class="metric-details" style="flex: 1;">
                    <span class="metric-label" style="color: #f59e0b;">Progreso KPI Meta</span>
                    <span style="font-size: 0.8rem; font-weight: 700; color: var(--secondary-color);" id="kpi-district-name">Todos los Distritos</span>
                  </div>
                </div>
                <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 2px;">
                  <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 700; color: var(--text-main);">
                    <span id="kpi-progress-text">0 / 200</span>
                    <span id="kpi-pct-text">0%</span>
                  </div>
                  <div style="width: 100%; height: 6px; background: rgba(0, 0, 0, 0.05); border-radius: 3px; overflow: hidden; border: 1px solid var(--card-border);">
                    <div id="kpi-progress-bar" style="width: 0%; height: 100%; background: #f59e0b; transition: width 0.3s ease;"></div>
                  </div>
                </div>
              </div>
            </section>

            <hr class="dashboard-section-divider" id="metrics-divider">

            <!-- SECTION 2: CHARTS CONTAINER -->
            <div id="charts-section-container">
              <h2 class="section-title-dashboard">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#10b981" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 2px;"><line x1="18" y1="20" x2="18" y2="10"/><line x1="12" y1="20" x2="12" y2="4"/><line x1="6" y1="20" x2="6" y2="14"/></svg>
                Gráficos y Análisis
              </h2>

              <!-- CHARTS SECTION (Distribución) -->
              <section class="dashboard-charts-grid" style="grid-template-columns: 1fr;">
                <!-- Card 1: Distritos con Contadores -->
                <div class="chart-container-card" style="width: 100%;">
                  <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 12px; margin-bottom: 14px;">
                    <h3 class="chart-card-title" style="margin: 0;">Resultado LimaMetropolitana</h3>
                    
                    <div style="display: flex; align-items: center; gap: 10px; flex-wrap: wrap;">
                      <div style="background: rgba(14, 165, 233, 0.12); border: 1px solid rgba(14, 165, 233, 0.3); border-radius: 8px; padding: 6px 14px; display: flex; align-items: center; gap: 8px;">
                        <span style="font-size: 0.78rem; color: var(--text-muted); font-weight: 600;">Registrados:</span>
                        <strong id="distrib-registrados-count" style="font-size: 1.1rem; color: #0ea5e9; font-weight: 800;">0</strong>
                      </div>
                    </div>
                  </div>
                  <div class="canvas-wrapper" style="height: 280px;">
                    <canvas id="chart-distritos"></canvas>
                  </div>
                </div>
              </section>

              <hr class="dashboard-section-divider">
            </div>

            <!-- SECTION 3: TABLE -->
            <h2 class="section-title-dashboard">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fb923c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round" style="margin-right: 2px;"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
              Detalle de Registros
            </h2>

            <section class="table-container-card">
              <div class="table-card-header" style="border-bottom: 1px solid var(--border-color); padding-bottom: 12px;">
                <h3 class="table-card-title" style="margin: 0;">Detalle de Personeros Registrados</h3>
              </div>

              <!-- Table wrapper -->
              <div class="table-responsive-wrapper">
                <table class="dashboard-table">
                  <thead>
                    <tr>
                      <th>ID</th>
                      <th>Nombres y Apellidos</th>
                      <th>D.N.I.</th>
                      <th>Distrito</th>
                      <th>Centro Votación</th>
                      <th>Mesa</th>
                      <th>Celular</th>
                      <th>WhatsApp</th>
                      <th>Capacitación</th>
                      <th>Exp.</th>
                      <th>Comp. 2da</th>
                      <th>Mov.</th>
                      <th class="actions-header">Acciones</th>
                    </tr>
                  </thead>
                  <tbody id="table-body">
                    <!-- Rows injected dynamically -->
                  </tbody>
                </table>
                
                <!-- Empty state inside table -->
                <div id="table-empty" class="table-empty-state hidden">
                  ${icons.alert}
                  <p>No se encontraron personeros con los filtros seleccionados.</p>
                </div>
              </div>
              <div class="table-footer-info" style="display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 10px;">
                <span>Mostrando <strong id="val-shown-count">0</strong> de <strong id="val-total-count">0</strong> registros (máx. 10)</span>
                <div style="display: flex; align-items: center; gap: 8px;">
                  <button type="button" id="btn-export-excel" class="btn-submit" style="margin: 0; width: auto; padding: 6px 12px; font-size: 0.8rem; background: #10b981; color: #fff; display: inline-flex; align-items: center; gap: 6px; border-radius: 6px; font-weight: 600; cursor: pointer; border: none;" title="Exportar a Excel">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4"/><polyline points="7 10 12 15 17 10"/><line x1="12" y1="15" x2="12" y2="3"/></svg>
                    <span>Exportar Excel</span>
                  </button>
                  <button id="btn-view-all-records" class="btn-secondary" style="margin: 0; padding: 6px 12px; font-size: 0.8rem; display: inline-flex; align-items: center; gap: 6px; border: 1px solid var(--border-color); background: rgba(56, 189, 248, 0.1); color: var(--primary-color); font-weight: 600; cursor: pointer; border-radius: 6px; transition: all 0.2s;">
                    👁️ Ver todos
                  </button>
                </div>
              </div>
            </section>
          </div>
        </main>
      </div>
    </div>

    <!-- DETAIL MODAL -->
    <div id="detail-modal" class="detail-modal-overlay hidden">
      <div class="detail-modal-card">
        <div class="modal-header">
          <h3>Detalle Completo del Personero</h3>
          <button id="btn-close-modal" class="btn-close-modal-custom">&times;</button>
        </div>
        <div class="modal-body" id="modal-details-content">
          <!-- Details injected dynamically -->
        </div>
      </div>
    </div>

    <!-- CONFIGURATION MODAL -->
    <div id="config-modal" class="detail-modal-overlay hidden">
      <div class="detail-modal-card" style="max-width: 520px; width: 90%;">
        <div class="modal-header">
          <h3>Configuración de Conexión</h3>
          <button id="btn-close-config" class="btn-close-modal-custom">&times;</button>
        </div>
        <div class="modal-body" style="padding: 20px;">
          <form id="form-sheet-url" class="modal-form-config">
            <div class="form-group-config">
              <label class="form-label-config">Google Apps Script Web App URL</label>
              <textarea id="input-sheet-url" class="form-input-config" placeholder="Pega el URL de Google Script..."></textarea>
              <p class="form-help-config">Esta URL conecta el panel directamente con la hoja de Google Sheets. Asegúrese de que el script esté publicado con acceso público ('Anyone').</p>
            </div>
            <div class="form-actions-config">
              <button type="button" id="btn-reset-url" class="btn-reset-config">Restaurar Defecto</button>
              <button type="submit" class="btn-save-config">Guardar URL</button>
            </div>
            <div id="url-status-msg" class="url-status-message hidden">URL Actualizada con éxito</div>
          </form>
        </div>
      </div>
    </div>

    <!-- FULL TABLE MODAL (VER TODO) -->
    <div id="full-table-modal" class="detail-modal-overlay hidden" style="backdrop-filter: blur(10px); z-index: 10000;">
      <div class="detail-modal-card" style="max-width: 95%; width: 1200px; max-height: 85vh; display: flex; flex-direction: column; background: var(--card-background);">
        <div class="modal-header" style="padding: 14px 20px; border-bottom: 1px solid var(--border-color); display: flex; justify-content: space-between; align-items: center;">
          <h3 style="font-size: 1.15rem; font-weight: 700; display: flex; align-items: center; gap: 8px; margin: 0;">
            📋 Todos los Personeros Registrados
          </h3>
          <button id="btn-close-full-table" class="btn-close-modal-custom" style="font-size: 1.8rem; background: none; border: none; color: var(--text-color); cursor: pointer;">&times;</button>
        </div>
        <div class="modal-body" style="flex: 1; overflow-y: auto; padding: 12px 20px 0 20px;">
          <div class="table-responsive-wrapper" style="max-height: 100%;">
            <table class="dashboard-table">
              <thead>
                <tr>
                  <th>ID</th>
                  <th>Nombres y Apellidos</th>
                  <th>D.N.I.</th>
                  <th>Distrito</th>
                  <th>Centro Votación</th>
                  <th>Mesa</th>
                  <th>Celular</th>
                  <th>WhatsApp</th>
                  <th>Capacitación</th>
                  <th>Exp.</th>
                  <th>Comp. 2da</th>
                  <th>Mov.</th>
                </tr>
              </thead>
              <tbody id="full-table-body">
                <!-- Rows injected dynamically -->
              </tbody>
            </table>
          </div>
        </div>
        <div style="padding: 10px 20px; border-top: 1px solid var(--border-color); display: flex; align-items: center; justify-content: flex-start; background: var(--card-background);">
          <span style="font-size: 0.82rem; color: var(--text-muted); font-weight: 600;">
            Total de registros mostrados: <strong id="val-full-table-count" style="color: var(--primary-color); font-weight: 800;">0</strong>
          </span>
        </div>
      </div>
    </div>
  `;
}
