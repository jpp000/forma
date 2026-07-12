# `@forma/web-portal`

Professional workplace SPA (Vite + React) for trainers and nutritionists.

## Local development

```bash
# API (separate terminal) with CORS for Vite:
export DATABASE_URL=postgresql://forma:forma@localhost:5432/forma
export CORS_ORIGIN=http://localhost:5173
export OAUTH_WEB_SUCCESS_URL=http://localhost:5173/oauth/callback
export OAUTH_MOCK=true EMAIL_PROVIDER=mock JWT_SECRET=dev-secret
pnpm --filter @forma/api dev

# Portal:
cd apps/web-portal
# optional .env:
# VITE_API_URL=http://localhost:3000
# VITE_OAUTH_SUCCESS_URL=http://localhost:5173/oauth/callback
pnpm --filter @forma/web-portal dev
```

Open `http://localhost:5173`.

## Scripts

| Command | Purpose |
|---------|---------|
| `pnpm --filter @forma/web-portal dev` | Vite on port 5173 |
| `pnpm --filter @forma/web-portal build` | Production build → `dist/` |
| `pnpm --filter @forma/web-portal check-types` | `tsc --noEmit` |
| `pnpm --filter @forma/web-portal test` | Vitest unit |
| `pnpm --filter @forma/web-portal test:e2e` | Playwright smoke |

## Environment

| Variable | Where | Purpose |
|----------|-------|---------|
| `VITE_API_URL` | Portal build / local | API origin (e.g. `https://api.example.com`) |
| `VITE_OAUTH_SUCCESS_URL` | Portal (optional) | Client-side oauth return hint |
| `OAUTH_WEB_SUCCESS_URL` | **API** | OAuth `platform=web` redirect target (`…/oauth/callback`) |
| `CORS_ORIGIN` | **API** | Comma-separated portal origins (required in production) |

## Render

Static site `forma-web-portal` in root `render.yaml`:

- Build: `pnpm install --frozen-lockfile && pnpm --filter @forma/types build && pnpm --filter @forma/web-portal build`
- Publish: `apps/web-portal/dist`
- SPA rewrite: `/*` → `/index.html`

Set `VITE_API_URL` on the static site (build-time). Set `CORS_ORIGIN` and `OAUTH_WEB_SUCCESS_URL` on `forma-api` to the portal public URL.
