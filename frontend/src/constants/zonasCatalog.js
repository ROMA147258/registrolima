import zonasVmtData from './zonasVMT.json';

export const ZONAS_CONFIG = {
  "VILLA MARIA DEL TRIUNFO": zonasVmtData,
  "VILLA MARÍA DEL TRIUNFO": zonasVmtData,
  "VMT": zonasVmtData
};

const normalizeStr = (s) => (s || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Z0-9]/g, ' ').replace(/\s+/g, ' ').trim();

// Invert index: normalized local -> { zona, colegio, direccion, mesas }
const LOCAL_TO_ZONA_MAP = new Map();

for (const [dist, distZonas] of Object.entries(ZONAS_CONFIG)) {
  for (const [zonaName, colegios] of Object.entries(distZonas)) {
    colegios.forEach(item => {
      const norm = normalizeStr(item.colegio);
      if (!LOCAL_TO_ZONA_MAP.has(norm)) {
        LOCAL_TO_ZONA_MAP.set(norm, {
          zona: zonaName,
          distrito: dist,
          ...item
        });
      }
    });
  }
}

export function getZonaForLocal(localName) {
  if (!localName) return null;
  const norm = normalizeStr(localName);
  if (LOCAL_TO_ZONA_MAP.has(norm)) {
    return LOCAL_TO_ZONA_MAP.get(norm).zona;
  }
  // Fuzzy match
  for (const [key, val] of LOCAL_TO_ZONA_MAP.entries()) {
    if (key.includes(norm) || norm.includes(key)) {
      return val.zona;
    }
  }
  return null;
}

export function getZonasByDistrito(distritoName) {
  if (!distritoName) return null;
  const clean = normalizeStr(distritoName);
  if (clean.includes('VILLA MARIA') || clean.includes('TRIUNFO') || clean === 'VMT') {
    return ZONAS_CONFIG["VILLA MARIA DEL TRIUNFO"];
  }
  return null;
}
