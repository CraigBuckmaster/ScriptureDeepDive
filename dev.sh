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
BRANCH=$(git rev-parse --abbrev-ref HEAD 2>/dev/null || echo "master")
git pull origin "$BRANCH" || echo "⚠  Pull failed (offline?) — continuing with local"

# ── 2. Build scripture.db if missing, stale, or --rebuild ───────
NEED_BUILD=false

if [[ "$*" == *"--rebuild"* ]]; then
  NEED_BUILD=true
elif [ ! -f "$ROOT/scripture.db" ]; then
  NEED_BUILD=true
else
  # Rebuild if any content or build tool file is newer than the DB
  STALE=$(find "$ROOT/content" "$ROOT/_tools/build_sqlite.py" \
    -newer "$ROOT/scripture.db" -print -quit 2>/dev/null)
  if [ -n "$STALE" ]; then
    echo "📦 Content changed since last build — rebuilding..."
    NEED_BUILD=true
  fi
fi

if [ "$NEED_BUILD" = true ]; then
  echo "📦 Building scripture.db..."
  python3 "$ROOT/_tools/build_sqlite.py" 2>/dev/null \
    || python "$ROOT/_tools/build_sqlite.py"
else
  echo "✓  scripture.db is up to date"
fi

# ── 3. Launch Expo ──────────────────────────────────────────────
cd "$ROOT/app"

EXPO_ARGS=""
if [[ "$*" == *"--clear"* ]]; then
  EXPO_ARGS="--clear"
fi

echo "🚀 Starting Expo..."
npx expo start $EXPO_ARGS
