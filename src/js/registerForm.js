import { icons } from './icons.js';
import { distritosLima } from './config.js';
import { submitRegistration } from './api.js';
import { getLocalesForDistrict } from './localesData.js';

export function getRegisterFormHTML() {
  return `
    <div class="mobile-card" id="card-register">
      <!-- Header with dynamic progress & logout button -->
      <div class="card-header">
        <div style="display: flex; justify-content: space-between; align-items: center; margin-bottom: 6px;">
          <h1 class="card-title" id="title-register" style="cursor: pointer; user-select: none;">Registro</h1>
          <button type="button" id="btn-exit-to-login" class="btn-exit-small" title="Ir a inicio de sesión">
            <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2.5" stroke-linecap="round" stroke-linejoin="round"><path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4"></path><polyline points="16 17 21 12 16 7"></polyline><line x1="21" y1="12" x2="9" y2="12"></line></svg>
            <span>Salir</span>
          </button>
        </div>
        <p class="card-subtitle">Ficha de Inscripción de Personeros</p>
        
        <!-- Progress Bar indicator -->
        <div class="progress-container">
          <div class="progress-bar" id="form-progress"></div>
        </div>
      </div>

      <!-- Main View Content -->
      <div class="view-content">
        
        <!-- VIEW: FORM -->
        <div class="form-view" id="view-form">
          <form id="electoral-form" novalidate>
            
            <!-- Nombres y Apellidos -->
            <div class="form-group" data-required="true">
              <label class="form-label">Nombres y Apellidos <span class="label-required">*</span></label>
              <div class="input-wrapper">
                <input type="text" id="nombres" name="nombres" class="form-input" placeholder="Juan Pérez Torres">
                <span class="input-icon">${icons.user}</span>
              </div>
            </div>

            <!-- D.N.I. -->
            <div class="form-group" data-required="true">
              <label class="form-label">D.N.I. <span class="label-required">*</span></label>
              <div class="input-wrapper">
                <input type="text" id="dni" name="dni" class="form-input" maxlength="8" placeholder="12345678" inputmode="numeric">
                <span class="input-icon">${icons.card}</span>
              </div>
            </div>

            <!-- Distrito de Votación -->
            <div class="form-group" data-required="true" style="position: relative;">
              <label class="form-label">Distrito de Votación <span class="label-required">*</span></label>
              <div class="input-wrapper">
                <input type="text" id="distrito" name="distrito" class="form-input" placeholder="Ej. San Juan de Lurigancho" autocomplete="off">
                <span class="input-icon">${icons.mapPin}</span>
              </div>
              <ul class="suggestions-list hidden" id="distrito-suggestions"></ul>
            </div>

            <!-- Centro de Votación -->
            <div class="form-group" data-required="true" style="position: relative;">
              <label class="form-label">Centro de Votación <span class="label-required">*</span></label>
              <div class="input-wrapper">
                <input type="text" id="centro" name="centro" class="form-input" placeholder="Ej. I.E. Coronel Francisco Bolognesi" autocomplete="off">
                <span class="input-icon">${icons.school}</span>
              </div>
              <ul class="suggestions-list hidden" id="centro-suggestions"></ul>
            </div>

            <!-- Mesa Electoral -->
            <div class="form-group" data-required="true">
              <label class="form-label">Mesa Electoral <span class="label-required">*</span></label>
              <div class="input-wrapper">
                <input type="text" id="mesa" name="mesa" class="form-input" placeholder="Ej. 064321" inputmode="numeric">
                <span class="input-icon">${icons.table}</span>
              </div>
            </div>

            <!-- Celular -->
            <div class="form-group" data-required="true">
              <label class="form-label">Número de celular <span class="label-required">*</span></label>
              <div class="input-wrapper">
                <input type="text" id="celular" name="celular" class="form-input" maxlength="9" placeholder="987654321" inputmode="tel">
                <span class="input-icon">${icons.phone}</span>
              </div>
            </div>

            <!-- ¿Usa WhatsApp? -->
            <div class="form-group" data-required="true">
              <label class="form-label">¿Usa WhatsApp? Mismo número. Si no dé el otro <span class="label-required">*</span></label>
              <div class="segmented-control">
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

            <!-- Otro WhatsApp (Conditional) -->
            <div class="form-group conditional-field" id="group-otro-whatsapp">
              <label class="form-label">Número de WhatsApp alterno <span class="label-required">*</span></label>
              <div class="input-wrapper">
                <input type="text" id="whatsapp_otro" name="whatsapp_otro" class="form-input" maxlength="9" placeholder="912345678" inputmode="tel">
                <span class="input-icon">${icons.whatsapp}</span>
              </div>
            </div>

            <!-- Correo electrónico -->
            <div class="form-group" data-required="true">
              <label class="form-label">Correo electrónico <span class="label-required">*</span></label>
              <div class="input-wrapper">
                <input type="email" id="correo" name="correo" class="form-input" placeholder="ejemplo@gmail.com" inputmode="email">
                <span class="input-icon">${icons.mail}</span>
              </div>
            </div>

            <!-- Experiencia como Personero -->
            <div class="form-group" data-required="true">
              <label class="form-label">Experiencia como Personero <span class="label-required">*</span></label>
              <div class="segmented-control">
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

            <!-- Compromiso segunda vuelta -->
            <div class="form-group" data-required="true">
              <label class="form-label" style="line-height: 1.4;">
                Se compromete a colaborar el 4 de Octubre del 2026 como Personero de Centro de Votación <span class="label-required">*</span>
              </label>
              <div class="segmented-control" style="margin-top: 8px;">
                <div class="segment-option">
                  <input type="radio" id="comp_si" name="compromiso_2da_vuelta" value="Sí" checked>
                  <label for="comp_si" class="segment-label">Sí</label>
                </div>
                <div class="segment-option">
                  <input type="radio" id="comp_no" name="compromiso_2da_vuelta" value="No">
                  <label for="comp_no" class="segment-label">No</label>
                </div>
              </div>
            </div>

            <!-- ¿Cuenta con movilidad propia? -->
            <div class="form-group" data-required="true">
              <label class="form-label">¿Cuenta con movilidad propia? <span class="label-required">*</span></label>
              <div class="segmented-control">
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

            <!-- Submit Button -->
            <button type="submit" class="btn-submit" id="btn-submit-form">
              <span>Registrar Personero</span>
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
            Los datos del personero se han registrado y guardado directamente en la hoja "Registro" de Google Sheets.
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
  const successText = document.getElementById('success-text');

  const whastappRadioSi = document.getElementById('usa_whatsapp_si');
  const whastappRadioNo = document.getElementById('usa_whatsapp_no');
  const groupOtroWhatsapp = document.getElementById('group-otro-whatsapp');
  const inputOtroWhatsapp = document.getElementById('whatsapp_otro');
  const errOtroWhatsapp = document.getElementById('err-whatsapp-otro');

  const distritoInput = document.getElementById('distrito');
  const suggestionsList = document.getElementById('distrito-suggestions');

  // Autocomplete & District Dropdown List
  let activeIndex = -1;
  let currentMatches = [];

  function renderSuggestions(query) {
    const cleanQuery = query.toLowerCase().trim();
    suggestionsList.innerHTML = '';
    activeIndex = -1;

    if (!cleanQuery) {
      currentMatches = [...distritosLima];
    } else {
      // Find matches where it starts with the query first, then matches that contain the query
      const startsWithMatch = distritosLima.filter(d => d.toLowerCase().startsWith(cleanQuery));
      const containsMatch = distritosLima.filter(d => !d.toLowerCase().startsWith(cleanQuery) && d.toLowerCase().includes(cleanQuery));
      currentMatches = [...startsWithMatch, ...containsMatch];
    }

    if (currentMatches.length > 0) {
      currentMatches.forEach((match, index) => {
        const li = document.createElement('li');
        li.className = 'suggestion-item';
        li.dataset.index = index;
        
        // Highlight matching text if query is present
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
          selectSuggestion(match);
        });

        suggestionsList.appendChild(li);
      });
      suggestionsList.classList.remove('hidden');
    } else {
      suggestionsList.classList.add('hidden');
    }
  }

  function selectSuggestion(value) {
    distritoInput.value = value;
    suggestionsList.classList.add('hidden');
    validateField(distritoInput, document.getElementById('err-distrito'), (val) => val.trim() !== '');
    calculateProgress();
    // Focus centro input and render voting center suggestions for this district
    renderCentroSuggestions('');
    centroInput.focus();
  }

  function scrollIntoViewIfNeeded(element, parent = suggestionsList) {
    if (!element || !parent) return;
    const parentRect = parent.getBoundingClientRect();
    const elemRect = element.getBoundingClientRect();

    if (elemRect.top < parentRect.top) {
      parent.scrollTop -= (parentRect.top - elemRect.top);
    } else if (elemRect.bottom > parentRect.bottom) {
      parent.scrollTop += (elemRect.bottom - parentRect.bottom);
    }
  }

  // Focus and click to show all districts
  distritoInput.addEventListener('focus', () => {
    renderSuggestions(distritoInput.value);
  });

  distritoInput.addEventListener('click', (e) => {
    e.stopPropagation();
    renderSuggestions(distritoInput.value);
  });

  // Keyboard navigation for districts
  distritoInput.addEventListener('keydown', (e) => {
    if (suggestionsList.classList.contains('hidden')) {
      if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
        renderSuggestions(distritoInput.value);
        e.preventDefault();
      }
      return;
    }

    const items = suggestionsList.querySelectorAll('.suggestion-item');
    if (items.length === 0) return;

    if (e.key === 'ArrowDown') {
      e.preventDefault();
      if (activeIndex < items.length - 1) {
        if (activeIndex >= 0) items[activeIndex].classList.remove('active');
        activeIndex++;
        items[activeIndex].classList.add('active');
        scrollIntoViewIfNeeded(items[activeIndex], suggestionsList);
      }
    } else if (e.key === 'ArrowUp') {
      e.preventDefault();
      if (activeIndex > 0) {
        items[activeIndex].classList.remove('active');
        activeIndex--;
        items[activeIndex].classList.add('active');
        scrollIntoViewIfNeeded(items[activeIndex], suggestionsList);
      }
    } else if (e.key === 'Enter') {
      if (activeIndex >= 0 && activeIndex < items.length) {
        e.preventDefault();
        selectSuggestion(currentMatches[activeIndex]);
      }
    } else if (e.key === 'Escape') {
      suggestionsList.classList.add('hidden');
      distritoInput.blur();
    }
  });

  // ==========================================
  // Autocomplete & Filtering: Centro de Votación
  // ==========================================
  const centroInput = document.getElementById('centro');
  const centroSuggestionsList = document.getElementById('centro-suggestions');
  let centroActiveIndex = -1;
  let centroCurrentMatches = [];

  function renderCentroSuggestions(query) {
    if (!centroSuggestionsList || !centroInput) return;
    const cleanQuery = query.toLowerCase().trim();
    centroSuggestionsList.innerHTML = '';
    centroActiveIndex = -1;

    // Resolve voting centers based on selected district
    const districtName = distritoInput ? distritoInput.value.trim() : '';
    const districtLocales = getLocalesForDistrict(districtName);

    if (!cleanQuery) {
      centroCurrentMatches = [...districtLocales];
    } else {
      const startsWithMatch = districtLocales.filter(l => l.toLowerCase().startsWith(cleanQuery));
      const containsMatch = districtLocales.filter(l => !l.toLowerCase().startsWith(cleanQuery) && l.toLowerCase().includes(cleanQuery));
      centroCurrentMatches = [...startsWithMatch, ...containsMatch];
    }

    if (centroCurrentMatches.length > 0) {
      centroCurrentMatches.forEach((match, index) => {
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
          selectCentroSuggestion(match);
        });

        centroSuggestionsList.appendChild(li);
      });
      centroSuggestionsList.classList.remove('hidden');
    } else {
      centroSuggestionsList.classList.add('hidden');
    }
  }

  function selectCentroSuggestion(value) {
    centroInput.value = value;
    centroSuggestionsList.classList.add('hidden');
    validateField(centroInput, document.getElementById('err-centro'), (val) => val.trim() !== '');
    calculateProgress();
    centroInput.focus();
  }

  if (centroInput && centroSuggestionsList) {
    centroInput.addEventListener('focus', () => {
      renderCentroSuggestions(centroInput.value);
    });

    centroInput.addEventListener('click', (e) => {
      e.stopPropagation();
      renderCentroSuggestions(centroInput.value);
    });

    centroInput.addEventListener('input', () => {
      renderCentroSuggestions(centroInput.value);
    });

    centroInput.addEventListener('keydown', (e) => {
      if (centroSuggestionsList.classList.contains('hidden')) {
        if (e.key === 'ArrowDown' || e.key === 'ArrowUp') {
          renderCentroSuggestions(centroInput.value);
          e.preventDefault();
        }
        return;
      }

      const items = centroSuggestionsList.querySelectorAll('.suggestion-item');
      if (items.length === 0) return;

      if (e.key === 'ArrowDown') {
        e.preventDefault();
        if (centroActiveIndex < items.length - 1) {
          if (centroActiveIndex >= 0) items[centroActiveIndex].classList.remove('active');
          centroActiveIndex++;
          items[centroActiveIndex].classList.add('active');
          scrollIntoViewIfNeeded(items[centroActiveIndex], centroSuggestionsList);
        }
      } else if (e.key === 'ArrowUp') {
        e.preventDefault();
        if (centroActiveIndex > 0) {
          items[centroActiveIndex].classList.remove('active');
          centroActiveIndex--;
          items[centroActiveIndex].classList.add('active');
          scrollIntoViewIfNeeded(items[centroActiveIndex], centroSuggestionsList);
        }
      } else if (e.key === 'Enter') {
        if (centroActiveIndex >= 0 && centroActiveIndex < items.length) {
          e.preventDefault();
          selectCentroSuggestion(centroCurrentMatches[centroActiveIndex]);
        }
      } else if (e.key === 'Escape') {
        centroSuggestionsList.classList.add('hidden');
        centroInput.blur();
      }
    });
  }

  // Close autocomplete on outside click
  document.addEventListener('click', (e) => {
    if (e.target !== distritoInput && e.target !== suggestionsList) {
      suggestionsList.classList.add('hidden');
    }
    if (e.target !== centroInput && e.target !== centroSuggestionsList) {
      if (centroSuggestionsList) centroSuggestionsList.classList.add('hidden');
    }
  });

  // Toggle whatsapp
  function toggleWhatsappField() {
    if (whastappRadioNo.checked) {
      groupOtroWhatsapp.classList.add('expanded');
      groupOtroWhatsapp.setAttribute('data-required', 'true');
    } else {
      groupOtroWhatsapp.classList.remove('expanded');
      groupOtroWhatsapp.removeAttribute('data-required');
      inputOtroWhatsapp.value = '';
      groupOtroWhatsapp.classList.remove('has-error');
      if (errOtroWhatsapp) errOtroWhatsapp.classList.add('hidden');
    }
    calculateProgress();
  }

  whastappRadioSi.addEventListener('change', toggleWhatsappField);
  whastappRadioNo.addEventListener('change', toggleWhatsappField);

  // Progress Bar
  function calculateProgress() {
    const requiredFields = [
      { id: 'nombres', check: (val) => val.trim().length > 3 },
      { id: 'dni', check: (val) => /^\d{8}$/.test(val) },
      { id: 'distrito', check: (val) => val.trim().length > 2 },
      { id: 'centro', check: (val) => val.trim().length > 3 },
      { id: 'mesa', check: (val) => val.trim().length > 0 },
      { id: 'celular', check: (val) => /^\d{9}$/.test(val) },
      { id: 'correo', check: (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val) }
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

  const inputsToTrack = ['nombres', 'dni', 'distrito', 'centro', 'mesa', 'celular', 'whatsapp_otro', 'correo'];
  inputsToTrack.forEach(id => {
    const el = document.getElementById(id);
    if (el) {
      el.addEventListener('input', calculateProgress);
    }
  });

  // Real-time restrictions
  document.getElementById('nombres').addEventListener('input', function(e) {
    const start = this.selectionStart;
    const originalVal = this.value;
    const cleanedVal = originalVal.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
    if (originalVal !== cleanedVal) {
      this.value = cleanedVal;
      this.setSelectionRange(start - 1, start - 1);
    }
  });

  document.getElementById('distrito').addEventListener('input', function(e) {
    const start = this.selectionStart;
    const originalVal = this.value;
    const cleanedVal = originalVal.replace(/[^a-zA-ZáéíóúÁÉÍÓÚñÑüÜ\s]/g, '');
    if (originalVal !== cleanedVal) {
      this.value = cleanedVal;
      this.setSelectionRange(start - 1, start - 1);
    }
    renderSuggestions(this.value);
  });

  document.getElementById('dni').addEventListener('input', function(e) {
    this.value = this.value.replace(/\D/g, '');
  });

  document.getElementById('mesa').addEventListener('input', function(e) {
    this.value = this.value.replace(/\D/g, '');
  });

  document.getElementById('celular').addEventListener('input', function(e) {
    this.value = this.value.replace(/\D/g, '');
  });

  document.getElementById('whatsapp_otro').addEventListener('input', function(e) {
    this.value = this.value.replace(/\D/g, '');
  });

  // Validations
  function validateField(inputElement, errorElement, validationFn) {
    const group = inputElement.closest('.form-group');
    const isValid = validationFn(inputElement.value);
    
    if (isValid) {
      group.classList.remove('has-error');
      if (errorElement) errorElement.classList.add('hidden');
      return true;
    } else {
      group.classList.add('has-error');
      if (errorElement) errorElement.classList.remove('hidden');
      return false;
    }
  }

  document.getElementById('nombres').addEventListener('blur', function() {
    validateField(this, document.getElementById('err-nombres'), (val) => val.trim().length > 3);
  });

  document.getElementById('dni').addEventListener('blur', function() {
    validateField(this, document.getElementById('err-dni'), (val) => /^\d{8}$/.test(val));
  });

  document.getElementById('distrito').addEventListener('blur', function() {
    setTimeout(() => {
      suggestionsList.classList.add('hidden');
      validateField(this, document.getElementById('err-distrito'), (val) => val.trim().length > 2);
    }, 200);
  });

  document.getElementById('centro').addEventListener('blur', function() {
    validateField(this, document.getElementById('err-centro'), (val) => val.trim().length > 2);
  });

  document.getElementById('mesa').addEventListener('blur', function() {
    validateField(this, document.getElementById('err-mesa'), (val) => val.trim().length > 0);
  });

  document.getElementById('celular').addEventListener('blur', function() {
    validateField(this, document.getElementById('err-celular'), (val) => /^\d{9}$/.test(val));
  });

  document.getElementById('whatsapp_otro').addEventListener('blur', function() {
    if (whastappRadioNo.checked) {
      validateField(this, document.getElementById('err-whatsapp-otro'), (val) => /^\d{9}$/.test(val));
    }
  });

  document.getElementById('correo').addEventListener('blur', function() {
    validateField(this, document.getElementById('err-correo'), (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val));
  });

  // Form submit
  form.addEventListener('submit', async function(e) {
    e.preventDefault();
    
    const isNombresValid = validateField(document.getElementById('nombres'), document.getElementById('err-nombres'), (val) => val.trim().length > 3);
    const isDniValid = validateField(document.getElementById('dni'), document.getElementById('err-dni'), (val) => /^\d{8}$/.test(val));
    const isDistritoValid = validateField(document.getElementById('distrito'), document.getElementById('err-distrito'), (val) => val.trim().length > 2);
    const isCentroValid = validateField(document.getElementById('centro'), document.getElementById('err-centro'), (val) => val.trim().length > 2);
    const isMesaValid = validateField(document.getElementById('mesa'), document.getElementById('err-mesa'), (val) => val.trim().length > 0);
    const isCelularValid = validateField(document.getElementById('celular'), document.getElementById('err-celular'), (val) => /^\d{9}$/.test(val));
    const isCorreoValid = validateField(document.getElementById('correo'), document.getElementById('err-correo'), (val) => /^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(val));
    
    let isWhatsappAlternoValid = true;
    if (whastappRadioNo.checked) {
      isWhatsappAlternoValid = validateField(document.getElementById('whatsapp_otro'), document.getElementById('err-whatsapp-otro'), (val) => /^\d{9}$/.test(val));
    }
    
    if (
      isNombresValid && 
      isDniValid && 
      isDistritoValid && 
      isCentroValid && 
      isMesaValid && 
      isCelularValid && 
      isCorreoValid && 
      isWhatsappAlternoValid
    ) {
      const btn = document.getElementById('btn-submit-form');
      const originalContent = btn.innerHTML;
      btn.innerHTML = `<span class="spinner"></span> <span>Guardando...</span>`;
      btn.disabled = true;
      
      const formData = new FormData(form);
      const newRecord = {
        nombres: formData.get('nombres'),
        dni: formData.get('dni'),
        distrito: formData.get('distrito'),
        centro: formData.get('centro'),
        mesa: formData.get('mesa'),
        celular: formData.get('celular'),
        usa_whatsapp: formData.get('usa_whatsapp'),
        whatsapp_otro: formData.get('whatsapp_otro') || 'Mismo número',
        correo: formData.get('correo'),
        experiencia_personero: formData.get('experiencia_personero'),
        compromiso_2da_vuelta: formData.get('compromiso_2da_vuelta'),
        movilidad_propia: formData.get('movilidad_propia'),
        fecha_registro: new Date().toLocaleString('es-PE')
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
