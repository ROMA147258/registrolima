import React, { useState, useEffect, useRef } from 'react';
import { X, FileText, Lightbulb, Lock, CheckCircle2, AlertCircle, RefreshCw, Award, ArrowRight } from 'lucide-react';
import { getRandomQuestions } from '../../constants/quizData.js';
import confetti from 'canvas-confetti';

export function QuizModal({ onClose, onPassQuiz }) {
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
    setShowResultPopup(true);

    if (correctCount === 5) {
      confetti({ particleCount: 120, spread: 90, origin: { y: 0.5 } });
      try {
        setSubmitting(true);
        await onPassQuiz();
      } catch (err) {
        console.error('Error guardando progreso:', err);
      } finally {
        setSubmitting(false);
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
        maxWidth: '740px',
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
            <div style={{ width: '38px', height: '38px', borderRadius: '8px', background: 'rgba(56, 189, 248, 0.12)', color: '#38bdf8', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <FileText className="w-5 h-5" />
            </div>
            <div>
              <h3 style={{ fontSize: '1.1rem', fontWeight: 800, color: '#ffffff', margin: 0 }}>
                Cuestionario Oficial de Capacitación Electoral
              </h3>
              <div style={{ fontSize: '0.75rem', color: '#38bdf8', fontWeight: 600, marginTop: '2px' }}>
                5 preguntas aleatorias del banco de 100 • Aprobación requerida: 5/5 (100%)
              </div>
            </div>
          </div>
          <button onClick={onClose} style={{ background: 'none', border: 'none', color: '#94a3b8', cursor: 'pointer', padding: '4px' }}>
            <X className="w-6 h-6 text-slate-300" />
          </button>
        </div>

        {/* Cuerpo con Scroll */}
        <div ref={scrollRef} style={{ padding: '20px 24px', overflowY: 'auto', flex: 1 }}>
          
          {/* Cuadro de Instrucciones */}
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
              <strong style={{ color: '#ffffff' }}>Instrucciones:</strong> Responde las 5 preguntas sobre la jornada electoral. Necesitas aprobar las <strong>5 de 5 respuestas correctas (100%)</strong> para aprobar el cuestionario y desbloquear tu Certificado Oficial.
            </div>
          </div>

          {/* Lista de las 5 Preguntas (Sin revelar respuestas) */}
          <div style={{ display: 'flex', flexDirection: 'column', gap: '18px' }}>
            {questions.map((q, qIdx) => {
              const selectedOpt = answers[qIdx];
              const isAnswered = selectedOpt !== undefined;

              return (
                <div
                  key={qIdx}
                  style={{
                    background: '#182238',
                    border: isAnswered ? '1.5px solid rgb(14, 165, 233)' : '1px solid #233554',
                    borderRadius: '12px',
                    padding: '18px',
                    transition: 'all 0.15s ease'
                  }}
                >
                  <div style={{ display: 'flex', justifyContent: 'space-between', alignItems: 'center', marginBottom: '10px' }}>
                    <span style={{
                      background: 'rgba(56, 189, 248, 0.15)',
                      color: '#38bdf8',
                      padding: '3px 10px',
                      borderRadius: '12px',
                      fontSize: '0.74rem',
                      fontWeight: 800
                    }}>
                      Pregunta {qIdx + 1} de 5
                    </span>
                  </div>

                  <h4 style={{ fontSize: '0.96rem', fontWeight: 700, color: '#f8fafc', margin: '0 0 14px 0', lineHeight: 1.4 }}>
                    {q.question}
                  </h4>

                  <div style={{ display: 'flex', flexDirection: 'column', gap: '8px' }}>
                    {q.options.map((opt, optIdx) => {
                      const isSelected = selectedOpt === optIdx;

                      return (
                        <div
                          key={optIdx}
                          onClick={() => handleSelect(qIdx, optIdx)}
                          style={{
                            background: isSelected ? 'rgba(14, 165, 233, 0.15)' : '#0f172a',
                            border: isSelected ? '1.5px solid rgb(14, 165, 233)' : '1.5px solid #1e293b',
                            borderRadius: '10px',
                            padding: '10px 14px',
                            display: 'flex',
                            alignItems: 'center',
                            gap: '12px',
                            cursor: 'pointer',
                            color: isSelected ? '#ffffff' : '#e2e8f0',
                            fontSize: '0.86rem',
                            fontWeight: isSelected ? 700 : 500,
                            transition: 'all 0.15s ease'
                          }}
                        >
                          <div style={{
                            width: '18px',
                            height: '18px',
                            borderRadius: '50%',
                            border: isSelected ? '5px solid rgb(14, 165, 233)' : '2px solid #64748b',
                            background: isSelected ? '#ffffff' : 'transparent',
                            flexShrink: 0
                          }}></div>
                          <span style={{ flex: 1 }}>{opt}</span>
                        </div>
                      );
                    })}
                  </div>
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
          alignItems: 'center'
        }}>
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
        </div>

        {/* POPUP DE RESULTADO ÚNICO (Sin opción de ver respuestas) */}
        {showResultPopup && (
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
              border: score === 5 ? '2px solid #10b981' : '2px solid #ef4444',
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
                  background: score === 5 ? 'rgba(16, 185, 129, 0.2)' : 'rgba(239, 68, 68, 0.2)',
                  color: score === 5 ? '#34d399' : '#f87171',
                  display: 'flex',
                  alignItems: 'center',
                  justifyContent: 'center',
                  border: score === 5 ? '2px solid #10b981' : '2px solid #ef4444'
                }}>
                  {score === 5 ? <Award className="w-10 h-10" /> : <AlertCircle className="w-10 h-10" />}
                </div>
              </div>

              {/* Título */}
              <h2 style={{ fontSize: '1.45rem', fontWeight: 900, color: score === 5 ? '#34d399' : '#f87171', margin: '0 0 8px 0' }}>
                {score === 5 ? '¡FELICITACIONES! APROBASTE' : 'EVALUACIÓN NO APROBADA'}
              </h2>

              {/* Puntaje Destacado */}
              <div style={{ fontSize: '2.4rem', fontWeight: 900, color: '#ffffff', margin: '10px 0' }}>
                {score} / 5 <span style={{ fontSize: '1rem', color: '#94a3b8', fontWeight: 600 }}>({score * 20}%)</span>
              </div>

              {/* Descripción */}
              <p style={{ fontSize: '0.88rem', color: '#cbd5e1', lineHeight: 1.5, margin: '0 0 26px 0' }}>
                {score === 5
                  ? 'Has obtenido un puntaje perfecto de 5/5 (100%). Tu capacitación ha sido registrada exitosamente y tu Certificado Oficial de Acreditación ya se encuentra habilitado.'
                  : 'Para obtener tu acreditación oficial se requiere un puntaje perfecto de 5/5. Presiona el botón para intentarlo nuevamente con 5 preguntas nuevas del banco oficial.'}
              </p>

              {/* Botón Único de Acción */}
              {score === 5 ? (
                <button
                  onClick={onClose}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '10px',
                    border: 'none',
                    background: '#10b981',
                    color: '#ffffff',
                    fontSize: '1rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 15px rgba(16, 185, 129, 0.4)'
                  }}
                >
                  <span>Ver Mi Certificado Oficial</span>
                  <ArrowRight className="w-5 h-5" />
                </button>
              ) : (
                <button
                  onClick={loadRandomQuestions}
                  style={{
                    width: '100%',
                    padding: '14px',
                    borderRadius: '10px',
                    border: 'none',
                    background: 'rgb(14, 165, 233)',
                    color: '#ffffff',
                    fontSize: '0.98rem',
                    fontWeight: 900,
                    cursor: 'pointer',
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'center',
                    gap: '8px',
                    boxShadow: '0 4px 15px rgba(14, 165, 233, 0.4)'
                  }}
                >
                  <RefreshCw className="w-5 h-5" />
                  <span>Intentar otra vez con 5 preguntas nuevas</span>
                </button>
              )}

            </div>
          </div>
        )}

      </div>
    </div>
  );
}
