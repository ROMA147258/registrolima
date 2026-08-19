import React, { useEffect } from 'react';
import { CheckCircle2, AlertCircle, Info, X } from 'lucide-react';

export function Toast({ message, type = 'info', onClose, duration = 4000 }) {
  useEffect(() => {
    if (!message) return;
    const timer = setTimeout(() => {
      onClose();
    }, duration);
    return () => clearTimeout(timer);
  }, [message, duration, onClose]);

  if (!message) return null;

  const icons = {
    success: <CheckCircle2 className="w-5 h-5 text-emerald-400" />,
    error: <AlertCircle className="w-5 h-5 text-red-400" />,
    warning: <AlertCircle className="w-5 h-5 text-amber-400" />,
    info: <Info className="w-5 h-5 text-sky-400" />
  };

  const bgStyles = {
    success: 'border-emerald-500/30 bg-emerald-950/90 text-emerald-100',
    error: 'border-red-500/30 bg-red-950/90 text-red-100',
    warning: 'border-amber-500/30 bg-amber-950/90 text-amber-100',
    info: 'border-sky-500/30 bg-slate-900/95 text-sky-100'
  };

  return (
    <div style={{
      position: 'fixed',
      bottom: '24px',
      right: '24px',
      zIndex: 9999,
      display: 'flex',
      alignItems: 'center',
      gap: '12px',
      padding: '14px 20px',
      borderRadius: '12px',
      border: '1px solid',
      boxShadow: '0 20px 40px rgba(0,0,0,0.5)',
      backdropFilter: 'blur(8px)',
      animation: 'fadeIn 0.2s ease-out'
    }} className={bgStyles[type] || bgStyles.info}>
      {icons[type] || icons.info}
      <div style={{ fontSize: '0.9rem', fontWeight: 600 }}>{message}</div>
      <button onClick={onClose} style={{
        background: 'none',
        border: 'none',
        color: 'inherit',
        opacity: 0.7,
        cursor: 'pointer',
        display: 'flex',
        alignItems: 'center'
      }}>
        <X className="w-4 h-4" />
      </button>
    </div>
  );
}
