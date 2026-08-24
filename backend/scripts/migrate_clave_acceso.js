import { dbPool } from '../src/infrastructure/database/ConnectionPool.js';

async function main() {
  const pool = await dbPool.getPool();

  console.log('1. Agregando columna clave_acceso a rcoordinadoresd si no existe...');
  await pool.query(`ALTER TABLE rcoordinadoresd ADD COLUMN IF NOT EXISTS clave_acceso VARCHAR(100);`);

  console.log('2. Consultando registros existentes en rcoordinadoresd...');
  const res = await pool.query(`SELECT id, dni, nombres_y_apellidos, clave_acceso FROM rcoordinadoresd ORDER BY id ASC;`);
  
  for (const row of res.rows) {
    if (!row.clave_acceso || row.clave_acceso.trim() === '') {
      const rand4 = Math.floor(1000 + Math.random() * 9000);
      const newKey = `SP-${rand4}`;
      await pool.query(`UPDATE rcoordinadoresd SET clave_acceso = $1 WHERE id = $2;`, [newKey, row.id]);
      console.log(`✅ Asignada clave ${newKey} a DNI ${row.dni} (${row.nombres_y_apellidos})`);
    } else {
      console.log(`ℹ️ DNI ${row.dni} ya cuenta con clave: ${row.clave_acceso}`);
    }
  }

  console.log('3. Columnas finales de la tabla rcoordinadoresd:');
  const cols = await pool.query(`
    SELECT column_name, data_type 
    FROM information_schema.columns 
    WHERE table_name = 'rcoordinadoresd' 
    ORDER BY ordinal_position;
  `);
  console.table(cols.rows);

  console.log('4. Registros actualizados en rcoordinadoresd:');
  const updatedRows = await pool.query(`
    SELECT id, nombres_y_apellidos, dni, clave_acceso, distrito_asignado, rol_a_desempenar 
    FROM rcoordinadoresd 
    ORDER BY id ASC;
  `);
  console.table(updatedRows.rows);

  process.exit(0);
}

main().catch(err => {
  console.error('❌ Error en migración:', err);
  process.exit(1);
});
