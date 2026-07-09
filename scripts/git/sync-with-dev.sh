#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

current="$(git symbolic-ref --short HEAD 2>/dev/null || true)"
if [ -z "$current" ]; then
  echo "❌ Detached HEAD — checkout your feature branch first."
  exit 1
fi

if [[ "$current" == "dev" || "$current" == "main" ]]; then
  echo "❌ Run this from a feature branch, not from '$current'."
  exit 1
fi

git fetch origin dev
git merge origin/dev

echo "✅ '$current' is synced with origin/dev"
