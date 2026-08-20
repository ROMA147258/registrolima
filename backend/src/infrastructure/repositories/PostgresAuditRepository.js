import { dbPool } from '../database/ConnectionPool.js';

export class PostgresAuditRepository {
  async ensureTableExists() {
    try {
      const pool = await dbPool.getPool();
      await pool.query(`
        CREATE TABLE IF NOT EXISTS auditoria (
          id SERIAL PRIMARY KEY,
          action VARCHAR(100) NOT NULL,
          user_identifier VARCHAR(100),
          role VARCHAR(50),
          details TEXT,
          ip_address VARCHAR(50),
          user_agent VARCHAR(500),
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch (err) {
      console.warn('Advertencia asegurando tabla auditoria en PostgreSQL:', err.message);
    }
  }

  async log({ action, userIdentifier, role, details, ipAddress, userAgent }) {
    try {
      await this.ensureTableExists();
      const pool = await dbPool.getPool();
      const detailsStr = typeof details === 'object' ? JSON.stringify(details) : String(details || '');

      await pool.query(
        `INSERT INTO auditoria (action, user_identifier, role, details, ip_address, user_agent)
         VALUES ($1, $2, $3, $4, $5, $6)`,
        [action, userIdentifier, role, detailsStr, ipAddress, userAgent]
      );
    } catch (err) {
      console.warn('Error registrando auditoría en PostgreSQL:', err.message);
    }
  }
}
