import { dbPool } from '../database/ConnectionPool.js';

export class PostgresUserRepository {
  async ensureTableExists() {
    try {
      const pool = await dbPool.getPool();
      await pool.query(`
        CREATE TABLE IF NOT EXISTS usuarios (
          id SERIAL PRIMARY KEY,
          username VARCHAR(100) NOT NULL UNIQUE,
          password_hash VARCHAR(255) NOT NULL,
          full_name VARCHAR(255) NOT NULL,
          role VARCHAR(50) NOT NULL DEFAULT 'coordinador',
          is_active BOOLEAN DEFAULT TRUE,
          created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);
    } catch (err) {
      console.warn('Advertencia asegurando tabla usuarios en PostgreSQL:', err.message);
    }
  }

  async findByUsername(username) {
    await this.ensureTableExists();
    const pool = await dbPool.getPool();
    const cleanUser = String(username).toLowerCase().trim();

    try {
      const res = await pool.query(
        'SELECT * FROM usuarios WHERE LOWER(username) = $1 AND is_active = TRUE LIMIT 1',
        [cleanUser]
      );

      if (res.rows.length > 0) {
        const r = res.rows[0];
        return {
          id: r.id,
          username: r.username,
          passwordHash: r.password_hash,
          fullName: r.full_name,
          role: r.role,
          isActive: r.is_active
        };
      }
    } catch (err) {
      console.warn('Error buscando usuario en PostgreSQL:', err.message);
    }

    return null;
  }
}
