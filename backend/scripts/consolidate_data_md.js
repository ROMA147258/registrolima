import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
const dataMdPath = path.join(rootDir, 'data.md');

// Read raw data.md
const dataMdContent = fs.readFileSync(dataMdPath, 'utf8');
const lines = dataMdContent.split(/\r?\n/).filter(l => l.trim().length > 0);

const header = lines[0];
const localesMap = new Map(); // key -> full item

const normalize = (s) => (s || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Z0-9]/g, ' ').replace(/\s+/g, ' ').trim();

let globalCounter = 0;

for (let i = 1; i < lines.length; i++) {
  const line = lines[i].trim();
  if (line.startsWith('---') || line.startsWith('NOMBRE DEL LOCAL') || (line.includes('VILLA MARIA DEL TRIUNFO') && !line.includes('\t'))) {
    continue;
  }

  const parts = lines[i].split('\t');
  if (parts.length >= 8) {
    const id = parseInt(parts[0], 10);
    const ubigeo = parts[1]?.trim() || '';
    const dpto = parts[2]?.trim() || 'LIMA';
    const prov = parts[3]?.trim() || 'LIMA';
    const dist = parts[4]?.trim() || '';
    const nombre = parts[5]?.trim() || '';
    const dir = parts[6]?.trim() || '';
    const mesas = parseInt(parts[7], 10) || 0;

    const key = `${dist.toUpperCase()}__${normalize(nombre)}`;
    if (!localesMap.has(key)) {
      localesMap.set(key, { ubigeo, dpto, provincia: prov, distrito: dist, nombre, direccion: dir, mesas });
    }
  } else if (parts.length >= 2) {
    // 2 or 3 parts (added VMT row)
    const nombre = parts[0]?.trim() || '';
    let dir = '';
    let mesas = 0;
    if (parts.length === 2) {
      mesas = parseInt(parts[1], 10) || 0;
    } else {
      dir = parts[1]?.trim() || '';
      mesas = parseInt(parts[2], 10) || 0;
    }

    const dist = 'VILLA MARIA DEL TRIUNFO';
    const key = `${dist}__${normalize(nombre)}`;
    if (!localesMap.has(key)) {
      localesMap.set(key, {
        ubigeo: '140132',
        dpto: 'LIMA',
        provincia: 'LIMA',
        distrito: dist,
        nombre,
        direccion: dir,
        mesas
      });
      console.log(`➕ Agregado nuevo local detectado: ${nombre} (${mesas} mesas)`);
    }
  }
}

const allItems = Array.from(localesMap.values());
console.log(`Total locales únicos consolidados: ${allItems.length}`);

// Group and sort nicely (keep order, assign continuous IDs starting from 5433)
let startId = 5433;
const finalRows = [header];
const finalCatalog = [];

allItems.forEach((item, idx) => {
  const currentId = startId + idx;
  const row = `${currentId}\t${item.ubigeo}\t${item.dpto}\t${item.provincia}\t${item.distrito}\t${item.nombre}\t${item.direccion}\t${item.mesas}`;
  finalRows.push(row);
  finalCatalog.push({
    id: currentId,
    ubigeo: item.ubigeo,
    departamento: item.dpto,
    provincia: item.provincia,
    distrito: item.distrito,
    nombre: item.nombre,
    direccion: item.direccion,
    mesas: item.mesas,
    electores: item.mesas * 300
  });
});

// 1. Write clean data.md
fs.writeFileSync(dataMdPath, finalRows.join('\n') + '\n', 'utf8');
console.log(`✅ data.md guardado limpiamente sin duplicados (${finalRows.length} líneas)`);

// 2. Write localesUnificados.json
const unificadosJsonPath = path.join(rootDir, 'backend/src/data/localesUnificados.json');
const unificadosList = finalCatalog.map(l => ({
  ubigeo: l.ubigeo,
  dpto: l.departamento,
  provincia: l.provincia,
  distrito: l.distrito,
  colegio: l.nombre,
  direccion: l.direccion,
  mesas: l.mesas
}));
fs.writeFileSync(unificadosJsonPath, JSON.stringify(unificadosList, null, 2), 'utf8');
console.log(`✅ localesUnificados.json guardado (${unificadosList.length} locales)`);

// 3. Write localesData.json
const localesDataJsonPath = path.join(rootDir, 'backend/src/data/localesData.json');
const localesData = {};
finalCatalog.forEach(l => {
  const d = l.distrito.toUpperCase().trim();
  if (!localesData[d]) localesData[d] = [];
  localesData[d].push(l.nombre);
});
fs.writeFileSync(localesDataJsonPath, JSON.stringify(localesData, null, 2), 'utf8');
console.log(`✅ localesData.json guardado (${Object.keys(localesData).length} distritos, ${localesData['VILLA MARIA DEL TRIUNFO'].length} locales en VMT)`);

// 4. Calculate Mesas Metas
const distritoMetas = {};
const localMetas = {};
let totalMesasLima = 0;

finalCatalog.forEach(l => {
  const d = l.distrito.toUpperCase().trim();
  distritoMetas[d] = (distritoMetas[d] || 0) + l.mesas;
  localMetas[l.nombre] = l.mesas;
  const cleanKey = l.nombre.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (cleanKey) localMetas[cleanKey] = l.mesas;
  totalMesasLima += l.mesas;
});

const mesasCatalogObj = {
  totalMesasLima,
  provinciaMetas: { "LIMA": totalMesasLima },
  distritoMetas,
  localMetas
};

// 5. Write mesasCatalog.json (Backend & Frontend)
fs.writeFileSync(path.join(rootDir, 'backend/src/data/mesasCatalog.json'), JSON.stringify(mesasCatalogObj, null, 2), 'utf8');
fs.writeFileSync(path.join(rootDir, 'frontend/src/constants/mesasCatalog.json'), JSON.stringify(mesasCatalogObj, null, 2), 'utf8');
console.log(`✅ mesasCatalog.json guardado -> Total Lima: ${totalMesasLima} mesas | VMT: ${distritoMetas['VILLA MARIA DEL TRIUNFO']} mesas`);

// 6. Write localesCatalog.js (Backend & Frontend)
const localesCatalogJs = `// Catálogo oficial extraído de data.md\nexport const LOCALES_OFICIALES = ${JSON.stringify(finalCatalog, null, 2)};\n`;
fs.writeFileSync(path.join(rootDir, 'backend/src/constants/localesCatalog.js'), localesCatalogJs, 'utf8');
fs.writeFileSync(path.join(rootDir, 'frontend/src/constants/localesCatalog.js'), localesCatalogJs, 'utf8');
console.log(`✅ localesCatalog.js guardado (Backend & Frontend)`);

// 7. Write backend/src/config/constants.js
const backendConstantsPath = path.join(rootDir, 'backend/src/config/constants.js');
let constantsContent = fs.readFileSync(backendConstantsPath, 'utf8');
constantsContent = constantsContent.replace(/"Villa María del Triunfo":\s*\d+/, `"Villa María del Triunfo": ${distritoMetas['VILLA MARIA DEL TRIUNFO']}`);
fs.writeFileSync(backendConstantsPath, constantsContent, 'utf8');
console.log(`✅ backend constants.js actualizado`);

// 8. Write frontend/src/constants/catalogs.js
const frontendCatalogsPath = path.join(rootDir, 'frontend/src/constants/catalogs.js');
let catalogsContent = fs.readFileSync(frontendCatalogsPath, 'utf8');
catalogsContent = catalogsContent.replace(/"Villa María del Triunfo":\s*\d+/, `"Villa María del Triunfo": ${distritoMetas['VILLA MARIA DEL TRIUNFO']}`);
catalogsContent = catalogsContent.replace(
  /"VILLA MARIA DEL TRIUNFO":\s*\{\s*"locales":\s*\d+,\s*"mesas":\s*\d+,\s*"electores":\s*\d+\s*\}/,
  `"VILLA MARIA DEL TRIUNFO": { "locales": ${localesData['VILLA MARIA DEL TRIUNFO'].length}, "mesas": ${distritoMetas['VILLA MARIA DEL TRIUNFO']}, "electores": ${distritoMetas['VILLA MARIA DEL TRIUNFO'] * 300} }`
);
fs.writeFileSync(frontendCatalogsPath, catalogsContent, 'utf8');
console.log(`✅ frontend catalogs.js actualizado`);

console.log('\n📊 RESUMEN FINAL VILLA MARÍA DEL TRIUNFO:');
console.log(`- Total Locales: ${localesData['VILLA MARIA DEL TRIUNFO'].length} (89 previos + 1 nuevo: IEP PROLOG SEDE JOSE GALVEZ PRIMARIA)`);
console.log(`- Total Mesas en VMT: ${distritoMetas['VILLA MARIA DEL TRIUNFO']} mesas`);
console.log(`- Total Mesas en Lima Metropolitana: ${totalMesasLima} mesas`);
