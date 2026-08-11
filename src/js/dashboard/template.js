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

      <!-- PANEL LATERAL IZQUIERDO (3 OPCIONES PRINCIPALES) -->
      <aside class="dashboard-sidebar" id="dashboard-sidebar">
        <div class="sidebar-header">
          <div style="display: flex; justify-content: space-between; align-items: center; width: 100%;">
            <span class="brand-badge-dashboard">${icons.shield} ConteoLima</span>
            <button id="btn-close-sidebar-mobile" class="btn-mobile-close" title="Cerrar Menú">&times;</button>
          </div>
          <span class="sidebar-title">Somos Perú 2026</span>
        </div>

        <nav class="sidebar-nav">
          <div class="sidebar-section-title">PANEL DE NAVEGACIÓN</div>
          <div class="sidebar-menu">
            <button id="btn-tab-overview" class="sidebar-menu-btn active" data-tab="overview">
              ${icons.dashboard} <span>Panel General</span>
            </button>
            <button id="btn-tab-capacitacion" class="sidebar-menu-btn" data-tab="capacitacion">
              ${icons.graduation} <span>Progreso de Capacitaciones</span>
            </button>
            <button id="btn-tab-config" class="sidebar-menu-btn" data-tab="config">
              <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="3"/><path d="M19.4 15a1.65 1.65 0 0 0 .33 1.82l.06.06a2 2 0 1 1-2.83 2.83l-.06-.06a1.65 1.65 0 0 0-1.82-.33 1.65 1.65 0 0 0-1 1.51V21a2 2 0 0 1-4 0v-.09A1.65 1.65 0 0 0 9 19.4a1.65 1.65 0 0 0-1.82.33l-.06.06a2 2 0 1 1-2.83-2.83l.06-.06a1.65 1.65 0 0 0 1.82.33H9a1.65 1.65 0 0 0 1-1.51V3a2 2 0 0 1 4 0v.09a1.65 1.65 0 0 0 1 1.51 1.65 1.65 0 0 0 1.82-.33l.06-.06a2 2 0 1 1 2.83-2.83l-.06-.06a1.65 1.65 0 0 0-.33 1.82V9a1.65 1.65 0 0 0 1.51 1H21a2 2 0 0 1 0 4h-.09a1.65 1.65 0 0 0-1.51 1z"/></svg>
              <span>Conexión al Google Sheet</span>
            </button>
          </div>
        </nav>

        <div class="sidebar-footer">
          <div style="font-size: 0.72rem; color: var(--text-muted); line-height: 1.4;">
            <strong>Somos Perú 2026</strong><br>
            Defensa y Control del Voto
          </div>
        </div>
      </aside>

      <!-- MAIN AREA WRAPPER -->
      <div class="dashboard-main-area">
        <!-- HEADER SUPERIOR -->
        <header class="dashboard-header-top">
          <div class="header-left" style="display: flex; align-items: center; gap: 12px;">
            <button id="btn-toggle-sidebar-mobile" class="btn-mobile-menu" title="Abrir Menú">
              <svg xmlns="http://www.w3.org/2000/svg" width="22" height="22" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="3" y1="12" x2="21" y2="12"></line><line x1="3" y1="6" x2="21" y2="6"></line><line x1="3" y1="18" x2="21" y2="18"></line></svg>
            </button>
            <div>
              <h1 class="dashboard-title-top" style="display: flex; align-items: center; gap: 8px; margin: 0;">
                <span id="header-view-title">Control Electoral y Monitoreo</span>
              </h1>
              <p class="dashboard-subtitle-top" id="header-view-subtitle" style="margin: 2px 0 0 0;">Gestión centralizada de personeros, asignaciones electorales y cobertura territorial</p>
            </div>
          </div>
          
          <!-- BOTONES DE ACCIÓN: TEMA, REFRESH Y SALIR -->
          <div class="header-actions" style="display: flex; align-items: center; gap: 8px;">
            <button id="btn-toggle-theme" class="btn-theme-icon-only" title="Cambiar Tema">
              <span id="theme-toggle-icon" style="display: flex; align-items: center; justify-content: center;"></span>
            </button>
            <button id="btn-refresh" class="btn-refresh-custom" title="Sincronizar datos">
              ${icons.refresh}
              <span>Sincronizar</span>
            </button>
            <button id="btn-logout-dashboard" class="btn-logout-dashboard" title="Cerrar Sesión">
              ${icons.logout}
              <span>Cerrar Sesión</span>
            </button>
          </div>
        </header>

        <!-- CONTENIDO PRINCIPAL -->
        <main class="dashboard-content-body">
          
          <!-- LOADER -->
          <div id="dashboard-loader" class="dashboard-loader-overlay">
            <div class="loader-spinner"></div>
            <p>Sincronizando información...</p>
          </div>

          <!-- ERROR STATE -->
          <div id="dashboard-error" class="dashboard-error-card hidden">
            ${icons.alert}
            <h3>Error de Conexión</h3>
            <p id="dashboard-error-text">No se pudo establecer conexión con Google Sheets.</p>
            <button id="btn-retry-dashboard" class="btn-secondary" style="margin-top: 12px; width: auto; padding: 10px 20px;">Reintentar</button>
          </div>

          <!-- DASHBOARD VIEWS WRAPPER -->
          <div id="dashboard-content" class="dashboard-content hidden">

            <!-- ============================================== -->
            <!-- VENTANA 1: PANEL GENERAL (TAB OVERVIEW) -->
            <!-- ============================================== -->
            <div id="tab-view-overview" class="dashboard-tab-window active">
              
              <!-- FILTROS GLOBALES COMPACTOS Y 100% SIMÉTRICOS -->
              <div class="table-filters-container modern-filters-bar">
                <div class="filters-grid-symmetric-6">
                  <!-- 1. Search Box -->
                  <div class="search-box filter-cell">
                    <span class="search-box-icon">${icons.search}</span>
                    <input type="text" id="table-search" placeholder="Buscar por Nombre, DNI, Local, Mesa..." class="search-box-input">
                  </div>

                  <!-- 2. Filter: Distrito -->
                  <div class="filter-cell">
                    <select id="filter-distrito" class="filter-select" title="Filtrar por distrito">
                      <option value="">Todos los Distritos</option>
                      <option value="__incompletos__">⚠️ Distritos Incompletos</option>
                    </select>
                  </div>

                  <!-- 3. Filter: Rol Electoral -->
                  <div class="filter-cell">
                    <select id="filter-rol" class="filter-select" title="Filtrar por Rol Electoral">
                      <option value="">Todos los Roles</option>
                      <option value="Personero de Mesa">🛡️ Personero de Mesa</option>
                      <option value="Coordinador de Local">⭐ Coordinador de Local</option>
                    </select>
                  </div>

                  <!-- 4. Filter: Experiencia -->
                  <div class="filter-cell">
                    <select id="filter-experiencia" class="filter-select" title="Filtrar por Experiencia">
                      <option value="">Exp: Todos</option>
                      <option value="Sí">Con Experiencia</option>
                      <option value="No">Sin Experiencia</option>
                    </select>
                  </div>

                  <!-- 5. Filter: Movilidad -->
                  <div class="filter-cell">
                    <select id="filter-movilidad" class="filter-select" title="Filtrar por Movilidad">
                      <option value="">Movilidad: Todos</option>
                      <option value="Sí">Con Movilidad</option>
                      <option value="No">Sin Movilidad</option>
                    </select>
                  </div>

                  <!-- 6. Botón Limpiar Filtros -->
                  <div class="filter-cell" style="display: flex; justify-content: flex-end;">
                    <button type="button" id="btn-reset-filters" class="btn-reset-filters-compact" title="Limpiar todos los filtros">
                      Limpiar
                    </button>
                  </div>
                </div>
              </div>

              <!-- METRICS GRID -->
              <h2 class="section-title-dashboard">
                <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#38bdf8" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><rect x="3" y="3" width="7" height="9"/><rect x="14" y="3" width="7" height="5"/><rect x="14" y="12" width="7" height="9"/><rect x="3" y="16" width="7" height="5"/></svg>
                Indicadores Electorales Clave
              </h2>
              
              <section class="metrics-grid">
                <div class="metric-card card-blue" id="kpi-card-total">
                  <div class="metric-icon-wrapper">${icons.users}</div>
                  <div class="metric-details">
                    <span class="metric-label">Total Registrados</span>
                    <h2 class="metric-value" id="val-total">0</h2>
                    <span class="metric-subtext">Padrón Somos Perú</span>
                  </div>
                </div>

                <div class="metric-card card-cyan" id="kpi-card-coord">
                  <div class="metric-icon-wrapper">${icons.coordinator}</div>
                  <div class="metric-details">
                    <span class="metric-label">Coordinadores</span>
                    <h2 class="metric-value" id="val-coordinadores">0</h2>
                    <span class="metric-subtext">Líderes de Local</span>
                  </div>
                </div>

                <div class="metric-card card-indigo" id="kpi-card-personeros">
                  <div class="metric-icon-wrapper">${icons.shield}</div>
                  <div class="metric-details">
                    <span class="metric-label">Personeros Mesa</span>
                    <h2 class="metric-value" id="val-personeros">0</h2>
                    <span class="metric-subtext">Defensa del Voto</span>
                  </div>
                </div>
                
                <div class="metric-card card-emerald">
                  <div class="metric-icon-wrapper">${icons.checkCircle}</div>
                  <div class="metric-details">
                    <span class="metric-label">Con Experiencia</span>
                    <h2 class="metric-value" id="val-experiencia">0</h2>
                    <span class="metric-subtext">Elecciones Previas</span>
                  </div>
                </div>

                <div class="metric-card card-orange">
                  <div class="metric-icon-wrapper">${icons.car}</div>
                  <div class="metric-details">
                    <span class="metric-label">Con Movilidad</span>
                    <h2 class="metric-value" id="val-movilidad">0</h2>
                    <span class="metric-subtext">Vehículo Propio</span>
                  </div>
                </div>

                <div class="metric-card card-purple">
                  <div class="metric-icon-wrapper">${icons.calendar}</div>
                  <div class="metric-details">
                    <span class="metric-label">Compromiso 2026</span>
                    <h2 class="metric-value" id="val-compromiso">0</h2>
                    <span class="metric-subtext">4 de Octubre</span>
                  </div>
                </div>

                <div class="metric-card card-kpi" id="metric-kpi-card">
                  <div style="display: flex; align-items: center; gap: 10px; width: 100%;">
                    <div class="metric-icon-wrapper" style="border-color: #f59e0b; color: #f59e0b; background: var(--bg-color);">
                      <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="#f59e0b" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><circle cx="12" cy="12" r="10"/><line x1="12" y1="16" x2="12" y2="12"/><line x1="12" y1="8" x2="12.01" y2="8"/></svg>
                    </div>
                    <div class="metric-details" style="flex: 1;">
                      <span class="metric-label" style="color: #f59e0b;">Avance Meta Distrital</span>
                      <span style="font-size: 0.8rem; font-weight: 700; color: var(--secondary-color);" id="kpi-district-name">Todos los Distritos</span>
                    </div>
                  </div>
                  <div style="display: flex; flex-direction: column; gap: 4px; margin-top: 4px; width: 100%;">
                    <div style="display: flex; justify-content: space-between; font-size: 0.75rem; font-weight: 700; color: var(--text-main);">
                      <span id="kpi-progress-text">0 / 200</span>
                      <span id="kpi-pct-text">0%</span>
                    </div>
                    <div style="width: 100%; height: 7px; background: rgba(0, 0, 0, 0.08); border-radius: 4px; overflow: hidden; border: 1px solid var(--card-border);">
                      <div id="kpi-progress-bar" style="width: 0%; height: 100%; background: #f59e0b; transition: width 0.3s ease; border-radius: 4px;"></div>
                    </div>
                  </div>
                </div>
              </section>

              <!-- CHARTS CONTAINER -->
              <div id="charts-section-container">
                <section class="dashboard-charts-grid" style="grid-template-columns: 1fr;">
                  <div class="chart-container-card" style="width: 100%;">
                    <div style="display: flex; justify-content: space-between; align-items: center; flex-wrap: wrap; gap: 10px; margin-bottom: 8px;">
                      <h3 class="chart-card-title" style="margin: 0;">Resultado Lima Metropolitana</h3>
                      
                      <div style="display: flex; align-items: center; gap: 8px; flex-wrap: wrap;">
                        <div class="chart-badge-stat" style="background: rgba(14, 165, 233, 0.12); border: 1px solid rgba(14, 165, 233, 0.3);">
                          <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">Registrados:</span>
                          <strong id="distrib-registrados-count" style="font-size: 1.05rem; color: #0ea5e9; font-weight: 800;">0</strong>
                        </div>
                        <div class="chart-badge-stat" style="background: rgba(16, 185, 129, 0.12); border: 1px solid rgba(16, 185, 129, 0.3);">
                          <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">Meta Total:</span>
                          <strong id="distrib-meta-count" style="font-size: 1.05rem; color: #10b981; font-weight: 800;">0</strong>
                        </div>
                        <div class="chart-badge-stat" style="background: rgba(239, 68, 68, 0.12); border: 1px solid rgba(239, 68, 68, 0.3);">
                          <span style="font-size: 0.75rem; color: var(--text-muted); font-weight: 600;">Faltan:</span>
                          <strong id="distrib-faltan-count" style="font-size: 1.05rem; color: #ef4444; font-weight: 800;">0</strong>
                        </div>
                      </div>
                    </div>
                    <div class="canvas-wrapper" style="height: 260px;">
                      <canvas id="chart-distritos"></canvas>
                    </div>
                  </div>
                </section>
              </div>

              <!-- TABLE OF REGISTRATIONS (PANEL GENERAL - FULL WIDTH INTEGRATED CARD) -->
              <section class="table-container-card">
                <div class="table-card-header-clean">
                  <div style="display: flex; align-items: center; gap: 8px;">
                    <svg xmlns="http://www.w3.org/2000/svg" width="18" height="18" viewBox="0 0 24 24" fill="none" stroke="#fb923c" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><line x1="8" y1="6" x2="21" y2="6"/><line x1="8" y1="12" x2="21" y2="12"/><line x1="8" y1="18" x2="21" y2="18"/><line x1="3" y1="6" x2="3.01" y2="6"/><line x1="3" y1="12" x2="3.01" y2="12"/><line x1="3" y1="18" x2="3.01" y2="18"/></svg>
                    <h3 class="table-card-title-clean">Padrón Electoral de Personeros</h3>
                  </div>
                  <button type="button" id="btn-export-excel" class="btn-submit btn-action-excel" title="Exportar a archivo Excel">
                    ${icons.fileSpreadsheet}
                    <span>Descargar Excel</span>
                  </button>
                </div>

                <div class="table-responsive-wrapper">
                  <table class="dashboard-table">
                    <thead>
                      <tr>
                        <th style="width: 50px;">ID</th>
                        <th>Fecha</th>
                        <th>Personero / DNI / Correo</th>
                        <th>Rol a Desempeñar</th>
                        <th>🛡️ Asignación Somos Perú</th>
                        <th>🗳️ Votación (DNI)</th>
                        <th>Contacto & WhatsApp</th>
                        <th>Logística</th>
                        <th class="actions-header">Acciones</th>
                      </tr>
                    </thead>
                    <tbody id="table-body">
                      <!-- Rows injected dynamically -->
                    </tbody>
                  </table>
                  
                  <div id="table-empty" class="table-empty-state hidden">
                    ${icons.alert}
                    <p>No se encontraron registros con los filtros seleccionados.</p>
                  </div>
                </div>

                <div class="table-footer-info" style="display: flex; justify-content: space-between; align-items: center; width: 100%; flex-wrap: wrap; gap: 10px; padding-top: 6px;">
                  <span>Mostrando <strong id="val-shown-count" style="color: var(--primary-color);">0</strong> de <strong id="val-total-count">0</strong> registros</span>
                  <span style="font-size: 0.78rem; color: var(--text-muted);">💡 Haga clic en "Ver Ficha" para consultar todos los datos</span>
                </div>
              </section>
            </div>

            <!-- ============================================== -->
            <!-- VENTANA 2: PROGRESO DE CAPACITACIONES EN GRÁFICAS (TAB) -->
            <!-- ============================================== -->
            <div id="tab-view-capacitacion" class="dashboard-tab-window hidden">
              <div class="tab-window-header">
                <div>
                  <h2 class="tab-window-title">${icons.graduation} Progreso de las Capacitaciones en Gráficas</h2>
                  <p class="tab-window-subtitle">Estadísticas y visualización gráfica del avance en videos formativos, manuales PDF y habilitación de credenciales</p>
                </div>
              </div>

              <!-- STATS DE CAPACITACIÓN -->
              <div class="metrics-grid">
                <div class="metric-card card-green">
                  <div class="metric-icon-wrapper">${icons.checkCircle}</div>
                  <div class="metric-details">
                    <span class="metric-label">Credenciales Confirmadas</span>
                    <h2 class="metric-value" id="val-cap-confirmados">0</h2>
                    <span class="metric-subtext">Capacitación Completa</span>
                  </div>
                </div>
                <div class="metric-card card-orange">
                  <div class="metric-icon-wrapper">${icons.lock}</div>
                  <div class="metric-details">
                    <span class="metric-label">Credenciales Pendientes</span>
                    <h2 class="metric-value" id="val-cap-pendientes">0</h2>
                    <span class="metric-subtext">Pendiente de completar</span>
                  </div>
                </div>
                <div class="metric-card card-blue">
                  <div class="metric-icon-wrapper">${icons.video}</div>
                  <div class="metric-details">
                    <span class="metric-label">Videos Completados</span>
                    <h2 class="metric-value" id="val-cap-videos">0</h2>
                    <span class="metric-subtext">Módulos de Video</span>
                  </div>
                </div>
                <div class="metric-card card-purple">
                  <div class="metric-icon-wrapper">${icons.pdf}</div>
                  <div class="metric-details">
                    <span class="metric-label">Manuales PDF Leídos</span>
                    <h2 class="metric-value" id="val-cap-pdfs">0</h2>
                    <span class="metric-subtext">Guía de Procedimientos</span>
                  </div>
                </div>
              </div>

              <!-- GRÁFICAS DE CAPACITACIÓN -->
              <section class="dashboard-charts-grid" style="display: grid; grid-template-columns: repeat(auto-fit, minmax(320px, 1fr)); gap: 14px; margin-top: 8px;">
                <div class="chart-container-card">
                  <h3 class="chart-card-title" style="margin-bottom: 8px;">Estado de Credenciales</h3>
                  <div class="canvas-wrapper" style="height: 230px;">
                    <canvas id="chart-cap-credenciales"></canvas>
                  </div>
                </div>

                <div class="chart-container-card">
                  <h3 class="chart-card-title" style="margin-bottom: 8px;">Avance en Videos vs Manuales PDF</h3>
                  <div class="canvas-wrapper" style="height: 230px;">
                    <canvas id="chart-cap-modulos"></canvas>
                  </div>
                </div>
              </section>

              <!-- FILTROS SIMÉTRICOS DE CAPACITACIÓN -->
              <div class="table-filters-container modern-filters-bar">
                <div class="filters-grid-cap-5">
                  <div class="search-box filter-cell">
                    <span class="search-box-icon">${icons.search}</span>
                    <input type="text" id="search-cap" placeholder="Buscar personero por Nombre, DNI, Local..." class="search-box-input">
                  </div>
                  <div class="filter-cell">
                    <select id="filter-cap-estado" class="filter-select">
                      <option value="">Todos los Estados</option>
                      <option value="Confirmado">✅ Confirmados</option>
                      <option value="Bloqueado">🔒 Bloqueados (Pendientes)</option>
                    </select>
                  </div>
                  <div class="filter-cell">
                    <select id="filter-cap-distrito" class="filter-select">
                      <option value="">Todos los Distritos</option>
                    </select>
                  </div>
                  <div class="filter-cell">
                    <select id="filter-cap-rol" class="filter-select">
                      <option value="">Todos los Roles</option>
                      <option value="Personero de Mesa">🛡️ Personero de Mesa</option>
                      <option value="Coordinador de Local">⭐ Coordinador de Local</option>
                    </select>
                  </div>
                  <div class="filter-cell" style="display: flex; justify-content: flex-end;">
                    <button type="button" id="btn-reset-cap-filters" class="btn-reset-filters-compact" title="Limpiar filtros de capacitación">
                      Limpiar
                    </button>
                  </div>
                </div>
              </div>

              <section class="table-container-card">
                <div class="table-responsive-wrapper">
                  <table class="dashboard-table">
                    <thead>
                      <tr>
                        <th>ID</th>
                        <th>Personero / DNI</th>
                        <th>Rol</th>
                        <th>Distrito Asignado</th>
                        <th>Progreso Video</th>
                        <th>Progreso PDF</th>
                        <th>Estado Credencial</th>
                        <th>WhatsApp Recordatorio</th>
                        <th class="actions-header">Acciones</th>
                      </tr>
                    </thead>
                    <tbody id="table-body-cap">
                      <!-- Capacitacion rows injected dynamically -->
                    </tbody>
                  </table>
                </div>
              </section>
            </div>

            <!-- ============================================== -->
            <!-- VENTANA 3: CONEXIÓN AL GOOGLE SHEET (TAB) -->
            <!-- ============================================== -->
            <div id="tab-view-config" class="dashboard-tab-window hidden">
              <div class="tab-window-header">
                <div>
                  <h2 class="tab-window-title">⚙️ Conexión al Google Sheet</h2>
                  <p class="tab-window-subtitle">Configuración del enlace web de Google Apps Script</p>
                </div>
              </div>

              <div class="config-window-grid">
                <!-- Card de Estado de Conexión -->
                <div class="config-card">
                  <h3 class="config-card-title">Estado de la Conexión</h3>
                  <div class="config-status-list">
                    <div class="config-status-item">
                      <span class="cs-label">Registros Cargados:</span>
                      <strong class="cs-value" id="cfg-sync-count" style="color: var(--primary-color);">0 registros</strong>
                    </div>
                    <div class="config-status-item">
                      <span class="cs-label">Última Sincronización:</span>
                      <span class="cs-value" id="cfg-sync-time">En tiempo real</span>
                    </div>
                  </div>
                </div>

                <!-- Formulario de Configuración de URL -->
                <div class="config-card">
                  <h3 class="config-card-title">URL de Google Apps Script</h3>
                  <form id="form-tab-sheet-url" class="modal-form-config">
                    <div class="form-group-config">
                      <label class="form-label-config">URL Activa:</label>
                      <textarea id="input-tab-sheet-url" class="form-input-config" style="min-height: 85px;" placeholder="https://script.google.com/macros/s/.../exec"></textarea>
                    </div>
                    <div class="form-actions-config" style="display: flex; justify-content: space-between; gap: 10px; margin-top: 10px;">
                      <button type="button" id="btn-tab-reset-url" class="btn-reset-config">Restaurar Defecto</button>
                      <button type="submit" class="btn-save-config">Guardar y Sincronizar</button>
                    </div>
                    <div id="tab-url-status-msg" class="url-status-message hidden">URL Actualizada</div>
                  </form>
                </div>
              </div>
            </div>

          </div>
        </main>
      </div>
    </div>

    <!-- DETAIL MODAL: FICHA COMPLETA DEL PERSONERO -->
    <div id="detail-modal" class="detail-modal-overlay hidden">
      <div class="detail-modal-card modern-detail-modal">
        <div class="modal-header">
          <div style="display: flex; align-items: center; gap: 10px;">
            <div class="modal-header-icon">${icons.user}</div>
            <div>
              <h3 style="margin: 0; font-size: 1.15rem;">Ficha Integral del Personero</h3>
              <span style="font-size: 0.76rem; color: var(--text-muted);">Información completa del registro</span>
            </div>
          </div>
          <button id="btn-close-modal" class="btn-close-modal-custom" title="Cerrar Ficha">&times;</button>
        </div>
        <div class="modal-body" id="modal-details-content" style="padding: 16px 20px;">
          <!-- Content injected dynamically by modal.js -->
        </div>
      </div>
    </div>
  `;
}
