import { useAsyncData } from './useAsyncData';
import { getRecentChapters } from '../db/user';

export function useRecentChapters(limit: number = 10) {
  const { data: recent, loading: isLoading, reload: refresh } = useAsyncData(
    () => getRecentChapters(limit),
    [limit],
    [],
  );
  return { recent, isLoading, refresh };
}
