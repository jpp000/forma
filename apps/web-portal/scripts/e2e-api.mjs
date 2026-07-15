import { spawn } from 'node:child_process';
import { execSync } from 'node:child_process';
import { resolve } from 'node:path';

const repoRoot = resolve(import.meta.dirname, '../../..');
const apiUrl = process.env.VITE_API_URL ?? 'http://127.0.0.1:3000';

async function healthy() {
  try {
    const res = await fetch(`${apiUrl}/api/health`);
    return res.ok;
  } catch {
    return false;
  }
}

if (await healthy()) {
  await new Promise(() => {});
}

execSync('pnpm db:migrate:deploy', {
  cwd: repoRoot,
  stdio: 'inherit',
  env: {
    ...process.env,
    DATABASE_URL:
      process.env.DATABASE_URL ??
      'postgresql://forma:forma@localhost:5432/forma',
  },
});

if (await healthy()) {
  await new Promise(() => {});
}

const child = spawn('pnpm', ['--filter', '@forma/api', 'dev'], {
  cwd: repoRoot,
  env: {
    ...process.env,
    DATABASE_URL:
      process.env.DATABASE_URL ??
      'postgresql://forma:forma@localhost:5432/forma',
    PORT: '3000',
    NODE_ENV: 'development',
    EMAIL_PROVIDER: 'mock',
    JWT_SECRET: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
    OAUTH_MOCK: 'true',
    CORS_ORIGIN: process.env.CORS_ORIGIN ?? 'http://127.0.0.1:5173',
    OAUTH_WEB_SUCCESS_URL:
      process.env.OAUTH_WEB_SUCCESS_URL ??
      'http://127.0.0.1:5173/oauth/callback',
  },
  stdio: 'inherit',
});

child.on('exit', (code) => {
  process.exit(code ?? 1);
});

await new Promise(() => {});
