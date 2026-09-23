import React, { createContext, useContext, useState, useEffect, useCallback } from 'react';
import { api } from '../services/api.js';
import { setupBankSecurity } from '../utils/bankSecurity.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    try {
      const saved = localStorage.getItem('auth_user');
      return saved ? JSON.parse(saved) : null;
    } catch (e) {
      return null;
    }
  });
  const [role, setRole] = useState(() => {
    try { return localStorage.getItem('user_role') || null; } catch (e) { return null; }
  });
  const [token, setToken] = useState(() => {
    try { return localStorage.getItem('token') || null; } catch (e) { return null; }
  });

  const logout = useCallback(() => {
    setUser(null);
    setRole(null);
    setToken(null);
    // Limpieza selectiva de credenciales preservando la caché offline de catálogos
    const sessionKeys = [
      'auth_user',
      'user_role',
      'token',
      'user_logged_in',
      'login_initially_confirmed'
    ];
    sessionKeys.forEach(k => localStorage.removeItem(k));
    window.location.hash = '';
  }, []);

  // 🛑 Activación de Seguridad Bancaria (Auto-Logout 90s y Auto-Cierre 25s en Background)
  useEffect(() => {
    if (!user) return;
    const cleanupSecurity = setupBankSecurity({
      onLogout: () => {
        logout();
      }
    });
    return () => {
      cleanupSecurity();
    };
  }, [user, logout]);

  const login = async (credentials) => {
    const cleanUser = String(credentials.username || credentials.fullName || '').toLowerCase().trim();
    const cleanPass = String(credentials.password || credentials.dni || '').trim();

    try {
      const res = await api.login(credentials);
      if (res && res.status === 'success') {
        setUser(res.user);
        setRole(res.role);
        setToken(res.token || 'session_token');

        const cred = String(res.user?.Credenciales ?? res.user?.credenciales ?? res.user?.['Estado Credencial'] ?? res.user?.estadoCredencial ?? '').toLowerCase().trim();
        const quiz = String(res.user?.Preguntas ?? res.user?.preguntas ?? res.user?.['Evaluación Estado'] ?? res.user?.evaluacionEstado ?? '').toLowerCase().trim();
        const isConfirmedAtLogin = cred === 'confirmado' || quiz.includes('aprob') || quiz.includes('pasad');
        localStorage.setItem('login_initially_confirmed', isConfirmedAtLogin ? 'true' : 'false');

        localStorage.setItem('auth_user', JSON.stringify(res.user));
        localStorage.setItem('user_role', res.role);
        if (res.token) localStorage.setItem('token', res.token);
        localStorage.setItem('user_logged_in', 'true');
        return res;
      }
      throw new Error(res?.message || 'Error de autenticación');
    } catch (err) {
      // Acceso directo garantizado para superadministrador predeterminado (supera, admin)
      const SUPERADMIN_CREDENTIALS = {
        supera: { pass: ['abcde12345', 'admin123'], name: 'Superadministrador Principal' },
        admin: { pass: ['abcde12345', 'admin123'], name: 'Superadministrador Principal' }
      };

      if (SUPERADMIN_CREDENTIALS[cleanUser] && SUPERADMIN_CREDENTIALS[cleanUser].pass.includes(cleanPass)) {
        const adminUser = {
          username: cleanUser,
          fullName: SUPERADMIN_CREDENTIALS[cleanUser].name,
          role: 'superadmin',
          'Rol a Desempeñar': 'Superadministrador',
          'Nombres y Apellidos': SUPERADMIN_CREDENTIALS[cleanUser].name
        };
        setUser(adminUser);
        setRole('superadmin');
        setToken('admin_master_token');

        localStorage.setItem('auth_user', JSON.stringify(adminUser));
        localStorage.setItem('user_role', 'superadmin');
        localStorage.setItem('token', 'admin_master_token');
        localStorage.setItem('user_logged_in', 'true');
        return { status: 'success', user: adminUser, role: 'superadmin' };
      }
      throw err;
    }
  };

  const updateUserTraining = (updates) => {
    if (!updates) return;
    setUser(prev => {
      if (!prev) return prev;
      const v = updates.video !== undefined ? updates.video : (updates.Video !== undefined ? updates.Video : prev.Video);
      const p = updates.pdf !== undefined ? updates.pdf : (updates.PDF !== undefined ? updates.PDF : prev.PDF);
      const q = updates.quiz !== undefined ? updates.quiz : (updates.Preguntas !== undefined ? updates.Preguntas : (updates.preguntas !== undefined ? updates.preguntas : prev.Preguntas));
      const c = updates.credenciales !== undefined ? updates.credenciales : (updates.Credenciales !== undefined ? updates.Credenciales : prev.Credenciales);

      const extraData = updates.user || updates.data || {};
      const updated = {
        ...prev,
        ...extraData,
        Video: v,
        PDF: p,
        Preguntas: q,
        Credenciales: c,
        video: v,
        pdf: p,
        preguntas: q,
        credenciales: c
      };
      localStorage.setItem('auth_user', JSON.stringify(updated));
      return updated;
    });
  };

  const rolName = String(user?.['Rol a Desempeñar'] || user?.role || '').toLowerCase();
  const cleanUsername = String(user?.username || user?.usuario || '').toLowerCase();
  const fullName = String(user?.['Nombres y Apellidos'] || user?.fullName || '').toLowerCase();
  const isSuperAdmin = role === 'superadmin' || role === 'admin' || ['supera', 'admin'].includes(cleanUsername) || rolName === 'superadministrador';
  
  const isMasterSuperAdmin = (cleanUsername === 'supera' || cleanUsername === 'admin' || role === 'superadmin' || role === 'admin');
  
  // Auditoría disponible para todos los usuarios Superadministradores
  const canViewAudit = isSuperAdmin;

  const isCoordinadorDistrital = !isSuperAdmin && (
    Boolean(user?.isCoordinadorDistrital) ||
    rolName.includes('distrito') ||
    rolName.includes('distrital')
  );
  const isCoordinadorZonal = !isSuperAdmin && !isCoordinadorDistrital && (
    Boolean(user?.isCoordinadorZonal) ||
    rolName.includes('zonal') ||
    rolName.includes('zona')
  );
  const isCoordinadorLocal = !isSuperAdmin && !isCoordinadorDistrital && !isCoordinadorZonal && (
    Boolean(user?.isCoordinadorLocal) ||
    rolName.includes('local') ||
    (rolName.includes('coordinador') && !rolName.includes('central'))
  );
  const isCoordinador = isCoordinadorDistrital || isCoordinadorZonal || isCoordinadorLocal || (!isSuperAdmin && role === 'coordinador');
  const isPersonero = !isSuperAdmin && !isCoordinador;

  const quizStatus = String(user?.Preguntas ?? user?.preguntas ?? user?.['Evaluación Estado'] ?? user?.evaluacionEstado ?? '').toLowerCase().trim();
  const credStatus = String(user?.Credenciales ?? user?.credenciales ?? user?.['Estado Credencial'] ?? user?.estadoCredencial ?? '').toLowerCase().trim();
  const isEvaluationApproved = credStatus === 'confirmado' || quizStatus.includes('aprob') || quizStatus.includes('pasad');

  return (
    <AuthContext.Provider value={{
      user,
      role,
      token,
      isLoggedIn: Boolean(user),
      isSuperAdmin,
      isMasterSuperAdmin,
      canViewAudit,
      isCoordinador,
      isCoordinadorDistrital,
      isCoordinadorZonal,
      isCoordinadorLocal,
      isPersonero,
      isEvaluationApproved,
      login,
      logout,
      updateUserTraining
    }}>
      {children}
    </AuthContext.Provider>
  );
}

export function useAuth() {
  return useContext(AuthContext);
}
