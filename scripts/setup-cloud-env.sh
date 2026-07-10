#!/usr/bin/env bash
# Idempotent bootstrap for Cursor Cloud agents and fresh clones.
# Safe to re-run: creates .env if missing, generates Prisma client, builds shared types.
set -euo pipefail

ROOT="$(cd "$(dirname "${BASH_SOURCE[0]}")/.." && pwd)"
cd "$ROOT"

if [[ ! -f .env ]]; then
  cp .env.example .env
  echo "Created .env from .env.example"
fi

export DATABASE_URL="${DATABASE_URL:-postgresql://forma:forma@localhost:5432/forma}"

pnpm db:generate
pnpm --filter @forma/types build

echo "Cloud env setup complete."
