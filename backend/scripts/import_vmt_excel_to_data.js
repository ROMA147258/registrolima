import xlsx from 'xlsx';
import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');

const excelPath = path.join(rootDir, 'LOCALES Y MESAS VILLA MARIA DEL TRIUNFO.xlsx');
const dataMdPath = path.join(rootDir, 'data.md');

console.log('📂 Leyendo archivo Excel:', excelPath);
const wb = xlsx.readFile(excelPath);
const rows = xlsx.utils.sheet_to_json(wb.Sheets[wb.SheetNames[0]]);
console.log(`✅ ${rows.length} filas leídas del Excel.`);

// Agrupar por local de votación
const vmtLocalesMap = new Map();
const vmtMesaToLocalMap = {};

rows.forEach((r, idx) => {
  const local = (r.LOCALES || '').trim();
  const dir = (r.DIRECCIONES || '').trim();
  const mesa = String(r.MESAS || '').trim();
  const elec = Number(r.ELECTORES || 300);

  if (!local) return;

  if (!vmtLocalesMap.has(local)) {
    vmtLocalesMap.set(local, {
      nombre: local,
      direccion: dir,
      mesas: [],
      electores: 0
    });
  }

  const entry = vmtLocalesMap.get(local);
  if (dir && !entry.direccion) entry.direccion = dir;
  if (mesa) {
    entry.mesas.push(mesa);
    vmtMesaToLocalMap[mesa] = {
      local,
      direccion: dir || entry.direccion,
      electores: elec,
      distrito: 'VILLA MARIA DEL TRIUNFO'
    };
  }
  entry.electores += elec;
});

console.log(`🏫 Total de Locales en Villa María del Triunfo: ${vmtLocalesMap.size}`);
let totalMesasVmt = 0;
vmtLocalesMap.forEach(l => totalMesasVmt += l.mesas.length);
console.log(`🗳️ Total de Mesas individuales en Villa María del Triunfo: ${totalMesasVmt}`);

// 1. Actualizar data.md
console.log('📄 Procesando data.md...');
const dataMdContent = fs.readFileSync(dataMdPath, 'utf8');
const lines = dataMdContent.split(/\r?\n/);

const headerLine = lines[0].startsWith('N°') ? lines[0] : 'N°\tUBIGEO\tDPTO\tPROVINCIA\tDISTRITO\tNOMBRE DEL LOCAL\tDIRECCIÓN DEL LOCAL\tMESAS';
const cleanLines = [];

for (let i = 0; i < lines.length; i++) {
  const line = lines[i];
  if (!line.trim()) continue;
  if (i === 0 && line.startsWith('N°')) continue;

  const parts = line.split('\t');
  const dist = (parts[4] || '').toUpperCase().trim();
  
  // Omitir líneas previas corruptas o incompletas de VMT
  if (dist.includes('VILLA MARIA DEL TRIUNFO') || dist.includes('TRIUNFO')) {
    continue;
  }
  cleanLines.push(line);
}

// Obtener el último número de correlativo
let maxId = 0;
cleanLines.forEach(l => {
  const p = l.split('\t');
  const num = parseInt(p[0], 10);
  if (!isNaN(num) && num > maxId) maxId = num;
});
if (maxId === 0) maxId = 7000;

// Agregar todos los 86 locales oficiales de Villa María del Triunfo a data.md
let curId = maxId + 1;
const vmtMdLines = [];

Array.from(vmtLocalesMap.values()).sort((a, b) => a.nombre.localeCompare(b.nombre)).forEach(l => {
  const ubigeo = '140132'; // Ubigeo oficial electoral de VMT
  const dpto = 'LIMA';
  const prov = 'LIMA';
  const dist = 'VILLA MARIA DEL TRIUNFO';
  const nom = l.nombre;
  const dir = l.direccion;
  const mesasCount = l.mesas.length; // Cantidad de mesas individuales
  
  const line = `${curId++}\t${ubigeo}\t${dpto}\t${prov}\t${dist}\t${nom}\t${dir}\t${mesasCount}`;
  vmtMdLines.push(line);
});

const finalDataMdLines = [headerLine, ...cleanLines, ...vmtMdLines];
fs.writeFileSync(dataMdPath, finalDataMdLines.join('\n') + '\n', 'utf8');
console.log(`✅ data.md actualizado correctamente con ${vmtLocalesMap.size} locales de VMT (${finalDataMdLines.length} líneas en total).`);

// 2. Guardar catálogo detallado de VMT con array de mesas individuales
const vmtDetailedData = {
  distrito: 'VILLA MARIA DEL TRIUNFO',
  totalLocales: vmtLocalesMap.size,
  totalMesas: totalMesasVmt,
  totalElectores: totalMesasVmt * 300,
  locales: Array.from(vmtLocalesMap.values()).map((l, idx) => ({
    id: idx + 1,
    nombre: l.nombre,
    direccion: l.direccion,
    mesasCount: l.mesas.length,
    mesas: l.mesas, // Números reales de mesa e.g. ["051664", "051665", ...]
    electores: l.electores
  })),
  mesaToLocal: vmtMesaToLocalMap
};

// Guardar en backend y frontend
const vmtJsContent = `// Catálogo detallado de Locales y Mesas Oficiales de Villa María del Triunfo
// Extraído de LOCALES Y MESAS VILLA MARIA DEL TRIUNFO.xlsx
export const VMT_LOCALES_Y_MESAS = ${JSON.stringify(vmtDetailedData, null, 2)};
`;

fs.writeFileSync(path.join(rootDir, 'backend/src/constants/vmtLocalesYMesas.js'), vmtJsContent, 'utf8');
fs.writeFileSync(path.join(rootDir, 'frontend/src/constants/vmtLocalesYMesas.js'), vmtJsContent, 'utf8');
console.log('✅ vmtLocalesYMesas.js guardado en Backend y Frontend con todas las mesas individuales.');

// 3. Ejecutar consolidate_data_md.js para regenerar localesCatalog.js y mesasCatalog.json
console.log('🔄 Ejecutando consolidación global de data.md y localesCatalog...');
