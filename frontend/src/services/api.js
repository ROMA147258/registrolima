import { getLocalesByDistrito, LOCALES_OFICIALES } from '../constants/localesCatalog.js';
import { DISTRITOS_LIMA } from '../constants/catalogs.js';

const BASE_URL = import.meta.env.VITE_API_URL || '/api';
const CATALOG_CACHE_VERSION = 'v2026_lima_1';

async function request(endpoint, options = {}) {
  // 🛑 GUARDA DE SEGURIDAD BANCARIA A 0 BYTES:
  // Si la aplicación está congelada en segundo plano o minimizada, bloquear peticiones de polling/fondo
  if (window.__APP_FROZEN_FOR_SECURITY__ || (document.hidden && options.isBackground)) {
    // Retorno silencioso sin tocar la red (0 peticiones, 0 bytes)
    return null;
  }

  const url = `${BASE_URL}${endpoint}`;
  const token = localStorage.getItem('token');

  const headers = {
    'Content-Type': 'application/json',
    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
    ...(options.headers || {})
  };

  try {
    const res = await fetch(url, { ...options, headers });
    if (res.status === 304) {
      return null; // No sobreescribir datos si el servidor indica no modificado
    }
    const data = await res.json().catch(() => ({}));
    if (!res.ok) {
      throw new Error(data.message || `Error HTTP: ${res.status}`);
    }
    return data;
  } catch (err) {
    if (!options.isBackground) {
      console.error(`❌ [API Client Error] ${endpoint}:`, err.message);
    }
    throw err;
  }
}

export const api = {
  // Health
  getHealth: () => request('/health'),

  // 💾 Catálogos con Almacenamiento Local (localStorage Cache a 0 Bytes)
  getDistritos: async () => {
    const cacheKey = `cached_distritos_${CATALOG_CACHE_VERSION}`;
    try {
      const cached = localStorage.getItem(cacheKey);
      if (cached) {
        return JSON.parse(cached);
      }
    } catch (e) {
      // Ignorar error de lectura local
    }

    try {
      const serverData = await request('/distritos');
      if (serverData && Array.isArray(serverData)) {
        try { localStorage.setItem(cacheKey, JSON.stringify(serverData)); } catch (e) {}
        return serverData;
      }
    } catch (err) {
      // Fallback local garantizado
    }

    // Fallback instantáneo a catálogo maestro local
    const fallbackDistritos = DISTRITOS_LIMA;
    try { localStorage.setItem(cacheKey, JSON.stringify(fallbackDistritos)); } catch (e) {}
    return fallbackDistritos;
  },

  getLocales: async (distrito, rol = null, excludeDni = null) => {
    // Si no tiene filtros dinámicos (excludeDni ni rol especial), leer de la caché local primero
    const isStandardQuery = !excludeDni && (!rol || rol === 'all');
    const normDist = String(distrito || '').trim().toUpperCase();
    const cacheKey = `cached_locales_${CATALOG_CACHE_VERSION}_${normDist}`;

    if (isStandardQuery && normDist) {
      try {
        const cached = localStorage.getItem(cacheKey);
        if (cached) {
          return JSON.parse(cached);
        }
      } catch (e) {}

      // Si no está en caché pero tenemos el catálogo local de 2,214 colegios:
      const localSchools = getLocalesByDistrito(normDist).map(l => l.nombre);
      if (localSchools && localSchools.length > 0) {
        try { localStorage.setItem(cacheKey, JSON.stringify(localSchools)); } catch (e) {}
        return localSchools;
      }
    }

    // Consulta de red para validaciones con disponibilidad en vivo
    const params = new URLSearchParams();
    if (distrito) params.append('distrito', distrito);
    if (rol) params.append('rol', rol);
    if (excludeDni) params.append('excludeDni', excludeDni);
    const qs = params.toString();

    try {
      const data = await request(`/locales${qs ? `?${qs}` : ''}`);
      if (isStandardQuery && normDist && Array.isArray(data)) {
        try { localStorage.setItem(cacheKey, JSON.stringify(data)); } catch (e) {}
      }
      return data;
    } catch (err) {
      // En caso de fallo o modo offline, retornar escuelas de memoria interna
      if (normDist) {
        const fallback = getLocalesByDistrito(normDist).map(l => l.nombre);
        if (fallback.length > 0) return fallback;
      }
      throw err;
    }
  },

  // Autenticación
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  checkUser: (dni) => request(`/check_user?dni=${encodeURIComponent(dni)}`),

  // Registro y Validación en Tiempo Real
  registerPersonero: (formData) => request('/register', { method: 'POST', body: JSON.stringify(formData) }),
  checkAvailability: (params) => {
    const query = new URLSearchParams(params).toString();
    return request(`/check_availability?${query}`);
  },

  // Capacitación
  updateProgress: (dni, type, current) => request(`/update_progress?dni=${encodeURIComponent(dni)}&type=${type}&current=${current}`),

  // Verificación Pública
  verifyToken: (token) => request(`/verify/${encodeURIComponent(token)}`),

  // Dashboard y Gestión de Personeros
  getDashboardSummary: () => request('/dashboard/summary', { isBackground: true }),
  getDashboardRecords: () => request('/dashboard/records', { isBackground: true }),
  getAuditLogs: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/dashboard/audit${qs ? `?${qs}` : ''}`, { isBackground: true });
  },
  updatePersonero: (dni, data) => request(`/personeros/${encodeURIComponent(dni)}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateAssignment: (dni, data) => request(`/personeros/${encodeURIComponent(dni)}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePersonero: (dni, data = {}) => request(`/personeros/${encodeURIComponent(dni)}`, { method: 'DELETE', body: JSON.stringify(data) }),
  getExportUrl: (format = 'xlsx', district = '') => `${BASE_URL}/dashboard/export?format=${format}${district ? `&district=${encodeURIComponent(district)}` : ''}`
};
