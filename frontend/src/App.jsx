import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { RegistrationView } from './features/registration/RegistrationView.jsx';
import { LoginView } from './features/authentication/LoginView.jsx';
import { TrainingView } from './features/training/TrainingView.jsx';
import { DashboardView } from './features/dashboard/DashboardView.jsx';
import { PublicVerificationView } from './features/verification/PublicVerificationView.jsx';

export function App() {
  const { isLoggedIn, isSuperAdmin, isCoordinador, isPersonero } = useAuth();
  const [viewMode, setViewMode] = useState('register'); // 'register', 'login'
  const [isVerificationMode, setIsVerificationMode] = useState(
    window.location.hash.startsWith('#verificar')
  );

  useEffect(() => {
    const handleHashChange = () => {
      setIsVerificationMode(window.location.hash.startsWith('#verificar'));
    };

    window.addEventListener('hashchange', handleHashChange);
    return () => window.removeEventListener('hashchange', handleHashChange);
  }, []);

  // 1. Vista Pública de Verificación por QR
  if (isVerificationMode) {
    return <PublicVerificationView onGoHome={() => { window.location.hash = ''; }} />;
  }

  // 2. Usuario Autenticado
  if (isLoggedIn) {
    if (isSuperAdmin || isCoordinador) {
      return <DashboardView />;
    }
    if (isPersonero) {
      return <TrainingView />;
    }
  }

  // 3. Vistas Públicas de Registro / Login
  if (viewMode === 'login') {
    return <LoginView onBackToRegister={() => setViewMode('register')} />;
  }

  return (
    <RegistrationView
      onShowLogin={() => setViewMode('login')}
      onRegisteredSuccess={() => setViewMode('login')}
    />
  );
}
export default App;
