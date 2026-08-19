import sql from 'mssql';
import { config } from '../../config/env.js';

class DatabasePool {
  constructor() {
    this.pool = null;
    this.connectedConfig = null;
    this.isConnecting = false;
  }

  async getPool() {
    if (this.pool && this.pool.connected) {
      return this.pool;
    }

    if (this.isConnecting) {
      // Esperar si hay una conexión en curso
      while (this.isConnecting) {
        await new Promise(res => setTimeout(res, 200));
      }
      if (this.pool && this.pool.connected) return this.pool;
    }

    this.isConnecting = true;

    const baseConfig = {
      user: config.db.user,
      password: config.db.password,
      database: config.db.database,
      port: config.db.port,
      connectionTimeout: config.db.connectionTimeout,
      requestTimeout: config.db.requestTimeout,
      options: {
        encrypt: config.db.encrypt,
        trustServerCertificate: config.db.trustServerCertificate,
        enableArithAbort: true
      }
    };

    const candidates = [
      { ...baseConfig, server: config.db.server },
      { ...baseConfig, server: 'localhost' },
      { ...baseConfig, server: '127.0.0.1' },
      { ...baseConfig, server: 'localhost\\SQLEXPRESS' },
      {
        driver: 'msnodesqlv8',
        server: 'localhost',
        database: config.db.database,
        options: { trustedConnection: true, encrypt: false, trustServerCertificate: true }
      }
    ];

    let lastError = null;

    for (const candidate of candidates) {
      try {
        const pool = await sql.connect(candidate);
        this.pool = pool;
        this.connectedConfig = candidate;
        this.isConnecting = false;
        console.log(`✅ Conexión establecida con SQL Server en: ${candidate.server} (${candidate.database})`);
        return pool;
      } catch (err) {
        lastError = err;
      }
    }

    this.isConnecting = false;
    console.warn(`⚠️ No se pudo conectar a SQL Server: ${lastError?.message}. Operando con pool desconectado.`);
    throw lastError || new Error('No se pudo establecer conexión con SQL Server.');
  }

  async isHealthy() {
    try {
      const pool = await this.getPool();
      const result = await pool.request().query('SELECT 1 AS HealthCheck');
      return result.recordset[0].HealthCheck === 1;
    } catch {
      return false;
    }
  }

  getConnectedConfig() {
    return this.connectedConfig;
  }
}

export const dbPool = new DatabasePool();
