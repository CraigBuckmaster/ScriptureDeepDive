/**
 * db/database.ts — Database initialization and singleton access.
 *
 * On native (Expo Go / dev build), copies the pre-bundled scripture.db
 * from app assets to the documents directory on first launch, then opens it.
 *
 * On web, creates an empty database (full web DB loading is a future task).
 */

import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import { Asset } from 'expo-asset';
import * as FileSystem from 'expo-file-system';

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
    console.warn(
      '[DB] Web platform detected — scripture.db cannot be loaded from assets on web. ' +
      'The database will be empty. Use Expo Go on a phone for the full experience.'
    );
  }

  db = await SQLite.openDatabaseAsync('scripture.db');

  // Enable WAL mode for better read performance (native only)
  if (Platform.OS !== 'web') {
    await db.execAsync('PRAGMA journal_mode=WAL');
  }

  // Run migrations for user tables
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS verse_highlights (
      id INTEGER PRIMARY KEY AUTOINCREMENT,
      verse_ref TEXT NOT NULL,
      color TEXT NOT NULL,
      created_at TEXT DEFAULT (datetime('now')),
      UNIQUE(verse_ref)
    );
    CREATE TABLE IF NOT EXISTS reading_plans (
      id TEXT PRIMARY KEY,
      name TEXT NOT NULL,
      description TEXT NOT NULL,
      total_days INTEGER NOT NULL,
      chapters_json TEXT NOT NULL
    );
    CREATE TABLE IF NOT EXISTS plan_progress (
      plan_id TEXT NOT NULL REFERENCES reading_plans(id),
      day_num INTEGER NOT NULL,
      completed_at TEXT,
      PRIMARY KEY (plan_id, day_num)
    );
  `);

  return db;
}

/**
 * Copy the bundled scripture.db asset to the SQLite directory.
 * Only runs on first launch or if the DB file is missing.
 */
async function copyAssetDatabaseIfNeeded(): Promise<void> {
  const sqliteDir = `${FileSystem.documentDirectory}SQLite/`;
  const dbPath = `${sqliteDir}scripture.db`;

  // Check if DB already exists in documents
  const fileInfo = await FileSystem.getInfoAsync(dbPath);
  if (fileInfo.exists && fileInfo.size && fileInfo.size > 1000) {
    // DB exists and has content — skip copy
    return;
  }

  console.log('[DB] Copying scripture.db from assets to documents...');

  // Ensure SQLite directory exists
  await FileSystem.makeDirectoryAsync(sqliteDir, { intermediates: true });

  // Download the asset (resolves the bundled file to a local URI)
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
  console.log(`[DB] Copied scripture.db (${((copied.size || 0) / 1024 / 1024).toFixed(1)} MB)`);
}

/**
 * Get the database instance. Throws if not yet initialized.
 */
export function getDb(): SQLite.SQLiteDatabase {
  if (!db) throw new Error('Database not initialized — call initDatabase() first');
  return db;
}
