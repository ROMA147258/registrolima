import React, { useRef } from 'react';
import { Download, Printer, ArrowLeft, Users, FileCheck, Handshake, Megaphone } from 'lucide-react';

export function CredentialCard({ user, onBack }) {
  const certRef = useRef(null);

  const dni = user?.['D.N.I.'] || user?.DNI || user?.dni || user?.dni_numero || (user?.tokenVerificacion ? user.tokenVerificacion.split('-').pop() : '') || '--------';
  const personero = (user?.['Nombres y Apellidos'] || user?.nombresApellidos || 'PERSONERO OFICIAL').toUpperCase();
  const rawRol = (user?.['Rol a Desempeñar'] || user?.rolADesempenar || user?.rol_electoral || 'PERSONERO DE MESA').toUpperCase();
  const distrito = (user?.['Distrito Asignado'] || user?.distritoAsignado || user?.['Distrito donde Vota'] || user?.distrito_asignado || 'LIMA METROPOLITANA').toUpperCase();
  
  // Normalización del rol para la píldora central
  let displayRol = 'PERSONERO DE MESA';
  if (rawRol.includes('DISTRIT')) {
    displayRol = 'COORDINADOR DE DISTRITOS';
  } else if (rawRol.includes('LOCAL') || rawRol.includes('COLEGIO')) {
    displayRol = 'PERSONERO DE LOCAL DE VOTACIÓN';
  } else if (rawRol.includes('ZONA')) {
    displayRol = 'COORDINADOR ZONAL';
  } else {
    displayRol = rawRol;
  }

  // Fecha actual formateada DD / MM / AAAA
  const today = new Date();
  const day = String(today.getDate()).padStart(2, '0');
  const month = String(today.getMonth() + 1).padStart(2, '0');
  const year = today.getFullYear() || 2026;
  const formattedDate = `${day} / ${month} / ${year}`;

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ width: '100%', maxWidth: '1020px', margin: '0 auto', fontFamily: "'Outfit', 'Montserrat', sans-serif" }}>
      <style>{`
        @media print {
          @page {
            size: landscape;
            margin: 6mm;
          }
          .no-print, nav, header, button {
            display: none !important;
          }
          body {
            background: #ffffff !important;
            padding: 0 !important;
            margin: 0 !important;
          }
          #cert-container {
            box-shadow: none !important;
            border: 4px solid #002B66 !important;
            margin: 0 auto !important;
            width: 100% !important;
            max-width: 100% !important;
            page-break-inside: avoid !important;
            page-break-after: avoid !important;
          }
        }
      `}</style>

      {/* Botones de Control Superiores */}
      <div className="no-print" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '18px', flexWrap: 'wrap', gap: '12px' }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 18px',
              borderRadius: '10px',
              border: '2px solid #0284c7',
              background: '#ffffff',
              color: '#0284c7',
              fontSize: '0.88rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 2px 8px rgba(2, 132, 199, 0.15)',
              transition: 'all 0.2s ease'
            }}
          >
            <ArrowLeft className="w-4 h-4 text-sky-600" />
            <span>Volver a la Capacitación</span>
          </button>
        )}
        <div style={{ display: 'flex', gap: '10px', marginLeft: 'auto' }}>
          <button
            onClick={handlePrint}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              background: '#002B66',
              color: '#ffffff',
              fontSize: '0.88rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(0, 43, 102, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            <Printer className="w-4 h-4 text-white" />
            <span>Imprimir Certificado</span>
          </button>
          <button
            onClick={handlePrint}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '10px',
              border: 'none',
              background: '#e30613',
              color: '#ffffff',
              fontSize: '0.88rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(227, 6, 19, 0.35)',
              transition: 'all 0.2s ease'
            }}
          >
            <Download className="w-4 h-4 text-white" />
            <span>Descargar PDF</span>
          </button>
        </div>
      </div>

      {/* CONSTANCIA OFICIAL: RÉPLICA EXACTA DE CERTIMODELO.JPEG */}
      <div
        ref={certRef}
        id="cert-container"
        style={{
          background: '#ffffff',
          borderRadius: '24px',
          border: '4px solid #002B66',
          boxShadow: '0 20px 50px rgba(0, 43, 102, 0.15)',
          position: 'relative',
          overflow: 'hidden',
          padding: '24px 28px 0 28px',
          color: '#0f172a',
          minHeight: '620px',
          display: 'flex',
          flexDirection: 'column',
          justifyContent: 'space-between'
        }}
      >
        {/* Cinta Diagonal Superior Derecha Institucional */}
        <div style={{
          position: 'absolute',
          top: 0,
          right: 0,
          width: '260px',
          height: '190px',
          pointerEvents: 'none',
          zIndex: 10
        }}>
          {/* Triángulo/Polígono Rojo de Acento */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '260px',
            height: '190px',
            background: '#e30613',
            clipPath: 'polygon(100% 0, 0 0, 100% 100%)'
          }}></div>
          {/* Polígono Azul Marino Principal */}
          <div style={{
            position: 'absolute',
            top: 0,
            right: 0,
            width: '240px',
            height: '180px',
            background: '#002B66',
            clipPath: 'polygon(100% 0, 15% 0, 100% 90%)',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'flex-end',
            justifyContent: 'flex-start',
            paddingTop: '16px',
            paddingRight: '16px',
            textAlign: 'right',
            color: '#ffffff'
          }}>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '1px', lineHeight: 1.15, textTransform: 'uppercase' }}>
              ELECCIONES
            </div>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '1px', lineHeight: 1.15, textTransform: 'uppercase' }}>
              REGIONALES Y
            </div>
            <div style={{ fontSize: '0.65rem', fontWeight: 800, letterSpacing: '1px', lineHeight: 1.15, textTransform: 'uppercase' }}>
              MUNICIPALES
            </div>
            <div style={{ fontSize: '1.45rem', fontWeight: 900, letterSpacing: '1.5px', marginTop: '4px' }}>
              2026
            </div>
          </div>
        </div>

        {/* Rayas decorativas en la esquina inferior izquierda */}
        <div style={{
          position: 'absolute',
          bottom: '70px',
          left: 0,
          width: '24px',
          height: '120px',
          pointerEvents: 'none',
          opacity: 0.65,
          background: 'repeating-linear-gradient(45deg, #002B66, #002B66 2px, transparent 2px, transparent 6px)'
        }}></div>

        {/* PARTE SUPERIOR: LOGO IZQUIERDO Y CABECERA INSTITUCIONAL PERFECTAMENTE CENTRADA */}
        <div style={{ position: 'relative', width: '100%', marginBottom: '6px', minHeight: '88px', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
          
          {/* Logo Somos Perú (Esquina Superior Izquierda) */}
          <div style={{ position: 'absolute', top: '2px', left: 0, width: '120px', zIndex: 5 }}>
            <img 
              src="/images/logo_somos_peru.svg" 
              alt="Somos Perú" 
              style={{ width: '105px', height: 'auto', display: 'block' }} 
            />
          </div>

          {/* Encabezado Institucional (100% al Medio) */}
          <div style={{ textAlign: 'center', width: '100%', paddingLeft: '80px', paddingRight: '80px' }}>
            <div style={{ fontSize: '0.92rem', fontWeight: 800, color: '#0f172a', letterSpacing: '0.5px' }}>
              PARTIDO DEMOCRÁTICO
            </div>
            <div style={{ fontSize: '1.75rem', fontWeight: 900, color: '#002B66', letterSpacing: '1px', margin: '-2px 0 2px 0' }}>
              SOMOS PERÚ
            </div>
            <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#002B66', letterSpacing: '0.8px', lineHeight: 1.25 }}>
              SISTEMA NACIONAL DE CONTROL
            </div>
            <div style={{ fontSize: '0.76rem', fontWeight: 800, color: '#002B66', letterSpacing: '0.8px', lineHeight: 1.25 }}>
              ELECTORAL Y DEFENSA DEL VOTO
            </div>
          </div>
        </div>

        {/* CUERPO PRINCIPAL: ESTRUCTURA SIMÉTRICA DE 3 COLUMNAS (IZQUIERDA - CENTRO 100% AL MEDIO - DERECHA BALANCEADA) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '210px 1fr 210px',
          gap: '12px',
          alignItems: 'center',
          margin: '2px 0 10px 0',
          width: '100%'
        }}>
          
          {/* Columna Izquierda: 4 Iconos Redondos con Textos */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '12px', paddingLeft: '4px' }}>
            
            {/* 1. Vigilamos (Rojo) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#e30613',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 6px rgba(227, 6, 19, 0.3)'
              }}>
                <Users className="w-4 h-4" />
              </div>
              <div style={{ fontSize: '0.67rem', lineHeight: 1.2, color: '#0f172a' }}>
                <strong style={{ display: 'block', color: '#0f172a', fontWeight: 900 }}>VIGILAMOS</strong>
                el desarrollo de la jornada electoral.
              </div>
            </div>

            {/* 2. Actuamos (Azul) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#002B66',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 6px rgba(0, 43, 102, 0.3)'
              }}>
                <FileCheck className="w-4 h-4" />
              </div>
              <div style={{ fontSize: '0.67rem', lineHeight: 1.2, color: '#0f172a' }}>
                <strong style={{ display: 'block', color: '#0f172a', fontWeight: 900 }}>ACTUAMOS</strong>
                conforme a la normativa electoral.
              </div>
            </div>

            {/* 3. Mantenemos (Rojo) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#e30613',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 6px rgba(227, 6, 19, 0.3)'
              }}>
                <Handshake className="w-4 h-4" />
              </div>
              <div style={{ fontSize: '0.67rem', lineHeight: 1.2, color: '#0f172a' }}>
                <strong style={{ display: 'block', color: '#0f172a', fontWeight: 900 }}>MANTENEMOS</strong>
                una conducta respetuosa y ética.
              </div>
            </div>

            {/* 4. Comunicamos (Azul) */}
            <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
              <div style={{
                width: '36px',
                height: '36px',
                borderRadius: '50%',
                background: '#002B66',
                color: '#ffffff',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                flexShrink: 0,
                boxShadow: '0 2px 6px rgba(0, 43, 102, 0.3)'
              }}>
                <Megaphone className="w-4 h-4" />
              </div>
              <div style={{ fontSize: '0.67rem', lineHeight: 1.2, color: '#0f172a' }}>
                <strong style={{ display: 'block', color: '#0f172a', fontWeight: 900 }}>COMUNICAMOS</strong>
                oportunamente acciones e incidentes.
              </div>
            </div>

          </div>

          {/* Contenido Central del Certificado (100% Simétrico y Centrado) */}
          <div style={{ textAlign: 'center', width: '100%' }}>
            
            {/* Título: CONSTANCIA DE PARTICIPACIÓN con líneas rojas simétricas */}
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
            <div style={{ fontSize: '0.86rem', color: '#334155', fontWeight: 600, margin: '6px 0 4px 0' }}>
              Se otorga la presente constancia a:
            </div>

            {/* Nombre del Usuario y DNI con Subrayado Simétrico */}
            <div style={{ margin: '6px auto 10px', maxWidth: '520px' }}>
              <div style={{
                fontSize: '1.4rem',
                fontWeight: 900,
                color: '#002B66',
                letterSpacing: '0.5px',
                paddingBottom: '3px',
                borderBottom: '2px solid #002B66',
                textAlign: 'center'
              }}>
                {personero}
              </div>
              <div style={{ fontSize: '0.78rem', fontWeight: 800, color: '#64748b', marginTop: '3px', textAlign: 'center' }}>
                D.N.I. N° {dni}
              </div>
            </div>

            {/* Texto de Reconocimiento */}
            <p style={{
              fontSize: '0.82rem',
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

            {/* Píldora / Insignia de Rol Asignado Centrada */}
            <div style={{ margin: '0 auto 4px', textAlign: 'center' }}>
              <span style={{
                display: 'inline-block',
                padding: '5px 26px',
                borderRadius: '24px',
                border: '1.5px solid #002B66',
                background: '#ffffff',
                color: '#002B66',
                fontWeight: 900,
                fontSize: '0.86rem',
                letterSpacing: '0.8px',
                boxShadow: '0 2px 6px rgba(0, 43, 102, 0.08)'
              }}>
                {displayRol}
              </span>
            </div>

          </div>

          {/* Columna Derecha de Balance Simétrico */}
          <div style={{ width: '210px' }}></div>

        </div>

        {/* SECCIÓN DE FIRMAS Y CORAZÓN DEFENSORES DEL VOTO */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 140px 1fr',
          alignItems: 'flex-end',
          textAlign: 'center',
          marginTop: '6px',
          marginBottom: '16px'
        }}>
          {/* Firma Izquierda */}
          <div>
            <div style={{ width: '180px', margin: '0 auto 4px', borderBottom: '1.5px solid #002B66' }}></div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#002B66', textTransform: 'uppercase' }}>
              EQUIPO DE CAPACITACIÓN
            </div>
          </div>

          {/* Corazón Defensores del Voto (Centro) */}
          <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', justifyContent: 'center' }}>
            <div style={{
              width: '95px',
              position: 'relative',
              textAlign: 'center'
            }}>
              <svg viewBox="0 0 120 100" style={{ width: '100%', height: 'auto', display: 'block' }}>
                {/* Contorno Corazón Rojo */}
                <path 
                  d="M60 90 C20 60 5 40 5 22 C5 10 15 2 28 2 C42 2 54 12 60 20 C66 12 78 2 92 2 C105 2 115 10 115 22 C115 40 100 60 60 90 Z" 
                  fill="none" 
                  stroke="#e30613" 
                  strokeWidth="4" 
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

          {/* Firma Derecha */}
          <div>
            <div style={{ width: '180px', margin: '0 auto 4px', borderBottom: '1.5px solid #002B66' }}></div>
            <div style={{ fontSize: '0.68rem', fontWeight: 800, color: '#002B66', textTransform: 'uppercase' }}>
              COORDINADOR DISTRITAL DE PERSONEROS
            </div>
          </div>
        </div>

        {/* FRANJA INFERIOR TRICOLOR (AZUL / ROJO / BLANCO) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1.2fr 1.3fr 1fr',
          marginLeft: '-28px',
          marginRight: '-28px',
          height: '56px',
          alignItems: 'stretch',
          position: 'relative'
        }}>
          {/* Bloque Azul: Región */}
          <div style={{
            background: '#002B66',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingLeft: '28px',
            borderBottomLeftRadius: '20px'
          }}>
            <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#93c5fd', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              DEPARTAMENTO / REGIÓN
            </div>
            <div style={{ fontSize: '0.88rem', fontWeight: 900, letterSpacing: '0.5px' }}>
              LIMA METROPOLITANA
            </div>
          </div>

          {/* Bloque Rojo con Corte Angular: Distrito */}
          <div style={{
            background: '#e30613',
            color: '#ffffff',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            paddingLeft: '24px',
            clipPath: 'polygon(0 0, 100% 0, 92% 100%, 0 100%)',
            marginLeft: '-1px'
          }}>
            <div style={{ fontSize: '0.62rem', fontWeight: 700, color: '#fecaca', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              DISTRITO ELECTORAL
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 900, letterSpacing: '0.5px' }}>
              {distrito}
            </div>
          </div>

          {/* Bloque Blanco: Fecha */}
          <div style={{
            background: '#ffffff',
            color: '#0f172a',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'center',
            alignItems: 'center',
            borderTop: '1px solid #e2e8f0',
            borderBottomRightRadius: '20px'
          }}>
            <div style={{ fontSize: '0.62rem', fontWeight: 800, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
              FECHA
            </div>
            <div style={{ fontSize: '0.92rem', fontWeight: 900, color: '#002B66' }}>
              {formattedDate}
            </div>
          </div>
        </div>

      </div>
    </div>
  );
}
