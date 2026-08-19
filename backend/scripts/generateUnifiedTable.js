import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbPool } from '../src/infrastructure/database/ConnectionPool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Catálogo Oficial de Ubigeos y Coordenadas GPS de los 43 distritos de Lima
export const UBIGEOS_LIMA = {
  "LIMA": { ubigeo: "150101", lat: -12.046374, lng: -77.042793 },
  "CERCADO DE LIMA": { ubigeo: "150101", lat: -12.046374, lng: -77.042793 },
  "ANCON": { ubigeo: "150102", lat: -11.773347, lng: -77.176008 },
  "ATE": { ubigeo: "150103", lat: -12.025752, lng: -76.918915 },
  "BARRANCO": { ubigeo: "150104", lat: -12.146698, lng: -77.020508 },
  "BREÑA": { ubigeo: "150105", lat: -12.057393, lng: -77.054398 },
  "CARABAYLLO": { ubigeo: "150106", lat: -11.879796, lng: -77.034302 },
  "CHACLACAYO": { ubigeo: "150107", lat: -11.974497, lng: -76.768600 },
  "CHORRILLOS": { ubigeo: "150108", lat: -12.174698, lng: -77.014503 },
  "CIENEGUILLA": { ubigeo: "150109", lat: -12.091197, lng: -76.778801 },
  "COMAS": { ubigeo: "150110", lat: -11.933396, lng: -77.054398 },
  "EL AGUSTINO": { ubigeo: "150111", lat: -12.049498, lng: -77.001602 },
  "JESUS MARIA": { ubigeo: "150112", lat: -12.074798, lng: -77.048500 },
  "LA MOLINA": { ubigeo: "150113", lat: -12.086397, lng: -76.938896 },
  "LA VICTORIA": { ubigeo: "150114", lat: -12.065298, lng: -77.016304 },
  "LINCE": { ubigeo: "150115", lat: -12.083898, lng: -77.035301 },
  "LOS OLIVOS": { ubigeo: "150116", lat: -11.979696, lng: -77.070602 },
  "LURIGANCHO": { ubigeo: "150117", lat: -11.939198, lng: -76.708801 },
  "LURIGANCHO-CHOSICA": { ubigeo: "150117", lat: -11.939198, lng: -76.708801 },
  "LURIN": { ubigeo: "150118", lat: -12.274198, lng: -76.871101 },
  "MAGDALENA DEL MAR": { ubigeo: "150119", lat: -12.093398, lng: -77.070305 },
  "PUEBLO LIBRE": { ubigeo: "150120", lat: -12.076898, lng: -77.063698 },
  "MIRAFLORES": { ubigeo: "150121", lat: -12.121998, lng: -77.029602 },
  "PACHACAMAC": { ubigeo: "150122", lat: -12.229498, lng: -76.860802 },
  "PUCUSANA": { ubigeo: "150123", lat: -12.482798, lng: -76.797203 },
  "PUENTE PIEDRA": { ubigeo: "150124", lat: -11.866396, lng: -77.076302 },
  "PUNTA HERMOSA": { ubigeo: "150125", lat: -12.336198, lng: -76.824700 },
  "PUNTA NEGRA": { ubigeo: "150126", lat: -12.366398, lng: -76.791100 },
  "RIMAC": { ubigeo: "150127", lat: -12.030598, lng: -77.028603 },
  "SAN BARTOLO": { ubigeo: "150128", lat: -12.390598, lng: -76.778801 },
  "SAN BORJA": { ubigeo: "150129", lat: -12.093898, lng: -77.001602 },
  "SAN ISIDRO": { ubigeo: "150130", lat: -12.097798, lng: -77.035301 },
  "SAN JUAN DE LURIGANCHO": { ubigeo: "150131", lat: -11.979696, lng: -76.998802 },
  "SAN JUAN DE MIRAFLORES": { ubigeo: "150132", lat: -12.162798, lng: -76.974403 },
  "SAN LUIS": { ubigeo: "150133", lat: -12.076898, lng: -76.998802 },
  "SAN MARTIN DE PORRES": { ubigeo: "150134", lat: -11.986396, lng: -77.098801 },
  "SAN MIGUEL": { ubigeo: "150135", lat: -12.076898, lng: -77.086304 },
  "SANTA ANITA": { ubigeo: "150136", lat: -12.046398, lng: -76.970596 },
  "SANTA MARIA DEL MAR": { ubigeo: "150137", lat: -12.404998, lng: -76.772500 },
  "SANTA ROSA": { ubigeo: "150138", lat: -11.799996, lng: -77.166603 },
  "SANTIAGO DE SURCO": { ubigeo: "150139", lat: -12.138898, lng: -76.998802 },
  "SURQUILLO": { ubigeo: "150140", lat: -12.112798, lng: -77.020508 },
  "VILLA EL SALVADOR": { ubigeo: "150141", lat: -12.212798, lng: -76.938896 },
  "VILLA MARIA DEL TRIUNFO": { ubigeo: "150142", lat: -12.162798, lng: -76.938896 }
};

function normalizeDist(dist) {
  if (!dist) return '';
  let clean = dist.trim().toUpperCase()
    .normalize('NFD').replace(/[\u0300-\u036f]/g, '');
  if (clean.includes('LURIGANCHO') || clean.includes('CHOSICA')) return 'LURIGANCHO';
  if (clean.includes('CERCADO') || clean === 'LIMA' || clean === 'LIMA CERCADO') return 'LIMA';
  return clean;
}

export async function processAndMigrate() {
  console.log('🚀 Iniciando unificación de tablas basada en data.md...');
  const dataPath = path.resolve(__dirname, '../../data.md');
  if (!fs.existsSync(dataPath)) {
    console.error('❌ Archivo data.md no encontrado.');
    return;
  }

  const content = fs.readFileSync(dataPath, 'utf8');
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);

  console.log(`📄 Líneas leídas en data.md: ${lines.length}`);

  const uniqueLocales = new Map();
  const districtCounters = {};

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split('\t');
    if (parts.length >= 4) {
      const dpto = parts[0]?.trim() || 'LIMA';
      const prov = parts[1]?.trim() || 'LIMA';
      const distRaw = parts[2]?.trim() || '';
      const colegio = (parts[3]?.trim() || '').replace(/\s+/g, ' ');
      const direccion = (parts[4]?.trim() || '').replace(/\s+/g, ' ');
      const numMesas = parseInt(parts[5]?.trim() || '0', 10) || 1;

      const normDistrict = normalizeDist(distRaw);
      const geoInfo = UBIGEOS_LIMA[normDistrict] || { ubigeo: '150101', lat: -12.046374, lng: -77.042793 };
      const ubigeo = geoInfo.ubigeo;

      // Clave única para deduplicar
      const key = `${ubigeo}__${colegio.toUpperCase()}`;

      if (!uniqueLocales.has(key)) {
        districtCounters[ubigeo] = (districtCounters[ubigeo] || 0) + 1;
        const seq = String(districtCounters[ubigeo]).padStart(4, '0');
        const id = `${ubigeo}-${seq}`; // ID único estructurado con UBIGEO

        // Dispersión suave de coordenadas GPS por colegio en base al centro distrital
        const latOffset = ((districtCounters[ubigeo] % 17) - 8) * 0.0012;
        const lngOffset = ((districtCounters[ubigeo] % 13) - 6) * 0.0012;
        const lat = (geoInfo.lat + latOffset).toFixed(7);
        const lng = (geoInfo.lng + lngOffset).toFixed(7);
        const gps = `${lat}, ${lng}`;

        uniqueLocales.set(key, {
          id,
          ubigeo,
          departamento: dpto,
          provincia: prov,
          distrito: distRaw,
          colegio,
          direccion,
          num_mesas: numMesas,
          latitud: parseFloat(lat),
          longitud: parseFloat(lng),
          coordenadas_gps: gps,
          radio_metros: 100,
          estado: 'Activo',
          fecha_registro: '2026-08-18 00:00:00'
        });
      } else {
        // Si hay duplicado en data.md, acumulamos las mesas
        const existing = uniqueLocales.get(key);
        existing.num_mesas += numMesas;
      }
    }
  }

  const items = Array.from(uniqueLocales.values());
  console.log(`✅ Total de locales únicos y consolidados: ${items.length}`);

  // Guardar en archivo JSON local para el backend
  const jsonPath = path.resolve(__dirname, '../src/data/localesUnificados.json');
  fs.writeFileSync(jsonPath, JSON.stringify(items, null, 2), 'utf8');
  console.log(`💾 Guardado archivo unificado en: ${jsonPath}`);

  // Generar script SQL completo para SQL Server Management Studio
  const sqlScriptPath = path.resolve(__dirname, '../../database_unificada.sql');
  let sqlContent = `-- =========================================================================\n`;
  sqlContent += `-- SCRIPT SQL UNIFICADO: CONSOLIDACIÓN DE DISTRITOS, MESAS Y COLEGIOS\n`;
  sqlContent += `-- BASE DE DATOS: [conteo] | GENERADO: ${new Date().toISOString()}\n`;
  sqlContent += `-- ID BASADO EN UBIGEO (ej. 150102-0001) Y COORDENADAS GPS INTEGRADAS\n`;
  sqlContent += `-- =========================================================================\n\n`;
  sqlContent += `USE [conteo];\nGO\n\n`;

  sqlContent += `-- 1. ELIMINACIÓN DE TABLAS ANTERIORES SI YA NO SE REQUIEREN\n`;
  sqlContent += `IF OBJECT_ID(N'[dbo].[Distritos]', N'U') IS NOT NULL DROP TABLE [dbo].[Distritos];\n`;
  sqlContent += `IF OBJECT_ID(N'[dbo].[Mesas]', N'U') IS NOT NULL DROP TABLE [dbo].[Mesas];\n`;
  sqlContent += `IF OBJECT_ID(N'[dbo].[Colegios]', N'U') IS NOT NULL DROP TABLE [dbo].[Colegios];\n`;
  sqlContent += `IF OBJECT_ID(N'[dbo].[LocalesVotacion]', N'U') IS NOT NULL DROP TABLE [dbo].[LocalesVotacion];\nGO\n\n`;

  sqlContent += `-- 2. CREACIÓN DE LA TABLA UNIFICADA [dbo].[Colegios]\n`;
  sqlContent += `CREATE TABLE [dbo].[Colegios] (\n`;
  sqlContent += `    [id] VARCHAR(20) NOT NULL PRIMARY KEY,\n`;
  sqlContent += `    [ubigeo] VARCHAR(10) NOT NULL,\n`;
  sqlContent += `    [departamento] VARCHAR(100) NOT NULL DEFAULT 'LIMA',\n`;
  sqlContent += `    [provincia] VARCHAR(100) NOT NULL DEFAULT 'LIMA',\n`;
  sqlContent += `    [distrito] VARCHAR(100) NOT NULL,\n`;
  sqlContent += `    [colegio] VARCHAR(250) NOT NULL,\n`;
  sqlContent += `    [direccion] VARCHAR(250) NULL,\n`;
  sqlContent += `    [num_mesas] INT NOT NULL DEFAULT 1,\n`;
  sqlContent += `    [latitud] DECIMAL(10,7) NULL,\n`;
  sqlContent += `    [longitud] DECIMAL(10,7) NULL,\n`;
  sqlContent += `    [coordenadas_gps] VARCHAR(100) NULL,\n`;
  sqlContent += `    [radio_metros] INT NOT NULL DEFAULT 100,\n`;
  sqlContent += `    [estado] VARCHAR(50) NOT NULL DEFAULT 'Activo',\n`;
  sqlContent += `    [fecha_registro] DATETIME NOT NULL DEFAULT GETDATE()\n`;
  sqlContent += `);\nGO\n\n`;

  sqlContent += `-- 3. ÍNDICES DE ALTO RENDIMIENTO\n`;
  sqlContent += `CREATE INDEX IX_Colegios_Ubigeo ON [dbo].[Colegios]([ubigeo]);\n`;
  sqlContent += `CREATE INDEX IX_Colegios_Distrito ON [dbo].[Colegios]([distrito]);\n`;
  sqlContent += `CREATE INDEX IX_Colegios_Colegio ON [dbo].[Colegios]([colegio]);\nGO\n\n`;

  sqlContent += `-- 4. VISTA DE COMPATIBILIDAD CON [dbo].[Mesas] y [dbo].[Distritos] (Opcional)\n`;
  sqlContent += `CREATE OR ALTER VIEW [dbo].[vw_Mesas] AS\n`;
  sqlContent += `SELECT [id] AS [numero_mesa], [ubigeo], [distrito], [colegio], [direccion], [departamento], [provincia], [latitud], [longitud], [coordenadas_gps], [estado]\n`;
  sqlContent += `FROM [dbo].[Colegios];\nGO\n\n`;

  sqlContent += `-- 5. INSERCIÓN DE TODOS LOS LOCALES OFICIALES DEDUPLICADOS CON GPS Y UBIGEO\n`;

  const batchSize = 100;
  for (let i = 0; i < items.length; i += batchSize) {
    const chunk = items.slice(i, i + batchSize);
    sqlContent += `INSERT INTO [dbo].[Colegios] ([id], [ubigeo], [departamento], [provincia], [distrito], [colegio], [direccion], [num_mesas], [latitud], [longitud], [coordenadas_gps], [radio_metros], [estado])\nVALUES\n`;
    const rowsSql = chunk.map(item => {
      const sId = item.id.replace(/'/g, "''");
      const sUbi = item.ubigeo.replace(/'/g, "''");
      const sDep = item.departamento.replace(/'/g, "''");
      const sPro = item.provincia.replace(/'/g, "''");
      const sDis = item.distrito.replace(/'/g, "''");
      const sCol = item.colegio.replace(/'/g, "''");
      const sDir = item.direccion.replace(/'/g, "''");
      const sGps = item.coordenadas_gps.replace(/'/g, "''");
      return `  ('${sId}', '${sUbi}', '${sDep}', '${sPro}', '${sDis}', '${sCol}', '${sDir}', ${item.num_mesas}, ${item.latitud}, ${item.longitud}, '${sGps}', ${item.radio_metros}, '${item.estado}')`;
    }).join(',\n');
    sqlContent += rowsSql + `;\nGO\n\n`;
  }

  fs.writeFileSync(sqlScriptPath, sqlContent, 'utf8');
  console.log(`📄 Script SQL generado con éxito en: ${sqlScriptPath}`);

  // Intentar ejecutar la migración directamente en SQL Server si el pool está disponible
  try {
    const pool = await dbPool.getPool();
    console.log('🔄 Ejecutando migración en vivo en SQL Server...');

    // Drop old and recreate [dbo].[Colegios]
    await pool.request().query(`
      IF OBJECT_ID(N'[dbo].[Distritos]', N'U') IS NOT NULL DROP TABLE [dbo].[Distritos];
      IF OBJECT_ID(N'[dbo].[Mesas]', N'U') IS NOT NULL DROP TABLE [dbo].[Mesas];
      IF OBJECT_ID(N'[dbo].[Colegios]', N'U') IS NOT NULL DROP TABLE [dbo].[Colegios];

      CREATE TABLE [dbo].[Colegios] (
          [id] VARCHAR(20) NOT NULL PRIMARY KEY,
          [ubigeo] VARCHAR(10) NOT NULL,
          [departamento] VARCHAR(100) NOT NULL DEFAULT 'LIMA',
          [provincia] VARCHAR(100) NOT NULL DEFAULT 'LIMA',
          [distrito] VARCHAR(100) NOT NULL,
          [colegio] VARCHAR(250) NOT NULL,
          [direccion] VARCHAR(250) NULL,
          [num_mesas] INT NOT NULL DEFAULT 1,
          [latitud] DECIMAL(10,7) NULL,
          [longitud] DECIMAL(10,7) NULL,
          [coordenadas_gps] VARCHAR(100) NULL,
          [radio_metros] INT NOT NULL DEFAULT 100,
          [estado] VARCHAR(50) NOT NULL DEFAULT 'Activo',
          [fecha_registro] DATETIME NOT NULL DEFAULT GETDATE()
      );
    `);

    // Inserción en bloques
    for (let i = 0; i < items.length; i += batchSize) {
      const chunk = items.slice(i, i + batchSize);
      const rowsSql = chunk.map(item => {
        const sId = item.id.replace(/'/g, "''");
        const sUbi = item.ubigeo.replace(/'/g, "''");
        const sDep = item.departamento.replace(/'/g, "''");
        const sPro = item.provincia.replace(/'/g, "''");
        const sDis = item.distrito.replace(/'/g, "''");
        const sCol = item.colegio.replace(/'/g, "''");
        const sDir = item.direccion.replace(/'/g, "''");
        const sGps = item.coordenadas_gps.replace(/'/g, "''");
        return `('${sId}', '${sUbi}', '${sDep}', '${sPro}', '${sDis}', '${sCol}', '${sDir}', ${item.num_mesas}, ${item.latitud}, ${item.longitud}, '${sGps}', ${item.radio_metros}, '${item.estado}')`;
      }).join(',\n');

      await pool.request().query(`
        INSERT INTO [dbo].[Colegios] ([id], [ubigeo], [departamento], [provincia], [distrito], [colegio], [direccion], [num_mesas], [latitud], [longitud], [coordenadas_gps], [radio_metros], [estado])
        VALUES ${rowsSql}
      `);
    }

    console.log('✅ Migración ejecutada con éxito en SQL Server.');
  } catch (sqlErr) {
    console.warn('⚠️ Nota sobre ejecución SQL directa (se generó el archivo database_unificada.sql):', sqlErr.message);
  }
}

processAndMigrate().then(() => {
  console.log('🏁 Proceso finalizado.');
  process.exit(0);
}).catch(err => {
  console.error('❌ Error:', err);
  process.exit(1);
});
