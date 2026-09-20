import fs from 'fs';

const paragraphs = JSON.parse(fs.readFileSync('parsed_docx_paragraphs.json', 'utf8'));

// Parse all 100 questions cleanly from docx
const allQuestions = [];
let curQ = null;

paragraphs.forEach((p, idx) => {
  const t = p.fullText.trim();
  if (t.startsWith('### Pregunta') || (t.startsWith('Pregunta') && /Pregunta\s+\d+/i.test(t))) {
    if (curQ) allQuestions.push(curQ);
    const num = parseInt(t.match(/\d+/)[0], 10);
    curQ = {
      id: num,
      header: t,
      pList: []
    };
  } else if (curQ) {
    curQ.pList.push(p);
  }
});
if (curQ) allQuestions.push(curQ);

console.log(`Total questions in docx: ${allQuestions.length}`);

// For each question, extract cleanQuestion, cleanOptions, answerIndex, cleanExplanation, and changes
const resultBank = [];

allQuestions.forEach(q => {
  let question = '';
  const options = [];
  let explanation = '';
  let answerIndex = 0;
  const changes = [];

  q.pList.forEach(p => {
    // Detect changes
    p.runs.forEach(r => {
      if (r.highlight === 'yellow') changes.push(`[YELLOW/RESPUESTA]: "${r.text}"`);
      if (r.highlight === 'green' || r.highlight === 'lightGreen') changes.push(`[GREEN/TEXTO]: "${r.text}"`);
      if (r.highlight === 'red' || r.highlight === 'darkRed' || r.strike) changes.push(`[RED/TACHADO]: "${r.text}"`);
    });

    // Clean text by ignoring struck runs
    const cleanRuns = p.runs.filter(r => !r.strike);
    let cleanText = cleanRuns.map(r => r.text).join('').trim();

    if (!question && (cleanText.includes('¿') || (cleanText.startsWith('**') && cleanText.includes('?')))) {
      question = cleanText.replace(/^\*\*|\*\*$/g, '').trim();
    } else if (/^-\s*\[([ xX])\]/.test(p.fullText)) {
      const isChecked = /^-\s*\[[xX]\]/.test(p.fullText);
      const isYellow = p.runs.some(r => r.highlight === 'yellow');

      let opt = cleanText
        .replace(/^-\s*\[([ xX])\]\s*/, '')
        .replace(/\*\(Correcta\)\*\s*$/i, '')
        .replace(/^\*\*([A-D]\))\s*/, '')
        .replace(/^\*\*|\*\*$/g, '')
        .trim();

      opt = opt.replace(/^[A-D]\)\s*/, '').replace(/\*\(Correcta\)\*$/i, '').trim();

      options.push({
        text: opt,
        isChecked,
        isYellow
      });
    } else if (cleanText.includes('Justificación') || cleanText.includes('Explicación')) {
      explanation = cleanText.replace(/^>\s*\*\*.*?\*\*\s*/, '').trim();
    }
  });

  // Determine answer index:
  // 1. If any option is marked yellow: that option becomes the correct answer!
  // 2. If no option is yellow, the one checked in doc is correct (usually 0/A)
  const yellowOpt = options.findIndex(o => o.isYellow);
  const checkedOpt = options.findIndex(o => o.isChecked);
  
  if (yellowOpt !== -1) {
    answerIndex = yellowOpt;
  } else if (checkedOpt !== -1) {
    answerIndex = checkedOpt;
  }

  resultBank.push({
    id: q.id,
    question,
    options: options.map(o => o.text),
    answer: answerIndex,
    explanation,
    hasChanges: changes.length > 0,
    changes
  });
});

fs.writeFileSync('full_extracted_quiz_data.json', JSON.stringify(resultBank, null, 2), 'utf8');

console.log('--- RESUMEN DE TODAS LAS PREGUNTAS CON CAMBIOS ---');
resultBank.filter(r => r.hasChanges).forEach(r => {
  console.log(`\n[Q${r.id}] ${r.question}`);
  r.changes.forEach(c => console.log(`   ${c}`));
  console.log(`   👉 Respuesta correcta seleccionada: Opción ${['A','B','C','D'][r.answer]} (${r.options[r.answer]})`);
});
