import React, { useState, useEffect, useRef } from 'react';
import { X, FileText, Lightbulb, Lock, CheckCircle2, XCircle, AlertCircle, RefreshCw, Award, ArrowRight, BookOpen } from 'lucide-react';
import { getRandomQuestions } from '../../constants/quizData.js';
import confetti from 'canvas-confetti';

export function QuizModal({ onClose, onPassQuiz, onViewCertificate }) {
  const [questions, setQuestions] = useState([]);
  const [answers, setAnswers] = useState({});
  const [submitted, setSubmitted] = useState(false);
  const [score, setScore] = useState(0);
  const [submitting, setSubmitting] = useState(false);
  const [showResultPopup, setShowResultPopup] = useState(false);
  const scrollRef = useRef(null);

  // Cargar 5 preguntas aleatorias del banco de 100 con alternativas permutadas
  const loadRandomQuestions = () => {
    setQuestions(getRandomQuestions(5));
    setAnswers({});
    setSubmitted(false);
    setScore(0);
    setShowResultPopup(false);
    if (scrollRef.current) {
      scrollRef.current.scrollTop = 0;
    }
  };

  useEffect(() => {
    loadRandomQuestions();
  }, []);

  const totalAnswered = Object.keys(answers).length;
  const isAllAnswered = totalAnswered === 5;

  const handleSelect = (questionIndex, optionIndex) => {
    if (submitted) return;
    setAnswers(prev => ({
      ...prev,
      [questionIndex]: optionIndex
    }));
  };

  const handleSubmit = async () => {
    if (!isAllAnswered) return;

    let correctCount = 0;
    questions.forEach((q, idx) => {
      if (answers[idx] === q.answer) {
        correctCount++;
      }
    });

    setScore(correctCount);
    setSubmitted(true);

    if (correctCount === 5) {
      setShowResultPopup(true);
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
      try {
        setSubmitting(true);
        await onPassQuiz();
      } catch (err) {
        console.error('Error guardando progreso:', err);
      } finally {
        setSubmitting(false);
      }
    } else {
      // Scroll arriba para ver la revisión de respuestas
      if (scrollRef.current) {
        scrollRef.current.scrollTop = 0;
      }
    }
  };

  return (
    <div className="modal-backdrop" style={{ background: 'rgba(11, 19, 41, 0.92)', backdropFilter: 'blur(8px)', zIndex: 9999 }}>
      <div style={{
        background: '#131b2e',
        border: '1.5px solid #233554',
        borderRadius: '16px',
        width: '100%',
        maxWidth: '760px',
        maxHeight: '92vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.8)',
        color: '#ffffff',
        overflow: 'hidden',
        position: 'relative',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        
        {/* Encabezado */}
        <div style={{ padding: '18px 24px', borderBottom: '1px solid #233554', display: 'flex', alignItems: 'center', justifyContent: 'space-between', background: '#111827' }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '12px' }}>
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: submitted && score < 5 ? 'rgba(239, 68, 68, 0.15)' : 'rgba(56, 189, 248, 0.12)', color: submitted && score < 5 ? '#f87171' : '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              {submitted && score < 5 ? <BookOpen className="w-5 h-5" /> : <FileText className="w-5 h-5" />}
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                {submitted && score < 5 ? 'Revisión y Corrección de Respuestas' : 'Cuestionario Oficial de Capacitación Electoral'}
              </h3>
              <div style={{ fontSize: '0.75rem', color: submitted && score < 5 ? '#f87171' : '#38bdf8', fontWeight: 600, marginTop: '2px' }}>
                {submitted && score < 5
                  ? `Puntaje obtenido: ${score}/5 (${score * 20}%) — Revisa las respuestas correctas antes de volver a dar el examen`
                  : '5 preguntas aleatorias del banco de 100 • Aprobación requerida: 5/5 (100%)'}
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
            <X className="w-6 h-6 text-slate-300" />
          </button>
        </div>

        {/* Cuerpo con Scroll */}
        <div ref={scrollRef} style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          
          {/* Banner de Estado */}
          {!submitted ? (
            <div style={{
              background: 'rgba(30, 41, 59, 0.6)',
              borderLeft: '4px solid #38bdf8',
              borderRadius: '8px',
              padding: '12px 16px',
              marginBottom: '20px',
              display: 'flex',
              alignItems: 'flex-start',
              gap: '10px',
              fontSize: '0.85rem',
              color: '#cbd5e1',
              lineHeight: 1.45
            }}>
              <Lightbulb className="w-5 h-5 text-amber-400 flex-shrink-0" style={{ marginTop: '2px' }} />
              <div>
                <strong style={{ color: '#ffffff' }}>Instrucciones:</strong> Responde las 5 preguntas sobre la jornada electoral. Necesitas aprobar las <strong>5 de 5 respuestas correctas (100%)</strong> para completar tu acreditación oficial.
              </div>
            </div>
          ) : score < 5 ? (
            <div style={{
              background: 'rgba(239, 68, 68, 0.12)',
              border: '1.5px solid #ef4444',
              borderRadius: '12px',
              padding: '16px 20px',
              marginBottom: '20px',
              display: 'flex',
              flexDirection: 'column',
              gap: '8px',
              animation: 'fadeIn 0.25s ease-out'
            }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '10px', color: '#f87171', fontWeight: 900, fontSize: '1rem' }}>
                <AlertCircle className="w-6 h-6 flex-shrink-0" />
                <span>EVALUACIÓN NO APROBADA — OBTUVISTE {score} DE 5 ({score * 20}%)</span>
              </div>
              <div style={{ fontSize: '0.84rem', color: '#fca5a5', lineHeight: 1.45 }}>
                Para obtener la acreditación oficial necesitas <strong>5/5 respuestas correctas</strong>. Revisa a continuación cuáles marcaste incorrectamente (rojo), cuál es la respuesta correcta (verde) y la justificación del manual para aprender antes de tu siguiente intento.
              </div>
            </div>
          ) : null}

          {/* Lista de las 5 Preguntas */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '20px' }}>
            {questions.map((q, qIdx) => {
              const selectedOpt = answers[qIdx];
              const isAnswered = selectedOpt !== undefined;
              const isUserCorrect = selectedOpt === q.answer;

              return (
                <div
                  key={qIdx}
                  style={{
                    background: '#182238',
                    border: submitted
                      ? (isUserCorrect ? '2px solid #10b981' : '2px solid #ef4444')
                      : (isAnswered ? '1.5px solid rgb(14, 165, 233)' : '1px solid #233554'),
                    borderRadius: '14px',
                    padding: '18px 20px',
                    transition: 'all 0.2s ease',
                    boxShadow: submitted ? (isUserCorrect ? '0 4px 15px rgba(16, 185, 129, 0.1)' : '0 4px 15px rgba(239, 68, 68, 0.1)') : 'none'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{
                      background: submitted
                        ? (isUserCorrect ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)')
                        : 'rgba(56, 189, 248, 0.15)',
                      color: submitted
                        ? (isUserCorrect ? '#34d399' : '#f87171')
                        : '#38bdf8',
                      padding: '3px 12px',
                      borderRadius: '12px',
                      fontSize: '0.76rem',
                      fontWeight: 800,
                      display: 'flex',
                      alignItems: 'center',
                      gap: '5px'
                    }}>
                      {submitted && (isUserCorrect ? <CheckCircle2 className="w-3.5 h-3.5" /> : <XCircle className="w-3.5 h-3.5" />)}
                      <span>Pregunta {qIdx + 1} de 5 {submitted && (isUserCorrect ? '• Correcta (+1)' : '• Incorrecta (0)')}</span>
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.98rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 14px 0', lineHeight: 1.45 }}>
                    {q.question}
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedOpt === optIdx;
                      const isCorrectAnswer = optIdx === q.answer;

                      // Estilos según si ya se envió el examen o está en curso
                      let bg = '#0f172a';
                      let border = '1.5px solid #1e293b';
                      let textColor = '#e2e8f0';
                      let badge = null;

                      if (!submitted) {
                        if (isSelected) {
                          bg = 'rgba(14, 165, 233, 0.15)';
                          border = '1.5px solid rgb(14, 165, 233)';
                          textColor = '#ffffff';
                        }
                      } else {
                        // Modo Revisión
                        if (isCorrectAnswer) {
                          bg = 'rgba(16, 185, 129, 0.18)';
                          border = '2px solid #10b981';
                          textColor = '#ffffff';
                          badge = isSelected ? '✅ ¡Tu respuesta correcta!' : '✅ Respuesta correcta';
                        } else if (isSelected && !isCorrectAnswer) {
                          bg = 'rgba(239, 68, 68, 0.18)';
                          border = '2px solid #ef4444';
                          textColor = '#ffffff';
                          badge = '❌ Tu respuesta (Incorrecta)';
                        } else {
                          bg = 'rgba(15, 23, 42, 0.6)';
                          border = '1px solid #1e293b';
                          textColor = '#64748b';
                        }
                      }

                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleSelect(qIdx, optIdx)}
                          style={{
                            background: bg,
                            border: border,
                            borderRadius: '10px',
                            padding: '12px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            justifyContent: 'space-between',
                            gap: '12px',
                            cursor: submitted ? 'default' : 'pointer',
                            color: textColor,
                            fontSize: '0.86rem',
                            fontWeight: isSelected || (submitted && isCorrectAnswer) ? 700 : 500,
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', flex: 1 }}>
                            {!submitted ? (
                              <div style={{
                                width: '18px',
                                height: '18px',
                                borderRadius: '50%',
                                border: isSelected ? '5px solid rgb(14, 165, 233)' : '2px solid #64748b',
                                background: isSelected ? '#ffffff' : 'transparent',
                                flexShrink: 0
                              }}></div>
                            ) : (
                              <div style={{ flexShrink: 0 }}>
                                {isCorrectAnswer ? (
                                  <CheckCircle2 className="w-5 h-5 text-emerald-400" />
                                ) : isSelected ? (
                                  <XCircle className="w-5 h-5 text-red-400" />
                                ) : (
                                  <div style={{ width: '18px', height: '18px', borderRadius: '50%', border: '1.5px solid #334155' }}></div>
                                )}
                              </div>
                            )}
                            <span style={{ flex: 1, lineHeight: 1.35 }}>{opt}</span>
                          </div>

                          {badge && (
                            <span style={{
                              fontSize: '0.72rem',
                              fontWeight: 800,
                              padding: '2px 8px',
                              borderRadius: '6px',
                              background: isCorrectAnswer ? '#047857' : '#991b1b',
                              color: '#ffffff',
                              whiteSpace: 'nowrap'
                            }}>
                              {badge}
                            </span>
                          )}
                        </div>
                      );
                    })}
                  </div>

                  {/* Justificación y Explicación en Modo Revisión */}
                  {submitted && q.explanation && (
                    <div style={{
                      marginTop: '12px',
                      background: 'rgba(30, 41, 59, 0.7)',
                      borderLeft: '3.5px solid #38bdf8',
                      borderRadius: '8px',
                      padding: '10px 14px',
                      fontSize: '0.82rem',
                      color: '#cbd5e1',
                      display: 'flex',
                      alignItems: 'flex-start',
                      gap: '8px',
                      lineHeight: 1.45
                    }}>
                      <Lightbulb className="w-4 h-4 text-amber-400 flex-shrink-0" style={{ marginTop: '2px' }} />
                      <div>
                        <strong style={{ color: '#38bdf8' }}>Fundamento Electoral:</strong> {q.explanation}
                      </div>
                    </div>
                  )}

                </div>
              );
            })}
          </div>

        </div>

        {/* Footer */}
        <div style={{
          padding: '16px 24px',
          borderTop: '1px solid #233554',
          background: '#111827',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          {!submitted ? (
            <>
              <div style={{ fontSize: '0.85rem', color: '#94a3b8', fontWeight: 600 }}>
                Respondidas: <strong style={{ color: isAllAnswered ? '#38bdf8' : '#ffffff' }}>{totalAnswered}/5</strong>
              </div>

              <button
                onClick={handleSubmit}
                disabled={!isAllAnswered || submitting}
                style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '8px',
                  padding: '10px 24px',
                  borderRadius: '10px',
                  border: 'none',
                  background: isAllAnswered ? 'rgb(14, 165, 233)' : '#1e293b',
                  color: isAllAnswered ? '#ffffff' : '#64748b',
                  fontSize: '0.9rem',
                  fontWeight: 800,
                  cursor: isAllAnswered ? 'pointer' : 'not-allowed',
                  boxShadow: isAllAnswered ? '0 4px 15px rgba(14, 165, 233, 0.4)' : 'none',
                  transition: 'all 0.2s ease'
                }}
              >
                {isAllAnswered ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
                <span>{isAllAnswered ? 'Enviar Respuestas' : 'Responda todas para enviar'}</span>
              </button>
            </>
          ) : (
            <>
              <div style={{ fontSize: '0.88rem', color: score === 5 ? '#34d399' : '#f87171', fontWeight: 800 }}>
                Resultado: {score} de 5 correctas ({score * 20}%)
              </div>

              {score < 5 ? (
                <button
                  onClick={loadRandomQuestions}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '11px 24px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'rgb(14, 165, 233)',
                    color: '#ffffff',
                    fontSize: '0.92rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(14, 165, 233, 0.4)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <RefreshCw className="w-4 h-4" />
                  <span>Intentar otra vez (5 preguntas nuevas)</span>
                </button>
              ) : (
                <button
                  onClick={onClose}
                  style={{
                    display: 'inline-flex',
                    alignItems: 'center',
                    gap: '8px',
                    padding: '11px 24px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#10b981',
                    color: '#ffffff',
                    fontSize: '0.92rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <CheckCircle2 className="w-4 h-4" />
                  <span>Finalizar y Continuar</span>
                </button>
              )}
            </>
          )}
        </div>

        {/* POPUP DE FELICITACIÓN (Solo si aprobó 5/5) */}
        {showResultPopup && score === 5 && (
          <div style={{
            position: 'absolute',
            inset: 0,
            background: 'rgba(11, 19, 41, 0.95)',
            backdropFilter: 'blur(8px)',
            display: 'flex',
            alignItems: 'center',
            justifyContent: 'center',
            padding: '24px',
            zIndex: 100
          }}>
            <div style={{
              background: '#182238',
              border: '2px solid #10b981',
              borderRadius: '20px',
              maxWidth: '460px',
              width: '100%',
              padding: '36px 28px',
              textAlign: 'center',
              boxShadow: '0 25px 50px rgba(0,0,0,0.8)',
              animation: 'fadeIn 0.25s ease-out'
            }}>
              
              {/* Icono de Estado */}
              <div style={{ display: 'flex', justifyContent: 'center', marginBottom: '16px' }}>
                <div style={{
                  width: '76px',
                  height: '76px',
                  borderRadius: '50%',
                  background: 'rgba(16, 185, 129, 0.2)',
                  color: '#34d399',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: '2px solid #10b981'
                }}>
                  <CheckCircle2 className="w-10 h-10" />
                </div>
              </div>

              {/* Título */}
              <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: '#34d399', margin: '0 0 8px 0' }}>
                ¡FELICITACIONES! APROBASTE
              </h2>

              {/* Puntaje Destacado */}
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#ffffff', margin: '10px 0' }}>
                5 / 5 <span style={{ fontSize: '1rem', color: '#34d399', fontWeight: 700 }}>(100%)</span>
              </div>

              {/* Descripción */}
              <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5, margin: '0 0 26px 0' }}>
                Has obtenido un puntaje perfecto de 5/5 (100%). Tu capacitación y evaluación electoral han sido aprobadas exitosamente.
              </p>

              {/* Botones de Acción */}
              <div style={{ display: 'flex', flexDirection: 'column', gap: '10px' }}>
                {onViewCertificate && (
                  <button
                    onClick={() => {
                      onClose();
                      onViewCertificate();
                    }}
                    style={{
                      width: '100%',
                      padding: '13px',
                      borderRadius: '10px',
                      border: 'none',
                      background: 'linear-gradient(90deg, #0284c7, #0369a1)',
                      color: '#ffffff',
                      fontSize: '0.98rem',
                      fontWeight: 900,
                      cursor: 'pointer',
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'center',
                      gap: '8px',
                      boxShadow: '0 4px 15px rgba(2, 132, 199, 0.4)',
                      transition: 'all 0.2s ease'
                    }}
                  >
                    <Award className="w-5 h-5 text-amber-300" />
                    <span>🎓 Ver Mi Certificado Oficial</span>
                  </button>
                )}

                <button
                  onClick={onClose}
                  style={{
                    width: '100%',
                    padding: '12px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#10b981',
                    color: '#ffffff',
                    fontSize: '0.92rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 12px rgba(16, 185, 129, 0.35)',
                    transition: 'all 0.2s ease'
                  }}
                >
                  <CheckCircle2 className="w-5 h-5" />
                  <span>Finalizar y Continuar</span>
                </button>
              </div>

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
