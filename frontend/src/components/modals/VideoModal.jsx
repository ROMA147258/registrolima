import React, { useState, useRef } from 'react';
import { X, Play, CheckCircle2, Lock, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

export function VideoModal({ onClose, onComplete, currentVideoCount = 0 }) {
  const videoRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [canFinish, setCanFinish] = useState(false);
  const [submitting, setSubmitting] = useState(false);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const { currentTime, duration } = videoRef.current;
    if (duration > 0) {
      const pct = Math.min(100, Math.round((currentTime / duration) * 100));
      setProgress(pct);
      if (pct >= 90 && !canFinish) {
        setCanFinish(true);
      }
    }
  };

  const handleConfirm = async () => {
    setSubmitting(true);
    try {
      await onComplete();
      confetti({ particleCount: 50, spread: 60, origin: { y: 0.8 } });
      onClose();
    } catch (err) {
      alert(err.message || 'Error al registrar video.');
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className="modal-backdrop">
      <div className="modal-content" style={{ maxWidth: '640px' }}>
        
        {/* Modal Header */}
        <div className="modal-header">
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <Play className="w-5 h-5 text-sky-400" />
            <h3 style={{ fontSize: '1rem', fontWeight: 700, color: '#ffffff', margin: 0 }}>
              Video Tutorial — Capacitación de Personeros
            </h3>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '16px' }}>
          <p style={{ fontSize: '0.8rem', color: '#94a3b8', marginBottom: '12px', lineHeight: 1.4 }}>
            Observe el video tutorial instructivo completo sobre las funciones del personero para registrar su avance ({currentVideoCount}/2).
          </p>

          <div style={{ position: 'relative', background: '#000', borderRadius: '12px', overflow: 'hidden', border: '1.5px solid #0284c7', boxShadow: '0 8px 25px rgba(0,0,0,0.5)' }}>
            <video
              ref={videoRef}
              playsInline
              controls
              preload="auto"
              onTimeUpdate={handleTimeUpdate}
              style={{ width: '100%', maxHeight: '380px', display: 'block', outline: 'none' }}
            >
              <source src="/videos/tutorial_personero.mp4" type="video/mp4" />
              Tu navegador no soporta el formato de video MP4.
            </video>
          </div>

          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginTop: '12px', fontSize: '0.8rem', color: '#38bdf8', fontWeight: 600 }}>
            <span>Progreso de visualización: {progress}%</span>
            <span>Meta requerida: 90%</span>
          </div>
        </div>

        {/* Modal Footer */}
        <div className="modal-footer" style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8' }}>
            Visualización {Math.min(2, currentVideoCount + 1)} de 2
          </span>
          <button
            onClick={handleConfirm}
            disabled={!canFinish || submitting}
            className="btn-primary"
            style={{
              width: 'auto',
              padding: '8px 20px',
              fontSize: '0.85rem',
              background: canFinish ? 'linear-gradient(90deg, #10b981, #059669)' : '#334155',
              cursor: canFinish ? 'pointer' : 'not-allowed'
            }}
          >
            {canFinish ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            <span>{submitting ? 'Registrando visualización...' : (canFinish ? 'Confirmar Visualización' : 'Debe ver el video')}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
