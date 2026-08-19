import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sql from 'mssql';
import { dbPool } from '../../infrastructure/database/ConnectionPool.js';
import { DISTRITOS_LIMA, DISTRITO_METAS, ELECTORAL_ROLES } from '../../config/constants.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class CatalogController {
  constructor() {
    this.localesCache = null;
  }

  loadLocales() {
    if (this.localesCache) return this.localesCache;
    try {
      const unifiedPath = path.resolve(__dirname, '../../data/localesUnificados.json');
      const fallbackPath = path.resolve(__dirname, '../../data/localesData.json');

      if (fs.existsSync(unifiedPath)) {
        const raw = fs.readFileSync(unifiedPath, 'utf8');
        const list = JSON.parse(raw);
        this.localesCache = {};
        list.forEach(item => {
          const d = this.normalizeDistrict(item.distrito);
          if (!this.localesCache[d]) this.localesCache[d] = [];
          this.localesCache[d].push(item.colegio);
        });
        return this.localesCache;
      }

      if (fs.existsSync(fallbackPath)) {
        const raw = fs.readFileSync(fallbackPath, 'utf8');
        this.localesCache = JSON.parse(raw);
        return this.localesCache;
      }
      this.localesCache = {};
    } catch {
      this.localesCache = {};
    }
    return this.localesCache;
  }

  normalizeDistrict(name) {
    if (!name) return '';
    let clean = String(name).trim().toUpperCase();
    clean = clean.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    if (clean.includes('LURIGANCHO') || clean.includes('CHOSICA')) return 'LURIGANCHO';
    if (clean.includes('CERCADO') || clean === 'LIMA' || clean === 'LIMA CERCADO') return 'LIMA';
    return clean;
  }

  async getDistritos(req, res) {
    try {
      const pool = await dbPool.getPool();
      const dbResult = await pool.request().query(`
        SELECT DISTINCT [distrito] FROM [dbo].[Colegios] WHERE [distrito] IS NOT NULL ORDER BY [distrito]
      `);

      if (dbResult?.recordset?.length > 0) {
        const dbList = dbResult.recordset.map(r => r.distrito).filter(Boolean);
        return res.json({ status: 'success', data: dbList, metas: DISTRITO_METAS, source: 'dbo.Colegios' });
      }
    } catch {}

    res.json({
      status: 'success',
      data: DISTRITOS_LIMA,
      metas: DISTRITO_METAS,
      source: 'constants'
    });
  }

  getRoles(req, res) {
    res.json({
      status: 'success',
      data: ELECTORAL_ROLES
    });
  }

  async getLocales(req, res) {
    const { distrito } = req.query;

    if (distrito) {
      const raw = String(distrito).trim();
      const norm = this.normalizeDistrict(raw);
      const upper = raw.toUpperCase();

      // 1. Consultar en la tabla unificada dbo.Colegios de SQL Server en tiempo real
      try {
        const pool = await dbPool.getPool();
        const dbResult = await pool.request()
          .input('distrito', sql.NVarChar, upper)
          .input('norm', sql.NVarChar, norm)
          .query(`
            SELECT DISTINCT [id], [ubigeo], [distrito], [colegio], [direccion], [num_mesas], [latitud], [longitud], [coordenadas_gps]
            FROM [dbo].[Colegios]
            WHERE UPPER([distrito]) IN (@distrito, @norm, 'LIMA', 'CERCADO DE LIMA', 'LURIGANCHO')
               OR UPPER([distrito]) LIKE '%' + @norm + '%'
            ORDER BY [colegio]
          `);

        if (dbResult && dbResult.recordset && dbResult.recordset.length > 0) {
          const list = dbResult.recordset.map(r => r.colegio).filter(Boolean);
          const fullData = dbResult.recordset;
          return res.json({ status: 'success', distrito, data: list, fullDetails: fullData, source: 'dbo.Colegios' });
        }
      } catch (err) {
        console.warn('Consulta en dbo.Colegios falló, usando catálogo:', err.message);
      }

      // 2. Fallback al catálogo unificado local
      const locales = this.loadLocales();
      const list = locales[norm] ||
                   locales[upper] ||
                   locales[norm.replace('LIMA', 'CERCADO DE LIMA')] ||
                   locales[norm.replace('CERCADO DE LIMA', 'LIMA')] ||
                   locales[norm.replace('LURIGANCHO', 'LURIGANCHO-CHOSICA')] ||
                   [];

      return res.json({ status: 'success', distrito, data: list, source: 'unifiedCatalogFallback' });
    }

    // Si no se especifica distrito, retornar todos los locales
    try {
      const pool = await dbPool.getPool();
      const dbResult = await pool.request().query(`
        SELECT [id], [ubigeo], [distrito], [colegio], [direccion], [num_mesas], [latitud], [longitud], [coordenadas_gps]
        FROM [dbo].[Colegios]
        ORDER BY [distrito], [colegio]
      `);
      if (dbResult?.recordset?.length > 0) {
        return res.json({ status: 'success', total: dbResult.recordset.length, data: dbResult.recordset });
      }
    } catch {}

    res.json({
      status: 'success',
      data: this.loadLocales(),
      source: 'catalog'
    });
  }
}
