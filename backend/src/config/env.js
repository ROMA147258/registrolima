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
    url: process.env.DATABASE_URL,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    server: process.env.DB_SERVER,
    database: process.env.DB_DATABASE,
    port: parseInt(process.env.DB_PORT, 10),
    ssl: process.env.DB_SSL !== 'false'
  },

  jwt: {
    secret: process.env.JWT_SECRET,
    expiresIn: '24h'
  },

  admin: {
    username: process.env.ADMIN_USERNAME || 'admin',
    password: process.env.ADMIN_PASSWORD || 'admin123',
    ericUsername: process.env.ERIC_USERNAME || 'eric',
    ericPassword: process.env.ERIC_PASSWORD || 'eric123',
    paolaUsername: process.env.PAOLA_USERNAME || 'paola',
    paolaPassword: process.env.PAOLA_PASSWORD || 'pao123$',
    susanaUsername: process.env.SUSANA_USERNAME || 'susana',
    susanaPassword: process.env.SUSANA_PASSWORD || 'susan456&'
  },
};
