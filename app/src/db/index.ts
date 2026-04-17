/**
 * db/index.ts — Re-exports for the data access layer.
 *
 * Two databases:
 *   - scripture.db (content, read-only, replaceable) via database.ts
 *   - user.db (user data, persistent, migrated) via userDatabase.ts
 *
 * ── sqlite-vec (Amicus — Card #1448) ───────────────────────────────
 * scripture.db ships with an `embeddings` vec0 virtual table plus
 * `chunk_text` + `chunk_metadata` companions. To query the virtual
 * table from the app, the sqlite-vec extension must be loaded onto
 * the `expo-sqlite` connection in `database.ts` before the first
 * retrieval call (see `app/src/services/amicus/vectorSearch.ts` in
 * #1451).
 *
 * Expo SDK 54 / expo-sqlite 16.x supports `enableLoadExtension()` on
 * iOS and Android via the underlying native module, but the extension
 * binary must be bundled at build time. The chosen approach is the
 * `sqlite-vec` CocoaPod / Android AAR shipped alongside the Expo
 * config plugin — verified at implementation in #1451. The embeddings
 * and companion tables are always created by the build; runtime
 * features degrade gracefully when the extension isn't loadable.
 */

export { initDatabase, getDb } from './database';
export { initUserDatabase, getUserDb } from './userDatabase';
export * from './content';
export * from './user';
