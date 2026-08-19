import express from 'express';
import cors from 'cors';
import { config } from './config/env.js';
import { createApiRouter } from './interfaces/routes/index.js';
import { errorHandler } from './interfaces/middleware/errorHandler.js';
import { dbPool } from './infrastructure/database/ConnectionPool.js';
import { MigrationRunner } from './infrastructure/database/MigrationRunner.js';

const app = express();

// Middlewares
app.use(cors({
  origin: '*', // Permitir solicitudes locales y celulares en la misma red Wi-Fi
  methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
  allowedHeaders: ['Content-Type', 'Authorization']
}));

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
    console.log('🔄 Conectando a SQL Server y verificando migraciones...');
    await dbPool.getPool();
    await MigrationRunner.runMigrations();
    console.log('✅ Base de datos SQL Server y migraciones listas.');
  } catch (err) {
    console.warn('⚠️ Base de datos SQL Server offline o no disponible en este momento:', err.message);
  }
});

export default app;
