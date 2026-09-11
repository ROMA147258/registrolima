import { dbPool } from '../src/infrastructure/database/ConnectionPool.js';

async function main() {
  try {
    const pool = await dbPool.getPool();
    const tables = ['rpersoneros', 'rcoordinadores', 'rcoordinadoresd', 'rcoordinadoresz'];
    
    for (const tbl of tables) {
      const res = await pool.query(`
        UPDATE ${tbl}
        SET credenciales = 'Confirmado', preguntas = 'Aprobado'
        WHERE LOWER(preguntas) LIKE '%aprob%' 
           OR LOWER(preguntas) LIKE '%pasad%' 
           OR LOWER(credenciales) = 'confirmado'
        RETURNING id, dni, nombres_y_apellidos, preguntas, credenciales;
      `);
      console.log(`✅ Tabla ${tbl}: ${res.rowCount} registros sincronizados con Confirmado y Aprobado.`);
      if (res.rows.length > 0) {
        res.rows.forEach(r => {
          console.log(`   - [${r.dni}] ${r.nombres_y_apellidos}: Preguntas='${r.preguntas}', Credenciales='${r.credenciales}'`);
        });
      }
    }
    process.exit(0);
  } catch (err) {
    console.error('❌ Error actualizando base de datos:', err);
    process.exit(1);
  }
}

main();
