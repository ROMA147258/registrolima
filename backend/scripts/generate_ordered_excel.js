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

function parseDataMd() {
  const dataMdPath = path.join(__dirname, '../../data.md');
  const content = fs.readFileSync(dataMdPath, 'utf8');
  const lines = content.split('\n');

  const targets = {};
  const allSchools = [];

  DISTRITOS_43.forEach(d => {
    targets[d] = { locales: 0, mesas: 0, electores: 0 };
  });

  for (const line of lines) {
    const parts = line.split('\t');
    if (parts.length >= 8) {
      const ubigeo = parts[1]?.trim();
      const distRaw = parts[4]?.trim();
      const localNombre = parts[5]?.trim();
      const direccion = parts[6]?.trim();
      const numMesas = parseInt(parts[7]?.trim() || 0, 10);
      const distNorm = normalizeDistrict(distRaw);

      if (targets[distNorm]) {
        targets[distNorm].locales += 1;
        targets[distNorm].mesas += numMesas;
        targets[distNorm].electores += (numMesas * 300);
      }

      allSchools.push({
        'DISTRITO': distNorm,
        'LOCAL DE VOTACIÓN': localNombre,
        'DIRECCIÓN': direccion,
        'TOTAL MESAS': numMesas,
        'TOTAL ELECTORES (x300)': numMesas * 300,
        'UBIGEO': ubigeo
      });
    }
  }

  allSchools.sort((a, b) => a.DISTRITO.localeCompare(b.DISTRITO) || a['LOCAL DE VOTACIÓN'].localeCompare(b['LOCAL DE VOTACIÓN']));
  return { targets, allSchools };
}

async function run() {
  const client = await pool.connect();
  try {
    const { targets, allSchools } = parseDataMd();

    // Consultar las 4 tablas
    const resD = await client.query(`SELECT * FROM rcoordinadoresd ORDER BY distrito_asignado ASC, nombres_y_apellidos ASC`);
    const resZ = await client.query(`SELECT * FROM rcoordinadoresz ORDER BY distrito_asignado ASC, nombres_y_apellidos ASC`);
    const resC = await client.query(`SELECT * FROM rcoordinadores ORDER BY distrito_asignado ASC, local_de_votacion_asignado ASC, nombres_y_apellidos ASC`);
    const resP = await client.query(`SELECT * FROM rpersoneros ORDER BY distrito_asignado ASC, local_de_votacion_asignado ASC, mesa_asignada ASC, nombres_y_apellidos ASC`);

    const formatPerson = (r, rolLabel, jerarquiaNum, tablaOrigen) => {
      const rawDate = r.fecha_de_registro || r['Marca temporal'] || r['Fecha de Registro'] || '';
      let fechaHora = '—';
      if (rawDate) {
        const d = new Date(rawDate);
        if (!isNaN(d.getTime())) {
          fechaHora = `${d.toLocaleDateString('es-PE', { day: '2-digit', month: '2-digit', year: 'numeric' })} ${d.toLocaleTimeString('es-PE', { hour: '2-digit', minute: '2-digit', hour12: true })}`;
        }
      }

      const rawDist = String(r.distrito_asignado || r['Distrito Asignado'] || r.distrito_donde_vota || r.distrito || '').trim();
      const distAsig = normalizeDistrict(rawDist);

      const localAsig = String(r.local_de_votacion_asignado || r['Local de Votación Asignado'] || r.local_asignado || (rolLabel.includes('Distrital') ? 'Supervisión Distrital Completa' : '—')).trim();
      let mesaAsig = String(r.mesa_asignada || r['Mesa Asignada'] || '').trim();
      if (!mesaAsig || mesaAsig === '-' || mesaAsig.toLowerCase() === 'no aplica') {
        mesaAsig = rolLabel.includes('Personero') ? 'En Padrón (Asignado al Local)' : 'No aplica (Coordinador)';
      }

      return {
        _jerarquia: jerarquiaNum,
        'JERARQUÍA / ROL': rolLabel,
        'DISTRITO ASIGNADO': distAsig,
        'LOCAL DE VOTACIÓN ASIGNADO': localAsig,
        'MESA ASIGNADA': mesaAsig,
        'NOMBRES Y APELLIDOS': String(r.nombres_y_apellidos || r['Nombres y Apellidos'] || '').trim(),
        'DNI': String(r.dni || r['D.N.I.'] || '').trim(),
        'CELULAR': String(r.celular || r['Celular'] || '').trim(),
        'CORREO ELECTRÓNICO': String(r.correo_electronico || r['Correo Electrónico'] || '').trim(),
        'FECHA Y HORA REGISTRO': fechaHora,
        'ESTADO CREDENCIAL': String(r.credenciales || r['Credenciales'] || 'Confirmado').trim(),
        'TABLA ORIGEN': tablaOrigen
      };
    };

    const listD = resD.rows.map(r => formatPerson(r, '🏛️ Coordinador Distrital', 1, 'rcoordinadoresd'));
    const listZ = resZ.rows.map(r => formatPerson(r, '🗺️ Coordinador Zonal', 2, 'rcoordinadoresz'));
    const listC = resC.rows.map(r => formatPerson(r, '🏫 Personero de Local de Votación (PLV)', 3, 'rcoordinadores'));
    const listP = resP.rows.map(r => formatPerson(r, '🛡️ Personero de Mesa', 4, 'rpersoneros'));

    const masterList = [...listD, ...listZ, ...listC, ...listP].sort((a, b) => {
      if (a._jerarquia !== b._jerarquia) return a._jerarquia - b._jerarquia;
      if (a['DISTRITO ASIGNADO'] !== b['DISTRITO ASIGNADO']) return a['DISTRITO ASIGNADO'].localeCompare(b['DISTRITO ASIGNADO']);
      if (a['LOCAL DE VOTACIÓN ASIGNADO'] !== b['LOCAL DE VOTACIÓN ASIGNADO']) return a['LOCAL DE VOTACIÓN ASIGNADO'].localeCompare(b['LOCAL DE VOTACIÓN ASIGNADO']);
      return a['NOMBRES Y APELLIDOS'].localeCompare(b['NOMBRES Y APELLIDOS']);
    });

    const cleanMasterList = masterList.map((item, idx) => {
      const { _jerarquia, ...rest } = item;
      return { 'N°': idx + 1, ...rest };
    });

    // 1. DATA ESPECÍFICA SOLICITADA POR EL USUARIO:
    // TOTAL DE PLV (LOCALES) DEL DISTRITO, PLV REGISTRADOS, PLV QUE FALTAN
    // TOTAL DE PERSONEROS DE MESA PARA EL DISTRITO, PERSONEROS REGISTRADOS, PERSONEROS QUE FALTAN
    const exactUserData = {};
    DISTRITOS_43.forEach(d => {
      const metaLocales = targets[d]?.locales || 0;
      const metaMesas = targets[d]?.mesas || 0;
      exactUserData[d] = {
        'DISTRITO': d,
        'TOTAL PLV REQUERIDOS (LOCALES)': metaLocales,
        'PLV REGISTRADOS EN EL SISTEMA': 0,
        'PLV QUE FALTAN REGISTRAR': metaLocales,
        '% COBERTURA PLV': '0.0%',
        'TOTAL PERSONEROS MESA PARA EL DISTRITO': metaMesas,
        'PERSONEROS MESA REGISTRADOS': 0,
        'PERSONEROS MESA QUE FALTAN REGISTRAR': metaMesas,
        '% COBERTURA PERSONEROS MESA': '0.0%',
        'COORD. DISTRITALES': 0,
        'COORD. ZONALES': 0,
        'TOTAL GENERAL ASIGNADOS': 0
      };
    });

    listC.forEach(r => {
      const d = r['DISTRITO ASIGNADO'];
      if (exactUserData[d]) exactUserData[d]['PLV REGISTRADOS EN EL SISTEMA']++;
    });

    listP.forEach(r => {
      const d = r['DISTRITO ASIGNADO'];
      if (exactUserData[d]) exactUserData[d]['PERSONEROS MESA REGISTRADOS']++;
    });

    listD.forEach(r => {
      const d = r['DISTRITO ASIGNADO'];
      if (exactUserData[d]) exactUserData[d]['COORD. DISTRITALES']++;
    });

    listZ.forEach(r => {
      const d = r['DISTRITO ASIGNADO'];
      if (exactUserData[d]) exactUserData[d]['COORD. ZONALES']++;
    });

    DISTRITOS_43.forEach(d => {
      const row = exactUserData[d];
      const plvReq = row['TOTAL PLV REQUERIDOS (LOCALES)'];
      const plvReg = row['PLV REGISTRADOS EN EL SISTEMA'];
      row['PLV QUE FALTAN REGISTRAR'] = Math.max(0, plvReq - plvReg);
      row['% COBERTURA PLV'] = plvReq > 0 ? `${((plvReg / plvReq) * 100).toFixed(1)}%` : '0.0%';

      const pReq = row['TOTAL PERSONEROS MESA PARA EL DISTRITO'];
      const pReg = row['PERSONEROS MESA REGISTRADOS'];
      row['PERSONEROS MESA QUE FALTAN REGISTRAR'] = Math.max(0, pReq - pReg);
      row['% COBERTURA PERSONEROS MESA'] = pReq > 0 ? `${((pReg / pReq) * 100).toFixed(1)}%` : '0.0%';

      row['TOTAL GENERAL ASIGNADOS'] = plvReg + pReg + row['COORD. DISTRITALES'] + row['COORD. ZONALES'];
    });

    const userTableRows = Object.values(exactUserData).sort((a, b) => b['TOTAL GENERAL ASIGNADOS'] - a['TOTAL GENERAL ASIGNADOS'] || a.DISTRITO.localeCompare(b.DISTRITO));

    const totalUserRow = {
      'DISTRITO': 'TOTAL LIMA METROPOLITANA (43 DISTRITOS)',
      'TOTAL PLV REQUERIDOS (LOCALES)': userTableRows.reduce((a, b) => a + b['TOTAL PLV REQUERIDOS (LOCALES)'], 0),
      'PLV REGISTRADOS EN EL SISTEMA': userTableRows.reduce((a, b) => a + b['PLV REGISTRADOS EN EL SISTEMA'], 0),
      'PLV QUE FALTAN REGISTRAR': userTableRows.reduce((a, b) => a + b['PLV QUE FALTAN REGISTRAR'], 0),
      '% COBERTURA PLV': `${((listC.length / userTableRows.reduce((a, b) => a + b['TOTAL PLV REQUERIDOS (LOCALES)'], 0)) * 100).toFixed(1)}%`,
      'TOTAL PERSONEROS MESA PARA EL DISTRITO': userTableRows.reduce((a, b) => a + b['TOTAL PERSONEROS MESA PARA EL DISTRITO'], 0),
      'PERSONEROS MESA REGISTRADOS': userTableRows.reduce((a, b) => a + b['PERSONEROS MESA REGISTRADOS'], 0),
      'PERSONEROS MESA QUE FALTAN REGISTRAR': userTableRows.reduce((a, b) => a + b['PERSONEROS MESA QUE FALTAN REGISTRAR'], 0),
      '% COBERTURA PERSONEROS MESA': `${((listP.length / userTableRows.reduce((a, b) => a + b['TOTAL PERSONEROS MESA PARA EL DISTRITO'], 0)) * 100).toFixed(2)}%`,
      'COORD. DISTRITALES': listD.length,
      'COORD. ZONALES': listZ.length,
      'TOTAL GENERAL ASIGNADOS': cleanMasterList.length
    };
    userTableRows.push(totalUserRow);

    // Resumen de Jerarquía
    const resumenJerarquia = [
      { 'JERARQUÍA / NIVEL': '1. Supervisión General', 'ROL OFICIAL': 'Superadmin', 'CANTIDAD': 1, 'RESPONSABILIDAD': 'Control y monitoreo de todo Lima Metropolitana' },
      { 'JERARQUÍA / NIVEL': '2. Mando Distrital', 'ROL OFICIAL': 'Coordinador Distrital', 'CANTIDAD': listD.length, 'RESPONSABILIDAD': 'Líder del Distrito con clave de acceso asignada' },
      { 'JERARQUÍA / NIVEL': '3. Mando Zonal', 'ROL OFICIAL': 'Coordinador Zonal', 'CANTIDAD': listZ.length, 'RESPONSABILIDAD': 'Supervisión de cuadrante de colegios' },
      { 'JERARQUÍA / NIVEL': '4. Mando de Local', 'ROL OFICIAL': 'Personero de Local de Votación (PLV)', 'CANTIDAD': listC.length, 'RESPONSABILIDAD': 'Responsable general del centro de votación' },
      { 'JERARQUÍA / NIVEL': '5. Defensa del Voto', 'ROL OFICIAL': 'Personero de Mesa', 'CANTIDAD': listP.length, 'RESPONSABILIDAD': 'Defensa de votos en las mesas de sufragio' },
      { 'JERARQUÍA / NIVEL': 'TOTAL GENERAL', 'ROL OFICIAL': 'Todos los Roles Registrados', 'CANTIDAD': cleanMasterList.length, 'RESPONSABILIDAD': 'Base total activa en plataforma' }
    ];

    const wb = XLSX.utils.book_new();

    // HOJA 1: DATA EXACTA SOLICITADA POR EL USUARIO (PLV Y PERSONEROS REGISTRADOS VS FALTANTES)
    const wsExactData = XLSX.utils.json_to_sheet(userTableRows);
    wsExactData['!cols'] = [
      { wch: 30 }, // DISTRITO
      { wch: 22 }, // TOTAL PLV REQUERIDOS
      { wch: 22 }, // PLV REGISTRADOS
      { wch: 22 }, // PLV QUE FALTAN
      { wch: 18 }, // % COBERTURA PLV
      { wch: 28 }, // TOTAL PERSONEROS PARA EL DISTRITO
      { wch: 22 }, // PERSONEROS REGISTRADOS
      { wch: 26 }, // PERSONEROS QUE FALTAN
      { wch: 20 }, // % COBERTURA PERSONEROS
      { wch: 16 }, // COORD DISTRITAL
      { wch: 16 }, // COORD ZONAL
      { wch: 20 }  // TOTAL ASIGNADOS
    ];
    XLSX.utils.book_append_sheet(wb, wsExactData, 'PLV_Y_PERSONEROS_FALTANTES');

    // HOJA 2: RESUMEN EJECUTIVO
    const wsResumen = XLSX.utils.json_to_sheet(resumenJerarquia);
    wsResumen['!cols'] = [{ wch: 24 }, { wch: 32 }, { wch: 14 }, { wch: 50 }];
    XLSX.utils.book_append_sheet(wb, wsResumen, 'RESUMEN_EJECUTIVO');

    // HOJA 3: PADRÓN ORDENADO JERÁRQUICO
    const wsMaster = XLSX.utils.json_to_sheet(cleanMasterList);
    wsMaster['!cols'] = [
      { wch: 6 },   // N°
      { wch: 30 },  // Jerarquía
      { wch: 26 },  // Distrito
      { wch: 42 },  // Local
      { wch: 26 },  // Mesa
      { wch: 36 },  // Nombres
      { wch: 12 },  // DNI
      { wch: 14 },  // Celular
      { wch: 28 },  // Correo
      { wch: 24 },  // Fecha y hora
      { wch: 18 },  // Credencial
      { wch: 18 }   // Tabla
    ];
    XLSX.utils.book_append_sheet(wb, wsMaster, 'PADRON_ORDENADO_JERARQUICO');

    // HOJA 4: PADRÓN OFICIAL DE COLEGIOS
    const cleanSchools = allSchools.map((s, idx) => ({ 'N°': idx + 1, ...s }));
    const wsColegios = XLSX.utils.json_to_sheet(cleanSchools);
    wsColegios['!cols'] = [
      { wch: 6 },   // N°
      { wch: 26 },  // Distrito
      { wch: 45 },  // Local
      { wch: 55 },  // Dirección
      { wch: 14 },  // Total Mesas
      { wch: 22 },  // Total Electores
      { wch: 12 }   // Ubigeo
    ];
    XLSX.utils.book_append_sheet(wb, wsColegios, 'PADRON_2211_LOCALES');

    const outPath = path.join(__dirname, '../../PADRON_GENERAL_SOMOS_PERU_2026.xlsx');
    XLSX.writeFile(wb, outPath);

    console.log(`\n======================================================`);
    console.log(`✅ EXCEL ACTUALIZADO CON DATA DE PLV Y PERSONEROS FALTANTES`);
    console.log(`📁 Archivo: ${outPath}`);
    console.log(`📊 Integrantes Registrados: ${cleanMasterList.length}`);
    console.log(`======================================================\n`);

  } catch (err) {
    console.error('Error al generar Excel ordenado:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
