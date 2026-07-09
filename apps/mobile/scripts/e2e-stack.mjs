import { spawn } from 'node:child_process';
import { execSync } from 'node:child_process';
import { dirname, resolve } from 'node:path';
import { fileURLToPath } from 'node:url';

const __dirname = dirname(fileURLToPath(import.meta.url));
const mobileRoot = resolve(__dirname, '..');
const repoRoot = resolve(mobileRoot, '../..');

const API_PORT = Number(process.env.E2E_API_PORT ?? 3000);
const WEB_PORT = Number(process.env.E2E_WEB_PORT ?? 19006);
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
  OAUTH_MOBILE_SUCCESS_URL: 'forma://oauth',
};

const webEnv = {
  ...process.env,
  EXPO_PUBLIC_API_URL: API_URL,
  EXPO_PUBLIC_OAUTH_SUCCESS_URL: 'forma://oauth',
  CI: '1',
};

/** @type {import('node:child_process').ChildProcess[]} */
const children = [];

function log(message) {
  console.log(`[e2e-stack] ${message}`);
}

function spawnLogged(command, args, options) {
  const child = spawn(command, args, {
    ...options,
    stdio: ['ignore', 'pipe', 'pipe'],
  });

  child.stdout?.on('data', (chunk) => {
    process.stdout.write(chunk);
  });
  child.stderr?.on('data', (chunk) => {
    process.stderr.write(chunk);
  });

  children.push(child);
  return child;
}

async function waitFor(url, timeoutMs = 180_000) {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    try {
      const response = await fetch(url);
      if (response.ok) {
        return;
      }
    } catch {
      // Server not ready yet.
    }

    await new Promise((resolveWait) => setTimeout(resolveWait, 1_000));
  }

  throw new Error(`Timed out waiting for ${url}`);
}

async function waitForWebBundle(baseUrl, timeoutMs = 240_000) {
  const started = Date.now();

  while (Date.now() - started < timeoutMs) {
    try {
      const html = await (await fetch(baseUrl)).text();
      const match = html.match(/src="([^"]+entry\.bundle[^"]+)"/);
      if (!match) {
        throw new Error('Bundle script tag not found');
      }

      const bundleUrl = match[1].startsWith('http')
        ? match[1]
        : new URL(match[1], baseUrl).href;
      const bundleResponse = await fetch(bundleUrl);
      const bundleBody = await bundleResponse.text();

      if (
        bundleResponse.ok &&
        !bundleBody.includes('Unable to resolve') &&
        bundleBody.length > 10_000
      ) {
        return;
      }
    } catch {
      // Metro may still be compiling.
    }

    await new Promise((resolveWait) => setTimeout(resolveWait, 2_000));
  }

  throw new Error(`Timed out waiting for web bundle at ${baseUrl}`);
}

async function waitForPortFree(port) {
  const started = Date.now();

  while (Date.now() - started < 30_000) {
    try {
      execSync(`lsof -ti:${port}`, { stdio: 'ignore' });
      freePort(port);
      await new Promise((resolveWait) => setTimeout(resolveWait, 500));
    } catch {
      return;
    }
  }

  throw new Error(`Port ${port} is still in use`);
}

function freePort(port) {
  try {
    const pids = execSync(`lsof -ti:${port}`, { encoding: 'utf8' }).trim();
    if (!pids) {
      return;
    }

    for (const pid of pids.split('\n')) {
      if (pid) {
        process.kill(Number(pid), 'SIGKILL');
      }
    }

    log(`Freed port ${port}`);
  } catch {
    // Port was already free.
  }
}

function ensurePostgres() {
  try {
    execSync('pg_isready -h localhost -p 5432', { stdio: 'ignore' });
    log('PostgreSQL is ready');
    return;
  } catch {
    log('PostgreSQL not ready — attempting to start cluster 16/main');
  }

  try {
    execSync('sudo pg_ctlcluster 16 main start', { stdio: 'inherit' });
    execSync('pg_isready -h localhost -p 5432', { stdio: 'inherit' });
    log('PostgreSQL started');
  } catch (error) {
    throw new Error(
      'PostgreSQL is required for mobile E2E. Start it with: sudo pg_ctlcluster 16 main start',
      { cause: error },
    );
  }
}

function runMigrations() {
  log('Generating Prisma client');
  execSync('pnpm db:generate', {
    cwd: repoRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: apiEnv.DATABASE_URL,
    },
  });

  log('Running database migrations');
  execSync('pnpm db:migrate:deploy', {
    cwd: repoRoot,
    stdio: 'inherit',
    env: {
      ...process.env,
      DATABASE_URL: apiEnv.DATABASE_URL,
    },
  });
}

function shutdown(code = 0) {
  freePort(API_PORT);
  freePort(WEB_PORT);

  for (const child of children) {
    if (!child.killed) {
      child.kill('SIGKILL');
    }
  }

  setTimeout(() => process.exit(code), 250);
}

process.on('SIGINT', () => shutdown(0));
process.on('SIGTERM', () => shutdown(0));

async function main() {
  ensurePostgres();
  runMigrations();
  freePort(API_PORT);
  freePort(WEB_PORT);
  await waitForPortFree(API_PORT);
  await waitForPortFree(WEB_PORT);

  log(`Starting API on ${API_URL}`);
  spawnLogged('pnpm', ['--filter', '@forma/api', 'dev'], {
    cwd: repoRoot,
    env: apiEnv,
  });

  log(`Starting Expo web on ${WEB_URL}`);
  spawnLogged('pnpm', ['exec', 'expo', 'start', '--web', '--port', String(WEB_PORT)], {
    cwd: mobileRoot,
    env: webEnv,
  });

  log('Waiting for API health check');
  await waitFor(`${API_URL}/api/health`);
  await waitFor(`${API_URL}/api/ready`);

  log('Waiting for Expo web bundle');
  await waitFor(WEB_URL);
  await waitForWebBundle(WEB_URL);

  log(`Stack ready — API ${API_URL}, web ${WEB_URL}`);
}

main().catch((error) => {
  console.error('[e2e-stack] Failed to start stack:', error);
  shutdown(1);
});
