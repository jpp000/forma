import { execSync } from 'node:child_process';

function freePort(port: number) {
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
  } catch {
    // Port already free.
  }
}

export default async function globalSetup() {
  if (!process.env.CI) {
    return;
  }

  freePort(Number(process.env.E2E_API_PORT ?? 3000));
  freePort(Number(process.env.E2E_WEB_PORT ?? 19006));
}
