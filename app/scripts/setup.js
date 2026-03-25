#!/usr/bin/env node
/**
 * scripts/setup.js — Copy scripture.db into assets/ for Expo bundling.
 *
 * Run: npm run setup (or: node scripts/setup.js)
 * Must be run from the app/ directory.
 *
 * The canonical scripture.db lives at the repo root. This script copies it
 * into app/assets/ where metro can bundle it as a require()-able asset.
 * Always copies — a 35MB file copy takes <100ms and eliminates stale DB bugs.
 */

const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, '..', '..', 'scripture.db');
const DST = path.resolve(__dirname, '..', 'assets', 'scripture.db');

// Check source exists
if (!fs.existsSync(SRC)) {
  console.error(`❌ scripture.db not found at ${SRC}`);
  console.error('   Run: cd .. && python3 _tools/build_sqlite.py');
  process.exit(1);
}

fs.copyFileSync(SRC, DST);
const sizeMB = (fs.statSync(DST).size / 1024 / 1024).toFixed(1);
console.log(`✅ scripture.db (${sizeMB} MB) → assets/`);
