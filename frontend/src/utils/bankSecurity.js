/**
 * 🛑 SISTEMA DE SEGURIDAD Y AHORRO ESTILO BANCO (BANK-GRADE SECURITY)
 * 
 * 1. Auto-Logout en 90 Segundos (1.5 min) por Inactividad:
 *    Si el usuario deja la pantalla abierta sin interactuar durante 90 segundos, la sesión se cierra automáticamente.
 * 
 * 2. Congelación a 0 Bytes y Auto-Cierre en 25 Segundos en Segundo Plano:
 *    Si el usuario minimiza la pestaña, abre WhatsApp o bloquea el celular:
 *    - El tráfico de red y polling se detiene al 100% (0 peticiones).
 *    - Si permanece fuera de la app por más de 25 segundos, la sesión se cierra y purga de forma segura.
 *    - Si regresa antes de 25 segundos, se reanuda el ciclo normal.
 */

export const INACTIVITY_TIMEOUT_MS = 90 * 1000; // 90 segundos (1.5 min)
export const BACKGROUND_TIMEOUT_MS = 25 * 1000; // 25 segundos en segundo plano

export const BANK_SECURITY_STORAGE_KEY = 'bank_security_notice';

export function setupBankSecurity({ onLogout }) {
  let inactivityTimer = null;
  let backgroundTimer = null;
  let backgroundTimestamp = null;
  let isCleanedUp = false;

  // Estado global de congelación para la capa de red (api.js)
  window.__APP_FROZEN_FOR_SECURITY__ = false;

  const triggerSecurityLogout = (reasonText) => {
    if (isCleanedUp) return;
    try {
      sessionStorage.setItem(BANK_SECURITY_STORAGE_KEY, reasonText);
    } catch (e) {
      // Ignorar errores de almacenamiento
    }
    window.__APP_FROZEN_FOR_SECURITY__ = true;
    clearAllTimers();
    if (typeof onLogout === 'function') {
      onLogout();
    }
  };

  const clearAllTimers = () => {
    if (inactivityTimer) {
      clearTimeout(inactivityTimer);
      inactivityTimer = null;
    }
    if (backgroundTimer) {
      clearTimeout(backgroundTimer);
      backgroundTimer = null;
    }
  };

  const resetInactivityTimer = () => {
    // Si la app está en segundo plano, no reseteamos el temporizador de inactividad
    if (document.hidden || window.__APP_FROZEN_FOR_SECURITY__) return;

    if (inactivityTimer) clearTimeout(inactivityTimer);

    inactivityTimer = setTimeout(() => {
      console.warn('🔒 [Seguridad Bancaria] 90s de inactividad detectados. Cerrando sesión automáticamente...');
      triggerSecurityLogout('Sesión cerrada automáticamente por inactividad (90 segundos).');
    }, INACTIVITY_TIMEOUT_MS);
  };

  const handleVisibilityChange = () => {
    if (document.hidden) {
      // 🧊 CONGELACIÓN INMEDIATA A 0 BYTES
      window.__APP_FROZEN_FOR_SECURITY__ = true;
      backgroundTimestamp = Date.now();

      // Pausar temporizador de inactividad visible
      if (inactivityTimer) clearTimeout(inactivityTimer);

      // Iniciar cuenta regresiva de 25 segundos en segundo plano
      if (backgroundTimer) clearTimeout(backgroundTimer);
      backgroundTimer = setTimeout(() => {
        console.warn('🔒 [Seguridad Bancaria] 25s en segundo plano excedidos. Cerrando sesión por seguridad...');
        triggerSecurityLogout('Sesión cerrada por seguridad tras salir de la aplicación (25 segundos en segundo plano).');
      }, BACKGROUND_TIMEOUT_MS);
    } else {
      // ☀️ REGRESO A PRIMER PLANO
      const elapsedInBackground = backgroundTimestamp ? Date.now() - backgroundTimestamp : 0;

      if (elapsedInBackground >= BACKGROUND_TIMEOUT_MS) {
        // Excedió el tiempo mientras el temporizador del navegador estuvo suspendido por el SO
        triggerSecurityLogout('Sesión cerrada por seguridad tras salir de la aplicación (25 segundos en segundo plano).');
        return;
      }

      // Cancelar temporizador de segundo plano y descongelar red
      if (backgroundTimer) {
        clearTimeout(backgroundTimer);
        backgroundTimer = null;
      }
      backgroundTimestamp = null;
      window.__APP_FROZEN_FOR_SECURITY__ = false;

      // Reiniciar temporizador de 90 segundos de inactividad
      resetInactivityTimer();
    }
  };

  // Eventos de interacción del usuario
  const activityEvents = [
    'mousedown',
    'mousemove',
    'keydown',
    'scroll',
    'touchstart',
    'touchmove',
    'click',
    'wheel'
  ];

  // Throttle para no sobrecargar el hilo principal con eventos de mousemove/touchmove
  let lastActivityTime = 0;
  const handleUserActivity = () => {
    const now = Date.now();
    if (now - lastActivityTime > 500) {
      lastActivityTime = now;
      resetInactivityTimer();
    }
  };

  // Registrar listeners
  activityEvents.forEach(evt => {
    window.addEventListener(evt, handleUserActivity, { passive: true });
  });
  document.addEventListener('visibilitychange', handleVisibilityChange);
  window.addEventListener('pagehide', handleVisibilityChange);

  // Iniciar temporizador inicial
  resetInactivityTimer();

  // Retornar función de limpieza
  return () => {
    isCleanedUp = true;
    clearAllTimers();
    window.__APP_FROZEN_FOR_SECURITY__ = false;
    activityEvents.forEach(evt => {
      window.removeEventListener(evt, handleUserActivity);
    });
    document.removeEventListener('visibilitychange', handleVisibilityChange);
    window.removeEventListener('pagehide', handleVisibilityChange);
  };
}
