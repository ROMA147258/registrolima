import React, { useState, useEffect, useRef } from 'react';
import { X, FileText, CheckCircle2, Lock, Clock, BookOpen, Download, Search, ChevronRight, Check, AlertTriangle, Shield, Award, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const SECTIONS = [
  {
    id: 1,
    title: "1. Bienvenida",
    tag: "Introducción",
    content: (
      <>
        <p className="text-slate-700 leading-relaxed font-medium">
          ¡Bienvenido al curso virtual para personeros de las <strong>Elecciones Regionales y Municipales 2026</strong>!
        </p>
        <p className="text-slate-700 leading-relaxed mt-2">
          En esta capacitación conocerás los principales aspectos que debes tener en cuenta para ejercer adecuadamente tu función durante la jornada electoral.
        </p>
        <p className="text-slate-700 leading-relaxed mt-2">
          Revisaremos tus <strong>derechos, funciones y prohibiciones</strong> en los tres momentos de la jornada electoral:
        </p>
        <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 mt-3">
          <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg text-sky-900 font-bold text-center text-sm">
            1. Instalación de la mesa
          </div>
          <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg text-indigo-900 font-bold text-center text-sm">
            2. El Sufragio
          </div>
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-lg text-emerald-900 font-bold text-center text-sm">
            3. El Escrutinio
          </div>
        </div>
        <p className="text-slate-700 leading-relaxed mt-3">
          Tu participación es fundamental para contribuir a la transparencia y al normal desarrollo del proceso electoral. A lo largo del curso encontrarás información práctica que te permitirá desempeñar tu función con responsabilidad y dentro del marco de la normativa electoral. <strong>¡Comencemos!</strong>
        </p>
      </>
    )
  },
  {
    id: 2,
    title: "2. Elecciones Regionales y Municipales 2026",
    tag: "Cifras y Fecha",
    content: (
      <>
        <div className="p-3 bg-amber-50 border-l-4 border-amber-500 rounded-r-lg mb-3">
          <p className="text-amber-900 font-bold text-sm">
            📅 Fecha central: <strong>Domingo 4 de octubre de 2026</strong>
          </p>
        </div>
        <p className="text-slate-700 leading-relaxed">
          En esta jornada, la ciudadanía elegirá a las autoridades regionales y municipales que ejercerán sus funciones durante el periodo correspondiente.
        </p>
        <div className="mt-3 p-4 bg-slate-900 text-white rounded-xl">
          <p className="text-xs text-sky-400 font-bold uppercase tracking-wider mb-2">Total de Autoridades a Elegir</p>
          <div className="text-3xl font-black text-white mb-3">13 148 <span className="text-sm font-normal text-slate-300">autoridades a nivel nacional</span></div>
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-2 text-xs">
            <div className="bg-slate-800 p-2.5 rounded-lg border border-slate-700">
              <span className="text-sky-300 font-bold text-base block">414</span>
              <span className="text-slate-300">Autoridades Regionales</span>
            </div>
            <div className="bg-slate-800 p-2.5 rounded-lg border border-slate-700">
              <span className="text-indigo-300 font-bold text-base block">1 920</span>
              <span className="text-slate-300">Autoridades Provinciales</span>
            </div>
            <div className="bg-slate-800 p-2.5 rounded-lg border border-slate-700">
              <span className="text-emerald-300 font-bold text-base block">10 814</span>
              <span className="text-slate-300">Autoridades Distritales</span>
            </div>
          </div>
        </div>
        <p className="text-slate-700 leading-relaxed mt-3">
          Estas autoridades serán elegidas para conducir los gobiernos regionales y municipales. Se trata de una jornada electoral de gran importancia para la ciudadanía y para el fortalecimiento de la democracia.
        </p>
      </>
    )
  },
  {
    id: 3,
    title: "3. El Personero y su Función",
    tag: "Rol e Impedimentos",
    content: (
      <>
        <p className="text-slate-700 leading-relaxed">
          Para que una elección se desarrolle adecuadamente, intervienen diversos actores electorales, cada uno con funciones específicas. Entre ellos se encuentra el <strong>personero de una organización política</strong>.
        </p>
        <div className="p-3 bg-blue-50 border border-blue-200 rounded-lg mt-2 text-blue-950 text-sm font-semibold">
          🛡️ <strong>Definición:</strong> El personero es el ciudadano acreditado por una organización política para <u>representar, cuidar y defender sus intereses</u> durante el proceso electoral, de acuerdo con las disposiciones electorales vigentes.
        </div>
        <p className="text-slate-700 leading-relaxed mt-3">
          Por ello, el ejercicio de esta función exige <strong>responsabilidad, respeto y estricto cumplimiento de las normas</strong>.
        </p>
        <div className="p-3 bg-rose-50 border border-rose-200 rounded-lg mt-3">
          <p className="text-rose-900 font-bold text-xs uppercase tracking-wider mb-1">🚫 Impedimentos para ser personero:</p>
          <ul className="list-disc list-inside text-rose-800 text-sm space-y-1">
            <li>Los <strong>candidatos</strong> a cargos de elección popular.</li>
            <li>Los <strong>miembros de mesa</strong> (titulares y suplentes).</li>
            <li>Los <strong>funcionarios y servidores del sistema electoral</strong> (JNE, ONPE, Reniec).</li>
            <li>Los miembros en actividad de las <strong>Fuerzas Armadas y de la Policía Nacional del Perú</strong>.</li>
          </ul>
        </div>
      </>
    )
  },
  {
    id: 4,
    title: "4. Tipos de Personeros",
    tag: "Clasificación",
    content: (
      <>
        <p className="text-slate-700 leading-relaxed">
          En el proceso electoral participan diferentes tipos de personeros. En este curso conocerás las funciones del <strong>personero de local de votación</strong> y del <strong>personero de mesa</strong>, quienes desarrollan sus actividades durante la jornada electoral.
        </p>
        <p className="text-slate-700 leading-relaxed mt-2">
          Aunque ambos representan a una organización política, cada uno tiene funciones específicas y un ámbito de actuación determinado.
        </p>
      </>
    )
  },
  {
    id: 5,
    title: "5. Personero de Local de Votación",
    tag: "Ámbito del Local",
    content: (
      <>
        <p className="text-slate-700 leading-relaxed">
          Si eres <strong>personero de local de votación</strong>, tu función principal será <strong>observar el desarrollo de las actividades electorales dentro del local de votación</strong>.
        </p>
        <div className="mt-3 space-y-2 text-sm text-slate-800">
          <div className="p-2.5 bg-slate-100 rounded-lg flex items-start gap-2">
            <span className="text-sky-600 font-bold">✓</span>
            <span><strong>Coordinar y orientar:</strong> A los personeros de mesa de tu propia organización política.</span>
          </div>
          <div className="p-2.5 bg-slate-100 rounded-lg flex items-start gap-2">
            <span className="text-sky-600 font-bold">✓</span>
            <span><strong>Comunicación formal:</strong> Mantener comunicación con el coordinador de local de la ONPE, cuando corresponda.</span>
          </div>
          <div className="p-2.5 bg-slate-100 rounded-lg flex items-start gap-2">
            <span className="text-sky-600 font-bold">✓</span>
            <span><strong>Presencia temprana:</strong> Estar presente desde el inicio de la jornada electoral, contando con las facilidades necesarias.</span>
          </div>
        </div>
        <div className="p-3 bg-amber-50 border border-amber-200 rounded-lg mt-3 text-amber-900 text-sm">
          ⚠️ <strong>Regla de oro:</strong> Tu labor es de <strong>observación y vigilancia</strong>. Por ello, no debes interferir en las funciones de los miembros de mesa ni asumir funciones que no te corresponden (tampoco reemplazar personeros de mesa).
        </div>
      </>
    )
  },
  {
    id: 6,
    title: "6. Personero de Mesa",
    tag: "Ámbito de la Mesa",
    content: (
      <>
        <p className="text-slate-700 leading-relaxed">
          Si eres <strong>personero de mesa</strong>, al presentarte deberás mostrar tu <strong>DNI y tu credencial</strong> al presidente de mesa.
        </p>
        <p className="text-slate-700 leading-relaxed mt-2">
          El presidente de mesa te asignará una <strong>silla</strong> desde la cual podrás observar el desarrollo de las actividades electorales.
        </p>
        <p className="text-slate-700 leading-relaxed mt-2">
          Podrás ejercer tu función durante la <strong>instalación, el sufragio y el escrutinio</strong>, en la mesa o mesas en las que hayas sido debidamente acreditado.
        </p>
        <p className="text-slate-700 leading-relaxed mt-2">
          Tu responsabilidad será observar el trabajo de los miembros de mesa, sin interferir en sus funciones, y formular las <strong>observaciones o reclamos</strong> que correspondan cuando adviertas algún hecho que pudiera afectar el normal desarrollo y transparencia del proceso electoral.
        </p>
      </>
    )
  },
  {
    id: 7,
    title: "7. Instalación de la Mesa de Sufragio",
    tag: "Momento 1",
    content: (
      <>
        <p className="text-slate-700 leading-relaxed">
          Durante esta etapa, los miembros de mesa reciben, verifican y organizan el material electoral necesario para acondicionar la mesa e iniciar sus actividades.
        </p>
        <p className="text-slate-900 font-bold text-sm mt-3">Tus derechos durante la instalación:</p>
        <div className="mt-2 space-y-1.5 text-sm text-slate-800">
          <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Verificar que la <strong>relación de electores</strong> se encuentre colocada en el lugar visible exterior.</span>
          </div>
          <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Verificar que los <strong>carteles de candidatos</strong> estén colocados en la cámara secreta.</span>
          </div>
          <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span><strong>Firmar las cédulas de sufragio</strong> en el reverso, si así lo deseas (opcional).</span>
          </div>
          <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Formular <strong>observaciones o reclamos</strong> ante las situaciones que correspondan.</span>
          </div>
          <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span><strong>Firmar el acta de instalación</strong>, de manera opcional.</span>
          </div>
          <div className="p-2 bg-emerald-50 border border-emerald-100 rounded-lg flex items-center gap-2">
            <Check className="w-4 h-4 text-emerald-600 flex-shrink-0" />
            <span>Solicitar la <strong>nulidad de la mesa de sufragio</strong> cuando se configure alguna de las causales previstas en la ley.</span>
          </div>
        </div>
      </>
    )
  },
  {
    id: 8,
    title: "8. El Sufragio",
    tag: "Momento 2",
    content: (
      <>
        <p className="text-slate-700 leading-relaxed">
          Es la etapa en la que los electores ejercen su derecho de voto. Como personero, podrás observar el desarrollo del acto y verificar que se respeten las disposiciones electorales.
        </p>
        <p className="text-slate-900 font-bold text-sm mt-3">Derechos durante el sufragio:</p>
        <ul className="list-disc list-inside text-sm text-slate-800 space-y-1.5 mt-2 bg-slate-50 p-3 rounded-lg border border-slate-200">
          <li>Presenciar el acto de votación.</li>
          <li>Verificar que los electores ingresen <strong>solos a la cámara secreta</strong> (salvo voto asistido).</li>
          <li><strong>Votar después de los miembros de mesa presentes</strong>, cuando te corresponda sufragar en esa mesa.</li>
          <li><strong>Impugnar la identidad de un elector</strong>, cuando existan motivos fundados para ello.</li>
          <li>Formular las observaciones o reclamos que correspondan.</li>
          <li>Firmar la última página de la <strong>lista de electores y las actas de sufragio</strong>, si así lo deseas.</li>
        </ul>
        <div className="p-3 bg-indigo-50 border border-indigo-200 rounded-lg mt-3 text-indigo-950 text-sm">
          ♿ <strong>Atención Preferente y Módulo Temporal:</strong> Se garantiza a personas con discapacidad, movilidad reducida, gestantes y adultos mayores. Los miembros de mesa pueden trasladarse al Módulo Temporal de Votación en el primer piso. El personero puede acompañar respetando siempre la privacidad y autonomía del elector.
        </div>
      </>
    )
  },
  {
    id: 9,
    title: "9. El Escrutinio",
    tag: "Momento 3",
    content: (
      <>
        <p className="text-slate-700 leading-relaxed">
          En esta etapa, los miembros de mesa realizan el <strong>conteo y la calificación de los votos</strong> y registran los resultados en las respectivas actas electorales.
        </p>
        <div className="mt-3 space-y-2 text-sm text-slate-800">
          <div className="p-2.5 bg-slate-100 rounded-lg flex items-start gap-2">
            <span className="text-emerald-600 font-bold">1.</span>
            <span><strong>Presenciar la lectura de votos:</strong> Observar el contenido de cada cédula de sufragio.</span>
          </div>
          <div className="p-2.5 bg-slate-100 rounded-lg flex items-start gap-2">
            <span className="text-emerald-600 font-bold">2.</span>
            <span><strong>Impugnar votos:</strong> Cuando consideres que la calificación no se ajusta a la norma.</span>
          </div>
          <div className="p-2.5 bg-slate-100 rounded-lg flex items-start gap-2">
            <span className="text-emerald-600 font-bold">3.</span>
            <span><strong>Firmar las actas de escrutinio:</strong> Derecho opcional.</span>
          </div>
          <div className="p-2.5 bg-slate-100 rounded-lg flex items-start gap-2">
            <span className="text-emerald-600 font-bold">4.</span>
            <span><strong>Solicitar copia del acta electoral:</strong> De acuerdo con el procedimiento legal establecido.</span>
          </div>
        </div>
      </>
    )
  },
  {
    id: 10,
    title: "10. Prohibiciones de los Personeros",
    tag: "¡Muy Importante!",
    content: (
      <>
        <p className="text-slate-700 leading-relaxed">
          Para preservar el orden, la transparencia y el normal desarrollo, existen conductas terminantemente prohibidas:
        </p>
        <div className="p-3 bg-red-50 border border-red-200 rounded-lg mt-3 space-y-2 text-sm text-red-900 font-medium">
          <div className="flex items-center gap-2">❌ Preguntar a los electores por su <strong>preferencia electoral</strong>.</div>
          <div className="flex items-center gap-2">❌ Discutir con electores, miembros de mesa, personal de la ONPE u otros personeros.</div>
          <div className="flex items-center gap-2">❌ Interrumpir o perturbar el desarrollo del <strong>escrutinio</strong>.</div>
          <div className="flex items-center gap-2">❌ Realizar cualquier tipo de <strong>proselitismo o propaganda</strong> dentro del local.</div>
          <div className="flex items-center gap-2">❌ <strong>Manipular el material electoral</strong> (cédulas, actas, ánforas).</div>
          <div className="flex items-center gap-2">❌ Interferir en las funciones exclusivas de los miembros de mesa.</div>
          <div className="flex items-center gap-2">❌ Desempeñar funciones en la misma mesa 2 personeros del mismo partido.</div>
          <div className="flex items-center gap-2">❌ Reemplazar o asumir funciones de personeros de mesa si eres personero de local.</div>
        </div>
        <div className="p-2.5 bg-rose-100 border border-rose-300 rounded-lg mt-2 text-rose-900 text-xs font-bold">
          ⚠️ Sanción: El incumplimiento de estas disposiciones faculta a los miembros de mesa a ordenar tu <u>retiro del aula</u> con apoyo policial.
        </div>
      </>
    )
  },
  {
    id: 11,
    title: "11. Conociendo la Cédula de Sufragio",
    tag: "Independencia",
    content: (
      <>
        <p className="text-slate-700 leading-relaxed">
          La cédula contiene las opciones electorales correspondientes a los cargos regionales y municipales 2026.
        </p>
        <div className="p-3 bg-sky-50 border border-sky-200 rounded-lg mt-2 text-sky-900 text-sm">
          ⚖️ <strong>Principio de Independencia:</strong> Cada elección (Regional, Provincial, Distrital) debe ser evaluada <strong>de manera independiente</strong> durante el escrutinio. La nulidad o blanco en una columna no anula a las demás.
        </div>
      </>
    )
  },
  {
    id: 12,
    title: "12. Tipos de Voto",
    tag: "Calificación Oficial",
    content: (
      <>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 mt-2">
          {/* Voto Válido */}
          <div className="p-3 bg-emerald-50 border border-emerald-200 rounded-xl">
            <span className="px-2 py-0.5 bg-emerald-600 text-white rounded text-xs font-black uppercase">Válido</span>
            <p className="text-xs text-emerald-900 mt-2 leading-relaxed">
              Voluntad claramente identificada con <strong>cruz (+) o aspa (x)</strong>. La intersección debe estar <strong>dentro del recuadro</strong>. Marca tenue o trazo que sobrepase ligeramente no anula el voto.
            </p>
          </div>
          {/* Voto Nulo */}
          <div className="p-3 bg-rose-50 border border-rose-200 rounded-xl">
            <span className="px-2 py-0.5 bg-rose-600 text-white rounded text-xs font-black uppercase">Nulo</span>
            <p className="text-xs text-rose-900 mt-2 leading-relaxed">
              Signo distinto a cruz/aspa, intersección fuera del recuadro, marcar 2 partidos en la misma elección, firmas, DNI, nombres, frases o roturas.
            </p>
          </div>
          {/* Voto en Blanco */}
          <div className="p-3 bg-slate-100 border border-slate-300 rounded-xl">
            <span className="px-2 py-0.5 bg-slate-600 text-white rounded text-xs font-black uppercase">En Blanco</span>
            <p className="text-xs text-slate-700 mt-2 leading-relaxed">
              Sin ninguna marca en la opción electoral correspondiente. Evaluado de forma independiente por columna.
            </p>
          </div>
        </div>
      </>
    )
  },
  {
    id: 13,
    title: "13. Ubicación del Personero en el Escrutinio",
    tag: "Ubicación",
    content: (
      <>
        <p className="text-slate-700 leading-relaxed">
          Para observar adecuadamente el escrutinio, podrás acercar tu silla a la mesa de sufragio, manteniendo una <strong>distancia prudente</strong> que te permita ver la lectura y calificación de los votos sin obstaculizar.
        </p>
        <div className="p-3 bg-blue-900 text-white rounded-lg mt-3 text-center font-bold text-sm">
          💡 "Observar no significa intervenir" — Tu labor es vigilar y usar los mecanismos formales de reclamo o impugnación.
        </div>
      </>
    )
  },
  {
    id: 14,
    title: "14. Horario de la Jornada Electoral",
    tag: "Horarios",
    content: (
      <>
        <div className="p-4 bg-amber-50 border border-amber-300 rounded-xl text-center">
          <p className="text-xs text-amber-800 uppercase font-bold tracking-wider">Horario Oficial de Votación</p>
          <div className="text-2xl font-black text-amber-950 my-1">7:00 a.m. a 5:00 p.m.</div>
          <p className="text-xs text-amber-800 font-semibold">Domingo 4 de Octubre de 2026</p>
        </div>
        <p className="text-slate-700 text-sm leading-relaxed mt-3">
          Preséntate puntualmente antes de las 7:00 a.m. en tu local para presenciar la instalación de la mesa y la verificación de los materiales desde el inicio.
        </p>
      </>
    )
  },
  {
    id: 15,
    title: "15. Cierre de la Capacitación",
    tag: "Certificación",
    content: (
      <>
        <p className="text-slate-700 leading-relaxed">
          ¡Felicitaciones por completar el estudio del guion oficial de capacitación electoral! Tu compromiso y vigilancia responsable garantizan la transparencia e integridad del sufragio democrático.
        </p>
        <div className="p-3 bg-emerald-50 border border-emerald-300 rounded-xl mt-3 flex items-center gap-3">
          <Award className="w-8 h-8 text-emerald-600 flex-shrink-0" />
          <div className="text-xs text-emerald-900">
            <p className="font-bold text-sm text-emerald-950">¡Estás listo para la evaluación!</p>
            Al culminar el tiempo de lectura, confirma tu progreso y rinde el cuestionario de 5 preguntas aleatorias del banco oficial.
          </div>
        </div>
      </>
    )
  }
];

export function PdfModal({ onClose, onComplete, currentPdfCount = 0 }) {
  const [timeLeft, setTimeLeft] = useState(120); // 2 minutos
  const [submitting, setSubmitting] = useState(false);
  const [searchTerm, setSearchTerm] = useState('');
  const [selectedSection, setSelectedSection] = useState(null);
  const contentRef = useRef(null);

  useEffect(() => {
    if (timeLeft <= 0) return;
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const canConfirm = timeLeft === 0;

  const formatTime = (seconds) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
  };

  const handleConfirm = async () => {
    if (!canConfirm || submitting) return;
    setSubmitting(true);
    try {
      await onComplete();
      confetti({ particleCount: 60, spread: 70, origin: { y: 0.8 } });
      onClose();
    } catch (err) {
      alert(err.message || 'Error al registrar lectura.');
    } finally {
      setSubmitting(false);
    }
  };

  const filteredSections = SECTIONS.filter(s => 
    s.title.toLowerCase().includes(searchTerm.toLowerCase()) ||
    s.tag.toLowerCase().includes(searchTerm.toLowerCase())
  );

  return (
    <div className="modal-backdrop" style={{ background: 'rgba(11, 19, 41, 0.92)', backdropFilter: 'blur(8px)', zIndex: 9999 }}>
      <div style={{
        background: '#ffffff',
        borderRadius: '18px',
        width: '100%',
        maxWidth: '1020px',
        height: '94vh',
        display: 'flex',
        flexDirection: 'column',
        boxShadow: '0 25px 50px -12px rgba(0, 0, 0, 0.7)',
        overflow: 'hidden',
        animation: 'fadeIn 0.2s ease-out'
      }}>
        
        {/* Encabezado Principal */}
        <div style={{
          padding: '14px 20px',
          borderBottom: '1px solid #e2e8f0',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#0f172a',
          color: '#ffffff',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div style={{ width: '40px', height: '40px', borderRadius: '10px', background: 'linear-gradient(135deg, #10b981, #059669)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center' }}>
              <BookOpen className="w-5 h-5" />
            </div>
            <div>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 style={{ fontSize: '1.05rem', fontWeight: 900, margin: 0, letterSpacing: '-0.01em' }}>
                  Guion Oficial de Capacitación para Personeros ERM 2026
                </h3>
                <span className="px-2 py-0.5 text-[10px] bg-sky-500/20 text-sky-300 rounded-full font-bold border border-sky-500/30">
                  Documento Word
                </span>
              </div>
              <div style={{ fontSize: '0.74rem', color: '#94a3b8' }}>
                Elecciones Regionales y Municipales 2026 — Lectura requerida ({currentPdfCount}/2)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            <a
              href="/manuals/Guion_Capacitacion_Personeros_ERM_2026.docx"
              download
              className="inline-flex items-center gap-1.5 px-3 py-1.5 bg-slate-800 hover:bg-slate-700 text-sky-400 hover:text-white rounded-lg text-xs font-bold transition-all border border-slate-700"
              title="Descargar archivo Word original"
            >
              <Download className="w-3.5 h-3.5" />
              <span>Descargar .docx</span>
            </a>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.08)',
                border: 'none',
                color: '#cbd5e1',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '8px'
              }}
            >
              <X className="w-5 h-5" />
            </button>
          </div>
        </div>

        {/* Banner de Tiempo de Lectura y Búsqueda */}
        <div style={{
          background: canConfirm ? '#ecfdf5' : '#f0f9ff',
          borderBottom: canConfirm ? '1.5px solid #10b981' : '1.5px solid #bae6fd',
          padding: '10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.82rem',
          flexWrap: 'wrap',
          gap: '10px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '8px', color: canConfirm ? '#047857' : '#0369a1', fontWeight: 700 }}>
            {canConfirm ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>¡Tiempo completado! Has cumplido el tiempo mínimo de estudio.</span>
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 text-sky-600" />
                <span>Lectura activa del Guion de Capacitación: Lee las 15 secciones antes de rendir el examen.</span>
              </>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '10px' }}>
            <div className="relative">
              <input 
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar tema en el texto..."
                className="pl-7 pr-2 py-1 text-xs bg-white border border-slate-300 rounded-lg text-slate-800 placeholder-slate-400 focus:outline-none focus:ring-1 focus:ring-sky-500 w-44"
              />
              <Search className="w-3.5 h-3.5 text-slate-400 absolute left-2 top-2" />
            </div>

            <div style={{
              background: canConfirm ? '#10b981' : '#0284c7',
              color: '#ffffff',
              padding: '4px 12px',
              borderRadius: '20px',
              fontWeight: 800,
              fontSize: '0.82rem',
              display: 'flex',
              alignItems: 'center',
              gap: '6px'
            }}>
              <Clock className="w-3.5 h-3.5" />
              <span>{canConfirm ? 'Desbloqueado' : `Habilitando en: ${formatTime(timeLeft)}`}</span>
            </div>
          </div>
        </div>

        {/* Visor Interactivo de las 15 Secciones del Guion */}
        <div style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          background: '#f8fafc'
        }}>
          {/* Índice Lateral */}
          <div style={{
            width: '280px',
            borderRight: '1px solid #e2e8f0',
            background: '#ffffff',
            overflowY: 'auto',
            padding: '12px 8px',
            display: 'flex',
            flexDirection: 'column',
            gap: '4px'
          }} className="hidden md:flex">
            <div className="px-2 py-1 text-[11px] font-black text-slate-400 uppercase tracking-wider">
              Índice del Guion (15 Secciones)
            </div>
            {filteredSections.map(sec => {
              const isActive = selectedSection === sec.id;
              return (
                <button
                  key={sec.id}
                  onClick={() => {
                    setSelectedSection(sec.id);
                    const el = document.getElementById(`sec-${sec.id}`);
                    if (el) el.scrollIntoView({ behavior: 'smooth', block: 'start' });
                  }}
                  className={`text-left px-2.5 py-2 rounded-lg text-xs font-semibold flex items-center justify-between transition-all ${
                    isActive 
                      ? 'bg-sky-100 text-sky-900 font-bold border border-sky-200' 
                      : 'text-slate-600 hover:bg-slate-100 hover:text-slate-900'
                  }`}
                >
                  <span className="truncate">{sec.title}</span>
                  <span className="text-[10px] px-1.5 py-0.5 bg-slate-100 text-slate-500 rounded font-normal flex-shrink-0 ml-1">
                    {sec.tag}
                  </span>
                </button>
              );
            })}
          </div>

          {/* Contenido Completo del Documento */}
          <div 
            ref={contentRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: '24px 28px',
              scrollBehavior: 'smooth'
            }}
          >
            <div className="max-w-3xl mx-auto space-y-6">
              
              {/* Tarjeta de Encabezado Oficial */}
              <div className="bg-gradient-to-r from-slate-900 to-indigo-950 p-6 rounded-2xl text-white shadow-md border border-slate-800">
                <div className="inline-flex items-center gap-1 px-2.5 py-1 rounded-full bg-emerald-500/20 text-emerald-300 text-xs font-bold border border-emerald-500/30 mb-2">
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Texto Oficial de Capacitación</span>
                </div>
                <h1 className="text-xl md:text-2xl font-black text-white">
                  GUION PARA VIDEO DE CAPACITACIÓN DE PERSONEROS
                </h1>
                <p className="text-sky-300 font-medium text-sm mt-1">
                  Elecciones Regionales y Municipales 2026
                </p>
                <div className="mt-4 pt-3 border-t border-slate-700/60 flex flex-wrap gap-4 text-xs text-slate-300">
                  <div>🎯 <strong>Objetivo:</strong> Conocer derechos, funciones y prohibiciones en instalación, sufragio y escrutinio.</div>
                </div>
              </div>

              {/* Lista de Secciones */}
              {filteredSections.map(sec => (
                <div 
                  id={`sec-${sec.id}`}
                  key={sec.id}
                  className="bg-white p-5 md:p-6 rounded-xl border border-slate-200 shadow-sm transition-all hover:border-slate-300"
                >
                  <div className="flex items-center justify-between pb-3 mb-3 border-b border-slate-100">
                    <h2 className="text-base md:text-lg font-black text-slate-900 flex items-center gap-2">
                      <span className="w-7 h-7 rounded-lg bg-sky-100 text-sky-800 text-xs font-black flex items-center justify-center">
                        {sec.id}
                      </span>
                      <span>{sec.title}</span>
                    </h2>
                    <span className="px-2.5 py-0.5 text-[11px] font-bold bg-slate-100 text-slate-600 rounded-full">
                      {sec.tag}
                    </span>
                  </div>
                  <div className="text-sm">
                    {sec.content}
                  </div>
                </div>
              ))}

            </div>
          </div>
        </div>

        {/* Footer con Botón de Confirmación */}
        <div style={{
          padding: '14px 20px',
          borderTop: '1px solid #e2e8f0',
          background: '#ffffff',
          display: 'flex',
          justifyContent: 'space-between',
          alignItems: 'center',
          flexWrap: 'wrap',
          gap: '12px'
        }}>
          <div style={{ fontSize: '0.84rem', color: '#475569', fontWeight: 600 }}>
            {canConfirm ? (
              <span style={{ color: '#16a34a', fontWeight: 800, display: 'flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 className="w-5 h-5 text-emerald-600" />
                <span>Lectura completada y lista para confirmar ({currentPdfCount}/2)</span>
              </span>
            ) : (
              <span style={{ color: '#0369a1', display: 'flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                <Clock className="w-4 h-4 text-sky-600 animate-spin" />
                <span>Tiempo de lectura restante: {formatTime(timeLeft)}</span>
              </span>
            )}
          </div>

          <button
            onClick={handleConfirm}
            disabled={!canConfirm || submitting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              gap: '8px',
              padding: '11px 26px',
              borderRadius: '10px',
              border: 'none',
              background: canConfirm ? 'linear-gradient(90deg, #10b981, #059669)' : '#cbd5e1',
              color: '#ffffff',
              fontSize: '0.92rem',
              fontWeight: 800,
              cursor: canConfirm && !submitting ? 'pointer' : 'not-allowed',
              boxShadow: canConfirm ? '0 4px 14px rgba(16, 185, 129, 0.35)' : 'none',
              transition: 'all 0.2s ease'
            }}
          >
            {canConfirm ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            <span>{submitting ? 'Registrando lectura...' : (canConfirm ? 'Confirmar Lectura del Guion' : `Esperar ${formatTime(timeLeft)}`)}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
