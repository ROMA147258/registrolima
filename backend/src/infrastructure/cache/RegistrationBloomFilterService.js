import { BloomFilter } from './BloomFilter.js';
import { dbPool } from '../database/ConnectionPool.js';

class RegistrationBloomFilterService {
  constructor() {
    this.dniFilter = new BloomFilter(50000, 0.005);
    this.phoneFilter = new BloomFilter(50000, 0.005);
    this.emailFilter = new BloomFilter(50000, 0.005);
    this.nameFilter = new BloomFilter(50000, 0.005);
    this.usernameFilter = new BloomFilter(5000, 0.001);
    this.isInitialized = false;
    this.initPromise = null;

    // Pre-populate known admin usernames
    ['supera', 'admin', 'eric', 'paola', 'pola', 'susana'].forEach(u => {
      this.usernameFilter.add(u);
    });
  }

  /**
   * Initialize and populate Bloom Filters from PostgreSQL
   */
  async init() {
    if (this.isInitialized) return;
    if (this.initPromise) return this.initPromise;

    this.initPromise = (async () => {
      try {
        const pool = await dbPool.getPool();

        // 1. Fetch from rpersoneros
        let personerosRes = { rows: [] };
        try {
          personerosRes = await pool.query(`
            SELECT dni, celular, correo_electronico as email, nombres_y_apellidos as nombre
            FROM rpersoneros
            WHERE dni IS NOT NULL
          `);
        } catch (e) {}

        // 2. Fetch from rcoordinadores
        let coordsRes = { rows: [] };
        try {
          coordsRes = await pool.query(`
            SELECT dni, celular, correo_electronico as email, nombres_y_apellidos as nombre
            FROM rcoordinadores
            WHERE dni IS NOT NULL
          `);
        } catch (e) {}

        // 3. Fetch from rcoordinadoresd
        let coordsDRes = { rows: [] };
        try {
          coordsDRes = await pool.query(`
            SELECT dni, celular, correo_electronico as email, nombres_y_apellidos as nombre, clave_acceso
            FROM rcoordinadoresd
            WHERE dni IS NOT NULL
          `);
        } catch (e) {}

        // 4. Fetch from rcoordinadoresz
        let coordsZRes = { rows: [] };
        try {
          coordsZRes = await pool.query(`
            SELECT dni, celular, correo_electronico as email, nombres_y_apellidos as nombre
            FROM rcoordinadoresz
            WHERE dni IS NOT NULL
          `);
        } catch (e) {}

        // Populate filters
        const allRows = [
          ...(personerosRes?.rows || []),
          ...(coordsRes?.rows || []),
          ...(coordsDRes?.rows || []),
          ...(coordsZRes?.rows || [])
        ];

        allRows.forEach(r => {
          if (r.dni) {
            this.dniFilter.add(r.dni);
            this.usernameFilter.add(r.dni);
          }
          if (r.celular) this.phoneFilter.add(r.celular);
          if (r.email) this.emailFilter.add(r.email);
          if (r.nombre) this.nameFilter.add(r.nombre);
          if (r.clave_acceso) this.usernameFilter.add(r.clave_acceso);
        });

        this.isInitialized = true;
        console.log(`✅ [BloomFilter] Inicializado con éxito con ${allRows.length} registros en memoria.`);
      } catch (err) {
        console.warn('⚠️ [BloomFilter] No se pudo inicializar desde BD (se inicializará bajo demanda):', err.message);
        this.isInitialized = true; // Still mark true to allow fallback
      }
    })();

    return this.initPromise;
  }

  /**
   * Fast check if DNI definitely does not exist
   * @param {string} dni 
   * @returns {boolean} true if it MIGHT exist, false if it DEFINITELY DOES NOT exist
   */
  mightContainDni(dni) {
    if (!dni) return false;
    return this.dniFilter.has(dni);
  }

  /**
   * Fast check if Phone definitely does not exist
   */
  mightContainPhone(phone) {
    if (!phone) return false;
    return this.phoneFilter.has(phone);
  }

  /**
   * Fast check if Email definitely does not exist
   */
  mightContainEmail(email) {
    if (!email) return false;
    return this.emailFilter.has(email);
  }

  /**
   * Fast check if Full Name definitely does not exist
   */
  mightContainName(name) {
    if (!name) return false;
    return this.nameFilter.has(name);
  }

  /**
   * Fast check if username / credential identifier exists
   */
  mightContainUser(identifier) {
    if (!identifier) return false;
    const clean = String(identifier).trim().toLowerCase();
    return this.usernameFilter.has(clean) || this.dniFilter.has(clean);
  }

  /**
   * Register a newly created personero / coordinador in the Bloom Filter
   */
  register({ dni, celular, email, nombre, username, claveAcceso }) {
    if (dni) {
      this.dniFilter.add(dni);
      this.usernameFilter.add(dni);
    }
    if (celular) this.phoneFilter.add(celular);
    if (email) this.emailFilter.add(email);
    if (nombre) this.nameFilter.add(nombre);
    if (username) this.usernameFilter.add(username);
    if (claveAcceso) this.usernameFilter.add(claveAcceso);
  }

  /**
   * Get diagnostics
   */
  getDiagnostics() {
    return {
      dnis: this.dniFilter.getStats(),
      phones: this.phoneFilter.getStats(),
      emails: this.emailFilter.getStats(),
      names: this.nameFilter.getStats(),
      users: this.usernameFilter.getStats()
    };
  }
}

export const bloomFilterService = new RegistrationBloomFilterService();
