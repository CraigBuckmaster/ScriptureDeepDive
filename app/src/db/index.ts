/**
 * db/index.ts — Re-exports for the data access layer.
 *
 * Two databases:
 *   - scripture.db (content, read-only, replaceable) via database.ts
 *   - user.db (user data, persistent, migrated) via userDatabase.ts
 */

export { initDatabase, getDb } from './database';
export { initUserDatabase, getUserDb } from './userDatabase';
export * from './content';
export * from './user';
