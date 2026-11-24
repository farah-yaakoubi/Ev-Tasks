import { PrismaMariaDb } from '@prisma/adapter-mariadb';
import { PrismaClient } from '../../../node_modules/.prisma/ev-tasks/client.js';
import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';

config({ path: fileURLToPath(new URL('../../../.env', import.meta.url)) });

const databaseUrl = process.env.DATABASE_URL;
if (!databaseUrl) {
  throw new Error('DATABASE_URL is required. Configure it in the root .env file or the service environment.');
}

const connection = new URL(databaseUrl);
const adapter = new PrismaMariaDb({
  host: connection.hostname,
  port: Number(connection.port || 3306),
  user: decodeURIComponent(connection.username),
  password: decodeURIComponent(connection.password),
  database: connection.pathname.slice(1),
  connectionLimit: 5,
});

export const prisma = new PrismaClient({ adapter });
