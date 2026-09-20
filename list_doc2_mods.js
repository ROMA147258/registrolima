import fs from 'fs';

const doc2Data = JSON.parse(fs.readFileSync('doc2_extracted_quiz_data.json', 'utf8'));

console.log('=== TODAS LAS PREGUNTAS MODIFICADAS EN DOC 2 (HASTA LA 85 Y HASTA LA 100) ===');

const modifiedList = doc2Data.filter(q => q.hasChanges);
console.log(`Total modificadas: ${modifiedList.length}`);

modifiedList.forEach(q => {
  console.log(`\n-----------------------------------------------------------`);
  console.log(`Pregunta ${q.id}: ${q.question}`);
  console.log('Cambios detectados en doc 2:');
  q.changes.forEach(c => console.log(`   ${c}`));
  console.log('Opciones finales:');
  const letters = ['A','B','C','D'];
  q.options.forEach((opt, idx) => {
    console.log(`   ${letters[idx]}) ${opt} ${idx === q.answer ? '⭐ [RESPUESTA CORRECTA]' : ''}`);
  });
});
