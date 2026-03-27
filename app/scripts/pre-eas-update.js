#!/usr/bin/env node
/**
 * scripts/pre-eas-update.js — Verify scripture.db is ready for EAS update.
 *
 * Run: npm run pre-update (or: node scripts/pre-eas-update.js)
 * Must be run from the app/ directory BEFORE `eas update`.
 *
 * This script:
 * 1. Checks that the root scripture.db exists
 * 2. Compares it with assets/scripture.db (if exists)
 * 3. Copies if missing or different
 * 4. Warns loudly if the DB was stale
 *
 * Exit codes:
 *   0 = ready for eas update
 *   1 = error (missing source DB, etc.)
 */

const fs = require('fs');
const path = require('path');
const crypto = require('crypto');

const ROOT_DB = path.resolve(__dirname, '..', '..', 'scripture.db');
const ASSET_DB = path.resolve(__dirname, '..', 'assets', 'scripture.db');

function getFileHash(filePath) {
  const content = fs.readFileSync(filePath);
  return crypto.createHash('md5').update(content).digest('hex');
}

function formatSize(bytes) {
  return (bytes / 1024 / 1024).toFixed(1) + ' MB';
}

console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('  PRE-EAS-UPDATE CHECK');
console.log('═══════════════════════════════════════════════════════════');
console.log('');

// Check root DB exists
if (!fs.existsSync(ROOT_DB)) {
  console.error('❌ ERROR: scripture.db not found at repo root!');
  console.error('');
  console.error('   Run from repo root:');
  console.error('     python3 _tools/build_sqlite.py');
  console.error('');
  process.exit(1);
}

const rootStats = fs.statSync(ROOT_DB);
const rootHash = getFileHash(ROOT_DB);
console.log(`📦 Root scripture.db: ${formatSize(rootStats.size)}`);
console.log(`   Hash: ${rootHash.substring(0, 12)}...`);

// Check if asset DB exists
if (!fs.existsSync(ASSET_DB)) {
  console.log('');
  console.log('⚠️  assets/scripture.db does not exist — copying now...');
  fs.copyFileSync(ROOT_DB, ASSET_DB);
  console.log('✅ Copied scripture.db → assets/');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  ✅ READY FOR EAS UPDATE');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  process.exit(0);
}

// Compare hashes
const assetStats = fs.statSync(ASSET_DB);
const assetHash = getFileHash(ASSET_DB);
console.log(`📱 Asset scripture.db: ${formatSize(assetStats.size)}`);
console.log(`   Hash: ${assetHash.substring(0, 12)}...`);
console.log('');

if (rootHash === assetHash) {
  console.log('✅ Databases match — no copy needed.');
  console.log('');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('  ✅ READY FOR EAS UPDATE');
  console.log('═══════════════════════════════════════════════════════════');
  console.log('');
  process.exit(0);
}

// DBs are different — this is the bug we're trying to prevent!
console.log('');
console.log('╔═══════════════════════════════════════════════════════════╗');
console.log('║  ⚠️  WARNING: DATABASE MISMATCH DETECTED                  ║');
console.log('╠═══════════════════════════════════════════════════════════╣');
console.log('║                                                           ║');
console.log('║  The assets/scripture.db is STALE!                        ║');
console.log('║  Without updating, users will see old content.            ║');
console.log('║                                                           ║');
console.log('╚═══════════════════════════════════════════════════════════╝');
console.log('');
console.log('🔄 Copying fresh scripture.db → assets/...');
fs.copyFileSync(ROOT_DB, ASSET_DB);
console.log('✅ Done.');
console.log('');
console.log('═══════════════════════════════════════════════════════════');
console.log('  ✅ READY FOR EAS UPDATE');
console.log('═══════════════════════════════════════════════════════════');
console.log('');
process.exit(0);
