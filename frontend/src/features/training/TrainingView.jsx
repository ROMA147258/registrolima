import React, { useState } from 'react';
import { LogOut, Film, FileText, Lock, CheckCircle2, ChevronRight, Award, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { VideoModal } from '../../components/modals/VideoModal.jsx';
import { PdfModal } from '../../components/modals/PdfModal.jsx';
import { QuizModal } from '../../components/modals/QuizModal.jsx';
import { CredentialCard } from '../accreditation/CredentialCard.jsx';
import { api } from '../../services/api.js';

export function TrainingView() {
  const { user, logout, updateUserTraining } = useAuth();
  const [activeModal, setActiveModal] = useState(null);
  const [viewingCertificate, setViewingCertificate] = useState(false);

  const videoCount = parseInt(user?.Video ?? user?.video ?? 0, 10);
  const pdfCount = parseInt(user?.PDF ?? user?.pdf ?? 0, 10);
  const quizStatus = String(user?.Preguntas ?? user?.preguntas ?? 'Pendiente');
  const isQuizPassed = quizStatus.toLowerCase() === 'aprobado' || quizStatus.toLowerCase() === 'pasado';

  const isVideoDone = videoCount >= 2;
  const isPdfDone = pdfCount >= 2;
  const canTakeQuiz = isVideoDone && isPdfDone;
  const isFullyAccredited = isVideoDone && isPdfDone && isQuizPassed;

  const handleVideoComplete = async () => {
    const dni = user?.['D.N.I.'] || user?.DNI || user?.dni;
    const res = await api.updateProgress(dni, 'video', videoCount);
    updateUserTraining(res);
  };

  const handlePdfComplete = async () => {
    const dni = user?.['D.N.I.'] || user?.DNI || user?.dni;
    const res = await api.updateProgress(dni, 'pdf', pdfCount);
    updateUserTraining(res);
  };

  const handleQuizComplete = async () => {
    const dni = user?.['D.N.I.'] || user?.DNI || user?.dni;
    const res = await api.updateProgress(dni, 'quiz', 0);
    updateUserTraining(res);
  };

  if (viewingCertificate && isFullyAccredited) {
    return (
      <div style={{ minHeight: '100vh', background: 'rgb(193, 229, 249)', padding: '24px 16px' }}>
        <CredentialCard user={user} onBack={() => setViewingCertificate(false)} />
      </div>
    );
  }

  const dni = user?.['D.N.I.'] || user?.DNI || user?.dni || '00000000';
  const personero = user?.['Nombres y Apellidos'] || user?.nombresApellidos || 'Personero';
  const distrito = user?.['Distrito Asignado'] || user?.distritoAsignado || user?.['Distrito donde Vota'] || 'Lima';
  const mesa = user?.['Mesa Asignada'] || user?.mesaAsignada || user?.['Mesa de Sufragio'] || '-';

  return (
    <div style={{
      minHeight: '100vh',
      background: 'rgb(193, 229, 249)',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '24px 16px',
      fontFamily: "'Outfit', 'Montserrat', sans-serif"
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '20px',
        width: '100%',
        maxWidth: '460px',
        padding: '28px 24px',
        boxShadow: '0 20px 40px rgba(0, 0, 0, 0.08)',
        border: '1px solid #cbd5e1'
      }}>
        
        {/* Cabecera */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'flex-start', marginBottom: '16px' }}>
          <div>
            <h1 style={{ fontSize: '1.75rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
              Capacítate
            </h1>
            <span style={{ fontSize: '0.82rem', color: '#64748b', fontWeight: 600 }}>
              Ficha de Capacitación de Personeros
            </span>
          </div>

          <button
            onClick={logout}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '6px 14px',
              borderRadius: '20px',
              border: '1px solid #fecaca',
              background: '#fef2f2',
              color: '#ef4444',
              fontSize: '0.82rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Salir</span>
          </button>
        </div>

        {/* Tarjeta de Bienvenida y Badges */}
        <div style={{
          background: '#f0f9ff',
          border: '1px solid #bae6fd',
          borderRadius: '14px',
          padding: '16px',
          marginBottom: '16px'
        }}>
          <div style={{ fontSize: '0.98rem', fontWeight: 800, color: '#0f172a', marginBottom: '10px' }}>
            ¡Bienvenido, <span style={{ color: 'rgb(14, 165, 233)' }}>{personero}</span>!
          </div>

          <div style={{ display: 'flex', flexWrap: 'wrap', gap: '8px' }}>
            <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '16px', fontSize: '0.78rem', fontWeight: 800 }}>
              DNI: {dni}
            </span>
            <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '16px', fontSize: '0.78rem', fontWeight: 800 }}>
              Distrito: {distrito}
            </span>
            <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '16px', fontSize: '0.78rem', fontWeight: 800 }}>
              Mesa: {mesa}
            </span>
          </div>
        </div>

        {/* Bloques de Indicadores de Progreso */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          
          {/* Visualizaciones de Video */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Visualizaciones de Video</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'rgb(14, 165, 233)' }}>{videoCount}/2</div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: videoCount >= 1 ? 'rgb(14, 165, 233)' : '#cbd5e1' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: videoCount >= 2 ? 'rgb(14, 165, 233)' : '#cbd5e1' }}></div>
            </div>
          </div>

          {/* Lecturas de PDF */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Lecturas de PDF</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'rgb(14, 165, 233)' }}>{pdfCount}/2</div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: pdfCount >= 1 ? 'rgb(14, 165, 233)' : '#cbd5e1' }}></div>
              <div style={{ width: '12px', height: '12px', borderRadius: '50%', background: pdfCount >= 2 ? 'rgb(14, 165, 233)' : '#cbd5e1' }}></div>
            </div>
          </div>

          {/* Evaluación de Preguntas */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Evaluación de Preguntas</div>
              <div style={{ fontSize: '1.05rem', fontWeight: 900, color: isQuizPassed ? '#10b981' : '#f59e0b' }}>
                {isQuizPassed ? 'Aprobado (5/5)' : 'Pendiente'}
              </div>
            </div>
            <div style={{ color: '#94a3b8' }}>|</div>
          </div>
        </div>

        {/* Lista de Acciones */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* 1. Ver Video Tutorial */}
          <div
            onClick={() => setActiveModal('video')}
            style={{
              background: '#f8fafc',
              border: isVideoDone ? '1.5px solid #10b981' : '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: isVideoDone ? '#dcfce7' : '#e0f2fe', color: isVideoDone ? '#16a34a' : 'rgb(14, 165, 233)', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <Film className="w-6 h-6" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>Ver Video Tutorial</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Ver el video instructivo (Conteo)</div>
            </div>
            {isVideoDone ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
          </div>

          {/* 2. Leer PDF Instructivo */}
          <div
            onClick={() => setActiveModal('pdf')}
            style={{
              background: '#f8fafc',
              border: isPdfDone ? '1.5px solid #10b981' : '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: isPdfDone ? '#dcfce7' : '#f1f5f9', color: isPdfDone ? '#16a34a' : '#64748b', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <FileText className="w-6 h-6" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>Leer PDF Instructivo</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Leer el manual electoral</div>
            </div>
            {isPdfDone ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
          </div>

          {/* 3. Cuestionario de Preguntas */}
          <div
            onClick={() => { if (canTakeQuiz) setActiveModal('quiz'); }}
            style={{
              background: canTakeQuiz ? '#f8fafc' : '#f1f5f9',
              border: isQuizPassed ? '1.5px solid #10b981' : '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              cursor: canTakeQuiz ? 'pointer' : 'not-allowed',
              opacity: canTakeQuiz ? 1 : 0.85,
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: isQuizPassed ? '#dcfce7' : (canTakeQuiz ? '#fef3c7' : '#e2e8f0'), color: isQuizPassed ? '#16a34a' : (canTakeQuiz ? '#d97706' : '#94a3b8'), display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {isQuizPassed ? <CheckCircle2 className="w-6 h-6" /> : (canTakeQuiz ? <Award className="w-6 h-6" /> : <Lock className="w-5 h-5" />)}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>Cuestionario de Preguntas</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>
                {canTakeQuiz ? (isQuizPassed ? 'Aprobado con 5/5' : 'Desbloqueado (Rendir 5 preguntas)') : 'Bloqueado (Ver 2 videos y 2 PDFs)'}
              </div>
            </div>
            {isQuizPassed ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : (canTakeQuiz ? <ChevronRight className="w-5 h-5 text-amber-500" /> : <Lock className="w-4 h-4 text-slate-400" />)}
          </div>

          {/* 4. Mi Certificado Oficial */}
          <div
            onClick={() => { if (isFullyAccredited) setViewingCertificate(true); }}
            style={{
              background: isFullyAccredited ? 'linear-gradient(135deg, #e0f2fe 0%, #bae6fd 100%)' : '#f1f5f9',
              border: isFullyAccredited ? '1.5px solid rgb(14, 165, 233)' : '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              cursor: isFullyAccredited ? 'pointer' : 'not-allowed',
              opacity: isFullyAccredited ? 1 : 0.85,
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{ width: '42px', height: '42px', borderRadius: '10px', background: isFullyAccredited ? 'rgb(14, 165, 233)' : '#e2e8f0', color: isFullyAccredited ? '#ffffff' : '#94a3b8', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              {isFullyAccredited ? <Award className="w-6 h-6" /> : <Lock className="w-5 h-5" />}
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: isFullyAccredited ? '#0369a1' : '#0f172a' }}>Mi Certificado Oficial</div>
              <div style={{ fontSize: '0.75rem', color: isFullyAccredited ? 'rgb(14, 165, 233)' : '#64748b' }}>
                {isFullyAccredited ? 'Listo para Ver y Descargar' : 'Bloqueado (Aprobar 5/5 en Cuestionario)'}
              </div>
            </div>
            {isFullyAccredited ? <ChevronRight className="w-5 h-5 text-sky-600" /> : <Lock className="w-4 h-4 text-slate-400" />}
          </div>

        </div>

      </div>

      {/* Modals */}
      {activeModal === 'video' && (
        <VideoModal
          currentVideoCount={videoCount}
          onClose={() => setActiveModal(null)}
          onComplete={handleVideoComplete}
        />
      )}

      {activeModal === 'pdf' && (
        <PdfModal
          currentPdfCount={pdfCount}
          onClose={() => setActiveModal(null)}
          onComplete={handlePdfComplete}
        />
      )}

      {activeModal === 'quiz' && (
        <QuizModal
          onClose={() => setActiveModal(null)}
          onPassQuiz={handleQuizComplete}
        />
      )}
    </div>
  );
}
