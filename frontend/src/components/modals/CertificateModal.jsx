import React, { useRef } from 'react';
import { X, Printer, Users, FileCheck, Handshake, Megaphone } from 'lucide-react';

export function CertificateModal({ user, onClose }) {
  const certRef = useRef(null);

  const personero = (user?.['Nombres y Apellidos'] || user?.nombresApellidos || user?.nombres_y_apellidos || 'PERSONERO ACREDITADO').trim().toUpperCase();
  const dni = user?.['D.N.I.'] || user?.DNI || user?.dni || user?.dni_numero || (user?.tokenVerificacion ? user.tokenVerificacion.split('-').pop() : '') || '--------';
  const rawDistrito = (user?.['Distrito Asignado'] || user?.distritoAsignado || user?.['Distrito donde Vota'] || user?.distritoDondeVota || user?.distrito_asignado || 'LIMA').trim().toUpperCase();
  const rawRol = user?.['Rol a Desempeñar'] || user?.rolADesempenar || user?.rol_electoral || user?.rol || 'Personero de Mesa';

  // Formato del rol en la cápsula
  let displayRol = 'PERSONERO DE MESA';
  const rolLower = String(rawRol).toLowerCase();
  if (rolLower.includes('distrital') || rolLower.includes('distrito')) {
    displayRol = 'COORDINADOR DE DISTRITOS';
  } else if (rolLower.includes('local') || rolLower.includes('centro') || rolLower.includes('pcv') || rolLower.includes('plv')) {
    displayRol = 'PERSONERO DE CENTRO DE VOTACIÓN';
  } else if (rolLower.includes('zonal')) {
    displayRol = 'COORDINADOR ZONAL';
  }

  // Fecha en formato dd / mm / 2026
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear();
  const fechaDisplay = `${day} / ${month} / ${year}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(11, 19, 41, 0.88)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: '16px',
      overflowY: 'auto'
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '1050px',
        maxHeight: '96vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.8)',
        overflow: 'hidden',
        border: '1px solid #cbd5e1'
      }}>
        
        {/* Barra Superior de Herramientas (No Imprimible) */}
        <div className="no-print" style={{
          padding: '12px 24px',
          background: '#002B66',
          color: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          borderBottom: '1px solid #1e293b'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <span style={{ fontSize: '1.1rem' }}>🎓</span>
            <span style={{ fontSize: '0.98rem', fontWeight: 900, letterSpacing: '0.5px' }}>
              Certificado Oficial de Capacitación • Elecciones 2026
            </span>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <button
              onClick={handlePrint}
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '8px',
                padding: '8px 18px',
                borderRadius: '8px',
                border: 'none',
                background: '#ffffff',
                color: '#002B66',
                fontSize: '0.85rem',
                fontWeight: 900,
                cursor: 'pointer',
                boxShadow: '0 2px 8px rgba(0,0,0,0.25)',
                transition: 'all 0.15s ease'
              }}
            >
              <Printer className="w-4 h-4 text-[#002B66]" />
              <span>Imprimir / Guardar PDF</span>
            </button>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255, 255, 255, 0.15)',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Contenedor del Certificado */}
        <div style={{ overflowY: 'auto', padding: '24px', background: '#e2e8f0', display: 'flex', justifyContent: 'center' }}>
          
          {/* =========================================================================
              RÉPLICA EXACTA DE CERTIMODELO.JPEG
              ========================================================================= */}
          <div
            ref={certRef}
            id="cert-printable-area"
            style={{
              background: '#ffffff',
              borderRadius: '24px',
              borderLeft: '4px solid #002B66',
              borderTop: '4px solid #002B66',
              borderRight: '4px solid #e30613',
              borderBottom: '4px solid #e30613',
              boxShadow: '0 20px 45px rgba(0, 43, 102, 0.15)',
              position: 'relative',
              overflow: 'hidden',
              padding: '24px 32px 0 32px',
              color: '#0f172a',
              width: '100%',
              maxWidth: '960px',
              minHeight: '660px',
              display: 'flex',
              flexDirection: 'column',
              justifyContent: 'space-between',
              boxSizing: 'border-box',
              fontFamily: "'Montserrat', 'Arial', sans-serif"
            }}
          >
            {/* Cinta Diagonal Superior Derecha Institucional */}
            <div style={{
              position: 'absolute',
              top: 0,
              right: 0,
              width: '240px',
              height: '170px',
              pointerEvents: 'none',
              zIndex: 10
            }}>
              {/* Triángulo Rojo Exterior */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '240px',
                height: '170px',
                background: '#e30613',
                clipPath: 'polygon(100% 0, 0 0, 100% 100%)'
              }}></div>
              {/* Polígono Azul Marino Interior */}
              <div style={{
                position: 'absolute',
                top: 0,
                right: 0,
                width: '220px',
                height: '158px',
                background: '#002B66',
                clipPath: 'polygon(100% 0, 15% 0, 100% 90%)',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'flex-end',
                justifyContent: 'flex-start',
                paddingTop: '14px',
                paddingRight: '16px',
                textAlign: 'right',
                color: '#ffffff'
              }}>
                <div style={{ fontSize: '0.62rem', fontWeight: 900, letterSpacing: '1px', lineHeight: 1.15, textTransform: 'uppercase' }}>
                  ELECCIONES
                </div>
                <div style={{ fontSize: '0.62rem', fontWeight: 900, letterSpacing: '1px', lineHeight: 1.15, textTransform: 'uppercase' }}>
                  REGIONALES Y
                </div>
                <div style={{ fontSize: '0.62rem', fontWeight: 900, letterSpacing: '1px', lineHeight: 1.15, textTransform: 'uppercase' }}>
                  MUNICIPALES
                </div>
                <div style={{ fontSize: '1.45rem', fontWeight: 900, letterSpacing: '1px', marginTop: '2px' }}>
                  2026
                </div>
              </div>
            </div>

            {/* Rayas decorativas exteriores en la esquina inferior izquierda */}
            <div style={{
              position: 'absolute',
              bottom: '56px',
              left: 0,
              width: '20px',
              height: '110px',
              pointerEvents: 'none',
              opacity: 0.6,
              background: 'repeating-linear-gradient(45deg, #002B66, #002B66 2px, transparent 2px, transparent 6px)'
            }}></div>

            {/* =========================================================================
                PARTE 1: CABECERA CON LOGO SOMOS PERÚ Y TÍTULOS AL MEDIO
                ========================================================================= */}
            <div style={{ position: 'relative', width: '100%', minHeight: '84px', display: 'flex', alignItems: 'center', justifyContent: 'center', marginBottom: '4px' }}>
              
              {/* Logo Oficial Somos Perú (Esquina Superior Izquierda) */}
              <div style={{ position: 'absolute', top: '2px', left: '0', width: '120px', zIndex: 5 }}>
                <img 
                  src="/images/logo_somos_peru.svg" 
                  alt="Somos Perú" 
                  style={{ width: '105px', height: 'auto', display: 'block' }} 
                />
              </div>

              {/* Encabezado Institucional (100% al Centro) */}
              <div style={{ textAlign: 'center', width: '100%', paddingLeft: '80px', paddingRight: '80px' }}>
                <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#002B66', letterSpacing: '0.5px' }}>
                  PARTIDO DEMOCRÁTICO
                </div>
                <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#002B66', letterSpacing: '0.5px', margin: '-2px 0 2px 0' }}>
                  SOMOS PERÚ
                </div>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#002B66', letterSpacing: '0.5px', lineHeight: 1.25 }}>
                  SISTEMA NACIONAL DE CONTROL
                </div>
                <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#002B66', letterSpacing: '0.5px', lineHeight: 1.25 }}>
                  ELECTORAL Y DEFENSA DEL VOTO
                </div>
              </div>
            </div>

            {/* =========================================================================
                PARTE 2: CUERPO PRINCIPAL (COLUMNA IZQUIERDA + CONTENIDO CENTRAL)
                ========================================================================= */}
            <div style={{
              display: 'grid',
              gridTemplateColumns: '175px 1fr 175px',
              gap: '12px',
              alignItems: 'center',
              margin: '4px 0 6px 0',
              width: '100%'
            }}>
              
              {/* Columna Izquierda: 4 Iconos Circulares */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '4px' }}>
                
                {/* 1. Vigilamos (Rojo) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: '#e30613',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Users className="w-4 h-4" />
                  </div>
                  <div style={{ fontSize: '0.64rem', lineHeight: 1.15, color: '#0f172a' }}>
                    <strong style={{ display: 'block', color: '#0f172a', fontWeight: 900 }}>VIGILAMOS</strong>
                    el desarrollo de la jornada electoral.
                  </div>
                </div>

                {/* 2. Actuamos (Azul) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: '#002B66',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <FileCheck className="w-4 h-4" />
                  </div>
                  <div style={{ fontSize: '0.64rem', lineHeight: 1.15, color: '#0f172a' }}>
                    <strong style={{ display: 'block', color: '#0f172a', fontWeight: 900 }}>ACTUAMOS</strong>
                    conforme a la normativa electoral.
                  </div>
                </div>

                {/* 3. Mantenemos (Rojo) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: '#e30613',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Handshake className="w-4 h-4" />
                  </div>
                  <div style={{ fontSize: '0.64rem', lineHeight: 1.15, color: '#0f172a' }}>
                    <strong style={{ display: 'block', color: '#0f172a', fontWeight: 900 }}>MANTENEMOS</strong>
                    una conducta respetuosa y ética.
                  </div>
                </div>

                {/* 4. Comunicamos (Azul) */}
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <div style={{
                    width: '34px',
                    height: '34px',
                    borderRadius: '50%',
                    background: '#002B66',
                    color: '#ffffff',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    flexShrink: 0
                  }}>
                    <Megaphone className="w-4 h-4" />
                  </div>
                  <div style={{ fontSize: '0.64rem', lineHeight: 1.15, color: '#0f172a' }}>
                    <strong style={{ display: 'block', color: '#0f172a', fontWeight: 900 }}>COMUNICAMOS</strong>
                    oportunamente acciones e incidentes.
                  </div>
                </div>

              </div>

              {/* Contenido Central: Título con Líneas Rojas, Nombre, Texto, Rol */}
              <div style={{ textAlign: 'center', width: '100%' }}>
                
                {/* Título con 2 Líneas Rojas Simétricas */}
                <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '14px', marginBottom: '6px' }}>
                  <div style={{ height: '2px', width: '45px', background: '#e30613' }}></div>
                  <div>
                    <h1 style={{ fontSize: '2.3rem', fontWeight: 900, color: '#002B66', margin: 0, letterSpacing: '2px', lineHeight: 1 }}>
                      CONSTANCIA
                    </h1>
                    <h2 style={{ fontSize: '1.25rem', fontWeight: 800, color: '#002B66', margin: '2px 0 0 0', letterSpacing: '1px' }}>
                      DE PARTICIPACIÓN
                    </h2>
                  </div>
                  <div style={{ height: '2px', width: '45px', background: '#e30613' }}></div>
                </div>

                {/* Subtítulo */}
                <div style={{ fontSize: '0.86rem', color: '#334155', fontWeight: 600, margin: '4px 0 6px 0' }}>
                  Se otorga la presente constancia a:
                </div>

                {/* Nombre del Personero con Línea Azul */}
                <div style={{ margin: '6px auto 12px', maxWidth: '520px' }}>
                  <div style={{
                    fontSize: '1.4rem',
                    fontWeight: 900,
                    color: '#002B66',
                    letterSpacing: '0.5px',
                    paddingBottom: '2px',
                    borderBottom: '2px solid #002B66',
                    textAlign: 'center'
                  }}>
                    {personero}
                  </div>
                  <div style={{ fontSize: '0.74rem', fontWeight: 800, color: '#64748b', marginTop: '2px', textAlign: 'center' }}>
                    D.N.I. N° {dni}
                  </div>
                </div>

                {/* Texto Descriptivo Oficial de la Constancia */}
                <p style={{
                  fontSize: '0.8rem',
                  color: '#0f172a',
                  lineHeight: 1.4,
                  maxWidth: '520px',
                  margin: '0 auto 6px',
                  fontWeight: 500,
                  textAlign: 'center'
                }}>
                  Por su participación en el Programa de Capacitación de Personeros <strong style={{ fontWeight: 800 }}>en Defensa del Voto, Conteo Rápido y Fiscalización de Mesas</strong> realizado con miras a las <strong style={{ fontWeight: 800 }}>Elecciones Regionales y Municipales 2026</strong>.
                </p>

                <p style={{
                  fontSize: '0.78rem',
                  color: '#334155',
                  lineHeight: 1.35,
                  maxWidth: '480px',
                  margin: '0 auto 10px',
                  fontWeight: 500,
                  textAlign: 'center'
                }}>
                  Agradecemos su compromiso con la democracia, la <strong style={{ fontWeight: 800, color: '#002B66' }}>descentralización</strong> y la <strong style={{ fontWeight: 800, color: '#002B66' }}>transparencia</strong>.
                </p>

                {/* Píldora / Cápsula del Cargo */}
                <div style={{ margin: '0 auto 4px', textAlign: 'center' }}>
                  <span style={{
                    display: 'inline-block',
                    padding: '5px 28px',
                    borderRadius: '24px',
                    border: '1.5px solid #002B66',
                    background: '#ffffff',
                    color: '#002B66',
                    fontWeight: 900,
                    fontSize: '0.86rem',
                    letterSpacing: '0.8px'
                  }}>
                    {displayRol}
                  </span>
                </div>

              </div>

              {/* Columna Derecha (Simetría) */}
              <div style={{ width: '175px' }}></div>

            </div>

            {/* =========================================================================
                PARTE 3: SÍMBOLO CENTRAL DEFENSORES DEL VOTO (SIN LÍNEAS HORIZONTALES)
                ========================================================================= */}
            <div style={{
              display: 'flex',
              justifyContent: 'center',
              alignItems: 'center',
              marginTop: '4px',
              marginBottom: '14px'
            }}>
              {/* Corazón Defensores del Voto (Centro) */}
              <div style={{
                width: '95px',
                position: 'relative',
                textAlign: 'center'
              }}>
                <svg viewBox="0 0 120 100" style={{ width: '100%', height: 'auto', display: 'block' }}>
                  <path 
                    d="M60 90 C20 60 5 40 5 22 C5 10 15 2 28 2 C42 2 54 12 60 20 C66 12 78 2 92 2 C105 2 115 10 115 22 C115 40 100 60 60 90 Z" 
                    fill="none" 
                    stroke="#e30613" 
                    strokeWidth="5" 
                  />
                </svg>
                <div style={{
                  position: 'absolute',
                  inset: 0,
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  justifyContent: 'center',
                  paddingTop: '6px'
                }}>
                  <span style={{ fontSize: '0.52rem', fontWeight: 900, color: '#002B66', letterSpacing: '0.5px' }}>DEFENSORES</span>
                  <span style={{ fontSize: '0.42rem', fontWeight: 800, color: '#e30613', margin: '-1px 0' }}>— DEL VOTO —</span>
                  <span style={{ fontSize: '0.52rem', fontWeight: 900, color: '#002B66' }}>SOMOS</span>
                  <span style={{ fontSize: '0.56rem', fontWeight: 900, color: '#e30613' }}>PERÚ</span>
                </div>
              </div>
            </div>

            {/* =========================================================================
                PARTE 4: FRANJA INFERIOR TRICOLOR (DEPARTAMENTO / DISTRITO / FECHA)
                ========================================================================= */}
            <div style={{
              width: 'calc(100% + 64px)',
              margin: '0 -32px 0 -32px',
              minHeight: '44px',
              display: 'flex',
              alignItems: 'stretch',
              position: 'relative'
            }}>
              
              {/* Bloque Azul: DEPARTAMENTO / REGIÓN */}
              <div style={{
                flex: '1.2',
                background: '#002B66',
                color: '#ffffff',
                padding: '6px 16px 6px 28px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                clipPath: 'polygon(0 0, 100% 0, 92% 100%, 0 100%)'
              }}>
                <div style={{ fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.5px', color: '#93c5fd' }}>
                  DEPARTAMENTO / REGIÓN
                </div>
                <div style={{ fontSize: '0.85rem', fontWeight: 900, letterSpacing: '0.5px' }}>
                  LIMA METROPOLITANA
                </div>
              </div>

              {/* Bloque Rojo: DISTRITO ELECTORAL */}
              <div style={{
                flex: '1.4',
                background: '#e30613',
                color: '#ffffff',
                padding: '6px 20px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'center',
                marginLeft: '-18px',
                clipPath: 'polygon(8% 0, 100% 0, 92% 100%, 0 100%)',
                zIndex: 2
              }}>
                <div style={{ fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.5px', color: '#fecaca' }}>
                  DISTRITO ELECTORAL
                </div>
                <div style={{ fontSize: '0.92rem', fontWeight: 900, letterSpacing: '0.5px' }}>
                  {rawDistrito}
                </div>
              </div>

              {/* Bloque Blanco: FECHA */}
              <div style={{
                flex: '1',
                background: '#ffffff',
                color: '#0f172a',
                padding: '6px 24px 6px 16px',
                display: 'flex',
                flexDirection: 'column',
                justifyContent: 'center',
                alignItems: 'flex-end',
                marginLeft: '-18px',
                zIndex: 1
              }}>
                <div style={{ fontSize: '0.58rem', fontWeight: 800, letterSpacing: '0.5px', color: '#64748b' }}>
                  FECHA
                </div>
                <div style={{ fontSize: '0.82rem', fontWeight: 900, color: '#002B66' }}>
                  {fechaDisplay}
                </div>
              </div>

            </div>

          </div>

        </div>

      </div>
    </div>
  );
}
