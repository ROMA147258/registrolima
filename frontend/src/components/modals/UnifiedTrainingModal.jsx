import React, { useState, useRef, useEffect } from 'react';
import {
  X, Play, FileText, CheckCircle2, Lock, Clock, ShieldAlert,
  Award, RotateCcw, Download, ChevronRight
} from 'lucide-react';
import confetti from 'canvas-confetti';
import { getRandomQuestions } from '../../constants/quizData.js';

export function UnifiedTrainingModal({
  initialStep = 'video', // 'video' | 'pdf' | 'quiz'
  onClose,
  onVideoComplete,
  onPdfComplete,
  onQuizComplete,
  onViewCertificate,
  isVideoDone = false,
  isPdfDone = false,
  isQuizPassed = false
}) {
  // Step: 1 (video), 2 (pdf), 3 (quiz)
  const getInitialStepNumber = () => {
    if (initialStep === 'quiz') return 3;
    if (initialStep === 'pdf') return 2;
    if (initialStep === 'video') return 1;
    if (!isVideoDone) return 1;
    if (!isPdfDone) return 2;
    if (!isQuizPassed) return 3;
    return 1;
  };

  const [currentStep, setCurrentStep] = useState(getInitialStepNumber);
  const isMobile = window.innerWidth < 768;

  // -------------------------------------------------------------
  // PASO 1: ESTADOS Y LÓGICA DE VIDEO
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

    // Asegurar velocidad 1x siempre
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
      if (onVideoComplete) {
        await onVideoComplete();
      }
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
  // PASO 2: ESTADOS Y LÓGICA DE PDF (TEMPORIZADOR 1 MINUTO)
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
      if (onPdfComplete) {
        await onPdfComplete();
      }
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
  // PASO 3: ESTADOS Y LÓGICA DE EVALUACIÓN
  // -------------------------------------------------------------
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submittedQuiz, setSubmittedQuiz] = useState(false);
  const [quizScore, setQuizScore] = useState(0);
  const [savingQuiz, setSavingQuiz] = useState(false);
  const [quizPassed, setQuizPassed] = useState(isQuizPassed);
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
      setQuizPassed(true);
      confetti({ particleCount: 140, spread: 90, origin: { y: 0.5 } });
      try {
        setSavingQuiz(true);
        if (onQuizComplete) {
          await onQuizComplete();
        }
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
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.65)',
      backdropFilter: 'blur(8px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: isMobile ? '0' : '16px',
      fontFamily: "'Outfit', 'Montserrat', -apple-system, BlinkMacSystemFont, sans-serif",
      animation: 'fadeIn 0.2s ease-out'
    }}>
      <style>{`
        @keyframes fadeIn {
          from { opacity: 0; transform: scale(0.98); }
          to { opacity: 1; transform: scale(1); }
        }
        .modal-step-btn:hover {
          transform: translateY(-1px);
        }
        .quiz-opt-hover:hover {
          border-color: #0284c7 !important;
          background-color: #f0f9ff !important;
        }
      `}</style>

      {/* Tarjeta Principal del Modal - MODO DÍA */}
      <div style={{
        background: '#ffffff',
        width: '100%',
        maxWidth: isMobile ? '100%' : (currentStep === 2 ? '1100px' : '780px'),
        height: isMobile ? '100vh' : (currentStep === 2 ? '94vh' : '90vh'),
        borderRadius: isMobile ? '0' : '20px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 25px 50px -12px rgba(15, 23, 42, 0.25), 0 0 0 1px rgba(226, 232, 240, 0.8)',
        color: '#0f172a',
        transition: 'all 0.3s ease'
      }}>

        {/* Header Superior con Barra de 3 Pasos */}
        <div style={{
          padding: isMobile ? '12px 14px' : '14px 22px',
          borderBottom: '1px solid #e2e8f0',
          background: '#ffffff',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          gap: '12px',
          flexShrink: 0
        }}>
          
          {/* Indicador de 3 Pasos Interactivo */}
          <div style={{ display: 'flex', alignItems: 'center', gap: isMobile ? '6px' : '10px', flex: 1, minWidth: 0, overflowX: 'auto', paddingBottom: '2px' }}>
            
            {/* Paso 1: Video */}
            <div
              onClick={() => setCurrentStep(1)}
              className="modal-step-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '6px 12px',
                borderRadius: '10px',
                background: currentStep === 1
                  ? 'linear-gradient(135deg, #0284c7, #0369a1)'
                  : (isVideoDone || canFinishVideo ? '#ecfdf5' : '#f1f5f9'),
                color: currentStep === 1
                  ? '#ffffff'
                  : (isVideoDone || canFinishVideo ? '#059669' : '#64748b'),
                border: currentStep === 1
                  ? '1.5px solid #0284c7'
                  : (isVideoDone || canFinishVideo ? '1.5px solid #a7f3d0' : '1px solid #e2e8f0'),
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: 'pointer',
                whiteSpace: 'nowrap',
                boxShadow: currentStep === 1 ? '0 4px 12px rgba(2, 132, 199, 0.3)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {isVideoDone || canFinishVideo ? (
                <CheckCircle2 className={`w-4 h-4 ${currentStep === 1 ? 'text-white' : 'text-emerald-500'}`} />
              ) : (
                <Play className="w-3.5 h-3.5 fill-current" />
              )}
              <span>1. Ver Video</span>
            </div>

            <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />

            {/* Paso 2: Leer Cartilla */}
            <div
              onClick={() => { if (isVideoDone || canFinishVideo) setCurrentStep(2); }}
              className="modal-step-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '6px 12px',
                borderRadius: '10px',
                background: currentStep === 2
                  ? 'linear-gradient(135deg, #0284c7, #0369a1)'
                  : (isPdfDone || canFinishPdf ? '#ecfdf5' : '#f1f5f9'),
                color: currentStep === 2
                  ? '#ffffff'
                  : (isPdfDone || canFinishPdf ? '#059669' : '#94a3b8'),
                border: currentStep === 2
                  ? '1.5px solid #0284c7'
                  : (isPdfDone || canFinishPdf ? '1.5px solid #a7f3d0' : '1px solid #e2e8f0'),
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: (isVideoDone || canFinishVideo) ? 'pointer' : 'not-allowed',
                opacity: (isVideoDone || canFinishVideo) ? 1 : 0.65,
                whiteSpace: 'nowrap',
                boxShadow: currentStep === 2 ? '0 4px 12px rgba(2, 132, 199, 0.3)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {isPdfDone || canFinishPdf ? (
                <CheckCircle2 className={`w-4 h-4 ${currentStep === 2 ? 'text-white' : 'text-emerald-500'}`} />
              ) : (
                <FileText className="w-3.5 h-3.5" />
              )}
              <span>2. Leer Cartilla</span>
            </div>

            <ChevronRight className="w-3.5 h-3.5 text-slate-300 flex-shrink-0" />

            {/* Paso 3: Evaluación */}
            <div
              onClick={() => { if ((isVideoDone || canFinishVideo) && (isPdfDone || canFinishPdf)) setCurrentStep(3); }}
              className="modal-step-btn"
              style={{
                display: 'flex',
                alignItems: 'center',
                gap: '7px',
                padding: '6px 12px',
                borderRadius: '10px',
                background: currentStep === 3
                  ? 'linear-gradient(135deg, #0284c7, #0369a1)'
                  : (isQuizPassed || quizPassed ? '#ecfdf5' : '#f1f5f9'),
                color: currentStep === 3
                  ? '#ffffff'
                  : (isQuizPassed || quizPassed ? '#059669' : '#94a3b8'),
                border: currentStep === 3
                  ? '1.5px solid #0284c7'
                  : (isQuizPassed || quizPassed ? '1.5px solid #a7f3d0' : '1px solid #e2e8f0'),
                fontSize: '0.78rem',
                fontWeight: 800,
                cursor: ((isVideoDone || canFinishVideo) && (isPdfDone || canFinishPdf)) ? 'pointer' : 'not-allowed',
                opacity: ((isVideoDone || canFinishVideo) && (isPdfDone || canFinishPdf)) ? 1 : 0.65,
                whiteSpace: 'nowrap',
                boxShadow: currentStep === 3 ? '0 4px 12px rgba(2, 132, 199, 0.3)' : 'none',
                transition: 'all 0.2s ease'
              }}
            >
              {isQuizPassed || quizPassed ? (
                <CheckCircle2 className={`w-4 h-4 ${currentStep === 3 ? 'text-white' : 'text-emerald-500'}`} />
              ) : (
                <Award className="w-3.5 h-3.5" />
              )}
              <span>3. Evaluación</span>
            </div>

          </div>

          {/* Botón Cerrar */}
          <button
            onClick={onClose}
            aria-label="Cerrar modal"
            style={{
              background: '#f1f5f9',
              border: '1px solid #e2e8f0',
              color: '#475569',
              cursor: 'pointer',
              padding: '7px',
              borderRadius: '10px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'center',
              flexShrink: 0,
              transition: 'all 0.15s ease'
            }}
            onMouseEnter={(e) => { e.currentTarget.style.background = '#e2e8f0'; e.currentTarget.style.color = '#0f172a'; }}
            onMouseLeave={(e) => { e.currentTarget.style.background = '#f1f5f9'; e.currentTarget.style.color = '#475569'; }}
          >
            <X className="w-4 h-4" />
          </button>
        </div>

        {/* =========================================================================
            PASO 1: VER VIDEO (LIMPIO, SIN REDUNDANCIAS)
            ========================================================================= */}
        {currentStep === 1 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflowY: 'auto', background: '#f8fafc' }}>
            <div style={{ padding: isMobile ? '14px 16px' : '18px 24px', flex: 1, display: 'flex', flexDirection: 'column', gap: '12px' }}>
              
              {/* Advertencia de adelanto si intentó adelantar */}
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
                  gap: '8px',
                  boxShadow: '0 4px 12px rgba(239, 68, 68, 0.15)',
                  animation: 'fadeIn 0.2s ease'
                }}>
                  <ShieldAlert className="w-4 h-4 flex-shrink-0 text-red-500" />
                  <span>{videoWarning}</span>
                </div>
              )}

              {/* Marco Reproductor de Video */}
              <div style={{
                position: 'relative',
                background: '#000000',
                borderRadius: '14px',
                overflow: 'hidden',
                border: '1.5px solid #e2e8f0',
                boxShadow: '0 8px 24px rgba(0,0,0,0.08)',
                flex: 1,
                minHeight: isMobile ? '220px' : '320px',
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
                  style={{ width: '100%', maxHeight: '430px', display: 'block', outline: 'none' }}
                >
                  <source src="/videos/IMG_5774.MP4" type="video/mp4" />
                  Tu navegador no soporta el formato de video MP4.
                </video>
              </div>

              {/* Única Barra de Progreso Limpia */}
              <div style={{
                background: '#ffffff',
                border: '1px solid #e2e8f0',
                borderRadius: '12px',
                padding: '10px 14px'
              }}>
                <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', fontSize: '0.8rem', marginBottom: '6px' }}>
                  <span style={{ color: canFinishVideo ? '#059669' : '#0284c7', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '5px' }}>
                    {canFinishVideo ? (
                      <>
                        <CheckCircle2 className="w-4 h-4 text-emerald-500" />
                        Video completado
                      </>
                    ) : (
                      'Progreso de reproducción'
                    )}
                  </span>
                  <span style={{ color: '#0f172a', fontWeight: 900 }}>
                    {videoProgress}%
                  </span>
                </div>
                
                <div style={{ width: '100%', height: '8px', background: '#f1f5f9', borderRadius: '6px', overflow: 'hidden', border: '1px solid #e2e8f0' }}>
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

            </div>

            {/* Footer Paso 1 Limpio */}
            <div style={{
              padding: isMobile ? '12px 16px' : '14px 24px',
              borderTop: '1px solid #e2e8f0',
              background: '#ffffff',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              flexShrink: 0
            }}>
              <button
                onClick={handleNextFromVideo}
                disabled={!canFinishVideo || savingVideo}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '0.88rem',
                  fontWeight: 900,
                  background: canFinishVideo
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : '#cbd5e1',
                  color: '#ffffff',
                  cursor: canFinishVideo && !savingVideo ? 'pointer' : 'not-allowed',
                  boxShadow: canFinishVideo ? '0 4px 16px rgba(16, 185, 129, 0.35)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                {canFinishVideo ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                <span>
                  {savingVideo ? 'Guardando...' : (canFinishVideo ? 'Continuar a Leer Cartilla ➡️' : 'Continuar a Leer Cartilla')}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            PASO 2: LEER CARTILLA (TEMPORIZADOR 1 MINUTO)
            ========================================================================= */}
        {currentStep === 2 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f8fafc' }}>
            
            {/* Banner de Tiempo de Lectura en Modo Día */}
            <div style={{
              background: canFinishPdf ? '#ecfdf5' : '#f0f9ff',
              borderBottom: canFinishPdf ? '1.5px solid #a7f3d0' : '1.5px solid #bae6fd',
              padding: isMobile ? '10px 14px' : '10px 22px',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              fontSize: '0.82rem',
              flexWrap: 'wrap',
              gap: '8px',
              flexShrink: 0
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
                    <span>Tiempo obligatorio de lectura: 1 minuto</span>
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

            {/* Visor de PDF */}
            <div style={{ flex: 1, width: '100%', height: '100%', background: '#f1f5f9', position: 'relative' }}>
              <object
                data={`${pdfUrl}#view=FitH&toolbar=1&navpanes=1`}
                type="application/pdf"
                style={{ width: '100%', height: '100%', border: 'none', background: '#ffffff' }}
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
            <div style={{
              padding: isMobile ? '12px 16px' : '14px 24px',
              borderTop: '1px solid #e2e8f0',
              background: '#ffffff',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              flexShrink: 0
            }}>
              <button
                onClick={handleNextFromPdf}
                disabled={!canFinishPdf || savingPdf}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 24px',
                  borderRadius: '12px',
                  border: 'none',
                  fontSize: '0.88rem',
                  fontWeight: 900,
                  background: canFinishPdf
                    ? 'linear-gradient(135deg, #10b981, #059669)'
                    : '#cbd5e1',
                  color: '#ffffff',
                  cursor: canFinishPdf && !savingPdf ? 'pointer' : 'not-allowed',
                  boxShadow: canFinishPdf ? '0 4px 16px rgba(16, 185, 129, 0.35)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                {canFinishPdf ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                <span>
                  {savingPdf ? 'Guardando...' : (canFinishPdf ? 'Continuar a la Evaluación ➡️' : `Esperar ${formatTime(timeLeft)}`)}
                </span>
              </button>
            </div>
          </div>
        )}

        {/* =========================================================================
            PASO 3: EVALUACIÓN
            ========================================================================= */}
        {currentStep === 3 && (
          <div style={{ flex: 1, display: 'flex', flexDirection: 'column', overflow: 'hidden', background: '#f8fafc' }}>
            
            {/* Header Evaluación */}
            <div style={{
              padding: isMobile ? '12px 16px' : '14px 24px',
              borderBottom: '1px solid #e2e8f0',
              background: '#ffffff',
              display: 'flex',
              alignItems: 'center',
              justifyContent: 'space-between',
              flexShrink: 0
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                <div style={{
                  width: '32px',
                  height: '32px',
                  borderRadius: '8px',
                  background: '#fef3c7',
                  color: '#d97706',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center'
                }}>
                  <Award className="w-4 h-4" />
                </div>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 900, color: '#0f172a', margin: 0 }}>
                  Evaluación
                </h3>
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

            {/* Cuerpo de Preguntas con Scroll */}
            <div ref={scrollQuizRef} style={{ flex: 1, overflowY: 'auto', padding: isMobile ? '14px 16px' : '18px 24px', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Banner Celebratorio de Aprobado */}
              {submittedQuiz && quizScore === 5 && (
                <div style={{
                  background: 'linear-gradient(135deg, #10b981, #059669)',
                  borderRadius: '16px',
                  padding: '20px',
                  textAlign: 'center',
                  color: '#ffffff',
                  display: 'flex',
                  flexDirection: 'column',
                  alignItems: 'center',
                  gap: '10px',
                  boxShadow: '0 8px 24px rgba(16, 185, 129, 0.3)',
                  animation: 'fadeIn 0.3s ease'
                }}>
                  <div style={{ fontSize: '2.4rem' }}>🎓</div>
                  <h3 style={{ fontSize: '1.25rem', fontWeight: 900, margin: 0 }}>
                    ¡Felicitaciones! Has Aprobado con 5/5
                  </h3>
                  <p style={{ fontSize: '0.86rem', color: '#ecfdf5', margin: 0, maxWidth: '480px', lineHeight: 1.4 }}>
                    Has completado con éxito todo el proceso de capacitación. Tu <strong>Constancia de Capacitación</strong> está lista.
                  </p>
                  <button
                    onClick={() => {
                      if (onViewCertificate) onViewCertificate();
                    }}
                    style={{
                      marginTop: '6px',
                      padding: '11px 26px',
                      borderRadius: '12px',
                      border: 'none',
                      background: '#ffffff',
                      color: '#065f46',
                      fontSize: '0.92rem',
                      fontWeight: 900,
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 14px rgba(0,0,0,0.15)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <Award className="w-4 h-4 text-amber-500" />
                    <span>Ver Constancia de Capacitación</span>
                  </button>
                </div>
              )}

              {/* Banner de Desaprobado con opción de reintentar */}
              {submittedQuiz && quizScore < 5 && (
                <div style={{
                  background: '#fef2f2',
                  border: '1.5px solid #f87171',
                  borderRadius: '14px',
                  padding: '14px 18px',
                  color: '#991b1b',
                  display: 'flex',
                  justifyContent: 'space-between',
                  alignItems: 'center',
                  flexWrap: 'wrap',
                  gap: '12px',
                  boxShadow: '0 4px 14px rgba(239, 68, 68, 0.12)',
                  animation: 'fadeIn 0.3s ease'
                }}>
                  <div>
                    <strong style={{ fontSize: '0.92rem', display: 'block', color: '#991b1b' }}>
                      Puntaje obtenido: {quizScore} de 5 correctas.
                    </strong>
                    <span style={{ fontSize: '0.8rem', color: '#b91c1c' }}>
                      Revisa las respuestas abajo y pulsa reintentar.
                    </span>
                  </div>
                  <button
                    onClick={loadRandomQuestions}
                    style={{
                      padding: '9px 18px',
                      borderRadius: '10px',
                      border: 'none',
                      background: '#dc2626',
                      color: '#ffffff',
                      fontWeight: 800,
                      fontSize: '0.84rem',
                      cursor: 'pointer',
                      display: 'inline-flex',
                      alignItems: 'center',
                      gap: '6px',
                      boxShadow: '0 4px 12px rgba(220, 38, 38, 0.3)',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <RotateCcw className="w-3.5 h-3.5" />
                    <span>Reintentar</span>
                  </button>
                </div>
              )}

              {/* Lista de las 5 Preguntas */}
              {questions.map((q, qIdx) => {
                const isSelectedAny = answers[qIdx] !== undefined;
                const isCorrect = submittedQuiz && answers[qIdx] === q.answer;

                return (
                  <div
                    key={`q-${q.id}-${qIdx}`}
                    style={{
                      background: '#ffffff',
                      border: submittedQuiz
                        ? (isCorrect ? '2px solid #10b981' : '2px solid #ef4444')
                        : '1px solid #e2e8f0',
                      borderRadius: '14px',
                      padding: '16px 18px',
                      display: 'flex',
                      flexDirection: 'column',
                      gap: '12px',
                      boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    {/* Enunciado */}
                    <div style={{ display: 'flex', alignItems: 'flex-start', gap: '10px' }}>
                      <span style={{
                        width: '26px',
                        height: '26px',
                        borderRadius: '50%',
                        background: '#0284c7',
                        color: '#ffffff',
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        fontSize: '0.78rem',
                        fontWeight: 900,
                        flexShrink: 0
                      }}>
                        {qIdx + 1}
                      </span>
                      <strong style={{ fontSize: '0.9rem', color: '#0f172a', lineHeight: 1.4 }}>
                        {q.question}
                      </strong>
                    </div>

                    {/* Alternativas */}
                    <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', marginLeft: isMobile ? '0' : '36px' }}>
                      {q.options.map((opt, optIdx) => {
                        const isThisSelected = answers[qIdx] === optIdx;
                        const isThisTheCorrectAnswer = submittedQuiz && optIdx === q.answer;

                        let optBg = '#f8fafc';
                        let optBorder = '#e2e8f0';
                        let optColor = '#334155';

                        if (submittedQuiz) {
                          if (isThisTheCorrectAnswer) {
                            optBg = '#ecfdf5';
                            optBorder = '#10b981';
                            optColor = '#065f46';
                          } else if (isThisSelected && !isThisTheCorrectAnswer) {
                            optBg = '#fef2f2';
                            optBorder = '#ef4444';
                            optColor = '#991b1b';
                          }
                        } else if (isThisSelected) {
                          optBg = '#f0f9ff';
                          optBorder = '#0284c7';
                          optColor = '#0369a1';
                        }

                        return (
                          <div
                            key={`opt-${optIdx}`}
                            onClick={() => handleSelectAnswer(qIdx, optIdx)}
                            className={!submittedQuiz ? "quiz-opt-hover" : ""}
                            style={{
                              background: optBg,
                              border: `1.5px solid ${optBorder}`,
                              color: optColor,
                              borderRadius: '10px',
                              padding: '10px 14px',
                              fontSize: '0.84rem',
                              fontWeight: isThisSelected ? 800 : 500,
                              cursor: submittedQuiz ? 'default' : 'pointer',
                              display: 'flex',
                              alignItems: 'center',
                              justifyContent: 'space-between',
                              gap: '10px',
                              transition: 'all 0.15s ease',
                              boxShadow: isThisSelected && !submittedQuiz ? '0 2px 8px rgba(2, 132, 199, 0.15)' : 'none'
                            }}
                          >
                            <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                              <div style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                border: isThisSelected ? '5px solid #0284c7' : '2px solid #cbd5e1',
                                background: '#ffffff',
                                flexShrink: 0
                              }} />
                              <span>{opt}</span>
                            </div>
                            {submittedQuiz && isThisTheCorrectAnswer && (
                              <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                            )}
                          </div>
                        );
                      })}
                    </div>

                    {/* Justificación / Explicación */}
                    {submittedQuiz && q.explanation && (
                      <div style={{
                        background: '#f8fafc',
                        border: '1px solid #e2e8f0',
                        borderRadius: '10px',
                        padding: '10px 14px',
                        fontSize: '0.78rem',
                        color: '#475569',
                        marginLeft: isMobile ? '0' : '36px'
                      }}>
                        💡 <strong style={{ color: '#0f172a' }}>Explicación:</strong> {q.explanation}
                      </div>
                    )}

                  </div>
                );
              })}

            </div>

            {/* Footer Paso 3 */}
            <div style={{
              padding: isMobile ? '12px 16px' : '14px 24px',
              borderTop: '1px solid #e2e8f0',
              background: '#ffffff',
              display: 'flex',
              justifyContent: 'flex-end',
              alignItems: 'center',
              flexShrink: 0
            }}>
              {!submittedQuiz ? (
                <button
                  onClick={handleSubmitQuiz}
                  disabled={!isAllAnswered || savingQuiz}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '0.88rem',
                    fontWeight: 900,
                    background: isAllAnswered
                      ? 'linear-gradient(135deg, #0284c7, #0369a1)'
                      : '#cbd5e1',
                    color: '#ffffff',
                    cursor: isAllAnswered && !savingQuiz ? 'pointer' : 'not-allowed',
                    boxShadow: isAllAnswered ? '0 4px 16px rgba(2, 132, 199, 0.35)' : 'none',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <Award className="w-4 h-4" />
                  <span>Enviar Evaluación</span>
                </button>
              ) : quizScore === 5 ? (
                <button
                  onClick={() => {
                    if (onViewCertificate) onViewCertificate();
                  }}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 24px',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '0.88rem',
                    fontWeight: 900,
                    background: 'linear-gradient(135deg, #10b981, #059669)',
                    color: '#ffffff',
                    cursor: 'pointer',
                    boxShadow: '0 4px 16px rgba(16, 185, 129, 0.35)'
                  }}
                >
                  <Award className="w-4 h-4" />
                  <span>Ver Constancia de Capacitación 🎓</span>
                </button>
              ) : (
                <button
                  onClick={loadRandomQuestions}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '10px 22px',
                    borderRadius: '12px',
                    border: 'none',
                    fontSize: '0.88rem',
                    fontWeight: 800,
                    background: '#dc2626',
                    color: '#ffffff',
                    cursor: 'pointer',
                    boxShadow: '0 4px 14px rgba(220, 38, 38, 0.3)'
                  }}
                >
                  <RotateCcw className="w-4 h-4" />
                  <span>Reintentar Evaluación</span>
                </button>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
