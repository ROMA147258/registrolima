import React from 'react';
import { Loader2 } from 'lucide-react';

export function LoadingSpinner({ message = 'Cargando módulo...', minHeight = '100vh' }) {
  return (
    <div
      role="status"
      aria-live="polite"
      style={{
        minHeight,
        width: '100%',
        display: 'flex',
        flexDirection: 'column',
        justifyContent: 'center',
        alignItems: 'center',
        background: '#f8fafc',
        padding: '24px',
        fontFamily: "'Outfit', 'Montserrat', sans-serif"
      }}
    >
      <div
        style={{
          background: '#ffffff',
          border: '1.5px solid #bae6fd',
          borderRadius: '16px',
          padding: '28px 36px',
          display: 'flex',
          flexDirection: 'column',
          alignItems: 'center',
          gap: '14px',
          boxShadow: '0 10px 30px rgba(2, 132, 199, 0.08)'
        }}
      >
        <Loader2
          className="w-9 h-9 text-sky-600 animate-spin"
          style={{ animation: 'spin 1s linear infinite' }}
          aria-hidden="true"
        />
        <div
          style={{
            fontSize: '0.92rem',
            fontWeight: 700,
            color: '#0f172a',
            letterSpacing: '0.3px'
          }}
        >
          {message}
        </div>
        <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
          Somos Perú 2026 • Sistema Electoral
        </div>
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </div>
  );
}

export default LoadingSpinner;
