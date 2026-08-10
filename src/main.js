import './style.css';
import { getCurrentSession, logout, ROLES } from './js/auth.js';
import { getRegisterFormHTML, initRegisterForm } from './js/registerForm.js';
import { getLoginFormHTML, initLoginForm } from './js/loginForm.js';
import { getDashboardHTML, initDashboard } from './js/dashboard.js';
import { getTrainingHTML, initTraining } from './js/training.js';
import { getVerificationHTML, initVerification } from './js/verifyCertificate.js';

const app = document.querySelector('#app');

/**
 * Main application router / view-coordinator
 */
function renderApp(viewMode = 'register') {
  // Check if current URL is a QR verification route
  if (window.location.hash.startsWith('#verificar')) {
    document.body.classList.remove('full-screen-mode');
    app.classList.remove('wide-layout');
    app.innerHTML = getVerificationHTML();
    initVerification();
    return;
  }

  const session = getCurrentSession();

  if (!session.loggedIn) {
    document.body.classList.remove('full-screen-mode');
    app.classList.remove('wide-layout');

    if (viewMode === 'login') {
      // Pantalla de Inicio de Sesión
      app.innerHTML = getLoginFormHTML();
      initLoginForm(() => {
        renderApp();
      });
    } else {
      // Formulario de Registro por defecto al abrir localhost
      app.innerHTML = getRegisterFormHTML();
      initRegisterForm((actionType) => {
        if (actionType === 'show_login') {
          renderApp('login');
        } else {
          logout();
          renderApp('register');
        }
      });
    }
  } else {
    // Renderizar vistas protegidas basadas en el rol
    if (session.role === ROLES.SUPERADMIN) {
      // Al ingresar con la cuenta de Eric, mandar directamente al Dashboard
      app.innerHTML = getDashboardHTML();
      initDashboard(() => {
        logout();
        renderApp('register');
      });
    } else if (session.role === ROLES.PERSONERO_REGISTRADO || session.role === 'personero') {
      // Render Personero Training View (Capacítate: Video + PDF)
      document.body.classList.remove('full-screen-mode');
      app.classList.remove('wide-layout');
      app.innerHTML = getTrainingHTML();
      initTraining(() => {
        logout();
        renderApp('register');
      });
    } else {
      logout();
      renderApp('register');
    }
  }
}

// Listen for hash changes (e.g. scanning QR code or returning home)
window.addEventListener('hashchange', () => {
  renderApp();
});

// Start the app
renderApp();

