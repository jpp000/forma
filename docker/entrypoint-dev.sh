#!/bin/sh
set -e

cd /app

# Named volumes for node_modules start empty / may lag the lockfile when
# new workspace packages are added (e.g. web-portal). Keep them in sync.
pnpm install --frozen-lockfile

if [ "$RUN_MIGRATIONS" = "true" ]; then
  pnpm db:generate
  pnpm db:migrate:deploy
  pnpm --filter @forma/types build
fi

exec "$@"
