import fs from 'fs';

const rawBank = JSON.parse(fs.readFileSync('full_extracted_quiz_data.json', 'utf8'));

// Format and clean questions, options and explanations
const cleanBank = rawBank.map(q => {
  // Clean question text
  let question = q.question.replace(/\*\*+/g, '').replace(/^[#\s]+/, '').trim();
  
  // Clean options
  let options = q.options.map(opt => {
    return opt
      .replace(/\*\*+/g, '')
      .replace(/^\s*[A-D]\)\s*/, '')
      .replace(/\*\(Correcta\)\*\s*$/i, '')
      .replace(/\(Correcta\)\*?\s*$/i, '')
      .replace(/\s+/g, ' ')
      .trim();
  });

  // Clean explanation
  let explanation = (q.explanation || '')
    .replace(/^💡\s*/, '')
    .replace(/Justificación\s*\/\s*Explicación:\s*/i, '')
    .replace(/\*\*+/g, '')
    .replace(/\s+/g, ' ')
    .trim();

  // If explanation is empty, provide a concise explanation
  if (!explanation) {
    explanation = `Respuesta conforme a los lineamientos oficiales de capacitación de personeros de mesa de la ONPE.`;
  }

  return {
    id: q.id,
    question,
    options,
    answer: q.answer,
    explanation
  };
});

// 1. Write quizData.js
const quizDataJs = `/**
 * Banco oficial de 100 preguntas de capacitación electoral para Personeros de Mesa
 * Elecciones Regionales y Municipales 2026.
 * Basado estrictamente en la Cartilla Oficial y Documento del Personero de Mesa - ONPE.
 */
export const QUESTION_BANK = ${JSON.stringify(cleanBank, null, 2)};

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
console.log('✅ frontend/src/constants/quizData.js actualizado');

// 2. Write banco_preguntas_respuestas.md
let md = '# BANCO OFICIAL DE PREGUNTAS Y RESPUESTAS - CARTILLA DEL PERSONERO ONPE ERM 2026\n\n';
md += '> **Documento Oficial de Estudio y Evaluación**\n';
md += '> Basado estrictamente en la *Cartilla del Personero de Mesa de Sufragio - ONPE* y en las correcciones oficiales del banco.\n';
md += '> Contiene 100 preguntas didácticas, claras y directas con sus respuestas correctas y justificaciones.\n\n---\n\n';

const letters = ['A', 'B', 'C', 'D'];

cleanBank.forEach(q => {
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
console.log('✅ banco_preguntas_respuestas.md actualizado');
