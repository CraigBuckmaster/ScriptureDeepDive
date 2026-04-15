/**
 * useMapChipData — Loads the MapStory + places referenced by a chapter's
 * `map_story_link_id`, for the inline MapChip.
 *
 * Returns `null` until the story is resolved (or if the link is null /
 * the story is not found), so the consumer can simply branch on the
 * result.
 *
 * Feature for epic #1314 / issue #1322.
 */

import { getMapStory, getPlaces } from '../db/content';
import type { MapStory, Place } from '../types';
import { useAsyncData } from './useAsyncData';

export interface MapChipData {
  story: MapStory;
  places: Place[];
}

export function useMapChipData(storyId: string | null | undefined) {
  const { data, loading: isLoading } = useAsyncData<MapChipData | null>(
    async () => {
      if (!storyId) return null;
      const [story, places] = await Promise.all([
        getMapStory(storyId),
        getPlaces(),
      ]);
      if (!story) return null;
      return { story, places };
    },
    [storyId],
    null,
  );
  return { chipData: data, isLoading };
}
