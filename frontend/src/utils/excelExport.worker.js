import * as XLSX from 'xlsx';
import { LOCALES_OFICIALES } from '../constants/localesCatalog.js';

function normalize(str) {
  if (!str) return '';
  return String(str)
    .toUpperCase()
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^A-Z0-9]/g, ' ')
    .replace(/\s+/g, ' ')
    .trim();
}

function autoFitColumns(ws) {
  const colWidths = [];
  const range = XLSX.utils.decode_range(ws['!ref'] || 'A1');
  for (let C = range.s.c; C <= range.e.c; ++C) {
    let maxLen = 12;
    for (let R = range.s.r; R <= range.e.r; ++R) {
      const cell = ws[XLSX.utils.encode_cell({ r: R, c: C })];
      if (cell && cell.v !== undefined && cell.v !== null) {
        const valLen = String(cell.v).length;
        if (valLen > maxLen) maxLen = valLen;
      }
    }
    colWidths.push({ wch: Math.min(maxLen + 3, 50) });
  }
  ws['!cols'] = colWidths;
}

self.onmessage = function (e) {
  const { id, type, payload } = e.data || {};
  if (type !== 'GENERATE_PADRON_EXCEL') return;

  try {
    const {
      records = [],
      title = 'Padrón de Personeros',
      fileName = 'Padron_SomosPeru_2026.xlsx',
      scopeType = 'general',
      scopeName = ''
    } = payload || {};

    const wb = XLSX.utils.book_new();

    // 1. HOJA 1: PADRÓN DE PERSONEROS
    const sheet1Data = records.map((r, idx) => {
      let rawRol = String(r['Rol a Desempeñar'] || r.rolADesempenar || r.rol_electoral || 'Personero de Mesa').trim();
      if (rawRol.toLowerCase().includes('zonal') || rawRol.toLowerCase().includes('zona')) {
        rawRol = 'Coordinador Zonal';
      } else if (rawRol.toLowerCase().includes('local') || rawRol.toLowerCase().includes('centro') || rawRol.toLowerCase().includes('pcv')) {
        rawRol = 'Personero de Centro de Votación (PCV)';
      }

      const cred = String(r['Credenciales'] || r.credenciales || '').toLowerCase();
      const quiz = String(r['Preguntas'] || r.preguntas || '').toLowerCase();
      const isAcred = cred === 'confirmado' ? 'Acreditado' : 'Pendiente';
      const isCap = quiz.includes('aprob') || cred === 'confirmado' ? 'Aprobado' : 'En proceso';

      return {
        'Nº': idx + 1,
        'Nombres y Apellidos': String(r['Nombres y Apellidos'] || r.nombresApellidos || '').trim(),
        'DNI': String(r['D.N.I.'] || r['DNI'] || r.dni || '').trim(),
        'Teléfono / Celular': String(r['Celular'] || r.celular || r.telefono || '').trim(),
        'Rol a Desempeñar': rawRol,
        'Distrito Asignado': String(r['Distrito Asignado'] || r.distritoAsignado || r['Distrito donde Vota'] || r.distrito || '-').trim(),
        'Local de Votación Asignado': String(r['Local de Votación Asignado'] || r.localDeVotacionAsignado || r.localAsignado || r['Local de Votación'] || r.localDeVotacion || '-').trim(),
        'Mesa Asignada': String(r['Mesa Asignada'] || r.mesaAsignada || r['Mesa de Sufragio'] || r.mesaDeSufragio || r.mesa || '-').trim(),
        'Acreditación': isAcred,
        'Capacitación': isCap
      };
    });

    const ws1 = XLSX.utils.json_to_sheet(sheet1Data.length > 0 ? sheet1Data : [{ 'Mensaje': 'No hay personeros registrados en este ámbito' }]);
    autoFitColumns(ws1);
    XLSX.utils.book_append_sheet(wb, ws1, 'Padrón de Personeros');

    // 2. HOJA 2: CANTIDAD DE ROLES
    let countDistrital = 0;
    let countZonal = 0;
    let countPCV = 0;
    let countMesa = 0;

    records.forEach(r => {
      const rol = String(r['Rol a Desempeñar'] || r.rolADesempenar || r.rol_electoral || '').toLowerCase();
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

    const sheet2Data = [];
    if (countDistrital > 0) sheet2Data.push({ 'Rol a Desempeñar': 'Coordinador Distrital', 'Cantidad': countDistrital });
    if (countZonal > 0) sheet2Data.push({ 'Rol a Desempeñar': 'Coordinador Zonal', 'Cantidad': countZonal });
    sheet2Data.push({ 'Rol a Desempeñar': 'Personero de Centro de Votación (PCV)', 'Cantidad': countPCV });
    sheet2Data.push({ 'Rol a Desempeñar': 'Personero de Mesa', 'Cantidad': countMesa });
    sheet2Data.push({ 'Rol a Desempeñar': 'TOTAL GENERAL', 'Cantidad': records.length });

    const ws2 = XLSX.utils.json_to_sheet(sheet2Data);
    autoFitColumns(ws2);
    XLSX.utils.book_append_sheet(wb, ws2, 'Cantidad de Roles');

    // 3. HOJA 3: COBERTURA Y FALTANTES POR COLEGIO
    const localesInRecords = new Set();
    records.forEach(r => {
      const loc = String(r['Local de Votación Asignado'] || r.localDeVotacionAsignado || r.localAsignado || r['Local de Votación'] || '').trim();
      if (loc && loc !== '-' && !loc.toLowerCase().includes('no aplica')) {
        localesInRecords.add(loc);
      }
    });

    if (scopeType === 'colegio' && scopeName) {
      localesInRecords.add(scopeName);
    }

    const schoolStats = Array.from(localesInRecords).map((locName, idx) => {
      const normLoc = normalize(locName);
      const assignedPersoneros = records.filter(r => {
        const l = normalize(r['Local de Votación Asignado'] || r.localDeVotacionAsignado || r.localAsignado || r['Local de Votación'] || '');
        const rol = String(r['Rol a Desempeñar'] || r.rolADesempenar || '').toLowerCase();
        return (l === normLoc || l.includes(normLoc) || normLoc.includes(l)) && !rol.includes('distrital') && !rol.includes('zonal') && !rol.includes('local');
      }).length;

      const officialMatch = (LOCALES_OFICIALES || []).find(s => {
        const sNorm = normalize(s.nombre);
        return sNorm === normLoc || sNorm.includes(normLoc) || normLoc.includes(sNorm);
      });

      const totalMesas = officialMatch?.mesas || Math.max(1, assignedPersoneros);
      const faltan = Math.max(0, totalMesas - assignedPersoneros);

      return {
        'Nº': idx + 1,
        'Local de Votación (Colegio)': locName,
        'Total Mesas Oficiales': totalMesas,
        'Personeros de Mesa Asignados': assignedPersoneros,
        'Mesas Faltantes por Cubrir': faltan,
        '% Cobertura': totalMesas > 0 ? `${Math.min(100, Math.round((assignedPersoneros / totalMesas) * 100))}%` : '0%'
      };
    });

    if (schoolStats.length > 0) {
      const sumaMesas = schoolStats.reduce((acc, s) => acc + (s['Total Mesas Oficiales'] || 0), 0);
      const sumaAsignados = schoolStats.reduce((acc, s) => acc + (s['Personeros de Mesa Asignados'] || 0), 0);
      const sumaFaltantes = Math.max(0, sumaMesas - sumaAsignados);

      schoolStats.push({
        'Nº': 'TOTAL',
        'Local de Votación (Colegio)': `${schoolStats.length} Locales`,
        'Total Mesas Oficiales': sumaMesas,
        'Personeros de Mesa Asignados': sumaAsignados,
        'Mesas Faltantes por Cubrir': sumaFaltantes,
        '% Cobertura': sumaMesas > 0 ? `${Math.min(100, Math.round((sumaAsignados / sumaMesas) * 100))}%` : '0%'
      });
    }

    const ws3 = XLSX.utils.json_to_sheet(schoolStats.length > 0 ? schoolStats : [{ 'Mensaje': 'No hay datos de colegios disponibles' }]);
    autoFitColumns(ws3);
    XLSX.utils.book_append_sheet(wb, ws3, 'Cobertura por Colegio');

    // Escribir a buffer binario
    const outputBuffer = XLSX.write(wb, { bookType: 'xlsx', type: 'array' });

    // Reply asíncrono con objeto transferible para rendimiento óptimo
    self.postMessage(
      {
        id,
        status: 'SUCCESS',
        buffer: outputBuffer,
        fileName
      },
      [outputBuffer]
    );
  } catch (err) {
    self.postMessage({
      id,
      status: 'ERROR',
      error: err?.message || 'Error al generar el archivo Excel'
    });
  }
};
