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

// Build DB if it doesn't exist
if (!fs.existsSync(SRC)) {
  console.log('📦 scripture.db not found — building from content...');
  try {
    execSync(`python3 "${BUILD_SCRIPT}"`, { cwd: ROOT, stdio: 'inherit' });
  } catch {
    // Try 'python' on Windows if 'python3' isn't available
    try {
      execSync(`python "${BUILD_SCRIPT}"`, { cwd: ROOT, stdio: 'inherit' });
    } catch (e) {
      console.error('❌ Failed to build scripture.db. Is Python 3 installed?');
      process.exit(1);
    }
  }
}

if (!fs.existsSync(SRC)) {
  console.error(`❌ scripture.db still not found at ${SRC} after build attempt`);
  process.exit(1);
}

fs.copyFileSync(SRC, DST);
const sizeMB = (fs.statSync(DST).size / 1024 / 1024).toFixed(1);
console.log(`✅ scripture.db (${sizeMB} MB) → assets/`);
