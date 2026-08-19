import React, { useState } from 'react';
import { X, FileText, CheckCircle2, Lock, ArrowDown } from 'lucide-react';
import confetti from 'canvas-confetti';

export function PdfModal({ onClose, onComplete, currentPdfCount = 0 }) {
  const [canConfirm, setCanConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleContainerScroll = (e) => {
    const { scrollTop, scrollHeight, clientHeight } = e.target;
    // Cuando el usuario baje la barra del visor pasando el documento
    if (scrollHeight - scrollTop - clientHeight < 80) {
      setCanConfirm(true);
    }
  };

  const handleConfirm = async () => {
    if (!canConfirm || submitting) return;
    setSubmitting(true);
    try {
      await onComplete();
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.8 } });
      onClose();
    } catch (err) {
      alert(err.message || 'Error al registrar lectura.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop" style={{ background: 'rgba(11, 19, 41, 0.9)', backdropFilter: 'blur(8px)', zIndex: 9999 }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '960px',
        height: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        
        {/* Encabezado */}
        <div style={{
          padding: '16px 24px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#0f172a',
          color: '#ffffff'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(16, 185, 129, 0.2)', color: '#34d399', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 style={{ fontSize: '1rem', fontWeight: 800, margin: 0 }}>
                Manual de Capacitación de Personeros ERM 2026
              </h3>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                Partido Democrático Somos Perú — Lectura requerida ({currentPdfCount}/2)
              </div>
            </div>
          </div>
          <button
            onClick={onClose}
            style={{
              background: 'none',
              border: 'none',
              color: '#94a3b8',
              cursor: 'pointer',
              padding: '4px',
              borderRadius: '6px'
            }}
          >
            <X className="w-6 h-6 text-slate-300" />
          </button>
        </div>

        {/* Contenedor con Scroll Exterior que Envuelve al Documento PDF Completo */}
        <div
          onScroll={handleContainerScroll}
          style={{
            padding: '16px',
            flex: 1,
            overflowY: 'auto',
            background: '#334155',
            display: 'flex',
            flexDirection: 'column',
            gap: '16px'
          }}
        >
          {/* Visor PDF Iframe Nativo de Alta Compatibilidad */}
          <div style={{
            background: '#ffffff',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
            height: '1100px',
            width: '100%',
            flexShrink: 0
          }}>
            <iframe
              src="/manuals/Manual_Capacitacion_Personeros_ERM_2026_Carlos_Bruce.pdf#toolbar=1&navpanes=0"
              title="Manual de Capacitación Electoral"
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            />
          </div>

          {/* Marcador Final al fondo del scroll */}
          <div style={{
            background: canConfirm ? '#ecfdf5' : '#1e293b',
            border: canConfirm ? '2px solid #10b981' : '1px dashed #64748b',
            borderRadius: '12px',
            padding: '24px 20px',
            textAlign: 'center',
            color: canConfirm ? '#065f46' : '#94a3b8',
            flexShrink: 0
          }}>
            {canConfirm ? (
              <div style={{ display: 'flex', flexDirection: 'column', alignItems: 'center', gap: '6px' }}>
                <div style={{ width: '42px', height: '42px', borderRadius: '50%', background: '#10b981', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
                  <CheckCircle2 className="w-6 h-6" />
                </div>
                <strong style={{ fontSize: '1.05rem', color: '#047857' }}>¡Has llegado al final del Manual Electoral!</strong>
                <span style={{ fontSize: '0.84rem', color: '#059669' }}>El botón de confirmación ya está desbloqueado.</span>
              </div>
            ) : (
              <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'center', gap: '8px', fontSize: '0.88rem' }}>
                <ArrowDown className="w-5 h-5 text-sky-400 animate-bounce" />
                <span>Desplace hacia abajo para completar la lectura</span>
              </div>
            )}
          </div>
        </div>

        {/* Footer */}
        <div style={{
          padding: '14px 24px',
          borderTop: '1px solid #e2e8f0',
          background: '#f8fafc',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ fontSize: '0.84rem', color: '#475569', fontWeight: 600 }}>
            {canConfirm ? (
              <span style={{ color: '#16a34a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Lectura completada y lista para confirmar</span>
              </span>
            ) : (
              <span style={{ color: '#64748b', display: 'flex', alignItems: 'center', gap: '6px' }}>
                <Lock className="w-4 h-4 text-amber-500" />
                <span>Baje hasta el final para desbloquear</span>
              </span>
            )}
          </div>

          <button
            onClick={handleConfirm}
            disabled={!canConfirm || submitting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '11px 26px',
              borderRadius: '10px',
              border: 'none',
              background: canConfirm ? 'linear-gradient(90deg, #10b981, #059669)' : '#cbd5e1',
              color: '#ffffff',
              fontSize: '0.92rem',
              fontWeight: 800,
              cursor: canConfirm && !submitting ? 'pointer' : 'not-allowed',
              boxShadow: canConfirm ? '0 4px 14px rgba(16, 185, 129, 0.35)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            {canConfirm ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            <span>{submitting ? 'Registrando lectura...' : (canConfirm ? 'Confirmar Lectura del Manual' : 'Bajar hasta el final')}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
