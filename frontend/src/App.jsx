import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { RegistrationView } from './features/registration/RegistrationView.jsx';
import { LoginView } from './features/authentication/LoginView.jsx';
import { TrainingView } from './features/training/TrainingView.jsx';
import { DashboardView } from './features/dashboard/DashboardView.jsx';
import { PublicVerificationView } from './features/verification/PublicVerificationView.jsx';
export function App() {
  const {
    user,
    isLoggedIn,
    isSuperAdmin,
    isCoordinadorDistrital,
    isCoordinadorLocal,
    isCoordinador,
    isEvaluationApproved,
    isPersonero
  } = useAuth();
  const [viewMode, setViewMode] = useState('register'); // 'register', 'login'
  const [coordLocalTab, setCoordLocalTab] = useState(() => {
    return localStorage.getItem('login_initially_confirmed') === 'true' ? 'dashboard' : 'training';
  });
  const [isVerificationMode, setIsVerificationMode] = useState(
    window.location.hash.startsWith('#verificar')
  );

  useEffect(() => {
    if (user) {
      const isConfirmedAtLogin = localStorage.getItem('login_initially_confirmed') === 'true';
      setCoordLocalTab(isConfirmedAtLogin ? 'dashboard' : 'training');
    }
  }, [user?.['D.N.I.'], user?.DNI, user?.dni]);

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
    // 1. SuperAdmin (admin, eric) entra DIRECTAMENTE al Dashboard
    if (isSuperAdmin) {
      return <DashboardView />;
    }

    // 2. Coordinador de Distritos y Coordinador de Local: Requieren OBLIGATORIAMENTE aprobar evaluación (Credenciales = Confirmado)
    if (isCoordinadorDistrital || isCoordinadorLocal || isCoordinador) {
      if (!isEvaluationApproved) {
        return (
          <TrainingView
            onGoToDashboard={() => setCoordLocalTab('dashboard')}
          />
        );
      }

      // Si ya aprobó (Confirmado), puede alternar entre Dashboard y su Certificado/Ficha
      if (coordLocalTab === 'training') {
        return (
          <TrainingView
            onGoToDashboard={() => setCoordLocalTab('dashboard')}
          />
        );
      }

      return (
        <DashboardView
          onGoToTraining={() => setCoordLocalTab('training')}
        />
      );
    }

    // 3. Personero de Mesa (Capacitación y Evaluación)
    return <TrainingView />;
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
