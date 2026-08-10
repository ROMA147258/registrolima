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

function extractUserField(user, possibleKeys) {
  if (!user) return '';
  for (let pk of possibleKeys) {
    if (user[pk] !== undefined && user[pk] !== null && user[pk] !== '') {
      return String(user[pk]).trim();
    }
  }
  const normalizedPKs = possibleKeys.map(k => k.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, ''));
  for (let key in user) {
    const normKey = key.toLowerCase().normalize("NFD").replace(/[\u0300-\u036f]/g, "").replace(/[^a-z0-9]/g, '');
    if (normalizedPKs.some(npk => normKey === npk || normKey.includes(npk) || npk.includes(normKey))) {
      return String(user[key]).trim();
    }
  }
  return '';
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
          const userName = extractUserField(user, ['Nombres y Apellidos', 'nombres']);
          if (checkUsernameMatch(userName, cleanUser)) {
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
          const rDni = extractUserField(r, ['D.N.I.', 'dni']);
          const rName = extractUserField(r, ['Nombres y Apellidos', 'nombres']);
          const matchesDni = String(rDni).trim() === cleanPass;
          const matchesName = checkUsernameMatch(rName, cleanUser);
          return matchesDni && matchesName;
        });
      }
      
      if (match) {
        localStorage.setItem('user_logged_in', 'true');
        localStorage.setItem('user_role', ROLES.PERSONERO_REGISTRADO);

        const dni = extractUserField(match, ['D.N.I.', 'dni']) || cleanPass;
        const name = extractUserField(match, ['Nombres y Apellidos', 'nombres']);
        
        // Priorizar columnas de Distrito Asignado y Mesa Asignada
        const distAsign = extractUserField(match, ['Distrito Asignado', 'distrito_asignado', 'Distrito donde Vota', 'Distrito de Votación', 'distrito']);
        const centroAsign = extractUserField(match, ['Local de Votación Asignado', 'Centro Asignado', 'centro_asignado', 'Local de Votación', 'Centro de Votación', 'centro']);
        const mesaAsign = extractUserField(match, ['Mesa Asignada', 'mesa_asignada', 'Mesa de Sufragio', 'Mesa Electoral', 'mesa']);
        const rolElect = extractUserField(match, ['Rol a Desempeñar', 'Rol Electoral', 'rol_electoral', 'rol']) || 'Personero de Mesa';

        localStorage.setItem('user_dni', dni);
        localStorage.setItem('user_name', name);
        localStorage.setItem('user_district', distAsign);
        localStorage.setItem('user_center', centroAsign);
        localStorage.setItem('user_mesa', mesaAsign);

        localStorage.setItem('user_rol_electoral', rolElect);
        localStorage.setItem('user_distrito_asignado', distAsign);
        localStorage.setItem('user_centro_asignado', centroAsign);
        localStorage.setItem('user_mesa_asignada', mesaAsign);
        
        // Sanitizar contadores numéricos para evitar que se guarden strings vacíos o NaN
        const rawVideo = extractUserField(match, ['Video', 'video']);
        const rawPdf = extractUserField(match, ['PDF', 'pdf']);
        const videoCountVal = (rawVideo === "" || isNaN(rawVideo)) ? 0 : parseInt(rawVideo, 10);
        const pdfCountVal = (rawPdf === "" || isNaN(rawPdf)) ? 0 : parseInt(rawPdf, 10);
        const credVal = extractUserField(match, ['Credenciales', 'credenciales']) || 'Bloqueado';
        
        localStorage.setItem('user_video_count', videoCountVal);
        localStorage.setItem('user_pdf_count', pdfCountVal);
        localStorage.setItem('user_credenciales', credVal);
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
  localStorage.removeItem('user_rol_electoral');
  localStorage.removeItem('user_distrito_asignado');
  localStorage.removeItem('user_centro_asignado');
  localStorage.removeItem('user_mesa_asignada');
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
    rolElectoral: localStorage.getItem('user_rol_electoral') || 'Personero',
    distritoAsignado: localStorage.getItem('user_distrito_asignado') || localStorage.getItem('user_district'),
    centroAsignado: localStorage.getItem('user_centro_asignado') || localStorage.getItem('user_center'),
    mesaAsignada: localStorage.getItem('user_mesa_asignada') || localStorage.getItem('user_mesa'),
    videoCount: parseInt(localStorage.getItem('user_video_count') || '0', 10),
    pdfCount: parseInt(localStorage.getItem('user_pdf_count') || '0', 10),
    credenciales: localStorage.getItem('user_credenciales') || 'Bloqueado'
  };
}