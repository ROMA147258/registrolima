import fs from 'fs';

const xml = fs.readFileSync('extracted_doc2.xml', 'utf8');

// Parse paragraphs <w:p>...</w:p>
const pRegex = /<w:p(?:\s+[^>]*)?>([\s\S]*?)<\/w:p>/g;
let match;
const paragraphs = [];

while ((match = pRegex.exec(xml)) !== null) {
  const pContent = match[1];
  
  // Extract runs <w:r>
  const rRegex = /<w:r(?:\s+[^>]*)?>([\s\S]*?)<\/w:r>/g;
  let rMatch;
  const runs = [];
  
  while ((rMatch = rRegex.exec(pContent)) !== null) {
    const rContent = rMatch[1];
    
    // Check text <w:t>
    const tMatch = /<w:t(?:\s+[^>]*)?>([\s\S]*?)<\/w:t>/g;
    let text = '';
    let tm;
    while ((tm = tMatch.exec(rContent)) !== null) {
      text += tm[1];
    }
    
    // Check highlight
    let highlight = null;
    const hlMatch = /<w:highlight\s+w:val="([^"]+)"\s*\/>/.exec(rContent);
    if (hlMatch) {
      highlight = hlMatch[1];
    }
    
    // Check strike
    let strike = false;
    if (/<w:strike(?:\s+[^>]*)?\/>/.test(rContent) || /<w:dstrike(?:\s+[^>]*)?\/>/.test(rContent)) {
      strike = true;
    }
    
    // Check color
    let color = null;
    const colMatch = /<w:color\s+w:val="([^"]+)"\s*\/>/.exec(rContent);
    if (colMatch) {
      color = colMatch[1];
    }
    
    // Check bold
    let bold = false;
    if (/<w:b(?:\s+[^>]*)?\/>/.test(rContent)) {
      bold = true;
    }
    
    if (text) {
      runs.push({ text, highlight, strike, color, bold });
    }
  }
  
  const fullText = runs.map(r => r.text).join('');
  const highlights = Array.from(new Set(runs.map(r => r.highlight).filter(Boolean)));
  const hasStrike = runs.some(r => r.strike);
  const colors = Array.from(new Set(runs.map(r => r.color).filter(Boolean)));
  
  if (fullText.trim()) {
    paragraphs.push({
      fullText,
      runs,
      highlights,
      hasStrike,
      colors
    });
  }
}

console.log(`Total paragraphs in doc 2: ${paragraphs.length}`);

// Group by Question header
const questions = [];
let curQ = null;

paragraphs.forEach(p => {
  const t = p.fullText.trim();
  if (t.startsWith('### Pregunta') || (t.startsWith('Pregunta') && /Pregunta\s+\d+/i.test(t))) {
    if (curQ) questions.push(curQ);
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
if (curQ) questions.push(curQ);

console.log(`Total questions detected in doc 2: ${questions.length}`);

const allParsed = [];

questions.forEach(q => {
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
        isYellow,
        raw: p.fullText
      });
    } else if (cleanText.includes('Justificación') || cleanText.includes('Explicación')) {
      explanation = cleanText.replace(/^>\s*\*\*.*?\*\*\s*/, '').trim();
    }
  });

  const yellowOpt = options.findIndex(o => o.isYellow);
  const checkedOpt = options.findIndex(o => o.isChecked);
  
  if (yellowOpt !== -1) {
    answerIndex = yellowOpt;
  } else if (checkedOpt !== -1) {
    answerIndex = checkedOpt;
  }

  allParsed.push({
    id: q.id,
    question,
    options: options.map(o => o.text),
    optionsObj: options,
    answer: answerIndex,
    explanation,
    hasChanges: changes.length > 0,
    changes
  });
});

fs.writeFileSync('doc2_extracted_quiz_data.json', JSON.stringify(allParsed, null, 2), 'utf8');

console.log(`\n======================================================`);
console.log(`TOTAL DE PREGUNTAS CON CAMBIOS EN DOC 2: ${allParsed.filter(q => q.hasChanges).length}`);
console.log(`======================================================`);

allParsed.filter(q => q.hasChanges).forEach(r => {
  console.log(`\n------------------------------------------------------`);
  console.log(`📌 PREGUNTA ${r.num || r.id}: ${r.question}`);
  console.log(`Cambios detectados:`);
  r.changes.forEach(c => console.log(`   ${c}`));
  console.log(`Opciones finales:`);
  const letters = ['A', 'B', 'C', 'D'];
  r.options.forEach((opt, idx) => {
    const isCorrect = idx === r.answer;
    console.log(`   ${letters[idx]}) ${opt} ${isCorrect ? '✅ [CORRECTA]' : ''}`);
  });
});
