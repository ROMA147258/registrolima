import pkg from 'pg';
const { Pool } = pkg;
import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';
import fs from 'fs';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
dotenv.config({ path: path.join(__dirname, '../.env') });

const pool = new Pool({
  connectionString: process.env.DATABASE_URL,
  ssl: { rejectUnauthorized: false }
});

async function run() {
  const client = await pool.connect();
  try {
    console.log('--- REVISANDO TODAS LAS TABLAS DE POSTGRESQL ---');
    const tableQuery = `
      SELECT table_name 
      FROM information_schema.tables 
      WHERE table_schema = 'public'
    `;
    const resTables = await client.query(tableQuery);
    
    for (const row of resTables.rows) {
      const tbl = row.table_name;
      try {
        const countRes = await client.query(`SELECT COUNT(*) as count FROM "${tbl}"`);
        console.log(`Tabla [${tbl}]: ${countRes.rows[0].count} filas`);
      } catch (err) {
        console.log(`Tabla [${tbl}]: Error al contar (${err.message})`);
      }
    }

  } catch (err) {
    console.error('Error:', err);
  } finally {
    client.release();
    await pool.end();
  }
}

run();
