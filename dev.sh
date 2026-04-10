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

# Compute content hash from source files (deterministic, git-safe)
CONTENT_HASH=$(python3 -c "
import hashlib
from pathlib import Path
content_dir = Path('content')
json_files = sorted(content_dir.rglob('*.json'))
json_files = [f for f in json_files if 'verses' not in f.parts]
h = hashlib.sha256()
for f in json_files:
    h.update(str(f.relative_to(content_dir)).encode())
    h.update(f.read_bytes())
print(h.hexdigest()[:16])
" 2>/dev/null || echo "")

# Read the content hash baked into the current DB
DB_HASH=""
if [ -f "$ROOT/scripture.db" ]; then
  DB_HASH=$(python3 -c "
import sqlite3
db = sqlite3.connect('scripture.db')
row = db.execute(\"SELECT value FROM db_meta WHERE key='content_hash'\").fetchone()
print(row[0] if row else '')
db.close()
" 2>/dev/null || echo "")
fi

if [[ "$*" == *"--rebuild"* ]]; then
  NEED_BUILD=true
elif [ ! -f "$ROOT/scripture.db" ]; then
  NEED_BUILD=true
elif [ -n "$CONTENT_HASH" ] && [ "$CONTENT_HASH" != "$DB_HASH" ]; then
  echo "📦 Content changed (${DB_HASH:-none} → $CONTENT_HASH) — rebuilding..."
  NEED_BUILD=true
fi

if [ "$NEED_BUILD" = true ]; then
  echo "📦 Building scripture.db..."
  python3 "$ROOT/_tools/build_sqlite.py" 2>/dev/null \
    || python "$ROOT/_tools/build_sqlite.py"
  # Re-read hash after build
  DB_HASH=$CONTENT_HASH
else
  echo "✓  scripture.db is up to date ($DB_HASH)"
fi

# ── 2b. Check if R2 manifest is in sync with local DB ──────────
if [ -n "$DB_HASH" ]; then
  REMOTE_VERSION=$(curl -s --max-time 5 "https://contentcompanionstudy.com/db/manifest.json" 2>/dev/null \
    | python3 -c "import sys,json; print(json.load(sys.stdin).get('current_version',''))" 2>/dev/null \
    || echo "")
  if [ -n "$REMOTE_VERSION" ]; then
    if [ "$DB_HASH" != "$REMOTE_VERSION" ]; then
      echo ""
      echo "⚠️  R2 is out of sync with local DB"
      echo "   Local:  $DB_HASH"
      echo "   Remote: $REMOTE_VERSION"
      echo "   Fix:    gh workflow run content-pipeline.yml   (or run _tools/upload_to_r2.py)"
      echo ""
    else
      echo "✓  R2 manifest is in sync ($REMOTE_VERSION)"
    fi
  else
    echo "⚠  Could not reach R2 manifest (offline?) — skipping sync check"
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
