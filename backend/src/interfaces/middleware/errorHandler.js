import { config } from '../../config/env.js';

export function errorHandler(err, req, res, next) {
  console.error(`❌ [API Error] ${req.method} ${req.originalUrl}:`, err.message);

  const statusCode = err.statusCode || (err.message.includes('no encontrado') ? 404 : 400);

  res.status(statusCode).json({
    status: 'error',
    message: err.message || 'Ocurrió un error interno en el servidor.',
    ...(config.nodeEnv === 'development' ? { stack: err.stack } : {})
  });
}
