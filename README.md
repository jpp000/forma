# Forma

Plataforma integrada de saúde, treino e nutrição.

## Stack

- **API:** NestJS + Fastify + Prisma
- **Worker:** NestJS + BullMQ
- **Banco:** PostgreSQL
- **Cache/Filas:** Redis
- **Deploy:** Render (Blueprint) — API + Postgres no MVP

> **Worker e Redis:** ficam fora do deploy inicial. Adicionamos quando houver jobs assíncronos (IA de alimentação, WhatsApp, notificações).

## Desenvolvimento local

### Docker (recomendado)

Deps ficam na imagem/volume do Docker — **não mistura** com `node_modules` do Mac.

```bash
# primeira vez ou quando mudar package.json
docker compose up --build

# depois disso, sobe rápido
docker compose up
```

- API: `http://localhost:3000`
- No terminal do `mobile`: `i` (iOS) ou `a` (Android)

Se mudou dependências: `docker compose build --no-cache && docker compose up`

### Sem Docker (apps no Mac)

```bash
docker compose up -d postgres
pnpm install
cp .env.example .env
pnpm db:migrate
pnpm --filter @forma/api dev
# outro terminal
pnpm --filter @forma/mobile dev
```

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
  worker/    # Jobs assíncronos (BullMQ)
docker/      # Dockerfiles e entrypoints
prisma/      # Schema e migrations
render.yaml  # Infraestrutura como código (Render)
```

## Scripts

| Comando | Descrição |
|---------|-----------|
| `pnpm dev` | Sobe API + worker em watch mode |
| `pnpm build` | Build de produção |
| `pnpm db:migrate` | Migration dev |
| `pnpm db:migrate:deploy` | Migration produção |
| `pnpm db:studio` | Prisma Studio |
