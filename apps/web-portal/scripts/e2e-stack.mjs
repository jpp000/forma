import { spawn, execSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const portalRoot = resolve(__dirname, '..');
const repoRoot = resolve(portalRoot, '../..');
const apiRoot = resolve(repoRoot, 'apps/api');

const API_PORT = Number(process.env.E2E_API_PORT ?? 3000);
const WEB_PORT = Number(process.env.E2E_WEB_PORT ?? 5173);
const API_URL = `http://127.0.0.1:${API_PORT}`;
const WEB_URL = `http://127.0.0.1:${WEB_PORT}`;

const apiEnv = {
  ...process.env,
  DATABASE_URL:
    process.env.DATABASE_URL ??
    process.env.TEST_DATABASE_URL ??
    'postgresql://forma:forma@localhost:5432/forma',
  PORT: String(API_PORT),
  NODE_ENV: 'development',
  EMAIL_PROVIDER: 'mock',
  JWT_SECRET: process.env.JWT_SECRET ?? 'dev-secret-change-in-production',
  OAUTH_MOCK: 'true',
  CORS_ORIGIN: WEB_URL,
  OAUTH_WEB_SUCCESS_URL: `${WEB_URL}/oauth/callback`,
};

const webEnv = {
  ...process.env,
  VITE_API_URL: API_URL,
  CI: '1',
};

/** @type {import('node:child_process').ChildProcess[]} */
const children = [];

function log(message) {
  console.log(`[portal-e2e] ${message}`);
}

function freePort(port) {
  try {
    const pids = execSync(`lsof -ti:${port}`, { encoding: 'utf8' }).trim();
    for (const pid of pids.split('\n')) {
      if (pid) {
        process.kill(Number(pid), 'SIGKILL');
      }
    }
    log(`freed port ${port}`);
  } catch {
    // already free
  }
}

function spawnLogged(command, args, options) {
  const child = spawn(command, args, {
    ...options,
    stdio: ['ignore', 'pipe', 'pipe'],
  });
  child.stdout?.on('data', (chunk) => process.stdout.write(chunk));
  child.stderr?.on('data', (chunk) => process.stderr.write(chunk));
  child.on('exit', (code, signal) => {
    log(`${command} ${args.join(' ')} exited code=${code} signal=${signal}`);
  });
  children.push(child);
  return child;
}

async function waitFor(url, timeoutMs = 240_000) {
  const started = Date.now();
  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // not ready
    }
    await new Promise((r) => setTimeout(r, 1_000));
  }
  throw new Error(`Timed out waiting for ${url}`);
}

function shutdown() {
  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGKILL');
    }
  }
  freePort(API_PORT);
  freePort(WEB_PORT);
}

process.on('exit', shutdown);
process.on('SIGINT', () => {
  shutdown();
  process.exit(130);
});
process.on('SIGTERM', () => {
  shutdown();
  process.exit(143);
});

async function main() {
  freePort(API_PORT);
  freePort(WEB_PORT);

  log('generating prisma client + migrating');
  execSync('pnpm db:generate', {
    cwd: repoRoot,
    stdio: 'inherit',
    env: apiEnv,
  });
  execSync('pnpm db:migrate:deploy', {
    cwd: repoRoot,
    stdio: 'inherit',
    env: apiEnv,
  });

  log('building API');
  execSync('pnpm --filter @forma/types build', {
    cwd: repoRoot,
    stdio: 'inherit',
    env: apiEnv,
  });
  execSync('pnpm --filter @forma/api build', {
    cwd: repoRoot,
    stdio: 'inherit',
    env: apiEnv,
  });

  log(`starting API on ${API_URL}`);
  spawnLogged('node', ['dist/main.js'], {
    cwd: apiRoot,
    env: apiEnv,
  });
  await waitFor(`${API_URL}/api/health`);

  log(`starting portal on ${WEB_URL}`);
  spawnLogged(
    'pnpm',
    ['exec', 'vite', '--host', '127.0.0.1', '--port', String(WEB_PORT)],
    {
      cwd: portalRoot,
      env: webEnv,
    },
  );
  await waitFor(WEB_URL);

  log('stack ready');
  await new Promise(() => {
    // keep alive for Playwright webServer
  });
}

main().catch((error) => {
  console.error(error);
  shutdown();
  process.exit(1);
});
