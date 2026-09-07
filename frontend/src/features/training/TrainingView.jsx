import React, { useState } from 'react';
import { LogOut, Film, FileText, Lock, CheckCircle2, ChevronRight, Award, MapPin, Shield, Check } from 'lucide-react';
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
  const mesa = user?.['Mesa Asignada'] || user?.mesaAsignada || user?.['Mesa de Sufragio'] || user?.mesaDeSufragio || user?.mesa_asignada || (isAnyCoordinador ? 'No aplica (Coordinador)' : 'No Asignada');

  const rolTitle = isCoordinadorDistrital
    ? 'Coordinador Distrital'
    : (isCoordinadorLocal || isCoordinadorZonal ? 'Personero de Centro de Votación' : 'Personero de Mesa');

  return (
    <div style={{
      minHeight: '100vh',
      background: '#c1e5f9',
      display: 'flex',
      justifyContent: 'center',
      alignItems: 'center',
      padding: '16px 12px',
      fontFamily: "'Outfit', 'Montserrat', sans-serif"
    }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '520px',
        padding: '20px 18px',
        boxShadow: '0 16px 36px rgba(0, 0, 0, 0.08)',
        border: '1px solid #cbd5e1'
      }}>
        
        {/* Cabecera Compacta */}
        <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '14px' }}>
          <div>
            <h1 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#0f172a', margin: 0, lineHeight: 1.1 }}>
              Capacítate
            </h1>
            <span style={{ fontSize: '0.76rem', color: '#64748b', fontWeight: 600 }}>
              {isAnyCoordinador ? `Acreditación de ${rolTitle}` : 'Ficha de Capacitación Electoral'}
            </span>
          </div>

          <button
            onClick={logout}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px',
              padding: '5px 12px',
              borderRadius: '16px',
              border: '1px solid #fecaca',
              background: '#fef2f2',
              color: '#ef4444',
              fontSize: '0.78rem',
              fontWeight: 700,
              cursor: 'pointer'
            }}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Salir</span>
          </button>
        </div>

        {/* Tarjeta Unificada y Compacta de Identidad y Ámbito */}
        <div style={{
          background: '#f8fafc',
          borderRadius: '12px',
          padding: '12px 14px',
          border: isAnyCoordinador ? (isFullyAccredited ? '1.5px solid #86efac' : '1.5px solid #bae6fd') : '1px solid #e2e8f0',
          marginBottom: '14px',
          display: 'flex',
          flexDirection: 'column',
          gap: '8px'
        }}>
          {/* Fila Superior: Nombre + Badge Rol */}
          <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', gap: '8px', flexWrap: 'wrap' }}>
            <div style={{ fontSize: '0.98rem', fontWeight: 900, color: '#0f172a' }}>
              {personero}
            </div>
            <span style={{
              background: isAnyCoordinador ? (isFullyAccredited ? '#dcfce7' : '#e0f2fe') : '#f1f5f9',
              color: isAnyCoordinador ? (isFullyAccredited ? '#15803d' : '#0369a1') : '#475569',
              fontSize: '0.7rem',
              fontWeight: 800,
              padding: '2px 8px',
              borderRadius: '6px',
              display: 'inline-flex',
              alignItems: 'center',
              gap: '4px'
            }}>
              <span>{isAnyCoordinador ? '🛡️' : '👤'}</span>
              <span>{rolTitle}</span>
            </span>
          </div>

          {/* Grid de 4 Datos en 2 Columnas Compacto */}
          <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '4px 10px', fontSize: '0.75rem', color: '#64748b' }}>
            <div>DNI: <strong style={{ color: '#0f172a' }}>{dni}</strong></div>
            <div>Distrito: <strong style={{ color: '#0f172a' }}>{distrito}</strong></div>
            <div style={{ gridColumn: 'span 2', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={localAsig}>
              Centro: <strong style={{ color: '#0f172a' }}>{localAsig}</strong>
            </div>
            {!isAnyCoordinador && (
              <div>Mesa: <strong style={{ color: '#0f172a' }}>{mesa}</strong></div>
            )}
          </div>

          {/* Estado de Acceso para Coordinadores (Compacto) */}
          {isAnyCoordinador && (
            <div style={{ marginTop: '2px' }}>
              {isFullyAccredited ? (
                <button
                  onClick={onGoToDashboard}
                  style={{
                    width: '100%',
                    padding: '9px 14px',
                    borderRadius: '8px',
                    border: 'none',
                    background: 'linear-gradient(90deg, #0284c7, #0369a1)',
                    color: '#ffffff',
                    fontSize: '0.86rem',
                    fontWeight: 800,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '6px',
                    boxShadow: '0 2px 8px rgba(2, 132, 199, 0.35)',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <span>📊 Ingresar al Dashboard de Coordinación</span>
                  <ChevronRight className="w-4 h-4" />
                </button>
              ) : (
                <div style={{
                  background: '#f1f5f9',
                  border: '1px dashed #cbd5e1',
                  borderRadius: '8px',
                  padding: '6px 10px',
                  display: 'flex',
                  alignItems: 'center',
                  gap: '6px',
                  fontSize: '0.71rem',
                  color: '#64748b'
                }}>
                  <Lock className="w-3.5 h-3.5 flex-shrink-0 text-amber-600" />
                  <span>
                    <strong style={{ color: '#475569' }}>Dashboard Bloqueado:</strong> Aprueba los 2 videos, la cartilla y la evaluación para habilitar el panel.
                  </span>
                </div>
              )}
            </div>
          )}
        </div>

        {/* Indicadores de Progreso en 3 Columnas Horizontales (Súper Compacto) */}
        <div style={{
          display: 'grid',
          gridTemplateColumns: '1fr 1fr 1fr',
          gap: '8px',
          marginBottom: '14px'
        }}>
          {/* 1. Videos */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '8px 10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '4px'
          }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>🎬 Videos</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: '1rem', color: '#0284c7', fontWeight: 900 }}>{videoCount}/2</strong>
              <div style={{ display: 'flex', gap: '3px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: videoCount >= 1 ? '#0284c7' : '#cbd5e1' }}></div>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: videoCount >= 2 ? '#0284c7' : '#cbd5e1' }}></div>
              </div>
            </div>
          </div>

          {/* 2. Cartilla PDF */}
          <div style={{
            background: '#f8fafc',
            border: '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '8px 10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '4px'
          }}>
            <span style={{ fontSize: '0.7rem', color: '#64748b', fontWeight: 700 }}>📄 Cartilla</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: '1rem', color: '#0284c7', fontWeight: 900 }}>{pdfCount}/2</strong>
              <div style={{ display: 'flex', gap: '3px' }}>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: pdfCount >= 1 ? '#0284c7' : '#cbd5e1' }}></div>
                <div style={{ width: '8px', height: '8px', borderRadius: '50%', background: pdfCount >= 2 ? '#0284c7' : '#cbd5e1' }}></div>
              </div>
            </div>
          </div>

          {/* 3. Evaluación */}
          <div style={{
            background: isQuizPassed ? '#f0fdf4' : '#f8fafc',
            border: isQuizPassed ? '1px solid #bbf7d0' : '1px solid #e2e8f0',
            borderRadius: '10px',
            padding: '8px 10px',
            display: 'flex',
            flexDirection: 'column',
            justifyContent: 'space-between',
            gap: '4px'
          }}>
            <span style={{ fontSize: '0.7rem', color: isQuizPassed ? '#15803d' : '#64748b', fontWeight: 700 }}>📝 Evaluación</span>
            <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center' }}>
              <strong style={{ fontSize: '0.84rem', color: isQuizPassed ? '#16a34a' : '#d97706', fontWeight: 900 }}>
                {isQuizPassed ? 'Aprobado' : 'Pendiente'}
              </strong>
              {isQuizPassed && <Check className="w-3.5 h-3.5 text-emerald-600" />}
            </div>
          </div>
        </div>

        {/* Lista de Módulos de Capacitación Compacta */}
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
          
          {/* 1. Ver Video Tutorial */}
          <div
            onClick={() => setActiveModal('video')}
            style={{
              background: '#f8fafc',
              border: isVideoDone ? '1px solid #86efac' : '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: isVideoDone ? '#dcfce7' : '#e0f2fe',
              color: isVideoDone ? '#16a34a' : '#0284c7',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Film className="w-4 h-4" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>Ver Video Tutorial</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Video instructivo de conteo y actas</div>
            </div>
            {isVideoDone ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
          </div>

          {/* 2. Leer Cartilla del Personero ERM 2026 */}
          <div
            onClick={() => setActiveModal('pdf')}
            style={{
              background: '#f8fafc',
              border: isPdfDone ? '1px solid #86efac' : '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: isPdfDone ? '#dcfce7' : '#f1f5f9',
              color: isPdfDone ? '#16a34a' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <FileText className="w-4 h-4" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>Leer Cartilla del Personero ERM 2026</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>Cartilla instructiva oficial (15 secciones)</div>
            </div>
            {isPdfDone ? <CheckCircle2 className="w-4 h-4 text-emerald-500" /> : <ChevronRight className="w-4 h-4 text-slate-400" />}
          </div>

          {/* 3. Cuestionario de Preguntas */}
          <div
            onClick={() => { if (canTakeQuiz) setActiveModal('quiz'); }}
            style={{
              background: canTakeQuiz ? '#f8fafc' : '#f1f5f9',
              border: isQuizPassed ? '1px solid #86efac' : '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: canTakeQuiz ? 'pointer' : 'not-allowed',
              opacity: canTakeQuiz ? 1 : 0.8,
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: isQuizPassed ? '#dcfce7' : (canTakeQuiz ? '#fef3c7' : '#e2e8f0'),
              color: isQuizPassed ? '#16a34a' : (canTakeQuiz ? '#d97706' : '#94a3b8'),
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              {isQuizPassed ? <CheckCircle2 className="w-4 h-4" /> : (canTakeQuiz ? <Award className="w-4 h-4" /> : <Lock className="w-4 h-4" />)}
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.86rem', fontWeight: 800, color: '#0f172a' }}>Cuestionario de Preguntas</div>
              <div style={{ fontSize: '0.7rem', color: '#64748b' }}>
                {canTakeQuiz ? (isQuizPassed ? 'Aprobado con 5/5' : 'Desbloqueado (Rendir 5 preguntas)') : 'Bloqueado (Ver 2 videos y 2 PDFs)'}
              </div>
            </div>
            {isQuizPassed && <CheckCircle2 className="w-4 h-4 text-emerald-500" />}
          </div>

          {/* 4. Certificado Oficial de Acreditación */}
          <div
            onClick={() => { if (isQuizPassed) setActiveModal('certificate'); }}
            style={{
              background: isQuizPassed ? 'linear-gradient(135deg, #f0fdf4, #ecfdf5)' : '#f1f5f9',
              border: isQuizPassed ? '1.5px solid #10b981' : '1px solid #e2e8f0',
              borderRadius: '10px',
              padding: '10px 12px',
              display: 'flex',
              alignItems: 'center',
              gap: '10px',
              cursor: isQuizPassed ? 'pointer' : 'not-allowed',
              opacity: isQuizPassed ? 1 : 0.8,
              boxShadow: isQuizPassed ? '0 2px 10px rgba(16, 185, 129, 0.2)' : 'none',
              transition: 'all 0.15s ease'
            }}
          >
            <div style={{
              width: '34px',
              height: '34px',
              borderRadius: '8px',
              background: isQuizPassed ? '#10b981' : '#e2e8f0',
              color: isQuizPassed ? '#ffffff' : '#94a3b8',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0
            }}>
              <Award className="w-4 h-4" />
            </div>
            <div style={{ flex: 1, minWidth: 0 }}>
              <div style={{ fontSize: '0.86rem', fontWeight: 900, color: isQuizPassed ? '#065f46' : '#0f172a' }}>
                Certificado Oficial de Acreditación
              </div>
              <div style={{ fontSize: '0.7rem', color: isQuizPassed ? '#047857' : '#64748b', fontWeight: isQuizPassed ? 700 : 500 }}>
                {isQuizPassed ? '🎓 ¡Desbloqueado! Clic para ver e imprimir' : '🔒 Se desbloquea al aprobar la evaluación'}
              </div>
            </div>
            {isQuizPassed ? <ChevronRight className="w-4 h-4 text-emerald-600" /> : <Lock className="w-4 h-4 text-slate-400" />}
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
