import React, { useEffect, useRef } from 'react';
import { FileCheck, X, Check, Award, AlertCircle, Shield } from 'lucide-react';

export function TermsModal({ isOpen, onClose }) {
  const modalRef = useRef(null);

  useEffect(() => {
    const handleKeyDown = (e) => {
      if (e.key === 'Escape' && isOpen) {
        onClose();
      }
    };
    if (isOpen) {
      document.body.style.overflow = 'hidden';
      window.addEventListener('keydown', handleKeyDown);
    }
    return () => {
      document.body.style.overflow = 'unset';
      window.removeEventListener('keydown', handleKeyDown);
    };
  }, [isOpen, onClose]);

  if (!isOpen) return null;

  return (
    <div
      role="dialog"
      aria-modal="true"
      aria-labelledby="terms-title"
      style={{
        position: 'fixed',
        top: 0,
        left: 0,
        right: 0,
        bottom: 0,
        backgroundColor: 'rgba(15, 23, 42, 0.75)',
        backdropFilter: 'blur(4px)',
        display: 'flex',
        justifyContent: 'center',
        alignItems: 'center',
        padding: '16px',
        zIndex: 99999,
        animation: 'fadeIn 0.2s ease-out'
      }}
      onClick={(e) => {
        if (e.target === e.currentTarget) onClose();
      }}
    >
      <div
        ref={modalRef}
        style={{
          background: '#ffffff',
          borderRadius: '18px',
          maxWidth: '680px',
          width: '100%',
          maxHeight: '88vh',
          display: 'flex',
          flexDirection: 'column',
          boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.25)',
          border: '1.5px solid #bae6fd',
          overflow: 'hidden'
        }}
      >
        {/* Header */}
        <div
          style={{
            padding: '20px 24px',
            background: 'linear-gradient(135deg, #0f172a 0%, #1e293b 100%)',
            color: '#ffffff',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'space-between',
            borderBottom: '1px solid rgba(255, 255, 255, 0.1)'
          }}
        >
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div
              style={{
                width: '40px',
                height: '40px',
                borderRadius: '10px',
                background: 'rgba(14, 165, 233, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <FileCheck className="w-5 h-5 text-sky-400" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="terms-title"
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 900,
                  margin: 0,
                  letterSpacing: '0.3px',
                  color: '#ffffff'
                }}
              >
                TÉRMINOS Y CONDICIONES DEL SISTEMA ELECTORAL
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: '#94a3b8' }}>
                Partido Democrático Somos Perú • Elecciones Regionales y Municipales 2026
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar términos y condiciones"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '8px',
              padding: '6px',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}
          >
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Content */}
        <div
          tabIndex="0"
          style={{
            padding: '24px',
            overflowY: 'auto',
            fontSize: '0.86rem',
            lineHeight: '1.6',
            color: '#334155'
          }}
        >
          {/* 1. Naturaleza del Sistema */}
          <section style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              1. Naturaleza Institucional y Sin Fines de Lucro
            </h3>
            <p style={{ margin: 0 }}>
              La presente plataforma es una herramienta tecnológica institucional desarrollada con fines de organización democrática, capacitación electoral y acreditación de personeros del <strong>Partido Democrático Somos Perú</strong>. No constituye una tienda electrónica ni realiza transacciones comerciales o cobros.
            </p>
          </section>

          {/* 2. Compromiso y Veracidad */}
          <section style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              2. Declaración Jurada y Veracidad de la Información
            </h3>
            <p style={{ margin: 0 }}>
              Al registrarse, el usuario declara bajo juramento que toda la información ingresada (DNI, nombres, datos de contacto y mesa) es verídica y corresponde a su persona. <strong>Queda terminantemente prohibida la suplantación de identidad o el registro de datos falsos</strong>, actos sancionados conforme a las leyes electorales y el Código Penal peruano.
            </p>
          </section>

          {/* 3. Deberes del Personero y Coordinador */}
          <section style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              3. Deberes y Obligaciones Electorales
            </h3>
            <p style={{ margin: '0 0 6px 0' }}>El personero o coordinador registrado se compromete a:</p>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li>Completar la capacitación obligatoria (video explicativo, cartilla de funciones y evaluación de conocimientos).</li>
              <li>Presentarse puntualmente el día de las elecciones en su centro de sufragio con su credencial oficial y DNI vigente.</li>
              <li>Defender con probidad y transparencia la voluntad popular expresada en las urnas según la Ley Orgánica de Elecciones.</li>
              <li>Reportar de manera veraz y diligente los resultados del escrutinio y copias de actas electorales al centro de control del partido.</li>
            </ul>
          </section>

          {/* 4. Confidencialidad y Custodia */}
          <section style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              4. Custodia de Claves de Acceso y Credenciales
            </h3>
            <p style={{ margin: 0 }}>
              Las credenciales digitales, códigos QR y claves de acceso asignadas a los coordinadores distritales, zonales y de local son <strong>personales e intransferibles</strong>. El usuario es responsable de su custodia y de todo acto realizado desde su cuenta.
            </p>
          </section>

          {/* 5. Propiedad Intelectual y Copyright */}
          <section style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              5. Derechos de Autor y Propiedad Intelectual
            </h3>
            <p style={{ margin: 0 }}>
              Todos los logotipos, símbolos partidarios (corazón de Somos Perú), cartillas instructivas en PDF, guiones de capacitación, bancos de preguntas y código del sistema son propiedad exclusiva del <strong>Partido Democrático Somos Perú</strong>. Se prohíbe su reproducción con fines comerciales ajenos a la actividad cívico-electoral.
            </p>
          </section>

          {/* 6. Legislación y Fuero */}
          <section style={{ marginBottom: '10px' }}>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              6. Ley Aplicable y Jurisdicción
            </h3>
            <p style={{ margin: 0 }}>
              Estos términos se interpretan y rigen conforme a las leyes de la República del Perú. Cualquier controversia será sometida a las instancias electorales correspondientes (Jurado Nacional de Elecciones) y a los tribunales de la ciudad de Lima.
            </p>
          </section>
        </div>

        {/* Footer */}
        <div
          style={{
            padding: '14px 24px',
            background: '#f8fafc',
            borderTop: '1px solid #e2e8f0',
            display: 'flex',
            justifyContent: 'flex-end',
            alignItems: 'center'
          }}
        >
          <button
            type="button"
            onClick={onClose}
            style={{
              padding: '10px 22px',
              borderRadius: '10px',
              border: 'none',
              background: '#0f172a',
              color: '#ffffff',
              fontWeight: 800,
              fontSize: '0.88rem',
              cursor: 'pointer',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px'
            }}
          >
            <Check className="w-4 h-4" />
            <span>Aceptar Términos</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default TermsModal;
