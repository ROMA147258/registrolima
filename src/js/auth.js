/**
 * Authentication Module
 */
import { fetchRegistrations, checkUserLoginOnServer } from './api.js';

export const ROLES = {
  SUPERADMIN: 'superadmin',
  PERSONERO: 'personero',
  PERSONERO_REGISTRADO: 'personero_registrado'
};

/**
 * Normalizes and checks if inputUsername matches "first name and first surname" of fullName.
 * Supports names like "Juan Perez" or "Juan Manuel Perez Torres".
 * @param {string} fullName 
 * @param {string} inputUsername 
 * @returns {boolean}
 */
export function checkUsernameMatch(fullName, inputUsername) {
  const normalize = (str) => str.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9\s]/g, "").trim();
  
  const normFull = normalize(fullName);
  const normInput = normalize(inputUsername);
  
  const fullWords = normFull.split(/\s+/).filter(w => w.length > 0);
  const inputWords = normInput.split(/\s+/).filter(w => w.length > 0);
  
  if (inputWords.length === 0 || fullWords.length === 0) return false;
  
  // Cada palabra ingresada debe coincidir o estar contenida en alguna palabra del nombre completo registrado
  return inputWords.every(inputWord => {
    return fullWords.some(fullWord => {
      return fullWord === inputWord || 
             (inputWord.length >= 2 && fullWord.startsWith(inputWord)) ||
             (fullWord.length >= 2 && inputWord.startsWith(fullWord));
    });
  });
}

/**
 * Validates login credentials.
 * @param {string} username 
 * @param {string} password 
 * @returns {Promise<string|null>} The role string if successful, or null if failed.
 */
export async function login(username, password) {
  logout(); // Purge any existing session data before authenticating new user
  const cleanUser = username.trim().toLowerCase();
  const cleanPass = password.trim();
  
  if ((cleanUser === 'eric' && (cleanPass === 'eric123' || cleanPass === 'admin123')) ||
      (cleanUser === 'admin' && (cleanPass === 'admin123' || cleanPass === 'eric123'))) {
    localStorage.setItem('user_logged_in', 'true');
    localStorage.setItem('user_role', ROLES.SUPERADMIN);
    localStorage.setItem('admin_target_view', 'dashboard');
    return ROLES.SUPERADMIN;
  }
  

  // Si el password es un DNI (8 dígitos)
  if (/^\d{8}$/.test(cleanPass)) {
    try {
      let match = null;
      
      // Intentar primero con la consulta optimizada al servidor
      try {
        const res = await checkUserLoginOnServer(cleanPass);
        if (res.status === 'success' && res.user) {
          const user = res.user;
          // Validar nombre coincidente
          if (checkUsernameMatch(user["Nombres y Apellidos"], cleanUser)) {
            match = user;
          }
        }
      } catch (serverErr) {
        console.warn("Fallo login optimizado en el servidor. Intentando fallback local...", serverErr);
      }
      
      // Fallback local: Si el servidor falló o no tiene implementado la acción 'login' aún
      if (!match) {
        const registrations = await fetchRegistrations();
        match = registrations.find(r => {
          const matchesDni = String(r["D.N.I."]).trim() === cleanPass;
          const matchesName = checkUsernameMatch(r["Nombres y Apellidos"], cleanUser);
          return matchesDni && matchesName;
        });
      }
      
      if (match) {
        localStorage.setItem('user_logged_in', 'true');
        localStorage.setItem('user_role', ROLES.PERSONERO_REGISTRADO);
        localStorage.setItem('user_dni', match["D.N.I."]);
        localStorage.setItem('user_name', match["Nombres y Apellidos"]);
        localStorage.setItem('user_district', match["Distrito de Votación"] || '');
        localStorage.setItem('user_center', match["Centro de Votación"] || '');
        localStorage.setItem('user_mesa', match["Mesa Electoral"] || '');
        
        // Sanitizar contadores numéricos para evitar que se guarden strings vacíos o NaN
        var videoCountVal = (match["Video"] === "" || isNaN(match["Video"])) ? 0 : parseInt(match["Video"], 10);
        var pdfCountVal = (match["PDF"] === "" || isNaN(match["PDF"])) ? 0 : parseInt(match["PDF"], 10);
        
        localStorage.setItem('user_video_count', videoCountVal);
        localStorage.setItem('user_pdf_count', pdfCountVal);
        localStorage.setItem('user_credenciales', match["Credenciales"] || 'Bloqueado');
        return ROLES.PERSONERO_REGISTRADO;
      }
    } catch (err) {
      console.error("Error al validar las credenciales de personero:", err);
    }
  }
  
  return null;
}

/**
 * Ends the active session.
 */
export function logout() {
  localStorage.removeItem('user_logged_in');
  localStorage.removeItem('user_role');
  localStorage.removeItem('user_dni');
  localStorage.removeItem('user_name');
  localStorage.removeItem('user_district');
  localStorage.removeItem('user_center');
  localStorage.removeItem('user_mesa');
  localStorage.removeItem('user_video_count');
  localStorage.removeItem('user_pdf_count');
  localStorage.removeItem('user_credenciales');
  localStorage.removeItem('personero_logged_in');
}

/**
 * Retrieves the current session details.
 * @returns {Object}
 */
export function getCurrentSession() {
  const loggedIn = localStorage.getItem('user_logged_in') === 'true' || localStorage.getItem('personero_logged_in') === 'true';
  let role = localStorage.getItem('user_role');
  
  // Backwards compatibility with the old key
  if (loggedIn && !role) {
    role = ROLES.PERSONERO;
    localStorage.setItem('user_role', ROLES.PERSONERO);
  }
  
  return {
    loggedIn,
    role: loggedIn ? role : null,
    dni: localStorage.getItem('user_dni'),
    name: localStorage.getItem('user_name'),
    district: localStorage.getItem('user_district'),
    center: localStorage.getItem('user_center'),
    mesa: localStorage.getItem('user_mesa'),
    videoCount: parseInt(localStorage.getItem('user_video_count') || '0', 10),
    pdfCount: parseInt(localStorage.getItem('user_pdf_count') || '0', 10),
    credenciales: localStorage.getItem('user_credenciales') || 'Bloqueado'
  };
}