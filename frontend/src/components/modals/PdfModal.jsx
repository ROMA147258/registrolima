import React, { useState, useEffect } from 'react';
import { X, FileText, CheckCircle2, Lock, Clock, BookOpen, Download, ExternalLink } from 'lucide-react';
import confetti from 'canvas-confetti';

export function PdfModal({ currentPdfCount, onClose, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(60); // 1 MINUTO EXACTO (01:00)
  const [canConfirm, setCanConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [isMobile, setIsMobile] = useState(window.innerWidth < 768);

  const pdfUrl = '/manuals/Cartilla_del_Personero_ERM_2026.pdf';

  useEffect(() => {
    const handleResize = () => setIsMobile(window.innerWidth < 768);
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  // Cuenta regresiva de 1 minuto (01:00)
  useEffect(() => {
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanConfirm(true);
    }
  }, [timeLeft]);

  const handleConfirm = async () => {
    if (!canConfirm || submitting) return;
    setSubmitting(true);
    try {
      if (onComplete) {
        await onComplete();
      }
      confetti({
        particleCount: 80,
        spread: 70,
        origin: { y: 0.6 }
      });
      onClose();
    } catch (err) {
      console.error("Error al registrar lectura de PDF:", err);
      onClose();
    }
  };

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.88)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: isMobile ? '0' : '16px',
      color: '#0f172a'
    }}>
      <div style={{
        background: '#ffffff',
        width: '100%',
        maxWidth: isMobile ? '100%' : '1100px',
        height: isMobile ? '100vh' : '92vh',
        borderRadius: isMobile ? '0' : '16px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5)',
        border: isMobile ? 'none' : '1px solid #cbd5e1'
      }}>
        
        {/* Header Superior Oscuro Institucional */}
        <div style={{
          padding: isMobile ? '10px 14px' : '14px 20px',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#002B66',
          color: '#ffffff',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <BookOpen className="w-4 h-4" />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 style={{ fontSize: isMobile ? '0.88rem' : '1.05rem', fontWeight: 900, margin: 0, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Cartilla del Personero ERM 2026
                </h3>
                {!isMobile && (
                  <span style={{ padding: '2px 8px', fontSize: '0.68rem', background: '#0284c7', color: '#ffffff', borderRadius: '20px', fontWeight: 800 }}>
                    PDF OFICIAL
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#93c5fd', marginTop: '1px' }}>
                Lectura obligatoria ({currentPdfCount}/2) • Cartilla Oficial
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <a
              href={pdfUrl}
              target="_blank"
              rel="noreferrer"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: isMobile ? '6px 8px' : '7px 12px',
                background: 'rgba(255, 255, 255, 0.12)',
                color: '#ffffff',
                borderRadius: '8px',
                fontSize: isMobile ? '0.72rem' : '0.78rem',
                fontWeight: 700,
                textDecoration: 'none',
                border: '1px solid rgba(255, 255, 255, 0.2)'
              }}
              title="Abrir en pestaña completa"
            >
              <ExternalLink className="w-3.5 h-3.5" />
              {!isMobile && <span>Abrir</span>}
            </a>

            <a
              href={pdfUrl}
              download="Cartilla_del_Personero_ERM_2026.pdf"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: isMobile ? '6px 10px' : '7px 14px',
                background: '#dc2626',
                color: '#ffffff',
                borderRadius: '8px',
                fontSize: isMobile ? '0.72rem' : '0.78rem',
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 2px 6px rgba(220, 38, 38, 0.4)'
              }}
              title="Descargar Cartilla del Personero en PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isMobile ? 'PDF' : 'Descargar PDF'}</span>
            </a>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.12)',
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

        {/* Banner de Tiempo de Lectura y Estado */}
        <div style={{
          background: canConfirm ? '#ecfdf5' : '#f0f9ff',
          borderBottom: canConfirm ? '1.5px solid #10b981' : '1.5px solid #bae6fd',
          padding: isMobile ? '8px 12px' : '10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: canConfirm ? '#047857' : '#0369a1', fontWeight: 800 }}>
            {canConfirm ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span style={{ fontSize: isMobile ? '0.74rem' : '0.82rem' }}>¡Lectura de 1 minuto completada! Botón activado.</span>
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 text-sky-600 flex-shrink-0 animate-spin" />
                <span style={{ fontSize: isMobile ? '0.74rem' : '0.82rem' }}>Revisa la Cartilla del Personero (tiempo mínimo de lectura: 1 minuto).</span>
              </>
            )}
          </div>

          <div style={{
            background: canConfirm ? '#10b981' : '#0284c7',
            color: '#ffffff',
            padding: '4px 12px',
            borderRadius: '20px',
            fontWeight: 900,
            fontSize: '0.78rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px',
            boxShadow: canConfirm ? '0 2px 8px rgba(16, 185, 129, 0.35)' : 'none'
          }}>
            <Clock className="w-3.5 h-3.5" />
            <span>{canConfirm ? 'Activado' : `Tiempo: ${formatTime(timeLeft)}`}</span>
          </div>
        </div>

        {/* Visor de PDF Real Incrustado */}
        <div style={{
          flex: 1,
          width: '100%',
          height: '100%',
          background: '#334155',
          position: 'relative',
          display: 'flex',
          flexDirection: 'column'
        }}>
          <object
            data={`${pdfUrl}#view=FitH&toolbar=1&navpanes=1`}
            type="application/pdf"
            style={{
              width: '100%',
              height: '100%',
              flex: 1,
              border: 'none',
              background: '#ffffff'
            }}
          >
            <iframe
              src={`${pdfUrl}#view=FitH&toolbar=1`}
              title="Cartilla del Personero ERM 2026"
              style={{
                width: '100%',
                height: '100%',
                flex: 1,
                border: 'none'
              }}
            >
              <div style={{
                padding: '40px 20px',
                textAlign: 'center',
                color: '#ffffff',
                background: '#0f172a',
                height: '100%',
                display: 'flex',
                flexDirection: 'column',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '14px'
              }}>
                <FileText className="w-16 h-16 text-sky-400" />
                <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0 }}>
                  Cartilla del Personero ERM 2026
                </h3>
                <p style={{ maxWidth: '400px', fontSize: '0.85rem', color: '#94a3b8' }}>
                  Tu navegador no soporta visualización directa de PDF en línea. Puedes descargarlo o abrirlo en una pestaña nueva:
                </p>
                <div style={{ display: 'flex', gap: '10px', marginTop: '10px' }}>
                  <a
                    href={pdfUrl}
                    target="_blank"
                    rel="noreferrer"
                    style={{
                      padding: '10px 18px',
                      background: '#0284c7',
                      color: '#ffffff',
                      borderRadius: '8px',
                      fontWeight: 800,
                      textDecoration: 'none'
                    }}
                  >
                    Abrir en Nueva Pestaña
                  </a>
                  <a
                    href={pdfUrl}
                    download="Cartilla_del_Personero_ERM_2026.pdf"
                    style={{
                      padding: '10px 18px',
                      background: '#dc2626',
                      color: '#ffffff',
                      borderRadius: '8px',
                      fontWeight: 800,
                      textDecoration: 'none'
                    }}
                  >
                    Descargar PDF
                  </a>
                </div>
              </div>
            </iframe>
          </object>
        </div>

        {/* Footer con Botón de Confirmación Responsivo */}
        <div style={{
          padding: isMobile ? '10px 14px' : '14px 20px',
          borderTop: '1px solid #e2e8f0',
          background: '#ffffff',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: '8px'
        }}>
          <div style={{ fontSize: isMobile ? '0.76rem' : '0.84rem', color: '#475569', fontWeight: 600, textAlign: isMobile ? 'center' : 'left' }}>
            {canConfirm ? (
              <span style={{ color: '#16a34a', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Lectura completada y lista para confirmar</span>
              </span>
            ) : (
              <span style={{ color: '#0369a1', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                <Clock className="w-4 h-4 text-sky-600 animate-spin" />
                <span>Tiempo de lectura obligatorio: <strong>{formatTime(timeLeft)}</strong></span>
              </span>
            )}
          </div>

          <button
            onClick={handleConfirm}
            disabled={!canConfirm || submitting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: isMobile ? '10px 16px' : '11px 26px',
              borderRadius: '10px',
              border: 'none',
              background: canConfirm ? 'linear-gradient(90deg, #10b981, #059669)' : '#cbd5e1',
              color: '#ffffff',
              fontSize: isMobile ? '0.85rem' : '0.92rem',
              fontWeight: 800,
              cursor: canConfirm && !submitting ? 'pointer' : 'not-allowed',
              boxShadow: canConfirm ? '0 4px 14px rgba(16, 185, 129, 0.35)' : 'none',
              transition: 'all 0.2s ease',
              width: isMobile ? '100%' : 'auto'
            }}
          >
            {canConfirm ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            <span>{submitting ? 'Registrando...' : (canConfirm ? 'Confirmar Lectura de la Cartilla' : `Esperar ${formatTime(timeLeft)}`)}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
