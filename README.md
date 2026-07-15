# Forma

Plataforma integrada de saúde, treino e nutrição.

## Stack

- **API:** NestJS + Fastify + Prisma
- **Web portal:** Vite + React (profissionais) — porta `5173` via Compose
- **Mobile:** Expo / React Native (aluno) — Metro + **Expo Web** para testes no navegador
- **Worker:** NestJS + BullMQ
- **Banco:** PostgreSQL
- **Cache/Filas:** Redis
- **Deploy:** Render (Blueprint) — API + Postgres no MVP

> **Worker e Redis:** ficam fora do deploy inicial. Adicionamos quando houver jobs assíncronos (IA de alimentação, WhatsApp, notificações).

## Desenvolvimento local

### Setup híbrido (recomendado)

**Docker Compose** sobe Postgres + API (`OAUTH_MOCK=true`) + portal web.  
**Mobile** roda no host — terminal dedicado para `i`/`a` e o emulador.

Deps do backend/portal ficam na imagem/volume do Docker — **não misturam** com `node_modules` do Mac. O mobile usa `pnpm install` no host.

```bash
# terminal 1 — primeira vez ou quando mudar package.json:
pnpm install
pnpm dev:docker:build

# depois disso:
pnpm dev:docker

# terminal 2 — Expo (simulador / device), só se for mobile:
pnpm dev:mobile
# atalhos: i = iOS, a = Android, w = web
```

| Serviço | Onde | URL |
|---------|------|-----|
| Postgres | Docker | `localhost:5432` |
| API | Docker | http://localhost:3000 (`/api/health`, Swagger `/api/docs`) |
| Web portal | Docker | http://localhost:5173 |
| Mobile (Expo) | Host | Metro; web via `pnpm dev:mobile:web` → http://localhost:19006 |

Login mobile/API: **Dev: entrar rápido (mock)** (requer API do compose). Portal: OTP/OAuth mock via API.

Se mudou dependências no Compose: `docker compose build --no-cache && docker compose up`

### API só no Mac (sem container da API)

Útil para debugar a API fora do Docker. Ainda precisa do Postgres e das vars de mock (`OAUTH_MOCK=true`).

```bash
docker compose up -d postgres
pnpm install
cp .env.example .env
pnpm db:migrate:deploy
export DATABASE_URL=postgresql://forma:forma@localhost:5432/forma
export EMAIL_PROVIDER=mock OAUTH_MOCK=true JWT_SECRET=dev-secret-change-in-production
pnpm --filter @forma/api dev
# outro terminal
pnpm dev:mobile
```

### Mobile — UI web e testes (sem simulador)

Útil para agentes no cloud e smoke visual no navegador. Com o compose já no ar:

```bash
pnpm dev:mobile:web
# → http://localhost:19006
```

Sem Docker (API no Mac):

```bash
export DATABASE_URL=postgresql://forma:forma@localhost:5432/forma
export EMAIL_PROVIDER=mock OAUTH_MOCK=true JWT_SECRET=dev-secret
pnpm --filter @forma/api dev

pnpm dev:mobile:web
```

**E2E automatizado** (Postgres + API + web + Playwright):

```bash
pnpm --filter @forma/mobile test:e2e
```

Detalhes para Cursor Cloud e seletores `testID`: [`AGENTS.md`](AGENTS.md).  
Smoke manual: [`apps/mobile/SMOKE.md`](apps/mobile/SMOKE.md).

### Git (branches)

Monorepo usa **`dev`** para integração e **`main`** para release. Ver [`docs/GIT_WORKFLOW.md`](docs/GIT_WORKFLOW.md).

## Qualidade (gates)

| Comando | Escopo |
|---------|--------|
| `pnpm lint` | Biome (repo) |
| `pnpm check-types` | TypeScript (Turbo) |
| `pnpm --filter @forma/api test:e2e` | API integration (Supertest) |
| `pnpm --filter @forma/mobile test` | Mobile unit (Jest) |
| `pnpm --filter @forma/mobile test:e2e` | Mobile web smoke (Playwright) |

## Deploy no Render

### Pré-requisitos

1. Conta no [Render](https://render.com)
2. Repositório Git conectado (GitHub/GitLab)

### Passo a passo

1. **Push** deste repositório para o remote
2. No Render Dashboard: **New → Blueprint**
3. Conecte o repositório — o Render detecta o `render.yaml`
4. Revise os recursos provisionados:
   - `forma-api` — Web Service (Docker)
   - `forma-db` — PostgreSQL 16
5. Clique em **Apply**

### O que acontece no deploy

- A API roda migrations Prisma automaticamente (`docker/entrypoint-api.sh`) antes de subir
- Health check em `/api/health`
- Migrations Prisma rodam no startup (`docker/entrypoint-api.sh`)

### Variáveis de ambiente

O Blueprint injeta automaticamente:

| Variável | Origem |
|----------|--------|
| `DATABASE_URL` | Postgres `forma-db` |
| `PORT` | `3000` (API) |
| `NODE_ENV` | `production` |

### Quando adicionar worker + Redis

Use quando implementarmos:
- Análise de foto de refeição (IA assíncrona)
- Notificações e lembretes em background
- Integração WhatsApp (webhooks + filas)
- Relatórios pesados que não podem bloquear a API

### Custos estimados (Render)

| Recurso | Plano no blueprint |
|---------|-------------------|
| API | Free |
| Postgres | Free (90 dias; migrar depois) |

## Estrutura

```
apps/
  api/       # HTTP API (NestJS)
  mobile/    # App Expo (aluno) — ver apps/mobile/README.md
  worker/    # Jobs assíncronos (BullMQ)
docker/      # Dockerfiles e entrypoints
prisma/      # Schema e migrations
render.yaml  # Infraestrutura como código (Render)
AGENTS.md    # Setup Cursor Cloud + testes web mobile
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Sobe API + worker em watch mode |
| `pnpm build` | Build de produção |
| `pnpm db:migrate` | Migration dev |
| `pnpm db:migrate:deploy` | Migration produção |
| `pnpm db:studio` | Prisma Studio |
| `pnpm dev:docker` | Postgres + API + web portal via Compose |
| `pnpm dev:mobile` | Expo no host (simulador / device) |
| `pnpm dev:mobile:web` | Expo Web (porta 19006) |
| `pnpm dev:portal` | Portal no host (alternativa ao Compose) |
| `pnpm --filter @forma/mobile test:e2e` | Playwright — auth/onboarding/tabs |
