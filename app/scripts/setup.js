#!/usr/bin/env node
/**
 * scripts/setup.js — Ensure scripture.db is ready for Expo bundling.
 *
 * Run: npm run setup (or: node scripts/setup.js)
 * Must be run from the app/ directory.
 *
 * The canonical scripture.db lives at the repo root. This script copies it
 * into app/assets/ where metro can bundle it as a require()-able asset.
 *
 * If the root DB doesn't exist, it runs build_sqlite.py to generate it.
 * Always copies — a 35MB file copy takes <100ms and eliminates stale DB bugs.
 */

const fs = require('fs');
const path = require('path');
const { execSync } = require('child_process');

const ROOT = path.resolve(__dirname, '..', '..');
const SRC = path.join(ROOT, 'scripture.db');
const DST = path.resolve(__dirname, '..', 'assets', 'scripture.db');
const BUILD_SCRIPT = path.join(ROOT, '_tools', 'build_sqlite.py');

/**
 * Compute content hash from source files (same algorithm as build_sqlite.py).
 * Returns null on failure.
 */
function computeContentHash() {
  try {
    const result = execSync(`python3 -c "
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
"`, { cwd: ROOT, encoding: 'utf8' }).trim();
    return result || null;
  } catch {
    return null;
  }
}

/**
 * Read the content hash from the DB's db_meta table. Returns null on failure.
 */
function getDbHash() {
  try {
    const result = execSync(`python3 -c "
import sqlite3
db = sqlite3.connect('scripture.db')
row = db.execute(\\"SELECT value FROM db_meta WHERE key='content_hash'\\").fetchone()
print(row[0] if row else '')
db.close()
"`, { cwd: ROOT, encoding: 'utf8' }).trim();
    return result || null;
  } catch {
    return null;
  }
}

function buildDb() {
  try {
    execSync(`python3 "${BUILD_SCRIPT}"`, { cwd: ROOT, stdio: 'inherit' });
  } catch {
    try {
      execSync(`python "${BUILD_SCRIPT}"`, { cwd: ROOT, stdio: 'inherit' });
    } catch (e) {
      console.error('❌ Failed to build scripture.db. Is Python 3 installed?');
      process.exit(1);
    }
  }
}

// Build DB if it doesn't exist or content has changed
if (!fs.existsSync(SRC)) {
  console.log('📦 scripture.db not found — building from content...');
  buildDb();
} else {
  const contentHash = computeContentHash();
  const dbHash = getDbHash();
  if (contentHash && contentHash !== dbHash) {
    console.log(`📦 Content changed (${dbHash || 'none'} → ${contentHash}) — rebuilding scripture.db...`);
    buildDb();
  }
}

if (!fs.existsSync(SRC)) {
  console.error(`❌ scripture.db still not found at ${SRC} after build attempt`);
  process.exit(1);
}

fs.copyFileSync(SRC, DST);
const sizeMB = (fs.statSync(DST).size / 1024 / 1024).toFixed(1);
console.log(`✅ scripture.db (${sizeMB} MB) → assets/`);
