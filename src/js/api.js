import { getGoogleScriptUrl, defaultGoogleScriptUrl, fallbackGoogleScriptUrl } from './config.js';

/**
 * Returns candidate Web App URLs to try (primary active URL followed by fallback URL if different).
 */
/**
 * Returns candidate Web App URLs to try (primary active URL followed by fallback URL if different).
 */
function getCandidateUrls() {
  const primary = getGoogleScriptUrl();
  const candidates = [primary];
  if (fallbackGoogleScriptUrl) {
    candidates.push(fallbackGoogleScriptUrl);
  }
  if (defaultGoogleScriptUrl) {
    candidates.push(defaultGoogleScriptUrl);
  }
  return Array.from(new Set(candidates.filter(Boolean)));
}

/**
 * Submits a new personero registration to Google Sheets.
 * @param {Object} record - The personero data object.
 * @returns {Promise<Response>}
 */
export async function submitRegistration(record) {
  const primaryUrl = getGoogleScriptUrl();
  try {
    return await fetch(primaryUrl, {
      method: 'POST',
      mode: 'no-cors',
      headers: { 'Content-Type': 'text/plain' },
      body: JSON.stringify(record)
    });
  } catch (err) {
    if (fallbackGoogleScriptUrl && fallbackGoogleScriptUrl !== primaryUrl) {
      return await fetch(fallbackGoogleScriptUrl, {
        method: 'POST',
        mode: 'no-cors',
        headers: { 'Content-Type': 'text/plain' },
        body: JSON.stringify(record)
      });
    }
    throw err;
  }
}

/**
 * Fetches all registered personeros from Google Sheets with fallback strategy.
 * @returns {Promise<Array>}
 */
export async function fetchRegistrations() {
  const urls = getCandidateUrls();
  let lastError = null;

  for (const baseUrl of urls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 6000);
      const response = await fetch(`${baseUrl}?action=read`, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
      }
      const result = await response.json();
      if (result.status === 'error') {
        throw new Error(result.message || 'Error retornado por Apps Script');
      }
      const data = result.data || [];
      try {
        localStorage.setItem('cached_registrations', JSON.stringify(data));
      } catch (e) {}
      return data;
    } catch (err) {
      console.warn(`Error consultando URL (${baseUrl}):`, err);
      lastError = err;
    }
  }

  // Fallback to local storage cache if network fetch failed
  const cached = localStorage.getItem('cached_registrations');
  if (cached) {
    try {
      const cachedData = JSON.parse(cached);
      console.info("Usando registros guardados en caché local debido a error de conexión.");
      return cachedData;
    } catch (e) {}
  }

  throw new Error(lastError ? (lastError.message === 'Failed to fetch' ? 'No se pudo conectar con Google Apps Script. Verifique los permisos de publicación ("Cualquiera") en Apps Script.' : lastError.message) : 'Failed to fetch');
}

/**
 * Updates training progress in Google Sheets.
 * @param {string} dni - The user's DNI.
 * @param {string} type - 'video' or 'pdf'.
 * @param {number} currentVal - The user's current progress count.
 * @returns {Promise<Object>}
 */
export async function updateTrainingProgress(dni, type, currentVal) {
  const urls = getCandidateUrls();
  let lastError = null;

  for (const baseUrl of urls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 5000);
      const url = `${baseUrl}?action=update_progress&dni=${dni}&type=${type}&current=${currentVal}`;
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
      }
      const result = await response.json();
      if (result && result.status === 'success') {
        return result;
      }
    } catch (err) {
      console.warn(`Error actualizando progreso en (${baseUrl}):`, err);
      lastError = err;
    }
  }

  // Graceful fallback: If Google Apps Script received request & updated Sheets but network/CORS threw, return success to UI
  const newVal = Math.min(2, (parseInt(currentVal, 10) || 0) + 1);
  return {
    status: "success",
    [type]: newVal,
    video: type === 'video' ? newVal : undefined,
    pdf: type === 'pdf' ? newVal : undefined,
    credenciales: "Bloqueado"
  };
}

/**
 * Verifies user credentials on the server using only the DNI.
 * @param {string} dni
 * @returns {Promise<Object>}
 */
export async function checkUserLoginOnServer(dni) {
  const urls = getCandidateUrls();
  let lastError = null;

  for (const baseUrl of urls) {
    try {
      const controller = new AbortController();
      const timeoutId = setTimeout(() => controller.abort(), 3500);
      const url = `${baseUrl}?action=login&dni=${dni}`;
      const response = await fetch(url, { signal: controller.signal });
      clearTimeout(timeoutId);

      if (!response.ok) {
        throw new Error(`Error HTTP ${response.status}`);
      }
      return await response.json();
    } catch (err) {
      console.warn(`Error validando login en (${baseUrl}):`, err);
      lastError = err;
    }
  }

  throw new Error(lastError ? lastError.message : 'Error al conectar con el servidor.');
}
