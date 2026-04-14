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

/**
 * Fetch the ancient-political-border FeatureCollection for one era.
 *
 * Returns a parsed GeoJSON object — empty FeatureCollection if the row
 * is missing or malformed — so callers can hand it straight to a MapLibre
 * ShapeSource without null-checks. See epic #1314, issue #1317.
 */
export async function getAncientBorders(era: string): Promise<GeoJSON.FeatureCollection> {
  const empty: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };
  const row = await getDb().getFirstAsync<{ features_json: string }>(
    'SELECT features_json FROM ancient_borders WHERE era = ?',
    [era],
  );
  if (!row?.features_json) return empty;
  try {
    const parsed = JSON.parse(row.features_json);
    if (parsed?.type === 'FeatureCollection' && Array.isArray(parsed.features)) {
      return parsed;
    }
  } catch {
    // fall through
  }
  return empty;
}
