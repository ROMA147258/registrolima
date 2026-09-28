import React, { useEffect, useRef } from 'react';
import { Shield, X, Check, Lock, FileText, AlertTriangle } from 'lucide-react';

export function PrivacyPolicyModal({ isOpen, onClose }) {
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
      aria-labelledby="privacy-title"
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
            background: 'linear-gradient(135deg, #0284c7 0%, #0369a1 100%)',
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
                background: 'rgba(255, 255, 255, 0.2)',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <Shield className="w-5 h-5 text-white" aria-hidden="true" />
            </div>
            <div>
              <h2
                id="privacy-title"
                style={{
                  fontSize: '1.15rem',
                  fontWeight: 900,
                  margin: 0,
                  letterSpacing: '0.3px',
                  color: '#ffffff'
                }}
              >
                POLÍTICA DE PRIVACIDAD Y PROTECCIÓN DE DATOS
              </h2>
              <p style={{ margin: '2px 0 0', fontSize: '0.76rem', color: '#e0f2fe' }}>
                Conforme a la Ley N° 29733 (República del Perú) • Elecciones 2026
              </p>
            </div>
          </div>
          <button
            type="button"
            onClick={onClose}
            aria-label="Cerrar modal de privacidad"
            style={{
              background: 'rgba(255, 255, 255, 0.15)',
              border: 'none',
              borderRadius: '8px',
              padding: '6px',
              color: '#ffffff',
              cursor: 'pointer',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              transition: 'background 0.2s ease'
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
          {/* Identidad del Responsable */}
          <section style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              1. Identidad del Responsable del Tratamiento
            </h3>
            <p style={{ margin: 0 }}>
              El <strong>Partido Democrático Somos Perú</strong> (Comité Electoral de Lima), con domicilio institucional en Lima, Perú, es el titular responsable del banco de datos personales generado a través de este Sistema de Registro y Control Electoral para las Elecciones Regionales y Municipales 2026.
            </p>
          </section>

          {/* Marco Legal */}
          <section style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              2. Marco Legal Aplicable
            </h3>
            <p style={{ margin: 0 }}>
              Esta política se rige en estricto cumplimiento de la <strong>Ley N° 29733 (Ley de Protección de Datos Personales del Perú)</strong>, su Reglamento aprobado mediante <strong>D.S. N° 003-2013-JUS</strong>, y la <strong>Ley Orgánica de Elecciones (Ley N° 26859)</strong>.
            </p>
          </section>

          {/* Finalidad y Principio de Proporcionalidad */}
          <section style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              3. Datos Recopilados y Principio de Minimización
            </h3>
            <p style={{ margin: '0 0 8px 0' }}>
              En cumplimiento del principio de proporcionalidad, <strong>únicamente se recopilan los datos estrictamente necesarios</strong> para la acreditación cívico-electoral ante la ONPE y el JNE:
            </p>
            <ul style={{ margin: 0, paddingLeft: '20px' }}>
              <li><strong>Datos de Identificación:</strong> Nombres, Apellidos y Documento Nacional de Identidad (D.N.I.).</li>
              <li><strong>Datos de Contacto:</strong> Número de teléfono celular y correo electrónico (opcional).</li>
              <li><strong>Datos Electorales:</strong> Distrito de votación, local de votación y número de mesa asignada.</li>
              <li><strong>Registro de Capacitación:</strong> Progreso en módulos, estado de evaluación y firma digital de acreditación.</li>
            </ul>
          </section>

          {/* Finalidad del Tratamiento */}
          <section style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              4. Finalidad del Tratamiento
            </h3>
            <p style={{ margin: 0 }}>
              Los datos personales son tratados con fines exclusivos de organización electoral: validación de padrón, asignación de centros de sufragio, emisión de credenciales oficiales de personeros de mesa / coordinadores, control de asistencia y comunicación de directivas electorales. <strong>Queda expresamente prohibido el uso comercial o lucrativo de esta información.</strong>
            </p>
          </section>

          {/* Transferencia y Terceros */}
          <section style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              5. No Cesión a Terceros Comerciales
            </h3>
            <p style={{ margin: 0 }}>
              El Partido no vende, arrienda ni cede datos personales a empresas o terceros con fines comerciales ni de publicidad. Los datos únicamente son transmitidos a las autoridades electorales oficiales (JNE / ONPE) cuando la normativa legal lo exija formalmente para la acreditación de personerías.
            </p>
          </section>

          {/* Medidas de Seguridad */}
          <section style={{ marginBottom: '20px' }}>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              6. Seguridad y Confidencialidad
            </h3>
            <p style={{ margin: 0 }}>
              Implementamos medidas técnicas, organizativas y legales para evitar la alteración, pérdida o acceso no autorizado: cifrado de comunicaciones HTTPS/TLS, autenticación con tokens seguros JWT, hashing criptográfico de contraseñas y bitácoras de auditoría interna de accesos.
            </p>
          </section>

          {/* Ejercicio de Derechos ARCO */}
          <section style={{ marginBottom: '10px' }}>
            <h3 style={{ fontSize: '0.96rem', fontWeight: 800, color: '#0f172a', marginBottom: '6px' }}>
              7. Ejercicio de Derechos ARCO
            </h3>
            <p style={{ margin: 0 }}>
              Usted tiene derecho a solicitar en cualquier momento el <strong>Acceso, Rectificación, Cancelación u Oposición (ARCO)</strong> respecto a sus datos personales almacenados en el sistema electoral. Puede contactar a su Coordinador Zonal/Distrital o al correo de soporte institucional del partido para gestionar su solicitud.
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
              background: '#0284c7',
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
            <span>Entendido y Conforme</span>
          </button>
        </div>
      </div>
    </div>
  );
}

export default PrivacyPolicyModal;
