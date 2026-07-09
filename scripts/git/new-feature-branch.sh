#!/usr/bin/env bash
set -euo pipefail

ROOT="$(cd "$(dirname "$0")/../.." && pwd)"
cd "$ROOT"

branch="${1:-}"
if [ -z "$branch" ]; then
  echo "Usage: $0 <branch-name>"
  echo "Example: $0 feature/mobile-progress"
  exit 1
fi

if [[ "$branch" == "main" || "$branch" == "dev" ]]; then
  echo "❌ Cannot create a feature branch named '$branch'."
  exit 1
fi

git fetch origin dev
git checkout dev
git pull --ff-only origin dev
git checkout -b "$branch"

echo "✅ Created '$branch' from latest origin/dev"
