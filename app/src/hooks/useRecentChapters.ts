import { getRecentChapters } from '../db/user';
import { useAsyncData } from './useAsyncData';

export function useRecentChapters(limit: number = 10) {
  const { data: recent, loading: isLoading, reload: refresh } = useAsyncData(
    () => getRecentChapters(limit),
    [limit],
    [],
  );
  return { recent, isLoading, refresh };
}
