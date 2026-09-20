import fs from 'fs';

const cleanBank = JSON.parse(fs.readFileSync('clean_doc2_bank.json', 'utf8'));

// Format clean data for quizData.js
const formattedBank = cleanBank.map(q => ({
  id: q.id,
  question: q.question,
  options: q.options,
  answer: q.answer,
  explanation: q.explanation.replace(/&gt;\s*💡\s*/g, '').trim()
}));

// 1. Write frontend/src/constants/quizData.js
const quizDataJs = `/**
 * Banco oficial de 100 preguntas de capacitación electoral para Personeros de Mesa
 * Elecciones Regionales y Municipales 2026.
 * Basado estrictamente en el "BANCO OFICIAL DE PREGUNTAS Y RESPUESTAS (2).docx" y la Cartilla ONPE.
 */
export const QUESTION_BANK = ${JSON.stringify(formattedBank, null, 2)};

/**
 * Función para obtener un conjunto de preguntas aleatorias para la evaluación
 * @param {number} count - Cantidad de preguntas requeridas (por defecto 5)
 * @returns {Array} - Lista de preguntas seleccionadas aleatoriamente
 */
export function getRandomQuestions(count = 5) {
  const shuffled = [...QUESTION_BANK];
  for (let i = shuffled.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [shuffled[i], shuffled[j]] = [shuffled[j], shuffled[i]];
  }

  const selected = shuffled.slice(0, Math.min(count, shuffled.length));

  // Barajar las alternativas de cada pregunta para mayor aleatoriedad
  return selected.map(q => {
    const originalAnswerText = q.options[q.answer];
    const shuffledOptions = [...q.options];

    for (let i = shuffledOptions.length - 1; i > 0; i--) {
      const j = Math.floor(Math.random() * (i + 1));
      [shuffledOptions[i], shuffledOptions[j]] = [shuffledOptions[j], shuffledOptions[i]];
    }

    const newAnswerIndex = shuffledOptions.indexOf(originalAnswerText);

    return {
      ...q,
      options: shuffledOptions,
      answer: newAnswerIndex
    };
  });
}
`;

fs.writeFileSync('frontend/src/constants/quizData.js', quizDataJs, 'utf8');
console.log('✅ frontend/src/constants/quizData.js actualizado con banco 2');

// 2. Write banco_preguntas_respuestas.md
let md = '# BANCO OFICIAL DE PREGUNTAS Y RESPUESTAS - CARTILLA DEL PERSONERO ONPE ERM 2026\n\n';
md += '> **Documento Oficial de Estudio y Evaluación (Banco Oficial 2)**\n';
md += '> Basado estrictamente en el documento oficial *BANCO OFICIAL DE PREGUNTAS Y RESPUESTAS (2).docx* y la *Cartilla del Personero ONPE*.\n';
md += '> Contiene las 100 preguntas completas con sus opciones, respuesta correcta y justificación.\n\n---\n\n';

const letters = ['A', 'B', 'C', 'D'];

formattedBank.forEach(q => {
  md += `### Pregunta ${q.id}\n`;
  md += `**${q.question}**\n\n`;
  q.options.forEach((opt, idx) => {
    if (idx === q.answer) {
      md += `- [x] **${letters[idx]}) ${opt}** *(Correcta)*\n`;
    } else {
      md += `- [ ] ${letters[idx]}) ${opt}\n`;
    }
  });
  md += `\n> **💡 Justificación / Explicación:** ${q.explanation}\n\n---\n\n`;
});

fs.writeFileSync('banco_preguntas_respuestas.md', md, 'utf8');
console.log('✅ banco_preguntas_respuestas.md actualizado con banco 2');
