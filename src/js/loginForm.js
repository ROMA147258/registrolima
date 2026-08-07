import { icons } from './icons.js';
import { login, ROLES } from './auth.js';

export function getLoginFormHTML() {
  return `
    <div class="mobile-card" id="card-login">
      <div class="card-header" style="border-bottom: none; padding-bottom: 8px;">
        <h1 class="card-title" style="margin-top: 6px;">Acceso</h1>
        <p class="card-subtitle">Ingrese sus datos de acceso</p>
      </div>
      
      <div class="view-content" style="padding-top: 16px;">
        <form id="login-form" novalidate>
          <!-- Usuario -->
          <div class="form-group" id="group-login-username">
            <label class="form-label">Nombres y Apellidos</label>
            <div class="input-wrapper">
              <input type="text" id="login-username" class="form-input" placeholder="Ej: Juan Pérez" autocomplete="username">
              <span class="input-icon">${icons.user}</span>
            </div>
            <div class="form-help-config" style="font-size: 0.7rem; color: var(--text-muted); margin-top: 4px;">
              Ingrese su primer nombre y primer apellido registrados.
            </div>
          </div>

          <!-- Contraseña -->
          <div class="form-group" id="group-login-password" style="margin-top: 16px;">
            <label class="form-label">Contraseña / D.N.I.</label>
            <div class="input-wrapper" style="position: relative;">
              <input type="password" id="login-password" class="form-input" placeholder="••••••••" autocomplete="current-password" style="padding-right: 40px;">
              <span class="input-icon">${icons.lock}</span>
              <button type="button" id="btn-toggle-password" style="position: absolute; right: 12px; top: 50%; transform: translateY(-50%); background: none; border: none; cursor: pointer; color: var(--text-muted); display: flex; align-items: center; justify-content: center; z-index: 10; padding: 0;">
                <span id="eye-icon-wrapper">${icons.eye}</span>
              </button>
            </div>
            <div class="error-message hidden" id="err-login" style="margin-top: 8px;">
              ${icons.alert} Usuario o contraseña incorrectos
            </div>
          </div>

          <!-- Botón de Ingreso -->
          <button type="submit" class="btn-submit" id="btn-login-submit" style="margin-top: 24px;">
            <span>Ingresar</span>
            ${icons.lock}
          </button>
        </form>
      </div>
    </div>
  `;
}

export function initLoginForm(onLoginSuccess) {
  const loginForm = document.getElementById('login-form');
  const usernameInput = document.getElementById('login-username');
  const passwordInput = document.getElementById('login-password');
  const errLogin = document.getElementById('err-login');
  const groupUsername = document.getElementById('group-login-username');
  const groupPassword = document.getElementById('group-login-password');
  const cardLogin = document.getElementById('card-login');
  const btnTogglePassword = document.getElementById('btn-toggle-password');
  const eyeIconWrapper = document.getElementById('eye-icon-wrapper');

  if (btnTogglePassword && eyeIconWrapper) {
    btnTogglePassword.addEventListener('click', () => {
      const type = passwordInput.getAttribute('type') === 'password' ? 'text' : 'password';
      passwordInput.setAttribute('type', type);
      eyeIconWrapper.innerHTML = type === 'password' ? icons.eye : icons.eyeOff;
    });
  }

  loginForm.addEventListener('submit', async (e) => {
    e.preventDefault();
    const username = usernameInput.value.trim();
    const password = passwordInput.value;

    const btnSubmit = document.getElementById('btn-login-submit');
    const originalText = btnSubmit.innerHTML;
    btnSubmit.innerHTML = `<span>Validando...</span> <span class="spinner-inline"></span>`;
    btnSubmit.disabled = true;

    try {
      const role = await login(username, password);

      if (role) {
        // Clear errors
        errLogin.classList.add('hidden');
        groupUsername.classList.remove('has-error');
        groupPassword.classList.remove('has-error');

        // Clear input fields
        usernameInput.value = '';
        passwordInput.value = '';

        // Trigger success callback
        onLoginSuccess(role);
      } else {
        // Show error message
        errLogin.classList.remove('hidden');
        groupUsername.classList.add('has-error');
        groupPassword.classList.add('has-error');
        
        // Shake animation
        cardLogin.style.animation = 'none';
        setTimeout(() => {
          cardLogin.style.animation = 'shake 0.4s ease';
        }, 10);
      }
    } catch (err) {
      console.error(err);
      errLogin.textContent = "Error al intentar conectar. Intente de nuevo.";
      errLogin.classList.remove('hidden');
    } finally {
      btnSubmit.innerHTML = originalText;
      btnSubmit.disabled = false;
    }
  });

  // Inject Shake CSS if not already present
  if (!document.getElementById('shake-style')) {
    const style = document.createElement('style');
    style.id = 'shake-style';
    style.innerHTML = `
      @keyframes shake {
        0%, 100% { transform: translateX(0); }
        20%, 60% { transform: translateX(-6px); }
        40%, 80% { transform: translateX(6px); }
      }
    `;
    document.head.appendChild(style);
  }
}
