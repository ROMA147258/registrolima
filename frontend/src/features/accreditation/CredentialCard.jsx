import React, { useEffect, useState, useRef } from 'react';
import { Download, Printer, Shield, ArrowLeft } from 'lucide-react';
import QRCode from 'qrcode';

export function CredentialCard({ user, onBack }) {
  const [qrUrl, setQrUrl] = useState('');
  const certRef = useRef(null);

  const dni = user?.['D.N.I.'] || user?.DNI || user?.dni || user?.dni_numero || (user?.tokenVerificacion ? user.tokenVerificacion.split('-').pop() : '') || '--------';
  const personero = user?.['Nombres y Apellidos'] || user?.nombresApellidos || 'PERSONERO OFICIAL';
  const rol = (user?.['Rol a Desempeñar'] || user?.rolADesempenar || 'PERSONERO DE MESA').toUpperCase();
  const distrito = (user?.['Distrito Asignado'] || user?.distritoAsignado || user?.['Distrito donde Vota'] || 'LIMA METROPOLITANA').toUpperCase();
  const rawLocal = user?.['Local de Votación Asignado'] || user?.localDeVotacionAsignado || user?.['Local de Votación'] || user?.localDeVotacion || 'LOCAL DE VOTACIÓN CENTRAL';
  const mesa = user?.['Mesa Asignada'] || user?.mesaAsignada || user?.['Mesa de Sufragio'] || '000000';
  const folio = user?.Token || `SP-LM2026-${dni}`;
  const validationCode = `SP-${dni}-${mesa}-2026`;

  const isZonal = rol.includes('ZONAL') || rol.includes('ZONA');
  const isDistrital = rol.includes('DISTRITO') || rol.includes('DISTRITAL');
  const schoolsList = isZonal ? rawLocal.split(',').map(s => s.trim()).filter(Boolean) : [];

  const publicVerifyUrl = `${window.location.origin}/#verificar?dni=${dni}&mesa=${encodeURIComponent(mesa)}&distrito=${encodeURIComponent(distrito)}&personero=${encodeURIComponent(personero)}&local=${encodeURIComponent(rawLocal)}&rol=${encodeURIComponent(rol)}&folio=${encodeURIComponent(folio)}`;

  useEffect(() => {
    QRCode.toDataURL(publicVerifyUrl, {
      margin: 1,
      width: 200,
      color: { dark: '#002B66', light: '#ffffff' }
    }).then(url => setQrUrl(url)).catch(() => {});
  }, [publicVerifyUrl]);

  const handlePrint = () => {
    window.print();
  };

  return (
    <div style={{ width: '100%', maxWidth: '1080px', margin: '0 auto' }}>
      
      {/* Botones Superiores de Control con Alto Contraste y Colores Institucionales */}
      <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '20px', flexWrap: 'wrap', gap: '12px' }}>
        {onBack && (
          <button
            onClick={onBack}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 20px',
              borderRadius: '10px',
              border: '2px solid #0284c7',
              background: '#ffffff',
              color: '#0284c7',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 12px rgba(2, 132, 199, 0.15)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#e0f2fe'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; }}
          >
            <ArrowLeft className="w-5 h-5 text-sky-600" />
            <span>Volver a la Capacitación</span>
          </button>
        )}
        <div style={{ display: 'flex', gap: '12px', marginLeft: 'auto' }}>
          <button
            onClick={handlePrint}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              borderRadius: '10px',
              border: 'none',
              background: '#20488e',
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(32, 72, 142, 0.35)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#16366e'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#20488e'; }}
          >
            <Printer className="w-5 h-5 text-white" />
            <span>Imprimir Certificado</span>
          </button>
          <button
            onClick={handlePrint}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '10px 22px',
              borderRadius: '10px',
              border: 'none',
              background: 'rgb(14, 165, 233)',
              color: '#ffffff',
              fontSize: '0.9rem',
              fontWeight: 800,
              cursor: 'pointer',
              boxShadow: '0 4px 14px rgba(14, 165, 233, 0.35)',
              transition: 'all 0.2s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#0284c7'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = 'rgb(14, 165, 233)'; }}
          >
            <Download className="w-5 h-5 text-white" />
            <span>Descargar PDF</span>
          </button>
        </div>
      </div>

      {/* Certificado Oficial (Fiel a Captura 8.png) */}
      <div
        ref={certRef}
        id="printable-certificate"
        style={{
          background: '#ffffff',
          color: '#0f172a',
          padding: '28px 36px',
          border: '10px solid #002B66',
          borderRadius: '4px',
          position: 'relative',
          boxShadow: '0 25px 60px rgba(0,0,0,0.5)',
          fontFamily: "'Montserrat', 'Outfit', sans-serif"
        }}
      >
        {/* Marco Dorado Interior Decorativo */}
        <div style={{
          border: '2px dashed #e30613',
          padding: '24px 28px',
          position: 'relative',
          background: 'radial-gradient(circle at center, #ffffff 60%, #fafbfc 100%)'
        }}>
          
          {/* Esquinas Doradas */}
          <div style={{ position: 'absolute', top: '4px', left: '4px', width: '16px', height: '16px', borderTop: '3px solid #c59b27', borderLeft: '3px solid #c59b27' }}></div>
          <div style={{ position: 'absolute', top: '4px', right: '4px', width: '16px', height: '16px', borderTop: '3px solid #c59b27', borderRight: '3px solid #c59b27' }}></div>
          <div style={{ position: 'absolute', bottom: '4px', left: '4px', width: '16px', height: '16px', borderBottom: '3px solid #c59b27', borderLeft: '3px solid #c59b27' }}></div>
          <div style={{ position: 'absolute', bottom: '4px', right: '4px', width: '16px', height: '16px', borderBottom: '3px solid #c59b27', borderRight: '3px solid #c59b27' }}></div>

          {/* Cabecera: Logo Izq, Título Centro, QR Der */}
          <div style={{ display: 'grid', gridTemplateColumns: '120px 1fr 120px', alignItems: 'center', marginBottom: '18px' }}>
            
            {/* Logo Corazón Somos Perú */}
            <div>
              <img src="/images/logo_somos_peru.svg" alt="Somos Perú" style={{ width: '90px', height: 'auto', display: 'block' }} />
            </div>

            {/* Texto Central */}
            <div style={{ textAlign: 'center' }}>
              <h1 style={{ fontFamily: 'Cinzel, serif', color: '#002B66', fontSize: '1.45rem', fontWeight: 800, margin: '0 0 2px 0', letterSpacing: '1px' }}>
                PARTIDO DEMOCRÁTICO SOMOS PERÚ
              </h1>
              <div style={{ color: '#e30613', fontSize: '0.78rem', fontWeight: 800, letterSpacing: '1.5px', textTransform: 'uppercase' }}>
                SISTEMA NACIONAL DE CONTROL ELECTORAL Y DEFENSA DEL VOTO
              </div>
              <div style={{ display: 'flex', height: '3px', width: '160px', margin: '8px auto 0', borderRadius: '2px', overflow: 'hidden' }}>
                <div style={{ flex: 1, background: '#e30613' }}></div>
                <div style={{ flex: 1, background: '#ffffff' }}></div>
                <div style={{ flex: 1, background: '#002B66' }}></div>
              </div>
            </div>

            {/* QR Code */}
            <div style={{ textAlign: 'center' }}>
              {qrUrl ? (
                <img src={qrUrl} alt="QR" style={{ width: '84px', height: '84px', border: '1px solid #cbd5e1', padding: '2px', background: '#fff' }} />
              ) : (
                <div style={{ width: '84px', height: '84px', background: '#f1f5f9' }}></div>
              )}
              <div style={{ fontSize: '0.58rem', fontWeight: 800, color: '#002B66', marginTop: '2px' }}>
                {folio}
              </div>
            </div>
          </div>

          {/* Título del Certificado */}
          <div style={{ textAlign: 'center', marginBottom: '14px' }}>
            <h2 style={{ fontFamily: 'Cinzel, serif', color: '#002B66', fontSize: '1.55rem', fontWeight: 800, margin: '0 0 2px 0', letterSpacing: '1px' }}>
              CERTIFICADO OFICIAL DE ACREDITACIÓN
            </h2>
            <div style={{ color: '#c59b27', fontStyle: 'italic', fontSize: '0.85rem', fontWeight: 700 }}>
              "Por la Democracia, la Descentralización y la Transparencia • Elecciones 2026"
            </div>
          </div>

          {/* Otorgamiento */}
          <p style={{ textAlign: 'center', fontSize: '0.82rem', color: '#475569', fontStyle: 'italic', margin: '0 0 10px 0' }}>
            El Comité Ejecutivo Nacional y la Secretaría Nacional Electoral del Partido Democrático Somos Perú otorgan la presente acreditación a:
          </p>

          {/* Nombre del Personero */}
          <div style={{ textAlign: 'center', margin: '8px 0 12px 0' }}>
            <div style={{ fontFamily: 'Playfair Display, Georgia, serif', fontSize: '1.9rem', fontWeight: 800, color: '#002B66', textTransform: 'uppercase', letterSpacing: '1px' }}>
              {personero}
            </div>
            <div style={{ height: '1.5px', width: '380px', background: 'linear-gradient(90deg, transparent, #c59b27, transparent)', margin: '6px auto' }}></div>
            <div style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', letterSpacing: '0.5px' }}>
              DOCUMENTO NACIONAL DE IDENTIDAD (D.N.I.): {dni}
            </div>
          </div>

          {/* Texto de Habilitación */}
          <p style={{ textAlign: 'center', fontSize: '0.78rem', color: '#334155', maxWidth: '780px', margin: '0 auto 12px', lineHeight: 1.45 }}>
            Por haber culminado y aprobado satisfactoriamente el Programa de Capacitación Técnica en Defensa del Voto, Conteo Rápido y Fiscalización de Mesas para las Elecciones Generales 2026, acreditándosele en calidad de:
          </p>

          {/* Badge del Cargo */}
          <div style={{ textAlign: 'center', marginBottom: '16px' }}>
            <span style={{
              display: 'inline-block',
              background: '#002B66',
              color: '#ffffff',
              padding: '6px 28px',
              borderRadius: '24px',
              border: '2px solid #c59b27',
              fontSize: '0.92rem',
              fontWeight: 800,
              letterSpacing: '1px',
              boxShadow: '0 4px 12px rgba(0, 43, 102, 0.25)'
            }}>
              {rol}
            </span>
          </div>

          {/* Tabla de Asignación Simétrica y Adaptativa */}
          <div style={{
            display: 'grid',
            gridTemplateColumns: isZonal ? '1fr 1.1fr 0.8fr 2.1fr' : (isDistrital ? '1fr 1.5fr 1.5fr' : 'repeat(4, 1fr)'),
            background: '#f8fafc',
            border: '1px solid #cbd5e1',
            borderRadius: '8px',
            padding: '12px 14px',
            textAlign: 'center',
            marginBottom: '20px',
            gap: '8px',
            alignItems: 'center'
          }}>
            <div style={{ borderRight: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 800, display: 'block', textTransform: 'uppercase' }}>DEPARTAMENTO / REGIÓN</span>
              <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>LIMA METROPOLITANA</strong>
            </div>
            <div style={{ borderRight: '1px solid #e2e8f0' }}>
              <span style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 800, display: 'block', textTransform: 'uppercase' }}>DISTRITO ELECTORAL</span>
              <strong style={{ fontSize: '0.82rem', color: '#0f172a' }}>{distrito}</strong>
            </div>
            {!isDistrital && (
              <div style={{ borderRight: '1px solid #e2e8f0' }}>
                <span style={{ fontSize: '0.62rem', color: isZonal ? '#64748b' : '#ef4444', fontWeight: 800, display: 'block', textTransform: 'uppercase' }}>MESA DE SUFRAGIO N°</span>
                <strong style={{ fontSize: isZonal ? '0.82rem' : '1rem', color: isZonal ? '#64748b' : '#e30613', fontWeight: 900 }}>
                  {isZonal ? 'No aplica' : mesa}
                </strong>
              </div>
            )}
            <div>
              <span style={{ fontSize: '0.62rem', color: '#64748b', fontWeight: 800, display: 'block', textTransform: 'uppercase', marginBottom: '2px' }}>
                {isZonal ? `LOCALES DE VOTACIÓN DE LA ZONA (${schoolsList.length})` : (isDistrital ? 'ÁMBITO TERRITORIAL' : 'LOCAL DE VOTACIÓN')}
              </span>
              {isZonal ? (
                /* Lista visual simétrica y prolija para los colegios de la zona */
                <div style={{
                  display: 'flex',
                  flexDirection: 'column',
                  gap: '3px',
                  maxHeight: '80px',
                  overflowY: 'auto',
                  padding: '2px 4px',
                  textAlign: 'left'
                }}>
                  {schoolsList.map((sch, i) => (
                    <div
                      key={i}
                      style={{
                        fontSize: '0.69rem',
                        color: '#0f172a',
                        fontWeight: 700,
                        display: 'flex',
                        alignItems: 'center',
                        gap: '6px',
                        lineHeight: 1.25,
                        background: '#ffffff',
                        border: '1px solid #e2e8f0',
                        borderRadius: '4px',
                        padding: '2px 6px'
                      }}
                    >
                      <span style={{ width: '5px', height: '5px', borderRadius: '50%', background: '#0284c7', flexShrink: 0 }}></span>
                      <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>{sch}</span>
                    </div>
                  ))}
                </div>
              ) : (
                <strong style={{ fontSize: '0.78rem', color: '#0f172a', display: 'block', whiteSpace: isDistrital ? 'normal' : 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  {isDistrital ? `TODO EL DISTRITO DE ${distrito}` : rawLocal.toUpperCase()}
                </strong>
              )}
            </div>
          </div>

          {/* Firmas y Medalla Dorada Central */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 140px 1fr', alignItems: 'flex-end', textAlign: 'center', marginTop: '10px', marginBottom: '14px' }}>
            
            {/* Firma Izquierda */}
            <div>
              <div style={{ width: '160px', height: '35px', margin: '0 auto 4px', borderBottom: '1.5px solid #002B66' }}>
                <svg viewBox="0 0 100 20" style={{ width: '100%', height: '100%', stroke: '#002B66', fill: 'none', strokeWidth: 1.5 }}>
                  <path d="M5,15 Q30,2 50,12 T90,8" />
                </svg>
              </div>
              <strong style={{ fontSize: '0.75rem', color: '#002B66', display: 'block' }}>PATRICIA LI SOTELO</strong>
              <span style={{ fontSize: '0.62rem', color: '#64748b', display: 'block' }}>Presidenta y Personera Legal Titular</span>
              <span style={{ fontSize: '0.62rem', color: '#64748b', display: 'block' }}>Partido Democrático Somos Perú</span>
            </div>

            {/* Medalla Dorada Central */}
            <div style={{ textAlign: 'center' }}>
              <div style={{
                width: '74px',
                height: '74px',
                borderRadius: '50%',
                background: 'radial-gradient(circle, #fde047 0%, #ca8a04 100%)',
                border: '2px dashed #854d0e',
                margin: '0 auto',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                boxShadow: '0 4px 10px rgba(0,0,0,0.15)',
                position: 'relative'
              }}>
                <span style={{ fontSize: '0.52rem', fontWeight: 800, color: '#451a03' }}>SOMOS PERÚ</span>
                <span style={{ fontSize: '0.75rem', fontWeight: 900, color: '#713f12' }}>2026</span>
                <span style={{ fontSize: '0.45rem', fontWeight: 800, color: '#451a03' }}>ACREDITACIÓN</span>
                
                {/* Listón Rojo/Azul */}
                <div style={{ position: 'absolute', bottom: '-10px', display: 'flex', gap: '3px' }}>
                  <div style={{ width: '7px', height: '14px', background: '#e30613', clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 75%, 0 100%)' }}></div>
                  <div style={{ width: '7px', height: '14px', background: '#002B66', clipPath: 'polygon(0 0, 100% 0, 100% 100%, 50% 75%, 0 100%)' }}></div>
                </div>
              </div>
            </div>

            {/* Firma Derecha */}
            <div>
              <div style={{ width: '160px', height: '35px', margin: '0 auto 4px', borderBottom: '1.5px solid #002B66' }}>
                <svg viewBox="0 0 100 20" style={{ width: '100%', height: '100%', stroke: '#002B66', fill: 'none', strokeWidth: 1.5 }}>
                  <path d="M10,12 Q35,18 60,6 T95,14" />
                </svg>
              </div>
              <strong style={{ fontSize: '0.75rem', color: '#002B66', display: 'block' }}>SECRETARÍA NACIONAL ELECTORAL</strong>
              <span style={{ fontSize: '0.62rem', color: '#64748b', display: 'block' }}>Comisión de Control y Conteo Rápido</span>
              <span style={{ fontSize: '0.62rem', color: '#64748b', display: 'block' }}>Elecciones Generales 2026</span>
            </div>

          </div>

          {/* Pie de Certificado con Folio y Fecha */}
          <div style={{
            borderTop: '1px solid #e2e8f0',
            paddingTop: '8px',
            marginTop: '12px',
            display: 'flex',
            justifyContent: 'space-between',
            fontSize: '0.62rem',
            color: '#64748b'
          }}>
            <span>CÓDIGO DE VALIDACIÓN: {validationCode} • FOLIO: {folio} • HABILITACIÓN OFICIAL JNE/ONPE 2026</span>
            <span>EMISIÓN: 10 DE AGOSTO DE 2026</span>
          </div>

        </div>
      </div>
    </div>
  );
}
