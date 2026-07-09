#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/.." && pwd)"
cd "$ROOT"

chmod +x .githooks/pre-push
chmod +x scripts/git/new-feature-branch.sh
chmod +x scripts/git/sync-with-dev.sh

git config core.hooksPath .githooks

echo "✅ Git hooks enabled (core.hooksPath=.githooks)"
