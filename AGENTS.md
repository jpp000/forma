# AGENTS.md

Forma — plataforma integrada de saúde, treino e nutrição. Monorepo pnpm + Turbo.
Veja [`README.md`](README.md) e [`CONTEXT.md`](CONTEXT.md) para domínio e comandos padrão.

## Git workflow

**Trabalhe sempre a partir de `dev`.** Apenas `dev` mergeia em `main`.

```bash
git fetch origin && git checkout dev && git pull --ff-only origin dev
./scripts/git/new-feature-branch.sh feature/minha-task
# antes do PR:
./scripts/git/sync-with-dev.sh
```

Regras completas, tasks paralelas e hotfix: [`docs/GIT_WORKFLOW.md`](docs/GIT_WORKFLOW.md).  
Hooks locais (uma vez por clone): `./scripts/setup-git-hooks.sh`

## Serviços

| Serviço | Path | Papel | Runtime / porta |
|---------|------|-------|-----------------|
| `@forma/api` | `apps/api` | API REST NestJS + Fastify + Prisma | Node, `http://localhost:3000` (`/api`, Swagger em `/api/docs`) |
| `@forma/mobile` | `apps/mobile` | App Expo / React Native (aluno) | Metro `8081`, **web E2E** `19006` |
| `@forma/web-portal` | `apps/web-portal` | Portal profissional (Vite SPA) | Vite `5173` |
| `@forma/worker` | `apps/worker` | Jobs BullMQ (fora do MVP) | Requer Redis |
| PostgreSQL 16 | — | Banco da API (obrigatório) | `localhost:5432` |
| Redis | — | Filas do worker (opcional, fora do MVP) | `localhost:6379` |

## Cursor Cloud — setup por sessão

O script de update do ambiente roda `pnpm install`, `pnpm db:generate` e `pnpm --filter @forma/types build`. **Não inicia serviços.**

`prisma.config.ts` usa um fallback de `DATABASE_URL` (mesmo valor de `.env.example`) para que `db:generate` funcione em clones frescos sem `.env`. Para migrações e runtime da API, prefira ter `.env` ou exportar a variável.

### Bootstrap rápido (agente / clone novo)

```bash
pnpm setup:cloud          # .env se ausente + prisma generate + @forma/types build
pnpm postgres:dev         # Postgres local (uma vez por sessão)
pnpm db:migrate:deploy    # schema no banco
```

Equivalente manual ao install do ambiente:

```bash
pnpm install --frozen-lockfile
pnpm db:generate
pnpm --filter @forma/types build
```

### PostgreSQL

Obrigatório para API e testes E2E mobile. Inicie a cada sessão:

```bash
sudo pg_ctlcluster 16 main start
```

Credenciais padrão: `postgresql://forma:forma@localhost:5432/forma` (role `forma`, superuser).

Se role/DB não existirem:

```bash
sudo -u postgres psql -c "CREATE ROLE forma WITH LOGIN PASSWORD 'forma' SUPERUSER;"
sudo -u postgres psql -c "CREATE DATABASE forma OWNER forma;"
```

### Variáveis de ambiente da API

A API lê `process.env` diretamente — **não carrega `.env` automaticamente**. Exporte antes de subir a API:

```bash
export DATABASE_URL=postgresql://forma:forma@localhost:5432/forma
export PORT=3000 NODE_ENV=development EMAIL_PROVIDER=mock
export JWT_SECRET=dev-secret-change-in-production
export OAUTH_MOCK=true OAUTH_MOBILE_SUCCESS_URL=forma://oauth
```

`prisma.config.ts` usa dotenv, então `pnpm db:*` lê `.env` na raiz. Um `.env` gitignored na raiz pode servir de referência; a API em dev **não** o carrega automaticamente.

### Migrações

```bash
pnpm db:migrate:deploy
```

### API (dev)

```bash
# com as vars exportadas acima
pnpm --filter @forma/api dev
```

Verificar: `/api/health`, `/api/ready`, `/api/docs`

## Web portal — profissionais

Vite SPA em `apps/web-portal` (porta **5173**). Detalhes: [`apps/web-portal/README.md`](apps/web-portal/README.md).

```bash
export CORS_ORIGIN=http://localhost:5173
export OAUTH_WEB_SUCCESS_URL=http://localhost:5173/oauth/callback
pnpm --filter @forma/api dev
pnpm --filter @forma/web-portal dev
```

Render: serviço estático `forma-web-portal` no `render.yaml` (rewrite SPA `/*` → `/index.html`). Em produção, configure `VITE_API_URL` no portal e `CORS_ORIGIN` + `OAUTH_WEB_SUCCESS_URL` na API.

## Mobile — desenvolvimento e testes visuais

**Não há simulador iOS/Android nem Expo Go neste ambiente.** Use a versão **web** para navegar e testar a UI.

### Subir só o app web (API já rodando)

```bash
cd apps/mobile
EXPO_PUBLIC_API_URL=http://localhost:3000 pnpm dev:web
```

Abra `http://localhost:19006` no navegador. O agente pode usar automação de browser (Playwright / computer use) para clicar e navegar.

### Stack completa para E2E (API + web)

```bash
pnpm --filter @forma/mobile test:e2e
```

Isso sobe Postgres (se necessário), migra o banco, inicia API + Expo web e roda Playwright no Chromium.

Scripts úteis:

| Comando | Uso |
|---------|-----|
| `pnpm --filter @forma/mobile dev:web` | Expo web na porta 19006 |
| `pnpm --filter @forma/mobile test` | Jest (unit) |
| `pnpm --filter @forma/mobile test:e2e` | Playwright smoke (auth → onboarding → tabs) |
| `pnpm --filter @forma/mobile test:e2e:ui` | Playwright UI mode (debug) |
| `pnpm --filter @forma/mobile check-types` | `tsc` |

### Auth em dev (sem email/OAuth real)

- `EMAIL_PROVIDER=mock` — OTP via `GET /api/identity/otp/dev-last?email=...`, depois `POST /api/identity/otp/verify` para obter JWT
- `OAUTH_MOCK=true` — botão **Dev: entrar rápido (mock)** na tela de login
- Na tela OTP, **Dev: usar código mock** preenche o código automaticamente

### Seletores E2E (`testID`)

Telas e ações principais têm `testID` (vira `data-testid` no web):

- Auth: `auth-screen`, `auth-email-input`, `auth-request-otp-button`, `auth-dev-mock-login`
- OTP: `auth-otp-screen`, `auth-dev-otp-fill`, `auth-otp-submit-button`
- Onboarding: `onboarding-profile-screen`, `onboarding-goal-screen`, chips `onboarding-sex-*`, `onboarding-goal-*`
- Tabs: `tab-home`, `tab-training`, `tab-nutrition`, `tab-progress`

### Testes unitários e API

```bash
pnpm --filter @forma/mobile test
cd apps/api && DATABASE_URL=postgresql://forma:forma@localhost:5432/forma pnpm test:e2e
pnpm lint && pnpm check-types
```

### Validação Metro sem simulador (alternativa)

Se não for usar Expo Web, valide o bundle via manifest Metro:

```bash
cd apps/mobile && EXPO_PUBLIC_API_URL=http://localhost:3000 pnpm exec expo start
```

Busque `http://localhost:8081/` com header `expo-platform: ios` e requisite a URL `launchAsset` do manifest. Um payload JS grande sem `UnableToResolveError` indica que o app compila.

### Limitações conhecidas

- Expo Web cobre a maior parte da UI, mas gestos nativos, câmera e notificações podem diferir do app nativo.
- `expo-secure-store` no web usa `localStorage` (já tratado em `tokenStorage.ts`).
- Validação nativa em simulador/dispositivo continua sendo feita fora do cloud VM.
- `expo doctor` pode avisar sobre versões de `babel-preset-expo` / `typescript` — não bloqueia dev web.
- API em dev expõe CORS (`PUT`/`PATCH`/`DELETE` inclusos) para o browser em `localhost:19006`.

### Docker (Mac / CI com Docker)

`docker compose up` sobe Postgres + API + mobile (Metro). Para UI web no host, rode API via compose e `pnpm dev:web` no Mac apontando `EXPO_PUBLIC_API_URL=http://localhost:3000`.

Docker **não** vem instalado na cloud VM por padrão; o fluxo nativo acima é o caminho suportado no Cursor Cloud.

### Notas de ambiente

- `pnpm db:generate` roda automaticamente no stack E2E (`scripts/e2e-stack.mjs`) antes das migrations.
- Testes API e2e precisam de `DATABASE_URL` exportado (Jest não carrega `.env` da API).
- Playwright Chromium: primeira vez → `pnpm --filter @forma/mobile test:e2e:install`.
- `pnpm lint` (Biome) pode imprimir um aviso *info* sobre o campo `recommended` deprecado — não é erro.
