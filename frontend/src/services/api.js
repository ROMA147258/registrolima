const BASE_URL = import.meta.env.VITE_API_URL || '/api';

async function request(endpoint, options = {}) {
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
    console.error(`❌ [API Client Error] ${endpoint}:`, err.message);
    throw err;
  }
}

export const api = {
  // Health
  getHealth: () => request('/health'),

  // Catálogos
  getDistritos: () => request('/distritos'),
  getLocales: (distrito, rol = null) => {
    const params = new URLSearchParams();
    if (distrito) params.append('distrito', distrito);
    if (rol) params.append('rol', rol);
    const qs = params.toString();
    return request(`/locales${qs ? `?${qs}` : ''}`);
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
  getDashboardSummary: () => request('/dashboard/summary'),
  getDashboardRecords: () => request('/dashboard/records'),
  getAuditLogs: (params = {}) => {
    const qs = new URLSearchParams(params).toString();
    return request(`/dashboard/audit${qs ? `?${qs}` : ''}`);
  },
  updatePersonero: (dni, data) => request(`/personeros/${encodeURIComponent(dni)}`, { method: 'PUT', body: JSON.stringify(data) }),
  updateAssignment: (dni, data) => request(`/personeros/${encodeURIComponent(dni)}`, { method: 'PUT', body: JSON.stringify(data) }),
  deletePersonero: (dni, data = {}) => request(`/personeros/${encodeURIComponent(dni)}`, { method: 'DELETE', body: JSON.stringify(data) }),
  getExportUrl: (format = 'xlsx', district = '') => `${BASE_URL}/dashboard/export?format=${format}${district ? `&district=${encodeURIComponent(district)}` : ''}`
};

