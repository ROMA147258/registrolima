import dotenv from 'dotenv';
import path from 'path';
import { fileURLToPath } from 'url';

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

dotenv.config({ path: path.resolve(__dirname, '../../.env') });

export const config = {
  port: parseInt(process.env.PORT || '3000', 10),
  nodeEnv: process.env.NODE_ENV || 'production',
  
  db: {
    url: process.env.DATABASE_URL || 'postgresql://neondb_owner:npg_a49ynhcISRgB@ep-super-silence-axywhu8v-pooler.c-4.us-east-2.aws.neon.tech/neondb?sslmode=require',
    user: process.env.DB_USER || 'neondb_owner',
    password: process.env.DB_PASSWORD || 'npg_a49ynhcISRgB',
    server: process.env.DB_SERVER || 'ep-super-silence-axywhu8v-pooler.c-4.us-east-2.aws.neon.tech',
    database: process.env.DB_DATABASE || 'neondb',
    port: parseInt(process.env.DB_PORT || '5432', 10),
    ssl: process.env.DB_SSL !== 'false'
  },

  jwt: {
    secret: process.env.JWT_SECRET || 'super_secret_jwt_key_somos_peru_2026_conteo_lima',
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
