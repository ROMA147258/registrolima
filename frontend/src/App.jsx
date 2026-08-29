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
    isCoordinadorZonal,
    isCoordinadorLocal,
    isCoordinador,
    isEvaluationApproved,
    isPersonero
  } = useAuth();
  
  const [viewMode, setViewMode] = useState('register'); // 'register', 'login'
  const [coordLocalTab, setCoordLocalTab] = useState('dashboard');
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
    // 1. SuperAdmin (admin, eric, paola, susana) entra DIRECTAMENTE al Dashboard
    if (isSuperAdmin) {
      return <DashboardView />;
    }

    // 2. Coordinadores (Distrital, Zonal, Local o General)
    if (isCoordinadorDistrital || isCoordinadorZonal || isCoordinadorLocal || isCoordinador) {
      // Si aún no ha aprobado la evaluación, se le muestra la vista de capacitación
      if (!isEvaluationApproved) {
        return (
          <TrainingView
            onGoToDashboard={() => setCoordLocalTab('dashboard')}
          />
        );
      }

      // Si ya aprobó (Confirmado), permanece en Dashboard por defecto salvo que elija ver su certificado/ficha
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
    return (
      <LoginView
        onBackToRegister={() => setViewMode('register')}
      />
    );
  }

  return (
    <RegistrationView
      onShowLogin={() => setViewMode('login')}
      onRegisteredSuccess={() => setViewMode('login')}
    />
  );
}

export default App;
