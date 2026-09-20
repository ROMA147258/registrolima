import fs from 'fs';

const doc2Data = JSON.parse(fs.readFileSync('doc2_extracted_quiz_data.json', 'utf8'));

const cleanedBank = doc2Data.map(q => {
  // Clean question text
  let question = q.question
    .replace(/\*\*+/g, '')
    .replace(/^[#\s]+/, '')
    .replace(/\s+/g, ' ')
    .trim();
  
  // Clean options
  let options = q.options.map(opt => {
    return opt
      .replace(/\*\*+/g, '')
      .replace(/^\s*[A-D]\)\s*/, '')
      .replace(/\*\(Correcta\)\*\s*$/i, '')
      .replace(/\(Correcta\)\*?\s*$/i, '')
      .replace(/Correcta\)\*?\s*$/i, '')
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

  if (!explanation) {
    explanation = `Respuesta oficial conforme a la Cartilla del Personero de Mesa de la ONPE.`;
  }

  return {
    id: q.id,
    question,
    options,
    answer: q.answer,
    explanation,
    hasChanges: q.hasChanges,
    changes: q.changes
  };
});

fs.writeFileSync('clean_doc2_bank.json', JSON.stringify(cleanedBank, null, 2), 'utf8');

console.log('--- REVISIÓN DETALLADA DE TODAS LAS 40 PREGUNTAS MODIFICADAS ---');
cleanedBank.filter(q => q.hasChanges).forEach(q => {
  console.log(`\n============================================================`);
  console.log(`[Pregunta ${q.id}] ${q.question}`);
  const letters = ['A','B','C','D'];
  q.options.forEach((opt, idx) => {
    const isAns = idx === q.answer;
    console.log(`  ${letters[idx]}) ${opt} ${isAns ? '⭐ [RESPUESTA CORRECTA]' : ''}`);
  });
  console.log(`  💡 Justificación: ${q.explanation}`);
});
