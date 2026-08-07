/**
 * Dashboard Utility Functions
 */

/**
 * Safe helper to extract values from Google Sheets rows dynamically.
 * Handles variations in column header naming (both Spanish and normalized keys).
 * @param {Object} row - The raw data row object from the server.
 * @param {string[]} possibleKeys - The list of key variations to check.
 * @returns {string} The resolved string value.
 */
export function getRowValue(row, possibleKeys) {
  for (let pk of possibleKeys) {
    if (row[pk] !== undefined && row[pk] !== null && row[pk] !== '') {
      return String(row[pk]).trim();
    }
  }
  
  // Fallback: search by normalized keys (lowercased and alphanumeric only)
  const normalizedPKs = possibleKeys.map(k => k.toLowerCase().replace(/[^a-z0-9]/g, ''));
  for (let key in row) {
    const normKey = key.toLowerCase().replace(/[^a-z0-9]/g, '');
    if (normalizedPKs.some(npk => normKey === npk || normKey.includes(npk) || npk.includes(normKey))) {
      return String(row[key]).trim();
    }
  }
}

import { distritoMetas } from '../config.js';

/**
 * Returns the exact target goal (maximum personeros limit) for a given district.
 * If 'Todos los Distritos' or no district is specified, returns the sum of all district targets.
 * @param {string} districtName 
 * @returns {number} Target goal number
 */
export function getDistrictGoal(districtName) {
  if (!districtName || districtName === 'Todos los Distritos' || districtName === '__incompletos__') {
    return Object.values(distritoMetas).reduce((sum, goal) => sum + goal, 0);
  }

  const normalize = (str) => String(str)
    .replace(/\s*\(Max\)/i, '')
    .trim()
    .toLowerCase()
    .normalize("NFD").replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");

  const cleanInput = normalize(districtName);

  // Direct or exact normalized match
  for (let [distKey, goalVal] of Object.entries(distritoMetas)) {
    const cleanKey = normalize(distKey);
    if (cleanKey === cleanInput) {
      return goalVal;
    }
  }

  // Partial match for variations (e.g., 'Lima' vs 'Cercado de Lima', 'Lurigancho' vs 'Lurigancho-Chosica')
  for (let [distKey, goalVal] of Object.entries(distritoMetas)) {
    const cleanKey = normalize(distKey);
    if (cleanKey.includes(cleanInput) || cleanInput.includes(cleanKey)) {
      return goalVal;
    }
  }

  return 100; // Default fallback if district name is not found
}


