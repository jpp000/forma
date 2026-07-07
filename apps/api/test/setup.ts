import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

const repoRoot = resolve(__dirname, '../../..');

process.env.NODE_ENV = 'test';
process.env.DATABASE_URL =
  process.env.TEST_DATABASE_URL ??
  process.env.DATABASE_URL ??
  `postgresql://${process.env.USER ?? 'postgres'}@localhost:5432/forma`;

beforeAll(() => {
  execSync('pnpm db:migrate:deploy', {
    cwd: repoRoot,
    stdio: 'inherit',
    env: process.env,
  });
});
