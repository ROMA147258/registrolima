import { ExcelExportService } from '../../infrastructure/external/ExcelExportService.js';
import { LOCALES_OFICIALES } from '../../constants/localesCatalog.js';

function normalizeDistrictName(name) {
  if (!name) return '';
  let clean = String(name).trim().toUpperCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (clean.includes('LURIGANCHO') || clean.includes('CHOSICA')) return 'LURIGANCHO-CHOSICA';
  if (clean.includes('CERCADO') || clean === 'LIMA' || clean === 'LIMA CERCADO') return 'CERCADO DE LIMA';
  if (clean === 'MAGDALENA') return 'MAGDALENA DEL MAR';
  if (clean === 'SAN JUAN DE LURIGANCHO' || clean === 'SJL') return 'SAN JUAN DE LURIGANCHO';
  if (clean === 'SAN JUAN DE MIRAFLORES' || clean === 'SJM') return 'SAN JUAN DE MIRAFLORES';
  if (clean === 'VILLA EL SALVADOR' || clean === 'VES') return 'VILLA EL SALVADOR';
  if (clean === 'VILLA MARIA DEL TRIUNFO' || clean === 'VMT') return 'VILLA MARIA DEL TRIUNFO';
  if (clean === 'SAN MARTIN DE PORRES' || clean === 'SMP') return 'SAN MARTIN DE PORRES';
  return clean;
}

function normalizeLocalName(name) {
  if (!name) return '';
  return String(name).trim().toUpperCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

export class ExportRecordsUseCase {
  constructor(personeroRepository) {
    this.personeroRepo = personeroRepository;
  }

  // Hoja 1: Únicamente los datos más relevantes solicitados
  formatRecordForSheet1(r, index) {
    const data = r.toJSON ? r.toJSON() : r;

    return {
      'Nº': index + 1,
      'Nombres y Apellidos': String(data.nombresApellidos || data['Nombres y Apellidos'] || data.nombres_y_apellidos || '').trim(),
      'DNI': String(data.dni || data['D.N.I.'] || data.DNI || '').trim(),
      'Teléfono': String(data.celular || data.Celular || data.telefono || '').trim(),
      'Rol a Desempeñar': String(data.rolADesempenar || data['Rol a Desempeñar'] || data.rol_a_desempenar || 'Personero de Mesa').trim(),
      'Local de Votación Asignado': String(data.localDeVotacionAsignado || data['Local de Votación Asignado'] || data.local_de_votacion_asignado || data.localDeVotacion || data['Local de Votación'] || '-').trim(),
      'Mesa Asignada': String(data.mesaAsignada || data['Mesa Asignada'] || data.mesa_asignada || data.mesaDeSufragio || data['Mesa de Sufragio'] || '-').trim()
    };
  }

  // Hoja 2: Cantidad de roles a desempeñar (KPI)
  generateSheet2Roles(records) {
    let countDistrital = 0;
    let countZonal = 0;
    let countPCV = 0;
    let countMesa = 0;

    records.forEach(r => {
      const d = r.toJSON ? r.toJSON() : r;
      const rol = String(d.rolADesempenar || d['Rol a Desempeñar'] || d.rol_a_desempenar || '').toLowerCase();

      if (rol.includes('distrito') || rol.includes('distrital')) {
        countDistrital++;
      } else if (rol.includes('zonal') || rol.includes('zona')) {
        countZonal++;
      } else if (rol.includes('local') || rol.includes('centro') || rol.includes('pcv') || rol.includes('plv')) {
        countPCV++;
      } else {
        countMesa++;
      }
    });

    const total = records.length;

    return [
      { 'Rol a Desempeñar': 'Coordinador Distrital', 'Cantidad': countDistrital },
      { 'Rol a Desempeñar': 'Coordinador Zonal', 'Cantidad': countZonal },
      { 'Rol a Desempeñar': 'Personero de Centro de Votación (PCV)', 'Cantidad': countPCV },
      { 'Rol a Desempeñar': 'Personero de Mesa', 'Cantidad': countMesa },
      { 'Rol a Desempeñar': 'TOTAL GENERAL', 'Cantidad': total }
    ];
  }

  // Hoja 3: Cuántos faltan por completar por cada colegio con su total (KPI)
  generateSheet3SchoolCoverage(records, districtName = null) {
    let officialSchools = LOCALES_OFICIALES || [];
    if (districtName && districtName !== 'all') {
      const normDist = normalizeDistrictName(districtName);
      officialSchools = officialSchools.filter(s => normalizeDistrictName(s.distrito) === normDist);
    }

    const schoolStats = officialSchools.map((sch, idx) => {
      const normSchName = normalizeLocalName(sch.nombre);

      let personerosAsignados = 0;

      records.forEach(r => {
        const d = r.toJSON ? r.toJSON() : r;
        const local = normalizeLocalName(d.localDeVotacionAsignado || d['Local de Votación Asignado'] || d.local_de_votacion_asignado || d.localDeVotacion || d['Local de Votación'] || '');
        if (!local) return;

        if (local === normSchName || local.includes(normSchName) || normSchName.includes(local)) {
          personerosAsignados++;
        }
      });

      const totalMesas = sch.mesas || 1;
      const faltanCompletar = Math.max(0, totalMesas - personerosAsignados);

      return {
        'Nº': idx + 1,
        'Local de Votación (Colegio)': sch.nombre,
        'Total Mesas': totalMesas,
        'Personeros Asignados': personerosAsignados,
        'Faltan por Completar': faltanCompletar
      };
    });

    // Fila de Total Consolidado
    const sumaMesas = schoolStats.reduce((acc, s) => acc + (s['Total Mesas'] || 0), 0);
    const sumaAsignados = schoolStats.reduce((acc, s) => acc + (s['Personeros Asignados'] || 0), 0);
    const sumaFaltantes = Math.max(0, sumaMesas - sumaAsignados);

    schoolStats.push({
      'Nº': 'TOTAL',
      'Local de Votación (Colegio)': `${schoolStats.length} Colegios`,
      'Total Mesas': sumaMesas,
      'Personeros Asignados': sumaAsignados,
      'Faltan por Completar': sumaFaltantes
    });

    return schoolStats;
  }

  async execute(format = 'xlsx', filterDistrict = null) {
    let rawRecords = await this.personeroRepo.getAllCombined();

    // 1. Deduplicación estricta por DNI
    const uniqueMap = new Map();
    rawRecords.forEach(r => {
      const d = r.toJSON ? r.toJSON() : r;
      const dni = String(d.dni || d.DNI || d['D.N.I.'] || '').trim();
      if (dni && !uniqueMap.has(dni)) {
        uniqueMap.set(dni, r);
      }
    });
    let records = Array.from(uniqueMap.values());

    // 2. Filtro estricto por distrito (SOLO el distrito correspondiente)
    const activeDistrict = filterDistrict && filterDistrict !== 'all' ? filterDistrict.trim() : null;
    if (activeDistrict) {
      const normFilter = normalizeDistrictName(activeDistrict);
      records = records.filter(r => {
        const d = r.toJSON ? r.toJSON() : r;
        const distAsig = normalizeDistrictName(d.distritoAsignado || d['Distrito Asignado'] || d.distrito_asignado);
        const distVota = normalizeDistrictName(d.distritoDondeVota || d['Distrito donde Vota'] || d.distrito_donde_vota);
        return distAsig === normFilter || (!distAsig && distVota === normFilter);
      });
    }

    // 3. Orden por Apellidos / Nombres
    records.sort((a, b) => {
      const da = a.toJSON ? a.toJSON() : a;
      const db = b.toJSON ? b.toJSON() : b;
      const nameA = String(da.nombresApellidos || da['Nombres y Apellidos'] || '').toLowerCase();
      const nameB = String(db.nombresApellidos || db['Nombres y Apellidos'] || '').toLowerCase();
      return nameA.localeCompare(nameB);
    });

    // 4. Hojas solicitadas
    // Hoja 1: Padrón con solo Nombre, DNI, Teléfono, Rol, Local y Mesa
    const sheet1Data = records.map((r, i) => this.formatRecordForSheet1(r, i));

    if (format === 'csv') {
      const csv = ExcelExportService.generateCsvBuffer(sheet1Data);
      const safeDistName = activeDistrict ? activeDistrict.replace(/\s+/g, '_') : 'Lima';
      return {
        buffer: Buffer.from(csv, 'utf8'),
        contentType: 'text/csv; charset=utf-8',
        filename: `Padron_SomosPeru_${safeDistName}_2026.csv`
      };
    }

    // Hoja 2: Cantidad de roles a desempeñar
    const sheet2Data = this.generateSheet2Roles(records);

    // Hoja 3: Cuántos faltan por completar por cada colegio con su total
    const sheet3Data = this.generateSheet3SchoolCoverage(records, activeDistrict);

    const sheets = [
      { sheetName: 'Padrón de Personeros', data: sheet1Data },
      { sheetName: 'Cantidad de Roles', data: sheet2Data },
      { sheetName: 'Faltantes por Colegio', data: sheet3Data }
    ];

    const buffer = ExcelExportService.generateMultiSheetExcelBuffer(sheets);
    const safeDistName = activeDistrict ? activeDistrict.replace(/\s+/g, '_') : 'Lima_Metropolitana';

    return {
      buffer,
      contentType: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
      filename: `Padron_SomosPeru_${safeDistName}_2026.xlsx`
    };
  }
}
