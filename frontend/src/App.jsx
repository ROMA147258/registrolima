import React, { useState, useEffect } from 'react';
import { useAuth } from './context/AuthContext.jsx';
import { RegistrationView } from './features/registration/RegistrationView.jsx';
import { LoginView } from './features/authentication/LoginView.jsx';
import { TrainingView } from './features/training/TrainingView.jsx';
import { DashboardView } from './features/dashboard/DashboardView.jsx';
import { PublicVerificationView } from './features/verification/PublicVerificationView.jsx';
import { RefreshCw, LayoutGrid } from 'lucide-react';

class AppErrorBoundary extends React.Component {
  constructor(props) {
    super(props);
    this.state = { hasError: false };
  }

  static getDerivedStateFromError() {
    return { hasError: true };
  }

  componentDidCatch(error, errorInfo) {
    console.error('AppErrorBoundary caught:', error, errorInfo);
  }

  render() {
    if (this.state.hasError) {
      return (
        <div style={{
          minHeight: '100vh',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'center',
          background: '#0f172a',
          color: '#ffffff',
          padding: '20px',
          fontFamily: "'Outfit', 'Montserrat', sans-serif"
        }}>
          <div style={{
            background: '#1e293b',
            borderRadius: '16px',
            border: '1px solid #334155',
            padding: '24px',
            maxWidth: '440px',
            width: '100%',
            textAlign: 'center'
          }}>
            <div style={{ width: '48px', height: '48px', borderRadius: '12px', background: 'rgba(2, 132, 199, 0.2)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center', margin: '0 auto 16px' }}>
              <LayoutGrid className="w-6 h-6" />
            </div>
            <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', marginBottom: '8px' }}>
              Panel Electoral Somos Perú
            </h3>
            <p style={{ fontSize: '0.82rem', color: '#94a3b8', marginBottom: '20px' }}>
              Los datos se han sincronizado correctamente. Pulsa para continuar en el panel.
            </p>
            <button
              onClick={() => this.setState({ hasError: false })}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '10px 20px',
                borderRadius: '10px',
                border: 'none',
                background: '#0284c7',
                color: '#ffffff',
                fontWeight: 800,
                fontSize: '0.86rem',
                cursor: 'pointer'
              }}
            >
              <RefreshCw className="w-4 h-4" />
              <span>Ver Dashboard</span>
            </button>
          </div>
        </div>
      );
    }
    return this.props.children;
  }
}

function MainApp() {
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

export function App() {
  return (
    <AppErrorBoundary>
      <MainApp />
    </AppErrorBoundary>
  );
}

export default App;
