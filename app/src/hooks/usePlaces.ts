import { getPlaces } from '../db/content';
import { useAsyncData } from './useAsyncData';

export function usePlaces() {
  const { data: places, loading: isLoading } = useAsyncData(() => getPlaces(), [], []);
  return { places, isLoading };
}
