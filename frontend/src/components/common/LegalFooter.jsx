import React from 'react';
import { Shield, FileText, CheckCircle2, Lock } from 'lucide-react';

export function LegalFooter({ onOpenPrivacy, onOpenTerms, isLight = false }) {
  const currentYear = new Date().getFullYear();

  return (
    <footer
      role="contentinfo"
      aria-label="Información legal y accesibilidad"
      style={{
        marginTop: '28px',
        padding: '16px 12px 10px',
        textAlign: 'center',
        color: isLight ? '#64748b' : '#475569',
        fontSize: '0.74rem',
        borderTop: isLight ? '1px solid #e2e8f0' : '1px solid rgba(186, 230, 253, 0.4)',
        width: '100%',
        maxWidth: '720px',
        margin: '24px auto 0'
      }}
    >
      {/* Enlaces Legales */}
      <nav
        aria-label="Enlaces Legales"
        style={{
          display: 'flex',
          justifyContent: 'center',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '14px',
          marginBottom: '8px'
        }}
      >
        <button
          type="button"
          onClick={onOpenPrivacy}
          style={{
            background: 'none',
            border: 'none',
            color: '#0284c7',
            fontSize: '0.76rem',
            fontWeight: 700,
            cursor: 'pointer',
            padding: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            textDecoration: 'underline'
          }}
          aria-label="Abrir Política de Privacidad de Datos"
        >
          <Shield className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Política de Privacidad (Ley N° 29733)</span>
        </button>

        <span style={{ color: '#cbd5e1' }} aria-hidden="true">•</span>

        <button
          type="button"
          onClick={onOpenTerms}
          style={{
            background: 'none',
            border: 'none',
            color: '#0284c7',
            fontSize: '0.76rem',
            fontWeight: 700,
            cursor: 'pointer',
            padding: '4px',
            display: 'inline-flex',
            alignItems: 'center',
            gap: '4px',
            textDecoration: 'underline'
          }}
          aria-label="Abrir Términos y Condiciones Electorales"
        >
          <FileText className="w-3.5 h-3.5" aria-hidden="true" />
          <span>Términos y Condiciones del Sistema</span>
        </button>
      </nav>

      {/* Datos Institucionales y Leyes Locales */}
      <div style={{ lineHeight: 1.5, marginBottom: '6px' }}>
        <strong>Partido Democrático Somos Perú</strong> — Comité Electoral Lima 2026.
        <br />
        Plataforma oficial de capacitación y acreditación cívico-electoral (Sin fines comerciales).
      </div>

      {/* Copyright y Accesibilidad */}
      <div style={{ color: isLight ? '#94a3b8' : '#64748b', fontSize: '0.7rem' }}>
        © {currentYear} Todos los derechos reservados. Diseñado conforme a directrices de Accesibilidad Web (WCAG 2.1 AA) y Protección de Datos Personales del Perú.
      </div>
    </footer>
  );
}

export default LegalFooter;
