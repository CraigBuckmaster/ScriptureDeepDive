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

# ── 2b. Check if R2 manifest is in sync with local DB ──────────
if [ -f "$ROOT/scripture.db" ]; then
  MANIFEST_JSON=$(curl -s --max-time 5 "https://contentcompanionstudy.com/db/manifest.json" 2>/dev/null || echo "")
  if [ -n "$MANIFEST_JSON" ]; then
    REMOTE_SHA=$(echo "$MANIFEST_JSON" | python3 -c "import sys,json; print(json.load(sys.stdin).get('full_db_sha256',''))" 2>/dev/null \
      || echo "$MANIFEST_JSON" | python -c "import sys,json; print(json.load(sys.stdin).get('full_db_sha256',''))" 2>/dev/null)
    if [ -n "$REMOTE_SHA" ]; then
      LOCAL_SHA=$(sha256sum "$ROOT/scripture.db" 2>/dev/null | cut -d' ' -f1 \
        || shasum -a 256 "$ROOT/scripture.db" 2>/dev/null | cut -d' ' -f1 \
        || python3 -c "import hashlib;print(hashlib.sha256(open('$ROOT/scripture.db','rb').read()).hexdigest())" 2>/dev/null \
        || python -c "import hashlib;print(hashlib.sha256(open('$ROOT/scripture.db','rb').read()).hexdigest())" 2>/dev/null)
      if [ -n "$LOCAL_SHA" ] && [ "$LOCAL_SHA" != "$REMOTE_SHA" ]; then
        echo ""
        echo "⚠️  R2 is out of sync with local DB"
        echo "   Local:  ${LOCAL_SHA:0:16}..."
        echo "   Remote: ${REMOTE_SHA:0:16}..."
        echo "   Run:    python _tools/upload_to_r2.py"
        echo ""
      fi
    fi
  fi
fi

# ── 3. Launch Expo ──────────────────────────────────────────────
cd "$ROOT/app"

EXPO_ARGS=""
if [[ "$*" == *"--clear"* ]]; then
  EXPO_ARGS="--clear"
fi

echo "🚀 Starting Expo..."
npx expo start $EXPO_ARGS
