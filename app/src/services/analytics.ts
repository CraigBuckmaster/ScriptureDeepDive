/**
 * services/analytics.ts — Local SQLite event logger.
 *
 * Fire-and-forget event logging to the user.db analytics_events table.
 * No external SDK, no privacy concerns, fully offline.
 * Events stay on-device; optional cloud sync can be added later.
 */

import { getUserDb } from '../db/userDatabase';
import { logger } from '../utils/logger';

/**
 * Log an analytics event. Fire-and-forget — never awaited at call sites.
 */
export function logEvent(name: string, params?: Record<string, string | number>): void {
  const paramsJson = params ? JSON.stringify(params) : null;
  getUserDb()
    .runAsync(
      'INSERT INTO analytics_events (event_name, params_json) VALUES (?, ?)',
      [name, paramsJson],
    )
    .catch((err) => {
      // Silently drop — analytics should never break the app
      logger.info('analytics', `Failed to log event: ${name}`, err);
    });
}

/**
 * Get event counts grouped by name since a given date.
 */
export async function getEventCounts(
  since: string,
): Promise<{ event_name: string; count: number }[]> {
  return getUserDb().getAllAsync(
    `SELECT event_name, COUNT(*) as count FROM analytics_events
     WHERE created_at >= ? GROUP BY event_name ORDER BY count DESC`,
    [since],
  );
}

/**
 * Delete events older than the given date string.
 * Call on app startup to prevent unbounded table growth.
 */
export async function pruneEvents(olderThanDays: number = 90): Promise<void> {
  try {
    const result = await getUserDb().runAsync(
      `DELETE FROM analytics_events WHERE created_at < datetime('now', '-' || ? || ' days')`,
      [olderThanDays],
    );
    if (result.changes > 0) {
      logger.info('analytics', `Pruned ${result.changes} events older than ${olderThanDays} days`);
    }
  } catch (err) {
    logger.warn('analytics', 'Failed to prune events', err);
  }
}
