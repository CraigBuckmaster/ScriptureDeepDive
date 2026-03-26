/**
 * db/userDatabase.ts — User data database (user.db).
 *
 * Separate from scripture.db so that content updates can safely
 * replace the content DB without destroying user data.
 *
 * Schema changes are managed via versioned migrations that run
 * in order on first launch after an update. Each migration is
 * wrapped in a transaction — if it fails, earlier migrations
 * remain applied and the app can retry on next launch.
 */

import { Platform } from 'react-native';
import * as SQLite from 'expo-sqlite';

// ── Singleton ──────────────────────────────────────────────────

let userDb: SQLite.SQLiteDatabase | null = null;

/**
 * Initialize the user database. Call once at app startup,
 * after initDatabase() (content DB).
 */
export async function initUserDatabase(): Promise<SQLite.SQLiteDatabase> {
  if (userDb) return userDb;

  userDb = await SQLite.openDatabaseAsync('user.db');

  if (Platform.OS !== 'web') {
    await userDb.execAsync('PRAGMA journal_mode=WAL');
  }

  await runMigrations(userDb);
  return userDb;
}

/**
 * Get the user database instance. Throws if not yet initialized.
 */
export function getUserDb(): SQLite.SQLiteDatabase {
  if (!userDb) {
    throw new Error('User database not initialized — call initUserDatabase() first');
  }
  return userDb;
}

// ── Migration System ───────────────────────────────────────────

interface Migration {
  version: number;
  description: string;
  sql: string;
}

/**
 * Ordered list of migrations. Each runs exactly once.
 * To add a new migration: append to the end with the next version number.
 * NEVER modify or reorder existing migrations.
 */
const MIGRATIONS: Migration[] = [
  {
    version: 1,
    description: 'Initial user tables — notes, progress, bookmarks, preferences, highlights, plans',
    sql: `
      CREATE TABLE IF NOT EXISTS user_notes (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        verse_ref TEXT NOT NULL,
        note_text TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS reading_progress (
        book_id TEXT NOT NULL,
        chapter_num INTEGER NOT NULL,
        completed_at TEXT,
        PRIMARY KEY (book_id, chapter_num)
      );

      CREATE TABLE IF NOT EXISTS bookmarks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        verse_ref TEXT NOT NULL,
        label TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );

      CREATE TABLE IF NOT EXISTS user_preferences (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL
      );

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
    `,
  },
  // ────────────────────────────────────────────────────────────
  // Future migrations go here:
  //
  // {
  //   version: 2,
  //   description: 'Add foo column to user_notes',
  //   sql: `ALTER TABLE user_notes ADD COLUMN foo TEXT;`,
  // },
  // ────────────────────────────────────────────────────────────
];

/**
 * Run all pending migrations in version order.
 * Each migration is wrapped in its own transaction.
 */
async function runMigrations(db: SQLite.SQLiteDatabase): Promise<void> {
  // Create migration tracking table (idempotent)
  await db.execAsync(`
    CREATE TABLE IF NOT EXISTS _migrations (
      version INTEGER PRIMARY KEY,
      description TEXT,
      applied_at TEXT DEFAULT (datetime('now'))
    );
  `);

  // Determine what's already been applied
  const applied = await db.getAllAsync<{ version: number }>(
    'SELECT version FROM _migrations ORDER BY version'
  );
  const appliedSet = new Set(applied.map((r) => r.version));

  for (const migration of MIGRATIONS) {
    if (appliedSet.has(migration.version)) continue;

    console.log(`[UserDB] Running migration v${migration.version}: ${migration.description}`);

    await db.execAsync('BEGIN TRANSACTION');
    try {
      await db.execAsync(migration.sql);
      await db.runAsync(
        'INSERT INTO _migrations (version, description) VALUES (?, ?)',
        [migration.version, migration.description]
      );
      await db.execAsync('COMMIT');
      console.log(`[UserDB] ✅ Migration v${migration.version} applied`);
    } catch (err) {
      await db.execAsync('ROLLBACK');
      console.error(`[UserDB] ❌ Migration v${migration.version} failed:`, err);
      throw err; // Halt startup — don't leave user in a half-migrated state
    }
  }
}
