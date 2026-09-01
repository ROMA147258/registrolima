import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const outputPathFrontend = path.join(__dirname, '../../frontend/public/manuals/Guion_Capacitacion_Personeros_ERM_2026.pdf');
const outputPathRoot = path.join(__dirname, '../../GUION_CAPACITACION_PERSONEROS_2026.pdf');

// Ensure directory exists
fs.mkdirSync(path.dirname(outputPathFrontend), { recursive: true });

const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 40, bottom: 40, left: 45, right: 45 },
  bufferPages: true,
  info: {
    Title: 'Guion Oficial de Capacitación de Personeros - ERM 2026',
    Author: 'Somos Perú - Dirección Electoral Lima Metropolitana',
    Subject: 'Manual y Guion de Funciones, Derechos, Prohibiciones y Escrutinio'
  }
});

const writeStreamFrontend = fs.createWriteStream(outputPathFrontend);
const writeStreamRoot = fs.createWriteStream(outputPathRoot);

doc.pipe(writeStreamFrontend);
doc.pipe(writeStreamRoot);

// Paleta de Colores de Alto Contraste y Elegancia Institucional
const NAVY = '#002B66';
const BLUE_ACCENT = '#0284C7';
const DARK = '#0F172A';
const MUTED = '#334155';
const BORDER = '#CBD5E1';
const BG_BOX = '#F8FAFC';
const RED = '#DC2626';
const GREEN = '#16A34A';
const AMBER = '#D97706';

// ==========================================
// PÁGINA 1: PORTADA INSTITUCIONAL E ÍNDICE GENERAL
// ==========================================

// Banner Superior
doc.rect(45, 35, 505, 110).fill(NAVY);

doc.fontSize(19).fillColor('#FFFFFF').font('Helvetica-Bold')
  .text('GUION PARA VIDEO DE CAPACITACIÓN DE PERSONEROS', 60, 50, { width: 475, align: 'center' });

doc.fontSize(12).fillColor('#38BDF8').font('Helvetica-Bold')
  .text('ELECCIONES REGIONALES Y MUNICIPALES 2026', 60, 95, { width: 475, align: 'center' });

doc.fontSize(9.5).fillColor('#E2E8F0').font('Helvetica')
  .text('Somos Perú • Documento Oficial de Capacitación y Blindaje Electoral', 60, 115, { width: 475, align: 'center' });

doc.y = 160;

// Caja de Índice General
doc.rect(45, 160, 505, 30).fill('#F1F5F9');
doc.rect(45, 160, 505, 30).stroke(BORDER);
doc.fontSize(12).fillColor(NAVY).font('Helvetica-Bold')
  .text('ÍNDICE GENERAL DEL GUION (15 SECCIONES)', 55, 169, { align: 'center' });

const INDICE_ITEMS = [
  { n: '1', t: 'Bienvenida e Introducción', d: 'Objetivo y momentos de la jornada' },
  { n: '2', t: 'Elecciones Regionales y Municipales 2026', d: 'Fecha y cifras de autoridades a elegir' },
  { n: '3', t: 'El Personero y su Función', d: 'Definición, rol e impedimentos legales' },
  { n: '4', t: 'Tipos de Personeros', d: 'Personero de Local y Personero de Mesa' },
  { n: '5', t: 'Personero de Local de Votación (PLV)', d: 'Coordinación y vigilancia en el local' },
  { n: '6', t: 'Personero de Mesa', d: 'Acreditación y defensa del voto en la mesa' },
  { n: '7', t: 'Instalación de la Mesa de Sufragio', d: 'Momento 1: Derechos, cédulas y actas' },
  { n: '8', t: 'El Sufragio', d: 'Momento 2: Votación, preferente e impugnación' },
  { n: '9', t: 'El Escrutinio', d: 'Momento 3: Conteo público de votos y actas' },
  { n: '10', t: 'Prohibiciones de los Personeros', d: 'Conductas restringidas y sanciones' },
  { n: '11', t: 'Conociendo la Cédula de Sufragio', d: 'Independencia de elecciones en la cédula' },
  { n: '12', t: 'Tipos de Voto', d: 'Criterios de Voto Válido, Nulo y en Blanco' },
  { n: '13', t: 'Ubicación del Personero en el Escrutinio', d: 'Distancia prudente de observación' },
  { n: '14', t: 'Horario de la Jornada Electoral', d: '07:00 a.m. a 05:00 p.m.' },
  { n: '15', t: 'Cierre de la Capacitación', d: 'Conclusiones y evaluación final' }
];

let idxY = 200;
INDICE_ITEMS.forEach((item, i) => {
  doc.rect(45, idxY, 505, 23).fill(i % 2 === 0 ? '#FFFFFF' : '#F8FAFC');
  doc.rect(45, idxY, 505, 23).stroke('#E2E8F0');

  // Círculo con número
  doc.circle(60, idxY + 11.5, 8).fill(NAVY);
  doc.fontSize(8).fillColor('#FFFFFF').font('Helvetica-Bold')
    .text(item.n, 52, idxY + 7.5, { width: 16, align: 'center' });

  // Título
  doc.fontSize(9).fillColor(DARK).font('Helvetica-Bold')
    .text(item.t, 76, idxY + 6.5, { width: 230 });

  // Descripción
  doc.fontSize(8).fillColor(MUTED).font('Helvetica')
    .text(item.d, 310, idxY + 7, { width: 230, align: 'right' });

  idxY += 23;
});

// Caja informativa al pie del índice
doc.rect(45, 560, 505, 45).fill('#EFF6FF');
doc.rect(45, 560, 505, 45).stroke('#BFDBFE');
doc.fontSize(8.5).fillColor('#1E40AF').font('Helvetica-Bold')
  .text('📌 RECOMENDACIÓN DE ESTUDIO:', 55, 568);
doc.fontSize(8).fillColor('#1E3A8A').font('Helvetica')
  .text('Lea detalladamente cada sección antes de rendir la evaluación de 5 preguntas. El personero capacitado garantiza la victoria y transparencia del voto en cada mesa electoral de Lima.', 55, 580, { width: 485 });


// ==========================================
// CONTENIDO DETALLADO SECCIÓN POR SECCIÓN
// ==========================================

const SECCIONES_DATA = [
  {
    num: "1",
    title: "BIENVENIDA",
    badge: "INTRODUCCIÓN",
    locucion: [
      "¡Bienvenido al curso virtual para personeros de las Elecciones Regionales y Municipales 2026!",
      "En esta capacitación conocerás los principales aspectos que debes tener en cuenta para ejercer adecuadamente tu función durante la jornada electoral.",
      "Revisaremos tus derechos, funciones y prohibiciones en los tres momentos de la jornada electoral: la instalación de la mesa de sufragio, el sufragio y el escrutinio.",
      "Tu participación es fundamental para contribuir a la transparencia y al normal desarrollo del proceso electoral.",
      "A lo largo del curso encontrarás información práctica que te permitirá desempeñar tu función con responsabilidad y dentro del marco de la normativa electoral.",
      "¡Comencemos!"
    ],
    highlights: [
      { type: 'note', title: '🎯 OBJETIVO', text: 'Capacitar a los personeros para defender y cuidar cada voto de la organización política con responsabilidad y legalidad.' }
    ]
  },
  {
    num: "2",
    title: "ELECCIONES REGIONALES Y MUNICIPALES 2026",
    badge: "CIFRAS Y AUTORIDADES",
    locucion: [
      "Las Elecciones Regionales y Municipales 2026 se realizarán el domingo 4 de octubre de 2026.",
      "En esta jornada, la ciudadanía elegirá a las autoridades regionales y municipales que ejercerán sus funciones durante el periodo correspondiente.",
      "En total, se elegirán 13 148 autoridades en los ámbitos regional, provincial y distrital.",
      "De manera resumida:",
      "• 414 autoridades regionales.",
      "• 1 920 autoridades provinciales.",
      "• 10 814 autoridades distritales.",
      "Estas autoridades serán elegidas para conducir los gobiernos regionales y municipales durante el periodo correspondiente.",
      "Se trata de una jornada electoral de gran importancia para la ciudadanía y para el fortalecimiento de la democracia."
    ],
    highlights: [
      { type: 'note', title: '📊 DATOS LIMA METROPOLITANA', text: '43 distritos electorales, 2 211 locales de votación, 26 351 mesas de sufragio y 7 905 300 electores hábiles.' }
    ]
  },
  {
    num: "3",
    title: "EL PERSONERO Y SU FUNCIÓN",
    badge: "ROL E IMPEDIMENTOS",
    locucion: [
      "Para que una elección se desarrolle adecuadamente, intervienen diversos actores electorales, cada uno con funciones específicas.",
      "Entre ellos se encuentra el personero de una organización política.",
      "El personero es el ciudadano acreditado por una organización política para representar, cuidar y defender sus intereses durante el proceso electoral, de acuerdo con las disposiciones electorales vigentes.",
      "Por ello, el ejercicio de esta función exige responsabilidad, respeto y estricto cumplimiento de las normas.",
      "Recuerda que existen impedimentos para ejercer como personero. Entre ellos se encuentran los candidatos, los miembros de mesa, los funcionarios y servidores del sistema electoral y los miembros en actividad de las Fuerzas Armadas y de la Policía Nacional del Perú, conforme a la normativa aplicable."
    ],
    highlights: [
      { type: 'danger', title: '🚫 IMPEDIMENTOS LEGALES (NO PUEDEN SER PERSONEROS):', text: '• Candidatos a cargos de elección popular.\n• Miembros de mesa (titulares y suplentes).\n• Funcionarios del sistema electoral (JNE, ONPE, RENIEC).\n• Miembros activos de las FF.AA. y de la Policía Nacional del Perú.' }
    ]
  },
  {
    num: "4",
    title: "TIPOS DE PERSONEROS",
    badge: "CLASIFICACIÓN",
    locucion: [
      "En el proceso electoral participan diferentes tipos de personeros.",
      "En este curso conocerás las funciones del personero de local de votación y del personero de mesa, quienes desarrollan sus actividades durante la jornada electoral.",
      "Aunque ambos representan a una organización política, cada uno tiene funciones específicas y un ámbito de actuación determinado.",
      "Veamos cuáles son."
    ],
    highlights: [
      { type: 'note', title: '🛡️ LOS 2 NIVELES CLAVE DE LA JORNADA', text: '1. Personero de Local de Votación (PLV): Coordina y vigila todo el recinto escolar.\n2. Personero de Mesa: Vigila el acto en su mesa de sufragio específica.' }
    ]
  },
  {
    num: "5",
    title: "PERSONERO DE LOCAL DE VOTACIÓN (PLV)",
    badge: "ÁMBITO DEL LOCAL",
    locucion: [
      "Si eres personero de local de votación, tu función principal será observar el desarrollo de las actividades electorales dentro del local de votación.",
      "Asimismo, deberás coordinar y orientar a los personeros de mesa de tu organización política y mantener comunicación con el coordinador de local de la ONPE, cuando corresponda.",
      "Deberás estar presente desde el inicio de la jornada electoral y contarás con las facilidades necesarias para ejercer tu función.",
      "Recuerda que tu labor es de observación y vigilancia. Por ello, no debes interferir en las funciones de los miembros de mesa ni asumir funciones que no te corresponden."
    ],
    highlights: [
      { type: 'warning', title: '⚠️ REGLA DE ORO DEL PLV', text: 'El PLV coordina y asiste a sus personeros de mesa, pero no puede reemplazar a los miembros de mesa ni votar por otro.' }
    ]
  },
  {
    num: "6",
    title: "PERSONERO DE MESA",
    badge: "ÁMBITO DE LA MESA",
    locucion: [
      "Si eres personero de mesa, al presentarte deberás mostrar tu DNI y tu credencial al presidente de mesa.",
      "El presidente de mesa te asignará una silla desde la cual podrás observar el desarrollo de las actividades electorales.",
      "Podrás ejercer tu función durante la instalación, el sufragio y el escrutinio, en la mesa o mesas en las que hayas sido acreditado.",
      "Tu responsabilidad será observar el trabajo de los miembros de mesa, sin interferir en sus funciones, y formular las observaciones o reclamos que correspondan cuando adviertas algún hecho que pudiera afectar el normal desarrollo y transparencia del proceso electoral."
    ],
    highlights: [
      { type: 'success', title: '✅ DERECHO PRINCIPAL', text: 'Presenciar de inicio a fin la jornada y recibir copia oficial del Acta Electoral firmada al término del escrutinio.' }
    ]
  },
  {
    num: "7",
    title: "INSTALACIÓN DE LA MESA DE SUFRAGIO",
    badge: "MOMENTO 1 (07:00 A.M.)",
    locucion: [
      "Empecemos por el primer momento de la jornada electoral: la instalación de la mesa de sufragio.",
      "Durante esta etapa, los miembros de mesa reciben, verifican y organizan el material electoral necesario para acondicionar la mesa e iniciar sus actividades.",
      "Como personero, es importante que conozcas qué puedes observar y cuáles son los derechos que puedes ejercer durante esta etapa.",
      "Durante la instalación, podrás verificar que la relación de electores se encuentre colocada en el lugar correspondiente y que los carteles de candidatos estén colocados en la cámara secreta, conforme a las disposiciones establecidas.",
      "También podrás:",
      "• Firmar las cédulas de sufragio, si así lo deseas.",
      "• Formular observaciones o reclamos ante las situaciones que correspondan.",
      "• Firmar el acta de instalación, de manera opcional.",
      "Recuerda que el ejercicio de estos derechos debe realizarse sin obstaculizar ni interferir en las funciones de los miembros de mesa.",
      "Asimismo, podrás solicitar la nulidad de la mesa de sufragio cuando se configure alguna de las causales previstas en la normativa electoral."
    ],
    highlights: [
      { type: 'note', title: '⏰ CRONOGRAMA DE INSTALACIÓN', text: '07:00 a.m.: Titulares asumen.\n07:01 a.m.: Suplentes completan si faltan titulares.\n07:30 a.m.: ONPE toma electores de la fila (nunca personeros).' }
    ]
  },
  {
    num: "8",
    title: "EL SUFRAGIO",
    badge: "MOMENTO 2 (08:30 A.M. - 05:00 P.M.)",
    locucion: [
      "Pasemos ahora al segundo momento de la jornada electoral: el sufragio.",
      "Esta es la etapa en la que los electores ejercen su derecho de voto.",
      "Como personero, podrás observar el desarrollo del acto de sufragio y verificar que se respeten las disposiciones electorales.",
      "Durante el sufragio, tendrás derecho a:",
      "• Presenciar el acto de votación.",
      "• Verificar que los electores ingresen solos a la cámara secreta, salvo cuando requieran asistencia, de acuerdo con las disposiciones correspondientes.",
      "• Votar después de los miembros de mesa presentes, cuando te corresponda sufragar en esa mesa.",
      "• Impugnar la identidad de un elector, cuando existan motivos para ello.",
      "• Formular las observaciones o reclamos que correspondan.",
      "• Firmar la última página de la lista de electores y las actas de sufragio, si así lo deseas.",
      "Durante esta etapa debe garantizarse la atención preferente de las personas que la requieran.",
      "Las personas con discapacidad, movilidad reducida, gestantes y adultos mayores que tengan dificultades para desplazarse hasta su mesa podrán recibir atención mediante las medidas de accesibilidad previstas para la jornada electoral.",
      "Cuando corresponda, podrán ser atendidas en el módulo temporal de votación, al que se trasladarán los miembros de mesa.",
      "Como personero, podrás observar este procedimiento respetando siempre la privacidad, autonomía y derecho de sufragio del elector.",
      "Asimismo, podrás solicitar la nulidad de la mesa de sufragio cuando se configure alguna de las causales previstas en la normativa electoral, como los casos en que los miembros de mesa ejerzan intimidación o violencia sobre los electores."
    ],
    highlights: [
      { type: 'warning', title: '♿ ATENCIÓN PREFERENTE', text: 'Se garantiza módulo temporal de votación en primer piso para adultos mayores, gestantes y personas con discapacidad.' }
    ]
  },
  {
    num: "9",
    title: "EL ESCRUTINIO",
    badge: "MOMENTO 3 (05:00 P.M. EN ADELANTE)",
    locucion: [
      "Llegamos al tercer y último momento de la jornada electoral: el escrutinio.",
      "En esta etapa, los miembros de mesa realizan el conteo y la calificación de los votos y registran los resultados en las respectivas actas electorales.",
      "Como personero, tu presencia permitirá observar que este procedimiento se desarrolle conforme a las disposiciones electorales.",
      "Durante el escrutinio podrás:",
      "• Presenciar la lectura de los votos.",
      "• Observar el contenido de cada cédula de sufragio.",
      "• Impugnar un voto, cuando corresponda.",
      "• Formular observaciones o reclamos sobre el desarrollo del escrutinio.",
      "• Firmar las actas de escrutinio, si así lo deseas.",
      "• Solicitar la nulidad de la mesa de sufragio, cuando corresponda.",
      "• Solicitar una copia del acta electoral, de acuerdo con el procedimiento establecido.",
      "Recuerda que durante el escrutinio debes mantener una conducta respetuosa y evitar cualquier acción que interfiera con el trabajo de los miembros de mesa."
    ],
    highlights: [
      { type: 'success', title: '🗳️ REGLAS DE ORO DEL ESCRUTINIO', text: '1. El conteo es público y no se suspende.\n2. Se cuentan las cédulas en el ánfora antes de desdoblarlas (debe coincidir con la lista de votantes).' }
    ]
  },
  {
    num: "10",
    title: "PROHIBICIONES DE LOS PERSONEROS",
    badge: "CONDUCTA Y RESTRICCIONES",
    locucion: [
      "Así como tienes derechos durante la jornada electoral, también existen determinadas conductas que, como personero, debes evitar.",
      "Estas prohibiciones buscan preservar el orden, la transparencia y el normal desarrollo de las actividades electorales.",
      "Durante la jornada electoral, está prohibido:",
      "1. Preguntar a los electores por su preferencia electoral.",
      "2. Discutir con electores, miembros de mesa, personal de la ONPE u otros personeros dentro del aula.",
      "3. Interrumpir o perturbar el desarrollo del escrutinio.",
      "4. Realizar cualquier tipo de proselitismo dentro del local de votación.",
      "5. Manipular el material electoral.",
      "6. Interferir en las funciones de los miembros de mesa.",
      "7. Desempeñar funciones en la misma mesa junto con otro personero de la misma organización política, cuando ello se encuentre restringido por las disposiciones electorales.",
      "El incumplimiento de estas disposiciones puede dar lugar a que los miembros de mesa dispongan tu retiro del aula, conforme a la normativa electoral.",
      "Si eres personero de local de votación, recuerda además que no puedes reemplazar ni asumir las funciones de los personeros de mesa."
    ],
    highlights: [
      { type: 'danger', title: '🚨 SANCIÓN POR INCUMPLIMIENTO', text: 'Los miembros de mesa pueden ordenar el retiro inmediato con apoyo de las FF.AA. / PNP si se comete proselitismo o manipulación.' }
    ]
  },
  {
    num: "11",
    title: "CONOCIENDO LA CÉDULA DE SUFRAGIO",
    badge: "ANÁLISIS DE LA CÉDULA",
    locucion: [
      "Ahora revisaremos un elemento fundamental de la jornada electoral: la cédula de sufragio.",
      "Conocer sus características te permitirá desempeñar mejor tu función de observación, especialmente durante el escrutinio.",
      "La cédula contiene las opciones electorales correspondientes a los cargos que serán elegidos en las Elecciones Regionales y Municipales 2026.",
      "Recuerda que cada elección debe ser evaluada de manera independiente durante el escrutinio."
    ],
    highlights: [
      { type: 'note', title: '📌 PRINCIPIO DE INDEPENDENCIA', text: 'Un error o voto nulo en la elección regional NO invalida el voto provincial o distrital. Cada columna se cuenta por separado.' }
    ]
  },
  {
    num: "12",
    title: "TIPOS DE VOTO",
    badge: "CALIFICACIÓN DE VOTOS",
    locucion: [
      "Durante el escrutinio, los votos pueden clasificarse como válidos, nulos o en blanco.",
      "A continuación, revisaremos las principales características de cada uno.",
      "VOTO VÁLIDO: Un voto válido es aquel en el que la voluntad del elector puede identificarse claramente, de acuerdo con las reglas establecidas. La marca puede realizarse mediante una cruz (+) o un aspa (x) en el recuadro correspondiente. Una marca tenue o que sobrepase ligeramente el recuadro no determina por sí misma la nulidad del voto, siempre que se cumplan las condiciones establecidas.",
      "VOTO NULO: Por otro lado, un voto nulo es aquel que presenta alguna de las causales de nulidad previstas:",
      "• Marcar el símbolo de más de una organización política en una misma elección.",
      "• Utilizar un signo diferente de la cruz o el aspa (ej. círculo, firma o dibujo).",
      "• Que la intersección de la cruz o el aspa se encuentre fuera del recuadro.",
      "• Que la cédula no contenga la firma del presidente de mesa, cuando corresponda.",
      "• Que contenga el nombre, firma o DNI del elector.",
      "• Que contenga frases, expresiones o signos ajenos al voto.",
      "• Que la cédula no haya sido entregada por la mesa de sufragio.",
      "VOTO EN BLANCO: Se considera voto en blanco cuando el elector no realiza ninguna marca en la opción correspondiente."
    ],
    highlights: [
      { type: 'success', title: '✅ PREVALENCIA DE LA INTENCIÓN DEL VOTO', text: 'Si la intersección de la cruz (+) o aspa (x) está dentro del recuadro, el voto es 100% VÁLIDO.' }
    ]
  },
  {
    num: "13",
    title: "UBICACIÓN DEL PERSONERO DURANTE EL ESCRUTINIO",
    badge: "UBICACIÓN FÍSICA",
    locucion: [
      "Para observar adecuadamente el escrutinio, podrás acercar tu silla a la mesa de sufragio, manteniendo una distancia prudente.",
      "Esta ubicación debe permitirte observar la lectura y calificación de los votos sin interferir en el trabajo de los miembros de mesa.",
      "Recuerda: observar no significa intervenir.",
      "Tu función es vigilar el correcto desarrollo del procedimiento y utilizar los mecanismos establecidos cuando corresponda formular una observación, reclamo o impugnación."
    ],
    highlights: [
      { type: 'note', title: '👁️ VISIBILIDAD CLARA', text: 'El personero debe ver claramente el símbolo marcado en la cédula cuando el presidente lo muestra y lee en voz alta.' }
    ]
  },
  {
    num: "14",
    title: "HORARIO DE LA JORNADA ELECTORAL",
    badge: "CRONOGRAMA OFICIAL",
    locucion: [
      "Ten presente que el domingo 4 de octubre de 2026, la jornada de votación se desarrollará desde las 7:00 de la mañana hasta las 5:00 de la tarde.",
      "Como personero, es importante que organices tu participación y te presentes oportunamente en el local de votación donde ejercerás tu función."
    ],
    highlights: [
      { type: 'warning', title: '⏰ HORA DE LLEGADA RECOMENDADA', text: 'Presentarse a las 06:30 a.m. en el centro de votación con DNI físico y credencial oficial.' }
    ]
  },
  {
    num: "15",
    title: "CIERRE DE LA CAPACITACIÓN",
    badge: "EVALUACIÓN Y CONCLUSIÓN",
    locucion: [
      "Hemos llegado al final de este curso virtual para personeros de las Elecciones Regionales y Municipales 2026.",
      "Ahora conoces los principales aspectos relacionados con el ejercicio de tu función durante la instalación de la mesa de sufragio, el sufragio y el escrutinio.",
      "También has revisado tus principales derechos, las prohibiciones que debes respetar y algunos aspectos relacionados con la cédula de sufragio y la calificación de los votos.",
      "Recuerda que ser personero implica asumir una importante responsabilidad en la vigilancia del proceso electoral.",
      "Tu participación debe desarrollarse siempre con respeto, responsabilidad y estricto cumplimiento de las normas electorales.",
      "Para ampliar esta información, revisa el Manual de instrucciones para personeros.",
      "¡Felicitaciones! Has completado el curso. Ahora te invitamos a completar la evaluación de capacitación para obtener tu constancia de habilitación.",
      "¡Gracias por participar y contribuir al fortalecimiento de la transparencia y la integridad del proceso electoral!"
    ],
    highlights: [
      { type: 'success', title: '🏆 LISTO PARA RENDIR LA EVALUACIÓN', text: 'Rinde el cuestionario de 5 preguntas sobre la jornada electoral para quedar acreditado al 100%.' }
    ]
  }
];

// Generar cada sección
SECCIONES_DATA.forEach((sec, sIdx) => {
  doc.addPage();

  // Banner de la Sección
  doc.rect(45, 35, 505, 36).fill(NAVY);

  doc.circle(65, 53, 11).fill('#38BDF8');
  doc.fontSize(10).fillColor(NAVY).font('Helvetica-Bold')
    .text(sec.num, 55, 48, { width: 20, align: 'center' });

  doc.fontSize(12).fillColor('#FFFFFF').font('Helvetica-Bold')
    .text(`SECCIÓN ${sec.num}: ${sec.title}`, 85, 46, { width: 320 });

  doc.fontSize(7.5).fillColor('#38BDF8').font('Helvetica-Bold')
    .text(sec.badge, 410, 48, { width: 130, align: 'right' });

  doc.y = 85;

  // Encabezado de Locución
  doc.rect(45, doc.y, 505, 18).fill('#F1F5F9');
  doc.fontSize(8.5).fillColor(MUTED).font('Helvetica-Bold')
    .text('🎙️ TEXTO Y LOCUCIÓN OFICIAL DEL CURSO', 55, doc.y + 4.5);

  doc.y += 24;

  // Párrafos de Locución con alta legibilidad
  sec.locucion.forEach(p => {
    if (doc.y > 680) {
      doc.addPage();
      doc.y = 45;
    }

    doc.fontSize(9.5).fillColor(DARK).font('Helvetica')
      .text(p, 50, doc.y, { width: 495, lineGap: 3.5 });
    doc.moveDown(0.4);
  });

  // Cajas de Destacados / Alertas / Pautas
  if (sec.highlights && sec.highlights.length > 0) {
    sec.highlights.forEach(h => {
      if (doc.y > 640) {
        doc.addPage();
        doc.y = 45;
      }

      doc.moveDown(0.3);
      const boxY = doc.y;
      let bgC = '#EFF6FF';
      let borderC = BLUE_ACCENT;
      let titleC = NAVY;

      if (h.type === 'danger') {
        bgC = '#FEF2F2';
        borderC = RED;
        titleC = RED;
      } else if (h.type === 'success') {
        bgC = '#F0FDF4';
        borderC = GREEN;
        titleC = GREEN;
      } else if (h.type === 'warning') {
        bgC = '#FFFBEB';
        borderC = AMBER;
        titleC = AMBER;
      }

      const textHeight = doc.heightOfString(h.text, { width: 475, fontSize: 8.5 });
      const totalBoxHeight = textHeight + 28;

      doc.rect(45, boxY, 505, totalBoxHeight).fill(bgC);
      doc.rect(45, boxY, 4, totalBoxHeight).fill(borderC);
      doc.rect(45, boxY, 505, totalBoxHeight).stroke('#E2E8F0');

      doc.fontSize(9).fillColor(titleC).font('Helvetica-Bold')
        .text(h.title, 58, boxY + 6);

      doc.fontSize(8.5).fillColor(DARK).font('Helvetica')
        .text(h.text, 58, boxY + 19, { width: 480, lineGap: 2.5 });

      doc.y = boxY + totalBoxHeight + 6;
    });
  }
});

// Numeración de páginas global en el buffer
const range = doc.bufferedPageRange();
for (let i = range.start; i < range.start + range.count; i++) {
  doc.switchToPage(i);

  // Línea superior institucional
  doc.rect(45, 20, 505, 2).fill(NAVY);
  doc.fontSize(7.5).fillColor('#64748B').font('Helvetica')
    .text('SOMOS PERÚ • GUION DE CAPACITACIÓN ELECTORAL ERM 2026', 45, 10, { align: 'left' });

  // Línea inferior
  doc.rect(45, 805, 505, 1).fill('#E2E8F0');
  doc.fontSize(7.5).fillColor('#64748B').font('Helvetica')
    .text('Documento Oficial de Capacitación para Personeros • Lima Metropolitana', 45, 812, { align: 'left' })
    .text(`Página ${i + 1} de ${range.count}`, 45, 812, { align: 'right' });
}

doc.end();

console.log('✅ PDF Oficial generado con Portada, Índice Estructurado y 15 Secciones en:');
console.log('1.', outputPathFrontend);
console.log('2.', outputPathRoot);
