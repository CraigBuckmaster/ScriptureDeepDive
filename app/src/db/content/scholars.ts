/**
 * db/content/scholars.ts — Scholar queries.
 */

import { getDb } from '../database';
import type { Scholar } from '../../types';

export async function getAllScholars(): Promise<Scholar[]> {
  return getDb().getAllAsync<Scholar>(
    'SELECT * FROM scholars ORDER BY name'
  );
}

export async function getScholar(id: string): Promise<Scholar | null> {
  return getDb().getFirstAsync<Scholar>(
    'SELECT * FROM scholars WHERE id = ?', [id]
  );
}

export async function getScholarsForBook(bookId: string): Promise<Scholar[]> {
  return getDb().getAllAsync<Scholar>(
    `SELECT * FROM scholars 
     WHERE scope_json = '"all"' 
        OR json_type(scope_json) = 'array' AND EXISTS (
          SELECT 1 FROM json_each(scope_json) WHERE json_each.value = ?
        )
     ORDER BY name`,
    [bookId]
  );
}
