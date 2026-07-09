# AGENTS.md

Forma — plataforma integrada de saúde, treino e nutrição. pnpm + Turbo monorepo.
See [`README.md`](README.md) and [`CONTEXT.md`](CONTEXT.md) for product/domain and standard commands.

## Services

| Service | Path | Role | Runtime / port |
|---------|------|------|----------------|
| `@forma/api` | `apps/api` | Core MVP — NestJS + Fastify + Prisma REST API | Node, `http://localhost:3000` (base path `/api`, Swagger at `/api/docs`) |
| `@forma/mobile` | `apps/mobile` | Expo / React Native student app | Metro bundler, `http://localhost:8081` |
| `@forma/worker` | `apps/worker` | BullMQ async jobs — **out of MVP**, needs Redis | not required to run |
| PostgreSQL 16 | — | API datastore (required) | `localhost:5432` |
| Redis | — | worker/queues only (optional, out of MVP) | `localhost:6379` |

## Cursor Cloud specific instructions

The update script installs deps, generates the Prisma client, and builds `@forma/types`.
It does **not** start any service. Postgres and the app processes must be started per session.

- **Postgres is required for the API but is not auto-started.** It is installed system-wide; start it each session with `sudo pg_ctlcluster 16 main start`. The `forma` role/`forma` database already exist (user `forma`, password `forma`, superuser). If missing, recreate with `sudo -u postgres psql -c "CREATE ROLE forma WITH LOGIN PASSWORD 'forma' SUPERUSER;"` and `sudo -u postgres psql -c "CREATE DATABASE forma OWNER forma;"`.
- **The app reads env vars directly from `process.env` — it does NOT load `.env`.** You must export vars in the shell before starting the API (or use `docker compose`). Minimum for dev: `DATABASE_URL=postgresql://forma:forma@localhost:5432/forma PORT=3000 NODE_ENV=development EMAIL_PROVIDER=mock JWT_SECRET=dev-secret-change-in-production OAUTH_MOCK=true OAUTH_MOBILE_SUCCESS_URL=forma://oauth`. A gitignored `.env` with these values is present for reference. `prisma.config.ts` DOES load `.env` via `dotenv`, so Prisma CLI commands (`pnpm db:*`) pick up `DATABASE_URL` from `.env` automatically.
- **Run migrations after Postgres is up:** `pnpm db:migrate:deploy` (idempotent; safe to re-run).
- **Start API (dev, watch):** export the vars above, then `pnpm --filter @forma/api dev`. Verify: `/api/health` (ok), `/api/ready` (checks DB), `/api/docs` (Swagger).
- **Dev auth (no real email/OAuth needed):** with `EMAIL_PROVIDER=mock`, read the last OTP via `GET /api/identity/otp/dev-last?email=<email>`, then `POST /api/identity/otp/verify` to get a JWT. `OAUTH_MOCK=true` enables mock OAuth.
- **Mobile:** `cd apps/mobile && EXPO_PUBLIC_API_URL=http://localhost:3000 pnpm exec expo start`. No iOS/Android simulator or Expo Go is available in the cloud VM; validate by bundling instead of a simulator — fetch the manifest at `http://localhost:8081/` (header `expo-platform: ios`) and request the `launchAsset` bundle URL; a large JS payload with no `UnableToResolveError` means the app compiles. `expo doctor` warns that `babel-preset-expo`/`typescript` versions differ from expected; this is non-blocking.
- **Tests need `DATABASE_URL` exported** (jest does not load `.env`): API e2e = `cd apps/api && pnpm test:e2e` (runs migrations in `beforeAll`, uses `TEST_DATABASE_URL` or `DATABASE_URL`). Mobile = `pnpm --filter @forma/mobile test`.
- **Lint / types (repo root):** `pnpm lint` (Biome) and `pnpm check-types` (Turbo → `tsc`). `pnpm lint` prints a Biome `recommended`-field deprecation *info* — not an error.
- **Docker alternative:** `docker compose up` runs Postgres + API + mobile with env wired in, but Docker is not installed in the cloud VM by default; the native flow above is the supported path here.
