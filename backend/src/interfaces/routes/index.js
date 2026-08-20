import { Router } from 'express';
import { dbPool } from '../../infrastructure/database/ConnectionPool.js';
import { PostgresPersoneroRepository } from '../../infrastructure/repositories/PostgresPersoneroRepository.js';
import { PostgresUserRepository } from '../../infrastructure/repositories/PostgresUserRepository.js';
import { PostgresAuditRepository } from '../../infrastructure/repositories/PostgresAuditRepository.js';

import { RegisterPersoneroUseCase } from '../../application/use-cases/RegisterPersoneroUseCase.js';
import { LoginUseCase } from '../../application/use-cases/LoginUseCase.js';
import { UpdateTrainingProgressUseCase } from '../../application/use-cases/UpdateTrainingProgressUseCase.js';
import { VerifyCredentialUseCase } from '../../application/use-cases/VerifyCredentialUseCase.js';
import { GetDashboardDataUseCase } from '../../application/use-cases/GetDashboardDataUseCase.js';
import { ExportRecordsUseCase } from '../../application/use-cases/ExportRecordsUseCase.js';

import { AuthController } from '../controllers/AuthController.js';
import { PersoneroController } from '../controllers/PersoneroController.js';
import { TrainingController } from '../controllers/TrainingController.js';
import { DashboardController } from '../controllers/DashboardController.js';
import { VerifyController } from '../controllers/VerifyController.js';
import { CatalogController } from '../controllers/CatalogController.js';

import { authLimiter } from '../middleware/rateLimiter.js';
import { authenticateToken, requireRole } from '../middleware/authMiddleware.js';
import { ROLES } from '../../config/constants.js';

export function createApiRouter() {
  const router = Router();

  // Instanciar Repositorios
  const personeroRepo = new PostgresPersoneroRepository();
  const userRepo = new PostgresUserRepository();
  const auditRepo = new PostgresAuditRepository();

  // Instanciar Casos de Uso
  const registerUseCase = new RegisterPersoneroUseCase(personeroRepo, auditRepo);
  const loginUseCase = new LoginUseCase(personeroRepo, userRepo, auditRepo);
  const updateProgressUseCase = new UpdateTrainingProgressUseCase(personeroRepo, auditRepo);
  const verifyUseCase = new VerifyCredentialUseCase(personeroRepo, auditRepo);
  const getDashboardUseCase = new GetDashboardDataUseCase(personeroRepo);
  const exportUseCase = new ExportRecordsUseCase(personeroRepo);

  // Instanciar Controladores
  const authCtrl = new AuthController(loginUseCase);
  const personeroCtrl = new PersoneroController(registerUseCase, personeroRepo, auditRepo);
  const trainingCtrl = new TrainingController(updateProgressUseCase);
  const dashboardCtrl = new DashboardController(getDashboardUseCase, exportUseCase);
  const verifyCtrl = new VerifyController(verifyUseCase);
  const catalogCtrl = new CatalogController();

  // --- RUTAS PÚBLICAS ---

  // Health Check
  router.get('/health', async (req, res) => {
    const isHealthy = await dbPool.isHealthy();
    const connectedConfig = dbPool.getConnectedConfig();
    res.json({
      status: isHealthy ? 'ok' : 'degraded',
      dbConnected: isHealthy,
      server: connectedConfig?.server || null,
      database: connectedConfig?.database || null,
      timestamp: new Date().toISOString()
    });
  });

  // Catálogos
  router.get('/distritos', (req, res) => catalogCtrl.getDistritos(req, res));
  router.get('/roles', (req, res) => catalogCtrl.getRoles(req, res));
  router.get('/locales', (req, res) => catalogCtrl.getLocales(req, res));

  // Autenticación
  router.post('/auth/login', authLimiter, (req, res, next) => authCtrl.login(req, res, next));
  router.post('/login', authLimiter, (req, res, next) => authCtrl.login(req, res, next)); // Retrocompatibilidad
  router.get('/check_user', (req, res, next) => authCtrl.checkUser(req, res, next)); // Retrocompatibilidad

  // Registro de Personeros y Coordinadores
  router.post('/register', (req, res, next) => personeroCtrl.register(req, res, next));
  router.post('/personeros', (req, res, next) => personeroCtrl.register(req, res, next));

  // Capacitación y Progreso
  router.get('/update_progress', (req, res, next) => trainingCtrl.updateProgress(req, res, next));
  router.post('/training/progress', (req, res, next) => trainingCtrl.updateProgress(req, res, next));

  // Verificación Pública de Credenciales por QR o Token (Sin Login)
  router.get('/verify/:token', (req, res, next) => verifyCtrl.verify(req, res, next));
  router.get('/verify', (req, res, next) => verifyCtrl.verify(req, res, next));

  // --- RUTAS DEL DASHBOARD (Lectura y exportación) ---
  router.get('/read', (req, res, next) => dashboardCtrl.readAll(req, res, next)); // Retrocompatibilidad
  router.get('/dashboard/summary', (req, res, next) => dashboardCtrl.getSummary(req, res, next));
  router.get('/dashboard/records', (req, res, next) => dashboardCtrl.readAll(req, res, next));
  router.get('/dashboard/export', (req, res, next) => dashboardCtrl.export(req, res, next));

  // Actualización de asignación de mesa/local
  router.put('/personeros/:dni/assignment', (req, res, next) => personeroCtrl.updateAssignment(req, res, next));

  return router;
}
