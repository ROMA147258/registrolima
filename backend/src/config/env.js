import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'development',
  
  db: {
    user: process.env.DB_USER || 'data',
    password: process.env.DB_PASSWORD || 'TECNOlogia2026.$',
    server: process.env.DB_SERVER || 'localhost',
    database: process.env.DB_NAME || 'conteo',
    port: parseInt(process.env.DB_PORT || '1433', 10),
    encrypt: process.env.DB_ENCRYPT === 'true',
    trustServerCertificate: process.env.DB_TRUST_CERT !== 'false',
    connectionTimeout: 5000,
    requestTimeout: 15000
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'jwt_default_secret_somos_peru_2026',
    expiresIn: '24h'
  },

  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    ericUsername: process.env.ERIC_USERNAME || 'eric',
    ericPassword: process.env.ERIC_PASSWORD || 'eric123'
  },

  frontendUrl: process.env.FRONTEND_URL || 'http://localhost:3180'
};
