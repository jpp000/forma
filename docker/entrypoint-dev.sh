#!/bin/sh
set -e

cd /app

if [ "$RUN_MIGRATIONS" = "true" ]; then
  pnpm db:generate
  pnpm db:migrate:deploy
  pnpm --filter @forma/types build
fi

exec "$@"
