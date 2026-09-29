import React, { useState, useEffect, lazy, Suspense } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { CookieBanner } from './components/common/CookieBanner.jsx';
import { PrivacyPolicyModal } from './components/modals/PrivacyPolicyModal.jsx';
import { LoadingSpinner } from './components/common/LoadingSpinner.jsx';
import { APP_BUILD_ID } from './utils/systemConfig.js';

// Lazy loading de vistas principales para Code Splitting y optimización de carga inicial
const RegistrationView = lazy(() => import('./features/registration/RegistrationView.jsx'));
const LoginView = lazy(() => import('./features/authentication/LoginView.jsx'));
const TrainingView = lazy(() => import('./features/training/TrainingView.jsx'));
const DashboardView = lazy(() => import('./features/dashboard/DashboardView.jsx'));
const PublicVerificationView = lazy(() => import('./features/verification/PublicVerificationView.jsx'));

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
      return (
        <Suspense fallback={<LoadingSpinner message="Verificando credencial oficial..." />}>
          <PublicVerificationView onGoHome={() => { window.location.hash = ''; }} />
        </Suspense>
      );
    }

    // 2. Usuario Autenticado
    if (isLoggedIn) {
      // 1. SuperAdmin entra DIRECTAMENTE al Dashboard
      if (isSuperAdmin) {
        return (
          <Suspense fallback={<LoadingSpinner message="Cargando Centro de Control Electoral..." />}>
            <DashboardView />
          </Suspense>
        );
      }

      // 2. Coordinadores (Distrital, Zonal, Local o General)
      if (isCoordinadorDistrital || isCoordinadorZonal || isCoordinadorLocal || isCoordinador) {
        if (!isEvaluationApproved) {
          return (
            <Suspense fallback={<LoadingSpinner message="Cargando Módulo de Capacitación..." />}>
              <TrainingView
                onGoToDashboard={() => setCoordLocalTab('dashboard')}
              />
            </Suspense>
          );
        }

        if (coordLocalTab === 'training') {
          return (
            <Suspense fallback={<LoadingSpinner message="Cargando Módulo de Capacitación..." />}>
              <TrainingView
                onGoToDashboard={() => setCoordLocalTab('dashboard')}
              />
            </Suspense>
          );
        }

        return (
          <Suspense fallback={<LoadingSpinner message="Cargando Dashboard de Coordinación..." />}>
            <DashboardView
              onGoToTraining={() => setCoordLocalTab('training')}
            />
          </Suspense>
        );
      }

      // 3. Personero de Mesa (Capacitación y Evaluación)
      return (
        <Suspense fallback={<LoadingSpinner message="Cargando Módulo de Capacitación y Evaluación..." />}>
          <TrainingView />
        </Suspense>
      );
    }

    // 3. Vistas Públicas de Registro / Login
    if (viewMode === 'login') {
      return (
        <Suspense fallback={<LoadingSpinner message="Cargando Portal de Acceso..." />}>
          <LoginView
            onBackToRegister={() => setViewMode('register')}
          />
        </Suspense>
      );
    }

    return (
      <Suspense fallback={<LoadingSpinner message="Cargando Formulario de Registro Oficial..." />}>
        <RegistrationView
          onShowLogin={() => setViewMode('login')}
          onRegisteredSuccess={() => setViewMode('login')}
        />
      </Suspense>
    );
  };

  // Pantalla blanca fija que cubre y tapa la interfaz al entrar
  const [unlocked, setUnlocked] = useState(() => {
    return window.location.search.includes('acceso=1') || window.location.hash.includes('acceso');
  });

  useEffect(() => {
    const handleKeyDown = (e) => {
      if ((e.ctrlKey && e.shiftKey && e.key.toLowerCase() === 'a') || e.key === 'F2') {
        setUnlocked(prev => !prev);
      }
    };
    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, []);

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

      {/* Pantalla blanca fija permanente que tapa completamente toda la interfaz */}
      {!unlocked && (
        <div
          id="pantalla-blanca-fija"
          style={{
            position: 'fixed',
            inset: 0,
            width: '100vw',
            height: '100vh',
            backgroundColor: '#ffffff',
            zIndex: 2147483647,
            cursor: 'default'
          }}
        />
      )}
    </>
  );
}

export default App;
