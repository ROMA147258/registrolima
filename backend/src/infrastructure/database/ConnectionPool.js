import pkg from 'pg';
const { Pool } = pkg;
import { config } from '../../config/env.js';

class DatabasePool {
  constructor() {
    this.pool = null;
    this.connectedConfig = null;
    this.isConnecting = false;
  }

  async getPool() {
    if (this.pool) {
      return this.pool;
    }

    if (this.isConnecting) {
      while (this.isConnecting) {
        await new Promise(res => setTimeout(res, 150));
      }
      if (this.pool) return this.pool;
    }

    this.isConnecting = true;

    // 1. Intentar con DATABASE_URL si está configurado
    if (config.db.url) {
      try {
        const pool = new Pool({
          connectionString: config.db.url,
          ssl: config.db.url.includes('sslmode=require') || config.db.ssl ? { rejectUnauthorized: false } : false,
          max: 20,
          idleTimeoutMillis: 30000,
          connectionTimeoutMillis: 10000
        });

        // Test connection
        const client = await pool.connect();
        const res = await client.query('SELECT current_database() as db, current_user as usr, version() as ver');
        client.release();

        this.pool = pool;
        this.connectedConfig = {
          type: 'DATABASE_URL',
          database: res.rows[0].db,
          user: res.rows[0].usr,
          server: 'Neon/PostgreSQL'
        };
        this.isConnecting = false;
        console.log(`✅ Conexión establecida con PostgreSQL (Neon): ${this.connectedConfig.database} (usuario: ${this.connectedConfig.user})`);
        return pool;
      } catch (err) {
        console.warn(`⚠️ Intento de conexión con DATABASE_URL falló: ${err.message}. Probando configuración directa...`);
      }
    }

    // 2. Intentar con parámetros individuales
    try {
      const isCloud = config.db.server.includes('neon.tech') || config.db.server.includes('aws') || config.db.ssl;
      const pool = new Pool({
        host: config.db.server,
        port: config.db.port,
        database: config.db.database,
        user: config.db.user,
        password: config.db.password,
        ssl: isCloud ? { rejectUnauthorized: false } : false,
        max: 20,
        idleTimeoutMillis: 30000,
        connectionTimeoutMillis: 10000
      });

      const client = await pool.connect();
      const res = await client.query('SELECT current_database() as db, current_user as usr');
      client.release();

      this.pool = pool;
      this.connectedConfig = {
        type: 'DIRECT',
        server: config.db.server,
        database: res.rows[0].db,
        user: res.rows[0].usr
      };
      this.isConnecting = false;
      console.log(`✅ Conexión establecida con PostgreSQL en: ${config.db.server}:${config.db.port}/${config.db.database}`);
      return pool;
    } catch (err) {
      this.isConnecting = false;
      console.error(`❌ Error crítico conectando a PostgreSQL: ${err.message}`);
      throw err;
    }
  }

  async query(text, params) {
    const pool = await this.getPool();
    return pool.query(text, params);
  }

  async isHealthy() {
    try {
      const pool = await this.getPool();
      const result = await pool.query('SELECT 1 AS healthcheck');
      return result.rows[0].healthcheck === 1 || result.rows[0].healthcheck === '1';
    } catch {
      return false;
    }
  }

  getConnectedConfig() {
    return this.connectedConfig;
  }
}

export const dbPool = new DatabasePool();
