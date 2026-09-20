import fs from 'fs';

const paragraphs = JSON.parse(fs.readFileSync('parsed_docx_paragraphs.json', 'utf8'));

// Group by Question header
const questions = [];
let curQ = null;

for (let i = 0; i < paragraphs.length; i++) {
  const p = paragraphs[i];
  const t = p.fullText.trim();
  
  if (t.startsWith('### Pregunta') || (t.startsWith('Pregunta') && /Pregunta\s+\d+/i.test(t))) {
    if (curQ) questions.push(curQ);
    const num = parseInt(t.match(/\d+/)[0], 10);
    curQ = {
      num,
      header: t,
      paragraphs: []
    };
  } else if (curQ) {
    curQ.paragraphs.push(p);
  }
}
if (curQ) questions.push(curQ);

console.log(`Total questions detected in Word document: ${questions.length}`);

const report = [];

questions.forEach(q => {
  let questionText = '';
  let options = [];
  let explanation = '';
  let correctOptIndex = 0;
  let hasYellow = false;
  let hasGreen = false;
  let hasRedOrStrike = false;
  let changesList = [];

  q.paragraphs.forEach(p => {
    // Check highlights / strikes in runs
    p.runs.forEach(r => {
      if (r.highlight === 'yellow') {
        hasYellow = true;
        changesList.push(`[AMARILLO (Nueva respuesta)] "${r.text}"`);
      }
      if (r.highlight === 'green' || r.highlight === 'lightGreen') {
        hasGreen = true;
        changesList.push(`[VERDE (Modificación de texto)] "${r.text}"`);
      }
      if (r.highlight === 'red' || r.highlight === 'darkRed' || r.strike) {
        hasRedOrStrike = true;
        changesList.push(`[ROJO/TACHADO (Eliminar)] "${r.text}"`);
      }
    });

    // Clean text by ignoring strike runs
    const cleanRuns = p.runs.filter(r => !r.strike);
    const textWithoutStrike = cleanRuns.map(r => r.text).join('').trim();
    
    if (!questionText && (p.fullText.includes('¿') || (p.fullText.startsWith('**') && p.fullText.includes('?')))) {
      questionText = textWithoutStrike.replace(/^\*\*|\*\*$/g, '').trim();
    } else if (/^-\s*\[([ xX])\]/.test(p.fullText)) {
      const isChecked = /^-\s*\[[xX]\]/.test(p.fullText);
      const isYellowOpt = p.runs.some(r => r.highlight === 'yellow');
      
      // Clean option text
      let optClean = textWithoutStrike
        .replace(/^-\s*\[([ xX])\]\s*/, '')
        .replace(/\*\(Correcta\)\*\s*$/i, '')
        .replace(/^\*\*([A-D]\))\s*/, '')
        .replace(/^\*\*|\*\*$/g, '')
        .trim();
        
      // Remove leading letter like "A) " if present
      optClean = optClean.replace(/^[A-D]\)\s*/, '').trim();

      options.push({
        raw: p.fullText,
        text: optClean,
        isChecked,
        isYellow: isYellowOpt
      });
    } else if (p.fullText.includes('Justificación') || p.fullText.includes('Explicación')) {
      explanation = textWithoutStrike.replace(/^>\s*\*\*.*?\*\*\s*/, '').trim();
    }
  });

  // Determine correct answer:
  // If an option has yellow highlight, that's the new correct answer!
  // Otherwise, option that is checked with [x]
  let yellowIdx = options.findIndex(o => o.isYellow);
  let checkedIdx = options.findIndex(o => o.isChecked);
  
  if (yellowIdx !== -1) {
    correctOptIndex = yellowIdx;
  } else if (checkedIdx !== -1) {
    correctOptIndex = checkedIdx;
  }

  if (hasYellow || hasGreen || hasRedOrStrike) {
    report.push({
      num: q.num,
      questionText,
      options: options.map(o => o.text),
      correctOptIndex,
      explanation,
      changesList,
      optionsRaw: options
    });
  }
});

console.log(`\n======================================================`);
console.log(`TOTAL DE PREGUNTAS CON CAMBIOS (AMARILLO / VERDE / ROJO / TACHADO): ${report.length}`);
console.log(`======================================================`);

report.forEach(r => {
  console.log(`\n------------------------------------------------------`);
  console.log(`📌 PREGUNTA ${r.num}: ${r.questionText}`);
  console.log(`Cambios detectados:`);
  r.changesList.forEach(c => console.log(`   ${c}`));
  console.log(`Opciones finales:`);
  const letters = ['A', 'B', 'C', 'D'];
  r.options.forEach((opt, idx) => {
    const isCorrect = idx === r.correctOptIndex;
    console.log(`   ${letters[idx]}) ${opt} ${isCorrect ? '✅ [CORRECTA]' : ''}`);
  });
});

fs.writeFileSync('detailed_report.json', JSON.stringify(report, null, 2), 'utf8');
