import React, { useState, useEffect } from 'react';
import { Cookie, ShieldCheck, Check } from 'lucide-react';

const COOKIE_CONSENT_KEY = 'sp_cookie_consent_v1';

export function CookieBanner({ onOpenPrivacy }) {
  const [showBanner, setShowBanner] = useState(false);

  useEffect(() => {
    try {
      const consent = localStorage.getItem(COOKIE_CONSENT_KEY);
      if (!consent) {
        setShowBanner(true);
      }
    } catch (e) {
      // Si localStorage no está disponible
    }
  }, []);

  const handleAccept = () => {
    try {
      localStorage.setItem(COOKIE_CONSENT_KEY, 'accepted');
    } catch (e) {}
    setShowBanner(false);
  };

  if (!showBanner) return null;

  return (
    <aside
      aria-label="Aviso de Cookies y Almacenamiento Técnico"
      style={{
        position: 'fixed',
        bottom: '16px',
        left: '16px',
        right: '16px',
        maxWidth: '560px',
        margin: '0 auto',
        background: '#ffffff',
        border: '1.5px solid #bae6fd',
        borderRadius: '16px',
        boxShadow: '0 20px 45px rgba(0, 0, 0, 0.18)',
        padding: '16px 20px',
        zIndex: 99990,
        display: 'flex',
        flexDirection: 'column',
        gap: '12px',
        animation: 'slideUp 0.3s cubic-bezier(0.16, 1, 0.3, 1)',
        fontFamily: "'Outfit', 'Montserrat', sans-serif"
      }}
    >
      <div style={{ display: 'flex', alignItems: 'flex-start', gap: '12px' }}>
        <div
          style={{
            width: '38px',
            height: '38px',
            borderRadius: '10px',
            background: '#e0f2fe',
            color: '#0284c7',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            flexShrink: 0
          }}
        >
          <Cookie className="w-5 h-5" aria-hidden="true" />
        </div>
        <div style={{ flex: 1 }}>
          <div
            style={{
              fontSize: '0.9rem',
              fontWeight: 800,
              color: '#0f172a',
              marginBottom: '4px',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <span>Uso de Cookies Técnicas y Almacenamiento Seguro</span>
            <ShieldCheck className="w-4 h-4 text-emerald-600" aria-hidden="true" />
          </div>
          <p
            style={{
              fontSize: '0.78rem',
              color: '#475569',
              margin: 0,
              lineHeight: 1.45
            }}
          >
            Utilizamos almacenamiento local y cookies <strong>estrictamente técnicas</strong> necesarias para mantener la seguridad de tu sesión, validar el progreso de capacitación y emitir credenciales. <em>No utilizamos cookies de rastreo publicitario ni fines comerciales.</em>
          </p>
        </div>
      </div>

      <div
        style={{
          display: 'flex',
          justifyContent: 'flex-end',
          alignItems: 'center',
          gap: '12px',
          borderTop: '1px solid #f1f5f9',
          paddingTop: '10px'
        }}
      >
        <button
          type="button"
          onClick={onOpenPrivacy}
          style={{
            background: 'none',
            border: 'none',
            color: '#0284c7',
            fontSize: '0.78rem',
            fontWeight: 700,
            cursor: 'pointer',
            textDecoration: 'underline'
          }}
        >
          Ver Política de Privacidad
        </button>
        <button
          type="button"
          onClick={handleAccept}
          style={{
            padding: '8px 18px',
            borderRadius: '8px',
            border: 'none',
            background: '#0284c7',
            color: '#ffffff',
            fontSize: '0.82rem',
            fontWeight: 800,
            cursor: 'pointer',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: '0 2px 8px rgba(2, 132, 199, 0.3)'
          }}
        >
          <Check className="w-4 h-4" />
          <span>Aceptar y Continuar</span>
        </button>
      </div>
    </aside>
  );
}

export default CookieBanner;
