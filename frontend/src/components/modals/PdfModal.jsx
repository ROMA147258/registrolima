import React, { useState, useEffect } from 'react';
import { X, FileText, CheckCircle2, Lock, Clock, BookOpen } from 'lucide-react';
import confetti from 'canvas-confetti';

export function PdfModal({ onClose, onComplete, currentPdfCount = 0 }) {
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutos (120 segundos)
  const [submitting, setSubmitting] = useState(false);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const canConfirm = timeLeft === 0;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
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

        {/* Banner de Tiempo de Lectura */}
        <div style={{
          background: canConfirm ? '#ecfdf5' : '#eff6ff',
          borderBottom: canConfirm ? '1.5px solid #10b981' : '1.5px solid #bae6fd',
          padding: '10px 24px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.82rem'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: canConfirm ? '#047857' : '#0369a1', fontWeight: 700 }}>
            <BookOpen className="w-4 h-4" />
            <span>{canConfirm ? '✅ Tiempo mínimo de lectura completado (2 minutos).' : '📖 Lea detenidamente el manual electoral.'}</span>
          </div>

          <div style={{
            background: canConfirm ? '#10b981' : '#0284c7',
            color: '#ffffff',
            padding: '4px 12px',
            borderRadius: '20px',
            fontWeight: 800,
            fontSize: '0.82rem',
            display: 'flex',
            alignItems: 'center',
            gap: '6px'
          }}>
            <Clock className="w-3.5 h-3.5" />
            <span>{canConfirm ? 'Desbloqueado' : `Habilitando en: ${formatTime(timeLeft)}`}</span>
          </div>
        </div>

        {/* Visor PDF Iframe Nativo */}
        <div
          style={{
            padding: '12px',
            flex: 1,
            overflowY: 'auto',
            background: '#334155',
            display: 'flex',
            flexDirection: 'column'
          }}
        >
          <div style={{
            background: '#ffffff',
            borderRadius: '10px',
            overflow: 'hidden',
            boxShadow: '0 8px 30px rgba(0,0,0,0.3)',
            height: '100%',
            minHeight: '600px',
            width: '100%'
          }}>
            <iframe
              src="/manuals/Manual_Capacitacion_Personeros_ERM_2026_Carlos_Bruce.pdf#toolbar=1&navpanes=0"
              title="Manual de Capacitación Electoral"
              style={{ width: '100%', height: '100%', border: 'none', display: 'block' }}
            />
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
              <span style={{ color: '#0369a1', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                <Clock className="w-4 h-4 text-sky-600 animate-spin" />
                <span>Tiempo restante de lectura: {formatTime(timeLeft)}</span>
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
            <span>{submitting ? 'Registrando lectura...' : (canConfirm ? 'Confirmar Lectura del Manual' : `Esperar ${formatTime(timeLeft)}`)}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
