import { dbPool } from '../src/infrastructure/database/ConnectionPool.js';

async function main() {
  const pool = await dbPool.getPool();
  console.log('--- Buscando a Esteban Tito Cirineo Condor en las tablas ---');
  const tables = ['rcoordinadoresd', 'rcoordinadoresz', 'rcoordinadores', 'rpersoneros'];
  for (const t of tables) {
    try {
      const res = await pool.query(`SELECT * FROM ${t} WHERE UPPER(nombres_y_apellidos) LIKE '%CIRINEO%' OR UPPER(nombres_y_apellidos) LIKE '%ESTEBAN%'`);
      if (res.rows.length > 0) {
        console.log(`[+] Encontrado en tabla ${t}:`);
        res.rows.forEach(r => {
          console.log({
            dni: r.dni,
            nombres: r.nombres_y_apellidos,
            rol: r.rol_a_desempenar,
            distrito_asignado: r.distrito_asignado,
            distrito_vota: r.distrito_donde_vota,
            local: r.local_de_votacion_asignado,
            clave: r.clave_acceso
          });
        });
      }
    } catch (e) {
      console.log(`Error consultando ${t}: ${e.message}`);
    }
  }

  console.log('\n--- Buscando todos los registros en rcoordinadoresd (Distritales) de VMT ---');
  try {
    const resD = await pool.query(`SELECT * FROM rcoordinadoresd WHERE UPPER(distrito_asignado) LIKE '%TRIUNFO%' OR UPPER(distrito_asignado) LIKE '%VMT%'`);
    console.log('Distritales VMT en rcoordinadoresd:', resD.rows.map(r => ({ dni: r.dni, nombres: r.nombres_y_apellidos, rol: r.rol_a_desempenar, dist: r.distrito_asignado })));
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }

  console.log('\n--- Buscando registros en rcoordinadoresz (Zonales) de VMT ---');
  try {
    const resZ = await pool.query(`SELECT * FROM rcoordinadoresz WHERE UPPER(distrito_asignado) LIKE '%TRIUNFO%' OR UPPER(distrito_asignado) LIKE '%VMT%'`);
    console.log('Zonales VMT en rcoordinadoresz:', resZ.rows.map(r => ({ dni: r.dni, nombres: r.nombres_y_apellidos, rol: r.rol_a_desempenar, dist: r.distrito_asignado, local: r.local_de_votacion_asignado })));
  } catch (e) {
    console.log(`Error: ${e.message}`);
  }

  process.exit(0);
}

main().catch(err => {
  console.error(err);
  process.exit(1);
});
