import fs from 'fs';
import path from 'path';
import { fileURLToPath } from 'url';
import sql from 'mssql';
import { dbPool } from '../src/infrastructure/database/ConnectionPool.js';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

async function importData() {
  console.log('🔄 Conectando a SQL Server para importar data.md...');
  const pool = await dbPool.getPool();

  const dataPath = path.resolve(__dirname, '../../data.md');
  if (!fs.existsSync(dataPath)) {
    console.error('❌ Archivo data.md no encontrado en:', dataPath);
    process.exit(1);
  }

  const content = fs.readFileSync(dataPath, 'utf8');
  const lines = content.split(/\r?\n/).filter(line => line.trim().length > 0);

  console.log(`📄 Total de líneas en data.md: ${lines.length}`);

  // Limpiar tablas para cargar datos oficiales limpios
  await pool.request().query(`TRUNCATE TABLE [dbo].[Colegios]`);
  console.log('🧹 [dbo].[Colegios] limpiada.');

  let insertedColegios = 0;
  const batchSize = 100;
  let batchValues = [];

  for (let i = 1; i < lines.length; i++) {
    const parts = lines[i].split('\t');
    if (parts.length >= 4) {
      const dpto = parts[0]?.trim() || 'LIMA';
      const prov = parts[1]?.trim() || 'LIMA';
      const dist = parts[2]?.trim() || '';
      const local = (parts[3]?.trim() || '').slice(0, 250);
      const dir = (parts[4]?.trim() || '').slice(0, 250);
      const mesasNum = parseInt(parts[5]?.trim() || '0', 10) || 0;

      if (dist && local) {
        // Escapar comillas simples
        const safeDist = dist.replace(/'/g, "''");
        const safeLocal = local.replace(/'/g, "''");
        const safeDir = dir.replace(/'/g, "''");

        batchValues.push(`('${safeDist}', '${safeLocal}', '${safeDir}', ${mesasNum})`);
        insertedColegios++;

        if (batchValues.length >= batchSize) {
          await pool.request().query(`
            INSERT INTO [dbo].[Colegios] ([distrito], [colegio], [direccion], [num_mesas])
            VALUES ${batchValues.join(',\n')}
          `);
          batchValues = [];
        }
      }
    }
  }

  if (batchValues.length > 0) {
    await pool.request().query(`
      INSERT INTO [dbo].[Colegios] ([distrito], [colegio], [direccion], [num_mesas])
      VALUES ${batchValues.join(',\n')}
    `);
    batchValues = [];
  }

  console.log(`✅ ¡ÉXITO! Se insertaron ${insertedColegios} locales oficiales en [dbo].[Colegios].`);

  // Resumen
  const countColegios = await pool.request().query(`
    SELECT COUNT(*) as total_locales, COUNT(DISTINCT distrito) as distritos, SUM(num_mesas) as total_mesas
    FROM [dbo].[Colegios]
  `);
  console.log('📊 Resumen en [dbo].[Colegios]:', countColegios.recordset[0]);

  // Sincronizar en dbo.Mesas con numero_mesa
  await pool.request().query(`
    TRUNCATE TABLE [dbo].[Mesas];
    INSERT INTO [dbo].[Mesas] ([numero_mesa], [distrito], [colegio], [direccion], [departamento], [provincia])
    SELECT RIGHT('000000' + CAST([id] AS VARCHAR(20)), 6), [distrito], [colegio], [direccion], 'LIMA', 'LIMA'
    FROM [dbo].[Colegios];
  `);
  console.log('✅ Sincronizado también en [dbo].[Mesas].');

  process.exit(0);
}

importData().catch(err => {
  console.error('❌ Error durante la importación:', err);
  process.exit(1);
});
