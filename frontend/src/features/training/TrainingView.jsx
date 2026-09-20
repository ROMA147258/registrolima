import React, { useState, useRef, useEffect } from 'react';
import {
  LogOut, Play, FileText, Lock, CheckCircle2, ChevronRight,
  Award, Clock, ShieldAlert, Download, RotateCcw, User, BookOpen, AlertCircle
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { useAuth } from '../../context/AuthContext.jsx';
import { CertificateModal } from '../../components/modals/CertificateModal.jsx';
import { getRandomQuestions } from '../../constants/quizData.js';
import { api } from '../../services/api.js';

export function TrainingView({ onGoToDashboard }) {
  const { user, logout, updateUserTraining, isCoordinadorLocal, isCoordinadorZonal, isCoordinadorDistrital } = useAuth();
  
  // Modal de Constancia
  const [showCertificate, setShowCertificate] = useState(false);

  // Estados de progreso del usuario
  const rawVideo = parseInt(user?.Video ?? user?.video ?? user?.['Videos Completados'] ?? user?.videosCompletados ?? user?.videos_completados ?? 0, 10);
  const rawPdf = parseInt(user?.PDF ?? user?.pdf ?? user?.['PDFs Completados'] ?? user?.pdfsCompletados ?? user?.pdfs_completados ?? 0, 10);
  const quizStatus = String(user?.Preguntas ?? user?.preguntas ?? user?.['Evaluación Estado'] ?? user?.evaluacionEstado ?? user?.evaluacion_estado ?? user?.evaluacion ?? 'Pendiente').trim();
  const credStatus = String(user?.Credenciales ?? user?.credenciales ?? user?.['Estado Credencial'] ?? user?.estadoCredencial ?? user?.estado_credencial ?? user?.estado ?? '').trim().toLowerCase();

  const isConfirmed = credStatus === 'confirmado';
  const isQuizPassed = quizStatus.toLowerCase().includes('aprob') || quizStatus.toLowerCase().includes('pasad') || isConfirmed;
  
  const videoCount = (isConfirmed || isQuizPassed) && rawVideo < 1 ? 1 : rawVideo;
  const pdfCount = (isConfirmed || isQuizPassed) && rawPdf < 1 ? 1 : rawPdf;

  const isVideoDone = videoCount >= 1 || isConfirmed || isQuizPassed;
  const isPdfDone = pdfCount >= 1 || isConfirmed || isQuizPassed;
  const canTakeQuiz = isVideoDone && isPdfDone;
  const isFullyAccredited = isConfirmed || isQuizPassed || (isVideoDone && isPdfDone && isQuizPassed);

  const isAnyCoordinador = isCoordinadorDistrital || isCoordinadorZonal || isCoordinadorLocal;

  // Paso Activo: 1 (Video) | 2 (Lectura de Cartilla) | 3 (Evaluación)
  const getInitialStep = () => {
    if (isQuizPassed) return 1;
    if (!isVideoDone) return 1;
    if (!isPdfDone) return 2;
    return 3;
  };
  const [currentStep, setCurrentStep] = useState(getInitialStep);

  // Datos del Personero
  const personero = user?.['Nombres y Apellidos'] || user?.nombresApellidos || user?.nombres_y_apellidos || 'Personero';
  const dni = user?.['D.N.I.'] || user?.DNI || user?.dni || user?.dni_numero || (user?.tokenVerificacion ? user.tokenVerificacion.split('-').pop() : '') || '--------';
  const distrito = user?.['Distrito Asignado'] || user?.distritoAsignado || user?.['Distrito donde Vota'] || user?.distritoDondeVota || user?.distrito_asignado || 'Lima';
  const localAsig = user?.['Local de Votación Asignado'] || user?.localDeVotacionAsignado || user?.['Local de Votación'] || user?.localDeVotacion || user?.local_de_votacion_asignado || 'Por Asignar';
  
  const rawMesa = user?.['Mesa Asignada'] || user?.mesaAsignada || user?.['Mesa de Sufragio'] || user?.mesaDeSufragio || user?.mesa_asignada || '';
  const showMesa = !isAnyCoordinador && rawMesa && rawMesa.trim() !== '' && rawMesa !== '-' && !rawMesa.toLowerCase().includes('no aplica') && !rawMesa.toLowerCase().includes('no asignada');

  const rolTitle = isCoordinadorDistrital
    ? 'Coordinador Distrital'
    : (isCoordinadorLocal || isCoordinadorZonal ? 'Personero de Centro de Votación' : 'Personero de Mesa');

  // Formato de nombre abreviado para header (ej: R. RODRIGUEZ)
  const getShortName = (nameStr) => {
    if (!nameStr) return 'USUARIO';
    const parts = nameStr.trim().split(/\s+/);
    if (parts.length >= 2) {
      return `${parts[0].charAt(0)}. ${parts[1]}`.toUpperCase();
    }
    return nameStr.toUpperCase();
  };

  // -------------------------------------------------------------
  // PASO 1: LÓGICA DE VIDEO (CON PROTECCIÓN ANTI-ADELANTO)
  // -------------------------------------------------------------
  const videoRef = useRef(null);
  const [videoProgress, setVideoProgress] = useState(isVideoDone ? 100 : 0);
  const [canFinishVideo, setCanFinishVideo] = useState(isVideoDone);
  const [videoWarning, setVideoWarning] = useState(null);
  const [savingVideo, setSavingVideo] = useState(false);
  const maxTimeRef = useRef(0);

  const handleTimeUpdate = () => {
    if (!videoRef.current) return;
    const { currentTime, duration } = videoRef.current;

    // Impedir adelantar: si el tiempo actual salta hacia adelante más de lo reproducido continuamente
    if (currentTime > maxTimeRef.current + 1.2) {
      videoRef.current.currentTime = maxTimeRef.current;
      setVideoWarning('⚠️ Debe ver el video de forma continua sin adelantar.');
      setTimeout(() => setVideoWarning(null), 3500);
      return;
    }

    if (currentTime > maxTimeRef.current) {
      maxTimeRef.current = currentTime;
    }

    if (videoRef.current.playbackRate !== 1.0) {
      videoRef.current.playbackRate = 1.0;
    }

    if (duration > 0) {
      const pct = Math.min(100, Math.round((maxTimeRef.current / duration) * 100));
      setVideoProgress(pct);
      if (pct >= 95 && !canFinishVideo) {
        setCanFinishVideo(true);
      }
    }
  };

  const handleSeeking = () => {
    if (!videoRef.current) return;
    if (videoRef.current.currentTime > maxTimeRef.current + 0.5) {
      videoRef.current.currentTime = maxTimeRef.current;
      setVideoWarning('⚠️ No está permitido adelantar el video.');
      setTimeout(() => setVideoWarning(null), 3500);
    }
  };

  const handleSeeked = () => {
    if (!videoRef.current) return;
    if (videoRef.current.currentTime > maxTimeRef.current + 0.5) {
      videoRef.current.currentTime = maxTimeRef.current;
    }
  };

  const handleVideoEnded = () => {
    setCanFinishVideo(true);
    setVideoProgress(100);
  };

  const handleNextFromVideo = async () => {
    if (!canFinishVideo || savingVideo) return;
    setSavingVideo(true);
    try {
      const dniVal = user?.['D.N.I.'] || user?.DNI || user?.dni;
      const res = await api.updateProgress(dniVal, 'video', 0);
      updateUserTraining(res);
      confetti({ particleCount: 45, spread: 65, origin: { y: 0.6 } });
      setCurrentStep(2);
    } catch (err) {
      console.error('Error guardando video:', err);
      setCurrentStep(2);
    } finally {
      setSavingVideo(false);
    }
  };

  // -------------------------------------------------------------
  // PASO 2: LÓGICA DE PDF (TEMPORIZADOR 1 MINUTO)
  // -------------------------------------------------------------
  const [timeLeft, setTimeLeft] = useState(isPdfDone ? 0 : 60);
  const [canFinishPdf, setCanFinishPdf] = useState(isPdfDone);
  const [savingPdf, setSavingPdf] = useState(false);
  const pdfUrl = '/manuals/Cartilla_del_Personero_ERM_2026.pdf';

  useEffect(() => {
    if (currentStep !== 2 || isPdfDone) return;
    if (timeLeft > 0) {
      const timer = setTimeout(() => {
        setTimeLeft(prev => prev - 1);
      }, 1000);
      return () => clearTimeout(timer);
    } else {
      setCanFinishPdf(true);
    }
  }, [currentStep, timeLeft, isPdfDone]);

  const formatTime = (secs) => {
    const m = Math.floor(secs / 60);
    const s = secs % 60;
    return `${m < 10 ? '0' : ''}${m}:${s < 10 ? '0' : ''}${s}`;
  };

  const handleNextFromPdf = async () => {
    if (!canFinishPdf || savingPdf) return;
    setSavingPdf(true);
    try {
      const dniVal = user?.['D.N.I.'] || user?.DNI || user?.dni;
      const res = await api.updateProgress(dniVal, 'pdf', 0);
      updateUserTraining(res);
      confetti({ particleCount: 50, spread: 75, origin: { y: 0.6 } });
      setCurrentStep(3);
    } catch (err) {
      console.error('Error guardando PDF:', err);
      setCurrentStep(3);
    } finally {
      setSavingPdf(false);
    }
  };

  // -------------------------------------------------------------
  // PASO 3: LÓGICA DE EVALUACIÓN (5 PREGUNTAS)
  // -------------------------------------------------------------
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [hasQuizPassed, setHasQuizPassed] = useState(isQuizPassed);
  const scrollQuizRef = useRef(null);

  const loadRandomQuestions = () => {
    setQuestions(getRandomQuestions(5));
    setAnswers({});
    setSubmittedQuiz(false);
    setQuizScore(0);
    if (scrollQuizRef.current) {
      scrollQuizRef.current.scrollTop = 0;
    }
  };

  useEffect(() => {
    loadRandomQuestions();
  }, []);

  const totalAnswered = Object.keys(answers).length;
  const isAllAnswered = totalAnswered === 5;

  const handleSelectAnswer = (qIdx, optIdx) => {
    if (submittedQuiz) return;
    setAnswers(prev => ({ ...prev, [qIdx]: optIdx }));
  };

  const handleSubmitQuiz = async () => {
    if (!isAllAnswered) return;

    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.answer) {
        correctCount++;
      }
    });

    setQuizScore(correctCount);
    setSubmittedQuiz(true);

    if (correctCount === 5) {
      setHasQuizPassed(true);
      confetti({ particleCount: 140, spread: 90, origin: { y: 0.5 } });
      try {
        setSavingQuiz(true);
        const dniVal = user?.['D.N.I.'] || user?.DNI || user?.dni;
        const res = await api.updateProgress(dniVal, 'quiz', 0);
        updateUserTraining(res);
      } catch (err) {
        console.error('Error guardando evaluación:', err);
      } finally {
        setSavingQuiz(false);
      }
    } else {
      if (scrollQuizRef.current) {
        scrollQuizRef.current.scrollTop = 0;
      }
    }
  };

  return (
    <div className="onpeduca-portal" style={{
      minHeight: '100vh',
      background: '#f8fafc',
      color: '#1e293b',
      fontFamily: "'Outfit', 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif",
      display: 'flex',
      flexDirection: 'column'
    }}>
      <style>{`
        .onpeduca-grid {
          display: grid;
          grid-template-columns: 240px 1fr 260px;
          gap: 20px;
          max-width: 1400px;
          width: 100%;
          margin: 0 auto;
          padding: 20px 24px;
          flex: 1;
        }
        @media (max-width: 1120px) {
          .onpeduca-grid {
            grid-template-columns: 220px 1fr;
            padding: 16px;
          }
          .onpeduca-right-col {
            grid-column: span 2;
          }
        }
        @media (max-width: 768px) {
          .onpeduca-grid {
            display: flex;
            flex-direction: column;
            padding: 12px;
            gap: 16px;
          }
          .onpeduca-right-col {
            grid-column: auto;
          }
        }
        .portal-step-item {
          transition: all 0.2s ease;
          cursor: pointer;
        }
        .portal-step-item:hover {
          filter: brightness(0.96);
        }
        .quiz-option-btn:hover {
          border-color: #0284c7 !important;
          background-color: #f0f9ff !important;
        }
      `}</style>

      {/* =========================================================================
          TOP NAVBAR: CAPACÍTATE + CERRAR SESIÓN
          ========================================================================= */}
      <header style={{
        background: '#ffffff',
        borderBottom: '1.5px solid #e2e8f0',
        padding: '10px 24px',
        display: 'flex',
        alignItems: 'center',
        justifyContent: 'space-between',
        flexWrap: 'wrap',
        gap: '12px',
        boxShadow: '0 1px 4px rgba(0,0,0,0.04)',
        position: 'sticky',
        top: 0,
        zIndex: 50
      }}>
        {/* Marca CAPACÍTATE e Institucional */}
        <div style={{ display: 'flex', alignItems: 'center', gap: '14px' }}>
          <img 
            src="/images/logo_somos_peru.svg" 
            alt="Somos Perú" 
            style={{ height: '38px', width: 'auto', display: 'block' }}
            onError={(e) => { e.currentTarget.style.display = 'none'; }}
          />
          <div style={{ display: 'flex', flexDirection: 'column' }}>
            <span style={{ fontSize: '1.4rem', fontWeight: 900, color: '#002B66', letterSpacing: '-0.02em', lineHeight: 1.1 }}>
              Capacítate
            </span>
          </div>
        </div>

        {/* Botón Cerrar Sesión (sin el nombre al costado) */}
        <div>
          <button
            onClick={logout}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '5px',
              padding: '6px 14px',
              borderRadius: '8px',
              border: '1px solid #fecaca',
              background: '#ffffff',
              color: '#dc2626',
              fontSize: '0.76rem',
              fontWeight: 800,
              cursor: 'pointer',
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#fef2f2'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#ffffff'; }}
          >
            <LogOut className="w-3.5 h-3.5" />
            <span>Cerrar sesión</span>
          </button>
        </div>
      </header>

      {/* =========================================================================
          CONTENEDOR PRINCIPAL CON 3 COLUMNAS (ADAPTIVE DESIGN)
          ========================================================================= */}
      <main className="onpeduca-grid">
        
        {/* -------------------------------------------------------------
            COLUMNA IZQUIERDA: MENÚ PRINCIPAL (MATCH GUIA.PNG)
            ------------------------------------------------------------- */}
        <aside style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Tarjeta del Menú de Pasos */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}>
            
            {/* Ilustración Superior de Mesa de Trabajo */}
            <div style={{
              background: 'linear-gradient(135deg, #e0f2fe, #f0fdf4)',
              padding: '16px 12px 12px 12px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              borderBottom: '1px solid #e2e8f0'
            }}>
              <svg viewBox="0 0 160 80" style={{ width: '130px', height: 'auto', display: 'block' }}>
                <rect x="25" y="45" width="110" height="24" rx="4" fill="#cbd5e1" />
                <rect x="30" y="38" width="100" height="10" rx="3" fill="#0284c7" opacity="0.8" />
                {/* Personajes simplificados */}
                <circle cx="50" cy="24" r="10" fill="#0369a1" />
                <path d="M40 45 C40 34 60 34 60 45 Z" fill="#0369a1" />
                <circle cx="80" cy="20" r="11" fill="#059669" />
                <path d="M68 45 C68 32 92 32 92 45 Z" fill="#059669" />
                <circle cx="110" cy="24" r="10" fill="#d97706" />
                <path d="M100 45 C100 34 120 34 120 45 Z" fill="#d97706" />
                {/* Cartillas / laptop en la mesa */}
                <rect x="70" y="32" width="20" height="12" rx="2" fill="#ffffff" stroke="#94a3b8" strokeWidth="1" />
              </svg>
            </div>

            {/* Título de Menú Principal */}
            <div style={{ padding: '12px 16px 8px 16px' }}>
              <h2 style={{ fontSize: '0.88rem', fontWeight: 900, color: '#002B66', textTransform: 'uppercase', margin: 0, letterSpacing: '0.5px' }}>
                Menú principal
              </h2>
            </div>

            {/* Lista de Pasos del Menú */}
            <div style={{ display: 'flex', flexDirection: 'column', gap: '4px', padding: '0 10px 14px 10px' }}>
              
              {/* Paso 1: Ver curso (Píldora Activa Cyan/Verde en guia.png) */}
              <div
                onClick={() => setCurrentStep(1)}
                className="portal-step-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  background: currentStep === 1
                    ? '#0284c7'
                    : (isVideoDone || canFinishVideo ? '#f0fdf4' : '#ffffff'),
                  color: currentStep === 1
                    ? '#ffffff'
                    : (isVideoDone || canFinishVideo ? '#15803d' : '#475569'),
                  border: currentStep === 1
                    ? '1.5px solid #0284c7'
                    : (isVideoDone || canFinishVideo ? '1px solid #bbf7d0' : '1px solid #f1f5f9'),
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  boxShadow: currentStep === 1 ? '0 4px 10px rgba(2, 132, 199, 0.25)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Play className={`w-3.5 h-3.5 ${currentStep === 1 ? 'fill-white text-white' : (isVideoDone ? 'text-emerald-600' : 'text-slate-400')}`} />
                  <span>1. Ver curso</span>
                </div>
                {isVideoDone || canFinishVideo ? (
                  <CheckCircle2 className={`w-4 h-4 ${currentStep === 1 ? 'text-white' : 'text-emerald-500'}`} />
                ) : (
                  <span style={{ fontSize: '0.7rem', opacity: 0.8 }}>▶</span>
                )}
              </div>

              {/* Paso 2: Evaluación / Cartilla */}
              <div
                onClick={() => { if (isVideoDone || canFinishVideo) setCurrentStep(2); }}
                className="portal-step-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  background: currentStep === 2
                    ? '#0284c7'
                    : (isPdfDone || canFinishPdf ? '#f0fdf4' : '#ffffff'),
                  color: currentStep === 2
                    ? '#ffffff'
                    : (isPdfDone || canFinishPdf ? '#15803d' : (isVideoDone ? '#475569' : '#94a3b8')),
                  border: currentStep === 2
                    ? '1.5px solid #0284c7'
                    : (isPdfDone || canFinishPdf ? '1px solid #bbf7d0' : '1px solid #f1f5f9'),
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  opacity: (isVideoDone || canFinishVideo) ? 1 : 0.65,
                  cursor: (isVideoDone || canFinishVideo) ? 'pointer' : 'not-allowed',
                  boxShadow: currentStep === 2 ? '0 4px 10px rgba(2, 132, 199, 0.25)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <FileText className={`w-3.5 h-3.5 ${currentStep === 2 ? 'text-white' : (isPdfDone ? 'text-emerald-600' : 'text-slate-400')}`} />
                  <span>2. Cartilla</span>
                </div>
                {isPdfDone || canFinishPdf ? (
                  <CheckCircle2 className={`w-4 h-4 ${currentStep === 2 ? 'text-white' : 'text-emerald-500'}`} />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-300" />
                )}
              </div>

              {/* Paso 3: Encuesta / Evaluación */}
              <div
                onClick={() => { if ((isVideoDone || canFinishVideo) && (isPdfDone || canFinishPdf)) setCurrentStep(3); }}
                className="portal-step-item"
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  padding: '9px 12px',
                  borderRadius: '10px',
                  background: currentStep === 3
                    ? '#0284c7'
                    : (hasQuizPassed ? '#f0fdf4' : '#ffffff'),
                  color: currentStep === 3
                    ? '#ffffff'
                    : (hasQuizPassed ? '#15803d' : (canTakeQuiz ? '#475569' : '#94a3b8')),
                  border: currentStep === 3
                    ? '1.5px solid #0284c7'
                    : (hasQuizPassed ? '1px solid #bbf7d0' : '1px solid #f1f5f9'),
                  fontSize: '0.78rem',
                  fontWeight: 800,
                  opacity: canTakeQuiz ? 1 : 0.65,
                  cursor: canTakeQuiz ? 'pointer' : 'not-allowed',
                  boxShadow: currentStep === 3 ? '0 4px 10px rgba(2, 132, 199, 0.25)' : 'none'
                }}
              >
                <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                  <Award className={`w-3.5 h-3.5 ${currentStep === 3 ? 'text-white' : (hasQuizPassed ? 'text-emerald-600' : 'text-slate-400')}`} />
                  <span>3. Evaluación</span>
                </div>
                {hasQuizPassed ? (
                  <CheckCircle2 className={`w-4 h-4 ${currentStep === 3 ? 'text-white' : 'text-emerald-500'}`} />
                ) : (
                  <Lock className="w-3.5 h-3.5 text-slate-300" />
                )}
              </div>

            </div>
          </div>

          {/* Cuadro de Aviso de Plazo (Match Exacto guia.png) */}
          <div style={{
            background: '#ffffff',
            border: '1.5px solid #cbd5e1',
            borderRadius: '14px',
            padding: '14px',
            fontSize: '0.73rem',
            lineHeight: 1.45,
            color: '#334155'
          }}>
            <p style={{ margin: 0 }}>
              Ten presente que <strong>el curso estará habilitado hasta el 03/10/2026 a las 11:59 p. m.</strong> Luego de esa fecha, ya no podrás ingresar.
            </p>
          </div>

        </aside>

        {/* -------------------------------------------------------------
            COLUMNA CENTRAL: VER CURSO / PLAYER (MATCH GUIA.PNG)
            ------------------------------------------------------------- */}
        <section style={{ display: 'flex', flexDirection: 'column', gap: '12px' }}>
          
          {/* Breadcrumb + Título + Botón Volver a Cursos */}
          <div>
            <div style={{ fontSize: '0.74rem', color: '#64748b', fontWeight: 600, marginBottom: '4px' }}>
              Personero &gt; Curso Virtual para Personeros 2026
            </div>
            
            <div style={{ display: 'flex', alignItems: 'center', justifyContent: 'space-between', gap: '12px', flexWrap: 'wrap' }}>
              <h1 style={{ fontSize: '1.5rem', fontWeight: 900, color: '#002B66', margin: 0, letterSpacing: '-0.02em' }}>
                {currentStep === 1 && 'Ver Curso'}
                {currentStep === 2 && 'Lectura de Cartilla'}
                {currentStep === 3 && 'Evaluación del Personero'}
              </h1>

              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                {currentStep > 1 && (
                  <button
                    onClick={() => setCurrentStep(prev => Math.max(1, prev - 1))}
                    style={{
                      background: '#ffffff',
                      border: '1px solid #cbd5e1',
                      color: '#475569',
                      padding: '6px 14px',
                      borderRadius: '8px',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      cursor: 'pointer'
                    }}
                  >
                    ← Anterior
                  </button>
                )}
              </div>
            </div>
          </div>

          {/* Tarjeta Principal de Contenido / Video Player */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            overflow: 'hidden',
            boxShadow: '0 4px 16px rgba(0,0,0,0.04)',
            display: 'flex',
            flexDirection: 'column'
          }}>
            
            {/* Banner Superior del Reproductor (Estilo Video Header ONPEDUCA) */}
            <div style={{
              background: '#002B66',
              color: '#ffffff',
              padding: '10px 18px',
              fontSize: '0.8rem',
              fontWeight: 800,
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              gap: '10px'
            }}>
              <span>
                {currentStep === 1 && 'Curso virtual para personeros ERM 2026 - Módulo 1 / Oficina Nacional de Procesos Electorales'}
                {currentStep === 2 && 'Cartilla Oficial del Personero Electoral ERM 2026'}
                {currentStep === 3 && 'Cuestionario de Evaluación de Conocimientos Electorales'}
              </span>
              <span style={{ fontSize: '0.7rem', color: '#93c5fd', fontWeight: 700 }}>
                {currentStep === 1 && 'Video Oficial'}
                {currentStep === 2 && 'Documento PDF'}
                {currentStep === 3 && '5 Preguntas'}
              </span>
            </div>

            {/* CONTENIDO PASO 1: VIDEO */}
            {currentStep === 1 && (
              <div style={{ padding: '16px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
                
                {videoWarning && (
                  <div style={{
                    background: '#fef2f2',
                    border: '1.5px solid #f87171',
                    color: '#b91c1c',
                    padding: '9px 14px',
                    borderRadius: '10px',
                    fontSize: '0.82rem',
                    fontWeight: 700,
                    display: 'flex',
                    alignItems: 'center',
                    gap: '8px'
                  }}>
                    <ShieldAlert className="w-4 h-4 flex-shrink-0 text-red-500" />
                    <span>{videoWarning}</span>
                  </div>
                )}

                {/* Contenedor 16:9 del Video */}
                <div style={{
                  position: 'relative',
                  width: '100%',
                  aspectRatio: '16 / 9',
                  background: '#000000',
                  borderRadius: '12px',
                  overflow: 'hidden',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <video
                    ref={videoRef}
                    playsInline
                    controls
                    controlsList="nodownload noplaybackrate"
                    disablePictureInPicture
                    preload="metadata"
                    poster="/images/IMG_5684.JPEG"
                    onTimeUpdate={handleTimeUpdate}
                    onSeeking={handleSeeking}
                    onSeeked={handleSeeked}
                    onEnded={handleVideoEnded}
                    style={{ width: '100%', height: '100%', objectFit: 'contain', outline: 'none' }}
                  >
                    <source src="/videos/IMG_5774.MP4" type="video/mp4" />
                    Tu navegador no soporta reproducción de video HTML5.
                  </video>
                </div>

                {/* Barra de Progreso Limpia */}
                <div style={{
                  background: '#f8fafc',
                  border: '1px solid #e2e8f0',
                  borderRadius: '12px',
                  padding: '12px 16px'
                }}>
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', marginBottom: '6px' }}>
                    <span style={{ color: canFinishVideo ? '#059669' : '#0284c7', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '5px' }}>
                      {canFinishVideo ? (
                        <>
                          <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                          Video completado al 100%
                        </>
                      ) : (
                        'Progreso de reproducción obligatoria'
                      )}
                    </span>
                    <span style={{ color: '#0f172a', fontWeight: 900 }}>
                      {videoProgress}%
                    </span>
                  </div>

                  <div style={{ width: '100%', height: '8px', background: '#e2e8f0', borderRadius: '6px', overflow: 'hidden' }}>
                    <div
                      style={{
                        width: `${videoProgress}%`,
                        height: '100%',
                        background: canFinishVideo
                          ? 'linear-gradient(90deg, #10b981, #059669)'
                          : 'linear-gradient(90deg, #0284c7, #38bdf8)',
                        borderRadius: '6px',
                        transition: 'width 0.3s ease'
                      }}
                    />
                  </div>
                </div>

                {/* Botón de Acción Siguiente */}
                <div style={{ display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={handleNextFromVideo}
                    disabled={!canFinishVideo || savingVideo}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 24px',
                      borderRadius: '10px',
                      border: 'none',
                      fontSize: '0.86rem',
                      fontWeight: 900,
                      background: canFinishVideo
                        ? 'linear-gradient(135deg, #10b981, #059669)'
                        : '#cbd5e1',
                      color: '#ffffff',
                      cursor: canFinishVideo && !savingVideo ? 'pointer' : 'not-allowed',
                      boxShadow: canFinishVideo ? '0 4px 14px rgba(16, 185, 129, 0.3)' : 'none',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {canFinishVideo ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    <span>{savingVideo ? 'Guardando...' : (canFinishVideo ? 'Continuar a Leer Cartilla ➡️' : 'Continuar a Leer Cartilla')}</span>
                  </button>
                </div>

              </div>
            )}

            {/* CONTENIDO PASO 2: CARTILLA PDF */}
            {currentStep === 2 && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                
                {/* Timer Bar */}
                <div style={{
                  background: canFinishPdf ? '#ecfdf5' : '#f0f9ff',
                  borderBottom: canFinishPdf ? '1.5px solid #a7f3d0' : '1.5px solid #bae6fd',
                  padding: '10px 18px',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between',
                  fontSize: '0.82rem',
                  flexWrap: 'wrap',
                  gap: '8px'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: canFinishPdf ? '#065f46' : '#0369a1', fontWeight: 800 }}>
                    {canFinishPdf ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                        <span>¡Lectura completada! Ya puedes rendir la evaluación.</span>
                      </>
                    ) : (
                      <>
                        <Clock className="w-4 h-4 text-sky-600 flex-shrink-0 animate-spin" />
                        <span>Tiempo de lectura requerido: 1 minuto</span>
                      </>
                    )}
                  </div>

                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <div style={{
                      background: canFinishPdf ? '#10b981' : '#0284c7',
                      color: '#ffffff',
                      padding: '4px 12px',
                      borderRadius: '20px',
                      fontWeight: 900,
                      fontSize: '0.78rem',
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      <Clock className="w-3.5 h-3.5" />
                      <span>{canFinishPdf ? 'Listo' : formatTime(timeLeft)}</span>
                    </div>

                    <a
                      href={pdfUrl}
                      download="Cartilla_del_Personero_ERM_2026.pdf"
                      style={{
                        display: 'inline-flex',
                        alignItems: 'center',
                        gap: '4px',
                        padding: '4px 10px',
                        background: '#dc2626',
                        color: '#ffffff',
                        borderRadius: '8px',
                        fontSize: '0.74rem',
                        fontWeight: 800,
                        textDecoration: 'none'
                      }}
                      title="Descargar Cartilla en PDF"
                    >
                      <Download className="w-3.5 h-3.5" />
                      <span>Descargar</span>
                    </a>
                  </div>
                </div>

                {/* PDF Viewer Frame */}
                <div style={{ width: '100%', height: '540px', background: '#f1f5f9' }}>
                  <object
                    data={`${pdfUrl}#view=FitH&toolbar=1&navpanes=1`}
                    type="application/pdf"
                    style={{ width: '100%', height: '100%', border: 'none' }}
                  >
                    <iframe
                      src={`${pdfUrl}#view=FitH&toolbar=1`}
                      title="Cartilla del Personero ERM 2026"
                      style={{ width: '100%', height: '100%', border: 'none' }}
                    >
                      <div style={{ padding: '30px', textAlign: 'center', color: '#0f172a' }}>
                        <p>Tu navegador no puede previsualizar el PDF.</p>
                        <a href={pdfUrl} target="_blank" rel="noreferrer" style={{ color: '#0284c7', fontWeight: 800 }}>
                          Abrir PDF en pestaña nueva
                        </a>
                      </div>
                    </iframe>
                  </object>
                </div>

                {/* Footer Paso 2 */}
                <div style={{ padding: '14px 18px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                  <button
                    onClick={handleNextFromPdf}
                    disabled={!canFinishPdf || savingPdf}
                    style={{
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      padding: '10px 24px',
                      borderRadius: '10px',
                      border: 'none',
                      fontSize: '0.86rem',
                      fontWeight: 900,
                      background: canFinishPdf
                        ? 'linear-gradient(135deg, #10b981, #059669)'
                        : '#cbd5e1',
                      color: '#ffffff',
                      cursor: canFinishPdf && !savingPdf ? 'pointer' : 'not-allowed',
                      boxShadow: canFinishPdf ? '0 4px 14px rgba(16, 185, 129, 0.3)' : 'none'
                    }}
                  >
                    {canFinishPdf ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                    <span>{savingPdf ? 'Guardando...' : (canFinishPdf ? 'Continuar a la Evaluación ➡️' : `Esperar ${formatTime(timeLeft)}`)}</span>
                  </button>
                </div>

              </div>
            )}

            {/* CONTENIDO PASO 3: EVALUACIÓN */}
            {currentStep === 3 && (
              <div style={{ display: 'flex', flexDirection: 'column' }}>
                
                {/* Header Evaluación */}
                <div style={{
                  padding: '12px 18px',
                  borderBottom: '1px solid #e2e8f0',
                  background: '#ffffff',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'space-between'
                }}>
                  <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                    <Award className="w-4 h-4 text-amber-500" />
                    <span style={{ fontSize: '0.88rem', fontWeight: 900, color: '#0f172a' }}>
                      Cuestionario de 5 Preguntas
                    </span>
                  </div>

                  <div style={{
                    background: submittedQuiz ? (quizScore === 5 ? '#ecfdf5' : '#fef2f2') : '#f0f9ff',
                    color: submittedQuiz ? (quizScore === 5 ? '#059669' : '#dc2626') : '#0284c7',
                    border: submittedQuiz ? (quizScore === 5 ? '1px solid #a7f3d0' : '1px solid #fca5a5') : '1px solid #bae6fd',
                    padding: '4px 14px',
                    borderRadius: '20px',
                    fontSize: '0.78rem',
                    fontWeight: 900
                  }}>
                    {submittedQuiz ? `Resultado: ${quizScore}/5` : `${totalAnswered} de 5 respondidas`}
                  </div>
                </div>

                {/* Preguntas */}
                <div ref={scrollQuizRef} style={{ padding: '18px', display: 'flex', flexDirection: 'column', gap: '16px', maxHeight: '520px', overflowY: 'auto' }}>
                  
                  {/* Banner de Aprobado */}
                  {submittedQuiz && quizScore === 5 && (
                    <div style={{
                      background: 'linear-gradient(135deg, #10b981, #059669)',
                      borderRadius: '14px',
                      padding: '18px',
                      textAlign: 'center',
                      color: '#ffffff',
                      display: 'flex',
                      flexDirection: 'column',
                      alignItems: 'center',
                      gap: '8px'
                    }}>
                      <div style={{ fontSize: '2.2rem' }}>🎓</div>
                      <h3 style={{ fontSize: '1.2rem', fontWeight: 900, margin: 0 }}>
                        ¡Felicitaciones! Has Aprobado con 5/5
                      </h3>
                      <p style={{ fontSize: '0.84rem', color: '#ecfdf5', margin: 0, maxWidth: '480px' }}>
                        Has completado con éxito todo el proceso de capacitación. Tu Constancia de Capacitación está disponible.
                      </p>
                      <button
                        onClick={() => setShowCertificate(true)}
                        style={{
                          marginTop: '6px',
                          padding: '10px 24px',
                          borderRadius: '10px',
                          border: 'none',
                          background: '#ffffff',
                          color: '#065f46',
                          fontSize: '0.88rem',
                          fontWeight: 900,
                          cursor: 'pointer',
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '8px'
                        }}
                      >
                        <Award className="w-4 h-4 text-amber-500" />
                        <span>Ver Constancia de Capacitación</span>
                      </button>
                    </div>
                  )}

                  {/* Banner de Reintento */}
                  {submittedQuiz && quizScore < 5 && (
                    <div style={{
                      background: '#fef2f2',
                      border: '1.5px solid #f87171',
                      borderRadius: '12px',
                      padding: '12px 16px',
                      color: '#991b1b',
                      display: 'flex',
                      justifyContent: 'space-between',
                      alignItems: 'center',
                      flexWrap: 'wrap',
                      gap: '10px'
                    }}>
                      <div>
                        <div style={{ fontWeight: 900, fontSize: '0.92rem' }}>
                          Puntaje obtenido: {quizScore} de 5 correctas.
                        </div>
                        <div style={{ fontSize: '0.78rem', color: '#b91c1c' }}>
                          Se requiere 5/5 para aprobar y obtener tu constancia. ¡Puedes intentarlo nuevamente!
                        </div>
                      </div>
                      <button
                        onClick={loadRandomQuestions}
                        style={{
                          display: 'inline-flex',
                          alignItems: 'center',
                          gap: '6px',
                          padding: '8px 16px',
                          borderRadius: '8px',
                          border: 'none',
                          background: '#dc2626',
                          color: '#ffffff',
                          fontSize: '0.82rem',
                          fontWeight: 800,
                          cursor: 'pointer'
                        }}
                      >
                        <RotateCcw className="w-3.5 h-3.5" />
                        <span>Reintentar Evaluación</span>
                      </button>
                    </div>
                  )}

                  {/* Listado de Preguntas */}
                  {questions.map((q, qIdx) => {
                    const selectedOpt = answers[qIdx];
                    const isQuestionCorrect = submittedQuiz && selectedOpt === q.answer;
                    const isQuestionWrong = submittedQuiz && selectedOpt !== q.answer;

                    return (
                      <div
                        key={q.id || qIdx}
                        style={{
                          background: '#f8fafc',
                          border: isQuestionCorrect ? '1.5px solid #86efac' : (isQuestionWrong ? '1.5px solid #fca5a5' : '1px solid #e2e8f0'),
                          borderRadius: '12px',
                          padding: '14px',
                          display: 'flex',
                          flexDirection: 'column',
                          gap: '10px'
                        }}
                      >
                        <div style={{ display: 'flex', alignItems: 'flex-start', gap: '8px' }}>
                          <span style={{
                            background: '#0284c7',
                            color: '#ffffff',
                            borderRadius: '50%',
                            width: '22px',
                            height: '22px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'center',
                            fontSize: '0.72rem',
                            fontWeight: 900,
                            flexShrink: 0
                          }}>
                            {qIdx + 1}
                          </span>
                          <span style={{ fontSize: '0.88rem', fontWeight: 800, color: '#0f172a', lineHeight: 1.35 }}>
                            {q.question}
                          </span>
                        </div>

                        {/* Opciones */}
                        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', marginLeft: '30px' }}>
                          {q.options.map((opt, optIdx) => {
                            const isSelected = selectedOpt === optIdx;
                            let btnBg = '#ffffff';
                            let btnBorder = '#e2e8f0';
                            let btnColor = '#334155';

                            if (isSelected) {
                              btnBg = '#e0f2fe';
                              btnBorder = '#0284c7';
                              btnColor = '#0369a1';
                            }
                            if (submittedQuiz) {
                              if (optIdx === q.answer) {
                                btnBg = '#dcfce7';
                                btnBorder = '#22c55e';
                                btnColor = '#15803d';
                              } else if (isSelected) {
                                btnBg = '#fee2e2';
                                btnBorder = '#ef4444';
                                btnColor = '#b91c1c';
                              }
                            }

                            return (
                              <button
                                key={optIdx}
                                type="button"
                                onClick={() => handleSelectAnswer(qIdx, optIdx)}
                                className={!submittedQuiz ? 'quiz-option-btn' : ''}
                                style={{
                                  display: 'flex',
                                  alignItems: 'center',
                                  gap: '8px',
                                  padding: '8px 12px',
                                  borderRadius: '8px',
                                  border: `1.5px solid ${btnBorder}`,
                                  background: btnBg,
                                  color: btnColor,
                                  fontSize: '0.8rem',
                                  fontWeight: isSelected ? 800 : 600,
                                  textAlign: 'left',
                                  cursor: submittedQuiz ? 'default' : 'pointer',
                                  transition: 'all 0.15s ease'
                                }}
                              >
                                <span style={{
                                  width: '16px',
                                  height: '16px',
                                  borderRadius: '50%',
                                  border: `1.5px solid ${isSelected ? btnBorder : '#cbd5e1'}`,
                                  background: isSelected ? btnBorder : 'transparent',
                                  display: 'flex',
                                  alignItems: 'center',
                                  justifyContent: 'center',
                                  flexShrink: 0
                                }}>
                                  {isSelected && <span style={{ width: '6px', height: '6px', borderRadius: '50%', background: '#ffffff' }} />}
                                </span>
                                <span>{opt}</span>
                              </button>
                            );
                          })}
                        </div>
                      </div>
                    );
                  })}
                </div>

                {/* Footer Evaluación */}
                {!submittedQuiz && (
                  <div style={{ padding: '14px 18px', borderTop: '1px solid #e2e8f0', display: 'flex', justifyContent: 'flex-end' }}>
                    <button
                      onClick={handleSubmitQuiz}
                      disabled={!isAllAnswered || savingQuiz}
                      style={{
                        padding: '10px 24px',
                        borderRadius: '10px',
                        border: 'none',
                        fontSize: '0.86rem',
                        fontWeight: 900,
                        background: isAllAnswered
                          ? 'linear-gradient(135deg, #0284c7, #0369a1)'
                          : '#cbd5e1',
                        color: '#ffffff',
                        cursor: isAllAnswered && !savingQuiz ? 'pointer' : 'not-allowed',
                        boxShadow: isAllAnswered ? '0 4px 14px rgba(2, 132, 199, 0.3)' : 'none'
                      }}
                    >
                      {savingQuiz ? 'Enviando...' : `Enviar Evaluación (${totalAnswered}/5)`}
                    </button>
                  </div>
                )}

              </div>
            )}

          </div>

        </section>

        {/* -------------------------------------------------------------
            COLUMNA DERECHA: MATERIALES COMPLEMENTARIOS (MATCH GUIA.PNG)
            ------------------------------------------------------------- */}
        <aside className="onpeduca-right-col" style={{ display: 'flex', flexDirection: 'column', gap: '14px' }}>
          
          {/* Tarjeta Flotante con Candado / Estado de Materiales */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: isFullyAccredited ? '1.5px solid #86efac' : '1px solid #e2e8f0',
            padding: '20px 16px',
            display: 'flex',
            flexDirection: 'column',
            alignItems: 'center',
            textAlign: 'center',
            gap: '12px',
            boxShadow: '0 4px 12px rgba(0,0,0,0.03)'
          }}>
            
            {/* Icono de Candado / Trofeo */}
            <div style={{
              width: '46px',
              height: '46px',
              borderRadius: '50%',
              background: isFullyAccredited ? '#dcfce7' : '#f1f5f9',
              color: isFullyAccredited ? '#16a34a' : '#64748b',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center'
            }}>
              {isFullyAccredited ? <Award className="w-6 h-6 text-emerald-600" /> : <Lock className="w-5 h-5 text-slate-500" />}
            </div>

            {/* Mensaje de Estado Exacto guia.png */}
            <p style={{ fontSize: '0.8rem', color: '#475569', margin: 0, lineHeight: 1.45 }}>
              {isFullyAccredited ? (
                <span style={{ color: '#15803d', fontWeight: 800 }}>
                  ¡Capacitación completada exitosamente! Tienes acceso a todos tus materiales y constancia oficial.
                </span>
              ) : (
                'Completa el video para acceder a los materiales complementarios.'
              )}
            </p>

            {/* Botón Constancia de Capacitación */}
            <button
              onClick={() => { if (isFullyAccredited) setShowCertificate(true); }}
              disabled={!isFullyAccredited}
              style={{
                width: '100%',
                padding: '9px 12px',
                borderRadius: '8px',
                border: 'none',
                background: isFullyAccredited ? 'linear-gradient(135deg, #10b981, #059669)' : '#e2e8f0',
                color: isFullyAccredited ? '#ffffff' : '#94a3b8',
                fontSize: '0.78rem',
                fontWeight: 900,
                cursor: isFullyAccredited ? 'pointer' : 'not-allowed',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center',
                gap: '6px',
                boxShadow: isFullyAccredited ? '0 3px 10px rgba(16, 185, 129, 0.25)' : 'none'
              }}
            >
              <Award className="w-3.5 h-3.5" />
              <span>Constancia de Capacitación</span>
            </button>
          </div>

          {/* Ficha de Asignación del Personero */}
          <div style={{
            background: '#ffffff',
            borderRadius: '16px',
            border: '1px solid #e2e8f0',
            padding: '14px',
            display: 'flex',
            flexDirection: 'column',
            gap: '8px',
            fontSize: '0.74rem'
          }}>
            <div style={{ fontWeight: 900, color: '#002B66', fontSize: '0.82rem', borderBottom: '1px solid #f1f5f9', paddingBottom: '6px' }}>
              🛡️ Datos de Acreditación
            </div>
            <div>DNI: <strong style={{ color: '#0f172a' }}>{dni}</strong></div>
            <div>Rol: <strong style={{ color: '#0f172a' }}>{rolTitle}</strong></div>
            <div>Distrito: <strong style={{ color: '#0f172a' }}>{distrito}</strong></div>
            <div style={{ whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }} title={localAsig}>
              Centro: <strong style={{ color: '#0f172a' }}>{localAsig}</strong>
            </div>
            {showMesa && (
              <div>Mesa: <strong style={{ color: '#0f172a' }}>{rawMesa}</strong></div>
            )}

            {/* Dashboard para Coordinadores */}
            {isAnyCoordinador && (
              <div style={{ marginTop: '6px' }}>
                {isFullyAccredited ? (
                  <button
                    onClick={onGoToDashboard}
                    style={{
                      width: '100%',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      border: 'none',
                      background: 'linear-gradient(90deg, #0284c7, #0369a1)',
                      color: '#ffffff',
                      fontSize: '0.78rem',
                      fontWeight: 800,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '4px'
                    }}
                  >
                    <span>📊 Ir a Dashboard</span>
                    <ChevronRight className="w-3.5 h-3.5" />
                  </button>
                ) : (
                  <div style={{
                    background: '#f8fafc',
                    border: '1px dashed #cbd5e1',
                    borderRadius: '6px',
                    padding: '6px',
                    fontSize: '0.68rem',
                    color: '#64748b',
                    display: 'flex',
                    alignItems: 'center',
                    gap: '4px'
                  }}>
                    <Lock className="w-3 h-3 text-amber-600 flex-shrink-0" />
                    <span>Dashboard bloqueado hasta aprobar.</span>
                  </div>
                )}
              </div>
            )}
          </div>

        </aside>

      </main>

      {/* Modal de Constancia Oficial de Capacitación */}
      {showCertificate && (
        <CertificateModal
          user={user}
          onClose={() => setShowCertificate(false)}
        />
      )}

    </div>
  );
}
