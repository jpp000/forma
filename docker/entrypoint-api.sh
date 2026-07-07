#!/bin/sh
set -e

echo "Generating Prisma client..."
./node_modules/.bin/prisma generate --schema=./prisma/schema.prisma

echo "Running database migrations..."
./node_modules/.bin/prisma migrate deploy --schema=./prisma/schema.prisma

echo "Starting API..."
exec node apps/api/dist/main.js
