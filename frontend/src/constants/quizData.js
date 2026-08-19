/**
 * Banco oficial de 100 preguntas de capacitación electoral para Personeros y Coordinadores 
 * del Partido Democrático Somos Perú - Elecciones Regionales y Municipales 2026 (Carlos Bruce).
 * Basado estrictamente en el "Manual de Capacitación para Personeros ERM 2026".
 */
export const QUESTION_BANK = [
  // ==========================================
  // MÓDULO 1: SISTEMA ELECTORAL PERUANO
  // ==========================================
  {
    id: 1,
    question: "¿Cuáles son los tres organismos que conforman el Sistema Electoral peruano según la Constitución?",
    options: [
      "Jurado Nacional de Elecciones (JNE), Oficina Nacional de Procesos Electorales (ONPE) y Registro Nacional de Identificación y Estado Civil (Reniec).",
      "Poder Judicial, Ministerio Público y Defensoría del Pueblo.",
      "Congreso de la República, Presidencia del Consejo de Ministros y ONPE.",
      "Jurado Electoral Especial, Policía Nacional del Perú y Fuerzas Armadas."
    ],
    answer: 0,
    explanation: "El artículo 177 de la Constitución establece que el Sistema Electoral está conformado por el JNE, la ONPE y el Reniec."
  },
  {
    id: 2,
    question: "¿Cuál es la función principal de la ONPE en las Elecciones Regionales y Municipales 2026?",
    options: [
      "Organizar, planificar y ejecutar los procesos electorales, así como el cómputo y entrega de resultados.",
      "Administrar justicia electoral en última instancia y fiscalizar la legalidad del padrón.",
      "Elaborar y actualizar el padrón electoral y emitir los DNI de los ciudadanos.",
      "Proclamar a los candidatos ganadores y entregar las credenciales a las autoridades electas."
    ],
    answer: 0,
    explanation: "La ONPE es la autoridad encargada de la organización técnica, diseño del material, despliegue logístico y cómputo de votos."
  },
  {
    id: 3,
    question: "¿Qué organismo tiene la competencia exclusiva de administrar justicia electoral y proclamar los resultados oficiales?",
    options: [
      "El Jurado Nacional de Elecciones (JNE) a través de sus Jurados Electorales Especiales (JEE).",
      "La Oficina Nacional de Procesos Electorales (ONPE).",
      "El Registro Nacional de Identificación y Estado Civil (Reniec).",
      "El Tribunal Constitucional."
    ],
    answer: 0,
    explanation: "El JNE y los JEE administran justicia electoral, resuelven apelaciones e impugnaciones y proclaman a las autoridades electas."
  },
  {
    id: 4,
    question: "¿Qué rol cumple el Reniec dentro del proceso electoral?",
    options: [
      "Elaborar el Padrón Electoral inicial y mantener actualizado el registro de identidad de los ciudadanos.",
      "Imprimir las cédulas de votación y distribuirlas a los locales.",
      "Capacitar a los miembros de mesa y fiscalizar la propaganda política.",
      "Custodiar el material electoral junto a las Fuerzas Armadas."
    ],
    answer: 0,
    explanation: "El Reniec prepara y actualiza el padrón electoral con la información del registro de identidad de los ciudadanos."
  },
  {
    id: 5,
    question: "¿Qué es una ODPE (Oficina Descentralizada de Procesos Electorales)?",
    options: [
      "Un órgano temporal de la ONPE encargado de conducir el proceso electoral en una circunscripción determinada.",
      "Una sede permanente del Reniec para la emisión de DNI en provincias.",
      "El local partidario donde se reúnen los personeros de mesa.",
      "La comisaría designada para la custodia policial de las mesas."
    ],
    answer: 0,
    explanation: "Las ODPE son órganos descentralizados temporales de la ONPE que ejecutan la logística y el cómputo en cada circunscripción."
  },
  {
    id: 6,
    question: "¿Qué es un Jurado Electoral Especial (JEE)?",
    options: [
      "Órgano temporal del JNE de primera instancia para impartir justicia electoral, resolver tachas e impugnaciones.",
      "Un grupo de personeros designados para contar votos en el colegio.",
      "La mesa de votación conformada por tres ciudadanos sorteados.",
      "La comisión técnica encargada del software de conteo rápido."
    ],
    answer: 0,
    explanation: "Los JEE son instancias temporales del JNE que resuelven en primera instancia controversias, actas observadas y votos impugnados."
  },
  {
    id: 7,
    question: "¿En qué fecha se realizará la jornada electoral de las Elecciones Regionales y Municipales 2026?",
    options: [
      "El domingo 4 de octubre de 2026.",
      "El segundo domingo de abril de 2026.",
      "El último domingo de noviembre de 2026.",
      "El primer domingo de diciembre de 2026."
    ],
    answer: 0,
    explanation: "Conforme a la Ley de Elecciones Municipales y Regionales, los comicios se celebran el primer domingo de octubre (4 de octubre de 2026)."
  },
  {
    id: 8,
    question: "¿Qué ley regula el marco general de las elecciones en el Perú?",
    options: [
      "Ley Orgánica de Elecciones (Ley N° 26859).",
      "Ley General de Sociedades (Ley N° 26887).",
      "Ley del Procedimiento Administrativo General (Ley N° 27444).",
      "Código Procesal Constitucional."
    ],
    answer: 0,
    explanation: "La Ley N° 26859 es la Ley Orgánica de Elecciones que rige todo el sistema electoral nacional."
  },
  {
    id: 9,
    question: "¿Qué ley regula específicamente los comicios municipales en Lima y el Perú?",
    options: [
      "Ley de Elecciones Municipales (Ley N° 26864).",
      "Ley de Presupuesto del Sector Público.",
      "Ley Marco del Sistema Tributario Nacional.",
      "Ley Orgánica de Municipalidades únicamente."
    ],
    answer: 0,
    explanation: "La Ley N° 26864 es la norma especial aplicable a las Elecciones Municipales."
  },
  {
    id: 10,
    question: "¿Cuál es la fórmula práctica que resume la misión del personero según el manual de capacitación?",
    options: [
      "Presencia + Acta + Evidencia + Reporte inmediato = Defensa efectiva del voto.",
      "Velocidad + Conteo manual + Foto de celular = Éxito total.",
      "Asistencia pasiva + Firma de hojas + Retiro temprano = Cumplimiento.",
      "Vigilancia silenciosa + Custodia de ánforas = Victoria electoral."
    ],
    answer: 0,
    explanation: "El manual establece como regla de oro: Presencia + acta + evidencia + reporte inmediato = defensa efectiva del voto."
  },

  // ==========================================
  // MÓDULO 2: TIPOS DE PERSONEROS Y JERARQUÍA
  // ==========================================
  {
    id: 11,
    question: "¿Quién es el Personero Legal Titular de una organización política?",
    options: [
      "El representante legal facultado ante el JNE y los JEE para realizar trámites legales, inscripciones y acreditaciones.",
      "El personero que se encarga de servir el almuerzo a los miembros de mesa.",
      "El ciudadano que vota primero en la fila de la mesa.",
      "El presidente titular sorteado por la ONPE."
    ],
    answer: 0,
    explanation: "El Personero Legal representa oficialmente a la organización política ante el JNE y los Jurados Electorales Especiales."
  },
  {
    id: 12,
    question: "¿Cuál es la función del Personero Técnico?",
    options: [
      "Fiscalizar los sistemas informáticos, centros de cómputo, transmisión de datos y simulacros de la ONPE.",
      "Reparar las computadoras e impresoras de la ODPE.",
      "Contar físicamente las cédulas de todas las aulas del colegio.",
      "Trasladar los paquetes electorales en los vehículos oficiales."
    ],
    answer: 0,
    explanation: "El Personero Técnico fiscaliza el software, la digitación, el procesamiento de actas y los servidores de cómputo de la ONPE."
  },
  {
    id: 13,
    question: "¿Cuál es la responsabilidad del Personero de Centro de Votación (Coordinador de Local)?",
    options: [
      "Coordinar, ubicar, supervisar y asistir a los Personeros de Mesa en todas las aulas del local de votación asignado.",
      "Asumir la presidencia de las mesas donde falten miembros titulares.",
      "Decidir qué electores pueden ingresar al colegio y quiénes no.",
      "Transportar las actas electorales hacia la sede central de la ODPE."
    ],
    answer: 0,
    explanation: "El Coordinador de Local lidera la red de personeros de mesa, asegura la cobertura total y apoya en incidentes."
  },
  {
    id: 14,
    question: "¿Cuántos personeros de una MISMA organización política pueden estar acreditados SIMULTÁNEAMENTE en una sola mesa de sufragio?",
    options: [
      "Solo un (1) personero acreditado a la vez en la mesa de sufragio.",
      "Hasta tres (3) personeros para rotar turnos a la vez.",
      "Todos los que deseen siempre que tengan camiseta partidaria.",
      "Dos (2): un titular y un asistente con derecho a voz."
    ],
    answer: 0,
    explanation: "La ley electoral establece que solo un personero por cada partido político puede actuar simultáneamente ante la mesa de sufragio."
  },
  {
    id: 15,
    question: "¿Qué documento debe portar obligatoriamente el Personero de Mesa para identificarse y ejercer su función?",
    options: [
      "Su DNI físico vigente y la Credencial oficial emitida y firmada por la organización política.",
      "Su carnet universitario y un volante de propaganda.",
      "Una fotocopia simple de su partida de nacimiento.",
      "Su carnet de vacunación y constancia de trabajo."
    ],
    answer: 0,
    explanation: "El personero se acredita con su DNI original y su credencial oficial partidaria autorizada."
  },
  {
    id: 16,
    question: "¿Quiénes NO pueden ser personeros según la Ley Orgánica de Elecciones?",
    options: [
      "Miembros de las Fuerzas Armadas y Policía Nacional en servicio activo, jueces, fiscales y funcionarios de organismos electorales.",
      "Ciudadanos mayores de 18 años con DNI vigente.",
      "Profesionales independientes o comerciantes.",
      "Militantes o afiliados al partido político."
    ],
    answer: 0,
    explanation: "Militares, policías en activo, magistrados del PJ y MP, y personal de ONPE/JNE/Reniec están legalmente impedidos de ser personeros."
  },
  {
    id: 17,
    question: "¿Los candidatos a cargos de elección popular pueden actuar como Personeros de Mesa en el mismo proceso?",
    options: [
      "No, los candidatos no pueden ser personeros en la circunscripción donde postulan.",
      "Sí, siempre que no hablen durante el conteo.",
      "Sí, únicamente en la mesa donde les toca votar.",
      "Solo si el Coordinador de Local de la ONPE lo autoriza por escrito."
    ],
    answer: 0,
    explanation: "La normativa electoral prohíbe que candidatos actúen como personeros para evitar coacción o proselitismo en mesa."
  },
  {
    id: 18,
    question: "¿Puede un personero alternar o relevar a otro personero de su misma organización en la mesa?",
    options: [
      "Sí, previa presentación de la credencial respectiva y registro ante el presidente de mesa.",
      "No, el que empieza a las 6:00 a.m. debe quedarse obligatoriamente hasta las 12:00 a.m.",
      "Solo si el personero anterior fue detenido por la Policía.",
      "Únicamente si ambos personeros son familiares directos."
    ],
    answer: 0,
    explanation: "El relevo de personeros está permitido siempre que el nuevo personero presente su credencial y se acredite formalmente."
  },
  {
    id: 19,
    question: "¿A partir de qué edad un ciudadano puede ser acreditado como personero de mesa?",
    options: [
      "A partir de los 18 años (ciudadano en pleno ejercicio de sus derechos civiles).",
      "A partir de los 21 años cumplidos.",
      "A los 16 años con autorización notarial de sus padres.",
      "A partir de los 25 años con grado de instrucción superior."
    ],
    answer: 0,
    explanation: "Todo ciudadano mayor de 18 años en goce de sus derechos civiles y con DNI puede desempeñarse como personero."
  },
  {
    id: 20,
    question: "¿Qué nivel de jerarquía tiene el Personero de Mesa frente al Presidente de Mesa de Sufragio?",
    options: [
      "El personero es un fiscalizador externo con derecho a voz y observación; el Presidente de Mesa es la máxima autoridad de la mesa.",
      "El personero tiene rango superior y puede ordenar el cambio de miembros de mesa.",
      "Tienen exactamente el mismo poder y votan por igual en las decisiones de la mesa.",
      "El personero manda sobre los miembros de mesa cuando pertenecen a su distrito."
    ],
    answer: 0,
    explanation: "Los miembros de mesa constituyen la máxima autoridad del acto electoral; el personero fiscaliza y deja constancia de observaciones."
  },

  // ==========================================
  // MÓDULO 3: INSTALACIÓN DE LA MESA (6:00 AM)
  // ==========================================
  {
    id: 21,
    question: "¿A qué hora exacta debe presentarse el Personero de Mesa en su local de votación el día 4 de octubre?",
    options: [
      "A las 6:00 a.m. para asegurar el ingreso y presenciar la conformación e instalación de la mesa.",
      "A las 7:30 a.m. justo antes de que abran las puertas a los electores.",
      "A las 10:00 a.m. cuando baja la afluencia de votantes.",
      "A las 4:30 p.m. para el conteo de votos."
    ],
    answer: 0,
    explanation: "El personero debe estar a las 6:00 a.m. para verificar la instalación, apertura de paquetes y firma de cédulas."
  },
  {
    id: 22,
    question: "¿Cuántos miembros conforman reglamentariamente la Mesa de Sufragio?",
    options: [
      "Tres (3) miembros titulares: Presidente, Secretario y Tercer Miembro.",
      "Dos (2) miembros: Presidente y Secretario.",
      "Cinco (5) miembros: Presidente, Secretario y 3 vocales.",
      "Un Presidente de Mesa y dos personeros de partidos mayoritarios."
    ],
    answer: 0,
    explanation: "La mesa de sufragio se compone de tres miembros: Presidente, Secretario y Tercer Miembro."
  },
  {
    id: 23,
    question: "¿Qué ocurre a las 7:00 a.m. si no asisten los miembros titulares sorteados por la ONPE?",
    options: [
      "La mesa se instala con los suplentes presentes; si faltaran, el Presidente asume con electores de la fila de sufragio.",
      "La mesa se cancela y los electores son enviados a sus casas.",
      "Los personeros partidarios asumen como miembros titulares de la mesa.",
      "El efectivo de la Policía Nacional asume la presidencia de la mesa."
    ],
    answer: 0,
    explanation: "Si faltan titulares, asumen suplentes; si no hay suficientes, se designa a electores de la fila. Los personeros no pueden integrar la mesa."
  },
  {
    id: 24,
    question: "¿Puede un personero de mesa ser obligado o aceptar conformar la Mesa de Sufragio como miembro de mesa si faltan electores?",
    options: [
      "No, está expresamente prohibido por la Ley Orgánica de Elecciones que los personeros integren la mesa.",
      "Sí, si el fiscal del Ministerio Público se lo solicita.",
      "Sí, si faltan 10 minutos para el cierre.",
      "Solo si renuncia verbalmente a su partido en ese instante."
    ],
    answer: 0,
    explanation: "El artículo 57 de la LOE prohíbe taxativamente que personeros y candidatos conformen la mesa de sufragio."
  },
  {
    id: 25,
    question: "¿Qué elementos debe verificar el personero dentro del paquete electoral que entrega la ONPE durante la instalación?",
    options: [
      "Cédulas de sufragio, padrón de electores, actas electorales (5 ejemplares), ánforas, tampones, lapiceros y hologramas.",
      "Propaganda electoral de todos los partidos candidatos.",
      "El almuerzo de los electores y refrigerios de la Policía.",
      "Los talonarios de multas municipales."
    ],
    answer: 0,
    explanation: "El personero verifica que el paquete contenga cédulas íntegras, padrón oficial, útiles electorales y las 5 actas oficiales."
  },
  {
    id: 26,
    question: "¿Qué debe comprobar el personero antes de que se arme y selle el ánfora de votación?",
    options: [
      "Que el ánfora esté completamente vacía, limpia y sin ninguna cédula o papel en su interior.",
      "Que el ánfora tenga el sticker de su partido político pegado en el frente.",
      "Que el ánfora contenga 10 votos de reserva.",
      "Que el ánfora esté fabricada en madera sólida."
    ],
    answer: 0,
    explanation: "Es fundamental constatar visualmente que el ánfora esté absolutamente vacía antes de colocarle el precinto de seguridad."
  },
  {
    id: 27,
    question: "¿Tiene derecho el personero a firmar en el reverso de las cédulas de votación?",
    options: [
      "Sí, es un derecho del personero firmar en el reverso de las cédulas junto al Presidente de Mesa antes del sufragio.",
      "No, solo el personal de la ONPE puede firmar cédulas.",
      "Solo si el elector le pide permiso expreso.",
      "Únicamente si la mesa tiene más de 300 electores."
    ],
    answer: 0,
    explanation: "El personero tiene derecho a rubricar el reverso de las cédulas de sufragio para garantizar su autenticidad."
  },
  {
    id: 28,
    question: "¿Qué es el Acta de Instalación y qué datos esenciales consigna?",
    options: [
      "Documento que registra la hora de instalación, nombres y firmas de los miembros, cantidad de cédulas recibidas y estado del material.",
      "El recibo de pago que la ONPE entrega a los miembros de mesa.",
      "La lista de los electores que pagaron multa por inasistencia.",
      "El resumen de los votos contados al término del día."
    ],
    answer: 0,
    explanation: "El Acta de Instalación certifica el inicio formal de la mesa, la hora de apertura, el número de cédulas y observaciones."
  },
  {
    id: 29,
    question: "¿Qué debe hacer el personero si la mesa se instala con retraso (después de las 8:00 a.m.)?",
    options: [
      "Verificar que se registre la hora exacta y el motivo del retraso en el rubro de observaciones del Acta de Instalación.",
      "Cerrar la puerta del aula e impedir el sufragio.",
      "Romper el padrón de electores por incumplimiento.",
      "Presentar una demanda penal inmediata en la comisaría."
    ],
    answer: 0,
    explanation: "Todo retraso o incidencia debe dejarse asentado con hora exacta en las observaciones del Acta de Instalación."
  },
  {
    id: 30,
    question: "¿Hasta qué hora límite puede instalarse una mesa de sufragio si no se consiguen miembros?",
    options: [
      "Hasta el mediodía (12:00 m.); de no instalarse, la mesa se declara no instalada.",
      "Hasta las 8:30 a.m. únicamente.",
      "Hasta las 4:00 p.m. antes de la votación.",
      "Hasta las 8:00 p.m. si hay luz natural."
    ],
    answer: 0,
    explanation: "Si a las 12:00 m. la mesa no logró conformarse con electores de la fila, se levanta acta de mesa no instalada."
  },

  // ==========================================
  // MÓDULO 4: FISCALIZACIÓN DEL SUFRAGIO
  // ==========================================
  {
    id: 31,
    question: "¿En qué horario se realiza la etapa de sufragio (votación de los ciudadanos)?",
    options: [
      "De 8:00 a.m. a 5:00 p.m.",
      "De 7:00 a.m. a 4:00 p.m.",
      "De 6:00 a.m. a 6:00 p.m.",
      "De 9:00 a.m. a 7:00 p.m."
    ],
    answer: 0,
    explanation: "El horario de votación para las elecciones 2026 es de 8:00 a.m. a 5:00 p.m."
  },
  {
    id: 32,
    question: "¿Con qué documento oficial puede votar un ciudadano en su mesa de sufragio?",
    options: [
      "Únicamente con su DNI físico (azul, amarillo o electrónico), vigente o caduco según disposición del Reniec/JNE.",
      "Con fotocopia notariada del DNI a color.",
      "Con su pasaporte o licencia de conducir en cualquier caso.",
      "Con su partida de nacimiento original."
    ],
    answer: 0,
    explanation: "El DNI físico es el único documento legal para sufragar en territorio nacional."
  },
  {
    id: 33,
    question: "¿Puede votar un ciudadano que no figura en el Padrón Electoral de esa mesa?",
    options: [
      "No, nadie que no figure en la lista oficial de electores de la mesa puede votar en ella.",
      "Sí, si muestra su DNI con domicilio en el mismo distrito.",
      "Sí, si paga la multa de votación al presidente de mesa.",
      "Solo si es familiar directo del secretario de mesa."
    ],
    answer: 0,
    explanation: "El padrón electoral es inmodificable; solo sufragan quienes están inscritos en la lista de la mesa respectiva."
  },
  {
    id: 34,
    question: "¿Qué es el Voto Asistido y a quiénes aplica?",
    options: [
      "El derecho de personas con discapacidad o adultos mayores con dificultad física a ser asistidas por una persona de su absoluta confianza en la cabina.",
      "El voto guiado por el personero del partido gobernante.",
      "La ayuda obligatoria del militar de la puerta para marcar la cédula.",
      "El voto dictado por los miembros de mesa en voz alta."
    ],
    answer: 0,
    explanation: "El voto asistido permite que un ciudadano con discapacidad motriz o visual ingrese a la cabina acompañado por una persona de su confianza."
  },
  {
    id: 35,
    question: "¿Puede el personero ingresar a la cabina secreta de votación con el elector?",
    options: [
      "No, está terminantemente prohibido violar el secreto del voto de los electores.",
      "Sí, siempre que el elector sea del partido Somos Perú.",
      "Sí, para asegurarse de que marque el corazón de Somos Perú.",
      "Solo si el elector le pide una recomendación de voto."
    ],
    answer: 0,
    explanation: "El voto es secreto y personal; ningún personero ni autoridad puede ingresar a la cabina secreta con un elector."
  },
  {
    id: 36,
    question: "¿Qué debe hacer el personero si encuentra cédulas marcadas o cédulas faltantes en la cabina de votación?",
    options: [
      "Alertar inmediatamente al Presidente de Mesa para que revise la cabina y retire cualquier material indebido.",
      "Guardar las cédulas en su bolsillo y llevárselas a su casa.",
      "Marcar las cédulas en blanco a favor de su candidato.",
      "Gritar y suspender la votación en todo el colegio."
    ],
    answer: 0,
    explanation: "El personero debe exigir la revisión periódica de la cabina por parte del presidente para evitar propaganda o cédulas adulteradas."
  },
  {
    id: 37,
    question: "¿Qué es la impugnación de la identidad de un elector?",
    options: [
      "Cuestionar fundadamente que el portador del DNI no es la persona que dice ser o que el DNI es falsificado.",
      "Reclamar porque el elector viste de color rojo.",
      "Impedir que un elector vote por no ser vecino antiguo del distrito.",
      "Reclamar porque el elector tardó más de 2 minutos en votar."
    ],
    answer: 0,
    explanation: "La impugnación de identidad procede cuando se presume suplantación de identidad del titular del DNI."
  },
  {
    id: 38,
    question: "¿Qué procedimiento se sigue ante la impugnación de identidad de un elector?",
    options: [
      "La mesa coteja la huella y firma con el padrón; si persisten dudas, el voto ingresa a un sobre especial impugnado para el JEE.",
      "El elector es detenido inmediatamente sin permitirle votar.",
      "Se le anula el DNI y se le rompe el documento en mesa.",
      "Se le obliga a votar en voz alta."
    ],
    answer: 0,
    explanation: "La mesa verifica huellas y firma; si se mantiene la duda fundada, el voto se recibe en sobre lacrado de voto impugnado."
  },
  {
    id: 39,
    question: "¿A qué hora se cierran las puertas del local de votación para el ingreso de ciudadanos?",
    options: [
      "A las 5:00 p.m. exactamente.",
      "A las 4:00 p.m.",
      "A las 6:00 p.m. si hay luz solar.",
      "A las 7:00 p.m. por ser Elecciones Regionales."
    ],
    answer: 0,
    explanation: "A las 5:00 p.m. se cierran los accesos del local de sufragio en todo el país."
  },
  {
    id: 40,
    question: "Si a las 5:00 p.m. aún hay electores en la cola dentro del local de votación, ¿pueden votar?",
    options: [
      "Sí, todos los electores que se encuentren dentro del local de votación a las 5:00 p.m. tienen derecho a votar.",
      "No, a las 5:00 p.m. se retira la cola y se botan las cédulas.",
      "Solo los 5 primeros ciudadanos de la fila.",
      "Únicamente los adultos mayores y mujeres embarazadas."
    ],
    answer: 0,
    explanation: "La ley ampara el derecho a votar de todos los ciudadanos que ingresaron al recinto electoral antes de las 5:00 p.m."
  },

  // ==========================================
  // MÓDULO 5: ESCRUTINIO Y CONTEO DE VOTOS
  // ==========================================
  {
    id: 41,
    question: "¿Cuál es el primer paso obligatorio que debe realizar la mesa antes de abrir el ánfora de sufragio?",
    options: [
      "Contar el total de ciudadanos que firmaron y colocaron su huella en el Padrón de Electores y anotar la cifra en el Acta de Sufragio.",
      "Vaciar todas las cédulas sobre la mesa y mezclarlas.",
      "Contar los votos de Somos Perú en voz alta.",
      "Pedir la comida y cenar antes de contar."
    ],
    answer: 0,
    explanation: "Primero se cuenta el total de votantes efectivos en el padrón electoral y se inutilizan las cédulas sobrantes."
  },
  {
    id: 42,
    question: "¿Qué se debe hacer con las cédulas de votación sobrantes (no utilizadas)?",
    options: [
      "Inutilizarlas cortando la esquina superior y anotando la cantidad en el Acta de Sufragio.",
      "Guardarlas en la mochila de los personeros como recuerdo.",
      "Votarlas en el tacho de basura sin contarlas.",
      "Repartirlas a los miembros de mesa como borrador."
    ],
    answer: 0,
    explanation: "Las cédulas sobrantes se cuentan, se inutilizan cortándoles una esquina y se registran en el Acta de Sufragio."
  },
  {
    id: 43,
    question: "Si al abrir el ánfora hay MÁS cédulas que ciudadanos que votaron según el padrón, ¿cuál es el protocolo?",
    options: [
      "El Presidente extrae al azar y sin desdoblar tantas cédulas como sobrantes haya y las destruye e inutiliza.",
      "Se anula toda la mesa de votación inmediatamente.",
      "Se buscan 10 personas de la calle para que firmen el padrón.",
      "Se le adjudican los votos sobrantes al partido con mayor votación."
    ],
    answer: 0,
    explanation: "El artículo 276 de la LOE manda extraer al azar las cédulas sobrantes sin abrirlas e inutilizarlas de inmediato."
  },
  {
    id: 44,
    question: "¿Qué se considera VOTO VÁLIDO según la normativa electoral?",
    options: [
      "Aquel que contiene una marca en cruz (+) o aspa (X) cuya intersección de líneas se ubique dentro del recuadro o símbolo del partido.",
      "Cualquier trazo sin importar dónde caiga la intersección.",
      "Una firma personal con nombre completo sobre la foto del candidato.",
      "Un check (✔) grande que ocupe toda la cédula de votación."
    ],
    answer: 0,
    explanation: "El criterio del JNE define el voto válido por la marca en cruz (+) o aspa (X) con intersección dentro de la casilla o símbolo."
  },
  {
    id: 45,
    question: "Si los trazos de la cruz (+) sobrepasan el recuadro del símbolo de Somos Perú pero su punto de intersección está DENTRO, ¿es válido?",
    options: [
      "Sí, es VOTO VÁLIDO porque la intersección de las líneas se encuentra dentro de la casilla o símbolo.",
      "No, es voto nulo porque las puntas salieron del recuadro.",
      "Es voto en blanco.",
      "Se debe consultar a la policía del colegio."
    ],
    answer: 0,
    explanation: "Si la intersección de las líneas está dentro del recuadro, el voto es 100% válido, aunque los brazos del trazo excedan los límites."
  },
  {
    id: 46,
    question: "¿Qué es un VOTO NULO?",
    options: [
      "Cédula con marcas extrañas, palabras ofensivas, signos distintos a cruz/aspa, marcas en dos partidos distintos o roturas.",
      "Cédula sin ninguna marca en ningún casillero.",
      "Cédula doblada en cuatro partes.",
      "Cédula firmada por el Presidente de Mesa en el reverso."
    ],
    answer: 0,
    explanation: "Marcas dobles, insultos, dibujos, letras o roturas anulan la validez del voto."
  },
  {
    id: 47,
    question: "¿Qué es un VOTO EN BLANCO?",
    options: [
      "Cédula que no contiene ninguna marca o trazo en ninguna de las opciones electorales.",
      "Cédula con una línea suave borrada con borrador.",
      "Cédula marcada con lapicero de tinta roja.",
      "Cédula doblada al revés."
    ],
    answer: 0,
    explanation: "Voto en blanco es aquel donde el elector no expresó ninguna preferencia y dejó los recuadros sin marcar."
  },
  {
    id: 48,
    question: "¿Qué debe hacer el personero si un miembro de mesa pretende declarar NULO un voto válido de Somos Perú?",
    options: [
      "Defender enérgicamente el voto citando las normas de la cartilla ONPE/JNE; si insisten, IMPUGNAR la cédula para que decida el JEE.",
      "Aceptar en silencio para no generar discusiones.",
      "Romper el acta de escrutinio para que no se cuente.",
      "Retirarse del aula sin firmar el acta."
    ],
    answer: 0,
    explanation: "El personero debe defender el voto fundamentando la intersección del trazo y, si la mesa discrepa, solicitar la impugnación formal."
  },
  {
    id: 49,
    question: "¿Quién resuelve en la mesa la impugnación de un voto durante el escrutinio?",
    options: [
      "Los tres miembros de mesa por mayoría de votos; si el personero apela la decisión, el voto va al sobre lacrado para el JEE.",
      "El personero con mayor cantidad de votos en el aula.",
      "El coordinador de la ONPE de manera inapelable.",
      "El efectivo del Ejército peruano en la puerta."
    ],
    answer: 0,
    explanation: "La mesa vota; si el personero mantiene su impugnación, la cédula se lacra en el sobre de votos impugnados para fallo del JEE."
  },
  {
    id: 50,
    question: "¿Puede el Personero de Mesa manipular o desdoblar las cédulas de sufragio con sus propias manos durante el escrutinio?",
    options: [
      "No, solo los miembros de mesa pueden tocar y desdoblar las cédulas de votación.",
      "Sí, para ayudar a que el conteo sea más rápido.",
      "Sí, si los miembros de mesa están cansados.",
      "Solo si usa guantes quirúrgicos."
    ],
    answer: 0,
    explanation: "Los personeros observan y fiscalizan a la vista de las cédulas, pero la manipulación física corresponde exclusivamente a los miembros de mesa."
  },

  // ==========================================
  // MÓDULO 6: LLENADO DEL ACTA Y EJEMPLARES
  // ==========================================
  {
    id: 51,
    question: "¿De cuántas secciones se compone el Acta Electoral completa?",
    options: [
      "Tres (3) secciones: Acta de Instalación, Acta de Sufragio y Acta de Escrutinio.",
      "Una sola hoja con los resultados finales.",
      "Dos (2) secciones: Acta de Inicio y Acta de Cierre.",
      "Cuatro (4) secciones: Padrón, Votación, Cómputo y Proclamación."
    ],
    answer: 0,
    explanation: "El Acta Electoral indivisible consta de: 1. Acta de Instalación, 2. Acta de Sufragio y 3. Acta de Escrutinio."
  },
  {
    id: 52,
    question: "¿Cuántos ejemplares oficiales del Acta Electoral se llenan y firman en cada mesa de sufragio?",
    options: [
      "Cinco (5) ejemplares oficiales de color diferenciado.",
      "Únicamente dos (2) ejemplares.",
      "Tres (3) ejemplares simples.",
      "Diez (10) ejemplares impresos en papel bond."
    ],
    answer: 0,
    explanation: "Se redactan 5 ejemplares oficiales destinados a la ODPE, JEE, ONPE, JNE y archivo de personeros."
  },
  {
    id: 53,
    question: "¿A quiénes corresponden los 5 ejemplares oficiales del Acta Electoral?",
    options: [
      "1. ODPE (sobre plomo), 2. JEE (sobre celeste), 3. ONPE (sobre verde), 4. JNE (sobre rojo) y 5. Personeros (sobre morado).",
      "Todos los 5 ejemplares se quedan en el colegio de votación.",
      "Tres para la Policía y dos para los miembros de mesa.",
      "Uno para cada uno de los 5 primeros votantes."
    ],
    answer: 0,
    explanation: "Los 5 ejemplares tienen sobres de seguridad de colores reglamentarios asignados a cada entidad y personeros."
  },
  {
    id: 54,
    question: "¿Qué debe verificar el personero al llenarse el Acta de Escrutinio en letras y números?",
    options: [
      "Que los votos de Somos Perú coincidan exactamente en números y letras, sin borrones ni tachaduras.",
      "Que no figure ningún voto para los partidos rivales.",
      "Que el acta esté firmada solo por el presidente de mesa.",
      "Que se use lápiz para poder corregir errores después."
    ],
    answer: 0,
    explanation: "Debe verificarse la perfecta coincidencia entre cifras y letras para evitar que el acta sea clasificada como 'Observada'."
  },
  {
    id: 55,
    question: "¿Qué significa que un Acta Electoral sea declarada 'Observada por Error Material'?",
    options: [
      "Que la suma de votos no coincide con el total de votantes, o hay ilegibilidad o inconsistencia numérica.",
      "Que fue quemada o robada por delincuentes.",
      "Que ganó una organización no inscrita.",
      "Que el aula de votación no tenía ventanas."
    ],
    answer: 0,
    explanation: "El error material surge por sumas incongruentes, datos ilegibles o discordancia entre votos y firmas en el padrón."
  },
  {
    id: 56,
    question: "¿Qué es el 'Cartel de Resultados' de la mesa de sufragio?",
    options: [
      "El cartel oficial impreso con el resumen de votos que se pega en la puerta del aula de votación al finalizar el escrutinio.",
      "El afiche publicitario con la foto del candidato a la alcaldía.",
      "El letrero que indica el número de aula y mesa.",
      "La lista de electores pegada en el patio del colegio."
    ],
    answer: 0,
    explanation: "El Cartel de Resultados publica los resultados del conteo en la puerta del aula para conocimiento público."
  },
  {
    id: 57,
    question: "¿Tiene derecho el personero a recibir una copia física firmada del Acta de Escrutinio?",
    options: [
      "Sí, es un derecho legal inalienable de los personeros acreditados recibir su copia oficial firmada.",
      "No, las actas son secretos de estado de la ONPE.",
      "Solo si paga el costo de la fotocopia al presidente de mesa.",
      "Únicamente si su candidato quedó en primer lugar en esa mesa."
    ],
    answer: 0,
    explanation: "El artículo 291 de la LOE garantiza que los personeros reciban una copia auténtica firmada del acta de escrutinio."
  },
  {
    id: 58,
    question: "¿Qué debe hacer el personero inmediatamente después de obtener su copia del Acta de Escrutinio?",
    options: [
      "Tomar una fotografía nítida del Acta y del Cartel de Resultados y transmitirla de inmediato al sistema ConteoLima / Somos Perú.",
      "Guardarla en su casa y llevarla al partido a la semana siguiente.",
      "Publicarla en su estado de WhatsApp sin revisar los números.",
      "Romperla para que nadie vea los resultados."
    ],
    answer: 0,
    explanation: "La fotografía nítida y transmisión inmediata al sistema del partido permite consolidar el conteo rápido de Somos Perú."
  },
  {
    id: 59,
    question: "¿Cómo debe tomarse la fotografía del Acta de Escrutinio para el reporte digital?",
    options: [
      "De forma vertical, con buena iluminación, encuadre completo de los 4 bordes, sin sombras y con letras y números totalmente legibles.",
      "Con flash de noche a 3 metros de distancia.",
      "Tomando solo la foto del número de Somos Perú sin las firmas.",
      "En movimiento mientras camina por el pasillo."
    ],
    answer: 0,
    explanation: "Una foto nítida, completa, sin sombras y con firmas visibles es vital para la validación del centro de cómputo partidario."
  },
  {
    id: 60,
    question: "¿Qué debe hacer el personero si el Presidente de Mesa se niega a firmar o entregarle la copia del acta?",
    options: [
      "Exigir la presencia inmediata del Coordinador de Local de la ONPE y de su Coordinador de Somos Perú para levantar la incidencia legal.",
      "Aceptar la negativa e irse a su domicilio.",
      "Quitarle el ánfora por la fuerza.",
      "Firmar él mismo en lugar del presidente de mesa."
    ],
    answer: 0,
    explanation: "La negativa a entregar copia del acta es una infracción legal grave; se debe convocar de inmediato a los coordinadores y fiscalizadores."
  },

  // ==========================================
  // MÓDULO 7: PROHIBICIONES Y CONDUCTA DEL PERSONERO
  // ==========================================
  {
    id: 61,
    question: "¿Qué distintivo o prenda tiene permitido llevar el Personero de Mesa dentro del local de votación?",
    options: [
      "Únicamente su Credencial Oficial reglamentaria (tamaño fotocheck de hasta 10 x 7 cm aprox.).",
      "Camisetas, gorros y casacas con propaganda y colores del candidato.",
      "Banderas gigantes de Somos Perú colgadas al hombro.",
      "Megáfonos y volantes de campaña para repartir a los electores."
    ],
    answer: 0,
    explanation: "La ley prohíbe todo tipo de vestimenta o distintivo proselitista dentro de locales de sufragio; solo se porta la credencial reglamentaria."
  },
  {
    id: 62,
    question: "¿Qué sanción puede recibir un personero que realiza proselitismo político dentro del local de votación?",
    options: [
      "Expulsión inmediata del local de votación por las Fuerzas Armadas/Policía y denuncia penal por delito electoral.",
      "Una amonestación verbal sin consecuencias.",
      "Un descuento de votos a su partido al final del conteo.",
      "Tener que limpiar el aula de votación."
    ],
    answer: 0,
    explanation: "Hacer propaganda en locales de sufragio es delito electoral y causa de expulsión inmediata y proceso penal."
  },
  {
    id: 63,
    question: "¿Puede el personero conversar, orientar o indicar por quién votar a los electores en la fila?",
    options: [
      "No, está estrictamente prohibido intentar influir, coaccionar o sugerir el voto de los electores.",
      "Sí, si el elector le pregunta discretamente en el pasillo.",
      "Solo a los electores jóvenes indecisos.",
      "Está permitido si se hace sin que escuche el policía."
    ],
    answer: 0,
    explanation: "El personero no puede interferir con los electores ni realizar actos de inducción al voto bajo ninguna circunstancia."
  },
  {
    id: 64,
    question: "¿Qué debe hacer un personero si detecta propaganda electoral (volantes, afiches o pintas) dentro del aula o cabina de votación?",
    options: [
      "Solicitar al Presidente de Mesa y al personal de la ONPE su retiro inmediato.",
      "Colocar propaganda de Somos Perú al lado para equilibrar.",
      "Tomarle fotos y no avisar a nadie.",
      "Destruir la cabina de votación."
    ],
    answer: 0,
    explanation: "Cualquier propaganda dentro del aula o cabina debe ser retirada de inmediato por los miembros de mesa o la ONPE."
  },
  {
    id: 65,
    question: "¿Puede un personero abandonar su mesa de sufragio antes de que concluya el llenado y firma de las actas?",
    options: [
      "No, el personero debe permanecer vigilante hasta que las actas estén 100% firmadas, lacradas y tenga su copia en mano.",
      "Sí, puede retirarse a las 5:00 p.m. apenas cierren las puertas del colegio.",
      "Sí, una vez que vea que su candidato ganó en esa mesa.",
      "Puede irse cuando llegue la hora de cenar."
    ],
    answer: 0,
    explanation: "El trabajo del personero culmina solo cuando tiene en mano la copia oficial del acta de escrutinio firmada y la transmite."
  },
  {
    id: 66,
    question: "¿Qué actitud debe mantener el personero ante discusiones o provocaciones de personeros rivales?",
    options: [
      "Mantener la calma, actuar con firmeza y educación, basarse en el manual y solicitar la intervención del Presidente de Mesa.",
      "Responder con insultos y agresión física para imponer respeto.",
      "Retirarse de la mesa y regalar los votos del partido.",
      "Desconectar las luces del aula para suspender el conteo."
    ],
    answer: 0,
    explanation: "La serenidad, el conocimiento normativo y el profesionalismo son las mejores herramientas de defensa del voto."
  },
  {
    id: 67,
    question: "¿Puede un personero tocar o trasladar las ánforas de votación durante la jornada?",
    options: [
      "No, el traslado y custodia física corresponde a los miembros de mesa, personal de ONPE y resguardo militar/policial.",
      "Sí, el personero debe cargar el ánfora en sus brazos todo el día.",
      "Sí, cuando se traslade al baño.",
      "Solo si el presidente de mesa no tiene fuerza para levantarla."
    ],
    answer: 0,
    explanation: "El personero custodia visualmente el traslado de las ánforas y sobres, pero no las manipula físicamente."
  },
  {
    id: 68,
    question: "¿Qué debe hacer el personero si un miembro de mesa comete un error al llenar una casilla del acta con lapicero?",
    options: [
      "Exigir que se anote la corrección formal en el rubro de observaciones del acta, sin realizar borrones o tachaduras ilegibles.",
      "Usar corrector líquido blanco sobre todo el casillero.",
      "Romper la hoja del acta y pedir otra a la ONPE.",
      "Dejarlo así para que el JEE adivine el número."
    ],
    answer: 0,
    explanation: "Nunca debe usarse corrector ni tachaduras informales; toda salvedad se consigna en el rubro de observaciones del acta."
  },
  {
    id: 69,
    question: "¿Qué documento recibe el personero de mesa como constancia de su asistencia y labor por parte de la ONPE?",
    options: [
      "La constancia o certificado oficial de asistencia del personero emitida por la ONPE.",
      "Un cheque bancario en efectivo.",
      "Un diploma de honor del Congreso de la República.",
      "Un carnet de exoneración de impuestos municipales."
    ],
    answer: 0,
    explanation: "La ONPE entrega constancias oficiales de participación a los personeros acreditados en mesa."
  },
  {
    id: 70,
    question: "¿Por qué es crucial la presencia de personeros en el 100% de mesas de Lima Metropolitana?",
    options: [
      "Porque una mesa sin personero queda vulnerable a la anulación indebida de votos o asignación errónea de actas.",
      "Porque si no hay personero, la mesa no puede instalarse.",
      "Para que el local de votación se vea más lleno de gente.",
      "Para ganar el premio al partido con más asistentes."
    ],
    answer: 0,
    explanation: "La cobertura total de mesas asegura que ningún voto de Somos Perú sea vulnerado ni anulado injustamente."
  },

  // ==========================================
  // MÓDULO 8: CASOS PRÁCTICOS DE CALIFICACIÓN DE VOTOS
  // ==========================================
  {
    id: 71,
    question: "CASO 1: Un elector marca una cruz (+) sobre el corazón de Somos Perú. Una línea de la cruz es corta y la otra larga, pero se cruzan DENTRO del recuadro. ¿Cómo se califica el voto?",
    options: [
      "VOTO VÁLIDO a favor de Somos Perú.",
      "VOTO NULO por no ser una cruz simétrica perfecta.",
      "VOTO EN BLANCO.",
      "Voto impugnado obligatorio."
    ],
    answer: 0,
    explanation: "No se exige perfección geométrica; si el trazo es una cruz o aspa y la intersección está dentro del recuadro, el voto es VÁLIDO."
  },
  {
    id: 72,
    question: "CASO 2: En la cédula provincial, el elector marca el aspa (X) sobre Somos Perú, pero en la cédula distrital marca otro partido. ¿Se anulan ambas opciones?",
    options: [
      "No, las elecciones Provincial y Distrital son independientes; el voto provincial es VÁLIDO para Somos Perú y el distrital para el otro partido.",
      "Sí, se anula toda la cédula completa por votar cruzado.",
      "Solo vale el voto distrital y se anula el provincial.",
      "El presidente de mesa decide cuál de los dos votos anula."
    ],
    answer: 0,
    explanation: "El voto cruzado es perfectamente legal; la calificación de cada columna (Provincial / Distrital) es independiente."
  },
  {
    id: 73,
    question: "CASO 3: Un elector marca una cruz (+) en Somos Perú y escribe la palabra 'SI' al lado sin tapar el recuadro ni insultar. ¿Cómo se califica?",
    options: [
      "VOTO NULO porque contiene signos o palabras ajenas al trazo reglamentario.",
      "Voto Válido porque 'SI' confirma la intención de voto.",
      "Voto en blanco.",
      "Voto de reserva para segunda vuelta."
    ],
    answer: 0,
    explanation: "Cualquier palabra, signo, letra o anotación adicional en la cédula causa la nulidad del voto según el reglamento del JNE."
  },
  {
    id: 74,
    question: "CASO 4: Un elector marca un aspa (X) clara sobre Somos Perú, pero la tinta del lapicero manchó levemente el reverso de la cédula al doblarla. ¿Es válido?",
    options: [
      "Sí, es VOTO VÁLIDO; el manchón involuntario de tinta no invalida la clara voluntad del elector.",
      "No, es voto nulo automático por estar manchada.",
      "Es voto impugnado.",
      "Se debe cambiar la cédula por una nueva."
    ],
    answer: 0,
    explanation: "Las manchas involuntarias por exceso de tinta que no constituyan marcas deliberadas no anulan el voto."
  },
  {
    id: 75,
    question: "CASO 5: La marca en la cédula es un círculo (O) que encierra el corazón de Somos Perú sin cruzarse. ¿Cómo se califica?",
    options: [
      "VOTO NULO porque la norma exige expresamente trazo en cruz (+) o aspa (X).",
      "Voto Válido porque encierra el símbolo.",
      "Voto en blanco.",
      "Voto preferencial."
    ],
    answer: 0,
    explanation: "La ley solo reconoce como válidos los trazos en cruz (+) o aspa (X). Círculos, rayas o checks son nulos."
  },
  {
    id: 76,
    question: "CASO 6: El elector marcó un aspa (X) sobre Somos Perú, pero con un trazo muy tenue o suave que apenas se distingue. ¿Es válido?",
    options: [
      "Sí, es VOTO VÁLIDO si se distingue claramente la intersección del trazo dentro del recuadro.",
      "No, la ley exige que el trazo sea grueso y oscuro.",
      "Es voto en blanco porque la máquina no lo leería.",
      "Se anula por falta de presión del lapicero."
    ],
    answer: 0,
    explanation: "La intensidad del trazo no determina la validez; si se aprecia el aspa o cruz dentro de la casilla, el voto es válido."
  },
  {
    id: 77,
    question: "CASO 7: Un elector marca con cruz (+) dos partidos diferentes en la misma columna de votación. ¿Cómo se califica?",
    options: [
      "VOTO NULO por registrar preferencia múltiple en una misma elección.",
      "Se le asigna medio punto a cada partido.",
      "Se le asigna el voto al partido que marcó primero.",
      "El presidente de mesa elige el partido ganador."
    ],
    answer: 0,
    explanation: "Marcar dos o más opciones en la misma columna electoral genera la nulidad absoluta de ese voto."
  },
  {
    id: 78,
    question: "CASO 8: El elector hizo una cruz (+) sobre el símbolo y además remarcó varias veces las líneas de la cruz. ¿Es válido?",
    options: [
      "Sí, es VOTO VÁLIDO; el retintado o remarcado de la cruz o aspa no anula el voto.",
      "No, se considera doble marca y se anula.",
      "Es voto viciado.",
      "Se le pide al elector que regrese a explicar su voto."
    ],
    answer: 0,
    explanation: "El remarcado de las líneas de la cruz o aspa es válido siempre que mantenga la forma y la intersección dentro de la casilla."
  },
  {
    id: 79,
    question: "CASO 9: El elector dobló la cédula y la rasgó accidentalmente en el borde sin tocar el área de votación ni el símbolo de Somos Perú. ¿Es válido?",
    options: [
      "Sí, es VOTO VÁLIDO si el corte accidental en el borde no afecta la identificación de la cédula ni la casilla marcada.",
      "No, cualquier rotura en el papel anula automáticamente la cédula.",
      "Es voto en blanco.",
      "Se suspende la mesa de sufragio."
    ],
    answer: 0,
    explanation: "Rasgaduras menores en los bordes que no mutilen datos esenciales de la cédula no invalidan la voluntad del elector."
  },
  {
    id: 80,
    question: "CASO 10: La intersección del aspa (X) cae exactamente sobre la línea divisoria del recuadro de Somos Perú. ¿Qué criterio aplica la jurisprudencia del JNE?",
    options: [
      "Se favorece la validez del voto a favor del partido si el centro del aspa se encuentra dentro del área de la casilla.",
      "Se anula por estar tocando la línea límite.",
      "Se declara en blanco.",
      "Se sortea con una moneda al aire."
    ],
    answer: 0,
    explanation: "El principio 'favor voti' del JNE establece que ante duda razonable con intersección en el límite se privilegia la validez del voto."
  },

  // ==========================================
  // MÓDULO 9: TRANSMISIÓN DIGITAL Y CONTEO RÁPIDO
  // ==========================================
  {
    id: 81,
    question: "¿Cuál es el objetivo principal del sistema digital ConteoLima en las Elecciones 2026?",
    options: [
      "Consolidar en tiempo real los resultados de todas las actas de Lima Metropolitana para el control del partido.",
      "Reemplazar el sistema oficial de la ONPE.",
      "Pagar bonificaciones a los votantes del distrito.",
      "Transmitir videos en vivo a redes sociales."
    ],
    answer: 0,
    explanation: "ConteoLima procesa las actas digitalizadas para obtener el conteo rápido y la fiscalización integral de resultados."
  },
  {
    id: 82,
    question: "¿Qué datos del acta se digitan en el aplicativo ConteoLima durante el reporte?",
    options: [
      "Número de mesa, votos válidos de cada lista, votos nulos, votos en blanco y total de votantes.",
      "Los nombres y teléfonos de todos los electores del padrón.",
      "La placa del auto del presidente de mesa.",
      "La dirección particular de los miembros de mesa."
    ],
    answer: 0,
    explanation: "Se digitan los totales numéricos de la mesa para alimentar la base de datos de escrutinio del partido."
  },
  {
    id: 83,
    question: "¿Qué debe hacer el personero si en su local de votación NO hay señal de internet o datos móviles?",
    options: [
      "Guardar las fotos en el celular, salir a un punto con señal o acudir con su Coordinador de Local para transmitir inmediatamente.",
      "Borrar las fotos y olvidarse del reporte.",
      "Dejar el acta pegada en el colegio y retirarse.",
      "Esperar al lunes para enviar las fotos."
    ],
    answer: 0,
    explanation: "Si no hay señal, las fotos se guardan en el dispositivo y se transmiten apenas se ubique zona de cobertura o al coordinador."
  },
  {
    id: 84,
    question: "¿Por qué no se debe doblar ni arrugar la copia del Acta de Escrutinio que recibe el personero?",
    options: [
      "Para garantizar que los números y firmas se mantengan legibles ante cualquier cotejo legal o impugnación en el JEE.",
      "Para que entre en el bolsillo de la camisa.",
      "Porque la ONPE cobra multa si el papel está arrugado.",
      "Para que no pese más en la mochila."
    ],
    answer: 0,
    explanation: "El acta es la prueba documental física clave ante el Jurado Electoral Especial en caso de controversia o recálculo."
  },
  {
    id: 85,
    question: "¿Qué hace el Centro de Cómputo del Partido si detecta una inconsistencia en la foto del acta transmitida?",
    options: [
      "Contacta de inmediato al personero o coordinador de local para verificar la copia física del acta original.",
      "Inventa los números que faltan para cuadrar la suma.",
      "Elimina la mesa del sistema y no la cuenta.",
      "Envía a la policía a la casa del personero."
    ],
    answer: 0,
    explanation: "El equipo técnico de validación coteja con el personero y el coordinador la copia original para corregir cualquier discrepancia."
  },

  // ==========================================
  // MÓDULO 10: LOGÍSTICA, EMERGENCIAS Y RESOLUCIÓN DE CONFLICTOS
  // ==========================================
  {
    id: 86,
    question: "¿Qué debe llevar el personero en su mochila el día de la jornada electoral?",
    options: [
      "DNI físico, credencial oficial, lapicero azul, cargador/batería portátil, manual de personero y libreta de apuntes.",
      "Banderas partidarias, megáfono y spray de pintura.",
      "Bebidas alcohólicas y parlantes de música.",
      "Copia de las llaves del local de votación."
    ],
    answer: 0,
    explanation: "Los implementos indispensables son: DNI, credencial, lapiceros, celular cargado, batería externa y manual de consulta."
  },
  {
    id: 87,
    question: "¿Qué debe hacer el personero si llega a su mesa y los miembros ya comenzaron a contar cédulas antes de las 5:00 p.m.?",
    options: [
      "Exigir la paralización inmediata del conteo y denunciar la irregularidad ante el Coordinador de ONPE y Fiscalizador del JNE.",
      "Ayudarlos a contar más rápido para terminar temprano.",
      "Aceptar el conteo y firmar el acta en blanco.",
      "Quedarse callado para no hacer problemas."
    ],
    answer: 0,
    explanation: "El escrutinio antes de las 5:00 p.m. es ilegal; se debe detener de inmediato con presencia de ONPE y fiscalizadores del JNE."
  },
  {
    id: 88,
    question: "¿Puede una mesa de sufragio funcionar en un ambiente oscuro o sin iluminación adecuada durante el escrutinio nocturno?",
    options: [
      "No, el personero debe exigir a la ONPE el suministro de lámparas o traslado a un aula iluminada para garantizar la transparencia.",
      "Sí, los miembros pueden contar al tacto en la oscuridad.",
      "Sí, con la luz de una vela pequeña sobre las cédulas.",
      "Se debe suspender el conteo y votar de nuevo al día siguiente."
    ],
    answer: 0,
    explanation: "La adecuada iluminación es requisito indispensable para la correcta visualización de las marcas y llenado de actas."
  },
  {
    id: 89,
    question: "¿Qué ocurre si una persona con DNI de otro distrito intenta votar en la mesa?",
    options: [
      "No se le permite votar; solo sufragan los ciudadanos que figuren en la lista de electores de esa mesa específica.",
      "Se le cobra 20 soles y se le permite votar.",
      "Se le entrega una cédula y se guarda su voto aparte.",
      "El presidente de mesa decide por votación familiar."
    ],
    answer: 0,
    explanation: "Nadie puede votar fuera de su mesa y padrón electoral asignado."
  },
  {
    id: 90,
    question: "¿Quiénes tienen preferencia de atención para votar en la fila durante el sufragio?",
    options: [
      "Adultos mayores, mujeres embarazadas, personas con discapacidad y personas con niños en brazos.",
      "Los amigos y conocidos de los miembros de mesa.",
      "Los personeros de los partidos con más candidatos.",
      "Las personas que llegaron en automóvil propio."
    ],
    answer: 0,
    explanation: "La Ley N° 27408 establece la atención preferencial obligatoria para personas con discapacidad, gestantes y adultos mayores."
  },
  {
    id: 91,
    question: "¿Qué debe hacer el personero si observa que el Presidente de Mesa no revisa el DNI de los electores antes de darles la cédula?",
    options: [
      "Reclamar con respeto exigiendo la verificación obligatoria del DNI físico contra el padrón electoral.",
      "No decir nada y que pase cualquier persona.",
      "Quitarle el padrón electoral de las manos al secretario.",
      "Pedirle dinero a los electores para dejarlos pasar."
    ],
    answer: 0,
    explanation: "La verificación de identidad con el DNI físico es el control básico para evitar suplantaciones de electores."
  },
  {
    id: 92,
    question: "¿Puede un elector tomarse una selfie o fotografía dentro de la cabina de votación mostrando su voto marcado?",
    options: [
      "No, la ley prohíbe fotografiar o divulgar el voto en la cabina; es una infracción pasible de intervención policial.",
      "Sí, tiene derecho a publicarlo en TikTok en ese momento.",
      "Sí, siempre que etiquete al candidato de Somos Perú.",
      "Solo si el presidente de mesa sale en la foto."
    ],
    answer: 0,
    explanation: "Fotografiar la cédula marcada vulnera el principio de voto secreto y está expresamente sancionado."
  },
  {
    id: 93,
    question: "¿Qué sucede si a las 5:00 p.m. votaron todos los ciudadanos que estaban en la fila dentro del colegio?",
    options: [
      "Se cierra formalmente la etapa de sufragio y se da inicio inmediato al escrutinio.",
      "Se espera hasta las 8:00 p.m. por si alguien más llega.",
      "Se abre la puerta de la calle para que entren nuevos vecinos.",
      "Los miembros de mesa se van a su casa a descansar."
    ],
    answer: 0,
    explanation: "Al votar el último ciudadano presente a las 5:00 p.m., se clausura el sufragio e inicia el escrutinio."
  },
  {
    id: 94,
    question: "¿Qué debe hacer el personero si al finalizar el conteo se detecta un error de suma en el borrador de escrutinio antes de pasarlo al acta oficial?",
    options: [
      "Corregir inmediatamente la suma en el borrador antes de transcribir los datos a las 5 actas definitivas con lapicero.",
      "Copiar el error a las 5 actas oficiales para que la ODPE lo arregle.",
      "Anular todas las cédulas contadas de la mesa.",
      "Pelear con los miembros de mesa."
    ],
    answer: 0,
    explanation: "El borrador de escrutinio sirve precisamente para cuadrar cifras antes de rellenar las 5 actas oficiales definitivas."
  },
  {
    id: 95,
    question: "¿Qué personas tienen autorización para ingresar al aula de votación durante el conteo de votos?",
    options: [
      "Miembros de mesa, personeros acreditados, personal de ONPE, fiscalizadores del JNE y observadores acreditados.",
      "Cualquier vecino o curioso que desee mirar el conteo.",
      "Vendedores ambulantes del exterior del colegio.",
      "Familiares de los electores de la cola."
    ],
    answer: 0,
    explanation: "El escrutinio es un acto formal presenciado por miembros, personeros acreditados y autoridades electorales autorizadas."
  },
  {
    id: 96,
    question: "¿Qué función cumple el Coordinador de Local de Somos Perú una vez terminado el escrutinio en todas sus mesas?",
    options: [
      "Verificar que el 100% de personeros tenga su acta, asegurar la transmisión digital completa y consolidar el resultado del colegio.",
      "Cobrar el dinero de las multas del colegio.",
      "Guardar las ánforas plásticas en su automóvil.",
      "Despedir al director de la institución educativa."
    ],
    answer: 0,
    explanation: "El Coordinador de Local consolida el reporte total de las mesas de su centro de votación y apoya a los personeros."
  },
  {
    id: 97,
    question: "¿Qué debe hacer un personero si por un motivo de fuerza mayor (salud) no puede continuar en la mesa durante la tarde?",
    options: [
      "Avisar de inmediato a su Coordinador de Local para que acredite a un personero suplente de Somos Perú antes de retirarse.",
      "Dejar la mesa vacía sin avisar a nadie.",
      "Decirle al personero del partido rival que cuide sus votos.",
      "Cerrar la mesa y llevarse el material electoral."
    ],
    answer: 0,
    explanation: "El personero debe coordinar su reemplazo inmediato con su Coordinador de Local para no dejar la mesa desprotegida."
  },
  {
    id: 98,
    question: "¿Cuál es el valor que defiende el personero de Somos Perú durante toda la jornada electoral?",
    options: [
      "La voluntad democrática ciudadana, la transparencia electoral y la victoria legal de nuestra propuesta para Lima.",
      "La conveniencia personal del momento.",
      "El retraso del proceso para que gane tiempo el partido.",
      "La anulación de mesas de sufragio de la oposición."
    ],
    answer: 0,
    explanation: "El personero es el baluarte de la legalidad, la democracia y la defensa transparente del voto de los ciudadanos."
  },
  {
    id: 99,
    question: "¿Qué compromiso asume el personero acreditado para el domingo 4 de octubre de 2026?",
    options: [
      "Puntualidad desde las 6:00 a.m., vigilancia activa, defensa rigurosa de cada voto y entrega de la copia del acta al partido.",
      "Asistir solo si no tiene otros compromisos sociales.",
      "Quedarse hasta el mediodía e irse a almorzar sin volver.",
      "Aceptar sin reclamo cualquier decisión que tome la mesa."
    ],
    answer: 0,
    explanation: "El compromiso cívico es total: puntualidad, defensa activa y custodia del acta hasta la transmisión final."
  },
  {
    id: 100,
    question: "¿Cuál es la consigna final del Equipo de Personeros de Lima Metropolitana con Carlos Bruce?",
    options: [
      "¡Cuidar cada voto de Somos Perú con lealtad, firmeza, actas en mano y corazón!",
      "Llegar tarde y retirarse temprano.",
      "No revisar las actas de escrutinio.",
      "Dejar las mesas sin personeros acreditados."
    ],
    answer: 0,
    explanation: "La consigna institucional es la defensa integral, leal y documentada de cada voto por el progreso de Lima."
  }
];

/**
 * Selecciona N preguntas de manera totalmente aleatoria y mezcla sus opciones (Fisher-Yates shuffle).
 * @param {number} count 
 * @returns {Array} Array de preguntas aleatorias con sus opciones permutadas.
 */
export function getRandomQuestions(count = 5) {
  const pool = [...QUESTION_BANK];

  // Algoritmo Fisher-Yates para mezclar preguntas del banco de 100
  for (let i = pool.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [pool[i], pool[j]] = [pool[j], pool[i]];
  }

  const selected = pool.slice(0, count);

  return selected.map((q) => {
    const originalCorrectText = q.options[q.answer];
    const shuffledOptions = [...q.options];

    for (let i = shuffledOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
    }

    const newAnswerIndex = shuffledOptions.indexOf(originalCorrectText);

    return {
      id: q.id,
      question: q.question,
      options: shuffledOptions,
      answer: newAnswerIndex,
      explanation: q.explanation
    };
  });
}
