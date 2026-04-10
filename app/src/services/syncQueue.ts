/**
 * services/syncQueue.ts — Write-ahead queue for offline mutations.
 *
 * Queues mutations (flags, upvotes, ratings) locally when offline,
 * and flushes them to Supabase when connectivity returns.
 *
 * Addresses #965 (flag sync) and #971 (offline queue).
 */

import { getUserDb } from '../db/userDatabase';
import { getSupabase } from '../lib/supabase';
import { logger } from '../utils/logger';

export type SyncOperation =
  | 'submit_flag'
  | 'toggle_upvote'
  | 'set_star_rating';

interface QueueEntry {
  id: number;
  operation: SyncOperation;
  payload_json: string;
  created_at: string;
  attempts: number;
  last_error: string | null;
}

const MAX_ATTEMPTS = 5;

/**
 * Enqueue a mutation for later sync to Supabase.
 */
export async function enqueue(operation: SyncOperation, payload: Record<string, unknown>): Promise<void> {
  try {
    await getUserDb().runAsync(
      'INSERT INTO sync_queue (operation, payload_json) VALUES (?, ?)',
      [operation, JSON.stringify(payload)],
    );
    logger.info('SyncQueue', `Enqueued ${operation}`);
  } catch (err) {
    logger.error('SyncQueue', 'Failed to enqueue', err);
  }
}

/**
 * Get the number of pending items in the queue.
 */
export async function getPendingCount(): Promise<number> {
  try {
    const row = await getUserDb().getFirstAsync<{ count: number }>(
      `SELECT COUNT(*) as count FROM sync_queue WHERE attempts < ${MAX_ATTEMPTS}`,
    );
    return row?.count ?? 0;
  } catch {
    return 0;
  }
}

/**
 * Flush all pending queue items to Supabase.
 * Called when connectivity is restored. Returns the number of
 * successfully synced items.
 */
export async function flushQueue(): Promise<number> {
  const supabase = getSupabase();
  if (!supabase) return 0;

  let synced = 0;

  try {
    const entries = await getUserDb().getAllAsync<QueueEntry>(
      `SELECT * FROM sync_queue WHERE attempts < ${MAX_ATTEMPTS} ORDER BY created_at ASC LIMIT 50`,
    );

    for (const entry of entries) {
      try {
        const payload = JSON.parse(entry.payload_json);
        const success = await executeSyncOperation(supabase, entry.operation, payload);

        if (success) {
          await getUserDb().runAsync('DELETE FROM sync_queue WHERE id = ?', [entry.id]);
          synced++;
        } else {
          await getUserDb().runAsync(
            'UPDATE sync_queue SET attempts = attempts + 1, last_error = ? WHERE id = ?',
            ['Server rejected', entry.id],
          );
        }
      } catch (err) {
        const msg = err instanceof Error ? err.message : 'Unknown error';
        await getUserDb().runAsync(
          'UPDATE sync_queue SET attempts = attempts + 1, last_error = ? WHERE id = ?',
          [msg, entry.id],
        );
        logger.warn('SyncQueue', `Failed to sync entry ${entry.id}: ${msg}`);
      }
    }
  } catch (err) {
    logger.error('SyncQueue', 'flushQueue failed', err);
  }

  if (synced > 0) {
    logger.info('SyncQueue', `Flushed ${synced} items`);
  }
  return synced;
}

/**
 * Execute a single sync operation against Supabase.
 */
async function executeSyncOperation(
  supabase: Record<string, unknown>,
  operation: SyncOperation,
  payload: Record<string, unknown>,
): Promise<boolean> {
  switch (operation) {
    case 'submit_flag': {
      const { error } = await supabase.from('content_flags').insert({
        user_id: payload.user_id,
        content_id: payload.content_id,
        content_type: payload.content_type,
        reason: payload.reason,
        details: payload.details ?? null,
      });
      return !error;
    }

    case 'toggle_upvote': {
      if (payload.remove) {
        const { error } = await supabase
          .from('upvotes')
          .delete()
          .match({ user_id: payload.user_id, topic_id: payload.topic_id });
        return !error;
      }
      const { error } = await supabase.from('upvotes').upsert(
        { user_id: payload.user_id, topic_id: payload.topic_id },
        { onConflict: 'user_id,topic_id' },
      );
      return !error;
    }

    case 'set_star_rating': {
      const { error } = await supabase.from('star_ratings').upsert(
        {
          user_id: payload.user_id,
          topic_id: payload.topic_id,
          rating: payload.rating,
        },
        { onConflict: 'user_id,topic_id' },
      );
      return !error;
    }

    default:
      logger.warn('SyncQueue', `Unknown operation: ${operation}`);
      return false;
  }
}
