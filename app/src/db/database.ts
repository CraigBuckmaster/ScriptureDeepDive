/**
 * db/database.ts — Content database initialization (scripture.db).
 *
 * This database is READ-ONLY content: books, chapters, sections, panels,
 * verses, scholars, people, places, timelines, etc. It is replaced in
 * full on every content update (hash mismatch → delete + recopy).
 *
 * User data (notes, bookmarks, highlights, preferences, plans) lives
 * in a separate user.db managed by userDatabase.ts, which is NEVER
 * replaced — only migrated in-place.
 */

import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import { isBundled } from './translationRegistry';
import { openTranslationDb } from './translationManager';
import { logger } from '../utils/logger';

/**
 * Load the expected content hash from the bundled db-manifest.json.
 * This hash is computed by build_sqlite.py from all content JSON files.
 * Any content change → new hash → app replaces cached DB automatically.
 */
// eslint-disable-next-line @typescript-eslint/no-var-requires
const dbManifest = require('../../assets/db-manifest.json') as { content_hash: string; build_time: string };
const EXPECTED_CONTENT_HASH = dbManifest.content_hash;

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize the database. Call once at app startup.
 * On native: loads the bundled scripture.db asset.
 * On web: opens an empty database (data not yet available on web).
 */
export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;

  if (Platform.OS !== 'web') {
    await copyAssetDatabaseIfNeeded();
  } else {
    logger.warn('DB',
      'Web platform detected — scripture.db cannot be loaded from assets on web. ' +
      'The database will be empty. Use Expo Go on a phone for the full experience.'
    );
  }

  db = await SQLite.openDatabaseAsync('scripture.db');

  // Enable WAL mode for better read performance (native only)
  if (Platform.OS !== 'web') {
    await db.execAsync('PRAGMA journal_mode=WAL');
  }

  // Content DB is read-only — no runtime migrations needed.
  // User tables live in user.db (see userDatabase.ts).

  return db;
}

/**
 * Read the installed DB content hash. Returns null if the db_meta table
 * doesn't exist (pre-hash DB) or on any error.
 */
async function getInstalledContentHash(dbPath: string): Promise<string | null> {
  let tempDb: SQLite.SQLiteDatabase | null = null;
  try {
    tempDb = await SQLite.openDatabaseAsync('scripture.db');
    const row = await tempDb.getFirstAsync<{ value: string }>(
      "SELECT value FROM db_meta WHERE key = 'content_hash'"
    );
    return row?.value ?? null;
  } catch (err) {
    // db_meta table doesn't exist in old DBs — that's fine
    return null;
  } finally {
    if (tempDb) {
      await tempDb.closeAsync();
    }
  }
}

/**
 * Copy the bundled scripture.db asset to the SQLite directory.
 * Compares the installed DB content hash against EXPECTED_CONTENT_HASH.
 * Replaces the DB if hashes don't match or DB is missing.
 */
async function copyAssetDatabaseIfNeeded(): Promise<void> {
  const sqliteDir = `${FileSystem.documentDirectory}SQLite/`;
  const dbPath = `${sqliteDir}scripture.db`;

  // Check if DB already exists in documents
  const fileInfo = await FileSystem.getInfoAsync(dbPath);
  if (fileInfo.exists && fileInfo.size && fileInfo.size > 1000) {
    // DB exists — check its content hash
    const installedHash = await getInstalledContentHash(dbPath);
    if (installedHash === EXPECTED_CONTENT_HASH) {
      logger.info('DB', `scripture.db [${installedHash}] is current — skipping copy`);
      return;
    }
    logger.info('DB',
      `scripture.db hash mismatch (installed: ${installedHash ?? 'none'}, ` +
      `expected: ${EXPECTED_CONTENT_HASH}) — replacing`
    );
    // Delete the stale DB so the copy succeeds cleanly
    await FileSystem.deleteAsync(dbPath, { idempotent: true });
  }

  logger.info('DB', 'Copying scripture.db from assets to documents...');

  // Ensure SQLite directory exists
  await FileSystem.makeDirectoryAsync(sqliteDir, { intermediates: true });

  // Resolve and download the bundled asset
  // eslint-disable-next-line @typescript-eslint/no-var-requires
  const asset = Asset.fromModule(require('../../assets/scripture.db'));
  await asset.downloadAsync();

  if (!asset.localUri) {
    throw new Error('[DB] Failed to resolve scripture.db asset — localUri is null');
  }

  // Copy to the SQLite directory where expo-sqlite expects it
  await FileSystem.copyAsync({
    from: asset.localUri,
    to: dbPath,
  });

  const copied = await FileSystem.getInfoAsync(dbPath);
  logger.info('DB',
    `Copied scripture.db [${EXPECTED_CONTENT_HASH}] (${(((copied.exists && copied.size) || 0) / 1024 / 1024).toFixed(1)} MB)`
  );
}

/**
 * Get the core database instance. Throws if not yet initialized.
 */
export function getDb(): SQLite.SQLiteDatabase {
  if (!db) throw new Error('Database not initialized — call initDatabase() first');
  return db;
}

/**
 * Close the current DB connection and reopen from the (updated) file.
 * Called after ContentUpdater swaps the DB file on disk so all
 * subsequent getDb() calls return a connection to the new content.
 */
export async function reloadDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) {
    try {
      await db.closeAsync();
    } catch {
      // Connection may already be invalid if the file was swapped — safe to ignore
    }
    db = null;
  }
  db = await SQLite.openDatabaseAsync('scripture.db');
  if (Platform.OS !== 'web') {
    await db.execAsync('PRAGMA journal_mode=WAL');
  }
  logger.info('DB', 'Database connection reloaded after content update');
  return db;
}

/**
 * Get the database that contains verses for the given translation.
 * - Bundled translations (NIV, KJV) → core scripture.db
 * - Downloaded translations (ESV, ASV, etc.) → separate translation_*.db
 */
export async function getVerseDb(translationId: string): Promise<SQLite.SQLiteDatabase> {
  if (isBundled(translationId)) {
    return getDb();
  }
  return openTranslationDb(translationId);
}
