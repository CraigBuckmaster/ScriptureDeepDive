import { useAsyncData } from './useAsyncData';
import { getMapStories } from '../db/content';

export function useMapStories(era?: string) {
  const { data: stories, loading: isLoading } = useAsyncData(() => getMapStories(era), [era], []);
  return { stories, isLoading };
}
