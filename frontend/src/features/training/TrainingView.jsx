import React, { useState } from 'react';
import { LogOut, Film, FileText, Lock, CheckCircle2, ChevronRight, Award, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { VideoModal } from '../../components/modals/VideoModal.jsx';
import { PdfModal } from '../../components/modals/PdfModal.jsx';
import { QuizModal } from '../../components/modals/QuizModal.jsx';
import { CredentialCard } from '../accreditation/CredentialCard.jsx';
import { api } from '../../services/api.js';

export function TrainingView({ onGoToDashboard }) {
  const { user, logout, updateUserTraining, isCoordinadorLocal, isCoordinadorZonal, isCoordinadorDistrital } = useAuth();
  const [activeModal, setActiveModal] = useState(null);
  const [viewingCertificate, setViewingCertificate] = useState(false);

  const rawVideo = parseInt(user?.Video ?? user?.video ?? user?.['Videos Completados'] ?? user?.videosCompletados ?? user?.videos_completados ?? 0, 10);
  const rawPdf = parseInt(user?.PDF ?? user?.pdf ?? user?.['PDFs Completados'] ?? user?.pdfsCompletados ?? user?.pdfs_completados ?? 0, 10);
  const quizStatus = String(user?.Preguntas ?? user?.preguntas ?? user?.['Evaluación Estado'] ?? user?.evaluacionEstado ?? user?.evaluacion_estado ?? user?.evaluacion ?? 'Pendiente').trim();
  const credStatus = String(user?.Credenciales ?? user?.credenciales ?? user?.['Estado Credencial'] ?? user?.estadoCredencial ?? user?.estado_credencial ?? user?.estado ?? '').trim().toLowerCase();

  const isConfirmed = credStatus === 'confirmado';
  const isQuizPassed = quizStatus.toLowerCase().includes('aprob') || quizStatus.toLowerCase().includes('pasad') || isConfirmed;
  
  const videoCount = (isConfirmed || isQuizPassed) && rawVideo < 2 ? 2 : rawVideo;
  const pdfCount = (isConfirmed || isQuizPassed) && rawPdf < 2 ? 2 : rawPdf;

  const isVideoDone = videoCount >= 2 || isConfirmed || isQuizPassed;
  const isPdfDone = pdfCount >= 2 || isConfirmed || isQuizPassed;
  const canTakeQuiz = isVideoDone && isPdfDone;
  const isFullyAccredited = isConfirmed || isQuizPassed || (isVideoDone && isPdfDone);

  const isAnyCoordinador = isCoordinadorDistrital || isCoordinadorZonal || isCoordinadorLocal;

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

  if (viewingCertificate) {
    return (
      <div style={{ minHeight: '100vh', background: 'rgb(193, 229, 249)', padding: '24px 16px' }}>
        <CredentialCard user={user} onBack={() => setViewingCertificate(false)} />
      </div>
    );
  }

  const personero = user?.['Nombres y Apellidos'] || user?.nombresApellidos || user?.nombres_y_apellidos || 'Personero';
  const dni = user?.['D.N.I.'] || user?.DNI || user?.dni || user?.dni_numero || (user?.tokenVerificacion ? user.tokenVerificacion.split('-').pop() : '') || '--------';
  const distrito = user?.['Distrito Asignado'] || user?.distritoAsignado || user?.['Distrito donde Vota'] || user?.distritoDondeVota || user?.distrito_asignado || 'Lima';
  const localAsig = user?.['Local de Votación Asignado'] || user?.localDeVotacionAsignado || user?.['Local de Votación'] || user?.localDeVotacion || user?.local_de_votacion_asignado || 'Por Asignar';
  const mesa = user?.['Mesa Asignada'] || user?.mesaAsignada || user?.['Mesa de Sufragio'] || user?.mesaDeSufragio || user?.mesa_asignada || 'No Asignada';

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
        maxWidth: '560px',
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
              {isCoordinadorDistrital
                ? 'Evaluación y Acreditación de Coordinador de Distritos'
                : (isCoordinadorZonal
                  ? 'Evaluación y Acreditación de Coordinador Zonal'
                  : (isCoordinadorLocal ? 'Evaluación y Acreditación de Coordinador de Local' : 'Ficha de Capacitación de Personeros'))}
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

        {/* Banner Informativo Exclusivo para Coordinadores */}
        {isAnyCoordinador && (
          <div style={{
            background: isFullyAccredited ? '#ecfdf5' : '#eff6ff',
            border: isFullyAccredited ? '1.5px solid #10b981' : '1.5px solid #38bdf8',
            borderRadius: '14px',
            padding: '14px 16px',
            marginBottom: '16px',
            animation: 'fadeIn 0.2s ease-out'
          }}>
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', fontWeight: 800, color: isFullyAccredited ? '#047857' : '#0369a1', fontSize: '0.86rem', marginBottom: '4px' }}>
              <span>🛡️ Rol: {isCoordinadorDistrital ? 'Coordinador de Distritos' : (isCoordinadorZonal ? 'Coordinador Zonal' : 'Coordinador de Local')}</span>
            </div>
            <div style={{ fontSize: '0.78rem', color: isFullyAccredited ? '#065f46' : '#334155', lineHeight: 1.45 }}>
              {isFullyAccredited ? (
                <>
                  ✅ <strong>¡Evaluación Aprobada!</strong> Ya tienes habilitado el acceso a tu Panel de Control (Dashboard) para monitorear {isCoordinadorDistrital ? `tu distrito asignado (${distrito})` : (isCoordinadorZonal ? `tu zona (${localAsig}) en ${distrito}` : `tu colegio (${localAsig}) en ${distrito}`)}.
                </>
              ) : (
                <>
                  📌 Para habilitar el acceso a tu <strong>Dashboard</strong> , debes completar la capacitación y <strong>aprobar la evaluación</strong>.
                </>
              )}
            </div>

            {isFullyAccredited && onGoToDashboard && (
              <button
                type="button"
                onClick={onGoToDashboard}
                style={{
                  width: '100%',
                  marginTop: '10px',
                  padding: '10px 16px',
                  borderRadius: '10px',
                  border: 'none',
                  background: '#10b981',
                  color: '#ffffff',
                  fontWeight: 900,
                  fontSize: '0.88rem',
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                  transition: 'all 0.15s ease'
                }}
              >
                <span>🚀 {isCoordinadorDistrital ? 'Ir a mi Dashboard Distrital' : 'Ir a mi Dashboard de Coordinador'}</span>
                <ChevronRight className="w-4 h-4" />
              </button>
            )}
          </div>
        )}

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
            {isCoordinadorLocal && (
              <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '16px', fontSize: '0.78rem', fontWeight: 800 }}>
                Colegio: {localAsig}
              </span>
            )}
            {isCoordinadorZonal && (
              <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '16px', fontSize: '0.78rem', fontWeight: 800 }}>
                Zona: {localAsig.split(',').filter(Boolean).length} colegios
              </span>
            )}
            {!isCoordinadorDistrital && !isCoordinadorLocal && !isCoordinadorZonal && (
              <span style={{ background: '#e0f2fe', color: '#0369a1', padding: '4px 12px', borderRadius: '16px', fontSize: '0.78rem', fontWeight: 800 }}>
                Mesa: {mesa}
              </span>
            )}
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
