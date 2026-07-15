# @forma/web-portal

Professional workplace SPA (Vite + React) for trainers and nutritionists.

## Local development (recomendado)

Com o Compose (Postgres + API + este portal):

```bash
pnpm dev:docker
# → http://localhost:5173
```

`CORS_ORIGIN` e `OAUTH_WEB_SUCCESS_URL` já vêm configurados no serviço `api` do Compose.

## Host-only (sem container do portal)

```bash
# API — include portal origin for CORS
export DATABASE_URL=postgresql://forma:forma@localhost:5432/forma
export PORT=3000 NODE_ENV=development EMAIL_PROVIDER=mock
export JWT_SECRET=dev-secret-change-in-production
export OAUTH_MOCK=true
export CORS_ORIGIN=http://localhost:5173
export OAUTH_WEB_SUCCESS_URL=http://localhost:5173/oauth/callback
pnpm --filter @forma/api dev

# Portal
pnpm --filter @forma/web-portal dev
# or: pnpm dev:portal
```

Open `http://localhost:5173`.

## Environment variables

| Variable | Where | Purpose |
|----------|-------|---------|
| `VITE_API_URL` | Portal build/runtime | API base URL (default `http://localhost:3000`) |
| `VITE_OAUTH_SUCCESS_URL` | Portal (optional) | Documented callback path; API uses `OAUTH_WEB_SUCCESS_URL` |
| `OAUTH_WEB_SUCCESS_URL` | API | OAuth `platform=web` redirect target (`…/oauth/callback`) |
| `CORS_ORIGIN` | API | Comma-separated allowlist (include portal origin in production) |

## Scripts

| Command | Use |
|---------|-----|
| `pnpm --filter @forma/web-portal dev` | Vite on port 5173 |
| `pnpm --filter @forma/web-portal build` | Production build → `dist/` |
| `pnpm --filter @forma/web-portal check-types` | `tsc --noEmit` |
| `pnpm --filter @forma/web-portal test` | Vitest unit tests |
| `pnpm --filter @forma/web-portal test:e2e` | Playwright W1 smoke |

## Render

Blueprint service `forma-web-portal` in root `render.yaml`:

- Static site; `staticPublishPath: apps/web-portal/dist`
- SPA rewrite: `/*` → `/index.html`
- Set `VITE_API_URL` to the public API URL at **build** time
- On `forma-api`, set `CORS_ORIGIN` to the portal URL and `OAUTH_WEB_SUCCESS_URL` to `{portal}/oauth/callback`
