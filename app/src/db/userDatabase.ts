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
import { logger } from '../utils/logger';

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
  {
    version: 2,
    description: 'Enhanced notes — tags, collections, note links, FTS',
    sql: `
      -- Study collections
      CREATE TABLE IF NOT EXISTS study_collections (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        name TEXT NOT NULL,
        description TEXT DEFAULT '',
        color TEXT DEFAULT '#bfa050',
        created_at TEXT DEFAULT (datetime('now')),
        updated_at TEXT DEFAULT (datetime('now'))
      );

      -- Add columns to user_notes
      ALTER TABLE user_notes ADD COLUMN tags_json TEXT DEFAULT '[]';
      ALTER TABLE user_notes ADD COLUMN collection_id INTEGER
        REFERENCES study_collections(id) ON DELETE SET NULL;

      -- Note links (bidirectional)
      CREATE TABLE IF NOT EXISTS note_links (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        from_note_id INTEGER NOT NULL REFERENCES user_notes(id) ON DELETE CASCADE,
        to_note_id INTEGER NOT NULL REFERENCES user_notes(id) ON DELETE CASCADE,
        created_at TEXT DEFAULT (datetime('now')),
        UNIQUE(from_note_id, to_note_id)
      );

      -- Indexes
      CREATE INDEX IF NOT EXISTS idx_notes_collection ON user_notes(collection_id);
      CREATE INDEX IF NOT EXISTS idx_note_links_from ON note_links(from_note_id);
      CREATE INDEX IF NOT EXISTS idx_note_links_to ON note_links(to_note_id);

      -- FTS on notes
      CREATE VIRTUAL TABLE IF NOT EXISTS notes_fts USING fts5(
        note_text, content=user_notes, content_rowid=id
      );

      -- Populate FTS with existing notes
      INSERT INTO notes_fts(notes_fts) VALUES('rebuild');
    `,
  },
  {
    version: 3,
    description: 'Study depth tracking — records which panels a user has opened per section',
    sql: `
      CREATE TABLE IF NOT EXISTS study_depth (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chapter_id TEXT NOT NULL,
        section_id TEXT NOT NULL,
        panel_type TEXT NOT NULL,
        first_opened_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(section_id, panel_type)
      );
      CREATE INDEX IF NOT EXISTS idx_study_depth_chapter ON study_depth(chapter_id);
    `,
  },
  {
    version: 4,
    description: 'Reading streaks table for daily engagement tracking',
    sql: `
      CREATE TABLE IF NOT EXISTS reading_streaks (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        date TEXT NOT NULL UNIQUE,
        chapters_read INTEGER NOT NULL DEFAULT 0,
        books_touched TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_reading_streaks_date ON reading_streaks(date);
    `,
  },
  {
    version: 5,
    description: 'Highlight collections and extended highlight columns',
    sql: `
      CREATE TABLE IF NOT EXISTS highlight_collections (
        id TEXT PRIMARY KEY,
        name TEXT NOT NULL,
        color TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        sort_order INTEGER DEFAULT 0
      );

      ALTER TABLE verse_highlights ADD COLUMN collection_id TEXT;
      ALTER TABLE verse_highlights ADD COLUMN note TEXT;
    `,
  },
  {
    version: 6,
    description: 'Seed 10 curated reading plans',
    sql: `
      INSERT OR IGNORE INTO reading_plans (id, name, description, total_days, chapters_json) VALUES
      ('genesis_deep_dive', 'Genesis Deep Dive', 'Explore Genesis one chapter at a time — each day pairs a reading with a specific study tool to build your skills across the app.', 14, '${JSON.stringify([
        { day: 1, chapters: ["genesis_1"] },
        { day: 2, chapters: ["genesis_2"] },
        { day: 3, chapters: ["genesis_3"] },
        { day: 4, chapters: ["genesis_4", "genesis_5"] },
        { day: 5, chapters: ["genesis_6", "genesis_7"] },
        { day: 6, chapters: ["genesis_8", "genesis_9"] },
        { day: 7, chapters: ["genesis_11", "genesis_12"] },
        { day: 8, chapters: ["genesis_15", "genesis_17"] },
        { day: 9, chapters: ["genesis_18", "genesis_19"] },
        { day: 10, chapters: ["genesis_22"] },
        { day: 11, chapters: ["genesis_27", "genesis_28"] },
        { day: 12, chapters: ["genesis_32", "genesis_33"] },
        { day: 13, chapters: ["genesis_37", "genesis_39"] },
        { day: 14, chapters: ["genesis_45", "genesis_50"] }
      ])}'),

      ('covenant_journey', 'Covenant Journey', 'Trace the covenant concept from Noah to the New Covenant — each day pairs a key passage with cross-references and scholarly commentary.', 10, '${JSON.stringify([
        { day: 1, chapters: ["genesis_9"] },
        { day: 2, chapters: ["genesis_15"] },
        { day: 3, chapters: ["genesis_17"] },
        { day: 4, chapters: ["exodus_19", "exodus_20"] },
        { day: 5, chapters: ["exodus_24"] },
        { day: 6, chapters: ["deuteronomy_29", "deuteronomy_30"] },
        { day: 7, chapters: ["2_samuel_7"] },
        { day: 8, chapters: ["jeremiah_31"] },
        { day: 9, chapters: ["ezekiel_36", "ezekiel_37"] },
        { day: 10, chapters: ["hebrews_8", "hebrews_9"] }
      ])}'),

      ('psalms_of_lament', 'Psalms of Lament', 'Seven lament psalms that teach honest prayer — read each with its literary structure and historical context panels.', 7, '${JSON.stringify([
        { day: 1, chapters: ["psalms_13"] },
        { day: 2, chapters: ["psalms_22"] },
        { day: 3, chapters: ["psalms_42"] },
        { day: 4, chapters: ["psalms_44"] },
        { day: 5, chapters: ["psalms_74"] },
        { day: 6, chapters: ["psalms_88"] },
        { day: 7, chapters: ["psalms_137"] }
      ])}'),

      ('life_of_david', 'The Life of David', 'Follow David from shepherd boy to king through 1-2 Samuel — with people bios, maps, and timeline connections.', 10, '${JSON.stringify([
        { day: 1, chapters: ["1_samuel_16", "1_samuel_17"] },
        { day: 2, chapters: ["1_samuel_18", "1_samuel_19"] },
        { day: 3, chapters: ["1_samuel_24"] },
        { day: 4, chapters: ["2_samuel_1", "2_samuel_2"] },
        { day: 5, chapters: ["2_samuel_5", "2_samuel_6"] },
        { day: 6, chapters: ["2_samuel_7"] },
        { day: 7, chapters: ["2_samuel_11", "2_samuel_12"] },
        { day: 8, chapters: ["2_samuel_15", "2_samuel_16"] },
        { day: 9, chapters: ["2_samuel_18", "2_samuel_19"] },
        { day: 10, chapters: ["2_samuel_22", "2_samuel_23"] }
      ])}'),

      ('creation_to_covenant', 'Creation to Covenant', 'Read through Genesis in 21 days at about 2-3 chapters per day — the foundational story from creation to the patriarchs.', 21, '${JSON.stringify([
        { day: 1, chapters: ["genesis_1", "genesis_2"] },
        { day: 2, chapters: ["genesis_3", "genesis_4"] },
        { day: 3, chapters: ["genesis_5", "genesis_6"] },
        { day: 4, chapters: ["genesis_7", "genesis_8"] },
        { day: 5, chapters: ["genesis_9", "genesis_10", "genesis_11"] },
        { day: 6, chapters: ["genesis_12", "genesis_13"] },
        { day: 7, chapters: ["genesis_14", "genesis_15"] },
        { day: 8, chapters: ["genesis_16", "genesis_17", "genesis_18"] },
        { day: 9, chapters: ["genesis_19", "genesis_20"] },
        { day: 10, chapters: ["genesis_21", "genesis_22"] },
        { day: 11, chapters: ["genesis_23", "genesis_24"] },
        { day: 12, chapters: ["genesis_25", "genesis_26"] },
        { day: 13, chapters: ["genesis_27", "genesis_28"] },
        { day: 14, chapters: ["genesis_29", "genesis_30"] },
        { day: 15, chapters: ["genesis_31", "genesis_32", "genesis_33"] },
        { day: 16, chapters: ["genesis_34", "genesis_35", "genesis_36"] },
        { day: 17, chapters: ["genesis_37", "genesis_38", "genesis_39"] },
        { day: 18, chapters: ["genesis_40", "genesis_41"] },
        { day: 19, chapters: ["genesis_42", "genesis_43"] },
        { day: 20, chapters: ["genesis_44", "genesis_45", "genesis_46"] },
        { day: 21, chapters: ["genesis_47", "genesis_48", "genesis_49", "genesis_50"] }
      ])}'),

      ('prophecy_fulfilled', 'Prophecy Fulfilled', 'Follow 12 prophecy chains from OT promise to NT fulfillment — each day pairs an origin passage with its fulfillment and cross-references.', 12, '${JSON.stringify([
        { day: 1, chapters: ["genesis_3"] },
        { day: 2, chapters: ["genesis_22"] },
        { day: 3, chapters: ["isaiah_7"] },
        { day: 4, chapters: ["micah_5"] },
        { day: 5, chapters: ["isaiah_9"] },
        { day: 6, chapters: ["isaiah_40"] },
        { day: 7, chapters: ["isaiah_53"] },
        { day: 8, chapters: ["daniel_7"] },
        { day: 9, chapters: ["zechariah_9"] },
        { day: 10, chapters: ["psalms_22"] },
        { day: 11, chapters: ["jeremiah_31"] },
        { day: 12, chapters: ["malachi_3", "malachi_4"] }
      ])}'),

      ('difficult_questions', 'The Difficult Questions', 'Ten of the Bible''s hardest passages — read the text, then explore the scholarly perspectives and historical context around each one.', 10, '${JSON.stringify([
        { day: 1, chapters: ["genesis_1"] },
        { day: 2, chapters: ["genesis_6"] },
        { day: 3, chapters: ["genesis_22"] },
        { day: 4, chapters: ["exodus_11", "exodus_12"] },
        { day: 5, chapters: ["joshua_6"] },
        { day: 6, chapters: ["judges_11"] },
        { day: 7, chapters: ["2_samuel_24"] },
        { day: 8, chapters: ["job_1", "job_2"] },
        { day: 9, chapters: ["jonah_1", "jonah_2"] },
        { day: 10, chapters: ["matthew_27"] }
      ])}'),

      ('pauls_arguments', 'Paul''s Arguments', 'Read Romans and Galatians with the discourse analysis panels — follow Paul''s logic step by step through his most important letters.', 14, '${JSON.stringify([
        { day: 1, chapters: ["romans_1", "romans_2"] },
        { day: 2, chapters: ["romans_3", "romans_4"] },
        { day: 3, chapters: ["romans_5", "romans_6"] },
        { day: 4, chapters: ["romans_7", "romans_8"] },
        { day: 5, chapters: ["romans_9", "romans_10"] },
        { day: 6, chapters: ["romans_11", "romans_12"] },
        { day: 7, chapters: ["romans_13", "romans_14"] },
        { day: 8, chapters: ["romans_15", "romans_16"] },
        { day: 9, chapters: ["galatians_1", "galatians_2"] },
        { day: 10, chapters: ["galatians_3"] },
        { day: 11, chapters: ["galatians_4"] },
        { day: 12, chapters: ["galatians_5"] },
        { day: 13, chapters: ["galatians_6"] },
        { day: 14, chapters: ["ephesians_1", "ephesians_2"] }
      ])}'),

      ('meet_the_scholars', 'Meet the Scholars', 'Seven chapters, each featuring a different scholar tradition — discover how evangelicals, Catholics, Jewish scholars, and church fathers read the same texts differently.', 7, '${JSON.stringify([
        { day: 1, chapters: ["genesis_1"] },
        { day: 2, chapters: ["exodus_20"] },
        { day: 3, chapters: ["psalms_23"] },
        { day: 4, chapters: ["isaiah_53"] },
        { day: 5, chapters: ["john_1"] },
        { day: 6, chapters: ["romans_8"] },
        { day: 7, chapters: ["revelation_1"] }
      ])}'),

      ('hebrew_word_treasures', 'Hebrew Word Treasures', 'Ten chapters paired with deep word studies and the interlinear viewer — discover the richness hidden in the original Hebrew and Greek.', 10, '${JSON.stringify([
        { day: 1, chapters: ["genesis_1"] },
        { day: 2, chapters: ["genesis_15"] },
        { day: 3, chapters: ["exodus_34"] },
        { day: 4, chapters: ["deuteronomy_6"] },
        { day: 5, chapters: ["psalms_23"] },
        { day: 6, chapters: ["psalms_51"] },
        { day: 7, chapters: ["isaiah_6"] },
        { day: 8, chapters: ["isaiah_53"] },
        { day: 9, chapters: ["john_1"] },
        { day: 10, chapters: ["romans_3"] }
      ])}');
    `,
  },
  {
    version: 7,
    description: 'Auth profiles — links Supabase UID to local user data',
    sql: `
      CREATE TABLE IF NOT EXISTS auth_profiles (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        supabase_uid TEXT NOT NULL UNIQUE,
        email TEXT,
        display_name TEXT,
        avatar_url TEXT,
        provider TEXT NOT NULL,
        created_at TEXT DEFAULT (datetime('now')),
        last_sign_in TEXT DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_auth_profiles_uid ON auth_profiles(supabase_uid);
    `,
  },
  {
    version: 8,
    description: 'Analytics events — local event logging for usage insights',
    sql: `
      CREATE TABLE IF NOT EXISTS analytics_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        event_name TEXT NOT NULL,
        params_json TEXT,
        created_at TEXT DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_analytics_event_name ON analytics_events(event_name);
      CREATE INDEX IF NOT EXISTS idx_analytics_created_at ON analytics_events(created_at);
    `,
  },
  {
    version: 9,
    description: 'Add indexes on verse_highlights and bookmarks for verse_ref lookups',
    sql: `
      CREATE INDEX IF NOT EXISTS idx_verse_highlights_ref ON verse_highlights(verse_ref);
      CREATE INDEX IF NOT EXISTS idx_bookmarks_ref ON bookmarks(verse_ref);
    `,
  },
  {
    version: 10,
    description: 'Study session replay — sessions and events tables for premium session recording',
    sql: `
      CREATE TABLE IF NOT EXISTS study_sessions (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        chapter_id TEXT NOT NULL,
        started_at TEXT NOT NULL DEFAULT (datetime('now')),
        ended_at TEXT,
        duration_ms INTEGER DEFAULT 0
      );

      CREATE TABLE IF NOT EXISTS study_session_events (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        session_id INTEGER NOT NULL REFERENCES study_sessions(id),
        event_type TEXT NOT NULL,
        panel_type TEXT,
        scholar_id TEXT,
        section_id TEXT,
        timestamp_ms INTEGER NOT NULL,
        metadata_json TEXT
      );

      CREATE INDEX IF NOT EXISTS idx_study_sessions_chapter ON study_sessions(chapter_id);
      CREATE INDEX IF NOT EXISTS idx_session_events_session ON study_session_events(session_id);
    `,
  },
  {
    version: 11,
    description: 'Flagged content — local moderation flags for user-reported content',
    sql: `
      CREATE TABLE IF NOT EXISTS flagged_content (
        id INTEGER PRIMARY KEY,
        content_id TEXT NOT NULL,
        content_type TEXT NOT NULL,
        reason TEXT NOT NULL,
        details TEXT,
        flagged_at TEXT NOT NULL DEFAULT (datetime('now')),
        UNIQUE(content_id, content_type)
      );
    `,
  },
  {
    version: 12,
    description: 'Bookmarked topics — topic-level bookmarks with cached metadata',
    sql: `
      CREATE TABLE IF NOT EXISTS bookmarked_topics (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        topic_id TEXT NOT NULL,
        topic_type TEXT NOT NULL DEFAULT 'official',
        bookmarked_at TEXT NOT NULL DEFAULT (datetime('now')),
        cached_title TEXT,
        cached_summary TEXT,
        UNIQUE(topic_id, topic_type)
      );
      CREATE INDEX IF NOT EXISTS idx_bookmarked_topics_id ON bookmarked_topics(topic_id);
    `,
  },
  {
    version: 13,
    description: 'In-app notifications table for notification feed',
    sql: `
      CREATE TABLE IF NOT EXISTS app_notifications (
        id TEXT PRIMARY KEY,
        type TEXT NOT NULL,
        title TEXT NOT NULL,
        body TEXT NOT NULL,
        target_id TEXT,
        target_type TEXT,
        is_read INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
      CREATE INDEX IF NOT EXISTS idx_app_notifications_read ON app_notifications(is_read);
      CREATE INDEX IF NOT EXISTS idx_app_notifications_created ON app_notifications(created_at);
    `,
  },
  {
    version: 14,
    description: 'Offline sync queue — write-ahead log for mutations pending server sync',
    sql: `
      CREATE TABLE IF NOT EXISTS sync_queue (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        operation TEXT NOT NULL,
        payload_json TEXT NOT NULL,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        attempts INTEGER NOT NULL DEFAULT 0,
        last_error TEXT
      );
      CREATE INDEX IF NOT EXISTS idx_sync_queue_created ON sync_queue(created_at);

      ALTER TABLE flagged_content ADD COLUMN synced INTEGER NOT NULL DEFAULT 0;
    `,
  },
  {
    version: 15,
    description: 'Amicus — compressed profile cache (#1452)',
    sql: `
      CREATE TABLE IF NOT EXISTS partner_profile_cache (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        profile_prose TEXT NOT NULL,
        raw_signals_hash TEXT NOT NULL,
        raw_signals_json TEXT NOT NULL DEFAULT '{}',
        generated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `,
  },
  {
    version: 16,
    description: 'Amicus — threads, messages, and usage (#1457)',
    sql: `
      CREATE TABLE IF NOT EXISTS amicus_threads (
        thread_id TEXT PRIMARY KEY,
        title TEXT NOT NULL,
        chapter_ref TEXT,
        pinned INTEGER NOT NULL DEFAULT 0,
        created_at TEXT NOT NULL DEFAULT (datetime('now')),
        last_message_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_amicus_threads_pinned_last
        ON amicus_threads(pinned DESC, last_message_at DESC);

      CREATE TABLE IF NOT EXISTS amicus_messages (
        message_id TEXT PRIMARY KEY,
        thread_id TEXT NOT NULL REFERENCES amicus_threads(thread_id) ON DELETE CASCADE,
        role TEXT NOT NULL CHECK (role IN ('user', 'assistant')),
        content TEXT NOT NULL,
        citations_json TEXT,
        follow_ups_json TEXT,
        created_at TEXT NOT NULL DEFAULT (datetime('now'))
      );

      CREATE INDEX IF NOT EXISTS idx_amicus_messages_thread
        ON amicus_messages(thread_id, created_at);

      CREATE TABLE IF NOT EXISTS amicus_usage (
        day TEXT PRIMARY KEY,
        query_count INTEGER NOT NULL DEFAULT 0
      );
    `,
  },
  {
    version: 17,
    description: 'Amicus — daily prompt cache (#1465)',
    sql: `
      CREATE TABLE IF NOT EXISTS amicus_daily_prompt_cache (
        id INTEGER PRIMARY KEY CHECK (id = 1),
        date TEXT NOT NULL,
        profile_hash TEXT NOT NULL,
        prompt_text TEXT NOT NULL,
        seed_query TEXT NOT NULL,
        generated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `,
  },
  {
    version: 18,
    description: 'App metadata — device-local key/value (anonymous IDs, etc.). Intentionally separate from user_preferences so values are never synced to Supabase.',
    sql: `
      CREATE TABLE IF NOT EXISTS app_meta (
        key TEXT PRIMARY KEY,
        value TEXT NOT NULL,
        updated_at TEXT NOT NULL DEFAULT (datetime('now'))
      );
    `,
  },
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

    logger.info('UserDB', `Running migration v${migration.version}: ${migration.description}`);

    try {
      await db.withTransactionAsync(async () => {
        await db.execAsync(migration.sql);
        await db.runAsync(
          'INSERT INTO _migrations (version, description) VALUES (?, ?)',
          [migration.version, migration.description]
        );
      });
      logger.info('UserDB', `Migration v${migration.version} applied`);
    } catch (err) {
      logger.error('UserDB', `Migration v${migration.version} failed`, err);
      throw err; // Halt startup — don't leave user in a half-migrated state
    }
  }
}
