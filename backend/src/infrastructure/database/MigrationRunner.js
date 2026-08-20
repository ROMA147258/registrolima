import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import { dbPool } from './ConnectionPool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class MigrationRunner {
  static async runMigrations() {
    try {
      const pool = await dbPool.getPool();
      const migrationsDir = path.resolve(__dirname, '../../../migrations');

      // Asegurar tabla de control de migraciones en PostgreSQL
      await pool.query(`
        CREATE TABLE IF NOT EXISTS schema_migrations (
          id SERIAL PRIMARY KEY,
          migration_name VARCHAR(255) NOT NULL UNIQUE,
          applied_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
        );
      `);

      if (!fs.existsSync(migrationsDir)) return;

      const appliedResult = await pool.query('SELECT migration_name FROM schema_migrations');
      const appliedSet = new Set(appliedResult.rows.map(r => r.migration_name));

      const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();

      for (const file of files) {
        if (!appliedSet.has(file)) {
          console.log(`⏳ Evaluando migración: ${file}...`);
          try {
            const filePath = path.join(migrationsDir, file);
            const rawSql = fs.readFileSync(filePath, 'utf8');

            // Solo ejecutar si no contiene sintaxis exclusiva de SQL Server (NVARCHAR, IDENTITY, [dbo], etc.)
            // o registrar como aplicada para mantener la coherencia
            if (!rawSql.includes('[dbo]') && !rawSql.includes('IDENTITY(1,1)')) {
              await pool.query(rawSql);
            }

            await pool.query(
              'INSERT INTO schema_migrations (migration_name) VALUES ($1) ON CONFLICT (migration_name) DO NOTHING',
              [file]
            );
            console.log(`✅ Migración registrada: ${file}`);
          } catch (mErr) {
            console.warn(`Aviso en migración ${file}:`, mErr.message);
          }
        }
      }
    } catch (err) {
      console.warn('Aviso en runner de migraciones PostgreSQL:', err.message);
    }
  }
}
