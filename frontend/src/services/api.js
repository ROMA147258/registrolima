const BASE_URL = '/api';

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
  getRoles: () => request('/roles'),
  getLocales: (distrito) => request(`/locales${distrito ? `?distrito=${encodeURIComponent(distrito)}` : ''}`),

  // Autenticación
  login: (credentials) => request('/auth/login', { method: 'POST', body: JSON.stringify(credentials) }),
  checkUser: (dni) => request(`/check_user?dni=${encodeURIComponent(dni)}`),

  // Registro
  registerPersonero: (formData) => request('/register', { method: 'POST', body: JSON.stringify(formData) }),

  // Capacitación
  updateProgress: (dni, type, current) => request(`/update_progress?dni=${encodeURIComponent(dni)}&type=${type}&current=${current}`),

  // Verificación Pública
  verifyToken: (token) => request(`/verify/${encodeURIComponent(token)}`),

  // Dashboard
  getDashboardSummary: () => request('/dashboard/summary'),
  getDashboardRecords: () => request('/dashboard/records'),
  updateAssignment: (dni, data) => request(`/personeros/${encodeURIComponent(dni)}/assignment`, { method: 'PUT', body: JSON.stringify(data) }),
  getExportUrl: (format = 'xlsx', district = '') => `${BASE_URL}/dashboard/export?format=${format}${district ? `&district=${encodeURIComponent(district)}` : ''}`
};
