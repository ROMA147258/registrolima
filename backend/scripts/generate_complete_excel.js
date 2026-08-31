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
      const id = parts[0]?.trim();
      const ubigeo = parts[1]?.trim();
      const dep = parts[2]?.trim();
      const prov = parts[3]?.trim();
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
        'N°': allSchools.length + 1,
        'UBIGEO': ubigeo,
        'DEPARTAMENTO': dep,
        'PROVINCIA': prov,
        'DISTRITO': distNorm,
        'LOCAL DE VOTACIÓN': localNombre,
        'DIRECCIÓN': direccion,
        'TOTAL MESAS': numMesas,
        'TOTAL ELECTORES (x300)': numMesas * 300
      });
    }
  }

  return { targets, allSchools };
}

async function run() {
  const client = await pool.connect();
  try {
    const { targets, allSchools } = parseDataMd();

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

    const districtStats = {};
    DISTRITOS_43.forEach(d => {
      districtStats[d] = {
        'DISTRITO': d,
        'PERSONEROS ASIGNADOS': 0,
        'COORD. LOCAL': 0,
        'COORD. DISTRITAL': 0,
        'COORD. ZONAL': 0,
        'TOTAL REGISTRADOS': 0,
        'META MESAS': targets[d]?.mesas || 0,
        'META LOCALES': targets[d]?.locales || 0,
        'META ELECTORES': targets[d]?.electores || 0,
        'COBERTURA MESAS %': '0.0%',
        'MESAS FALTANTES': targets[d]?.mesas || 0
      };
    });

    for (const item of targetTables) {
      const res = await client.query(`SELECT * FROM "${item.name}" ORDER BY id ASC`);
      counts[item.label] = res.rows.length;

      res.rows.forEach(r => {
        const dni = String(r.dni || r['D.N.I.'] || r.d_n_i || r.documento || '').trim();
        const nombres = String(r.nombres_y_apellidos || r['Nombres y Apellidos'] || r.nombres || r.nombre || '').trim();
        const celular = String(r.celular || r['Celular'] || r.telefono || '').trim();
        const email = String(r.correo_electronico || r['Correo Electrónico'] || r.email || '').trim();
        const distVota = String(r.distrito_donde_vota || r['Distrito donde Vota'] || '').trim();
        const localVota = String(r.local_de_votacion || r['Local de Votación'] || '').trim();
        const mesaVota = String(r.mesa_de_sufragio || r['Mesa de Sufragio'] || '').trim();
        
        const rawDistrito = String(r.distrito_asignado || r['Distrito Asignado'] || r.distrito_donde_vota || r.distrito || '').trim();
        const distritoAsig = normalizeDistrict(rawDistrito);

        const localAsig = String(r.local_de_votacion_asignado || r['Local de Votación Asignado'] || r.local_asignado || (item.name === 'rcoordinadoresd' ? 'No aplica (Distrital)' : '')).trim();
        const mesaAsig = String(r.mesa_asignada || r['Mesa Asignada'] || (item.name === 'rpersoneros' ? (r.mesa_de_sufragio || '-') : 'No aplica')).trim();
        const rol = String(r.rol_a_desempenar || r['Rol a Desempeñar'] || r.rol || item.label).trim();
        
        const exp = String(r.tiene_experiencia_como_personero || r['Tiene Experiencia'] || 'No').trim();
        const mov = String(r.cuenta_con_movilidad_propia || r['Cuenta con Movilidad'] || 'No').trim();
        const comp = String(r.se_compromete_a_colaborar_el_4_de_octubre_del_2026_en_las_elecc || r['Compromiso'] || 'Sí').trim();
        const cred = String(r.credenciales || r['Estado Credencial'] || 'Confirmado').trim();
        const token = String(r.token_verificacion || `SP-LM2026-${dni}`).trim();

        if (districtStats[distritoAsig]) {
          if (item.name === 'rpersoneros') districtStats[distritoAsig]['PERSONEROS ASIGNADOS']++;
          else if (item.name === 'rcoordinadores') districtStats[distritoAsig]['COORD. LOCAL']++;
          else if (item.name === 'rcoordinadoresd') districtStats[distritoAsig]['COORD. DISTRITAL']++;
          else if (item.name === 'rcoordinadoresz') districtStats[distritoAsig]['COORD. ZONAL']++;
          districtStats[distritoAsig]['TOTAL REGISTRADOS']++;
        }

        allRecords.push({
          'N°': allRecords.length + 1,
          'NOMBRES Y APELLIDOS': nombres,
          'DNI': dni,
          'ROL A DESEMPEÑAR': rol,
          'DISTRITO ASIGNADO': distritoAsig,
          'LOCAL DE VOTACIÓN ASIGNADO': localAsig,
          'MESA ASIGNADA': mesaAsig,
          'CELULAR': celular,
          'CORREO ELECTRÓNICO': email,
          'DISTRITO DONDE VOTA': distVota,
          'LOCAL DONDE VOTA': localVota,
          'MESA DE SUFRAGIO (DNI)': mesaVota,
          'EXPERIENCIA': exp,
          'MOVILIDAD': mov,
          'ESTADO CREDENCIAL': cred,
          'CÓDIGO / TOKEN': token,
          'TABLA DE ORIGEN': item.name
        });
      });
    }

    DISTRITOS_43.forEach(d => {
      const row = districtStats[d];
      const metaM = row['META MESAS'];
      const asignadosP = row['PERSONEROS ASIGNADOS'];
      const pct = metaM > 0 ? ((asignadosP / metaM) * 100).toFixed(1) : '0.0';
      row['COBERTURA MESAS %'] = `${pct}%`;
      row['MESAS FALTANTES'] = Math.max(0, metaM - asignadosP);
    });

    const totalGeneral = allRecords.length;

    // Crear Libro de Excel
    const wb = XLSX.utils.book_new();

    // 1. Hoja Completa de Integrantes
    const wsTodoJunto = XLSX.utils.json_to_sheet(allRecords);
    wsTodoJunto['!cols'] = [
      { wch: 6 },   // N°
      { wch: 38 },  // Nombres y Apellidos
      { wch: 12 },  // DNI
      { wch: 28 },  // Rol a Desempeñar
      { wch: 28 },  // Distrito Asignado
      { wch: 45 },  // Local de Votación Asignado
      { wch: 16 },  // Mesa Asignada
      { wch: 14 },  // Celular
      { wch: 28 },  // Correo
      { wch: 24 },  // Distrito Donde Vota
      { wch: 36 },  // Local Donde Vota
      { wch: 18 },  // Mesa DNI
      { wch: 14 },  // Experiencia
      { wch: 14 },  // Movilidad
      { wch: 20 },  // Credencial
      { wch: 22 },  // Token
      { wch: 18 }   // Tabla
    ];
    XLSX.utils.book_append_sheet(wb, wsTodoJunto, '1_REGISTRO_COMPLETO');

    // 2. Hoja de Conteo por Distrito
    const districtList = Object.values(districtStats).sort((a, b) => b['TOTAL REGISTRADOS'] - a['TOTAL REGISTRADOS'] || b['META MESAS'] - a['META MESAS']);
    
    const totalRowDistrict = {
      'DISTRITO': 'TOTAL LIMA METROPOLITANA (43 DISTRITOS)',
      'PERSONEROS ASIGNADOS': districtList.reduce((acc, d) => acc + d['PERSONEROS ASIGNADOS'], 0),
      'COORD. LOCAL': districtList.reduce((acc, d) => acc + d['COORD. LOCAL'], 0),
      'COORD. DISTRITAL': districtList.reduce((acc, d) => acc + d['COORD. DISTRITAL'], 0),
      'COORD. ZONAL': districtList.reduce((acc, d) => acc + d['COORD. ZONAL'], 0),
      'TOTAL REGISTRADOS': totalGeneral,
      'META MESAS': districtList.reduce((acc, d) => acc + d['META MESAS'], 0),
      'META LOCALES': districtList.reduce((acc, d) => acc + d['META LOCALES'], 0),
      'META ELECTORES': districtList.reduce((acc, d) => acc + d['META ELECTORES'], 0),
      'COBERTURA MESAS %': `${((districtList.reduce((acc, d) => acc + d['PERSONEROS ASIGNADOS'], 0) / districtList.reduce((acc, d) => acc + d['META MESAS'], 0)) * 100).toFixed(2)}%`,
      'MESAS FALTANTES': districtList.reduce((acc, d) => acc + d['MESAS FALTANTES'], 0)
    };
    const districtTableData = [...districtList, totalRowDistrict];

    const wsDistrict = XLSX.utils.json_to_sheet(districtTableData);
    wsDistrict['!cols'] = [
      { wch: 32 }, // Distrito
      { wch: 22 }, // Personeros Asignados
      { wch: 16 }, // Coord Local
      { wch: 18 }, // Coord Distrital
      { wch: 16 }, // Coord Zonal
      { wch: 18 }, // Total Registrados
      { wch: 14 }, // Meta Mesas
      { wch: 14 }, // Meta Locales
      { wch: 18 }, // Meta Electores
      { wch: 20 }, // Cobertura Mesas %
      { wch: 18 }  // Mesas Faltantes
    ];
    XLSX.utils.book_append_sheet(wb, wsDistrict, '2_CANTIDAD_POR_DISTRITO');

    // 3. Hoja de Conteo por Rol y Tabla
    const summaryRows = [
      { 'ROL': 'Coordinadores de Local', 'TABLA': 'rcoordinadores', 'CANTIDAD': counts['Coordinador de Local'] },
      { 'ROL': 'Personeros de Mesa', 'TABLA': 'rpersoneros', 'CANTIDAD': counts['Personero de Mesa'] },
      { 'ROL': 'Coordinadores Distritales', 'TABLA': 'rcoordinadoresd', 'CANTIDAD': counts['Coordinador Distrital'] },
      { 'ROL': 'Coordinadores Zonales', 'TABLA': 'rcoordinadoresz', 'CANTIDAD': counts['Coordinador Zonal'] },
      { 'ROL': 'TOTAL GENERAL', 'TABLA': 'TODAS LAS TABLAS', 'CANTIDAD': totalGeneral }
    ];
    const wsSummary = XLSX.utils.json_to_sheet(summaryRows);
    wsSummary['!cols'] = [{ wch: 28 }, { wch: 20 }, { wch: 14 }];
    XLSX.utils.book_append_sheet(wb, wsSummary, '3_CANTIDAD_POR_ROL_Y_TABLA');

    // 4. Hoja del Padrón Oficial de Locales
    const wsSchools = XLSX.utils.json_to_sheet(allSchools);
    wsSchools['!cols'] = [
      { wch: 6 },   // N°
      { wch: 12 },  // Ubigeo
      { wch: 16 },  // Departamento
      { wch: 16 },  // Provincia
      { wch: 26 },  // Distrito
      { wch: 45 },  // Local de Votación
      { wch: 55 },  // Dirección
      { wch: 14 },  // Total Mesas
      { wch: 22 }   // Total Electores
    ];
    XLSX.utils.book_append_sheet(wb, wsSchools, '4_PADRON_OFICIAL_2211_LOCALES');

    const outPath = path.join(__dirname, '../../REGISTRO_SOMOS_PERU_COMPLETO.xlsx');
    const outPathLegacy = path.join(__dirname, '../../REGISTRO_SOMOS_PERU_TODO_JUNTO.xlsx');

    XLSX.writeFile(wb, outPath);
    XLSX.writeFile(wb, outPathLegacy);

    console.log(`\n======================================================`);
    console.log(`✅ ARCHIVO EXCEL COMPLETO GENERADO`);
    console.log(`📁 Archivo Oficial: ${outPath}`);
    console.log(`📊 TOTAL REGISTRADOS: ${totalGeneral}`);
    console.log(`📊 TOTAL LOCALES PADRÓN: ${allSchools.length}`);
    console.log(`======================================================\n`);

  } catch (err) {
    console.error('Error al generar Excel completo:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
