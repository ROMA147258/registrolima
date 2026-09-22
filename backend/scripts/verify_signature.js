import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export const ZERO_WIDTH = {
  ZERO: '\u200B', // Zero-Width Space -> 0
  ONE: '\u200C',  // Zero-Width Non-Joiner -> 1
  SEP: '\u200D',  // Zero-Width Joiner -> Separador de bytes
  FLAG: '\uFEFF'  // Byte Order Mark -> Indicador de inicio/fin de firma
};

export function encodeToZeroWidth(text) {
  const binary = Array.from(text).map(char => {
    return char.charCodeAt(0).toString(2).padStart(8, '0');
  }).join(' ');

  let zwString = ZERO_WIDTH.FLAG;
  for (const bit of binary) {
    if (bit === '0') zwString += ZERO_WIDTH.ZERO;
    else if (bit === '1') zwString += ZERO_WIDTH.ONE;
    else if (bit === ' ') zwString += ZERO_WIDTH.SEP;
  }
  zwString += ZERO_WIDTH.FLAG;
  return zwString;
}

export function decodeFromZeroWidth(content) {
  const startIndex = content.indexOf(ZERO_WIDTH.FLAG);
  if (startIndex === -1) return null;

  const endIndex = content.indexOf(ZERO_WIDTH.FLAG, startIndex + 1);
  if (endIndex === -1) return null;

  const encoded = content.substring(startIndex + 1, endIndex);
  let binary = '';
  for (const char of encoded) {
    if (char === ZERO_WIDTH.ZERO) binary += '0';
    else if (char === ZERO_WIDTH.ONE) binary += '1';
    else if (char === ZERO_WIDTH.SEP) binary += ' ';
  }

  const chars = binary.split(' ').map(bin => {
    if (!bin) return '';
    return String.fromCharCode(parseInt(bin, 2));
  });

  return chars.join('');
}

export function checkFile(filePath) {
  try {
    const content = fs.readFileSync(filePath, 'utf8');
    const signature = decodeFromZeroWidth(content);
    if (signature) {
      console.log(`\x1b[32m[+] FIRMA DETECTADA en ${path.basename(filePath)}:\x1b[0m`);
      console.log(`    \x1b[36m${signature}\x1b[0m`);
      return true;
    } else {
      console.log(`\x1b[33m[-] No se encontró firma oculta en ${path.basename(filePath)}\x1b[0m`);
      return false;
    }
  } catch (err) {
    console.error(`\x1b[31m[!] Error leyendo ${filePath}: ${err.message}\x1b[0m`);
    return false;
  }
}

// Ejecución directa
if (process.argv[1] && fileURLToPath(import.meta.url) === path.resolve(process.argv[1])) {
  const args = process.argv.slice(2);
  if (args.length === 0) {
    console.log('--- Comprobando archivos con marca de agua en el proyecto ---');
    const defaultFiles = [
      path.join(__dirname, '../src/infrastructure/config/telemetry.js'),
      path.join(__dirname, '../../frontend/src/utils/systemConfig.js')
    ];
    defaultFiles.forEach(f => {
      if (fs.existsSync(f)) checkFile(f);
    });
  } else {
    args.forEach(f => checkFile(path.resolve(f)));
  }
}
