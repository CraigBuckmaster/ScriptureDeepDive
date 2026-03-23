/**
 * db/database.ts — Database initialization and singleton access.
 *
 * On first launch, copies scripture.db from app assets to the documents
 * directory. Returns a singleton SQLiteDatabase instance.
 */

import * as SQLite from 'expo-sqlite';

let db: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize the database. Call once at app startup.
 * Opens the pre-bundled scripture.db from app assets.
 */
export async function initDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (db) return db;
  db = await SQLite.openDatabaseAsync('scripture.db');
  // Enable WAL mode for better read performance
  await db.execAsync('PRAGMA journal_mode=WAL');
  return db;
}

/**
 * Get the database instance. Throws if not yet initialized.
 */
export function getDb(): SQLite.SQLiteDatabase {
  if (!db) throw new Error('Database not initialized — call initDatabase() first');
  return db;
}
