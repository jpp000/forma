import 'dotenv/config';
import { defineConfig } from 'prisma/config';

/** Local/cloud default — matches `.env.example` and Docker dev image. */
const DEFAULT_DATABASE_URL =
  'postgresql://forma:forma@localhost:5432/forma';

export default defineConfig({
  schema: 'prisma/schema.prisma',
  migrations: {
    path: 'prisma/migrations',
  },
  datasource: {
    url: process.env.DATABASE_URL ?? DEFAULT_DATABASE_URL,
  },
});
