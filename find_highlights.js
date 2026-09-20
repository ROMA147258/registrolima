import fs from 'fs';

const paragraphs = JSON.parse(fs.readFileSync('parsed_docx_paragraphs.json', 'utf8'));

console.log('--- BUSCANDO RESALTADOS ESPECÍFICOS: YELLOW, GREEN, RED, STRIKE ---');

let currentPregunta = '';
let currentNum = 0;

paragraphs.forEach((p, idx) => {
  const text = p.fullText.trim();
  if (text.startsWith('### Pregunta') || text.startsWith('Pregunta')) {
    currentPregunta = text;
    const numMatch = text.match(/\d+/);
    currentNum = numMatch ? parseInt(numMatch[0], 10) : 0;
  }

  // Check if any run in this paragraph has yellow, green, red highlight or strike
  const hasYellow = p.runs.some(r => r.highlight === 'yellow');
  const hasGreen = p.runs.some(r => r.highlight === 'green' || r.highlight === 'lightGreen');
  const hasRed = p.runs.some(r => r.highlight === 'red' || r.highlight === 'darkRed');
  const hasStrike = p.runs.some(r => r.strike);
  const otherHl = p.runs.map(r => r.highlight).filter(h => h && !['yellow','green','lightGreen','red','darkRed'].includes(h));

  if (hasYellow || hasGreen || hasRed || hasStrike || otherHl.length > 0) {
    console.log(`\n======================================================`);
    console.log(`📍 ENCONTRADO EN: ${currentPregunta} (Párrafo index ${idx})`);
    console.log(`Texto completo: ${text}`);
    console.log(`Marcas: Yellow: ${hasYellow}, Green: ${hasGreen}, Red: ${hasRed}, Strike: ${hasStrike}, Otros: ${otherHl.join(',')}`);
    console.log('Detalle de runs:');
    p.runs.forEach(r => {
      let mark = [];
      if (r.highlight) mark.push(`HL:${r.highlight}`);
      if (r.strike) mark.push('STRIKE');
      if (r.color) mark.push(`COL:${r.color}`);
      if (r.bold) mark.push('BOLD');
      console.log(`   [${mark.join('|')}] "${r.text}"`);
    });
  }
});
