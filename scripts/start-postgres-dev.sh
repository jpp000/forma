#!/usr/bin/env bash
# Start local PostgreSQL 16 for API/E2E on Cursor Cloud (run once per session).
set -euo pipefail

if command -v pg_ctlcluster >/dev/null 2>&1; then
  sudo pg_ctlcluster 16 main start || true
else
  echo "pg_ctlcluster not found — install PostgreSQL 16 or use Docker postgres." >&2
  exit 1
fi

# Ensure role + database exist (no-op if already created).
if command -v psql >/dev/null 2>&1; then
  sudo -u postgres psql -tc "SELECT 1 FROM pg_roles WHERE rolname = 'forma'" | grep -q 1 \
    || sudo -u postgres psql -c "CREATE ROLE forma WITH LOGIN PASSWORD 'forma' SUPERUSER;"
  sudo -u postgres psql -tc "SELECT 1 FROM pg_database WHERE datname = 'forma'" | grep -q 1 \
    || sudo -u postgres psql -c "CREATE DATABASE forma OWNER forma;"
fi

echo "PostgreSQL ready: postgresql://forma:forma@localhost:5432/forma"
