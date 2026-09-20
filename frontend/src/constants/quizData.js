/**
 * Banco oficial de 100 preguntas de capacitación electoral para Personeros de Mesa
 * Elecciones Regionales y Municipales 2026.
 * Basado estrictamente en la "CARTILLA DEL PERSONERO DE MESA - ONPE".
 * Preguntas claras, sencillas y directamente aplicables a la labor del personero.
 */
export const QUESTION_BANK = [
  {
    id: 1,
    question: "¿Quién es el personero de mesa de sufragio?",
    options: [
      "Es el ciudadano acreditado por una organización política para presenciar y fiscalizar la votación en una mesa de sufragio.",
      "Es la autoridad encargada de contar las cédulas en lugar del presidente de mesa.",
      "Es el trabajador contratado por la ONPE para guiar a los votantes en la fila.",
      "Es el miembro de seguridad encargado del orden en el local de votación."
    ],
    answer: 0,
    explanation: "El personero de mesa representa a su organización política y vela por la transparencia de la votación en la mesa."
  },
  {
    id: 2,
    question: "¿Cuáles son los tres momentos principales de la jornada electoral?",
    options: [
      "Instalación, Sufragio y Escrutinio.",
      "Convocatoria, Campaña y Votación.",
      "Capacitación, Simulacro y Proclamación.",
      "Apertura del local, Desayuno y Cierre del local."
    ],
    answer: 0,
    explanation: "La jornada electoral se divide en tres momentos: 1. Instalación, 2. Sufragio y 3. Escrutinio."
  },
  {
    id: 3,
    question: "¿A qué hora deben presentarse los miembros de mesa y personeros para la instalación?",
    options: [
      "A las 7:00 a. m.",
      "A las 8:30 a. m.",
      "A las 9:00 a. m.",
      "A las 6:00 a. m."
    ],
    answer: 0,
    explanation: "La instalación de la mesa de sufragio inicia a las 7:00 a. m."
  },
  {
    id: 4,
    question: "¿A qué hora inicia el sufragio (la votación de los electores)?",
    options: [
      "A las 8:00 a. m.",
      "A las 7:00 a. m.",
      "A las 9:00 a. m.",
      "A las 10:00 a. m."
    ],
    answer: 0,
    explanation: "El sufragio inicia a las 8:00 a. m., una vez instalada la mesa."
  },
  {
    id: 5,
    question: "¿A qué hora concluye el sufragio y se cierran las mesas para iniciar el escrutinio?",
    options: [
      "A las 5:00 p. m.",
      "A las 4:00 p. m.",
      "A las 6:00 p. m.",
      "A las 7:00 p. m."
    ],
    answer: 0,
    explanation: "La votación termina a las 5:00 p. m. Solo votan los electores que ya están dentro del local."
  },
  {
    id: 6,
    question: "¿Qué documentos debe presentar el personero de mesa ante el presidente para acreditarse?",
    options: [
      "Su credencial oficial y su DNI vigente.",
      "Solo su carnet de afiliado al partido.",
      "Solo su partida de nacimiento.",
      "Una carta firmada por el alcalde."
    ],
    answer: 0,
    explanation: "El personero debe presentar su credencial otorgada por su organización política y su DNI."
  },
  {
    id: 7,
    question: "¿Quiénes NO pueden ser personeros de mesa?",
    options: [
      "Los candidatos, las autoridades políticas, los miembros de mesa y los miembros de las FF.AA. y PNP en actividad.",
      "Los ciudadanos mayores de 18 años con DNI.",
      "Los afiliados a organizaciones políticas con credencial.",
      "Los vecinos que votan en el mismo distrito."
    ],
    answer: 0,
    explanation: "La ley prohíbe que candidatos, autoridades, miembros de mesa o policías/militares en servicio sean personeros."
  },
  {
    id: 8,
    question: "¿Puede una organización política tener más de un personero acreditado en la misma mesa al mismo tiempo?",
    options: [
      "No, solo puede estar presente un personero por cada organización política a la vez.",
      "Sí, pueden estar hasta tres personeros del mismo partido juntos.",
      "Sí, siempre que no hagan ruido.",
      "Sí, si la mesa tiene más de 300 electores."
    ],
    answer: 0,
    explanation: "Cada organización política solo puede tener un personero presente en la mesa de sufragio."
  },
  {
    id: 9,
    question: "¿Tiene derecho el personero de mesa a firmar el reverso de las cédulas de sufragio durante la instalación?",
    options: [
      "Sí, si lo desea, puede firmar las cédulas en la cara posterior junto con el presidente de mesa.",
      "No, está totalmente prohibido que el personero toque las cédulas para firmarlas.",
      "Solo si el presidente de mesa no sabe firmar.",
      "Solo si faltan menos de 10 minutos para las 8:00 a. m."
    ],
    answer: 0,
    explanation: "Los personeros tienen el derecho opcional de firmar el reverso de las cédulas durante la instalación."
  },
  {
    id: 10,
    question: "¿Qué debe hacer el personero si durante la instalación observa que el ánfora contiene papeles o está dañada?",
    options: [
      "Solicitar a los miembros de mesa que verifiquen que el ánfora esté completamente vacía antes de cerrarla y sellarla.",
      "Llevarse el ánfora a la comisaría.",
      "Romper el ánfora y pedir una caja de cartón.",
      "Guardar silencio hasta el final del conteo."
    ],
    answer: 0,
    explanation: "El personero verifica que el ánfora esté vacía y en buen estado antes de que se inicie la votación."
  },
  {
    id: 11,
    question: "¿Quiénes firman el Acta de Instalación?",
    options: [
      "Los tres miembros de mesa (Presidente, Secretario, Tercer Miembro) y los personeros que lo deseen.",
      "Solo el coordinador de la ONPE.",
      "Solo el personero del partido con más votos.",
      "Únicamente el policía que resguarda la puerta."
    ],
    answer: 0,
    explanation: "El acta de instalación es firmada obligatoriamente por los miembros de mesa y opcionalmente por los personeros presentes."
  },
  {
    id: 12,
    question: "¿Hasta qué hora como máximo puede instalarse una mesa de sufragio si faltan miembros?",
    options: [
      "Hasta las 12:00 del mediodía.",
      "Hasta las 10:00 a. m.",
      "Hasta las 2:00 p. m.",
      "Hasta las 5:00 p. m."
    ],
    answer: 0,
    explanation: "Si una mesa no logra instalarse hasta las 12:00 m., la mesa se declara no instalada."
  },
  {
    id: 13,
    question: "¿Quiénes votan primero al comenzar el sufragio a las 8:00 a. m.?",
    options: [
      "Los miembros de mesa y luego los personeros que votan en esa misma mesa.",
      "Los electores que llegaron primero a la fila.",
      "Los candidatos a la alcaldía.",
      "Los policías y militares de seguridad."
    ],
    answer: 0,
    explanation: "Los miembros de la mesa votan en primer lugar, seguidos por los personeros acreditados que votan en esa mesa."
  },
  {
    id: 14,
    question: "¿Dónde debe votar el personero de mesa si su mesa de votación original está en otra aula u otro local?",
    options: [
      "Debe votar en la mesa que le corresponde según su padrón electoral y su DNI.",
      "Puede votar en la mesa donde está cuidando los votos aunque no figure en el padrón.",
      "Puede votar dos veces: en su mesa y en la mesa donde es personero.",
      "El presidente de mesa le agrega manualmente en una hoja aparte."
    ],
    answer: 0,
    explanation: "Nadie puede votar en una mesa si no figura en el padrón electoral de esa mesa."
  },
  {
    id: 15,
    question: "¿Qué documento debe presentar obligatoriamente el ciudadano para poder votar?",
    options: [
      "Su Documento Nacional de Identidad (DNI).",
      "Su carnet de conducir o brevete.",
      "Su fotocopia simple de DNI sin foto.",
      "Su recibo de agua o luz."
    ],
    answer: 0,
    explanation: "El único documento válido para ejercer el derecho al voto es el DNI."
  },
  {
    id: 16,
    question: "¿Puede un elector ingresar a la cámara secreta acompañado por otra persona?",
    options: [
      "No, el voto es estrictamente secreto e individual, salvo personas con discapacidad que requieran asistencia de su confianza.",
      "Sí, siempre que ingrese con un personero de su confianza.",
      "Sí, los esposos pueden entrar juntos a votar.",
      "Sí, si el presidente de mesa lo acompaña para ver por quién vota."
    ],
    answer: 0,
    explanation: "El voto es secreto e individual. Solo personas con discapacidad severa pueden entrar con una persona de su confianza."
  },
  {
    id: 17,
    question: "¿Qué tipo de marca es válida en la cédula de votación según la ley electoral?",
    options: [
      "Una cruz (+) o un aspa (x) cuyo cruce de líneas esté dentro del recuadro del símbolo o fotografía.",
      "Un círculo que encierre todo el recuadro del partido.",
      "Un visto bueno (check) al costado de la foto del candidato.",
      "La firma del votante dentro del recuadro."
    ],
    answer: 0,
    explanation: "Solo es válida la marca en forma de cruz (+) o aspa (x) cuya intersección esté dentro del recuadro."
  },
  {
    id: 18,
    question: "¿Qué sucede si los trazos de la cruz o aspa sobrepasan ligeramente el recuadro, pero el punto de cruce está adentro?",
    options: [
      "El voto es VÁLIDO a favor de esa organización política.",
      "El voto es nulo automáticamente.",
      "El voto se convierte en voto en blanco.",
      "Se debe romper la cédula y darle otra al elector."
    ],
    answer: 0,
    explanation: "Si el cruce de las líneas está dentro del recuadro, el voto es válido aunque las líneas sobrepasen un poco."
  },
  {
    id: 19,
    question: "¿Qué es un voto nulo o viciado?",
    options: [
      "Es el voto con signos distintos (dibujos, firmas, caritas), marcas fuera de recuadros o marcas a dos partidos diferentes.",
      "Es el voto emitido por una persona mayor de 70 años.",
      "Es el voto de un elector que llegó después de las 8:00 a. m.",
      "Es el voto donde la cruz está perfectamente dibujada dentro del símbolo."
    ],
    answer: 0,
    explanation: "Un voto es nulo cuando tiene inscripciones ajenas, signos diferentes a cruz/aspa o marca a dos listas distintas."
  },
  {
    id: 20,
    question: "¿Qué es un voto en blanco?",
    options: [
      "Es la cédula donde el elector no realizó ninguna marca en ninguna opción de votación.",
      "Es una cédula que tiene una marca con lápiz blanco.",
      "Es una cédula que se rompió por error al doblarla.",
      "Es la cédula sobrante que no se utilizó durante el día."
    ],
    answer: 0,
    explanation: "El voto en blanco es aquel donde la cédula no tiene ninguna marca realizada por el elector."
  },
  {
    id: 21,
    question: "¿Puede el personero de mesa manipular, contar o tocar las cédulas de votación durante el escrutinio?",
    options: [
      "No, bajo ninguna circunstancia. Solo los miembros de mesa pueden tocar y contar las cédulas.",
      "Sí, el personero puede ayudar a contar si los miembros están cansados.",
      "Sí, el personero debe sostener las cédulas para que todos las vean.",
      "Sí, si tiene guantes quirúrgicos."
    ],
    answer: 0,
    explanation: "Está terminantemente prohibido que los personeros toquen o manipulen las cédulas de sufragio."
  },
  {
    id: 22,
    question: "¿Qué derecho fundamental tiene el personero durante el escrutinio (conteo de votos)?",
    options: [
      "Observar el conteo a una distancia adecuada y verificar la calificación de cada voto.",
      "Decidir él solo qué votos valen y cuáles no.",
      "Escribir directamente en el acta con su propio lapicero.",
      "Llevarse las cédulas a su local partidario para recontarlas."
    ],
    answer: 0,
    explanation: "El personero tiene derecho a presenciar y fiscalizar el escrutinio a una distancia que permita ver cada cédula."
  },
  {
    id: 23,
    question: "¿Cuál es el primer paso que realizan los miembros de mesa al iniciar el escrutinio a las 5:00 p. m.?",
    options: [
      "Contar las cédulas sin abrirlas y verificar que coincidan con el total de ciudadanos que votaron en el acta de sufragio.",
      "Abrir todas las cédulas rápidamente y separar los votos.",
      "Llenar de inmediato el acta de escrutinio con números estimados.",
      "Guardar el ánfora en la caja sin contar las cédulas."
    ],
    answer: 0,
    explanation: "Primero se cuenta el total de cédulas del ánfora para comprobar que coincide con los votantes registrados."
  },
  {
    id: 24,
    question: "¿Qué sucede si en el ánfora hay MÁS cédulas que el número de ciudadanos que votaron?",
    options: [
      "El presidente extrae al azar las cédulas sobrantes sin abrirlas y las destruye de inmediato.",
      "Se anula toda la mesa de sufragio.",
      "Se cuentan todas las cédulas y se aumentan firmas falsas en el padrón.",
      "Los personeros se reparten las cédulas sobrantes."
    ],
    answer: 0,
    explanation: "Si hay exceso de cédulas, se extraen al azar tantas cédulas como sobren y se destruyen sin abrirlas."
  },
  {
    id: 25,
    question: "¿Qué sucede si en el ánfora hay MENOS cédulas que el número de ciudadanos que votaron?",
    options: [
      "Se procede al escrutinio con las cédulas existentes y se deja constancia en el campo de observaciones del acta.",
      "Se anula la mesa automáticamente.",
      "Se detiene el conteo y se llama a los electores que ya se fueron.",
      "Se inventan cédulas en blanco para completar el número."
    ],
    answer: 0,
    explanation: "Se escrutan las cédulas que hay y se registra la observación en el acta electoral."
  },
  {
    id: 26,
    question: "¿Qué documento utilizan los miembros de mesa como borrador antes de llenar el Acta de Escrutinio definitiva?",
    options: [
      "La Hoja Borrador de Escrutinio proporcionada por la ONPE.",
      "Una servilleta o cuaderno personal de un personero.",
      "La parte de atrás de una cédula de votación.",
      "Un mensaje de WhatsApp en el celular."
    ],
    answer: 0,
    explanation: "Se utiliza la Hoja Borrador oficial para realizar los conteos y sumas antes de pasarlos al acta final."
  },
  {
    id: 27,
    question: "¿Qué es un voto impugnado?",
    options: [
      "Es aquel cuya validez es cuestionada por un personero y los miembros de mesa no resuelven por unanimidad.",
      "Es un voto que se rompió al salir del ánfora.",
      "Es el voto emitido por el presidente de mesa.",
      "Es el voto de un elector que llegó a las 4:59 p. m."
    ],
    answer: 0,
    explanation: "Si un personero impugna la validez de un voto, se guarda en sobre especial para que lo resuelva el JEE."
  },
  {
    id: 28,
    question: "¿Qué organismo electoral es el encargado de resolver los votos impugnados después de la jornada electoral?",
    options: [
      "El Jurado Electoral Especial (JEE).",
      "La Policía Nacional del Perú.",
      "La Municipalidad Distrital.",
      "El personero de mayor edad."
    ],
    answer: 0,
    explanation: "Los votos impugnados son remitidos en sobre especial al Jurado Electoral Especial para su resolución final."
  },
  {
    id: 29,
    question: "¿Tiene derecho el personero de mesa a recibir una copia del Acta Electoral al finalizar el escrutinio?",
    options: [
      "Sí, es un derecho legal fundamental recibir una copia del Acta Electoral completa y firmada por los miembros de mesa.",
      "No, las actas son secretas y solo las puede ver la ONPE.",
      "Solo si paga una tasa en el Banco de la Nación.",
      "Solo el personero del partido que obtuvo el primer lugar."
    ],
    answer: 0,
    explanation: "Los personeros tienen derecho a recibir un ejemplar del acta electoral debidamente suscrita por la mesa."
  },
  {
    id: 30,
    question: "¿Qué debe hacer el personero inmediatamente después de recibir su copia del Acta Electoral?",
    options: [
      "Revisar que las cifras coincidan con el conteo, que esté firmada y entregarla o reportarla a su coordinador partidario.",
      "Guardarla en su casa sin mostrarla a nadie.",
      "Borrar los números de los otros partidos con corrector.",
      "Firmarla en blanco y regalarla a un votante."
    ],
    answer: 0,
    explanation: "El acta es la prueba legal del resultado; se debe verificar, cuidar y enviar de inmediato al centro de cómputo partidario."
  },
  {
    id: 31,
    question: "¿Está permitido que un personero porte camisetas, gorros o carteles alusivos a su candidato dentro del local?",
    options: [
      "No, está prohibido hacer propaganda electoral dentro de los locales de votación.",
      "Sí, siempre que la camiseta sea de color claro.",
      "Sí, si mide menos de 1 metro de ancho.",
      "Sí, durante la última hora de la votación."
    ],
    answer: 0,
    explanation: "Dentro del local de votación está terminantemente prohibido portar distintivos o hacer propaganda electoral."
  },
  {
    id: 32,
    question: "¿Cuál es el único distintivo permitido que puede llevar visible el personero dentro del local de votación?",
    options: [
      "Su credencial oficial otorgada conforme a las medidas reglamentarias de la ONPE.",
      "Una bandera grande de su partido político.",
      "Un megáfono con el himno de su partido.",
      "Un pin con la foto del candidato a presidente."
    ],
    answer: 0,
    explanation: "El personero solo puede portar su credencial oficial de tamaño reglamentario para identificarse."
  },
  {
    id: 33,
    question: "¿Puede un personero pedir a los electores que voten por su organización política en la fila de votación?",
    options: [
      "No, está estrictamente prohibido inducir o pedir el voto dentro del local de votación.",
      "Sí, pero en voz baja para que no escuche el policía.",
      "Sí, solo a sus familiares y amigos.",
      "Sí, entregando volantes pequeños."
    ],
    answer: 0,
    explanation: "Inducir el voto en el local de votación es un delito electoral y motivo de expulsión inmediata."
  },
  {
    id: 34,
    question: "¿Qué debe hacer el personero si un elector se demora dentro de la cámara secreta?",
    options: [
      "Mantener la calma y permitir que los miembros de mesa manejen la situación con respeto a la privacidad del voto.",
      "Abrir la cortina de la cámara secreta para ver qué está haciendo.",
      "Entrar a ayudarlo a marcar la cédula.",
      "Gritarle desde la mesa para que se apure."
    ],
    answer: 0,
    explanation: "Nadie puede invadir la cámara secreta; los miembros de mesa son los únicos que pueden recordar amablemente el tiempo."
  },
  {
    id: 35,
    question: "¿Qué secciones componen el Acta Electoral completa?",
    options: [
      "Acta de Instalación, Acta de Sufragio y Acta de Escrutinio.",
      "Acta de Convocatoria, Acta de Gastos y Acta de Clausura.",
      "Padrón de afiliados, Lista de útiles y Ficha de votación.",
      "Hoja de reclamos, Lista de miembros y Acta de entrega."
    ],
    answer: 0,
    explanation: "El Acta Electoral oficial contiene las tres secciones: Instalación, Sufragio y Escrutinio."
  },
  {
    id: 36,
    question: "¿Qué información contiene la sección del Acta de Sufragio?",
    options: [
      "El total de electores que votaron, el total de ciudadanos que no votaron y las observaciones.",
      "La lista de los platos de comida repartidos.",
      "El número de cédulas rotas únicamente.",
      "La cantidad de policías en el aula."
    ],
    answer: 0,
    explanation: "El Acta de Sufragio registra cuántos ciudadanos votaron y cuántos no asistieron a votar."
  },
  {
    id: 37,
    question: "¿Qué información contiene la sección del Acta de Escrutinio?",
    options: [
      "Los votos obtenidos por cada lista de candidatos, los votos en blanco, los votos nulos y los votos impugnados.",
      "Los nombres de todos los votantes del día.",
      "Las firmas de los electores de la fila.",
      "La hora de salida del personal de limpieza."
    ],
    answer: 0,
    explanation: "El Acta de Escrutinio refleja los resultados numéricos exactos de la votación para cada lista."
  },
  {
    id: 38,
    question: "¿Qué debe hacer el personero si nota un error en la suma de los votos en la Hoja Borrador?",
    options: [
      "Hacer la observación con respeto antes de que los miembros de mesa pasen los datos al Acta de Escrutinio definitiva.",
      "Esperar a que firmen el acta para luego denunciarlos en televisión.",
      "Tachar con plumón negro el acta oficial.",
      "Arrebatar la hoja borrador y salir corriendo."
    ],
    answer: 0,
    explanation: "El personero debe alertar respetuosamente para corregir las sumas en la hoja borrador antes de llenar el acta final."
  },
  {
    id: 39,
    question: "¿Se pueden hacer borrones, tachaduras o usar corrector líquido en el Acta Electoral definitiva?",
    options: [
      "No, las actas no deben tener enmendaduras ni borrones porque pueden generar observaciones legales.",
      "Sí, se puede tachar y poner liquid paper cuantas veces se quiera.",
      "Sí, siempre que el personero ponga su huella encima.",
      "Sí, si el error es de menos de 10 votos."
    ],
    answer: 0,
    explanation: "Las actas deben llenarse con letra clara y sin enmendaduras para evitar que sean observadas por el JEE."
  },
  {
    id: 40,
    question: "¿Qué pasa si una organización política no obtuvo ningún voto en una mesa?",
    options: [
      "Se coloca el número cero (0) o una raya según corresponda en su casillero.",
      "Se deja el casillero completamente vacío y abierto.",
      "Se elimina esa organización del acta rompiendo el papel.",
      "Se le regalan 5 votos de los votos nulos."
    ],
    answer: 0,
    explanation: "Se debe consignar el número cero (0) para evitar que personas inescrupulosas agreguen números posteriormente."
  },
  {
    id: 41,
    question: "¿Quiénes son los tres miembros que conforman la mesa de sufragio?",
    options: [
      "Presidente, Secretario y Tercer Miembro.",
      "Personero, Fiscal y Comisario.",
      "Alcalde, Teniente Alcalde y Regidor.",
      "Coordinador de local, Técnico de cómputo y Guardia."
    ],
    answer: 0,
    explanation: "La mesa de sufragio está conformada por tres miembros titulares: Presidente, Secretario y Tercer Miembro."
  },
  {
    id: 42,
    question: "¿Qué rol cumple el personero frente a las decisiones que toman los miembros de mesa?",
    options: [
      "El personero es un fiscalizador cívico; no tiene voto en las decisiones, pero puede dejar constancia de sus observaciones e impugnaciones.",
      "El personero manda y ordena a los miembros de mesa lo que deben hacer.",
      "El personero puede expulsar a los miembros de mesa si no le caen bien.",
      "El personero decide el ganador de la mesa."
    ],
    answer: 0,
    explanation: "La máxima autoridad en la mesa son los miembros de mesa; el personero vigila, opina y puede impugnar formalmente."
  },
  {
    id: 43,
    question: "¿Qué sucede si a las 7:30 a. m. falta uno de los miembros de mesa titulares?",
    options: [
      "El presidente asume con los suplentes presentes o, en su defecto, con los primeros electores de la fila.",
      "La mesa se cierra y todos los electores se van a su casa.",
      "El personero se sienta a reemplazar al miembro de mesa y cobra el bono.",
      "Se espera hasta las 4:00 p. m. a que llegue el titular."
    ],
    answer: 0,
    explanation: "Si faltan titulares, la mesa se completa con los suplentes o electores de la fila; nunca con personeros ni candidatos."
  },
  {
    id: 44,
    question: "¿Puede un personero de mesa aceptar ser designado como miembro de mesa suplente de la fila?",
    options: [
      "No, los personeros de organizaciones políticas están legalmente impedidos de ser miembros de mesa.",
      "Sí, si le pagan el bono de miembro de mesa.",
      "Sí, siempre que no avise a su partido.",
      "Sí, si ningún otro elector quiere asumir."
    ],
    answer: 0,
    explanation: "La ley electoral prohíbe expresamente que los personeros asuman como miembros de mesa."
  },
  {
    id: 45,
    question: "¿Qué es la lista de electores (padrón electoral de la mesa)?",
    options: [
      "Es el documento oficial con la relación de ciudadanos habilitados para votar en esa mesa, con sus fotos, firmas y huellas.",
      "Es una lista de los vecinos que pagaron sus arbitrios.",
      "Es el padrón de afiliados del partido que ganó las elecciones anteriores.",
      "Es una lista de voluntarios que limpian el colegio."
    ],
    answer: 0,
    explanation: "El padrón electoral contiene la lista oficial de todos los ciudadanos habilitados para votar en esa mesa."
  },
  {
    id: 46,
    question: "¿Cómo comprueba el secretario que un ciudadano ya emitió su voto en el padrón?",
    options: [
      "El elector estampa su firma y su huella dactilar en el recuadro que le corresponde en la lista de electores.",
      "El elector le entrega una moneda al secretario.",
      "El elector le guiña el ojo al presidente.",
      "El personero tacha el nombre con lápiz rojo."
    ],
    answer: 0,
    explanation: "El elector debe firmar y poner su huella digital en el padrón electoral tras depositar su voto en el ánfora."
  },
  {
    id: 47,
    question: "¿Qué recibe el elector al momento de que le devuelven su DNI tras votar?",
    options: [
      "Su DNI con el holograma de sufragio pegado en la parte posterior.",
      "Un diploma de honor del colegio.",
      "Una copia del acta de escrutinio.",
      "Un vale de descuento para el supermercado."
    ],
    answer: 0,
    explanation: "Al finalizar el voto, se le entrega su DNI con el holograma oficial pegado como constancia de sufragio."
  },
  {
    id: 48,
    question: "¿Qué debe verificar el personero sobre las cámaras secretas de votación?",
    options: [
      "Que no tengan cámaras ocultas, celulares, ni carteles rotos o con propaganda dentro.",
      "Que tengan cortinas de color azul únicamente.",
      "Que tengan una silla acolchada para cada votante.",
      "Que tengan espejos grandes en las paredes."
    ],
    answer: 0,
    explanation: "La cámara secreta debe estar limpia de propaganda y garantizar el secreto absoluto del voto."
  },
  {
    id: 49,
    question: "¿Qué debe hacer un personero si detecta propaganda electoral dentro de la cámara secreta?",
    options: [
      "Avisar de inmediato a los miembros de mesa para que retiren la propaganda y la destruyan.",
      "Quedarse callado para que la gente vote por esa propaganda.",
      "Pegar encima propaganda de su propio partido.",
      "Pelear con los electores de la fila."
    ],
    answer: 0,
    explanation: "Se debe comunicar a los miembros de mesa para que retiren de inmediato cualquier material de propaganda."
  },
  {
    id: 50,
    question: "¿Puede el elector tomar fotos a su cédula de votación con su teléfono celular dentro de la cámara secreta?",
    options: [
      "No, está legalmente prohibido tomar fotos o grabar el voto para proteger el secreto del sufragio y evitar coacciones.",
      "Sí, siempre que la suba a TikTok o Instagram de inmediato.",
      "Sí, si es para mostrarle a su jefe de trabajo.",
      "Sí, si la foto sale nítida."
    ],
    answer: 0,
    explanation: "Está prohibido el uso de celulares y cámaras en la cámara secreta para garantizar el voto libre y secreto."
  },
  {
    id: 51,
    question: "¿Qué es el cartel de candidatos pegado dentro de la cámara secreta?",
    options: [
      "Es el documento oficial de la ONPE que muestra las listas, fotos y símbolos de todas las organizaciones políticas inscritas.",
      "Es un afiche publicitario pagado por un solo candidato.",
      "Es una lista de los electores que no fueron a votar.",
      "Es un cartel con los nombres de los miembros de mesa."
    ],
    answer: 0,
    explanation: "El cartel de candidatos muestra oficialmente a todos los partidos y candidatos participantes en la elección."
  },
  {
    id: 52,
    question: "¿Qué debe hacer el personero si nota que el cartel de candidatos de la cámara secreta fue rayado o dañado?",
    options: [
      "Pedir a los miembros de mesa y al coordinador de la ONPE que reemplacen el cartel por uno nuevo y limpio.",
      "Rayar también los otros símbolos para que estén iguales.",
      "Arrancar el cartel y llevárselo.",
      "No decir nada y seguir mirando."
    ],
    answer: 0,
    explanation: "Se debe solicitar el cambio inmediato del cartel de candidatos para no inducir a error a los votantes."
  },
  {
    id: 53,
    question: "¿Qué se hace con las cédulas de sufragio que sobraron porque algunos electores no vinieron a votar?",
    options: [
      "El presidente las inutiliza cortando una esquina o cruzándolas, sin abrirlas, y las guarda en el sobre de cédulas no utilizadas.",
      "Se reparten entre los personeros como recuerdo.",
      "Se llenan con votos a favor del partido que va ganando.",
      "Se botan a la basura fuera del aula."
    ],
    answer: 0,
    explanation: "Las cédulas no utilizadas se inutilizan y se guardan en su sobre oficial de material sobrante."
  },
  {
    id: 54,
    question: "¿Quién es el encargado de abrir cada cédula y cantar el voto en voz alta durante el escrutinio?",
    options: [
      "El Presidente de la mesa de sufragio.",
      "El personero con más experiencia.",
      "El vigilante de la puerta del colegio.",
      "Cualquier elector que se quedó a mirar."
    ],
    answer: 0,
    explanation: "El Presidente de mesa es el único facultado para desdoblar las cédulas y leer los votos en voz alta."
  },
  {
    id: 55,
    question: "¿Qué hace el Secretario de la mesa mientras el Presidente canta los votos?",
    options: [
      "Anota los votos en la Hoja Borrador de Escrutinio con la verificación del Tercer Miembro y personeros.",
      "Firma las constancias de los electores ausentes.",
      "Cuenta chistes a los personeros.",
      "Llama por teléfono a sus familiares."
    ],
    answer: 0,
    explanation: "El Secretario registra cada voto en la hoja borrador oficial bajo la mirada de los personeros."
  },
  {
    id: 56,
    question: "¿Puede un personero pedir que le muestren una cédula si tiene dudas sobre la marca?",
    options: [
      "Sí, tiene derecho a que el presidente le muestre la cédula a la vista para verificar la marca sin tocarla.",
      "No, el personero no tiene derecho a mirar las cédulas.",
      "Solo si paga una multa al secretario.",
      "Solo si el presidente es de su mismo partido."
    ],
    answer: 0,
    explanation: "El personero tiene pleno derecho a visualizar la cédula para comprobar la validez de la marca."
  },
  {
    id: 57,
    question: "¿Qué pasa si una cédula tiene una cruz clara en un partido, pero además tiene un insulto escrito a mano?",
    options: [
      "El voto es NULO (viciado), porque contiene inscripciones ajenas al proceso electoral.",
      "El voto es válido porque la cruz se nota.",
      "El voto vale doble por la emoción del elector.",
      "Se le suma medio voto al partido."
    ],
    answer: 0,
    explanation: "Cualquier texto, frase, firma o insulto escrito en la cédula la convierte automáticamente en voto nulo."
  },
  {
    id: 58,
    question: "¿Qué pasa si una cédula tiene una marca hecha con un lápiz que no es el oficial de la ONPE?",
    options: [
      "Si la marca es una cruz o aspa válida, el voto es VÁLIDO. No se anula el voto por el tipo de bolígrafo o lápiz.",
      "Se anula inmediatamente.",
      "Se manda a la fiscalía para peritaje.",
      "Se considera voto en blanco."
    ],
    answer: 0,
    explanation: "La jurisprudencia electoral protege la intención del voto; el tipo o color de tinta no anula el voto si la marca es válida."
  },
  {
    id: 59,
    question: "¿Qué ocurre si en una elección municipal provincial y distrital, el elector vota por un partido para provincial y deja en blanco la parte distrital?",
    options: [
      "Es voto válido para provincial y voto en blanco para distrital. Son elecciones independientes en la misma cédula.",
      "Se anula toda la cédula completa.",
      "Se anula la parte provincial y vale la distrital.",
      "El presidente decide a quién darle el voto distrital."
    ],
    answer: 0,
    explanation: "Cada columna de votación es independiente: puede ser válida en una y nula o en blanco en la otra."
  },
  {
    id: 60,
    question: "¿Cómo se llama el sobre de seguridad donde se guardan las actas electorales para ser llevadas a la ODPE?",
    options: [
      "Sobre Plomo / Sobre de Seguridad de Actas Oficiales.",
      "Bolsa plástica de supermercado.",
      "Sobre transparente sin sello.",
      "Caja de zapatos."
    ],
    answer: 0,
    explanation: "Las actas oficiales se guardan en sobres de seguridad con precintos especiales entregados por la ONPE."
  },
  {
    id: 61,
    question: "¿Cuántos ejemplares del Acta Electoral se llenan y firman como mínimo en cada mesa?",
    options: [
      "Se llenan los ejemplares oficiales para la ODPE, JEE, JNE, ONPE, Fiscalía y las copias para los personeros presentes.",
      "Solo se llena un papel y los demás le sacan copia en fotocopiadora.",
      "Solo se llena una hoja para el presidente de mesa.",
      "Se llenan 100 hojas iguales."
    ],
    answer: 0,
    explanation: "Se suscribe el número reglamentario de actas oficiales y las copias que correspondan a los personeros acreditados."
  },
  {
    id: 62,
    question: "¿Qué debe hacer el personero si un miembro de mesa se niega a entregarle su copia del Acta Electoral?",
    options: [
      "Exigir su derecho con firmeza y amabilidad, acudiendo al Coordinador de Mesa de la ONPE y al fiscalizador del JNE.",
      "Irse a su casa sin el acta.",
      "Quitarle el ánfora por la fuerza.",
      "Romper las actas de los otros partidos."
    ],
    answer: 0,
    explanation: "El personero acude a los representantes de la ONPE y el JNE presentes para hacer valer su derecho legal al acta."
  },
  {
    id: 63,
    question: "¿A qué personas se les debe dar atención preferente en la fila de votación?",
    options: [
      "A mujeres embarazadas, personas con discapacidad, adultos mayores y personas con niños en brazos.",
      "A los personeros y sus amigos.",
      "A los candidatos que lleguen con fotógrafos.",
      "A las personas que tienen prisa por ir al trabajo."
    ],
    answer: 0,
    explanation: "La ley establece atención preferente obligatoria a gestantes, adultos mayores y personas con discapacidad."
  },
  {
    id: 64,
    question: "¿Puede un elector votar si su DNI ha caducado o vencido recientemente?",
    options: [
      "Sí, el RENIEC y el JNE disponen que los DNI caducos son válidos para ejercer el derecho al sufragio en la jornada electoral.",
      "No, si el DNI está vencido no puede votar bajo ninguna circunstancia.",
      "Solo si paga una multa en la mesa.",
      "Solo si vota por el partido de gobierno."
    ],
    answer: 0,
    explanation: "Para el día de la elección se habilita expresamente el voto con DNI caduco o vencido."
  },
  {
    id: 65,
    question: "¿Puede votar una persona que no figura en el padrón electoral de la mesa pero vive al frente del colegio?",
    options: [
      "No, nadie puede votar en una mesa si no está registrado en el padrón electoral de dicha mesa.",
      "Sí, si muestra su título de propiedad.",
      "Sí, si todos los miembros de mesa son sus vecinos.",
      "Sí, pagando 10 soles al secretario."
    ],
    answer: 0,
    explanation: "El padrón electoral es definitivo y cerrado; nadie que no figure en él puede emitir su voto."
  },
  {
    id: 66,
    question: "¿Qué debe hacer el personero si sospecha que un elector está suplantando la identidad de otra persona?",
    options: [
      "Impugnar la identidad del elector antes de que deposite la cédula en el ánfora.",
      "Esperar a que el elector se vaya a su casa para quejarse.",
      "Agredir físicamente al elector.",
      "Quitarle el DNI al presidente de mesa."
    ],
    answer: 0,
    explanation: "La impugnación de identidad se realiza en el momento en que el elector se presenta a la mesa, antes de votar."
  },
  {
    id: 67,
    question: "¿Cómo se resuelve una impugnación de identidad de un elector en la mesa?",
    options: [
      "Los miembros de mesa cotejan los datos, foto y firma del elector con el padrón; si persiste la duda, se sigue el protocolo de impugnación.",
      "Se llama a una votación entre todos los electores de la fila.",
      "Se echa una moneda al aire.",
      "El personero decide si el elector va preso."
    ],
    answer: 0,
    explanation: "Los miembros de mesa verifican las características físicas y datos del DNI con el padrón electoral."
  },
  {
    id: 68,
    question: "¿Qué debe hacer el personero si durante el escrutinio se corta la luz en el aula?",
    options: [
      "Pedir que se asegure el material electoral sobre la mesa y utilizar linternas sin que nadie retire nada hasta que haya luz.",
      "Llevarse las actas a la calle.",
      "Aprovechar la oscuridad para marcar cédulas.",
      "Dar por terminado el conteo con los datos que recuerden."
    ],
    answer: 0,
    explanation: "Se debe proteger la integridad de las cédulas y actas en la mesa con iluminación de apoyo y presencia de los miembros."
  },
  {
    id: 69,
    question: "¿Pueden los miembros de mesa cambiar los resultados del acta una vez que ya fue firmada y cerrada?",
    options: [
      "No, una vez firmada y sellada el Acta Electoral, los resultados son definitivos e inalterables en la mesa.",
      "Sí, pueden cambiar los números al día siguiente.",
      "Sí, si el personero se lo pide de favor.",
      "Sí, si encuentran un error una hora después."
    ],
    answer: 0,
    explanation: "El acta suscrita y cerrada es un documento público inmodificable; cualquier reclamo posterior se eleva al JEE."
  },
  {
    id: 70,
    question: "¿Qué actitud debe mantener el personero ante los miembros de mesa y personeros de otros partidos?",
    options: [
      "Una actitud de respeto, firmeza, educación, civismo y apego a la ley electoral.",
      "Una actitud hostil, violenta y prepotente.",
      "Una actitud de burla cuando su partido saque ventaja.",
      "Una actitud de indiferencia sin mirar lo que pasa en la mesa."
    ],
    answer: 0,
    explanation: "El personero representa dignamente a su organización con respeto, educación y firmeza técnica y legal."
  },
  {
    id: 71,
    question: "¿Qué datos del personero deben constar en el Acta de Instalación y Escrutinio cuando firma?",
    options: [
      "Sus nombres y apellidos completos, número de DNI y la organización política a la que representa.",
      "Su número de cuenta bancaria y su dirección de casa.",
      "La foto de su familia y su correo de trabajo.",
      "Solo un garabato sin su nombre."
    ],
    answer: 0,
    explanation: "El personero consigna su nombre completo, DNI y el nombre del partido o movimiento que representa."
  },
  {
    id: 72,
    question: "¿Puede un personero abandonar su mesa de sufragio durante el conteo de votos?",
    options: [
      "No es recomendable; debe permanecer hasta el final del escrutinio para firmar y recibir su copia del Acta Electoral.",
      "Sí, puede irse apenas suenen las 5:00 p. m. y dejar la mesa sola.",
      "Sí, es mejor que se vaya antes de que cuenten los votos.",
      "Sí, no hace falta que espere el acta."
    ],
    answer: 0,
    explanation: "El momento más crucial es el escrutinio; el personero debe quedarse hasta tener su acta firmada en mano."
  },
  {
    id: 73,
    question: "¿Qué debe hacer el personero si observa que una persona intenta votar con un DNI ajeno?",
    options: [
      "Alertar inmediatamente al presidente de mesa y al personal de la ONPE para impedir la suplantación.",
      "Ayudarlo a firmar el padrón rápido.",
      "Cobrarle una propina para no denunciarlo.",
      "No decir nada para no causar problemas."
    ],
    answer: 0,
    explanation: "La suplantación de identidad es un delito grave que el personero debe evitar de inmediato denunciándolo a la mesa."
  },
  {
    id: 74,
    question: "¿Qué pasa con los útiles electorales (lapiceros, tampones, cintas) al finalizar el escrutinio?",
    options: [
      "Se guardan en los sobres y cajas correspondientes de la ONPE para su retorno.",
      "Los personeros se los llevan a su casa como recuerdo.",
      "Se botan en el patio del colegio.",
      "Se regalan a los electores que pasan por la calle."
    ],
    answer: 0,
    explanation: "Todo el material y útiles electorales se empaquetan en las cajas oficiales de la ONPE."
  },
  {
    id: 75,
    question: "¿Quién es el encargado de la seguridad y el orden dentro del local de votación?",
    options: [
      "El personal de las Fuerzas Armadas (en el interior del local) y la Policía Nacional (en el exterior y accesos).",
      "Los personeros de mesa más fuertes.",
      "Los porteros del colegio únicamente.",
      "Los candidatos a regidores."
    ],
    answer: 0,
    explanation: "Las Fuerzas Armadas custodian el interior del local y la Policía Nacional el exterior y alrededores."
  },
  {
    id: 76,
    question: "¿Puede la fuerza pública (militares o policías) decidir si un voto es válido o nulo?",
    options: [
      "No, las fuerzas de seguridad no tienen ninguna competencia en decisiones electorales; solo resguardan el orden.",
      "Sí, el coronel decide qué votos valen.",
      "Sí, los policías pueden contar las cédulas.",
      "Sí, si hay empate entre los miembros de mesa."
    ],
    answer: 0,
    explanation: "Solo los miembros de mesa califican y cuentan los votos. La fuerza pública solo mantiene la seguridad."
  },
  {
    id: 77,
    question: "¿Qué se hace con las cédulas de votación escrutadas después de que los votos han sido contados y registrados en el acta?",
    options: [
      "Se destruyen en presencia de los miembros de mesa y personeros, salvo las cédulas con votos impugnados que se guardan.",
      "Se guardan para volverlas a contar en la casa del alcalde.",
      "Se regalan a los niños del colegio.",
      "Se venden por kilo a una recicladora."
    ],
    answer: 0,
    explanation: "Las cédulas escrutadas comunes se destruyen inmediatamente en la mesa, preservando únicamente las impugnadas."
  },
  {
    id: 78,
    question: "¿Por qué es tan importante que el personero cuide y entregue el Acta Electoral a su partido?",
    options: [
      "Porque es la única prueba física oficial para defender los votos de su partido en el cómputo final de la ODPE y el JEE.",
      "Porque le sirve para entrar gratis al estadio.",
      "Porque es un recuerdo personal para enmarcar.",
      "Porque tiene valor monetario en el banco."
    ],
    answer: 0,
    explanation: "El acta oficial es el documento legal con el que la organización política defiende sus resultados ante el jurado."
  },
  {
    id: 79,
    question: "¿Qué pasa si un miembro de mesa comete un error involuntario de suma en el acta final y ya fue firmada?",
    options: [
      "El Jurado Electoral Especial cotejará las actas de los personeros y las actas oficiales para subsanar el error material.",
      "Se anula la elección de todo el Perú.",
      "Se le quitan todos los votos al partido ganador.",
      "Se meten presos a todos los votantes del aula."
    ],
    answer: 0,
    explanation: "Los errores de suma se corrigen en el JEE durante el cotejo de actas oficiales y copias de personeros."
  },
  {
    id: 80,
    question: "¿Puede el personero tomar fotografías al Acta de Escrutinio terminada y firmada?",
    options: [
      "Sí, una vez concluido el escrutinio y firmada el acta, es recomendable tomar una foto nítida para transmitir el resultado a su centro de cómputo.",
      "No, tomarle foto al acta firmada es delito.",
      "Solo con permiso escrito de un juez de la Corte Suprema.",
      "Solo si la foto es en blanco y negro."
    ],
    answer: 0,
    explanation: "Fotografiar el acta final firmada permite transmitir los resultados de inmediato al centro de monitoreo del partido."
  },
  {
    id: 81,
    question: "¿Qué debe hacer el personero si el presidente de mesa no sabe cómo llenar alguna casilla del acta?",
    options: [
      "Orientar con amabilidad y pedir el apoyo del Coordinador de Mesa de la ONPE para resolver las dudas técnicas.",
      "Burlarse del presidente de mesa.",
      "Llenar el acta él mismo sin permiso.",
      "Retirarse del aula indignado."
    ],
    answer: 0,
    explanation: "El personero puede orientar respetuosamente y solicitar el apoyo del personal técnico de la ONPE."
  },
  {
    id: 82,
    question: "¿Qué se debe verificar en el Acta Electoral antes de retirarse del aula?",
    options: [
      "Que los números sean legibles, que la suma total sea correcta, que no haya casilleros vacíos y que tenga las firmas de los miembros.",
      "Que el papel huela a flores.",
      "Que tenga el sello de la comisaría del distrito.",
      "Que tenga dibujos en los bordes."
    ],
    answer: 0,
    explanation: "Se debe revisar minuciosamente la legibilidad, las sumas y las firmas antes de dar por cerrada la mesa."
  },
  {
    id: 83,
    question: "¿Qué ocurre si una persona con discapacidad visual acude a votar a la mesa?",
    options: [
      "Tiene derecho a solicitar la plantilla braille para la cédula o ingresar acompañada por una persona de su entera confianza.",
      "No puede votar y se le pide que se retire.",
      "El personero debe marcar por ella en secreto.",
      "El policía de la puerta entra a marcar por ella."
    ],
    answer: 0,
    explanation: "La ONPE provee plantillas braille y permite el voto asistido por una persona de confianza del elector con discapacidad."
  },
  {
    id: 84,
    question: "¿Qué debe hacer el personero si observa que un miembro de mesa está visiblemente ebrio o bajo sustancias?",
    options: [
      "Denunciar el hecho de inmediato ante el Coordinador del Local de la ONPE y la Fiscalía de Prevención del Delito para que sea sustituido.",
      "Dejarlo continuar y no decir nada.",
      "Ofrecerle más licor.",
      "Sentarse en su lugar y firmar por él."
    ],
    answer: 0,
    explanation: "Se debe denunciar a las autoridades electorales y fiscales para garantizar la validez y seriedad del acto electoral."
  },
  {
    id: 85,
    question: "¿A qué hora deben ingresar los electores que aún están en la fila cuando el reloj marca las 5:00 p. m.?",
    options: [
      "A las 5:00 p. m. se cierran las puertas del local; todos los que ya están dentro del local tienen derecho a votar.",
      "Se botan a todos los que están en la fila sin importar nada.",
      "Solo votan los 5 primeros de la fila.",
      "Se deja la puerta abierta hasta las 8:00 p. m."
    ],
    answer: 0,
    explanation: "A las 5:00 p. m. se cierra el local y se garantiza el sufragio de todos los ciudadanos que se encuentren dentro."
  },
  {
    id: 86,
    question: "¿Quién custodia las actas electorales mientras son transportadas a la sede de la ODPE?",
    options: [
      "El personal de la ONPE con el resguardo y custodia estricta de las Fuerzas Armadas y Policía Nacional.",
      "Los personeros de los partidos en sus propios autos.",
      "Una empresa de mensajería privada común.",
      "Los mototaxistas de la zona."
    ],
    answer: 0,
    explanation: "El traslado del material electoral y actas se realiza bajo custodia militar y policial permanente."
  },
  {
    id: 87,
    question: "¿Qué pasa si un personero firma un acta electoral en blanco antes de que termine el conteo?",
    options: [
      "Comete una grave irresponsabilidad que facilita posibles fraudes y adulteraciones; NUNCA se debe firmar un acta en blanco.",
      "Es una buena práctica para irse temprano a casa.",
      "La ONPE lo premia con un diploma.",
      "No pasa nada porque el presidente es buena persona."
    ],
    answer: 0,
    explanation: "Bajo ninguna circunstancia se debe firmar un acta en blanco; siempre se firma cuando todos los datos están completos."
  },
  {
    id: 88,
    question: "¿Qué es la acreditación del personero de mesa?",
    options: [
      "Es el documento expedido por el personero legal o directivo autorizado que le da validez oficial para actuar ante la mesa.",
      "Es un mensaje de texto en el celular sin nombre.",
      "Es una tarjeta de presentación comercial.",
      "Es un autógrafo del candidato."
    ],
    answer: 0,
    explanation: "La credencial acredita legalmente al personero ante las autoridades de la mesa y la ONPE."
  },
  {
    id: 89,
    question: "¿Qué debe hacer el personero si durante el sufragio un elector no sabe cómo doblar su cédula?",
    options: [
      "El presidente de mesa le indica amablemente cómo doblarla sin mirar por quién votó, respetando el secreto del voto.",
      "El personero le quita la cédula y se la dobla mirando el voto.",
      "El elector debe romper la cédula.",
      "El policía entra al aula y se la dobla."
    ],
    answer: 0,
    explanation: "Los miembros de mesa guían al elector respetando siempre la privacidad y el secreto de su decisión."
  },
  {
    id: 90,
    question: "¿Qué pasa si un personero llega tarde, por ejemplo a las 9:00 a. m. cuando la mesa ya está instalada?",
    options: [
      "Puede acreditarse en ese momento y comenzar a cumplir sus funciones a partir de su llegada, sin anular lo ya actuado.",
      "Ya no se le permite ingresar y se le retira del colegio.",
      "Se debe desinstalar la mesa y volver a empezar de cero.",
      "Se le cobra una multa de 100 soles en la mesa."
    ],
    answer: 0,
    explanation: "El personero puede incorporarse a la mesa en cualquier momento de la jornada, acreditándose ante el presidente."
  },
  {
    id: 91,
    question: "¿Tiene derecho el personero a solicitar que conste en el acta alguna incidencia o irregularidad observada?",
    options: [
      "Sí, tiene derecho a que sus observaciones fundamentadas se escriban en el casillero de observaciones del acta electoral.",
      "No, las actas no permiten escribir ninguna queja.",
      "Solo si los miembros de mesa están de acuerdo con su partido.",
      "Solo pagando un derecho de trámite."
    ],
    answer: 0,
    explanation: "El casillero de observaciones del acta está diseñado para asentar formalmente cualquier incidencia relevante."
  },
  {
    id: 92,
    question: "¿Qué es el derecho al sufragio en el Perú?",
    options: [
      "Es un derecho y un deber cívico de todos los ciudadanos peruanos mayores de 18 años.",
      "Es un trámite voluntario exclusivo de los funcionarios públicos.",
      "Es una obligación solo para personas que tienen título profesional.",
      "Es un sorteo de premios organizado por el Estado."
    ],
    answer: 0,
    explanation: "El sufragio es un derecho y deber constitucional para todos los ciudadanos peruanos mayores de 18 años."
  },
  {
    id: 93,
    question: "¿Cuál es el rol del Coordinador de Local de Votación de la ONPE?",
    options: [
      "Coordinar la logística, entrega de materiales, habilitación de aulas y apoyo técnico a los miembros de mesa en el local.",
      "Decidir quién gana las elecciones en cada aula.",
      "Contar los votos en secreto en la dirección del colegio.",
      "Impedir que los personeros entren al local."
    ],
    answer: 0,
    explanation: "El personal de la ONPE brinda soporte logístico y técnico para asegurar el correcto desarrollo de la jornada electoral."
  },
  {
    id: 94,
    question: "¿Cuál es la función del fiscalizador del Jurado Nacional de Elecciones (JNE) en el local de votación?",
    options: [
      "Fiscalizar el estricto cumplimiento de la ley electoral y la legalidad del proceso durante toda la jornada.",
      "Contar las cédulas de votación junto a los miembros de mesa.",
      "Hacer propaganda para los candidatos regionales.",
      "Revisar las mochilas de los electores."
    ],
    answer: 0,
    explanation: "El fiscalizador del JNE vela por el cumplimiento de las normas y la legalidad del proceso en los locales."
  },
  {
    id: 95,
    question: "¿Qué debe hacer el personero si encuentra a una persona repartiendo volantes dentro del colegio electoral?",
    options: [
      "Denunciar el hecho inmediatamente ante el fiscalizador del JNE, el coordinador de la ONPE y las fuerzas de seguridad.",
      "Pedirle volantes para repartirlos él también.",
      "Quedarse callado para no generar molestias.",
      "Comprarle los volantes para botarlos."
    ],
    answer: 0,
    explanation: "Hacer propaganda en el local es un delito electoral; se debe denunciar de inmediato a los fiscalizadores y a la policía/militar."
  },
  {
    id: 96,
    question: "¿Qué debe hacer el personero cuando concluye toda la jornada electoral y ya tiene su acta firmada?",
    options: [
      "Entregar o transmitir de inmediato su acta y reporte a su Coordinador Zonal o Distrital del partido.",
      "Publicarla en redes sociales con datos personales borrados.",
      "Romper el acta porque ya terminó la votación.",
      "Irse a dormir sin avisar a su organización política."
    ],
    answer: 0,
    explanation: "La misión del personero culmina entregando con éxito el acta electoral y los resultados al equipo central de su partido."
  },
  {
    id: 97,
    question: "¿Por qué el personero de mesa representa la primera línea de defensa democrática del voto popular?",
    options: [
      "Porque con su presencia, vigilancia y actas en mano garantiza que se respete la voluntad de cada ciudadano expresada en las urnas.",
      "Porque tiene inmunidad diplomática el día de la elección.",
      "Porque cobra un sueldo millonario del Estado.",
      "Porque decide qué candidatos van a segunda vuelta."
    ],
    answer: 0,
    explanation: "El personero cuida la democracia asegurando con transparencia que cada voto emitido sea contado con total fidelidad."
  },
  {
    id: 98,
    question: "¿Qué valores definen al buen personero de mesa durante todo el día electoral?",
    options: [
      "Puntualidad, honestidad, firmeza, respeto, concentración y compromiso democrático con su país y su partido.",
      "Llegar tarde, gritar a los ancianos y distraerse con el celular.",
      "Firmar actas en blanco y abandonar la mesa a las 3:00 p. m.",
      "Pelear con los miembros de mesa por cualquier motivo."
    ],
    answer: 0,
    explanation: "La puntualidad, el respeto, la concentración y el civismo garantizan un desempeño impecable en la mesa."
  },
  {
    id: 99,
    question: "¿Cómo se califica un voto donde el elector marcó una cruz sobre el símbolo de un partido y no marcó nada en los otros?",
    options: [
      "Es un VOTO VÁLIDO a favor de esa organización política.",
      "Es un voto nulo por no marcar a los demás partidos.",
      "Es un voto en blanco porque falta marcar regidores.",
      "Es un voto observado que se bota."
    ],
    answer: 0,
    explanation: "Es el voto válido clásico y reglamentario a favor de la organización política elegida."
  },
  {
    id: 100,
    question: "¿Cuál es la consigna final del personero de mesa al concluir el escrutinio?",
    options: [
      "¡Cuidar y defender cada voto con responsabilidad, respeto a la ley y con el Acta Electoral firmada en la mano!",
      "Irse antes de las 5:00 p. m. para evitar el tráfico de la ciudad.",
      "Discutir sin fundamento todas las decisiones de los miembros de mesa.",
      "Tocar y contar las cédulas directamente sin autorización."
    ],
    answer: 0,
    explanation: "Defender cada voto con firmeza cívica, respeto a la ley electoral y con el Acta Oficial firmada en la mano."
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
