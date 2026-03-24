#!/usr/bin/env node
/**
 * scripts/setup.js — Copy scripture.db into assets/ for Expo bundling.
 *
 * Run: npm run setup (or: node scripts/setup.js)
 * Must be run from the app/ directory.
 *
 * The canonical scripture.db lives at the repo root. This script copies it
 * into app/assets/ where metro can bundle it as a require()-able asset.
 */

const fs = require('fs');
const path = require('path');

const SRC = path.resolve(__dirname, '..', '..', 'scripture.db');
const DST = path.resolve(__dirname, '..', 'assets', 'scripture.db');

console.log('Scripture Deep Dive — Database Setup');
console.log('====================================');

// Check source exists
if (!fs.existsSync(SRC)) {
  console.error(`\n❌ Source not found: ${SRC}`);
  console.error('   Make sure you have built the database first:');
  console.error('     cd .. && python3 _tools/build_sqlite.py');
  process.exit(1);
}

const srcStats = fs.statSync(SRC);
const sizeMB = (srcStats.size / 1024 / 1024).toFixed(1);
console.log(`\n  Source: ${SRC} (${sizeMB} MB)`);
console.log(`  Target: ${DST}`);

// Check if target already exists and is same size
if (fs.existsSync(DST)) {
  const dstStats = fs.statSync(DST);
  if (dstStats.size === srcStats.size) {
    console.log(`\n  ✅ Already up to date (${sizeMB} MB). Skipping copy.`);
    process.exit(0);
  }
  console.log(`  ⚠  Target exists but different size — overwriting.`);
}

// Copy
console.log('  Copying...');
fs.copyFileSync(SRC, DST);

const dstStats = fs.statSync(DST);
const dstMB = (dstStats.size / 1024 / 1024).toFixed(1);
console.log(`\n  ✅ Copied scripture.db (${dstMB} MB) to assets/`);
console.log('  You can now run: npx expo start');
