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
 * Get the database instance. Throws if not yet initialized.
 */
export function getDb(): SQLite.SQLiteDatabase {
  if (!db) throw new Error('Database not initialized — call initDatabase() first');
  return db;
}
