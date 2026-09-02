import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { createApiRouter } from './interfaces/routes/index.js';
import { errorHandler } from './interfaces/middleware/errorHandler.js';
import { dbPool } from './infrastructure/database/ConnectionPool.js';
import { MigrationRunner } from './infrastructure/database/MigrationRunner.js';

const app = express();

// Desactivar ETags para evitar respuestas 304 Not Modified que vacían el estado del cliente
app.set('etag', false);

// Middlewares
app.use((req, res, next) => {
  res.setHeader('Cache-Control', 'no-store, no-cache, must-revalidate, proxy-revalidate');
  res.setHeader('Pragma', 'no-cache');
  res.setHeader('Expires', '0');
  res.setHeader('Surrogate-Control', 'no-store');
  next();
});

app.use(cors({
  origin: '*',
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS', 'PATCH'],
  allowedHeaders: ['Content-Type', 'Authorization', 'Cache-Control', 'Pragma', 'Expires', 'X-Requested-With', 'Accept', 'Origin'],
  exposedHeaders: ['*']
}));
app.options('*', cors());

app.use(express.json({ limit: '10mb' }));
app.use(express.urlencoded({ extended: true, limit: '10mb' }));

// Logging básico en desarrollo
app.use((req, res, next) => {
  const start = Date.now();
  res.on('finish', () => {
    const duration = Date.now() - start;
    if (req.originalUrl.startsWith('/api')) {
      console.log(`[HTTP] ${req.method} ${req.originalUrl} -> ${res.statusCode} (${duration}ms)`);
    }
  });
  next();
});

// API Routes
app.use('/api', createApiRouter());

// Centralized Error Handling
app.use(errorHandler);

// Inicializar Servidor y Migraciones
const PORT = config.port || 3000;
app.listen(PORT, '0.0.0.0', async () => {
  console.log('==========================================================');
  console.log(`🚀 SERVIDOR API BACKEND INICIADO`);
  console.log(`📡 Puerto: ${PORT} | URL: http://localhost:${PORT}/api`);
  console.log('==========================================================');

  try {
    console.log('🔄 Conectando a PostgreSQL y verificando migraciones...');
    await dbPool.getPool();
    await MigrationRunner.runMigrations();
    console.log('✅ Base de datos PostgreSQL y migraciones listas.');
  } catch (err) {
    console.warn('⚠️ Base de datos PostgreSQL offline o no disponible en este momento:', err.message);
  }
});

export default app;
