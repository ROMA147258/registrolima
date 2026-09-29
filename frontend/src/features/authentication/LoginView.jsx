import React, { useState } from 'react';
import { User, Lock, LogIn, ArrowLeft, ShieldAlert } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { BANK_SECURITY_STORAGE_KEY } from '../../utils/bankSecurity.js';
import { PrivacyPolicyModal } from '../../components/modals/PrivacyPolicyModal.jsx';
import { TermsModal } from '../../components/modals/TermsModal.jsx';
import { LegalFooter } from '../../components/common/LegalFooter.jsx';

export function LoginView({ onBackToRegister, successMessage = '' }) {
  const { login } = useAuth();
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState(null);
  const [successMsg, setSuccessMsg] = useState(successMessage || null);
  const [showPrivacyModal, setShowPrivacyModal] = useState(false);
  const [showTermsModal, setShowTermsModal] = useState(false);

  const [securityNotice, setSecurityNotice] = useState(() => {
    try {
      const notice = sessionStorage.getItem(BANK_SECURITY_STORAGE_KEY);
      if (notice) {
        sessionStorage.removeItem(BANK_SECURITY_STORAGE_KEY);
        return notice;
      }
      return null;
    } catch (e) {
      return null;
    }
  });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setErrorMsg(null);
    setSuccessMsg(null);

    const userVal = username.trim();
    const passVal = password.trim();

    if (!userVal || !passVal) {
      setErrorMsg('Por favor ingrese su usuario o nombre y su contraseña o DNI.');
      return;
    }

    setLoading(true);
    try {
      await login({
        username: userVal,
        fullName: userVal,
        password: passVal,
        dni: /^\d{7,9}$/.test(userVal) ? userVal : (/^\d{7,9}$/.test(passVal) ? passVal : '')
      });
    } catch (err) {
      setErrorMsg(err.message || 'Credenciales incorrectas. Verifique sus datos.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <main
      role="main"
      style={{
        minHeight: '100vh',
        background: '#ffffff',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '24px 16px',
        fontFamily: "'Outfit', 'Montserrat', sans-serif"
      }}
    >
      <div
        style={{
          background: '#ffffff',
          border: '1.5px solid #e2e8f0',
          borderRadius: '20px',
          width: '100%',
          maxWidth: '440px',
          boxShadow: '0 12px 35px rgba(0, 0, 0, 0.07)',
          color: '#0f172a',
          overflow: 'hidden',
          animation: 'fadeIn 0.2s ease-out'
        }}
      >
        {/* Selector Superior Ordenado de Pestañas (Registro / Ingresar) */}
        <nav aria-label="Navegación de acceso" style={{
          display: 'flex',
          justifyContent: 'center',
          gap: '8px',
          padding: '16px 20px 0',
          background: '#ffffff'
        }}>
          <div style={{
            display: 'flex',
            width: '100%',
            gap: '8px',
            padding: '4px',
            background: '#f8fafc',
            border: '1.5px solid #e2e8f0',
            borderRadius: '12px'
          }}>
            <button
              type="button"
              onClick={onBackToRegister}
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                background: 'transparent',
                color: '#64748b',
                fontWeight: 700,
                fontSize: '0.88rem',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'pointer',
                transition: 'all 0.15s ease'
              }}
              onMouseEnter={(e) => { e.currentTarget.style.color = '#0284c7'; e.currentTarget.style.background = '#f1f5f9'; }}
              onMouseLeave={(e) => { e.currentTarget.style.color = '#64748b'; e.currentTarget.style.background = 'transparent'; }}
            >
              <span>📝 Registro</span>
            </button>
            <button
              type="button"
              style={{
                flex: 1,
                padding: '10px 14px',
                borderRadius: '8px',
                border: 'none',
                background: '#ffffff',
                color: '#0284c7',
                fontWeight: 800,
                fontSize: '0.88rem',
                boxShadow: '0 2px 5px rgba(0,0,0,0.06)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                cursor: 'default'
              }}
            >
              <LogIn className="w-4 h-4" />
              <span>🔐 Ingresar</span>
            </button>
          </div>
        </nav>

        {/* Encabezado con Sello Oficial del Partido Somos Perú */}
        <header
          style={{
            background: '#ffffff',
            padding: '20px 24px 16px',
            textAlign: 'center',
            borderBottom: '1px solid #e2e8f0'
          }}
        >
          <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '14px' }}>
            <img
              src="/images/logo_somos_peru.svg"
              alt="Logotipo oficial del Partido Democrático Somos Perú"
              style={{ width: '130px', height: 'auto', maxHeight: '75px', objectFit: 'contain' }}
            />
          </div>

          <h1
            style={{
              fontFamily: 'Cinzel, serif',
              color: '#0f172a',
              fontSize: '1.25rem',
              fontWeight: 900,
              margin: '0 0 4px 0',
              letterSpacing: '0.5px',
              lineHeight: 1.25
            }}
          >
            ELECCIONES REGIONALES Y MUNICIPALES 2026
          </h1>

          <div
            style={{
              color: '#0284c7',
              fontSize: '0.82rem',
              fontWeight: 800,
              letterSpacing: '0.8px',
              textTransform: 'uppercase'
            }}
          >
            Plataforma de Capacitación y Seguimiento
          </div>

          <div style={{ display: 'flex', height: '3px', width: '100px', margin: '10px auto 0', borderRadius: '2px', overflow: 'hidden' }} aria-hidden="true">
            <div style={{ flex: 1, background: '#e30613' }}></div>
            <div style={{ flex: 1, background: '#cbd5e1' }}></div>
            <div style={{ flex: 1, background: 'rgb(14, 165, 233)' }}></div>
          </div>
        </header>

        {/* Formulario */}
        <section style={{ padding: '24px' }}>
          {securityNotice && (
            <div
              role="alert"
              style={{
                background: '#eff6ff',
                border: '1.5px solid #93c5fd',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '18px',
                color: '#1e40af',
                fontSize: '0.84rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <ShieldAlert size={18} style={{ color: '#2563eb', flexShrink: 0 }} aria-hidden="true" />
              <span>{securityNotice}</span>
            </div>
          )}

          {successMsg && (
            <div
              role="status"
              style={{
                background: '#f0fdf4',
                border: '1.5px solid #86efac',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '18px',
                color: '#15803d',
                fontSize: '0.84rem',
                fontWeight: 700,
                display: 'flex',
                alignItems: 'center',
                gap: '8px'
              }}
            >
              <span>✅ {successMsg}</span>
            </div>
          )}

          {errorMsg && (
            <div
              role="alert"
              style={{
                background: '#fef2f2',
                border: '1px solid #fecaca',
                borderRadius: '10px',
                padding: '12px 14px',
                marginBottom: '18px',
                color: '#dc2626',
                fontSize: '0.82rem',
                fontWeight: 700
              }}
            >
              ⚠️ {errorMsg}
            </div>
          )}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '16px' }}>
            {/* Campo 1: Usuario / Nombre */}
            <div>
              <label
                htmlFor="login-username"
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  marginBottom: '6px'
                }}
              >
                Usuario o Nombres <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <User className="w-5 h-5" style={{ position: 'absolute', left: '12px', top: '12px', color: '#0284c7' }} aria-hidden="true" />
                <input
                  id="login-username"
                  type="text"
                  value={username}
                  onChange={(e) => setUsername(e.target.value)}
                  placeholder="Ingrese sus nombres o usuario"
                  required
                  aria-required="true"
                  autoComplete="username"
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 40px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontSize: '0.92rem',
                    outline: 'none',
                    transition: 'all 0.15s ease'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgb(14, 165, 233)'; e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.2)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px', paddingLeft: '2px' }}>
                Ejemplo: Juan Pérez Quispe
              </div>
            </div>

            {/* Campo 2: Contraseña / DNI */}
            <div>
              <label
                htmlFor="login-password"
                style={{
                  display: 'block',
                  fontSize: '0.82rem',
                  fontWeight: 700,
                  color: '#1e293b',
                  marginBottom: '6px'
                }}
              >
                Contraseña o DNI <span style={{ color: '#ef4444' }}>*</span>
              </label>
              <div style={{ position: 'relative' }}>
                <Lock className="w-5 h-5" style={{ position: 'absolute', left: '12px', top: '12px', color: '#0284c7' }} aria-hidden="true" />
                <input
                  id="login-password"
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="Ingrese su DNI o clave asignada"
                  required
                  aria-required="true"
                  autoComplete="current-password"
                  style={{
                    width: '100%',
                    padding: '12px 14px 12px 40px',
                    borderRadius: '10px',
                    border: '1.5px solid #cbd5e1',
                    background: '#ffffff',
                    color: '#0f172a',
                    fontSize: '0.92rem',
                    outline: 'none',
                    transition: 'all 0.15s ease'
                  }}
                  onFocus={(e) => { e.target.style.borderColor = 'rgb(14, 165, 233)'; e.target.style.boxShadow = '0 0 0 3px rgba(14, 165, 233, 0.2)'; }}
                  onBlur={(e) => { e.target.style.borderColor = '#cbd5e1'; e.target.style.boxShadow = 'none'; }}
                />
              </div>
              <div style={{ fontSize: '0.74rem', color: '#64748b', marginTop: '4px', paddingLeft: '2px' }}>
                Ejemplo: Ingrese su DNI (o su clave si es Coordinador Distrital)
              </div>
            </div>

            {/* Botón Ingresar */}
            <button
              type="submit"
              disabled={loading}
              aria-label="Ingresar al sistema electoral"
              style={{
                marginTop: '8px',
                padding: '14px',
                borderRadius: '10px',
                border: 'none',
                background: 'rgb(14, 165, 233)',
                color: '#ffffff',
                fontWeight: 900,
                fontSize: '0.98rem',
                cursor: loading ? 'not-allowed' : 'pointer',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '8px',
                boxShadow: '0 4px 15px rgba(14, 165, 233, 0.4)',
                transition: 'all 0.2s cubic-bezier(0.4, 0, 0.2, 1)'
              }}
              onMouseDown={(e) => { e.currentTarget.style.transform = 'scale(0.98)'; }}
              onMouseUp={(e) => { e.currentTarget.style.transform = 'scale(1)'; }}
            >
              <LogIn className="w-5 h-5" aria-hidden="true" />
              <span>{loading ? 'Ingresando...' : 'Ingresar al Sistema'}</span>
            </button>
          </form>
        </section>

        {/* Footer Registro */}
        <div
          style={{
            padding: '14px 24px',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            textAlign: 'center'
          }}
        >
          <button
            type="button"
            onClick={onBackToRegister}
            style={{
              background: 'none',
              border: 'none',
              color: '#0284c7',
              fontSize: '0.88rem',
              fontWeight: 700,
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              transition: 'color 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.color = '#0369a1'; }}
            onMouseLeave={(e) => { e.currentTarget.style.color = '#0284c7'; }}
          >
            <ArrowLeft className="w-4 h-4 flex-shrink-0" aria-hidden="true" />
            <span>¿Aún no estás inscrito? Regístrate aquí</span>
          </button>
        </div>
      </div>

      {/* Pie Legal y Accesibilidad */}
      <LegalFooter
        onOpenPrivacy={() => setShowPrivacyModal(true)}
        onOpenTerms={() => setShowTermsModal(true)}
      />

      {/* Modales Legales */}
      <PrivacyPolicyModal
        isOpen={showPrivacyModal}
        onClose={() => setShowPrivacyModal(false)}
      />
      <TermsModal
        isOpen={showTermsModal}
        onClose={() => setShowTermsModal(false)}
      />
    </main>
  );
}

export default LoginView;
