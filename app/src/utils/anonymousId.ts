/**
 * utils/anonymousId.ts — Persistent anonymous device identifier.
 *
 * Used to tag Sentry events so crashes from a single install roll up
 * under one "user" in the dashboard. Stored in user.db (`app_meta` table,
 * migration v18) rather than user_preferences so the value never gets
 * synced to Supabase — this is per-device, per-install identity.
 *
 * Generation: UUID v4 via expo-crypto (cryptographically random, no deps
 * beyond what Companion Study already uses).
 *
 * Lifecycle: generated on first access, persisted forever until the user
 * reinstalls the app. Survives app updates, clears, and store rebuilds.
 */
import * as Crypto from 'expo-crypto';
import { getUserDb } from '../db/userDatabase';
import { logger } from './logger';

const KEY = 'sentry.anonymousId';

let cached: string | null = null;

/**
 * Resolve (or lazily generate) the anonymous ID. Always returns a string;
 * on catastrophic DB failure falls back to an in-memory ID that's at least
 * consistent for the current session.
 */
export async function getAnonymousId(): Promise<string> {
  if (cached) return cached;

  try {
    const db = getUserDb();
    const row = await db.getFirstAsync<{ value: string }>(
      'SELECT value FROM app_meta WHERE key = ?',
      [KEY],
    );

    if (row?.value) {
      cached = row.value;
      return cached;
    }

    const fresh = Crypto.randomUUID();
    await db.runAsync(
      'INSERT OR REPLACE INTO app_meta (key, value) VALUES (?, ?)',
      [KEY, fresh],
    );
    cached = fresh;
    return cached;
  } catch (err) {
    // Don't throw — Sentry identity is best-effort. Generate a volatile
    // session-scoped ID so crashes are still bucketable within the session.
    logger.warn('anonymousId', 'Failed to read/persist anonymous ID', err);
    cached = Crypto.randomUUID();
    return cached;
  }
}
