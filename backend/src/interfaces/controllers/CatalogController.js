import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbPool } from '../../infrastructure/database/ConnectionPool.js';
import { DISTRITOS_LIMA, DISTRITO_METAS, ELECTORAL_ROLES } from '../../config/constants.js';
import { PostgresPersoneroRepository } from '../../infrastructure/repositories/PostgresPersoneroRepository.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class CatalogController {
  constructor(personeroRepository = null) {
    this.localesCache = null;
    this.personeroRepo = personeroRepository || new PostgresPersoneroRepository();
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

    if (clean === 'SAN JUAN DE LURIGANCHO' || clean.includes('SAN JUAN DE LURIGANCHO')) return 'SAN JUAN DE LURIGANCHO';
    if (clean === 'SAN JUAN DE MIRAFLORES' || clean.includes('SAN JUAN DE MIRAFLORES')) return 'SAN JUAN DE MIRAFLORES';
    if (clean === 'SAN MARTIN DE PORRES' || clean.includes('SAN MARTIN DE PORRES')) return 'SAN MARTIN DE PORRES';
    if (clean === 'LURIGANCHO-CHOSICA' || clean === 'CHOSICA' || clean === 'LURIGANCHO') return 'LURIGANCHO';
    if (clean === 'CERCADO DE LIMA' || clean === 'LIMA' || clean === 'LIMA CERCADO') return 'LIMA';
    if (clean === 'SANTIAGO DE SURCO' || clean === 'SURCO') return 'SANTIAGO DE SURCO';
    if (clean === 'MAGDALENA DEL MAR' || clean === 'MAGDALENA') return 'MAGDALENA DEL MAR';
    if (clean === 'VILLA MARIA DEL TRIUNFO' || clean === 'VMT') return 'VILLA MARIA DEL TRIUNFO';
    if (clean === 'VILLA EL SALVADOR' || clean === 'VES') return 'VILLA EL SALVADOR';
    if (clean === 'PUEBLO LIBRE') return 'PUEBLO LIBRE';
    return clean;
  }

  getDistrictVariants(name) {
    if (!name) return [];
    const raw = String(name).trim();
    const upper = raw.toUpperCase();
    const clean = upper.normalize('NFD').replace(/[\u0300-\u036f]/g, '');
    const variants = new Set([raw, upper, clean]);

    if (clean === 'SAN JUAN DE LURIGANCHO' || clean.includes('SAN JUAN DE LURIGANCHO')) {
      variants.add('SAN JUAN DE LURIGANCHO');
      variants.add('SJL');
    } else if (clean === 'SAN JUAN DE MIRAFLORES' || clean.includes('SAN JUAN DE MIRAFLORES')) {
      variants.add('SAN JUAN DE MIRAFLORES');
      variants.add('SJM');
    } else if (clean === 'SAN MARTIN DE PORRES' || clean.includes('SAN MARTIN DE PORRES')) {
      variants.add('SAN MARTIN DE PORRES');
      variants.add('SAN MARTÍN DE PORRES');
      variants.add('SMP');
    } else if (clean === 'LURIGANCHO' || clean.includes('CHOSICA') || clean === 'LURIGANCHO-CHOSICA') {
      variants.add('LURIGANCHO');
      variants.add('LURIGANCHO-CHOSICA');
      variants.add('CHOSICA');
    } else if (clean === 'LIMA' || clean === 'CERCADO DE LIMA' || clean === 'LIMA CERCADO') {
      variants.add('LIMA');
      variants.add('CERCADO DE LIMA');
      variants.add('LIMA CERCADO');
    } else if (clean === 'SANTIAGO DE SURCO' || clean === 'SURCO') {
      variants.add('SANTIAGO DE SURCO');
      variants.add('SURCO');
    } else if (clean === 'MAGDALENA DEL MAR' || clean === 'MAGDALENA') {
      variants.add('MAGDALENA DEL MAR');
      variants.add('MAGDALENA');
    } else if (clean === 'VILLA MARIA DEL TRIUNFO' || clean === 'VMT') {
      variants.add('VILLA MARIA DEL TRIUNFO');
      variants.add('VILLA MARÍA DEL TRIUNFO');
      variants.add('VMT');
    } else if (clean === 'VILLA EL SALVADOR' || clean === 'VES') {
      variants.add('VILLA EL SALVADOR');
      variants.add('VES');
    } else if (clean === 'PUEBLO LIBRE') {
      variants.add('PUEBLO LIBRE');
    }

    return Array.from(variants);
  }

  async getDistritos(req, res) {
    try {
      const pool = await dbPool.getPool();
      const dbResult = await pool.query(`
        SELECT DISTINCT distrito 
        FROM mesas 
        WHERE distrito IS NOT NULL AND TRIM(distrito) <> ''
        ORDER BY distrito
      `);

      if (dbResult?.rows?.length > 0) {
        const dbList = dbResult.rows.map(r => r.distrito).filter(Boolean);
        return res.json({ status: 'success', data: dbList, metas: DISTRITO_METAS, source: 'mesas' });
      }
    } catch (err) {
      console.warn('Consulta de distritos en PostgreSQL mesas falló, usando catálogo base:', err.message);
    }

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
    const { distrito, excludeAssigned } = req.query;

    if (distrito) {
      const variants = this.getDistrictVariants(distrito);
      const norm = this.normalizeDistrict(distrito);
      let assignedLocales = [];

      try {
        assignedLocales = await this.personeroRepo.getAssignedLocalesByDistrito(distrito);
      } catch (e) {
        console.warn('No se pudieron obtener los locales asignados:', e.message);
      }

      const isAssigned = (locName) => {
        const clean = String(locName || '').trim().toLowerCase();
        return assignedLocales.some(al => String(al).trim().toLowerCase() === clean);
      };

      // 1. Consultar en tabla mesas de PostgreSQL agrupado por colegio
      try {
        const pool = await dbPool.getPool();
        const placeholders = variants.map((_, i) => `$${i + 1}`).join(', ');

        const queryMesas = `
          SELECT 
            MIN(id) as id,
            distrito,
            colegio,
            MAX(direccion) as direccion,
            COUNT(*) as num_mesas,
            MAX(latitud) as latitud,
            MAX(longitud) as longitud,
            MAX(coordenadas_gps) as coordenadas_gps
          FROM mesas
          WHERE UPPER(distrito) IN (${placeholders})
          GROUP BY distrito, colegio
          ORDER BY colegio
        `;

        const dbResultMesas = await pool.query(queryMesas, variants.map(v => v.toUpperCase()));

        if (dbResultMesas && dbResultMesas.rows && dbResultMesas.rows.length > 0) {
          let list = dbResultMesas.rows.map(r => r.colegio).filter(Boolean);
          if (excludeAssigned === 'true' || excludeAssigned === true) {
            list = list.filter(l => !isAssigned(l));
          }
          const fullData = dbResultMesas.rows;
          return res.json({
            status: 'success',
            distrito,
            data: list,
            assignedLocales,
            fullDetails: fullData,
            source: 'mesas'
          });
        }
      } catch (err) {
        console.warn('Consulta en tabla mesas falló, usando catálogo local:', err.message);
      }

      // 2. Fallback al catálogo unificado local
      const locales = this.loadLocales();
      let list = locales[norm] ||
                 locales[distrito.trim().toUpperCase()] ||
                 locales[norm.replace('LIMA', 'CERCADO DE LIMA')] ||
                 locales[norm.replace('CERCADO DE LIMA', 'LIMA')] ||
                 locales[norm.replace('LURIGANCHO', 'LURIGANCHO-CHOSICA')] ||
                 [];

      if (excludeAssigned === 'true' || excludeAssigned === true) {
        list = list.filter(l => !isAssigned(l));
      }

      return res.json({
        status: 'success',
        distrito,
        data: list,
        assignedLocales,
        source: 'unifiedCatalogFallback'
      });
    }

    // Si no se especifica distrito, retornar todos los locales
    try {
      const pool = await dbPool.getPool();
      const dbResult = await pool.query(`
        SELECT 
          MIN(id) as id,
          distrito,
          colegio,
          MAX(direccion) as direccion,
          COUNT(*) as num_mesas,
          MAX(latitud) as latitud,
          MAX(longitud) as longitud,
          MAX(coordenadas_gps) as coordenadas_gps
        FROM mesas
        GROUP BY distrito, colegio
        ORDER BY distrito, colegio
      `);
      if (dbResult?.rows?.length > 0) {
        return res.json({ status: 'success', total: dbResult.rows.length, data: dbResult.rows, source: 'mesas' });
      }
    } catch {}

    res.json({
      status: 'success',
      data: this.loadLocales(),
      source: 'catalog'
    });
  }
}
