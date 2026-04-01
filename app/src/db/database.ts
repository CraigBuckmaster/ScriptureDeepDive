/**
 * db/database.ts — Content database initialization (scripture.db).
 *
 * This database is READ-ONLY content: books, chapters, sections, panels,
 * verses, scholars, people, places, timelines, etc. It is replaced in
 * full on every content update (version mismatch → delete + recopy).
 *
 * User data (notes, bookmarks, highlights, preferences, plans) lives
 * in a separate user.db managed by userDatabase.ts, which is NEVER
 * replaced — only migrated in-place.
 */

import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system/legacy';
import { logger } from '../utils/logger';

/**
 * Bump this when build_sqlite.py's DB_VERSION changes.
 * Must match the value written into db_meta by the build script.
 */
const EXPECTED_DB_VERSION = '0.33';

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
 * Read the installed DB version. Returns null if the db_meta table
 * doesn't exist (pre-versioning DB) or on any error.
 */
async function getInstalledDbVersion(dbPath: string): Promise<string | null> {
  let tempDb: SQLite.SQLiteDatabase | null = null;
  try {
    tempDb = await SQLite.openDatabaseAsync('scripture.db');
    const row = await tempDb.getFirstAsync<{ value: string }>(
      "SELECT value FROM db_meta WHERE key = 'version'"
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
 * Compares the installed DB version against EXPECTED_DB_VERSION.
 * Replaces the DB if versions don't match or DB is missing.
 */
async function copyAssetDatabaseIfNeeded(): Promise<void> {
  const sqliteDir = `${FileSystem.documentDirectory}SQLite/`;
  const dbPath = `${sqliteDir}scripture.db`;

  // Check if DB already exists in documents
  const fileInfo = await FileSystem.getInfoAsync(dbPath);
  if (fileInfo.exists && fileInfo.size && fileInfo.size > 1000) {
    // DB exists — check its version
    const installedVersion = await getInstalledDbVersion(dbPath);
    if (installedVersion === EXPECTED_DB_VERSION) {
      logger.info('DB', `scripture.db v${installedVersion} is current — skipping copy`);
      return;
    }
    logger.info('DB',
      `scripture.db version mismatch (installed: ${installedVersion ?? 'none'}, ` +
      `expected: ${EXPECTED_DB_VERSION}) — replacing`
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
    `Copied scripture.db v${EXPECTED_DB_VERSION} (${((copied.size || 0) / 1024 / 1024).toFixed(1)} MB)`
  );
}

/**
 * Get the database instance. Throws if not yet initialized.
 */
export function getDb(): SQLite.SQLiteDatabase {
  if (!db) throw new Error('Database not initialized — call initDatabase() first');
  return db;
}
