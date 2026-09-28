import PDFDocument from 'pdfkit';
import fs from 'fs';
import path from 'path';

const outputPathRootLima = path.resolve('E:/conteolima/INFORME_ECOSISTEMA_ELECTORAL_LIMA_2026.pdf');
const outputPathRegistro = path.resolve('E:/conteolima/registroconteolima/INFORME_ECOSISTEMA_ELECTORAL_LIMA_2026.pdf');
const outputPathFrontend = path.resolve('E:/conteolima/registroconteolima/frontend/public/manuals/INFORME_ECOSISTEMA_ELECTORAL_LIMA_2026.pdf');

// Margen inferior seguro (20pt) para que el footer no dispare paginación automática
const doc = new PDFDocument({
  size: 'A4',
  margins: { top: 20, bottom: 20, left: 40, right: 40 },
  bufferPages: true,
  autoFirstPage: true,
  info: {
    Title: 'Sistema de Conteo de Votos: Integración de Sistemas y Control Electoral Lima 2026',
    Author: 'Dirección de Operaciones y Control Electoral',
    Subject: 'Informe de Integración: Registro, Capacitación, Conteo Móvil OCR y Sala de Guerra Web'
  }
});

const writeStreamRootLima = fs.createWriteStream(outputPathRootLima);
const writeStreamRegistro = fs.createWriteStream(outputPathRegistro);
const writeStreamFrontend = fs.createWriteStream(outputPathFrontend);

doc.pipe(writeStreamRootLima);
doc.pipe(writeStreamRegistro);
doc.pipe(writeStreamFrontend);

// Paleta de Colores Institucional de Alta Fidelidad
const NAVY = '#002B66';
const DEEP_BLUE = '#0A192F';
const BLUE_ACCENT = '#0284C7';
const CYAN = '#0EA5E9';
const DARK = '#0F172A';
const MUTED = '#475569';
const BORDER = '#CBD5E1';
const BG_BOX = '#F8FAFC';
const RED = '#DC2626';
const GREEN = '#16A34A';
const AMBER = '#D97706';
const PURPLE = '#7C3AED';

function drawCard(x, y, w, h, bgColor = '#FFFFFF', borderColor = BORDER) {
  doc.rect(x, y, w, h).fill(bgColor);
  doc.rect(x, y, w, h).strokeColor(borderColor).lineWidth(1).stroke();
}

function renderHeaderAndFooter(doc, pageNum, totalPages) {
  // Encabezado
  doc.rect(40, 22, 515, 2).fill(NAVY);
  doc.fontSize(7.5).fillColor('#64748B').font('Helvetica')
    .text('SISTEMA DE CONTEO DE VOTOS • INTEGRACIÓN DE SISTEMAS ELECTORALES LIMA 2026', 40, 11, { width: 350, align: 'left', lineBreak: false })
    .text('DIRECCIÓN DE OPERACIONES Y CONTROL', 400, 11, { width: 155, align: 'right', lineBreak: false });

  // Pie de página (y = 790 está dentro de los límites de A4 842pt)
  doc.rect(40, 792, 515, 1).fill('#E2E8F0');
  doc.fontSize(7.5).fillColor('#64748B').font('Helvetica')
    .text('Documento Oficial de Integración de Sistemas y Control Electoral • Confidencial', 40, 798, { width: 380, align: 'left', lineBreak: false })
    .text(`Página ${pageNum} de ${totalPages}`, 430, 798, { width: 125, align: 'right', lineBreak: false });
}

// =========================================================================
// PÁGINA 1: PORTADA EJECUTIVA Y VISIÓN GLOBAL DEL ECOSISTEMA
// =========================================================================

// Banner Principal
doc.rect(40, 36, 515, 120).fill(DEEP_BLUE);
doc.rect(40, 36, 515, 4).fill(CYAN);

doc.fontSize(9).fillColor('#38BDF8').font('Helvetica-Bold')
  .text('INFORME TÉCNICO OFICIAL • INTEGRACIÓN DE SISTEMAS ELECTORALES', 55, 50, { width: 485, align: 'center', lineBreak: false });

doc.fontSize(17).fillColor('#FFFFFF').font('Helvetica-Bold')
  .text('SISTEMA DE CONTEO DE VOTOS', 55, 68, { width: 485, align: 'center', lineBreak: false });

doc.fontSize(11.5).fillColor('#F1F5F9').font('Helvetica-Bold')
  .text('Integración de Sistemas y Control Electoral Lima 2026', 55, 92, { width: 485, align: 'center', lineBreak: false });

doc.fontSize(8.2).fillColor('#94A3B8').font('Helvetica')
  .text('Plataformas Integradas: registroconteolima  •  conteovotosapplima  •  conteovotosweblima', 55, 122, { width: 485, align: 'center', lineBreak: false });

// Resumen Ejecutivo
let yPos = 166;
drawCard(40, yPos, 515, 102, BG_BOX, '#93C5FD');
doc.rect(40, yPos, 4, 102).fill(BLUE_ACCENT);

doc.fontSize(10).fillColor(NAVY).font('Helvetica-Bold')
  .text('1. RESUMEN EJECUTIVO & PROPÓSITO GENERAL', 55, yPos + 9);

doc.fontSize(8.2).fillColor(DARK).font('Helvetica')
  .text('El ecosistema electoral opera como una cadena de valor unificada compuesta por 3 aplicaciones complementarias, diseñadas para coordinar, capacitar, transmitir y monitorear la votación en Lima Metropolitana:', 55, yPos + 24, { width: 485, lineGap: 2 });

doc.fontSize(8).fillColor(MUTED).font('Helvetica-Bold')
  .text('1. Plataforma de Registro: Inscripción ciudadana, login con Nombre y DNI, capacitación multimedia (PDF + Video), evaluación de 5 preguntas aleatorias y emisión del certificado que habilita automáticamente al usuario en la App Móvil.\n2. Conteo App (Campo): Registro de asistencia matutina del personero, conteo manual, escaneo óptico OCR de actas e interfaces dedicadas para que el Coordinador Local y Zonal supervisen asistencias.\n3. Conteo Web (Sala de Guerra): Centralización de datos manuales y OCR, mapas por distrito/colegio/mesa y dashboards en vivo de candidatos y partidos ganadores.', 55, yPos + 51, { width: 485, lineGap: 1.8 });

// Las 3 Aplicaciones
yPos = 278;
doc.fontSize(10.5).fillColor(NAVY).font('Helvetica-Bold')
  .text('2. LAS 3 PLATAFORMAS Y SU ROL FUNCIONAL', 40, yPos);

yPos += 16;

// Card 1
drawCard(40, yPos, 165, 230, '#FFFFFF', '#E2E8F0');
doc.rect(40, yPos, 165, 24).fill(NAVY);
doc.fontSize(9).fillColor('#FFFFFF').font('Helvetica-Bold')
  .text('1. registroconteolima', 45, yPos + 6, { width: 155, align: 'center', lineBreak: false });
doc.fontSize(7.8).fillColor(CYAN).font('Helvetica-Bold')
  .text('REGISTRO & CAPACITACIÓN', 45, yPos + 30, { width: 155, align: 'center', lineBreak: false });
doc.fontSize(7.5).fillColor(DARK).font('Helvetica')
  .text('• Formulario: Nombre, DNI y mesa.\n• Login con Nombre Completo y DNI.\n• Capacitación: Visor de PDF y Video.\n• Evaluación: 5 preguntas aleatorias.\n• Certificado/Constancia Oficial.\n• Habilita automáticamente en la App.', 48, yPos + 46, { width: 150, lineGap: 3.5 });
doc.rect(48, yPos + 182, 149, 36).fill('#EFF6FF');
doc.fontSize(7.2).fillColor(BLUE_ACCENT).font('Helvetica-Bold')
  .text('Acreditación Previa Obligatoria\npara Personeros y Coordinadores', 50, yPos + 190, { width: 145, align: 'center' });

// Card 2
drawCard(215, yPos, 165, 230, '#FFFFFF', '#E2E8F0');
doc.rect(215, yPos, 165, 24).fill('#1E3A8A');
doc.fontSize(9).fillColor('#FFFFFF').font('Helvetica-Bold')
  .text('2. conteovotosapplima', 220, yPos + 6, { width: 155, align: 'center', lineBreak: false });
doc.fontSize(7.8).fillColor(GREEN).font('Helvetica-Bold')
  .text('CAMPO, ASISTENCIA Y OCR', 220, yPos + 30, { width: 155, align: 'center', lineBreak: false });
doc.fontSize(7.5).fillColor(DARK).font('Helvetica')
  .text('• Personero: Asistencia (1 vez mañana).\n• Conteo Manual + Conteo OCR (foto).\n• Coord. Local: Marca asistencia a los personeros de su colegio.\n• Coord. Zonal: Supervisa y marca asistencia de locales y personeros.', 223, yPos + 46, { width: 150, lineGap: 3.5 });
doc.rect(223, yPos + 182, 149, 36).fill('#F0FDF4');
doc.fontSize(7.2).fillColor(GREEN).font('Helvetica-Bold')
  .text('Transmisión de Escrutinio\ne Interfaces de Coordinación', 225, yPos + 190, { width: 145, align: 'center' });

// Card 3
drawCard(390, yPos, 165, 230, '#FFFFFF', '#E2E8F0');
doc.rect(390, yPos, 165, 24).fill(DEEP_BLUE);
doc.fontSize(9).fillColor('#FFFFFF').font('Helvetica-Bold')
  .text('3. conteovotosweblima', 395, yPos + 6, { width: 155, align: 'center', lineBreak: false });
doc.fontSize(7.8).fillColor(PURPLE).font('Helvetica-Bold')
  .text('SALA DE GUERRA & CÓMPUTO', 395, yPos + 30, { width: 155, align: 'center', lineBreak: false });
doc.fontSize(7.5).fillColor(DARK).font('Helvetica')
  .text('• Consolida data del Conteo App.\n• Dashboard y gráficas en vivo.\n• Partido y candidato que va ganando.\n• Desglose: Distrito, Colegio y Mesa.\n• Mapa GIS con 1,985 locales de Lima.', 398, yPos + 46, { width: 150, lineGap: 3.5 });
doc.rect(398, yPos + 182, 149, 36).fill('#FAF5FF');
doc.fontSize(7.2).fillColor(PURPLE).font('Helvetica-Bold')
  .text('Consolidación Estratégica para\nel Comando General de Campaña', 400, yPos + 190, { width: 145, align: 'center' });

// Cuadro de Integración y Sincronización
yPos = 520;
drawCard(40, yPos, 515, 78, '#F1F5F9', '#CBD5E1');
doc.fontSize(9).fillColor(NAVY).font('Helvetica-Bold')
  .text('ARQUITECTURA DE INTEGRACIÓN Y FLUJO DE DATOS SINCRONIZADO', 55, yPos + 8);
doc.fontSize(7.8).fillColor(DARK).font('Helvetica')
  .text('Las tres plataformas forman un circuito cerrado de datos: cuando un personero o coordinador culmina su registro y aprueba la capacitación en registroconteolima, su cuenta se activa automáticamente en conteovotosapplima. Durante el Día D, sus marcas de asistencia, conteos manuales y fotos OCR alimentan al instante a conteovotosweblima para el cómputo en vivo.', 55, yPos + 22, { width: 485, lineGap: 1.8 });
doc.fontSize(7.8).fillColor(MUTED).font('Helvetica-Bold')
  .text('Flujo: Registro y Acreditación  -->  Operación en Campo y OCR  -->  Consolidación en Sala de Guerra', 55, yPos + 60, { width: 485, align: 'center', lineBreak: false });

// Metadatos
yPos = 608;
drawCard(40, yPos, 515, 55, '#FFFFFF', '#E2E8F0');
doc.fontSize(8).fillColor(MUTED).font('Helvetica-Bold')
  .text('CARACTERÍSTICAS OPERATIVAS DESTACADAS', 50, yPos + 8);
doc.fontSize(7.5).fillColor(DARK).font('Helvetica')
  .text('• Operación Multiplataforma: Acceso web desde computadoras, tablets y teléfonos celulares móviles.\n• Doble Método de Escrutinio: Conteo Manual tecla a tecla y Conteo por Visión Artificial (OCR) de actas físicas.\n• Soporte Territorial: Cobertura geográfica estructurada para Lima Metropolitana y sus distritos electorales.', 50, yPos + 20, { width: 495, lineGap: 1.6 });

// =========================================================================
// PÁGINA 2: registroconteolima (REGISTRO, CAPACITACIÓN Y CERTIFICACIÓN)
// =========================================================================
doc.addPage();

doc.rect(40, 36, 515, 36).fill(NAVY);
doc.fontSize(13).fillColor('#FFFFFF').font('Helvetica-Bold')
  .text('APLICACIÓN 1: registroconteolima', 55, 43, { lineBreak: false });
doc.fontSize(8).fillColor(CYAN).font('Helvetica')
  .text('Formulario de Registro, Login con Nombre y DNI, Capacitación (PDF + Video), Examen y Certificado', 55, 57, { lineBreak: false });

yPos = 80;
drawCard(40, yPos, 515, 74, BG_BOX, '#BAE6FD');
doc.rect(40, yPos, 4, 74).fill(BLUE_ACCENT);
doc.fontSize(9.5).fillColor(NAVY).font('Helvetica-Bold')
  .text('OBJETIVO Y EXPERIENCIA DEL USUARIO', 55, yPos + 8);
doc.fontSize(8.2).fillColor(DARK).font('Helvetica')
  .text('Esta plataforma es la puerta de entrada al ecosistema electoral. Su función es permitir el empadronamiento estructurado, brindar una formación electoral completa e interactiva, validar el aprendizaje mediante una evaluación rigurosa y emitir el certificado oficial que habilita al usuario a operar en campo el día de las elecciones.', 55, yPos + 22, { width: 485, lineGap: 1.8 });
doc.fontSize(7.8).fillColor(MUTED).font('Helvetica-Bold')
  .text('Enfoque: Interfaz moderna, accesible desde cualquier dispositivo, amigable e intuitiva para el voluntario.', 55, yPos + 58);

yPos = 164;
doc.fontSize(10.5).fillColor(NAVY).font('Helvetica-Bold')
  .text('PASO A PASO DETALLADO DEL PERSONERO / VOLUNTARIO', 40, yPos);

const PASOS_DETALLE_APP1 = [
  {
    num: '1',
    titulo: 'Formulario de Registro Inicial',
    desc: 'El usuario accede al portal público y completa el formulario con sus datos: Nombre Completo, DNI, número de contacto, rol (Personero de Mesa, Personero de Local, Coordinador), distrito, colegio de votación y número de mesa asignada.'
  },
  {
    num: '2',
    titulo: 'Inicio de Sesión (Login)',
    desc: 'El usuario inicia sesión en su panel personal introduciendo su Nombre Completo y su DNI registrado. El sistema valida su identidad y despliega su entorno de capacitación.'
  },
  {
    num: '3',
    titulo: 'Capacitación Multimedia (PDF Oficial + Video Instructivo)',
    desc: 'El personero dispone de dos materiales de formación interactivos: 1) Visor del Manual y Guion Oficial en PDF (derechos, deberes, defensa del voto y escrutinio), y 2) Video Tutorial explicativo con los procedimientos paso a paso.'
  },
  {
    num: '4',
    titulo: 'Evaluación de 5 Preguntas Aleatorias',
    desc: 'Para asegurar que el contenido fue asimilado, el sistema genera una prueba interactiva con 5 preguntas aleatorias extraídas directamente del material del video y del PDF. El personero debe responderlas correctamente para aprobar.'
  },
  {
    num: '5',
    titulo: 'Emisión de Certificado / Constancia Oficial y Acreditación',
    desc: 'Al aprobar, el sistema felicita al usuario con una constancia/certificado oficial y su credencial con código QR. Automáticamente, el sistema lo califica como APROBADO y lo habilita para ingresar a la App de Conteo.'
  }
];

yPos += 16;
PASOS_DETALLE_APP1.forEach(p => {
  drawCard(40, yPos, 515, 48, '#FFFFFF', '#E2E8F0');
  doc.circle(58, yPos + 24, 10).fill(NAVY);
  doc.fontSize(9).fillColor('#FFFFFF').font('Helvetica-Bold')
    .text(p.num, 48, yPos + 20, { width: 20, align: 'center', lineBreak: false });

  doc.fontSize(8.5).fillColor(NAVY).font('Helvetica-Bold')
    .text(p.titulo, 76, yPos + 6, { lineBreak: false });
  doc.fontSize(7.5).fillColor(DARK).font('Helvetica')
    .text(p.desc, 76, yPos + 19, { width: 468, lineGap: 1.4 });

  yPos += 53;
});

// Panel Administrativo
yPos = 440;
doc.fontSize(10.5).fillColor(NAVY).font('Helvetica-Bold')
  .text('MÓDULOS DE ADMINISTRACIÓN Y SUPERVISIÓN', 40, yPos);

yPos += 14;
drawCard(40, yPos, 515, 115, BG_BOX, '#CBD5E1');

const ADMIN_APP1 = [
  '• Padrón General de Aprobados: Registro centralizado de personeros que culminaron exitosamente su capacitación y examen.',
  '• Verificación Pública de Credenciales: Permite a las autoridades o miembros de mesa escanear el QR con un smartphone y confirmar la validez de la acreditación en tiempo real.',
  '• Monitoreo Georreferenciado: Visualización del mapa de locales y porcentaje de cobertura de personeros en cada distrito.',
  '• Exportación de Padrones a Excel y PDF: Generación de listas oficiales organizadas por distrito, colegio y mesa.'
];

let admY = yPos + 8;
ADMIN_APP1.forEach(txt => {
  doc.fontSize(7.8).fillColor(DARK).font('Helvetica').text(txt, 52, admY, { width: 490 });
  admY += 25;
});

// Resumen Funcional
yPos = 565;
drawCard(40, yPos, 515, 60, '#F1F5F9', '#94A3B8');
doc.fontSize(8.5).fillColor(NAVY).font('Helvetica-Bold')
  .text('RESUMEN DE OPERACIÓN DE LA PLATAFORMA DE REGISTRO', 50, yPos + 7);
doc.fontSize(7.5).fillColor(MUTED).font('Helvetica')
  .text('• Rol Principal: Filtro y capacitación de voluntarios antes de la jornada electoral.\n• Salida Clave: Padrón blindado y personeros 100% acreditados para defender el voto en las mesas.\n• Conexión Directa: Habilita el acceso seguro a la App Móvil el Día D.', 50, yPos + 20, { lineGap: 2 });

// =========================================================================
// PÁGINA 3: conteovotosapplima (APP MÓVIL, ROLES Y TRANSMISIÓN OCR)
// =========================================================================
doc.addPage();

doc.rect(40, 36, 515, 36).fill('#1E3A8A');
doc.fontSize(13).fillColor('#FFFFFF').font('Helvetica-Bold')
  .text('APLICACIÓN 2: conteovotosapplima', 55, 43, { lineBreak: false });
doc.fontSize(8).fillColor('#93C5FD').font('Helvetica')
  .text('App Móvil: Asistencia de Personeros, Conteo Manual, Conteo OCR y Paneles de Coordinadores', 55, 57, { lineBreak: false });

yPos = 80;
drawCard(40, yPos, 515, 74, BG_BOX, '#BBF7D0');
doc.rect(40, yPos, 4, 74).fill(GREEN);
doc.fontSize(9.5).fillColor('#14532D').font('Helvetica-Bold')
  .text('ESTRUCTURA DE ROLES Y OPERACIÓN EN CAMPO (DÍA D)', 55, yPos + 8);
doc.fontSize(8.2).fillColor(DARK).font('Helvetica')
  .text('Es la aplicación móvil de campo. Solo los personeros y coordinadores que aprobaron la capacitación en la App 1 pueden operar en ella. El sistema adapta dinámicamente su interfaz según el rol del usuario conectado: Personero de Mesa, Coordinador Local o Coordinador Zonal.', 55, yPos + 22, { width: 485, lineGap: 1.8 });
doc.fontSize(7.8).fillColor(MUTED).font('Helvetica-Bold')
  .text('Enfoque: Diseñada para teléfonos móviles, navegación rápida, botones grandes y lectura con Inteligencia Artificial.', 55, yPos + 58);

yPos = 164;
doc.fontSize(10.5).fillColor(NAVY).font('Helvetica-Bold')
  .text('FUNCIONAMIENTO POR ROL Y JERARQUÍA', 40, yPos);

// Rol 1: Personero de Mesa
yPos += 14;
drawCard(40, yPos, 515, 88, '#FFFFFF', '#BAE6FD');
doc.rect(40, yPos, 4, 88).fill(BLUE_ACCENT);
doc.fontSize(9).fillColor(NAVY).font('Helvetica-Bold')
  .text('A) ROL: PERSONERO DE MESA', 55, yPos + 7, { lineBreak: false });
doc.fontSize(7.8).fillColor(DARK).font('Helvetica')
  .text('1. Marcación de Asistencia Matutina: Al llegar a su colegio por la mañana, el personero marca su asistencia (se registra una sola vez en el sistema con su hora exacta de llegada).\n2. Opción 1 - Conteo Manual: Durante el escrutinio a las 05:00 PM, ingresa los votos mediante un teclado táctil candidato por candidato para Lima Metropolitana y su Distrito.\n3. Opción 2 - Conteo OCR (Foto del Acta): Toma una fotografía del Acta de Escrutinio física pegada al finalizar la mesa. El motor de Inteligencia Artificial lee automáticamente los votos de cada partido.\n4. Envío y Validación: El sistema valida que la suma de votos sea consistente y transmite la información a la central.', 55, yPos + 21, { width: 485, lineGap: 1.8 });

// Rol 2: Coordinador Local
yPos += 96;
drawCard(40, yPos, 515, 76, '#FFFFFF', '#BBF7D0');
doc.rect(40, yPos, 4, 76).fill(GREEN);
doc.fontSize(9).fillColor('#14532D').font('Helvetica-Bold')
  .text('B) ROL: COORDINADOR LOCAL (RESPONSABLE DE COLEGIO)', 55, yPos + 7, { lineBreak: false });
doc.fontSize(7.8).fillColor(DARK).font('Helvetica')
  .text('• Interfaz de Colegio: El Coordinador Local visualiza la lista de todas las mesas de su centro de votación.\n• Marcado y Validación de Asistencia: Supervisa físicamente qué personeros han llegado a su local y les marca asistencia directamente desde su panel si el personero no dispone de teléfono o batería.\n• Soporte en Mesas Críticas: Reporta mesas sin personero para que se envíen suplentes de inmediato.', 55, yPos + 21, { width: 485, lineGap: 1.8 });

// Rol 3: Coordinador Zonal
yPos += 84;
drawCard(40, yPos, 515, 76, '#FFFFFF', '#E9D5FF');
doc.rect(40, yPos, 4, 76).fill(PURPLE);
doc.fontSize(9).fillColor('#581C87').font('Helvetica-Bold')
  .text('C) ROL: COORDINADOR ZONAL / DISTRITAL', 55, yPos + 7, { lineBreak: false });
doc.fontSize(7.8).fillColor(DARK).font('Helvetica')
  .text('• Supervisión Territorial: Visualiza todos los locales de votación pertenecientes a su zona o distrito.\n• Marcado y Control de Asistencia Global: Supervisa si los Coordinadores Locales están activos y si han marcado la asistencia de sus respectivos personeros.\n• Monitoreo de Transmisión: Controla el porcentaje de actas transmitidas por local en su jurisdicción.', 55, yPos + 21, { width: 485, lineGap: 1.8 });

// Cronograma de Campo
yPos += 84;
doc.fontSize(10.5).fillColor(NAVY).font('Helvetica-Bold')
  .text('CRONOGRAMA OPERATIVO DEL DÍA D (PASO A PASO)', 40, yPos);

yPos += 14;
drawCard(40, yPos, 515, 72, BG_BOX, '#CBD5E1');

const CRONO_APP2 = [
  '• 07:00 AM: Personeros llegan al colegio y marcan su asistencia matutina (1 sola vez).',
  '• 07:30 AM: Coordinador Local revisa en su app la asistencia y marca a personeros presenciales.',
  '• 08:00 AM: Coordinador Zonal supervisa la cobertura total de su zona y atiende alertas de locales vacíos.',
  '• 05:00 PM: Personeros inician el escrutinio, transmitiendo el Conteo Manual y la Foto del Acta con OCR.'
];

let crY = yPos + 7;
CRONO_APP2.forEach(c => {
  doc.fontSize(7.6).fillColor(DARK).font('Helvetica').text(c, 52, crY, { width: 490 });
  crY += 14.5;
});

// Resumen Funcional
yPos = 565;
drawCard(40, yPos, 515, 60, '#F1F5F9', '#94A3B8');
doc.fontSize(8.5).fillColor(NAVY).font('Helvetica-Bold')
  .text('RESUMEN DE OPERACIÓN DE LA APP DE CONTEO', 50, yPos + 7);
doc.fontSize(7.5).fillColor(MUTED).font('Helvetica')
  .text('• Rol Principal: Captura y transmisión en tiempo real de asistencia, votos manuales y actas OCR.\n• Innovación: Reconocimiento óptico por IA que agiliza el conteo y elimina errores de digitación.\n• Jerarquía: Coordinadores con control total de asistencia para asegurar 100% de presencia en mesas.', 50, yPos + 20, { lineGap: 2 });

// =========================================================================
// PÁGINA 4: conteovotosweblima (SALA DE GUERRA, CÓMPUTO Y MAPA GIS)
// =========================================================================
doc.addPage();

doc.rect(40, 36, 515, 36).fill(DEEP_BLUE);
doc.fontSize(13).fillColor('#FFFFFF').font('Helvetica-Bold')
  .text('APLICACIÓN 3: conteovotosweblima', 55, 43, { lineBreak: false });
doc.fontSize(8).fillColor('#E9D5FF').font('Helvetica')
  .text('Dashboard Central: Consolidación de Data Manual y OCR, Resultados por Candidato y Filtros GIS', 55, 57, { lineBreak: false });

yPos = 80;
drawCard(40, yPos, 515, 74, BG_BOX, '#E9D5FF');
doc.rect(40, yPos, 4, 74).fill(PURPLE);
doc.fontSize(9.5).fillColor('#581C87').font('Helvetica-Bold')
  .text('CENTRO DE CÓMPUTO & SALA DE GUERRA (WAR ROOM)', 55, yPos + 8);
doc.fontSize(8.2).fillColor(DARK).font('Helvetica')
  .text('Es la plataforma de inteligencia y monitoreo estratégico. Su función es jalar toda la información generada en conteovotosapplima (tanto el conteo manual como la lectura OCR de las actas) y proyectarla en tiempo real mediante gráficas interactivas, tablas comparativas y un mapa cartográfico de toda Lima.', 55, yPos + 22, { width: 485, lineGap: 1.8 });
doc.fontSize(7.8).fillColor(MUTED).font('Helvetica-Bold')
  .text('Enfoque: Pantallas ejecutivas para directivos, sala de prensa y análisis estadístico en vivo.', 55, yPos + 58);

yPos = 164;
doc.fontSize(10.5).fillColor(NAVY).font('Helvetica-Bold')
  .text('CAPACIDADES Y MÓDULOS DE ANÁLISIS EN TIEMPO REAL', 40, yPos);

const CAPACIDADES_APP3 = [
  {
    t: '1. Dashboard de Resultados Electorales en Vivo',
    d: 'Muestra los votos consolidados en tiempo real: qué partido y qué candidato va ganando para la Alcaldía Provincial de Lima y en cada una de las 42 alcaldías distritales, con curvas de avance y porcentajes de votos válidos.'
  },
  {
    t: '2. Consolidación de Data: Conteo Manual vs. Conteo OCR',
    d: 'Cruza automáticamente la información que el personero digitó manualmente contra lo que leyó la Inteligencia Artificial en la foto del acta. Si los números coinciden, el acta se valida al 100%; si hay discrepancia, se alerta para revisión legal.'
  },
  {
    t: '3. Filtros Multidimensionales (Distrito > Colegio > Mesa)',
    d: 'Permite desglosar los resultados con precisión quirúrgica: desde la visión global de Lima Metropolitana, pasando por distritos y colegios específicos, hasta el detalle acta por acta de cada mesa de sufragio.'
  },
  {
    t: '4. Mapa Electoral GIS Interactivo (1,985 Locales de Votación)',
    d: 'Mapa interactivo con la ubicación exacta de los centros de sufragio de Lima. Semáforo por colores según el estado: Colegio sin abrir, en votación, con actas en proceso de conteo y actas 100% transmitidas y cerradas.'
  },
  {
    t: '5. Monitoreo de Asistencia y Coordinadores',
    d: 'Panel de supervisión que refleja las asistencias marcadas por los personeros, los coordinadores locales y los coordinadores zonales, permitiendo identificar en tiempo real qué zonas requieren refuerzos.'
  }
];

yPos += 16;
CAPACIDADES_APP3.forEach((c, idx) => {
  drawCard(40, yPos, 515, 46, idx % 2 === 0 ? '#FFFFFF' : BG_BOX, '#E2E8F0');
  doc.circle(55, yPos + 23, 9).fill(PURPLE);
  doc.fontSize(8.5).fillColor('#FFFFFF').font('Helvetica-Bold')
    .text((idx + 1).toString(), 47, yPos + 19, { width: 16, align: 'center', lineBreak: false });

  doc.fontSize(8.5).fillColor(PURPLE).font('Helvetica-Bold')
    .text(c.t, 72, yPos + 6, { lineBreak: false });
  doc.fontSize(7.5).fillColor(DARK).font('Helvetica')
    .text(c.d, 72, yPos + 19, { width: 470, lineGap: 1.4 });

  yPos += 51;
});

// Paso a Paso de Toma de Decisiones
yPos = 434;
doc.fontSize(10.5).fillColor(NAVY).font('Helvetica-Bold')
  .text('PASO A PASO: MONITOREO Y TOMA DE DECISIONES ESTRATÉGICAS', 40, yPos);

yPos += 14;
drawCard(40, yPos, 515, 120, '#FFFFFF', '#CBD5E1');

const PASOS_WARROOM = [
  { f: 'Fase 1 (07:00 a 09:00 AM)', desc: 'Supervisión en el Dashboard de Asistencia para confirmar que el 100% de colegios y mesas tengan personeros instalados.' },
  { f: 'Fase 2 (09:00 AM a 05:00 PM)', desc: 'Monitoreo de incidencias reportadas por coordinadores zonales en locales de votación conflictivos.' },
  { f: 'Fase 3 (05:00 a 06:30 PM)', desc: 'Recepción del Conteo Rápido y primeras proyecciones estadísticas de partidos y candidatos ganadores.' },
  { f: 'Fase 4 (06:30 PM en adelante)', desc: 'Auditoría de actas con el Comparador Manual vs OCR. Detección inmediata de actas adulteradas para impugnación.' },
  { f: 'Fase 5 (Cierre y Prensa)', desc: 'Exportación de cuadros de mando consolidados por distrito para la conferencia de prensa y defensa del voto.' }
];

let pY = yPos + 8;
PASOS_WARROOM.forEach(step => {
  doc.fontSize(8).fillColor(PURPLE).font('Helvetica-Bold')
    .text(step.f + ': ', 52, pY, { lineBreak: false });
  const w = doc.widthOfString(step.f + ': ');
  doc.fontSize(7.8).fillColor(DARK).font('Helvetica')
    .text(step.desc, 52 + w, pY, { width: 480 - w });
  pY += 22;
});

// Resumen Funcional
yPos = 565;
drawCard(40, yPos, 515, 60, '#F1F5F9', '#94A3B8');
doc.fontSize(8.5).fillColor(NAVY).font('Helvetica-Bold')
  .text('RESUMEN DE OPERACIÓN DE LA SALA DE GUERRA WEB', 50, yPos + 7);
doc.fontSize(7.5).fillColor(MUTED).font('Helvetica')
  .text('• Rol Principal: Consolidación visual de toda la votación en Lima Metropolitana y sus distritos.\n• Capacidad Analítica: Desglose por distrito, local y mesa con comparador Manual vs OCR.\n• Toma de Decisiones: Datos en vivo para orientar la defensa del voto y declaraciones públicas.', 50, yPos + 20, { lineGap: 2 });

// =========================================================================
// PÁGINA 5: MATRIZ DE INTEGRACIÓN, FLUJO DE DATOS Y CONCLUSIONES
// =========================================================================
doc.addPage();

doc.rect(40, 36, 515, 36).fill(NAVY);
doc.fontSize(13).fillColor('#FFFFFF').font('Helvetica-Bold')
  .text('MATRIZ DE INTEGRACIÓN Y FLUJO DE DATOS GLOBAL', 55, 43, { lineBreak: false });
doc.fontSize(8).fillColor(CYAN).font('Helvetica')
  .text('Sincronización de Extremo a Extremo: De la Inscripción al Cómputo Final', 55, 57, { lineBreak: false });

// Tabla de Flujo Integral
yPos = 80;
doc.fontSize(10.5).fillColor(NAVY).font('Helvetica-Bold')
  .text('1. MATRIZ DE FUNCIONES Y NIVELES JERÁRQUICOS', 40, yPos);

yPos += 14;
doc.rect(40, yPos, 515, 18).fill(NAVY);
doc.fontSize(7.8).fillColor('#FFFFFF').font('Helvetica-Bold')
  .text('ACTOR / ROL', 45, yPos + 5, { width: 95, lineBreak: false })
  .text('registroconteolima', 145, yPos + 5, { width: 120, lineBreak: false })
  .text('conteovotosapplima', 270, yPos + 5, { width: 120, lineBreak: false })
  .text('conteovotosweblima', 395, yPos + 5, { width: 150, lineBreak: false });

const MATRIZ_ACTORES = [
  { a: 'Personero de Mesa', r1: 'Registro, Capacitación (PDF+Video), Examen 5 preguntas y Certificado.', r2: 'Asistencia matutina (1 vez), Conteo Manual y Foto OCR del Acta.', r3: 'Sus votos alimentan el cómputo de su mesa en vivo.' },
  { a: 'Coordinador Local', r1: 'Registro y capacitación en funciones de colegio y vigilancia.', r2: 'Marca asistencia a personeros que llegaron a su colegio.', r3: 'Monitorea el avance de apertura y actas de su local.' },
  { a: 'Coordinador Zonal', r1: 'Registro y acreditación distrital / zonal.', r2: 'Supervisa y marca asistencia de locales y personeros de su zona.', r3: 'Analiza cobertura y contingencias de su distrito en el mapa.' },
  { a: 'Comando General', r1: 'Auditoría del padrón de aprobados y exportación a Excel.', r2: 'Supervisión de transmisiones activas en tiempo real.', r3: 'Dashboard War Room: Candidatos ganadores y mapa GIS.' }
];

yPos += 18;
MATRIZ_ACTORES.forEach((row, idx) => {
  drawCard(40, yPos, 515, 30, idx % 2 === 0 ? '#FFFFFF' : '#F8FAFC', '#E2E8F0');
  doc.fontSize(7.5).fillColor(NAVY).font('Helvetica-Bold').text(row.a, 45, yPos + 4, { width: 95 });
  doc.fontSize(7.2).fillColor(DARK).font('Helvetica').text(row.r1, 145, yPos + 4, { width: 120, lineGap: 1.1 });
  doc.fontSize(7.2).fillColor(DARK).font('Helvetica').text(row.r2, 270, yPos + 4, { width: 120, lineGap: 1.1 });
  doc.fontSize(7.2).fillColor(DARK).font('Helvetica').text(row.r3, 395, yPos + 4, { width: 150, lineGap: 1.1 });
  yPos += 30;
});

// Protocolos de Seguridad y Blindaje
yPos = 236;
doc.fontSize(10.5).fillColor(NAVY).font('Helvetica-Bold')
  .text('2. BLINDAJE ELECTORAL Y SEGURIDAD OPERATIVA', 40, yPos);

yPos += 14;
drawCard(40, yPos, 515, 110, BG_BOX, '#CBD5E1');

const SEGURIDAD = [
  { t: '1. Aprobación Obligatoria Previa', d: 'Nadie puede ingresar a la App Móvil sin antes haberse registrado, capacitado y aprobado el examen de 5 preguntas en la App de Registro.' },
  { t: '2. Doble Confirmación de Asistencia', d: 'El personero marca su llegada matutina y el Coordinador Local/Zonal valida su presencia física en el centro de votación.' },
  { t: '3. Auditoría Forense Manual vs OCR', d: 'Garantiza que ningún dato sea alterado: el sistema contrasta la digitación manual contra la imagen fotográfica procesada por IA.' },
  { t: '4. Resiliencia Operativa en Campo', d: 'La App móvil cuenta con almacenamiento local ante pérdida temporal de cobertura celular, transmitiendo automáticamente al reconectar.' }
];

let segY = yPos + 7;
SEGURIDAD.forEach(s => {
  doc.rect(50, segY + 2, 4, 16).fill(BLUE_ACCENT);
  doc.fontSize(7.8).fillColor(NAVY).font('Helvetica-Bold').text(s.t, 60, segY, { lineBreak: false });
  doc.fontSize(7.2).fillColor(DARK).font('Helvetica').text(s.d, 60, segY + 11, { width: 480, lineGap: 1.3 });
  segY += 25;
});

// Flujo Secuencial
yPos = 372;
doc.fontSize(10.5).fillColor(NAVY).font('Helvetica-Bold')
  .text('3. FLUJO SECUENCIAL DE OPERACIÓN INTEGRADA PARA EL DÍA D', 40, yPos);

yPos += 14;
drawCard(40, yPos, 515, 118, '#FFFFFF', '#93C5FD');

const PASOS_DESPLIEGUE = [
  'Paso 1 (Fase Pre-Electoral): Personeros y coordinadores se registran, completan la capacitación multimedia, aprueban el examen y obtienen su certificado en registroconteolima.',
  'Paso 2 (Mañana del Día D - 07:00 AM): Personeros ingresan a conteovotosapplima y marcan asistencia (1 vez). Los Coordinadores Locales y Zonales supervisan y validan la asistencia.',
  'Paso 3 (Tarde del Día D - 05:00 PM): Al cerrar las urnas, los personeros registran el Conteo Manual y toman la fotografía del Acta Oficial para procesamiento OCR con IA.',
  'Paso 4 (Cómputo en Sala de Guerra): conteovotosweblima centraliza la data en vivo, mostrando los candidatos y partidos ganadores por distrito, colegio y mesa.',
  'Paso 5 (Auditoría y Defensa del Voto): El equipo legal compara la data Manual vs OCR y prepara impugnaciones inmediatas ante cualquier inconsistencia detectada.'
];

let desY = yPos + 8;
PASOS_DESPLIEGUE.forEach(p => {
  doc.fontSize(7.6).fillColor(DARK).font('Helvetica').text(p, 55, desY, { width: 490 });
  desY += 21;
});

// Conclusión Ejecutiva
yPos = 516;
drawCard(40, yPos, 515, 108, DEEP_BLUE, CYAN);
doc.fontSize(10.5).fillColor('#FFFFFF').font('Helvetica-Bold')
  .text('CONCLUSIÓN Y DICTAMEN DE OPERACIONES', 55, yPos + 10, { lineBreak: false });
doc.fontSize(7.8).fillColor('#E2E8F0').font('Helvetica')
  .text('El ecosistema electoral compuesto por registroconteolima, conteovotosapplima y conteovotosweblima ofrece un circuito cerrado, coherente y robusto. La integración entre el registro previo con evaluación, la supervisión de asistencia por niveles de coordinación, el escaneo óptico por IA en mesa y el dashboard de sala de guerra garantiza control total, velocidad en los resultados y blindaje absoluto del voto en Lima 2026.', 55, yPos + 26, { width: 485, lineGap: 2 });
doc.fontSize(8).fillColor(CYAN).font('Helvetica-Bold')
  .text('Ecosistema 100% Conectado, Funcional y Preparado para la Victoria Electoral en Lima 2026.', 55, yPos + 86, { width: 485, align: 'center', lineBreak: false });

// =========================================================================
// RENDERIZADO DE ENCABEZADOS Y PIES DE PÁGINA (SIN DESBORDES)
// =========================================================================
const range = doc.bufferedPageRange();
console.log(`Verificación de páginas en buffer: ${range.count}`);

for (let i = range.start; i < range.start + range.count; i++) {
  doc.switchToPage(i);
  renderHeaderAndFooter(doc, i + 1, range.count);
}

doc.end();

console.log('✅ PDF de Informe generado con ÉXITO en:');
console.log('1.', outputPathRootLima);
console.log('2.', outputPathRegistro);
console.log('3.', outputPathFrontend);
