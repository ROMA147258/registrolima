import React, { useState } from 'react';
import { LogOut, Film, FileText, Lock, CheckCircle2, ChevronRight, Award, MapPin } from 'lucide-react';
import { useAuth } from '../../context/AuthContext.jsx';
import { VideoModal } from '../../components/modals/VideoModal.jsx';
import { PdfModal } from '../../components/modals/PdfModal.jsx';
import { QuizModal } from '../../components/modals/QuizModal.jsx';
import { CertificateModal } from '../../components/modals/CertificateModal.jsx';
import { api } from '../../services/api.js';

export function TrainingView({ onGoToDashboard }) {
  const { user, logout, updateUserTraining, isCoordinadorLocal, isCoordinadorZonal, isCoordinadorDistrital } = useAuth();
  const [activeModal, setActiveModal] = useState(null);

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
                ? 'Evaluación y Acreditación de Coordinador Distrital'
                : (isCoordinadorZonal
                  ? 'Evaluación y Acreditación de Coordinador Zonal'
                  : (isCoordinadorLocal ? 'Evaluación y Acreditación de Personero de Centro de Votación' : 'Ficha de Capacitación de Personeros'))}
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
            <div style={{ display: 'flex', alignItems: 'center', gap: '8px', marginBottom: '6px' }}>
              <span style={{ fontSize: '1.1rem' }}>🏛️</span>
              <strong style={{ fontSize: '0.92rem', color: isFullyAccredited ? '#065f46' : '#0369a1' }}>
                {isCoordinadorDistrital ? 'Panel de Coordinador Distrital' : (isCoordinadorZonal ? 'Panel de Coordinador Zonal' : 'Panel de Personero de Centro de Votación')}
              </strong>
            </div>
            <div style={{ fontSize: '0.78rem', color: isFullyAccredited ? '#047857' : '#0284c7', lineHeight: 1.4, display: 'flex', flexDirection: 'column', gap: '4px' }}>
              <span>📍 Ámbito: <strong>{distrito}</strong> {localAsig !== 'Por Asignar' && !isCoordinadorDistrital ? `• ${localAsig}` : ''}</span>
              <span>🛡️ Rol: {isCoordinadorDistrital ? 'Coordinador Distrital' : (isCoordinadorZonal ? 'Coordinador Zonal' : 'Personero de Centro de Votación')}</span>
              {isFullyAccredited ? (
                <span style={{ marginTop: '4px', color: '#16a34a', fontWeight: 700 }}>
                  ✅ <strong>¡Evaluación Aprobada!</strong> Ya tienes habilitado el acceso a tu Panel de Control (Dashboard) para monitorear {isCoordinadorDistrital ? `tu distrito asignado (${distrito})` : (isCoordinadorZonal ? `tu zona (${localAsig}) en ${distrito}` : `tu centro de votación (${localAsig}) en ${distrito}`)}.
                </span>
              ) : (
                <span style={{ marginTop: '4px', color: '#0369a1', fontWeight: 600 }}>
                  ℹ️ Completa la revisión de los 2 videos, la cartilla y aprueba el cuestionario para habilitar el botón de ingreso al Dashboard y obtener tu Certificado Oficial.
                </span>
              )}
            </div>
          </div>
        )}

        {/* Tarjeta de Datos del Personero */}
        <div style={{
          background: '#f8fafc',
          borderRadius: '14px',
          padding: '16px',
          border: '1px solid #e2e8f0',
          marginBottom: '20px'
        }}>
          <div style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', marginBottom: '8px' }}>
            {personero}
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '8px', fontSize: '0.78rem', color: '#64748b' }}>
            <div>DNI: <strong style={{ color: '#0f172a' }}>{dni}</strong></div>
            <div>Distrito: <strong style={{ color: '#0f172a' }}>{distrito}</strong></div>
            <div>Centro: <strong style={{ color: '#0f172a' }}>{localAsig}</strong></div>
            <div>Mesa: <strong style={{ color: '#0f172a' }}>{mesa}</strong></div>
          </div>
        </div>

        {/* Botón de Acceso al Dashboard para Coordinadores */}
        {isAnyCoordinador && (
          <div style={{ marginBottom: '20px' }}>
            {isFullyAccredited ? (
              <button
                onClick={onGoToDashboard}
                style={{
                  width: '100%',
                  padding: '14px 20px',
                  borderRadius: '12px',
                  border: 'none',
                  background: 'linear-gradient(90deg, #0284c7, #0369a1)',
                  color: '#ffffff',
                  fontSize: '0.98rem',
                  fontWeight: 900,
                  cursor: 'pointer',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  gap: '10px',
                  boxShadow: '0 4px 14px rgba(2, 132, 199, 0.4)',
                  transition: 'all 0.2s ease'
                }}
              >
                <span>📊 Ingresar al Dashboard de Coordinación ({isCoordinadorDistrital ? 'Distrital' : (isCoordinadorZonal ? 'Zonal' : 'Centro')})</span>
                <ChevronRight className="w-5 h-5" />
              </button>
            ) : (
              <div style={{
                background: '#f1f5f9',
                border: '1.5px dashed #cbd5e1',
                borderRadius: '12px',
                padding: '12px 16px',
                display: 'flex',
                alignItems: 'center',
                gap: '10px',
                color: '#64748b'
              }}>
                <Lock className="w-5 h-5 flex-shrink-0 text-slate-400" />
                <div style={{ fontSize: '0.78rem', lineHeight: 1.35 }}>
                  <strong style={{ display: 'block', color: '#475569' }}>Dashboard de Coordinación Bloqueado</strong>
                  Debes completar los 2 videos, la cartilla y aprobar la evaluación para acceder al panel distrital/local.
                </div>
              </div>
            )}
          </div>
        )}

        {/* Bloques de Indicadores de Progreso con Puntos Visuales */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '10px', marginBottom: '20px' }}>
          
          {/* Visualizaciones de Video con Puntos */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Visualizaciones de Video</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'rgb(14, 165, 233)' }}>{videoCount}/2</div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: videoCount >= 1 ? 'rgb(14, 165, 233)' : '#cbd5e1', boxShadow: videoCount >= 1 ? '0 2px 6px rgba(14, 165, 233, 0.4)' : 'none', transition: 'all 0.2s ease' }}></div>
              <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: videoCount >= 2 ? 'rgb(14, 165, 233)' : '#cbd5e1', boxShadow: videoCount >= 2 ? '0 2px 6px rgba(14, 165, 233, 0.4)' : 'none', transition: 'all 0.2s ease' }}></div>
            </div>
          </div>

          {/* Lecturas de PDF con Puntos */}
          <div style={{ background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '12px', padding: '14px 16px', display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
            <div>
              <div style={{ fontSize: '0.78rem', color: '#64748b', fontWeight: 600 }}>Lecturas de Cartilla PDF</div>
              <div style={{ fontSize: '1.25rem', fontWeight: 900, color: 'rgb(14, 165, 233)' }}>{pdfCount}/2</div>
            </div>
            <div style={{ display: 'flex', gap: '6px' }}>
              <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: pdfCount >= 1 ? 'rgb(14, 165, 233)' : '#cbd5e1', boxShadow: pdfCount >= 1 ? '0 2px 6px rgba(14, 165, 233, 0.4)' : 'none', transition: 'all 0.2s ease' }}></div>
              <div style={{ width: '14px', height: '14px', borderRadius: '50%', background: pdfCount >= 2 ? 'rgb(14, 165, 233)' : '#cbd5e1', boxShadow: pdfCount >= 2 ? '0 2px 6px rgba(14, 165, 233, 0.4)' : 'none', transition: 'all 0.2s ease' }}></div>
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

        {/* Lista de Módulos de Capacitación */}
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

          {/* 2. Leer Cartilla del Personero ERM 2026 */}
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
              <div style={{ fontSize: '0.95rem', fontWeight: 800, color: '#0f172a' }}>Leer Cartilla del Personero ERM 2026</div>
              <div style={{ fontSize: '0.75rem', color: '#64748b' }}>Leer la cartilla instructiva oficial (15 secciones y guía completa)</div>
            </div>
            {isPdfDone ? <CheckCircle2 className="w-5 h-5 text-emerald-500" /> : <ChevronRight className="w-5 h-5 text-slate-400" />}
          </div>

          {/* 3. Cuestionario de Preguntas (Siempre Visible) */}
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
            {isQuizPassed && <CheckCircle2 className="w-5 h-5 text-emerald-500" />}
          </div>

          {/* 4. Certificado Oficial de Acreditación (Desbloqueado al Aprobar 5/5) */}
          <div
            onClick={() => { if (isQuizPassed) setActiveModal('certificate'); }}
            style={{
              background: isQuizPassed ? 'linear-gradient(135deg, #f0fdf4, #ecfdf5)' : '#f1f5f9',
              border: isQuizPassed ? '2px solid #10b981' : '1px solid #e2e8f0',
              borderRadius: '14px',
              padding: '16px',
              display: 'flex',
              alignItems: 'center',
              gap: '14px',
              cursor: isQuizPassed ? 'pointer' : 'not-allowed',
              opacity: isQuizPassed ? 1 : 0.85,
              boxShadow: isQuizPassed ? '0 4px 15px rgba(16, 185, 129, 0.2)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{
              width: '42px',
              height: '42px',
              borderRadius: '10px',
              background: isQuizPassed ? '#10b981' : '#e2e8f0',
              color: isQuizPassed ? '#ffffff' : '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Award className="w-6 h-6" />
            </div>
            <div style={{ flex: 1 }}>
              <div style={{ fontSize: '0.95rem', fontWeight: 900, color: isQuizPassed ? '#065f46' : '#0f172a' }}>
                Certificado Oficial de Acreditación
              </div>
              <div style={{ fontSize: '0.75rem', color: isQuizPassed ? '#047857' : '#64748b', fontWeight: isQuizPassed ? 700 : 500 }}>
                {isQuizPassed ? '🎓 ¡Desbloqueado! Clic para ver e imprimir tu certificado oficial' : '🔒 Bloqueado (Se desbloquea al aprobar la evaluación con 5/5)'}
              </div>
            </div>
            {isQuizPassed ? <ChevronRight className="w-5 h-5 text-emerald-600" /> : <Lock className="w-5 h-5 text-slate-400" />}
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
          onViewCertificate={() => {
            setActiveModal('certificate');
          }}
        />
      )}

      {activeModal === 'certificate' && (
        <CertificateModal
          user={user}
          onClose={() => setActiveModal(null)}
        />
      )}
    </div>
  );
}
