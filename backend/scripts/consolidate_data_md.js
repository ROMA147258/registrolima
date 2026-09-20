import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbPool } from '../src/infrastructure/database/ConnectionPool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const rootDir = path.resolve(__dirname, '../../');
const dataMdPath = path.join(rootDir, 'data.md');

// Read raw data.md
const dataMdContent = fs.readFileSync(dataMdPath, 'utf8');
const lines = dataMdContent.split(/\r?\n/).filter(l => l.trim().length > 0);

const CALLAO_UBIGEOS = {
  'CALLAO': '070101',
  'BELLAVISTA': '070102',
  'CARMEN DE LA LEGUA - REYNOSO': '070103',
  'CARMEN DE LA LEGUA REYNOSO': '070103',
  'CARMEN DE LA LEGUA': '070103',
  'LA PERLA': '070104',
  'LA PUNTA': '070105',
  'VENTANILLA': '070106',
  'MI PERU': '070107',
  'MI PERÚ': '070107'
};

const normalize = (s) => (s || '').toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').replace(/[^A-Z0-9]/g, ' ').replace(/\s+/g, ' ').trim();

const localesMap = new Map(); // key -> full item

for (let i = 0; i < lines.length; i++) {
  const line = lines[i].trim();
  if (
    line.startsWith('---') ||
    line.startsWith('N°') ||
    line.startsWith('DPTO') ||
    line.startsWith('NOMBRE DEL LOCAL') ||
    (line.includes('VILLA MARIA DEL TRIUNFO') && !line.includes('\t'))
  ) {
    continue;
  }

  const parts = lines[i].split('\t').map(p => p.trim());
  if (parts.length >= 8) {
    // Standard 8 columns: [N°, UBIGEO, DPTO, PROVINCIA, DISTRITO, NOMBRE, DIRECCION, MESAS]
    const id = parseInt(parts[0], 10);
    const ubigeo = parts[1] || '';
    const dpto = parts[2] || 'LIMA';
    const prov = parts[3] || 'LIMA';
    const dist = parts[4] || '';
    const nombre = parts[5] || '';
    const dir = parts[6] || '';
    const mesas = parseInt(parts[7], 10) || 0;

    const key = `${prov.toUpperCase()}__${dist.toUpperCase()}__${normalize(nombre)}`;
    if (!localesMap.has(key)) {
      localesMap.set(key, { ubigeo, dpto, provincia: prov, distrito: dist, nombre, direccion: dir, mesas });
    }
  } else if (parts.length >= 6) {
    // 6 columns (Callao): [DPTO, PROVINCIA, DISTRITO, NOMBRE, DIRECCION, MESAS]
    const dpto = parts[0] || 'CALLAO';
    const prov = parts[1] || 'CALLAO';
    const dist = parts[2] || '';
    const nombre = parts[3] || '';
    const dir = parts[4] || '';
    const mesas = parseInt(parts[5], 10) || 0;

    const distNorm = dist.toUpperCase().normalize('NFD').replace(/[\u0300-\u036f]/g, '').trim();
    let ubigeo = CALLAO_UBIGEOS[dist.toUpperCase()] || CALLAO_UBIGEOS[distNorm] || '070101';

    const key = `${prov.toUpperCase()}__${dist.toUpperCase()}__${normalize(nombre)}`;
    if (!localesMap.has(key)) {
      localesMap.set(key, { ubigeo, dpto, provincia: prov, distrito: dist, nombre, direccion: dir, mesas });
      console.log(`➕ Local Callao/Nuevo agregado: ${dist} - ${nombre} (${mesas} mesas)`);
    }
  } else if (parts.length >= 2) {
    // 2 or 3 parts (custom row)
    const nombre = parts[0] || '';
    let dir = '';
    let mesas = 0;
    if (parts.length === 2) {
      mesas = parseInt(parts[1], 10) || 0;
    } else {
      dir = parts[1] || '';
      mesas = parseInt(parts[2], 10) || 0;
    }

    const dist = 'VILLA MARIA DEL TRIUNFO';
    const key = `LIMA__${dist}__${normalize(nombre)}`;
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
      console.log(`➕ Local VMT agregado: ${nombre} (${mesas} mesas)`);
    }
  }
}

const allItems = Array.from(localesMap.values());
console.log(`Total locales únicos consolidados: ${allItems.length}`);

// Group and sort nicely (keep order, assign continuous IDs starting from 5433)
let startId = 5433;
const header = 'N°\tUBIGEO\tDPTO\tPROVINCIA\tDISTRITO\tNOMBRE DEL LOCAL\tDIRECCIÓN DEL LOCAL\tMESAS';
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
console.log(`✅ localesData.json guardado (${Object.keys(localesData).length} distritos)`);

// 4. Calculate Mesas Metas
const distritoMetas = {};
const provinciaMetas = {};
const localMetas = {};
let totalMesasGlobal = 0;
let totalMesasLima = 0;
let totalMesasCallao = 0;

finalCatalog.forEach(l => {
  const d = l.distrito.trim();
  const prov = (l.provincia || 'LIMA').toUpperCase().trim();
  distritoMetas[d] = (distritoMetas[d] || 0) + l.mesas;
  provinciaMetas[prov] = (provinciaMetas[prov] || 0) + l.mesas;
  localMetas[l.nombre] = l.mesas;
  const cleanKey = l.nombre.toLowerCase().replace(/[^a-z0-9]/g, '');
  if (cleanKey) localMetas[cleanKey] = l.mesas;
  
  totalMesasGlobal += l.mesas;
  if (prov === 'LIMA') totalMesasLima += l.mesas;
  if (prov === 'CALLAO') totalMesasCallao += l.mesas;
});

const mesasCatalogObj = {
  totalMesasGlobal,
  totalMesasLima,
  totalMesasCallao,
  provinciaMetas,
  distritoMetas,
  localMetas
};

// 5. Write mesasCatalog.json (Backend & Frontend)
fs.writeFileSync(path.join(rootDir, 'backend/src/data/mesasCatalog.json'), JSON.stringify(mesasCatalogObj, null, 2), 'utf8');
fs.writeFileSync(path.join(rootDir, 'frontend/src/constants/mesasCatalog.json'), JSON.stringify(mesasCatalogObj, null, 2), 'utf8');
console.log(`✅ mesasCatalog.json guardado -> Total Lima: ${totalMesasLima} mesas | Total Callao: ${totalMesasCallao} mesas | Total Global: ${totalMesasGlobal} mesas`);

// 6. Write localesCatalog.js (Backend & Frontend)
const localesCatalogJs = `// Catálogo oficial extraído de data.md
export const LOCALES_OFICIALES = ${JSON.stringify(finalCatalog, null, 2)};

export function getLocalesByDistrito(distrito) {
  if (!distrito) return [];
  const norm = String(distrito).toUpperCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').trim();
  return LOCALES_OFICIALES.filter(l => {
    const d = (l.distrito || '').toUpperCase().normalize('NFD').replace(/[\\u0300-\\u036f]/g, '').trim();
    return d === norm;
  });
}

export function findOfficialLocal(nombre, distrito) {
  if (!nombre) return null;
  const normNom = String(nombre).toUpperCase().normalize('NFD').replace(/[^A-Z0-9]/g, '').trim();
  return LOCALES_OFICIALES.find(l => {
    const lNorm = (l.nombre || '').toUpperCase().normalize('NFD').replace(/[^A-Z0-9]/g, '').trim();
    return lNorm === normNom;
  }) || null;
}
`;
fs.writeFileSync(path.join(rootDir, 'backend/src/constants/localesCatalog.js'), localesCatalogJs, 'utf8');
fs.writeFileSync(path.join(rootDir, 'frontend/src/constants/localesCatalog.js'), localesCatalogJs, 'utf8');
console.log(`✅ localesCatalog.js guardado (Backend & Frontend)`);

// 7. Update all distritos list
const ALL_DISTRITOS = [
  "Ancón", "Ate", "Barranco", "Breña", "Carabayllo", "Cercado de Lima",
  "Chaclacayo", "Chorrillos", "Cieneguilla", "Comas", "El Agustino",
  "Independencia", "Jesús María", "La Molina", "La Victoria", "Lince",
  "Los Olivos", "Lurigancho-Chosica", "Lurín", "Magdalena del Mar",
  "Miraflores", "Pachacámac", "Pucusana", "Pueblo Libre", "Puente Piedra",
  "Punta Hermosa", "Punta Negra", "Rímac", "San Bartolo", "San Borja",
  "San Isidro", "San Juan de Lurigancho", "San Juan de Miraflores",
  "San Luis", "San Martín de Porres", "San Miguel", "Santa Anita",
  "Santa María del Mar", "Santa Rosa", "Santiago de Surco", "Surquillo",
  "Villa El Salvador", "Villa María del Triunfo",
  "Bellavista", "Callao", "Carmen de la Legua - Reynoso", "La Perla", "La Punta", "Mi Perú", "Ventanilla"
];

// Calculate electoral data per district
const distritoElectoralData = {};
let totalLocalesMetropolitana = 0;
let totalElectoresMetropolitana = 0;

Object.keys(localesData).forEach(d => {
  const locCount = localesData[d].length;
  const mesCount = distritoMetas[d] || (finalCatalog.filter(l => l.distrito.toUpperCase().trim() === d).reduce((acc, c) => acc + c.mesas, 0)) || 0;
  const elecCount = mesCount * 300;
  distritoElectoralData[d] = {
    locales: locCount,
    mesas: mesCount,
    electores: elecCount
  };
  totalLocalesMetropolitana += locCount;
  totalElectoresMetropolitana += elecCount;
});

// 8. Update backend/src/config/constants.js
const backendConstantsPath = path.join(rootDir, 'backend/src/config/constants.js');
let backendConstants = `export const ROLES = {
  SUPERADMIN: 'superadmin',
  ADMIN: 'admin',
  COORDINADOR: 'coordinador',
  PERSONERO: 'personero',
  PERSONERO_REGISTRADO: 'personero_registrado'
};

export const ELECTORAL_ROLES = [
  'Personero de Mesa',
  'Personero de Local de Votación',
  'Coordinador Zonal',
  'Coordinador Distrital'
];

export const TRAINING_RULES = {
  REQUIRED_VIDEOS: 1,
  REQUIRED_PDFS: 1,
  PASSING_QUIZ_STATUS: 'Aprobado',
  CREDENTIAL_CONFIRMED: 'Confirmado',
  CREDENTIAL_BLOCKED: 'Bloqueado'
};

export const DISTRITOS_LIMA = ${JSON.stringify(ALL_DISTRITOS, null, 2)};

export const TOTAL_MESAS_LIMA = ${totalMesasGlobal};
export const TOTAL_MESAS_LIMA_METROPOLITANA = ${totalMesasLima};
export const TOTAL_MESAS_CALLAO = ${totalMesasCallao};

export const PROVINCIA_METAS = ${JSON.stringify(provinciaMetas, null, 2)};

export const DISTRITO_METAS = ${JSON.stringify(distritoMetas, null, 2)};
`;
fs.writeFileSync(backendConstantsPath, backendConstants, 'utf8');
console.log(`✅ backend constants.js actualizado con Callao`);

// 9. Update frontend/src/constants/catalogs.js
const frontendCatalogsPath = path.join(rootDir, 'frontend/src/constants/catalogs.js');
let frontendCatalogs = `export const ROLES = [
  'Personero de Mesa',
  'Personero de Local de Votación',
  'Coordinador Zonal',
  'Coordinador Distrital'
];

export const DISTRITOS_LIMA = ${JSON.stringify(ALL_DISTRITOS, null, 2)};

export const TOTAL_MESAS_LIMA = ${totalMesasGlobal};
export const TOTAL_MESAS_LIMA_METROPOLITANA = ${totalMesasLima};
export const TOTAL_MESAS_CALLAO = ${totalMesasCallao};

export const PROVINCIA_METAS = ${JSON.stringify(provinciaMetas, null, 2)};

export const DISTRITO_METAS = ${JSON.stringify(distritoMetas, null, 2)};

export const LOCAL_METAS = ${JSON.stringify(localMetas, null, 2)};

function normStr(str) {
  return (str || '')
    .toString()
    .toLowerCase()
    .trim()
    .normalize('NFD')
    .replace(/[\\u0300-\\u036f]/g, '')
    .replace(/[^a-z0-9]/g, '');
}

export const DISTRITO_ELECTORAL_DATA = ${JSON.stringify(distritoElectoralData, null, 2)};

export const TOTAL_LOCALES_LIMA_METROPOLITANA = ${totalLocalesMetropolitana};
export const TOTAL_ELECTORES_LIMA_METROPOLITANA = ${totalElectoresMetropolitana};

export function getElectoresForDistrito(distName) {
  if (!distName || distName === 'all') return TOTAL_ELECTORES_LIMA_METROPOLITANA;
  const n = normStr(distName);
  for (const [d, info] of Object.entries(DISTRITO_ELECTORAL_DATA)) {
    if (normStr(d) === n) return info.electores;
  }
  if (n === 'lima' || n.includes('cercado')) return DISTRITO_ELECTORAL_DATA['LIMA']?.electores || (1015 * 300);
  if (n.includes('chosica') || n.includes('lurigancho')) return DISTRITO_ELECTORAL_DATA['LURIGANCHO']?.electores || (550 * 300);
  const mesas = getMesasForDistrito(distName);
  return mesas ? mesas * 300 : 0;
}

export function getLocalesCountForDistrito(distName) {
  if (!distName || distName === 'all') return TOTAL_LOCALES_LIMA_METROPOLITANA;
  const n = normStr(distName);
  for (const [d, info] of Object.entries(DISTRITO_ELECTORAL_DATA)) {
    if (normStr(d) === n) return info.locales;
  }
  if (n === 'lima' || n.includes('cercado')) return DISTRITO_ELECTORAL_DATA['LIMA']?.locales || 56;
  if (n.includes('chosica') || n.includes('lurigancho')) return DISTRITO_ELECTORAL_DATA['LURIGANCHO']?.locales || 41;
  return 0;
}

export function getMesasForLocal(localName) {
  if (!localName) return 0;
  const n = normStr(localName);
  if (LOCAL_METAS[n] !== undefined) return LOCAL_METAS[n];
  if (LOCAL_METAS[localName]) return LOCAL_METAS[localName];
  return 0;
}

export function getMesasForDistrito(distName) {
  if (!distName || distName === 'all') return TOTAL_MESAS_LIMA_METROPOLITANA;
  const n = normStr(distName);
  for (const [d, mesas] of Object.entries(DISTRITO_METAS)) {
    if (normStr(d) === n) return mesas;
  }
  if (n === 'lima' || n.includes('cercado')) return DISTRITO_METAS['Cercado de Lima'] || 1015;
  if (n.includes('chosica') || n.includes('lurigancho')) return DISTRITO_METAS['Lurigancho-Chosica'] || 550;
  return 0;
}
`;
fs.writeFileSync(frontendCatalogsPath, frontendCatalogs, 'utf8');
console.log(`✅ frontend catalogs.js actualizado con Callao y helpers`);

// 10. Sync to PostgreSQL if connected
async function syncDb() {
  try {
    const pool = await dbPool.getPool();
    if (!pool) return;
    console.log('🔄 Sincronizando catálogo completo en PostgreSQL (Neon)...');

    // Crear tabla mesas si no existe y asegurar columnas
    await pool.query(`
      CREATE TABLE IF NOT EXISTS mesas (
        id SERIAL PRIMARY KEY,
        numero_mesa VARCHAR(20),
        distrito VARCHAR(100),
        colegio VARCHAR(250),
        direccion VARCHAR(250),
        num_mesas INTEGER DEFAULT 0,
        departamento VARCHAR(100),
        provincia VARCHAR(100),
        ubigeo VARCHAR(20),
        latitud NUMERIC(10, 6),
        longitud NUMERIC(10, 6),
        coordenadas_gps VARCHAR(100)
      );
      ALTER TABLE mesas ADD COLUMN IF NOT EXISTS numero_mesa VARCHAR(20);
      ALTER TABLE mesas ADD COLUMN IF NOT EXISTS ubigeo VARCHAR(20);
      ALTER TABLE mesas ADD COLUMN IF NOT EXISTS departamento VARCHAR(100);
      ALTER TABLE mesas ADD COLUMN IF NOT EXISTS provincia VARCHAR(100);
      ALTER TABLE mesas ADD COLUMN IF NOT EXISTS num_mesas INTEGER DEFAULT 0;
      ALTER TABLE mesas ADD COLUMN IF NOT EXISTS direccion VARCHAR(250);
    `);

    // Insertar/actualizar registros en bloques
    await pool.query('TRUNCATE TABLE mesas RESTART IDENTITY CASCADE;');
    
    const batchSize = 100;
    for (let i = 0; i < finalCatalog.length; i += batchSize) {
      const chunk = finalCatalog.slice(i, i + batchSize);
      const values = [];
      const params = [];
      let pIdx = 1;

      chunk.forEach((item, cIdx) => {
        const mesaNum = String(item.id || (startId + i + cIdx)).padStart(6, '0');
        values.push(`($${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++}, $${pIdx++})`);
        params.push(
          mesaNum,
          item.ubigeo,
          item.departamento,
          item.provincia,
          item.distrito,
          item.nombre,
          item.direccion,
          item.mesas
        );
      });

      const q = `
        INSERT INTO mesas (numero_mesa, ubigeo, departamento, provincia, distrito, colegio, direccion, num_mesas)
        VALUES ${values.join(', ')};
      `;
      await pool.query(q, params);
    }

    console.log(`✅ Sincronizados ${finalCatalog.length} locales en PostgreSQL mesas.`);
  } catch (err) {
    console.warn('⚠️ Nota sobre sincronización PostgreSQL:', err.message);
  }
}

syncDb().then(() => {
  console.log('\n🎉 ¡PROCESO DE CONSOLIDACIÓN COMPLETADO CON ÉXITO!');
  process.exit(0);
});
