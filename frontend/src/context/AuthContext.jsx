import React, { createContext, useContext, useState, useEffect } from 'react';
import { api } from '../services/api.js';

const AuthContext = createContext();

export function AuthProvider({ children }) {
  const [user, setUser] = useState(() => {
    const saved = localStorage.getItem('auth_user');
    return saved ? JSON.parse(saved) : null;
  });
  const [role, setRole] = useState(() => localStorage.getItem('user_role') || null);
  const [token, setToken] = useState(() => localStorage.getItem('token') || null);

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
      // Acceso directo garantizado para administradores predeterminados
      if (
        (cleanUser === 'eric' && (cleanPass === 'eric123' || cleanPass === 'admin123')) ||
        (cleanUser === 'admin' && (cleanPass === 'admin123' || cleanPass === 'eric123'))
      ) {
        const adminUser = cleanUser === 'eric'
          ? {
              username: 'eric',
              fullName: 'Eric - Administrador Central',
              role: 'superadmin',
              'Rol a Desempeñar': 'Administrador General',
              'Nombres y Apellidos': 'Eric - Administrador Central'
            }
          : {
              username: 'admin',
              fullName: 'Administrador General',
              role: 'superadmin',
              'Rol a Desempeñar': 'Administrador General',
              'Nombres y Apellidos': 'Administrador General'
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

  const logout = () => {
    setUser(null);
    setRole(null);
    setToken(null);
    localStorage.clear();
    window.location.hash = '';
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
  const cleanUsername = String(user?.username || '').toLowerCase();
  const isSuperAdmin = role === 'superadmin' || role === 'admin' || cleanUsername === 'eric' || cleanUsername === 'admin';
  const isCoordinadorDistrital = !isSuperAdmin && (
    Boolean(user?.isCoordinadorDistrital) ||
    rolName.includes('distrito') ||
    rolName.includes('distrital')
  );
  const isCoordinadorLocal = !isSuperAdmin && !isCoordinadorDistrital && (
    Boolean(user?.isCoordinadorLocal) ||
    rolName.includes('local') ||
    (rolName.includes('coordinador') && !rolName.includes('central'))
  );
  const isCoordinador = isCoordinadorDistrital || isCoordinadorLocal || (!isSuperAdmin && role === 'coordinador');
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
      isCoordinador,
      isCoordinadorDistrital,
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
