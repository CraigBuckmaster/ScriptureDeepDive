import { useState, useEffect } from 'react';
import { getMapStories } from '../db/content';
import type { MapStory } from '../types';

export function useMapStories(era?: string) {
  const [stories, setStories] = useState<MapStory[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getMapStories(era).then((s) => { setStories(s); setIsLoading(false); });
  }, [era]);

  return { stories, isLoading };
}
