/**
 * useAncientBorders(era) — Loads the ancient political borders for a
 * given era as a GeoJSON FeatureCollection, ready to drop into a
 * MapLibre ShapeSource.
 *
 * Returns an empty FeatureCollection when:
 *   - era is 'all' (no single era active)
 *   - the era has no rows in the ancient_borders table
 *   - the row's JSON is malformed
 *
 * This keeps the consumer code branch-free: the ShapeSource always has
 * a valid shape, even while the polygon-authoring work is outstanding.
 *
 * Scaffold for epic #1314 / issue #1317.
 */

import { getAncientBorders } from '../db/content';
import { useAsyncData } from './useAsyncData';

const EMPTY: GeoJSON.FeatureCollection = { type: 'FeatureCollection', features: [] };

export function useAncientBorders(era: string | null | undefined) {
  const { data, loading: isLoading } = useAsyncData(
    () => {
      if (!era || era === 'all') return Promise.resolve(EMPTY);
      return getAncientBorders(era);
    },
    [era],
    EMPTY,
  );
  return { borders: data ?? EMPTY, isLoading };
}
