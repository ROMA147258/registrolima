import fs from 'fs';

const paragraphs = JSON.parse(fs.readFileSync('parsed_docx_paragraphs.json', 'utf8'));

// Reconstruct questions
// Each question typically starts with ### Pregunta N
const questions = [];
let curQ = null;

paragraphs.forEach((p, pIdx) => {
  const rawText = p.fullText.trim();
  
  // Clean text by removing struck text
  const cleanRuns = p.runs.filter(r => !r.strike);
  const cleanText = cleanRuns.map(r => r.text).join('').trim();
  
  // Struck text
  const struckRuns = p.runs.filter(r => r.strike);
  const struckText = struckRuns.map(r => r.text).join('').trim();
  
  // Highlights
  const hasYellow = p.runs.some(r => r.highlight === 'yellow');
  const hasGreen = p.runs.some(r => r.highlight === 'green' || r.highlight === 'lightGreen');
  const hasRed = p.runs.some(r => r.highlight === 'red' || r.highlight === 'darkRed');
  
  const isQHeader = rawText.startsWith('### Pregunta') || (rawText.startsWith('Pregunta') && /Pregunta\s+\d+/.test(rawText));
  
  if (isQHeader) {
    if (curQ) questions.push(curQ);
    const num = parseInt(rawText.match(/\d+/)[0], 10);
    curQ = {
      id: num,
      rawHeader: rawText,
      question: '',
      options: [],
      hasModifications: false,
      modDetails: [],
      answer: 0,
      explanation: ''
    };
    return;
  }
  
  if (!curQ) return;
  
  if (hasYellow || hasGreen || hasRed || struckText) {
    curQ.hasModifications = true;
    curQ.modDetails.push({
      pIdx,
      rawText,
      cleanText,
      struckText,
      hasYellow,
      hasGreen,
      hasRed
    });
  }
  
  // Check if line is Question body (starts with **¿ or ** and ends with ?**)
  if (!curQ.question && (rawText.includes('¿') || (rawText.startsWith('**') && rawText.includes('?')))) {
    curQ.question = cleanText.replace(/^\*\*|\*\*$/g, '').trim();
    curQ.rawQuestion = rawText;
    return;
  }
  
  // Check if option (starts with - [x] or - [ ])
  if (/^-\s*\[([ xX])\]/.test(rawText)) {
    const isCheckedInDoc = /^-\s*\[[xX]\]/.test(rawText);
    const isYellow = hasYellow;
    // Extract letter & text
    // Example: - [x] **A) ...** *(Correcta)*
    let optText = cleanText
      .replace(/^-\s*\[([ xX])\]\s*/, '')
      .replace(/\*\(Correcta\)\*\s*$/i, '')
      .replace(/^\*\*([A-D]\))\s*/, '$1 ')
      .replace(/\*\*$/, '')
      .trim();
      
    curQ.options.push({
      raw: rawText,
      clean: optText,
      isCheckedInDoc,
      isYellow,
      hasGreen,
      struckText
    });
    return;
  }
  
  // Check if explanation (starts with > **💡 Justificación)
  if (rawText.includes('Justificación') || rawText.includes('Explicación')) {
    curQ.explanation = cleanText.replace(/^>\s*\*\*.*?\*\*\s*/, '').trim();
    return;
  }
});

if (curQ) questions.push(curQ);

console.log(`Total questions parsed: ${questions.length}`);
const modifiedQuestions = questions.filter(q => q.hasModifications);
console.log(`Total questions with modifications (Yellow/Green/Red/Strike): ${modifiedQuestions.length}`);

fs.writeFileSync('parsed_modifications.json', JSON.stringify(modifiedQuestions, null, 2), 'utf8');

// Print all modified questions
modifiedQuestions.forEach(q => {
  console.log(`\n======================================================`);
  console.log(`PREGUNTA ${q.id}: ${q.question || q.rawQuestion}`);
  console.log(`Detalles de cambios detectados:`);
  q.modDetails.forEach(m => {
    console.log(`  - Párrafo original: "${m.rawText}"`);
    if (m.struckText) console.log(`    ❌ TACHADO/ELIMINAR (Rojo): "${m.struckText}"`);
    if (m.hasYellow) console.log(`    🟡 AMARILLO (Cambiar opción de respuesta correcta)`);
    if (m.hasGreen) console.log(`    🟢 VERDE (Texto nuevo/editado): "${m.cleanText}"`);
  });
  console.log(`Opciones reconstruidas:`);
  q.options.forEach((opt, idx) => {
    const mark = opt.isYellow ? '[🟡 MARCADO AMARILLO - NUEVA RESPUESTA]' : (opt.isCheckedInDoc ? '[CORRECTA ORIGINAL]' : '[ ]');
    console.log(`   ${mark} ${opt.clean}`);
  });
});
