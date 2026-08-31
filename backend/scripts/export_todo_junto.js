import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';
import XLSX from 'xlsx';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

const DISTRITOS_43 = [
  "ANCÓN", "ATE", "BARRANCO", "BREÑA", "CARABAYLLO", "CERCADO DE LIMA",
  "CHACLACAYO", "CHORRILLOS", "CIENEGUILLA", "COMAS", "EL AGUSTINO",
  "INDEPENDENCIA", "JESÚS MARÍA", "LA MOLINA", "LA VICTORIA", "LINCE",
  "LOS OLIVOS", "LURIGANCHO-CHOSICA", "LURÍN", "MAGDALENA DEL MAR",
  "MIRAFLORES", "PACHACÁMAC", "PUCUSANA", "PUEBLO LIBRE", "PUENTE PIEDRA",
  "PUNTA HERMOSA", "PUNTA NEGRA", "RÍMAC", "SAN BARTOLO", "SAN BORJA",
  "SAN ISIDRO", "SAN JUAN DE LURIGANCHO", "SAN JUAN DE MIRAFLORES",
  "SAN LUIS", "SAN MARTÍN DE PORRES", "SAN MIGUEL", "SANTA ANITA",
  "SANTA MARÍA DEL MAR", "SANTA ROSA", "SANTIAGO DE SURCO", "SURQUILLO",
  "VILLA EL SALVADOR", "VILLA MARÍA DEL TRIUNFO"
];

function normalizeDistrict(dist) {
  if (!dist) return 'SIN DISTRITO';
  const clean = dist.trim().toUpperCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');

  if (clean.includes('VMT') || clean.includes('V.M.T') || clean.includes('VILLA MARIA DEL TRIUNFO')) return 'VILLA MARÍA DEL TRIUNFO';
  if (clean.includes('VES') || clean.includes('V.E.S') || clean.includes('VILLA EL SALVADOR')) return 'VILLA EL SALVADOR';
  if (clean === 'SURCO' || clean === 'SANTIAGO DE SURCO') return 'SANTIAGO DE SURCO';
  if (clean === 'LURIN') return 'LURÍN';
  if (clean === 'BRENA') return 'BREÑA';
  if (clean === 'SAN MARTIN DE PORRES' || clean === 'SMP') return 'SAN MARTÍN DE PORRES';
  if (clean === 'SAN JUAN DE MIRAFLORES' || clean === 'SJM') return 'SAN JUAN DE MIRAFLORES';
  if (clean === 'SAN JUAN DE LURIGANCHO' || clean === 'SJL') return 'SAN JUAN DE LURIGANCHO';
  if (clean === 'LIMA' || clean === 'CERCADO DE LIMA') return 'CERCADO DE LIMA';
  if (clean === 'LURIGANCHO' || clean === 'CHOSICA' || clean === 'LURIGANCHO-CHOSICA') return 'LURIGANCHO-CHOSICA';
  if (clean === 'ANCON') return 'ANCÓN';
  if (clean === 'JESUS MARIA') return 'JESÚS MARÍA';
  if (clean === 'PACHACAMAC') return 'PACHACÁMAC';
  if (clean === 'RIMAC') return 'RÍMAC';
  if (clean === 'SANTA MARIA DEL MAR') return 'SANTA MARÍA DEL MAR';

  return dist.trim().toUpperCase();
}

// 1. Extraer metas oficiales de data.md
function parseDataMdTargets() {
  const dataMdPath = path.join(__dirname, '../../data.md');
  const content = fs.readFileSync(dataMdPath, 'utf8');
  const lines = content.split('\n');

  const targets = {};
  DISTRITOS_43.forEach(d => {
    targets[d] = { locales: 0, mesas: 0, electores: 0 };
  });

  for (const line of lines) {
    const parts = line.split('\t');
    if (parts.length >= 8) {
      const distRaw = parts[4]?.trim();
      const numMesas = parseInt(parts[7]?.trim() || 0, 10);
      const distNorm = normalizeDistrict(distRaw);

      if (targets[distNorm]) {
        targets[distNorm].locales += 1;
        targets[distNorm].mesas += numMesas;
        targets[distNorm].electores += (numMesas * 300);
      }
    }
  }

  return targets;
}

async function run() {
  const client = await pool.connect();
  try {
    const targets = parseDataMdTargets();

    const targetTables = [
      { name: 'rcoordinadoresd', label: 'Coordinador Distrital' },
      { name: 'rcoordinadoresz', label: 'Coordinador Zonal' },
      { name: 'rcoordinadores', label: 'Coordinador de Local' },
      { name: 'rpersoneros', label: 'Personero de Mesa' }
    ];

    const allRecords = [];
    const counts = {
      'Coordinador Distrital': 0,
      'Coordinador Zonal': 0,
      'Coordinador de Local': 0,
      'Personero de Mesa': 0
    };

    // Inicializar mapa de los 43 distritos
    const districtStats = {};
    DISTRITOS_43.forEach(d => {
      districtStats[d] = {
        'DISTRITO': d,
        'PERSONEROS ASIGNADOS': 0,
        'COORD. LOCAL': 0,
        'COORD. DISTRITAL': 0,
        'COORD. ZONAL': 0,
        'TOTAL ASIGNADOS': 0,
        'META MESAS': targets[d]?.mesas || 0,
        'META LOCALES': targets[d]?.locales || 0,
        'META ELECTORES': targets[d]?.electores || 0,
        'COBERTURA MESAS %': '0%',
        'MESAS PENDIENTES': targets[d]?.mesas || 0
      };
    });

    for (const item of targetTables) {
      const res = await client.query(`SELECT * FROM "${item.name}" ORDER BY id ASC`);
      counts[item.label] = res.rows.length;

      res.rows.forEach(r => {
        const dni = String(r.dni || r['D.N.I.'] || r.d_n_i || r.documento || '').trim();
        const nombres = String(r.nombres_y_apellidos || r['Nombres y Apellidos'] || r.nombres || r.nombre || '').trim();
        const celular = String(r.celular || r['Celular'] || r.telefono || '').trim();
        const rawDistrito = String(r.distrito_asignado || r['Distrito Asignado'] || r.distrito_donde_vota || r['Distrito donde Vota'] || r.distrito || '').trim();
        const distrito = normalizeDistrict(rawDistrito);

        const local = String(r.local_de_votacion_asignado || r['Local de Votación Asignado'] || r.local_asignado || r.local_de_votacion || r['Local de Votación'] || (item.name === 'rcoordinadoresd' ? 'No aplica (Distrital)' : '')).trim();
        const mesa = String(r.mesa_asignada || r['Mesa Asignada'] || (item.name === 'rpersoneros' ? (r.mesa_de_sufragio || '-') : 'No aplica')).trim();
        const rol = String(r.rol_a_desempenar || r['Rol a Desempeñar'] || r.rol || item.label).trim();

        if (districtStats[distrito]) {
          if (item.name === 'rpersoneros') districtStats[distrito]['PERSONEROS ASIGNADOS']++;
          else if (item.name === 'rcoordinadores') districtStats[distrito]['COORD. LOCAL']++;
          else if (item.name === 'rcoordinadoresd') districtStats[distrito]['COORD. DISTRITAL']++;
          else if (item.name === 'rcoordinadoresz') districtStats[distrito]['COORD. ZONAL']++;
          districtStats[distrito]['TOTAL ASIGNADOS']++;
        }

        allRecords.push({
          'N°': allRecords.length + 1,
          'NOMBRES Y APELLIDOS': nombres,
          'DNI': dni,
          'ROL A DESEMPEÑAR': rol,
          'DISTRITO ASIGNADO': distrito,
          'LOCAL DE VOTACIÓN ASIGNADO': local,
          'MESA ASIGNADA': mesa,
          'CELULAR': celular,
          'TABLA': item.name
        });
      });
    }

    // Calcular porcentajes y pendientes para los 43 distritos
    DISTRITOS_43.forEach(d => {
      const row = districtStats[d];
      const metaM = row['META MESAS'];
      const asignadosP = row['PERSONEROS ASIGNADOS'];
      const pct = metaM > 0 ? ((asignadosP / metaM) * 100).toFixed(1) : '0';
      row['COBERTURA MESAS %'] = `${pct}%`;
      row['MESAS PENDIENTES'] = Math.max(0, metaM - asignadosP);
    });

    const totalGeneral = allRecords.length;

    // Crear Libro de Excel
    const wb = XLSX.utils.book_new();

    // 1. Hoja Única Todo Junto
    const wsTodoJunto = XLSX.utils.json_to_sheet(allRecords);
    wsTodoJunto['!cols'] = [
      { wch: 6 },   // N°
      { wch: 38 },  // Nombres y Apellidos
      { wch: 12 },  // DNI
      { wch: 26 },  // Rol a Desempeñar
      { wch: 28 },  // Distrito Asignado
      { wch: 45 },  // Local de Votación Asignado
      { wch: 16 },  // Mesa Asignada
      { wch: 14 },  // Celular
      { wch: 18 }   // Tabla
    ];
    XLSX.utils.book_append_sheet(wb, wsTodoJunto, 'REGISTRO_TODO_JUNTO');

    // 2. Hoja de Conteo Completo de TODOS LOS 43 DISTRITOS
    const districtList = Object.values(districtStats).sort((a, b) => b['TOTAL ASIGNADOS'] - a['TOTAL ASIGNADOS'] || b['META MESAS'] - a['META MESAS']);
    
    // Fila total al final
    const totalRowDistrict = {
      'DISTRITO': 'TOTAL LIMA METROPOLITANA (43 DISTRITOS)',
      'PERSONEROS ASIGNADOS': districtList.reduce((acc, d) => acc + d['PERSONEROS ASIGNADOS'], 0),
      'COORD. LOCAL': districtList.reduce((acc, d) => acc + d['COORD. LOCAL'], 0),
      'COORD. DISTRITAL': districtList.reduce((acc, d) => acc + d['COORD. DISTRITAL'], 0),
      'COORD. ZONAL': districtList.reduce((acc, d) => acc + d['COORD. ZONAL'], 0),
      'TOTAL ASIGNADOS': totalGeneral,
      'META MESAS': districtList.reduce((acc, d) => acc + d['META MESAS'], 0),
      'META LOCALES': districtList.reduce((acc, d) => acc + d['META LOCALES'], 0),
      'META ELECTORES': districtList.reduce((acc, d) => acc + d['META ELECTORES'], 0),
      'COBERTURA MESAS %': `${((districtList.reduce((acc, d) => acc + d['PERSONEROS ASIGNADOS'], 0) / districtList.reduce((acc, d) => acc + d['META MESAS'], 0)) * 100).toFixed(2)}%`,
      'MESAS PENDIENTES': districtList.reduce((acc, d) => acc + d['MESAS PENDIENTES'], 0)
    };
    const districtTableData = [...districtList, totalRowDistrict];

    const wsDistrict = XLSX.utils.json_to_sheet(districtTableData);
    wsDistrict['!cols'] = [
      { wch: 32 }, // Distrito
      { wch: 22 }, // Personeros Asignados
      { wch: 16 }, // Coord Local
      { wch: 18 }, // Coord Distrital
      { wch: 16 }, // Coord Zonal
      { wch: 18 }, // Total Asignados
      { wch: 14 }, // Meta Mesas
      { wch: 14 }, // Meta Locales
      { wch: 18 }, // Meta Electores
      { wch: 20 }, // Cobertura Mesas %
      { wch: 18 }  // Mesas Pendientes
    ];
    XLSX.utils.book_append_sheet(wb, wsDistrict, 'TODOS_LOS_43_DISTRITOS');

    // 3. Hoja de Conteo y Resumen por Rol y Tabla
    const summaryRows = [
      { 'ROL': 'Coordinadores de Local', 'TABLA': 'rcoordinadores', 'CANTIDAD': counts['Coordinador de Local'] },
      { 'ROL': 'Personeros de Mesa', 'TABLA': 'rpersoneros', 'CANTIDAD': counts['Personero de Mesa'] },
      { 'ROL': 'Coordinadores Distritales', 'TABLA': 'rcoordinadoresd', 'CANTIDAD': counts['Coordinador Distrital'] },
      { 'ROL': 'Coordinadores Zonales', 'TABLA': 'rcoordinadoresz', 'CANTIDAD': counts['Coordinador Zonal'] },
      { 'ROL': 'TOTAL GENERAL', 'TABLA': 'TODAS LAS TABLAS', 'CANTIDAD': totalGeneral }
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    wsSummary['!cols'] = [{ wch: 28 }, { wch: 20 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, 'RESUMEN_TOTALES');

    const outPath1 = path.join(__dirname, '../../REGISTRO_SOMOS_PERU_TODO_JUNTO.xlsx');
    const outPath2 = path.join(__dirname, '../../REGISTRO_SOMOS_PERU_TABLAS.xlsx');

    XLSX.writeFile(wb, outPath1);
    XLSX.writeFile(wb, outPath2);

    console.log(`\n======================================================`);
    console.log(`✅ EXCEL RE-GENERADO CON LOS 43 DISTRITOS COMPLETOS`);
    console.log(`📁 Ruta: ${outPath1}`);
    console.log(`📊 TOTAL DISTRITOS: ${DISTRITOS_43.length}`);
    console.log(`📊 TOTAL INTEGRANTES: ${totalGeneral}`);
    console.log(`======================================================\n`);

  } catch (err) {
    console.error('Error al generar Excel con todos los 43 distritos:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
