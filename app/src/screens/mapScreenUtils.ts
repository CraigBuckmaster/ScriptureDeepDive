import type { MapStory } from '../types';
import { safeParse } from '../utils/logger';

/**
 * Build a place-id -> stories[] index. Kept outside MapScreen/MapScreenNative
 * so the lazy native map screen does not import its dispatcher during load.
 */
export function buildPlaceToStoriesMap(stories: MapStory[]): Map<string, MapStory[]> {
  const map = new Map<string, MapStory[]>();
  for (const story of stories) {
    const ids = safeParse<string[]>(story.places_json, []);
    for (const id of ids) {
      const list = map.get(id);
      if (list) list.push(story);
      else map.set(id, [story]);
    }
  }
  return map;
}
