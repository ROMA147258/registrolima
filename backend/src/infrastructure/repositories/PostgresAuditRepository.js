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

  async findAll({ action, limit = 200, offset = 0 } = {}) {
    try {
      await this.ensureTableExists();
      const pool = await dbPool.getPool();

      let query = 'SELECT * FROM auditoria';
      const params = [];
      const conditions = [];

      if (action) {
        params.push(action);
        conditions.push(`action = $${params.length}`);
      }

      if (conditions.length > 0) {
        query += ` WHERE ${conditions.join(' AND ')}`;
      }

      query += ` ORDER BY created_at DESC, id DESC LIMIT $${params.length + 1} OFFSET $${params.length + 2}`;
      params.push(Math.min(parseInt(limit, 10) || 200, 500));
      params.push(parseInt(offset, 10) || 0);

      const res = await pool.query(query, params);
      return res.rows.map(row => {
        let parsedDetails = {};
        try {
          parsedDetails = typeof row.details === 'string' ? JSON.parse(row.details) : (row.details || {});
        } catch {
          parsedDetails = { raw: row.details };
        }
        return {
          id: row.id,
          action: row.action,
          userIdentifier: row.user_identifier,
          role: row.role,
          details: parsedDetails,
          ipAddress: row.ip_address,
          userAgent: row.user_agent,
          createdAt: row.created_at
        };
      });
    } catch (err) {
      console.error('Error consultando registros de auditoría:', err.message);
      return [];
    }
  }
}

