import { dbPool } from '../src/infrastructure/database/ConnectionPool.js';

async function main() {
  const pool = await dbPool.getPool();

  console.log('1. Agregando columna clave_acceso a rcoordinadoresd si no existe...');
  await pool.query(`ALTER TABLE rcoordinadoresd ADD COLUMN IF NOT EXISTS clave_acceso VARCHAR(100);`);

  console.log('2. Actualizando claves para que sean solo letras y números (sin guiones)...');
  const res = await pool.query(`SELECT id, dni, nombres_y_apellidos, clave_acceso FROM rcoordinadoresd ORDER BY id ASC;`);
  
  for (const row of res.rows) {
    let cleanKey = String(row.clave_acceso || '').replace(/[^a-zA-Z0-9]/g, '').toUpperCase();
    if (!cleanKey || cleanKey.length < 4) {
      const rand4 = Math.floor(1000 + Math.random() * 9000);
      cleanKey = `SP${rand4}`;
    }
    await pool.query(`UPDATE rcoordinadoresd SET clave_acceso = $1 WHERE id = $2;`, [cleanKey, row.id]);
    console.log(`✅ Clave limpia asignada a DNI ${row.dni} (${row.nombres_y_apellidos}) ➔ ${cleanKey}`);
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
