import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sql from 'mssql';
import { dbPool } from './ConnectionPool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

export class MigrationRunner {
  static async runMigrations() {
    try {
      const pool = await dbPool.getPool();
      const migrationsDir = path.resolve(__dirname, '../../../migrations');

      if (!fs.existsSync(migrationsDir)) {
        console.warn('⚠️ Carpeta de migraciones no encontrada.');
        return;
      }

      // Asegurar tabla de control de migraciones
      await pool.request().query(`
        IF NOT EXISTS (SELECT * FROM sys.objects WHERE object_id = OBJECT_ID(N'[dbo].[SchemaMigrations]') AND type in (N'U'))
        BEGIN
            CREATE TABLE [dbo].[SchemaMigrations] (
                [ID] INT IDENTITY(1,1) PRIMARY KEY,
                [MigrationName] NVARCHAR(255) NOT NULL UNIQUE,
                [AppliedAt] DATETIME DEFAULT GETDATE()
            );
        END
      `);

      const appliedResult = await pool.request().query('SELECT MigrationName FROM [dbo].[SchemaMigrations]');
      const appliedSet = new Set(appliedResult.recordset.map(r => r.MigrationName));

      const files = fs.readdirSync(migrationsDir)
        .filter(f => f.endsWith('.sql'))
        .sort();

      for (const file of files) {
        if (!appliedSet.has(file)) {
          console.log(`⏳ Aplicando migración SQL: ${file}...`);
          const filePath = path.join(migrationsDir, file);
          const rawSql = fs.readFileSync(filePath, 'utf8');

          // Separar por GO si existe
          const batches = rawSql
            .split(/^GO\s*$/gim)
            .map(b => b.trim())
            .filter(b => b.length > 0);

          for (const batch of batches) {
            await pool.request().query(batch);
          }

          await pool.request()
            .input('name', sql.NVarChar, file)
            .query('INSERT INTO [dbo].[SchemaMigrations] (MigrationName) VALUES (@name)');

          console.log(`✅ Migración completada: ${file}`);
        }
      }
    } catch (err) {
      console.error('❌ Error al ejecutar migraciones SQL:', err.message);
    }
  }
}
