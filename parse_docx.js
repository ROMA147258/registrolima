import fs from 'fs';

const xml = fs.readFileSync('extracted_doc.xml', 'utf8');

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

console.log(`Total text paragraphs: ${paragraphs.length}`);

// Write JSON of parsed paragraphs for detailed analysis
fs.writeFileSync('parsed_docx_paragraphs.json', JSON.stringify(paragraphs, null, 2), 'utf8');

// Filter those with highlights, strike, or colors
const highlighted = paragraphs.filter(p => p.highlights.length > 0 || p.hasStrike || p.colors.length > 0);
console.log(`Paragraphs with formatting/highlights/strike: ${highlighted.length}`);

highlighted.forEach((p, i) => {
  console.log(`--- [${i+1}] HL: ${p.highlights.join(',')} | Strike: ${p.hasStrike} | Colors: ${p.colors.join(',')} ---`);
  p.runs.forEach(r => {
    let tag = '';
    if (r.highlight) tag += `[HL:${r.highlight}] `;
    if (r.strike) tag += `[STRIKE] `;
    if (r.color) tag += `[COLOR:${r.color}] `;
    console.log(`  ${tag}${r.text}`);
  });
});
