import { getMapStories } from '../db/content';
import { useAsyncData } from './useAsyncData';

export function useMapStories(era?: string) {
  const { data: stories, loading: isLoading } = useAsyncData(() => getMapStories(era), [era], []);
  return { stories, isLoading };
}
