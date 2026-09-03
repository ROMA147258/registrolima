import React, { useState, useEffect, useRef } from 'react';
import { X, FileText, CheckCircle2, Lock, Clock, BookOpen, Download, Search, ChevronRight, Check, AlertTriangle, Shield, Award, Sparkles } from 'lucide-react';
import confetti from 'canvas-confetti';

const SECTIONS = [
  {
    id: 1,
    title: "1. Bienvenida",
    tag: "Introducción",
    content: (
      <div style={{ color: '#0f172a', fontSize: '0.94rem', lineHeight: '1.65' }}>
        <p style={{ margin: '0 0 10px 0', fontWeight: 600 }}>
          ¡Bienvenido al curso virtual para personeros de las <strong>Elecciones Regionales y Municipales 2026</strong>!
        </p>
        <p style={{ margin: '0 0 10px 0' }}>
          En esta capacitación conocerás los principales aspectos que debes tener en cuenta para ejercer adecuadamente tu función durante la jornada electoral.
        </p>
        <p style={{ margin: '0 0 10px 0' }}>
          Revisaremos tus <strong>derechos, funciones y prohibiciones</strong> en los tres momentos de la jornada electoral:
        </p>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(140px, 1fr))', gap: '10px', margin: '14px 0' }}>
          <div style={{ padding: '12px', background: '#e0f2fe', border: '1px solid #bae6fd', borderRadius: '8px', color: '#0369a1', fontWeight: 800, textAlign: 'center', fontSize: '0.85rem' }}>
            1. Instalación de la mesa
          </div>
          <div style={{ padding: '12px', background: '#ede9fe', border: '1px solid #ddd6fe', borderRadius: '8px', color: '#6d28d9', fontWeight: 800, textAlign: 'center', fontSize: '0.85rem' }}>
            2. El Sufragio
          </div>
          <div style={{ padding: '12px', background: '#dcfce7', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#15803d', fontWeight: 800, textAlign: 'center', fontSize: '0.85rem' }}>
            3. El Escrutinio
          </div>
        </div>
        <p style={{ margin: '0' }}>
          Tu participación es fundamental para contribuir a la transparencia y al normal desarrollo del proceso electoral. A lo largo del curso encontrarás información práctica que te permitirá desempeñar tu función con responsabilidad y dentro del marco de la normativa electoral. <strong>¡Comencemos!</strong>
        </p>
      </div>
    )
  },
  {
    id: 2,
    title: "2. Elecciones Regionales y Municipales 2026",
    tag: "Cifras y Fecha",
    content: (
      <div style={{ color: '#0f172a', fontSize: '0.94rem', lineHeight: '1.65' }}>
        <div style={{ padding: '12px 14px', background: '#fffbeb', borderLeft: '4px solid #d97706', borderRadius: '0 8px 8px 0', marginBottom: '14px', color: '#92400e', fontWeight: 800 }}>
          📅 Fecha central: <strong>Domingo 4 de octubre de 2026</strong>
        </div>
        <p style={{ margin: '0 0 12px 0' }}>
          En esta jornada, la ciudadanía elegirá a las autoridades regionales y municipales que ejercerán sus funciones durante el periodo correspondiente.
        </p>
        <div style={{ background: '#0f172a', color: '#ffffff', borderRadius: '12px', padding: '16px', margin: '14px 0' }}>
          <div style={{ fontSize: '0.72rem', color: '#38bdf8', fontWeight: 800, textTransform: 'uppercase', letterSpacing: '0.5px', marginBottom: '4px' }}>
            Total de Autoridades a Elegir a Nivel Nacional
          </div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#ffffff', marginBottom: '12px' }}>
            13 148 <span style={{ fontSize: '0.9rem', fontWeight: 500, color: '#94a3b8' }}>autoridades en total</span>
          </div>
          <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(130px, 1fr))', gap: '8px' }}>
            <div style={{ background: '#1e293b', padding: '10px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#38bdf8' }}>414</div>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Autoridades Regionales</div>
            </div>
            <div style={{ background: '#1e293b', padding: '10px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#a78bfa' }}>1 920</div>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Autoridades Provinciales</div>
            </div>
            <div style={{ background: '#1e293b', padding: '10px', borderRadius: '8px', border: '1px solid #334155' }}>
              <div style={{ fontSize: '1.2rem', fontWeight: 900, color: '#4ade80' }}>10 814</div>
              <div style={{ fontSize: '0.75rem', color: '#cbd5e1' }}>Autoridades Distritales</div>
            </div>
          </div>
        </div>
        <p style={{ margin: '0' }}>
          Estas autoridades serán elegidas para conducir los gobiernos regionales y municipales. Se trata de una jornada electoral de gran importancia para la ciudadanía y para el fortalecimiento de la democracia.
        </p>
      </div>
    )
  },
  {
    id: 3,
    title: "3. El Personero y su Función",
    tag: "Rol e Impedimentos",
    content: (
      <div style={{ color: '#0f172a', fontSize: '0.94rem', lineHeight: '1.65' }}>
        <p style={{ margin: '0 0 10px 0' }}>
          Para que una elección se desarrolle adecuadamente, intervienen diversos actores electorales, cada uno con funciones específicas. Entre ellos se encuentra el <strong>personero de una organización política</strong>.
        </p>
        <div style={{ padding: '12px 14px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', color: '#1e3a8a', fontWeight: 700, margin: '12px 0' }}>
          🛡️ <strong>Definición:</strong> El personero es el ciudadano acreditado por una organización política para <u>representar, cuidar y defender sus intereses</u> durante el proceso electoral, de acuerdo con las disposiciones electorales vigentes.
        </div>
        <p style={{ margin: '0 0 12px 0' }}>
          Por ello, el ejercicio de esta función exige <strong>responsabilidad, respeto y estricto cumplimiento de las normas</strong>.
        </p>
        <div style={{ padding: '14px', background: '#fef2f2', border: '1px solid #fecaca', borderLeft: '4px solid #dc2626', borderRadius: '0 8px 8px 0', color: '#991b1b' }}>
          <div style={{ fontSize: '0.8rem', fontWeight: 900, textTransform: 'uppercase', marginBottom: '6px' }}>
            🚫 Impedimentos legales para ser personero:
          </div>
          <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px', fontSize: '0.88rem' }}>
            <li>Los <strong>candidatos</strong> a cargos de elección popular.</li>
            <li>Los <strong>miembros de mesa</strong> (titulares y suplentes).</li>
            <li>Los <strong>funcionarios y servidores del sistema electoral</strong> (JNE, ONPE, Reniec).</li>
            <li>Los miembros en actividad de las <strong>Fuerzas Armadas y de la Policía Nacional del Perú</strong>.</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 4,
    title: "4. Tipos de Personeros",
    tag: "Clasificación",
    content: (
      <div style={{ color: '#0f172a', fontSize: '0.94rem', lineHeight: '1.65' }}>
        <p style={{ margin: '0 0 10px 0' }}>
          En el proceso electoral participan diferentes tipos de personeros. En este curso conocerás las funciones del <strong>personero de local de votación</strong> y del <strong>personero de mesa</strong>, quienes desarrollan sus actividades durante la jornada electoral.
        </p>
        <p style={{ margin: 0 }}>
          Aunque ambos representan a una organización política, cada uno tiene funciones específicas y un ámbito de actuación determinado.
        </p>
      </div>
    )
  },
  {
    id: 5,
    title: "5. Personero de Local de Votación",
    tag: "Ámbito del Local",
    content: (
      <div style={{ color: '#0f172a', fontSize: '0.94rem', lineHeight: '1.65' }}>
        <p style={{ margin: '0 0 10px 0' }}>
          Si eres <strong>personero de local de votación (PLV)</strong>, tu función principal será <strong>observar el desarrollo de las actividades electorales dentro del local de votación</strong>.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '8px', margin: '14px 0' }}>
          <div style={{ padding: '10px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', gap: '8px' }}>
            <span style={{ color: '#0284c7', fontWeight: 900 }}>✓</span>
            <span><strong>Coordinar y orientar:</strong> A los personeros de mesa de tu propia organización política.</span>
          </div>
          <div style={{ padding: '10px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', gap: '8px' }}>
            <span style={{ color: '#0284c7', fontWeight: 900 }}>✓</span>
            <span><strong>Comunicación formal:</strong> Mantener comunicación con el coordinador de local de la ONPE, cuando corresponda.</span>
          </div>
          <div style={{ padding: '10px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '8px', display: 'flex', gap: '8px' }}>
            <span style={{ color: '#0284c7', fontWeight: 900 }}>✓</span>
            <span><strong>Presencia temprana:</strong> Estar presente desde las 06:30 a.m., contando con las facilidades necesarias.</span>
          </div>
        </div>
        <div style={{ padding: '12px 14px', background: '#fffbeb', border: '1px solid #fde68a', borderLeft: '4px solid #d97706', borderRadius: '0 8px 8px 0', color: '#92400e', fontSize: '0.88rem' }}>
          ⚠️ <strong>Regla de oro:</strong> Tu labor es de <strong>observación y vigilancia</strong>. Por ello, no debes interferir en las funciones de los miembros de mesa ni asumir funciones que no te corresponden (tampoco reemplazar personeros de mesa).
        </div>
      </div>
    )
  },
  {
    id: 6,
    title: "6. Personero de Mesa",
    tag: "Ámbito de la Mesa",
    content: (
      <div style={{ color: '#0f172a', fontSize: '0.94rem', lineHeight: '1.65' }}>
        <p style={{ margin: '0 0 10px 0' }}>
          Si eres <strong>personero de mesa</strong>, al presentarte deberás mostrar tu <strong>DNI físico y tu credencial</strong> al presidente de mesa.
        </p>
        <p style={{ margin: '0 0 10px 0' }}>
          El presidente de mesa te asignará una <strong>silla</strong> desde la cual podrás observar el desarrollo de las actividades electorales.
        </p>
        <p style={{ margin: '0 0 10px 0' }}>
          Podrás ejercer tu función durante la <strong>instalación, el sufragio y el escrutinio</strong>, en la mesa o mesas en las que hayas sido debidamente acreditado.
        </p>
        <p style={{ margin: 0 }}>
          Tu responsabilidad será observar el trabajo de los miembros de mesa, sin interferir en sus funciones, y formular las <strong>observaciones o reclamos</strong> que correspondan cuando adviertas algún hecho que pudiera afectar el normal desarrollo y transparencia del proceso electoral.
        </p>
      </div>
    )
  },
  {
    id: 7,
    title: "7. Instalación de la Mesa de Sufragio",
    tag: "Momento 1",
    content: (
      <div style={{ color: '#0f172a', fontSize: '0.94rem', lineHeight: '1.65' }}>
        <p style={{ margin: '0 0 10px 0' }}>
          Durante esta etapa, los miembros de mesa reciben, verifican y organizan el material electoral necesario para acondicionar la mesa e iniciar sus actividades.
        </p>
        <p style={{ margin: '0 0 8px 0', fontWeight: 800, color: '#002b66' }}>Tus derechos durante la instalación:</p>
        <ul style={{ margin: '0 0 12px 0', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <li>Verificar que la <strong>relación de electores</strong> esté pegada en la puerta del aula.</li>
          <li>Verificar que los <strong>carteles de candidatos</strong> estén colocados en la cámara secreta.</li>
          <li>Firmar las <strong>cédulas de sufragio</strong> (en el reverso), si así lo deseas.</li>
          <li>Formular observaciones o reclamos ante situaciones irregulares.</li>
          <li>Firmar el <strong>acta de instalación</strong> de manera opcional.</li>
        </ul>
        <div style={{ padding: '10px 12px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', color: '#1e40af', fontSize: '0.86rem' }}>
          ℹ️ <strong>Causales de nulidad:</strong> Podrás solicitar la nulidad de la mesa cuando se configure alguna de las causales previstas en la normativa electoral.
        </div>
      </div>
    )
  },
  {
    id: 8,
    title: "8. Sufragio",
    tag: "Momento 2",
    content: (
      <div style={{ color: '#0f172a', fontSize: '0.94rem', lineHeight: '1.65' }}>
        <p style={{ margin: '0 0 10px 0' }}>
          Es la etapa en la que los electores ejercen su derecho de voto. Como personero, podrás observar el desarrollo del acto y verificar que se respeten las disposiciones electorales.
        </p>
        <p style={{ margin: '0 0 8px 0', fontWeight: 800, color: '#002b66' }}>Derechos durante el sufragio:</p>
        <ul style={{ margin: '0 0 12px 0', paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '4px' }}>
          <li>Presenciar el acto de votación continuo.</li>
          <li>Verificar que los electores ingresen solos a la cámara secreta (salvo voto asistido).</li>
          <li>Votar después de los miembros de mesa si te corresponde sufragar en esa mesa.</li>
          <li><strong>Impugnar la identidad</strong> de un elector si dudas de su veracidad.</li>
          <li>Firmar la última página de la lista de electores y las actas de sufragio.</li>
        </ul>
        <div style={{ padding: '10px 12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#166534', fontSize: '0.86rem' }}>
          ♿ <strong>Atención Preferente:</strong> Gestantes, adultos mayores y personas con discapacidad pueden votar en el Módulo Temporal de Votación (primer piso).
        </div>
      </div>
    )
  },
  {
    id: 9,
    title: "9. Escrutinio",
    tag: "Momento 3",
    content: (
      <div style={{ color: '#0f172a', fontSize: '0.94rem', lineHeight: '1.65' }}>
        <p style={{ margin: '0 0 10px 0' }}>
          En esta etapa, los miembros de mesa realizan el <strong>conteo y la calificación de los votos</strong> y registran los resultados en las respectivas actas electorales.
        </p>
        <div style={{ display: 'flex', flexDirection: 'column', gap: '6px', margin: '12px 0' }}>
          <div style={{ padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
            <strong>1.</strong> Presenciar la lectura y conteo de votos en voz alta.
          </div>
          <div style={{ padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
            <strong>2.</strong> Observar el contenido y marca de cada cédula de sufragio.
          </div>
          <div style={{ padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
            <strong>3.</strong> Impugnar un voto dudoso cuando corresponda.
          </div>
          <div style={{ padding: '8px 12px', background: '#f8fafc', border: '1px solid #e2e8f0', borderRadius: '6px' }}>
            <strong>4.</strong> Firmar las actas de escrutinio y <strong>exigir tu copia oficial del acta</strong>.
          </div>
        </div>
      </div>
    )
  },
  {
    id: 10,
    title: "10. Prohibiciones de los Personeros",
    tag: "Restricciones",
    content: (
      <div style={{ color: '#0f172a', fontSize: '0.94rem', lineHeight: '1.65' }}>
        <p style={{ margin: '0 0 10px 0' }}>
          Para preservar el orden, la transparencia y el normal desarrollo, existen conductas terminantemente prohibidas:
        </p>
        <div style={{ padding: '14px', background: '#fef2f2', border: '1px solid #fecaca', borderLeft: '4px solid #dc2626', borderRadius: '0 8px 8px 0', color: '#991b1b' }}>
          <ul style={{ margin: 0, paddingLeft: '18px', display: 'flex', flexDirection: 'column', gap: '5px', fontSize: '0.88rem' }}>
            <li><strong>Preguntar a los electores</strong> por su preferencia electoral o inducir el voto.</li>
            <li><strong>Discutir</strong> con electores, miembros de mesa, personal de ONPE o personeros.</li>
            <li><strong>Interrumpir o perturbar</strong> el desarrollo del escrutinio.</li>
            <li>Realizar <strong>proselitismo político</strong> dentro del local de votación.</li>
            <li><strong>Manipular o tocar el material electoral</strong> (cédulas, ánforas, actas).</li>
            <li>Interferir en las funciones exclusivas de los miembros de mesa.</li>
          </ul>
        </div>
      </div>
    )
  },
  {
    id: 11,
    title: "11. Conociendo la Cédula de Sufragio",
    tag: "Independencia",
    content: (
      <div style={{ color: '#0f172a', fontSize: '0.94rem', lineHeight: '1.65' }}>
        <p style={{ margin: '0 0 10px 0' }}>
          La cédula contiene las opciones electorales correspondientes a los cargos regionales y municipales 2026.
        </p>
        <div style={{ padding: '12px 14px', background: '#eff6ff', border: '1px solid #bfdbfe', borderRadius: '8px', color: '#1e3a8a', fontWeight: 700 }}>
          💡 <strong>Principio de Independencia:</strong> Cada elección (Regional, Provincial y Distrital) se evalúa y califica de forma <u>completamente independiente</u> durante el escrutinio.
        </div>
      </div>
    )
  },
  {
    id: 12,
    title: "12. Tipos de Voto",
    tag: "Calificación",
    content: (
      <div style={{ color: '#0f172a', fontSize: '0.94rem', lineHeight: '1.65' }}>
        <div style={{ display: 'grid', gridTemplateColumns: 'repeat(auto-fit, minmax(180px, 1fr))', gap: '10px', margin: '10px 0' }}>
          <div style={{ padding: '12px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#166534' }}>
            <div style={{ fontWeight: 900, fontSize: '0.85rem', marginBottom: '4px' }}>✅ VOTO VÁLIDO</div>
            <div style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>Cruz (+) o aspa (x) cuya intersección esté dentro del recuadro. La intención del elector prevalece.</div>
          </div>
          <div style={{ padding: '12px', background: '#fef2f2', border: '1px solid #fecaca', borderRadius: '8px', color: '#991b1b' }}>
            <div style={{ fontWeight: 900, fontSize: '0.85rem', marginBottom: '4px' }}>❌ VOTO NULO</div>
            <div style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>Signo distinto a cruz/aspa, intersección fuera del recuadro, cédula rota o con firmas/frases.</div>
          </div>
          <div style={{ padding: '12px', background: '#f8fafc', border: '1px solid #cbd5e1', borderRadius: '8px', color: '#334155' }}>
            <div style={{ fontWeight: 900, fontSize: '0.85rem', marginBottom: '4px' }}>⚪ VOTO EN BLANCO</div>
            <div style={{ fontSize: '0.8rem', lineHeight: '1.5' }}>Sin ninguna marca en la opción electoral correspondiente.</div>
          </div>
        </div>
      </div>
    )
  },
  {
    id: 13,
    title: "13. Ubicación del Personero durante el Escrutinio",
    tag: "Ubicación",
    content: (
      <div style={{ color: '#0f172a', fontSize: '0.94rem', lineHeight: '1.65' }}>
        <p style={{ margin: '0 0 10px 0' }}>
          Para observar adecuadamente el escrutinio, podrás acercar tu silla a la mesa de sufragio, manteniendo una <strong>distancia prudente</strong> que te permita ver la lectura y calificación de los votos sin obstaculizar.
        </p>
        <div style={{ padding: '12px 14px', background: '#002b66', color: '#ffffff', borderRadius: '8px', textAlign: 'center', fontWeight: 800, fontSize: '0.9rem' }}>
          👁️ Observar no significa intervenir: Tu rol es vigilar y cautelar la voluntad popular.
        </div>
      </div>
    )
  },
  {
    id: 14,
    title: "14. Horario de la Jornada Electoral",
    tag: "Horarios",
    content: (
      <div style={{ color: '#0f172a', fontSize: '0.94rem', lineHeight: '1.65' }}>
        <div style={{ padding: '16px', background: '#fef3c7', border: '1px solid #fde68a', borderRadius: '12px', textAlign: 'center', margin: '8px 0' }}>
          <div style={{ fontSize: '0.8rem', color: '#92400e', fontWeight: 800 }}>HORARIO OFICIAL DE SUFRAGIO</div>
          <div style={{ fontSize: '1.8rem', fontWeight: 900, color: '#78350f', margin: '4px 0' }}>7:00 a.m. a 5:00 p.m.</div>
          <div style={{ fontSize: '0.8rem', color: '#92400e', fontWeight: 700 }}>Domingo 4 de Octubre de 2026</div>
        </div>
        <p style={{ margin: '10px 0 0 0' }}>
          Preséntate puntualmente a las <strong>06:30 a.m.</strong> en tu local para presenciar la instalación de la mesa y la verificación de los materiales desde el primer minuto.
        </p>
      </div>
    )
  },
  {
    id: 15,
    title: "15. Cierre de la Capacitación",
    tag: "Certificación",
    content: (
      <div style={{ color: '#0f172a', fontSize: '0.94rem', lineHeight: '1.65' }}>
        <p style={{ margin: '0 0 10px 0' }}>
          ¡Felicitaciones por completar el estudio del guion oficial de capacitación electoral! Tu compromiso y vigilancia responsable garantizan la transparencia e integridad del sufragio democrático.
        </p>
        <div style={{ padding: '12px 14px', background: '#f0fdf4', border: '1px solid #bbf7d0', borderRadius: '8px', color: '#166534', display: 'flex', alignItems: 'center', gap: '10px' }}>
          <Award className="w-8 h-8 text-emerald-600 flex-shrink-0" />
          <div>
            <div style={{ fontWeight: 800, fontSize: '0.92rem' }}>Paso Siguiente: Cuestionario de Evaluación</div>
            <div style={{ fontSize: '0.8rem' }}>Rinde el cuestionario de 5 preguntas para quedar plenamente acreditado como personero oficial.</div>
          </div>
        </div>
      </div>
    )
  }
];

export function PdfModal({ currentPdfCount = 0, onClose, onComplete }) {
  const [timeLeft, setTimeLeft] = useState(30); // 30 segundos
  const [canConfirm, setCanConfirm] = useState(false);
  const [submitting, setSubmitting] = useState(false);
  const [selectedSection, setSelectedSection] = useState(1);
  const [searchTerm, setSearchTerm] = useState('');
  const contentRef = useRef(null);

  // Detección Responsive (Móvil < 768px)
  const [isMobile, setIsMobile] = useState(() => typeof window !== 'undefined' ? window.innerWidth < 768 : false);
  useEffect(() => {
    const handleResize = () => {
      setIsMobile(window.innerWidth < 768);
    };
    window.addEventListener('resize', handleResize);
    return () => window.removeEventListener('resize', handleResize);
  }, []);

  useEffect(() => {
    if (timeLeft <= 0) {
      setCanConfirm(true);
      return;
    }
    const timer = setInterval(() => {
      setTimeLeft(prev => {
        if (prev <= 1) {
          clearInterval(timer);
          setCanConfirm(true);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);
    return () => clearInterval(timer);
  }, [timeLeft]);

  const handleConfirm = () => {
    if (!canConfirm || submitting) return;
    setSubmitting(true);
    confetti({
      particleCount: 80,
      spread: 70,
      origin: { y: 0.6 }
    });
    setTimeout(() => {
      if (onComplete) onComplete();
      onClose();
    }, 800);
  };

  const formatTime = (seconds) => {
    const m = Math.floor(seconds / 60);
    const s = seconds % 60;
    return `${m.toString().padStart(2, '0')}:${s.toString().padStart(2, '0')}`;
  };

  const filteredSections = SECTIONS.filter(sec => {
    if (!searchTerm.trim()) return true;
    const term = searchTerm.toLowerCase();
    return sec.title.toLowerCase().includes(term) || sec.tag.toLowerCase().includes(term);
  });

  return (
    <div style={{
      position: 'fixed',
      inset: 0,
      background: 'rgba(15, 23, 42, 0.88)',
      backdropFilter: 'blur(6px)',
      display: 'flex',
      alignItems: 'center',
      justifyContent: 'center',
      zIndex: 9999,
      padding: isMobile ? '0' : '16px',
      color: '#0f172a'
    }}>
      <div style={{
        background: '#ffffff',
        width: '100%',
        maxWidth: isMobile ? '100%' : '1060px',
        height: isMobile ? '100vh' : '92vh',
        borderRadius: isMobile ? '0' : '16px',
        display: 'flex',
        flexDirection: 'column',
        overflow: 'hidden',
        boxShadow: '0 25px 60px -15px rgba(0, 0, 0, 0.5)',
        border: isMobile ? 'none' : '1px solid #cbd5e1'
      }}>
        
        {/* Header Superior Oscuro Institucional */}
        <div style={{
          padding: isMobile ? '10px 14px' : '14px 20px',
          borderBottom: '1px solid #1e293b',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          background: '#002B66',
          color: '#ffffff',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '10px', overflow: 'hidden' }}>
            <div style={{ width: '36px', height: '36px', borderRadius: '8px', background: 'linear-gradient(135deg, #0284c7, #0369a1)', color: '#ffffff', display: 'flex', alignItems: 'center', justifyContent: 'center', flexShrink: 0 }}>
              <BookOpen className="w-4 h-4" />
            </div>
            <div style={{ overflow: 'hidden' }}>
              <div style={{ display: 'flex', alignItems: 'center', gap: '6px' }}>
                <h3 style={{ fontSize: isMobile ? '0.88rem' : '1.05rem', fontWeight: 900, margin: 0, color: '#ffffff', whiteSpace: 'nowrap', overflow: 'hidden', textOverflow: 'ellipsis' }}>
                  Cartilla del Personero ERM 2026
                </h3>
                {!isMobile && (
                  <span style={{ padding: '2px 8px', fontSize: '0.68rem', background: '#0284c7', color: '#ffffff', borderRadius: '20px', fontWeight: 800 }}>
                    PDF OFICIAL
                  </span>
                )}
              </div>
              <div style={{ fontSize: '0.7rem', color: '#93c5fd', marginTop: '1px' }}>
                Lectura obligatoria ({currentPdfCount}/2)
              </div>
            </div>
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', flexShrink: 0 }}>
            <a
              href="/manuals/Cartilla_del_Personero_ERM_2026.pdf"
              download="Cartilla_del_Personero_ERM_2026.pdf"
              style={{
                display: 'inline-flex',
                alignItems: 'center',
                gap: '5px',
                padding: isMobile ? '6px 10px' : '7px 14px',
                background: '#dc2626',
                color: '#ffffff',
                borderRadius: '8px',
                fontSize: isMobile ? '0.72rem' : '0.78rem',
                fontWeight: 800,
                textDecoration: 'none',
                boxShadow: '0 2px 6px rgba(220, 38, 38, 0.4)'
              }}
              title="Descargar Cartilla del Personero en PDF"
            >
              <Download className="w-3.5 h-3.5" />
              <span>{isMobile ? 'PDF' : 'Descargar PDF'}</span>
            </a>

            <button
              onClick={onClose}
              style={{
                background: 'rgba(255,255,255,0.12)',
                border: 'none',
                color: '#ffffff',
                cursor: 'pointer',
                padding: '6px',
                borderRadius: '8px',
                display: 'flex',
                alignItems: 'center',
                justifyContent: 'center'
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
          padding: isMobile ? '8px 12px' : '10px 20px',
          display: 'flex',
          alignItems: 'center',
          justifyContent: 'space-between',
          fontSize: '0.8rem',
          flexWrap: 'wrap',
          gap: '8px'
        }}>
          <div style={{ display: 'flex', alignItems: 'center', gap: '6px', color: canConfirm ? '#047857' : '#0369a1', fontWeight: 800 }}>
            {canConfirm ? (
              <>
                <CheckCircle2 className="w-4 h-4 text-emerald-600 flex-shrink-0" />
                <span style={{ fontSize: isMobile ? '0.74rem' : '0.82rem' }}>¡Lectura completada! Lista para confirmar.</span>
              </>
            ) : (
              <>
                <Clock className="w-4 h-4 text-sky-600 flex-shrink-0" />
                <span style={{ fontSize: isMobile ? '0.74rem' : '0.82rem' }}>Lee las 15 secciones antes de rendir la evaluación.</span>
              </>
            )}
          </div>

          <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
            {!isMobile && (
              <div style={{ position: 'relative' }}>
                <input 
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Buscar tema..."
                  style={{
                    padding: '4px 8px 4px 26px',
                    fontSize: '0.76rem',
                    background: '#ffffff',
                    border: '1px solid #cbd5e1',
                    borderRadius: '8px',
                    color: '#0f172a',
                    width: '140px',
                    outline: 'none'
                  }}
                />
                <Search className="w-3 h-3 text-slate-400" style={{ position: 'absolute', left: '7px', top: '7px' }} />
              </div>
            )}

            <div style={{
              background: canConfirm ? '#10b981' : '#0284c7',
              color: '#ffffff',
              padding: '3px 10px',
              borderRadius: '20px',
              fontWeight: 800,
              fontSize: '0.74rem',
              display: 'flex',
              alignItems: 'center',
              gap: '5px'
            }}>
              <Clock className="w-3 h-3" />
              <span>{canConfirm ? 'Desbloqueado' : `Tiempo: ${formatTime(timeLeft)}`}</span>
            </div>
          </div>
        </div>

        {/* ÍNDICE MÓVIL: Carrusel Horizontal de Secciones (1 - 15) */}
        {isMobile && (
          <div style={{
            display: 'flex',
            overflowX: 'auto',
            gap: '6px',
            padding: '8px 12px',
            background: '#ffffff',
            borderBottom: '1px solid #e2e8f0',
            scrollbarWidth: 'none',
            WebkitOverflowScrolling: 'touch'
          }}>
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
                  style={{
                    flexShrink: 0,
                    padding: '5px 10px',
                    borderRadius: '16px',
                    fontSize: '0.72rem',
                    fontWeight: 800,
                    background: isActive ? '#002B66' : '#f1f5f9',
                    color: isActive ? '#ffffff' : '#334155',
                    border: isActive ? '1px solid #002B66' : '1px solid #cbd5e1',
                    cursor: 'pointer'
                  }}
                >
                  {sec.id}. {sec.tag}
                </button>
              );
            })}
          </div>
        )}

        {/* Visor Interactivo: Índice Lateral (Escritorio) + Contenido */}
        <div style={{
          flex: 1,
          display: 'flex',
          overflow: 'hidden',
          background: '#f8fafc'
        }}>
          {/* Índice Lateral en Escritorio */}
          {!isMobile && (
            <div style={{
              width: '280px',
              borderRight: '1px solid #e2e8f0',
              background: '#ffffff',
              overflowY: 'auto',
              padding: '12px 8px',
              display: 'flex',
              flexDirection: 'column',
              gap: '4px',
              flexShrink: 0
            }}>
              <div style={{ padding: '4px 8px', fontSize: '0.7rem', fontWeight: 900, color: '#64748b', textTransform: 'uppercase', letterSpacing: '0.5px' }}>
                Índice de la Cartilla (15 Secciones)
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
                    style={{
                      textAlign: 'left',
                      padding: '8px 10px',
                      borderRadius: '8px',
                      fontSize: '0.78rem',
                      fontWeight: isActive ? 800 : 600,
                      display: 'flex',
                      alignItems: 'center',
                      justifyContent: 'space-between',
                      gap: '6px',
                      cursor: 'pointer',
                      background: isActive ? '#e0f2fe' : '#ffffff',
                      color: isActive ? '#0369a1' : '#1e293b',
                      border: isActive ? '1.5px solid #0284c7' : '1px solid #e2e8f0',
                      transition: 'all 0.15s ease'
                    }}
                  >
                    <span style={{ overflow: 'hidden', textOverflow: 'ellipsis', whiteSpace: 'nowrap' }}>
                      {sec.title}
                    </span>
                    <span style={{
                      fontSize: '0.64rem',
                      padding: '2px 6px',
                      background: isActive ? '#0284c7' : '#f1f5f9',
                      color: isActive ? '#ffffff' : '#475569',
                      borderRadius: '4px',
                      fontWeight: 700,
                      flexShrink: 0
                    }}>
                      {sec.tag}
                    </span>
                  </button>
                );
              })}
            </div>
          )}

          {/* Contenido Completo del Documento */}
          <div 
            ref={contentRef}
            style={{
              flex: 1,
              overflowY: 'auto',
              padding: isMobile ? '12px 10px' : '20px 24px',
              scrollBehavior: 'smooth',
              background: '#f8fafc'
            }}
          >
            <div style={{ maxWidth: '800px', margin: '0 auto', display: 'flex', flexDirection: 'column', gap: '14px' }}>
              
              {/* Tarjeta de Encabezado Oficial */}
              <div style={{
                background: 'linear-gradient(135deg, #002B66, #0f172a)',
                padding: isMobile ? '14px' : '22px',
                borderRadius: '12px',
                color: '#ffffff',
                boxShadow: '0 4px 14px rgba(0, 43, 102, 0.2)',
                border: '1px solid #1e293b'
              }}>
                <div style={{
                  display: 'inline-flex',
                  alignItems: 'center',
                  gap: '4px',
                  padding: '3px 10px',
                  borderRadius: '20px',
                  background: 'rgba(56, 189, 248, 0.2)',
                  color: '#38bdf8',
                  fontSize: '0.72rem',
                  fontWeight: 800,
                  marginBottom: '6px'
                }}>
                  <Sparkles className="w-3.5 h-3.5" />
                  <span>Texto Oficial de Capacitación</span>
                </div>
                <h1 style={{ fontSize: isMobile ? '1.1rem' : '1.35rem', fontWeight: 900, margin: '0 0 4px 0', color: '#ffffff', lineHeight: 1.25 }}>
                  CARTILLA DEL PERSONERO - CAPACITACIÓN ELECTORAL
                </h1>
                <p style={{ fontSize: isMobile ? '0.78rem' : '0.88rem', color: '#93c5fd', margin: 0, fontWeight: 700 }}>
                  Elecciones Regionales y Municipales 2026 • Somos Perú
                </p>
                <div style={{ marginTop: '10px', paddingTop: '8px', borderTop: '1px solid rgba(255,255,255,0.12)', fontSize: '0.75rem', color: '#cbd5e1' }}>
                  🎯 <strong>Objetivo:</strong> Conocer derechos, funciones y prohibiciones en instalación, sufragio y escrutinio.
                </div>
              </div>

              {/* Lista de Secciones */}
              {filteredSections.map(sec => (
                <div 
                  id={`sec-${sec.id}`}
                  key={sec.id}
                  style={{
                    background: '#ffffff',
                    padding: isMobile ? '14px 12px' : '18px 22px',
                    borderRadius: '12px',
                    border: '1.5px solid #cbd5e1',
                    boxShadow: '0 2px 8px rgba(0,0,0,0.03)',
                    color: '#0f172a'
                  }}
                >
                  <div style={{
                    display: 'flex',
                    alignItems: 'center',
                    justifyContent: 'space-between',
                    paddingBottom: '8px',
                    marginBottom: '10px',
                    borderBottom: '1.5px solid #f1f5f9',
                    gap: '6px'
                  }}>
                    <h2 style={{ fontSize: isMobile ? '0.92rem' : '1.05rem', fontWeight: 900, color: '#002B66', margin: 0, display: 'flex', alignItems: 'center', gap: '6px' }}>
                      <span style={{
                        width: '24px',
                        height: '24px',
                        borderRadius: '6px',
                        background: '#002B66',
                        color: '#ffffff',
                        fontSize: '0.74rem',
                        fontWeight: 900,
                        display: 'flex',
                        alignItems: 'center',
                        justifyContent: 'center',
                        flexShrink: 0
                      }}>
                        {sec.id}
                      </span>
                      <span>{sec.title}</span>
                    </h2>
                    <span style={{
                      padding: '2px 8px',
                      fontSize: '0.68rem',
                      fontWeight: 800,
                      background: '#f1f5f9',
                      color: '#475569',
                      borderRadius: '20px',
                      border: '1px solid #e2e8f0',
                      flexShrink: 0
                    }}>
                      {sec.tag}
                    </span>
                  </div>

                  <div style={{ color: '#0f172a' }}>
                    {sec.content}
                  </div>
                </div>
              ))}

            </div>
          </div>
        </div>

        {/* Footer con Botón de Confirmación Responsivo */}
        <div style={{
          padding: isMobile ? '10px 14px' : '14px 20px',
          borderTop: '1px solid #e2e8f0',
          background: '#ffffff',
          display: 'flex',
          flexDirection: isMobile ? 'column' : 'row',
          justifyContent: 'space-between',
          alignItems: isMobile ? 'stretch' : 'center',
          gap: '8px'
        }}>
          <div style={{ fontSize: isMobile ? '0.76rem' : '0.84rem', color: '#475569', fontWeight: 600, textAlign: isMobile ? 'center' : 'left' }}>
            {canConfirm ? (
              <span style={{ color: '#16a34a', fontWeight: 800, display: 'inline-flex', alignItems: 'center', gap: '6px' }}>
                <CheckCircle2 className="w-4 h-4 text-emerald-600" />
                <span>Lectura completada y lista para confirmar</span>
              </span>
            ) : (
              <span style={{ color: '#0369a1', display: 'inline-flex', alignItems: 'center', gap: '6px', fontWeight: 700 }}>
                <Clock className="w-4 h-4 text-sky-600 animate-spin" />
                <span>Tiempo restante: {formatTime(timeLeft)}</span>
              </span>
            )}
          </div>

          <button
            onClick={handleConfirm}
            disabled={!canConfirm || submitting}
            style={{
              display: 'inline-flex',
              alignItems: 'center',
              justifyContent: 'center',
              gap: '8px',
              padding: isMobile ? '10px 16px' : '11px 26px',
              borderRadius: '10px',
              border: 'none',
              background: canConfirm ? 'linear-gradient(90deg, #10b981, #059669)' : '#cbd5e1',
              color: '#ffffff',
              fontSize: isMobile ? '0.85rem' : '0.92rem',
              fontWeight: 800,
              cursor: canConfirm && !submitting ? 'pointer' : 'not-allowed',
              boxShadow: canConfirm ? '0 4px 14px rgba(16, 185, 129, 0.35)' : 'none',
              transition: 'all 0.2s ease',
              width: isMobile ? '100%' : 'auto'
            }}
          >
            {canConfirm ? <CheckCircle2 className="w-4 h-4" /> : <Lock className="w-4 h-4" />}
            <span>{submitting ? 'Registrando...' : (canConfirm ? 'Confirmar Lectura de la Cartilla' : `Esperar ${formatTime(timeLeft)}`)}</span>
          </button>
        </div>

      </div>
    </div>
  );
}
