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
 * Check if any file under `dir` is newer than `refPath`.
 * Returns true if the DB should be rebuilt.
 */
function hasNewerContent(dir, refPath) {
  const refMtime = fs.statSync(refPath).mtimeMs;
  try {
    const entries = fs.readdirSync(dir, { withFileTypes: true });
    for (const entry of entries) {
      const full = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        if (hasNewerContent(full, refPath)) return true;
      } else {
        if (fs.statSync(full).mtimeMs > refMtime) return true;
      }
    }
  } catch { /* dir doesn't exist — not stale */ }
  return false;
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

// Build DB if it doesn't exist
if (!fs.existsSync(SRC)) {
  console.log('📦 scripture.db not found — building from content...');
  buildDb();
} else if (
  hasNewerContent(path.join(ROOT, 'content'), SRC) ||
  fs.statSync(path.join(ROOT, '_tools', 'build_sqlite.py')).mtimeMs > fs.statSync(SRC).mtimeMs
) {
  console.log('📦 Content changed since last build — rebuilding scripture.db...');
  buildDb();
}

if (!fs.existsSync(SRC)) {
  console.error(`❌ scripture.db still not found at ${SRC} after build attempt`);
  process.exit(1);
}

fs.copyFileSync(SRC, DST);
const sizeMB = (fs.statSync(DST).size / 1024 / 1024).toFixed(1);
console.log(`✅ scripture.db (${sizeMB} MB) → assets/`);
