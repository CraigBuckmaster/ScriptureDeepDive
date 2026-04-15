/**
 * db/database.ts — Content database initialization (scripture.db).
 *
 * This database is READ-ONLY content: books, chapters, sections, panels,
 * verses, scholars, people, places, timelines, etc. It is no longer bundled
 * with the app — the first-launch download screen fetches it from R2 via
 * ContentUpdater. Subsequent updates are applied by ContentUpdater as well.
 *
 * User data (notes, bookmarks, highlights, preferences, plans) lives
 * in a separate user.db managed by userDatabase.ts, which is NEVER
 * replaced — only migrated in-place.
 */

import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';
import * as FileSystem from 'expo-file-system/legacy';
import { logger } from '../utils/logger';
import { isBundled } from './translationRegistry';
import { openTranslationDb } from './translationManager';

/**
 * Result of {@link initDatabase}. When `'needs_download'`, the caller should
 * render the DbDownloadScreen to fetch scripture.db from R2 before continuing.
 */
export type DbInitStatus = 'ready' | 'needs_download';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize the database. Call once at app startup.
 *
 * Returns `'needs_download'` if the DB file is missing (or too small to be
 * valid) so the caller can show the download screen. Returns `'ready'` once
 * the DB is open and WAL mode is enabled.
 */
export async function initDatabase(): Promise<DbInitStatus> {
  if (db) return 'ready';

  if (Platform.OS === 'web') {
    logger.warn('DB',
      'Web platform detected — scripture.db cannot be loaded on web. ' +
      'The database will be empty. Use Expo Go on a phone for the full experience.'
    );
    db = await SQLite.openDatabaseAsync('scripture.db');
    return 'ready';
  }

  const dbPath = `${FileSystem.documentDirectory}SQLite/scripture.db`;
  const info = await FileSystem.getInfoAsync(dbPath);
  if (!info.exists || !info.size || info.size < 1000) {
    logger.info('DB', 'scripture.db missing or too small — signaling needs_download');
    return 'needs_download';
  }

  db = await SQLite.openDatabaseAsync('scripture.db');
  await db.execAsync('PRAGMA journal_mode=WAL');

  // Content DB is read-only — no runtime migrations needed.
  // User tables live in user.db (see userDatabase.ts).

  return 'ready';
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
