import { distritoMetas } from '../config.js';

/**
 * Lista oficial exacta de las 21 columnas en Google Sheets / Apps Script
 */
export const OFFICIAL_HEADERS = [
  "ID",
  "Fecha de Registro",
  "Nombres y Apellidos",
  "D.N.I.",
  "Celular",
  "Correo Electrónico",
  "¿Usa WhatsApp en su celular?",
  "Número WhatsApp Alterno",
  "Distrito donde Vota",
  "Mesa de Sufragio",
  "Local de Votación",
  "Rol a Desempeñar",
  "Distrito Asignado",
  "Mesa Asignada",
  "Local de Votación Asignado",
  "¿Tiene Experiencia como Personero?",
  "¿Cuenta con Movilidad Propia?",
  "¿Se compromete a colaborar el 4 de Octubre del 2026 en las Elecciones?",
  "Video",
  "PDF",
  "Credenciales"
];

/**
 * Normaliza cualquier texto quitando acentos, tildes, caracteres especiales y espacios.
 * @param {string} str 
 * @returns {string}
 */
export function normalizarTexto(str) {
  return String(str || "")
    .toLowerCase()
    .normalize("NFD")
    .replace(/[\u0300-\u036f]/g, "")
    .replace(/[^a-z0-9]/g, "");
}

/**
 * Safe helper to extract values from Google Sheets rows dynamically.
 * Handles variations in column header naming (both Spanish and normalized keys).
 * @param {Object} row - The raw data row object from the server.
 * @param {string[]} possibleKeys - The list of key variations to check.
 * @returns {string} The resolved string value.
 */
export function getRowValue(row, possibleKeys) {
  if (!row) return '';
  
  // 1. Direct match on possibleKeys
  for (let pk of possibleKeys) {
    if (row[pk] !== undefined && row[pk] !== null && String(row[pk]).trim() !== '') {
      return String(row[pk]).trim();
    }
  }
  
  // 2. Normalized key matching (ignoring accents, casing and special characters)
  const normalizedPKs = possibleKeys.map(k => normalizarTexto(k));
  for (let key in row) {
    const normKey = normalizarTexto(key);
    if (normalizedPKs.some(npk => normKey === npk || (npk.length > 3 && (normKey.includes(npk) || npk.includes(normKey))))) {
      const val = row[key];
      if (val !== undefined && val !== null && String(val).trim() !== '') {
        return String(val).trim();
      }
    }
  }
  
  return '';
}

/**
 * Parses any raw row into a clean, complete object containing all 21 official fields.
 * @param {Object} r - Raw row data.
 * @param {number} idx - Row index.
 * @returns {Object} Structured record.
 */
export function parseRecord(r, idx = 0) {
  if (!r) return {};

  const idVal = getRowValue(r, ['ID', 'id', 'Id', 'N°']) || String(idx + 1);
  const fechaVal = getRowValue(r, ['Fecha de Registro', 'Marca temporal', 'fecha_registro', 'fechaderegistro', 'timestamp', 'fecha']) || '-';
  const nombres = getRowValue(r, ['Nombres y Apellidos', 'nombres', 'nombre', 'Nombres', 'Nombre Completo']) || 'Sin Nombre';
  const dni = getRowValue(r, ['D.N.I.', 'dni', 'DNI', 'Documento']) || '-';
  const celular = getRowValue(r, ['Celular', 'Número de Celular', 'numero_celular', 'celular', 'Telefono']) || '-';
  const correo = getRowValue(r, ['Correo Electrónico', 'correo', 'correo_electronico', 'email', 'Email']) || '-';
  
  const usaWA = getRowValue(r, ['¿Usa WhatsApp en su celular?', '¿Usa WhatsApp?', 'usa_whatsapp', 'usawhatsapp']) || 'Sí';
  const waOtro = getRowValue(r, ['Número WhatsApp Alterno', 'WhatsApp Alterno', 'whatsapp_otro', 'whatsappalterno']) || 'Mismo número';

  // Lugar de Votación según DNI
  const distritoDni = getRowValue(r, ['Distrito donde Vota', 'Distrito de Votación', 'distrito', 'distrito_votacion']) || '-';
  const mesaDni = getRowValue(r, ['Mesa de Sufragio', 'Mesa Electoral', 'mesa', 'mesa_sufragio', 'mesa_electoral']) || '-';
  const localDni = getRowValue(r, ['Local de Votación', 'Centro de Votación', 'centro', 'local_votacion', 'centro_votacion']) || '-';

  // Rol y Asignación Electoral
  const rawRol = getRowValue(r, ['Rol a Desempeñar', 'Rol Electoral', 'rol_electoral', 'rol', 'Rol']) || 'Personero de Mesa';
  const rol = (rawRol.toLowerCase().includes('coord') || rawRol.toLowerCase().includes('local')) ? 'Coordinador de Local' : 'Personero de Mesa';

  const distritoAsignado = getRowValue(r, ['Distrito Asignado', 'distrito_asignado', 'distritoasignado']) || distritoDni;
  const mesaAsignada = getRowValue(r, ['Mesa Asignada', 'mesa_asignada', 'mesaasignada']) || mesaDni;
  const localAsignado = getRowValue(r, ['Local de Votación Asignado', 'Local Asignado', 'Centro Asignado', 'centro_asignado', 'local_asignado', 'localdevotacionasignado']) || localDni;

  // Logística y Compromiso
  const exp = getRowValue(r, ['¿Tiene Experiencia como Personero?', 'Experiencia como Personero', 'experiencia_personero', 'experiencia', 'tieneexperienciacomopersonero']) || 'No';
  const mov = getRowValue(r, ['¿Cuenta con Movilidad Propia?', 'Movilidad Propia', 'movilidad_propia', 'movilidad', 'cuentaconmovilidadpropia']) || 'No';
  const comp = getRowValue(r, ['¿Se compromete a colaborar el 4 de Octubre del 2026 en las Elecciones?', 'Compromiso 2da Vuelta 2026', 'compromiso_2da_vuelta', 'compromiso', 'secomprometeacolaborarel4deoctubredel2026enlaselecciones']) || 'Sí';

  // Control de Capacitación y Credenciales
  const rawVideo = getRowValue(r, ['Video', 'video']) || '0';
  const videoVal = isNaN(rawVideo) ? 0 : Math.min(2, Math.max(0, parseInt(rawVideo, 10)));

  const rawPdf = getRowValue(r, ['PDF', 'pdf']) || '0';
  const pdfVal = isNaN(rawPdf) ? 0 : Math.min(2, Math.max(0, parseInt(rawPdf, 10)));

  const rawCred = getRowValue(r, ['Credenciales', 'credenciales']) || '';
  const isCompleted = (videoVal >= 2 && pdfVal >= 2) || (rawCred.toLowerCase() === 'confirmado' || rawCred.toLowerCase() === 'desbloqueado' || rawCred.toLowerCase() === 'completado');
  const credenciales = isCompleted ? 'Confirmado' : 'Bloqueado';

  // Effective WhatsApp
  const cleanCel = celular.replace(/\D/g, '');
  const cleanOtro = waOtro.replace(/\D/g, '');
  const isWaYes = usaWA.toLowerCase() === 'sí' || usaWA.toLowerCase() === 'si';
  const effectiveWa = (!isWaYes && cleanOtro.length === 9) ? cleanOtro : (cleanCel.length === 9 ? cleanCel : '');
  const waLink = effectiveWa ? `https://wa.me/51${effectiveWa}?text=${encodeURIComponent(`Hola ${nombres}, te saludamos del equipo de ConteoLima / Somos Perú 2026.`)}` : '';

  return {
    raw: r,
    id: idVal,
    fecha_registro: fechaVal,
    nombres,
    dni,
    celular,
    correo,
    usa_whatsapp: isWaYes ? 'Sí' : 'No',
    whatsapp_otro: waOtro,
    distrito: distritoDni,
    mesa: mesaDni,
    centro: localDni,
    rol,
    distrito_asignado: distritoAsignado,
    mesa_asignada: mesaAsignada,
    centro_asignado: localAsignado,
    experiencia: exp,
    movilidad: mov,
    compromiso: comp,
    video: videoVal,
    pdf: pdfVal,
    credenciales,
    isCompleted,
    waNumber: effectiveWa || celular,
    waLink
  };
}

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

  const cleanInput = normalizarTexto(districtName).replace(/max/g, '');

  // Direct or exact normalized match
  for (let [distKey, goalVal] of Object.entries(distritoMetas)) {
    const cleanKey = normalizarTexto(distKey);
    if (cleanKey === cleanInput) {
      return goalVal;
    }
  }

  // Partial match for variations (e.g., 'Lima' vs 'Cercado de Lima', 'Lurigancho' vs 'Lurigancho-Chosica')
  for (let [distKey, goalVal] of Object.entries(distritoMetas)) {
    const cleanKey = normalizarTexto(distKey);
    if (cleanKey.includes(cleanInput) || cleanInput.includes(cleanKey)) {
      return goalVal;
    }
  }

  return 100; // Default fallback if district name is not found
}
