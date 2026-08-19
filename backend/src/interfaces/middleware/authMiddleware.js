import jwt from 'jsonwebtoken';
import { config } from '../../config/env.js';
import { ROLES } from '../../config/constants.js';

export function authenticateToken(req, res, next) {
  const authHeader = req.headers['authorization'];
  const token = authHeader && authHeader.split(' ')[1];

  if (!token) {
    return res.status(401).json({ status: 'error', message: 'Acceso no autorizado. Token no proporcionado.' });
  }

  jwt.verify(token, config.jwt.secret, (err, user) => {
    if (err) {
      return res.status(403).json({ status: 'error', message: 'Token inválido o expirado.' });
    }
    req.user = user;
    next();
  });
}

export function requireRole(allowedRoles = []) {
  return (req, res, next) => {
    if (!req.user || !allowedRoles.includes(req.user.role)) {
      return res.status(403).json({ status: 'error', message: 'No cuenta con los permisos necesarios para realizar esta acción.' });
    }
    next();
  };
}
