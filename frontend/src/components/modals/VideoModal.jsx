import React, { useState, useRef, useEffect } from 'react';
import { X, Play, CheckCircle2, Lock, ShieldAlert, Pause, Volume2, VolumeX } from 'lucide-react';
import confetti from 'canvas-confetti';

export function VideoModal({ onClose, onComplete, currentVideoCount = 0 }) {
  const videoRef = useRef(null);
  const [progress, setProgress] = useState(0);
  const [canFinish, setCanFinish] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [warningMsg, setWarningMsg] = useState(null);
  const maxTimeRef = useRef(0);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const { currentTime, duration } = videoRef.current;

    // Impedir adelantar: si el tiempo actual salta hacia adelante más de lo reproducido continuamente
    if (currentTime > maxTimeRef.current + 1.2) {
      videoRef.current.currentTime = maxTimeRef.current;
      setWarningMsg('⚠️ No está permitido adelantar el video de capacitación.');
      setTimeout(() => setWarningMsg(null), 3000);
      return;
    }

    if (currentTime > maxTimeRef.current) {
      maxTimeRef.current = currentTime;
    }

    if (duration > 0) {
      const pct = Math.min(100, Math.round((maxTimeRef.current / duration) * 100));
      setProgress(pct);
      if (pct >= 90 && !canFinish) {
        setCanFinish(true);
      }
    }
  };

  const handleSeeking = (e) => {
    if (!videoRef.current) return;
    if (videoRef.current.currentTime > maxTimeRef.current + 0.5) {
      videoRef.current.currentTime = maxTimeRef.current;
      setWarningMsg('⚠️ Debe ver el video en tiempo continuo sin adelantar.');
      setTimeout(() => setWarningMsg(null), 3000);
    }
  };

  const handleSeeked = () => {
    if (!videoRef.current) return;
    if (videoRef.current.currentTime > maxTimeRef.current + 0.5) {
      videoRef.current.currentTime = maxTimeRef.current;
    }
  };

  const handleEnded = () => {
    setCanFinish(true);
    setProgress(100);
  };

  const handleConfirm = async () => {
    if (!canFinish || submitting) return;
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
    <div className="modal-backdrop" style={{ background: 'rgba(11, 19, 41, 0.9)', backdropFilter: 'blur(8px)', zIndex: 9999 }}>
      <div className="modal-content" style={{ maxWidth: '680px', background: '#0f172a', border: '1px solid #1e293b', borderRadius: '16px', overflow: 'hidden' }}>
        
        {/* Modal Header */}
        <div style={{ padding: '16px 20px', borderBottom: '1px solid #334155', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#1e293b' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <div style={{ width: '32px', height: '32px', borderRadius: '8px', background: 'rgba(14, 165, 233, 0.2)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <Play className="w-4 h-4 fill-sky-400" />
            </div>
            <div>
              <h3 style={{ fontSize: '0.98rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Video Tutorial — Capacitación Electoral 2026
              </h3>
              <div style={{ fontSize: '0.72rem', color: '#94a3b8' }}>
                Reproducción continua en tiempo real requerida ({currentVideoCount}/2)
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
            <X className="w-5 h-5" />
          </button>
        </div>

        {/* Modal Body */}
        <div className="modal-body" style={{ padding: '18px 20px' }}>
          {warningMsg && (
            <div style={{
              background: '#fef2f2',
              border: '1px solid #f87171',
              color: '#dc2626',
              padding: '10px 14px',
              borderRadius: '8px',
              fontSize: '0.82rem',
              fontWeight: 700,
              display: 'flex',
              alignItems: 'center',
              gap: '8px',
              marginBottom: '12px',
              animation: 'fadeIn 0.2s ease'
            }}>
              <ShieldAlert className="w-4 h-4 flex-shrink-0" />
              <span>{warningMsg}</span>
            </div>
          )}

          <div style={{ position: 'relative', background: '#000', borderRadius: '12px', overflow: 'hidden', border: '1.5px solid #0284c7', boxShadow: '0 10px 30px rgba(0,0,0,0.6)' }}>
            <video
              ref={videoRef}
              playsInline
              controls
              controlsList="nodownload noplaybackrate"
              disablePictureInPicture
              preload="auto"
              onTimeUpdate={handleTimeUpdate}
              onSeeking={handleSeeking}
              onSeeked={handleSeeked}
              onEnded={handleEnded}
              style={{ width: '100%', maxHeight: '380px', display: 'block', outline: 'none' }}
            >
              <source src="/videos/tutorial_personero.mp4" type="video/mp4" />
              Tu navegador no soporta el formato de video MP4.
            </video>
          </div>

          {/* Barra de Progreso Bloqueada */}
          <div style={{ marginTop: '14px' }}>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.78rem', color: '#94a3b8', marginBottom: '6px' }}>
              <span style={{ color: canFinish ? '#34d399' : '#38bdf8', fontWeight: 700 }}>
                {canFinish ? '✅ Meta alcanzada: Puede confirmar' : `Progreso de visualización: ${progress}%`}
              </span>
              <span>Requerido: 90% continuo</span>
            </div>
            <div style={{ width: '100%', height: '8px', background: '#334155', borderRadius: '4px', overflow: 'hidden' }}>
              <div
                style={{
                  width: `${progress}%`,
                  height: '100%',
                  background: canFinish ? '#10b981' : 'linear-gradient(90deg, #0284c7, #38bdf8)',
                  transition: 'width 0.3s ease'
                }}
              />
            </div>
          </div>
        </div>

        {/* Modal Footer */}
        <div style={{ padding: '14px 20px', borderTop: '1px solid #334155', display: 'flex', justifyContent: 'space-between', alignItems: 'center', background: '#1e293b' }}>
          <span style={{ fontSize: '0.78rem', color: '#94a3b8', fontWeight: 600 }}>
            Visualización {Math.min(2, currentVideoCount + 1)} de 2
          </span>
          <button
            onClick={handleConfirm}
            disabled={!canFinish || submitting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '6px',
              padding: '10px 22px',
              borderRadius: '10px',
              border: 'none',
              fontSize: '0.86rem',
              fontWeight: 800,
              background: canFinish ? 'linear-gradient(90deg, #10b981, #059669)' : '#475569',
              color: '#ffffff',
              cursor: canFinish && !submitting ? 'pointer' : 'not-allowed',
              boxShadow: canFinish ? '0 4px 14px rgba(16, 185, 129, 0.4)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            {canFinish ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            <span>{submitting ? 'Registrando visualización...' : (canFinish ? 'Confirmar Visualización' : `Viendo video (${progress}%)`)}</span>
          </button>
        </div>
      </div>
    </div>
  );
}
