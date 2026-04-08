#!/usr/bin/env bash
#
# dev.sh — Pull, rebuild DB if needed, and launch Expo.
#
# Usage: ./dev.sh            (normal start)
#        ./dev.sh --clear    (clear metro cache)
#        ./dev.sh --rebuild  (force DB rebuild even if it exists)
#

set -e

ROOT="$(cd "$(dirname "$0")" && pwd)"
cd "$ROOT"

# ── 1. Pull latest changes ──────────────────────────────────────
echo "⬇  Pulling latest changes..."
git pull origin "$(git branch --show-current)" || echo "⚠  Pull failed (offline?) — continuing with local"

# ── 2. Build scripture.db if missing (or --rebuild) ─────────────
if [[ "$*" == *"--rebuild"* ]] || [ ! -f "$ROOT/scripture.db" ]; then
  echo "📦 Building scripture.db..."
  python3 "$ROOT/_tools/build_sqlite.py" 2>/dev/null \
    || python "$ROOT/_tools/build_sqlite.py"
else
  echo "✓  scripture.db exists (use --rebuild to force)"
fi

# ── 3. Launch Expo ──────────────────────────────────────────────
cd "$ROOT/app"

EXPO_ARGS=""
if [[ "$*" == *"--clear"* ]]; then
  EXPO_ARGS="--clear"
fi

echo "🚀 Starting Expo..."
npx expo start $EXPO_ARGS
