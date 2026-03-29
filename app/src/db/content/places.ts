/**
 * db/content/places.ts — Place and map story queries.
 */

import { getDb } from '../database';
import type { Place, MapStory } from '../../types';

export async function getPlaces(): Promise<Place[]> {
  return getDb().getAllAsync<Place>(
    'SELECT * FROM places ORDER BY priority, ancient_name'
  );
}

export async function getPlace(id: string): Promise<Place | null> {
  return getDb().getFirstAsync<Place>(
    'SELECT * FROM places WHERE id = ?', [id]
  );
}

export async function getMapStories(era?: string): Promise<MapStory[]> {
  if (era) {
    return getDb().getAllAsync<MapStory>(
      'SELECT * FROM map_stories WHERE era = ? ORDER BY name',
      [era]
    );
  }
  return getDb().getAllAsync<MapStory>(
    'SELECT * FROM map_stories ORDER BY era, name'
  );
}

export async function getMapStory(id: string): Promise<MapStory | null> {
  return getDb().getFirstAsync<MapStory>(
    'SELECT * FROM map_stories WHERE id = ?', [id]
  );
}
