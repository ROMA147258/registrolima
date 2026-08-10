import { icons } from './icons.js';
import { distritosLima } from './config.js';
import { submitRegistration } from './api.js';
import { getLocalesForDistrict } from './localesData.js';

export function getRegisterFormHTML() {
  return `
    <div class="mobile-card" id="card-register">
      <!-- Header with dynamic progress & logout button -->
      <div class="card-header" style="padding: 16px 18px 12px;">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 4px;">
          <h1 class="card-title" id="title-register" style="font-size: 1.35rem; margin: 0; font-weight: 800; color: var(--secondary-color);">Registro</h1>
          <button type="button" id="btn-exit-to-login" class="btn-exit-small" title="Ir a inicio de sesión">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            <span>Salir</span>
          </button>
        </div>
        <p class="card-subtitle" style="font-size: 1.05rem; font-weight: 700; color: #0369a1; margin-top: 4px; margin-bottom: 0; line-height: 1.35;">
          Partido Democrático Somos Perú • Elecciones Municipales 2026
        </p>
        
        <!-- Progress Bar indicator -->
        <div class="progress-container">
          <div class="progress-bar" id="form-progress"></div>
        </div>
      </div>

      <!-- Main View Content -->
      <div class="view-content" style="padding: 12px 14px 16px;">
        
        <!-- VIEW: FORM -->
        <div class="form-view" id="view-form">
          <form id="electoral-form" novalidate>
            
            <!-- ============================================== -->
            <!-- SECCIÓN 1: DATOS PERSONALES -->
            <!-- ============================================== -->
            <div class="form-compact-box">
              <div class="form-compact-box-header">
                <h3 class="form-compact-box-title">
                  <span class="form-compact-badge">1</span>
                  <span>Datos Personales</span>
                </h3>
              </div>

              <!-- Nombres y Apellidos -->
              <div class="form-group-compact" data-required="true">
                <label class="form-label-compact" for="nombres">
                  <span>Nombres y Apellidos <span class="label-required">*</span></span>
                </label>
                <div class="input-wrapper">
                  <input type="text" id="nombres" name="nombres" class="form-input-compact" placeholder="Ej. Juan Carlos Pérez Torres" autocomplete="name">
                  <span class="input-icon-compact">${icons.user}</span>
                </div>
              </div>

              <!-- DNI y Celular en 2 Columnas -->
              <div class="form-row-2col">
                <div class="form-group-compact" data-required="true">
                  <label class="form-label-compact" for="dni">
                    <span>D.N.I. <span class="label-required">*</span></span>
                  </label>
                  <div class="input-wrapper">
                    <input type="text" id="dni" name="dni" class="form-input-compact" maxlength="8" placeholder="8 dígitos" inputmode="numeric">
                    <span class="input-icon-compact">${icons.card}</span>
                  </div>
                </div>

                <div class="form-group-compact" data-required="true">
                  <label class="form-label-compact" for="celular">
                    <span>Celular <span class="label-required">*</span></span>
                  </label>
                  <div class="input-wrapper">
                    <input type="text" id="celular" name="celular" class="form-input-compact" maxlength="9" placeholder="9 dígitos" inputmode="tel">
                    <span class="input-icon-compact">${icons.phone}</span>
                  </div>
                </div>
              </div>

              <!-- Correo Electrónico -->
              <div class="form-group-compact" data-required="true">
                <label class="form-label-compact" for="correo">
                  <span>Correo Electrónico <span class="label-required">*</span></span>
                </label>
                <div class="input-wrapper">
                  <input type="email" id="correo" name="correo" class="form-input-compact" placeholder="ejemplo@gmail.com" inputmode="email" autocomplete="email">
                  <span class="input-icon-compact">${icons.mail}</span>
                </div>
              </div>

              <!-- WhatsApp Switch + Alterno Simétrico -->
              <div class="whatsapp-symmetric-row" id="row-whatsapp">
                <div class="form-group-compact" data-required="true">
                  <label class="form-label-compact">¿Usa WhatsApp en su celular? <span class="label-required">*</span></label>
                  <div class="segmented-control-compact">
                    <div class="segment-option">
                      <input type="radio" id="usa_whatsapp_si" name="usa_whatsapp" value="Sí" checked>
                      <label for="usa_whatsapp_si" class="segment-label">Sí, mismo número</label>
                    </div>
                    <div class="segment-option">
                      <input type="radio" id="usa_whatsapp_no" name="usa_whatsapp" value="No">
                      <label for="usa_whatsapp_no" class="segment-label">No, otro número</label>
                    </div>
                  </div>
                </div>

                <!-- WhatsApp Alterno Simétrico -->
                <div class="form-group-compact hidden" id="group-otro-whatsapp">
                  <label class="form-label-compact" for="whatsapp_otro">
                    <span>Número WhatsApp Alterno <span class="label-required">*</span></span>
                  </label>
                  <div class="input-wrapper">
                    <input type="text" id="whatsapp_otro" name="whatsapp_otro" class="form-input-compact" maxlength="9" placeholder="912345678" inputmode="tel">
                    <span class="input-icon-compact">${icons.whatsapp}</span>
                  </div>
                </div>
              </div>
            </div>

            <!-- ============================================== -->
            <!-- SECCIÓN 2: LUGAR DE VOTACIÓN CIUDADANA (DNI) -->
            <!-- ============================================== -->
            <div class="form-compact-box">
              <div class="form-compact-box-header">
                <h3 class="form-compact-box-title">
                  <span class="form-compact-badge">2</span>
                  <span>Mi Lugar de Votación (DNI)</span>
                </h3>
              </div>

              <!-- Distrito y Mesa en 2 Columnas -->
              <div class="form-row-2col">
                <div class="form-group-compact" data-required="true" style="position: relative;">
                  <label class="form-label-compact" for="distrito">
                    <span>Distrito donde Vota <span class="label-required">*</span></span>
                  </label>
                  <div class="input-wrapper">
                    <input type="text" id="distrito" name="distrito" class="form-input-compact" placeholder="Ej. Surco, SJL, Lima..." autocomplete="off">
                    <span class="input-icon-compact">${icons.mapPin}</span>
                  </div>
                  <ul class="suggestions-list hidden" id="distrito-suggestions"></ul>
                </div>

                <div class="form-group-compact" data-required="true">
                  <label class="form-label-compact" for="mesa">
                    <span>Mesa de Sufragio <span class="label-required">*</span></span>
                  </label>
                  <div class="input-wrapper">
                    <input type="text" id="mesa" name="mesa" class="form-input-compact" maxlength="6" placeholder="Ej. 064321" inputmode="numeric">
                    <span class="input-icon-compact">${icons.table}</span>
                  </div>
                </div>
              </div>

              <!-- Centro de Votación -->
              <div class="form-group-compact" data-required="true" style="position: relative; margin-bottom: 0;">
                <label class="form-label-compact" for="centro">
                  <span>Local de Votación <span class="label-required">*</span></span>
                </label>
                <div class="input-wrapper">
                  <input type="text" id="centro" name="centro" class="form-input-compact" placeholder="Escriba o elija su centro de votación" autocomplete="off">
                  <span class="input-icon-compact">${icons.school}</span>
                </div>
                <ul class="suggestions-list hidden" id="centro-suggestions"></ul>
              </div>
            </div>

            <!-- ============================================== -->
            <!-- SECCIÓN 3: ROL Y ASIGNACIÓN ELECTORAL (SOMOS PERÚ) -->
            <!-- ============================================== -->
            <div class="form-compact-box" style="background: rgba(224, 242, 254, 0.85); border-color: #0ea5e9;">
              <div class="form-compact-box-header">
                <h3 class="form-compact-box-title" style="color: #0369a1;">
                  <span class="form-compact-badge" style="background: #0284c7;">3</span>
                  <span>Rol y Asignación Electoral</span>
                </h3>
              </div>

              <!-- Selector de Rol (2 Botones Modernos Fijos) -->
              <div class="role-toggle-bar">
                <div class="role-toggle-option">
                  <input type="radio" id="rol_personero" name="rol_electoral" value="Personero" checked>
                  <label for="rol_personero" class="role-toggle-label">
                    ${icons.shield}
                    <span>Personero de Mesa</span>
                  </label>
                </div>
                <div class="role-toggle-option">
                  <input type="radio" id="rol_coordinador" name="rol_electoral" value="Coordinador">
                  <label for="rol_coordinador" class="role-toggle-label">
                    ${icons.coordinator}
                    <span>Coordinador de Local</span>
                  </label>
                </div>
              </div>

              <!-- Casilla 1 & Casilla 3: Distrito Asignado y Mesa Asignada en 2 Columnas -->
              <div class="form-row-2col">
                <div class="form-group-compact" data-required="true" style="position: relative;">
                  <label class="form-label-compact" for="distrito_asignado">
                    <span>Distrito Asignado <span class="label-required">*</span></span>
                  </label>
                  <div class="input-wrapper">
                    <input type="text" id="distrito_asignado" name="distrito_asignado" class="form-input-compact" placeholder="Distrito asignado" autocomplete="off">
                    <span class="input-icon-compact">${icons.mapPin}</span>
                  </div>
                  <ul class="suggestions-list hidden" id="distrito-asignado-suggestions"></ul>
                </div>

                <div class="form-group-compact" data-required="true">
                  <label class="form-label-compact" for="mesa_asignada">
                    <span>Mesa Asignada <span class="label-required">*</span></span>
                  </label>
                  <div class="input-wrapper">
                    <input type="text" id="mesa_asignada" name="mesa_asignada" class="form-input-compact" placeholder="Ej. 064321">
                    <span class="input-icon-compact">${icons.table}</span>
                  </div>
                </div>
              </div>

              <!-- Casilla 2: Centro de Votación Asignado -->
              <div class="form-group-compact" data-required="true" style="position: relative; margin-bottom: 0;">
                <label class="form-label-compact" for="centro_asignado">
                  <span>Local de Votación Asignado <span class="label-required">*</span></span>
                </label>
                <div class="input-wrapper">
                  <input type="text" id="centro_asignado" name="centro_asignado" class="form-input-compact" placeholder="Colegio o centro asignado" autocomplete="off">
                  <span class="input-icon-compact">${icons.school}</span>
                </div>
                <ul class="suggestions-list hidden" id="centro-asignado-suggestions"></ul>
              </div>
            </div>

            <!-- ============================================== -->
            <!-- SECCIÓN 4: COMPROMISO Y LOGÍSTICA -->
            <!-- ============================================== -->
            <div class="form-compact-box">
              <div class="form-compact-box-header">
                <h3 class="form-compact-box-title">
                  <span class="form-compact-badge">4</span>
                  <span>Compromiso y Logística</span>
                </h3>
              </div>

              <!-- Preguntas 1 y 2 en 2 Columnas -->
              <div class="form-row-2col" style="margin-bottom: 8px;">
                <!-- Experiencia -->
                <div class="form-group-compact" data-required="true">
                  <label class="form-label-compact">¿Tiene Experiencia como Personero? <span class="label-required">*</span></label>
                  <div class="segmented-control-compact">
                    <div class="segment-option">
                      <input type="radio" id="exp_si" name="experiencia_personero" value="Sí">
                      <label for="exp_si" class="segment-label">Sí</label>
                    </div>
                    <div class="segment-option">
                      <input type="radio" id="exp_no" name="experiencia_personero" value="No" checked>
                      <label for="exp_no" class="segment-label">No</label>
                    </div>
                  </div>
                </div>

                <!-- Movilidad -->
                <div class="form-group-compact" data-required="true">
                  <label class="form-label-compact">¿Cuenta con Movilidad Propia? <span class="label-required">*</span></label>
                  <div class="segmented-control-compact">
                    <div class="segment-option">
                      <input type="radio" id="mov_si" name="movilidad_propia" value="Sí">
                      <label for="mov_si" class="segment-label">Sí</label>
                    </div>
                    <div class="segment-option">
                      <input type="radio" id="mov_no" name="movilidad_propia" value="No" checked>
                      <label for="mov_no" class="segment-label">No</label>
                    </div>
                  </div>
                </div>
              </div>

              <!-- Pregunta 3: Compromiso con fecha completa 4 de Octubre del 2026 -->
              <div class="form-group-compact" data-required="true" style="margin-bottom: 0;">
                <label class="form-label-compact" style="line-height: 1.35;">
                  ¿Se compromete a colaborar el 4 de Octubre del 2026 en las Elecciones? <span class="label-required">*</span>
                </label>
                <div class="segmented-control-compact" style="margin-top: 4px;">
                  <div class="segment-option">
                    <input type="radio" id="comp_si" name="compromiso_2da_vuelta" value="Sí" checked>
                    <label for="comp_si" class="segment-label">Sí, me comprometo el 4 de Octubre del 2026</label>
                  </div>
                  <div class="segment-option">
                    <input type="radio" id="comp_no" name="compromiso_2da_vuelta" value="No">
                    <label for="comp_no" class="segment-label">No podré asistir</label>
                  </div>
                </div>
              </div>
            </div>

            <!-- Submit Button -->
            <button type="submit" class="btn-submit" id="btn-submit-form" style="height: 44px; margin-top: 14px; font-size: 0.92rem;">
              <span>Registrar y Acreditar</span>
              ${icons.check}
            </button>
          </form>
        </div>

        <!-- VIEW: SUCCESS STATE -->
        <div class="success-screen hidden" id="view-success">
          <div class="success-icon-wrapper">
            ${icons.check}
          </div>
          <h2 class="success-title">¡Registro Exitoso!</h2>
          <p class="success-message" id="success-text">
            Los datos del personero/coordinador se han registrado y guardado directamente en la base de datos de Somos Perú.
          </p>
          
          <button class="btn-secondary" id="btn-success-new">
            ${icons.form}
            Registrar Otro Personero
          </button>
        </div>

      </div>
    </div>
  `;
}

export function initRegisterForm(onLogout) {
  // Botón pequeño de salir para ir a la ventana de login
  const btnExit = document.getElementById('btn-exit-to-login');
  if (btnExit) {
    btnExit.addEventListener('click', () => {
      onLogout('show_login');
    });
  }

  // DOM elements
  const form = document.getElementById('electoral-form');
  const viewForm = document.getElementById('view-form');
  const viewSuccess = document.getElementById('view-success');

  const whastappRadioSi = document.getElementById('usa_whatsapp_si');
  const whastappRadioNo = document.getElementById('usa_whatsapp_no');
  const rowWhatsapp = document.getElementById('row-whatsapp');
  const groupOtroWhatsapp = document.getElementById('group-otro-whatsapp');
  const inputOtroWhatsapp = document.getElementById('whatsapp_otro');

  const distritoInput = document.getElementById('distrito');
  const distritoSuggestions = document.getElementById('distrito-suggestions');
  const centroInput = document.getElementById('centro');
  const centroSuggestions = document.getElementById('centro-suggestions');
  const mesaInput = document.getElementById('mesa');

  const rolPersoneroRadio = document.getElementById('rol_personero');
  const rolCoordinadorRadio = document.getElementById('rol_coordinador');
  const btnCopyVotingData = document.getElementById('btn-copy-voting-data');

  const distritoAsignadoInput = document.getElementById('distrito_asignado');
  const distritoAsignadoSuggestions = document.getElementById('distrito-asignado-suggestions');
  const centroAsignadoInput = document.getElementById('centro_asignado');
  const centroAsignadoSuggestions = document.getElementById('centro-asignado-suggestions');
  const mesaAsignadaInput = document.getElementById('mesa_asignada');

  // ==========================================
  // Helper: Generic Autocomplete Dropdown Setup
  // ==========================================
  function setupAutocomplete({ inputEl, listEl, getDataSource, onSelect }) {
    let activeIndex = -1;
    let currentMatches = [];

    function render(query) {
      const cleanQuery = query.toLowerCase().trim();
      listEl.innerHTML = '';
      activeIndex = -1;

      const fullSource = getDataSource();
      if (!cleanQuery) {
        currentMatches = [...fullSource];
      } else {
        const starts = fullSource.filter(item => item.toLowerCase().startsWith(cleanQuery));
        const contains = fullSource.filter(item => !item.toLowerCase().startsWith(cleanQuery) && item.toLowerCase().includes(cleanQuery));
        currentMatches = [...starts, ...contains];
      }

      if (currentMatches.length > 0) {
        currentMatches.forEach((match, index) => {
          const li = document.createElement('li');
          li.className = 'suggestion-item';
          li.dataset.index = index;

          if (cleanQuery) {
            const matchIndex = match.toLowerCase().indexOf(cleanQuery);
            if (matchIndex !== -1) {
              const before = match.substring(0, matchIndex);
              const middle = match.substring(matchIndex, matchIndex + cleanQuery.length);
              const after = match.substring(matchIndex + cleanQuery.length);
              li.innerHTML = `${before}<strong class="suggestion-highlight" style="color: var(--primary-color); font-weight: 700;">${middle}</strong>${after}`;
            } else {
              li.textContent = match;
            }
          } else {
            li.textContent = match;
          }

          li.addEventListener('click', (e) => {
            e.stopPropagation();
            inputEl.value = match;
            listEl.classList.add('hidden');
            if (onSelect) onSelect(match);
            calculateProgress();
          });

          listEl.appendChild(li);
        });
        listEl.classList.remove('hidden');
      } else {
        listEl.classList.add('hidden');
      }
    }

    inputEl.addEventListener('focus', () => render(inputEl.value));
    inputEl.addEventListener('click', (e) => {
      e.stopPropagation();
      render(inputEl.value);
    });
    inputEl.addEventListener('input', () => render(inputEl.value));

    inputEl.addEventListener('keydown', (e) => {
      if (listEl.classList.contains('hidden')) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          render(inputEl.value);
          e.preventDefault();
        }
        return;
      }

      const items = listEl.querySelectorAll('.suggestion-item');
      if (items.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (activeIndex < items.length - 1) {
          if (activeIndex >= 0) items[activeIndex].classList.remove('active');
          activeIndex++;
          items[activeIndex].classList.add('active');
          items[activeIndex].scrollIntoView({ block: 'nearest' });
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (activeIndex > 0) {
          items[activeIndex].classList.remove('active');
          activeIndex--;
          items[activeIndex].classList.add('active');
          items[activeIndex].scrollIntoView({ block: 'nearest' });
        }
      } else if (e.key === 'Enter') {
        if (activeIndex >= 0 && activeIndex < currentMatches.length) {
          e.preventDefault();
          inputEl.value = currentMatches[activeIndex];
          listEl.classList.add('hidden');
          if (onSelect) onSelect(currentMatches[activeIndex]);
          calculateProgress();
        }
      } else if (e.key === 'Escape') {
        listEl.classList.add('hidden');
        inputEl.blur();
      }
    });

    return { render };
  }

  // 1. Autocomplete for DNI District & Voting Center
  const autoCentro = setupAutocomplete({
    inputEl: centroInput,
    listEl: centroSuggestions,
    getDataSource: () => getLocalesForDistrict(distritoInput.value.trim()),
    onSelect: () => mesaInput.focus()
  });

  setupAutocomplete({
    inputEl: distritoInput,
    listEl: distritoSuggestions,
    getDataSource: () => distritosLima,
    onSelect: () => {
      autoCentro.render('');
      centroInput.focus();
    }
  });

  // 2. Autocomplete for Assigned District & Assigned Voting Center
  const autoCentroAsignado = setupAutocomplete({
    inputEl: centroAsignadoInput,
    listEl: centroAsignadoSuggestions,
    getDataSource: () => getLocalesForDistrict(distritoAsignadoInput.value.trim()),
    onSelect: () => mesaAsignadaInput.focus()
  });

  setupAutocomplete({
    inputEl: distritoAsignadoInput,
    listEl: distritoAsignadoSuggestions,
    getDataSource: () => distritosLima,
    onSelect: () => {
      autoCentroAsignado.render('');
      centroAsignadoInput.focus();
    }
  });

  // Close all autocomplete lists when clicking outside
  document.addEventListener('click', (e) => {
    [
      { input: distritoInput, list: distritoSuggestions },
      { input: centroInput, list: centroSuggestions },
      { input: distritoAsignadoInput, list: distritoAsignadoSuggestions },
      { input: centroAsignadoInput, list: centroAsignadoSuggestions }
    ].forEach(({ input, list }) => {
      if (e.target !== input && e.target !== list && list) {
        list.classList.add('hidden');
      }
    });
  });

  // Role changes update progress tracking
  rolPersoneroRadio.addEventListener('change', calculateProgress);
  rolCoordinadorRadio.addEventListener('change', calculateProgress);

  // ==========================================
  // Smart Fill: Copiar datos con 1 solo clic
  // ==========================================
  if (btnCopyVotingData) {
    btnCopyVotingData.addEventListener('click', () => {
      const dVal = distritoInput.value.trim();
      const cVal = centroInput.value.trim();
      const mVal = mesaInput.value.trim();

      if (!dVal && !cVal && !mVal) {
        alert('Por favor ingrese primero su distrito o centro de votación en la Sección 2.');
        distritoInput.focus();
        return;
      }

      distritoAsignadoInput.value = dVal;
      centroAsignadoInput.value = cVal;
      mesaAsignadaInput.value = mVal;

      // Feedback anim
      const origHTML = btnCopyVotingData.innerHTML;
      btnCopyVotingData.innerHTML = `<span>✓</span> ¡Copiado!`;
      btnCopyVotingData.style.background = `#10b981`;
      btnCopyVotingData.style.color = `#ffffff`;
      btnCopyVotingData.style.borderColor = `#10b981`;

      setTimeout(() => {
        btnCopyVotingData.innerHTML = origHTML;
        btnCopyVotingData.style.background = '';
        btnCopyVotingData.style.color = '';
        btnCopyVotingData.style.borderColor = '';
      }, 1600);

      calculateProgress();
    });
  }

  // Toggle Symmetrical WhatsApp Field
  function toggleWhatsappField() {
    if (whastappRadioNo.checked) {
      rowWhatsapp.classList.add('has-alt');
      groupOtroWhatsapp.classList.remove('hidden');
      groupOtroWhatsapp.setAttribute('data-required', 'true');
      inputOtroWhatsapp.focus();
    } else {
      rowWhatsapp.classList.remove('has-alt');
      groupOtroWhatsapp.classList.add('hidden');
      groupOtroWhatsapp.removeAttribute('data-required');
      inputOtroWhatsapp.value = '';
      groupOtroWhatsapp.classList.remove('has-error');
    }
    calculateProgress();
  }

  whastappRadioSi.addEventListener('change', toggleWhatsappField);
  whastappRadioNo.addEventListener('change', toggleWhatsappField);

  // ==========================================
  // Progress Bar Calculation
  // ==========================================
  function calculateProgress() {
    const requiredFields = [
      { id: 'nombres', check: (val) => val.trim().length > 3 },
      { id: 'dni', check: (val) => /^\d{8}$/.test(val) },
      { id: 'celular', check: (val) => /^\d{9}$/.test(val) },
      { id: 'correo', check: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) },
      { id: 'distrito', check: (val) => val.trim().length > 2 },
      { id: 'centro', check: (val) => val.trim().length > 2 },
      { id: 'mesa', check: (val) => val.trim().length > 0 },
      { id: 'distrito_asignado', check: (val) => val.trim().length > 2 },
      { id: 'centro_asignado', check: (val) => val.trim().length > 2 },
      { id: 'mesa_asignada', check: (val) => val.trim().length > 0 }
    ];

    if (whastappRadioNo.checked) {
      requiredFields.push({ id: 'whatsapp_otro', check: (val) => /^\d{9}$/.test(val) });
    }

    let filledCount = 0;
    requiredFields.forEach(f => {
      const el = document.getElementById(f.id);
      if (el && f.check(el.value)) {
        filledCount++;
      }
    });

    const percentage = Math.round((filledCount / requiredFields.length) * 100);
    const progressBar = document.getElementById('form-progress');
    if (progressBar) {
      progressBar.style.width = `${percentage}%`;
    }
  }

  const inputsToTrack = [
    'nombres', 'dni', 'celular', 'whatsapp_otro', 'correo',
    'distrito', 'centro', 'mesa',
    'distrito_asignado', 'centro_asignado', 'mesa_asignada'
  ];
  inputsToTrack.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', calculateProgress);
    }
  });

  // Real-time restrictions
  document.getElementById('nombres').addEventListener('input', function() {
    this.value = this.value.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
  });

  document.getElementById('dni').addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '');
  });

  document.getElementById('mesa').addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '');
  });

  document.getElementById('celular').addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '');
  });

  document.getElementById('whatsapp_otro').addEventListener('input', function() {
    this.value = this.value.replace(/\D/g, '');
  });

  // Validations & Real-time error highlight
  function validateField(inputElement, validationFn) {
    if (!inputElement) return true;
    const group = inputElement.closest('.form-group-compact') || inputElement.closest('.form-group');
    const isValid = validationFn(inputElement.value);

    if (isValid) {
      group?.classList.remove('has-error');
      return true;
    } else {
      group?.classList.add('has-error');
      return false;
    }
  }

  // Clear error highlight as soon as user types
  inputsToTrack.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', () => {
        const group = el.closest('.form-group-compact') || el.closest('.form-group');
        if (group?.classList.contains('has-error')) {
          group.classList.remove('has-error');
        }
      });
    }
  });

  document.getElementById('nombres').addEventListener('blur', function() {
    validateField(this, (val) => val.trim().length >= 3);
  });
  document.getElementById('dni').addEventListener('blur', function() {
    validateField(this, (val) => /^\d{8}$/.test(val.trim()));
  });
  document.getElementById('celular').addEventListener('blur', function() {
    validateField(this, (val) => /^\d{9}$/.test(val.trim()));
  });
  document.getElementById('correo').addEventListener('blur', function() {
    validateField(this, (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()));
  });
  document.getElementById('distrito').addEventListener('blur', function() {
    setTimeout(() => validateField(this, (val) => val.trim().length >= 2), 200);
  });
  document.getElementById('centro').addEventListener('blur', function() {
    setTimeout(() => validateField(this, (val) => val.trim().length >= 2), 200);
  });
  document.getElementById('mesa').addEventListener('blur', function() {
    validateField(this, (val) => val.trim().length >= 1);
  });
  document.getElementById('distrito_asignado').addEventListener('blur', function() {
    setTimeout(() => validateField(this, (val) => val.trim().length >= 2), 200);
  });
  document.getElementById('centro_asignado').addEventListener('blur', function() {
    setTimeout(() => validateField(this, (val) => val.trim().length >= 2), 200);
  });
  document.getElementById('mesa_asignada').addEventListener('blur', function() {
    validateField(this, (val) => val.trim().length >= 1);
  });
  if (inputOtroWhatsapp) {
    inputOtroWhatsapp.addEventListener('blur', function() {
      if (whastappRadioNo.checked) {
        validateField(this, (val) => /^\d{9}$/.test(val.trim()));
      }
    });
  }

  // ==========================================
  // Form Submission
  // ==========================================
  form.addEventListener('submit', async function(e) {
    e.preventDefault();

    const isNombresValid = validateField(document.getElementById('nombres'), (val) => val.trim().length >= 3);
    const isDniValid = validateField(document.getElementById('dni'), (val) => /^\d{8}$/.test(val.trim()));
    const isCelularValid = validateField(document.getElementById('celular'), (val) => /^\d{9}$/.test(val.trim()));
    const isCorreoValid = validateField(document.getElementById('correo'), (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val.trim()));

    const isDistritoValid = validateField(document.getElementById('distrito'), (val) => val.trim().length >= 2);
    const isMesaValid = validateField(document.getElementById('mesa'), (val) => val.trim().length >= 1);
    const isCentroValid = validateField(document.getElementById('centro'), (val) => val.trim().length >= 2);

    const isDistritoAsignadoValid = validateField(document.getElementById('distrito_asignado'), (val) => val.trim().length >= 2);
    const isMesaAsignadaValid = validateField(document.getElementById('mesa_asignada'), (val) => val.trim().length >= 1);
    const isCentroAsignadoValid = validateField(document.getElementById('centro_asignado'), (val) => val.trim().length >= 2);

    let isWhatsappAlternoValid = true;
    if (whastappRadioNo.checked) {
      isWhatsappAlternoValid = validateField(document.getElementById('whatsapp_otro'), (val) => /^\d{9}$/.test(val.trim()));
    }

    if (
      isNombresValid &&
      isDniValid &&
      isCelularValid &&
      isCorreoValid &&
      isDistritoValid &&
      isMesaValid &&
      isCentroValid &&
      isDistritoAsignadoValid &&
      isMesaAsignadaValid &&
      isCentroAsignadoValid &&
      isWhatsappAlternoValid
    ) {
      const btn = document.getElementById('btn-submit-form');
      const originalContent = btn.innerHTML;
      btn.innerHTML = `<span class="spinner-inline"></span> <span>Guardando y Acreditando...</span>`;
      btn.disabled = true;

      const formData = new FormData(form);
      const rawRole = formData.get('rol_electoral');
      const selectedRole = (rawRole === 'Coordinador' || rawRole === 'Coordinador de Local') 
        ? 'Coordinador de Local' 
        : 'Personero de Mesa';

      const newRecord = {
        nombres: formData.get('nombres'),
        dni: formData.get('dni'),
        celular: formData.get('celular'),
        numero_celular: formData.get('celular'),
        usa_whatsapp: formData.get('usa_whatsapp') || 'Sí',
        whatsapp_otro: formData.get('whatsapp_otro') || 'Mismo número',
        correo: formData.get('correo'),
        correo_electronico: formData.get('correo'),
        
        // Lugar de Votación Ciudadana (DNI)
        distrito: formData.get('distrito'),
        distrito_votacion: formData.get('distrito'),
        centro: formData.get('centro'),
        centro_votacion: formData.get('centro'),
        local_votacion: formData.get('centro'),
        mesa: formData.get('mesa'),
        mesa_electoral: formData.get('mesa'),
        mesa_sufragio: formData.get('mesa'),

        // Rol y Asignación Electoral
        rol_electoral: selectedRole,
        distrito_asignado: formData.get('distrito_asignado') || formData.get('distrito'),
        centro_asignado: formData.get('centro_asignado') || formData.get('centro'),
        local_asignado: formData.get('centro_asignado') || formData.get('centro'),
        mesa_asignada: formData.get('mesa_asignada') || formData.get('mesa'),

        // Logística y Compromiso (Respuestas a todos los botones)
        experiencia_personero: formData.get('experiencia_personero') || 'No',
        compromiso_2da_vuelta: formData.get('compromiso_2da_vuelta') || 'Sí',
        movilidad_propia: formData.get('movilidad_propia') || 'No',
        fecha_registro: new Date().toLocaleString('es-PE', { timeZone: 'America/Lima' })
      };

      try {
        await submitRegistration(newRecord);
        form.reset();
        alert('¡Registro Exitoso! Los datos se han guardado correctamente. Ahora puede ingresar desde la ventana de acceso con su Nombre y DNI.');
        onLogout('show_login');
      } catch (err) {
        console.error('Error enviando registro:', err);
        alert('Error de conexión: No se pudo enviar el registro. Por favor, verifique su conexión e inténtelo de nuevo.');
      } finally {
        btn.innerHTML = originalContent;
        btn.disabled = false;
      }
    } else {
      const firstError = document.querySelector('.has-error');
      if (firstError) {
        firstError.scrollIntoView({ behavior: 'smooth', block: 'center' });
      }
    }
  });

  document.getElementById('btn-success-new').addEventListener('click', () => {
    viewSuccess.classList.add('hidden');
    viewForm.classList.remove('hidden');
    calculateProgress();
  });

  // Calculate progress initially
  calculateProgress();
}
