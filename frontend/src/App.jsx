import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { RegistrationView } from './features/registration/RegistrationView.jsx';
import { LoginView } from './features/authentication/LoginView.jsx';
import { TrainingView } from './features/training/TrainingView.jsx';
import { DashboardView } from './features/dashboard/DashboardView.jsx';
import { PublicVerificationView } from './features/verification/PublicVerificationView.jsx';
import { CookieBanner } from './components/common/CookieBanner.jsx';
import { PrivacyPolicyModal } from './components/modals/PrivacyPolicyModal.jsx';
import { APP_BUILD_ID } from './utils/systemConfig.js';

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
  
  const [viewMode, setViewMode] = useState('login'); // 'login' por defecto, 'register'
  const [coordLocalTab, setCoordLocalTab] = useState('dashboard');
  const [showGlobalPrivacy, setShowGlobalPrivacy] = useState(false);
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

  const renderContent = () => {
    // 1. Vista Pública de Verificación por QR
    if (isVerificationMode) {
      return <PublicVerificationView onGoHome={() => { window.location.hash = ''; }} />;
    }

    // 2. Usuario Autenticado
    if (isLoggedIn) {
      // 1. SuperAdmin entra DIRECTAMENTE al Dashboard
      if (isSuperAdmin) {
        return <DashboardView />;
      }

      // 2. Coordinadores (Distrital, Zonal, Local o General)
      if (isCoordinadorDistrital || isCoordinadorZonal || isCoordinadorLocal || isCoordinador) {
        if (!isEvaluationApproved) {
          return (
            <TrainingView
              onGoToDashboard={() => setCoordLocalTab('dashboard')}
            />
          );
        }

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
  };

  return (
    <>
      {renderContent()}
      
      {/* Banner de Cookies Técnicas */}
      <CookieBanner onOpenPrivacy={() => setShowGlobalPrivacy(true)} />

      {/* Modal Global de Privacidad */}
      <PrivacyPolicyModal
        isOpen={showGlobalPrivacy}
        onClose={() => setShowGlobalPrivacy(false)}
      />
    </>
  );
}

export default App;
