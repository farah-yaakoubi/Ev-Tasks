import { config } from 'dotenv';
import { fileURLToPath } from 'node:url';
import { defineConfig } from 'prisma/config';

config({ path: fileURLToPath(new URL('../.env', import.meta.url)) });

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: { path: 'prisma/migrations' },
  datasource: {
    url: process.env.DATABASE_URL ?? 'mysql://evtasks_app:change_this_password@127.0.0.1:3306/ev_tasks',
    shadowDatabaseUrl: process.env.SHADOW_DATABASE_URL,
  },
});
