import { useAsyncData } from './useAsyncData';
import { getPlaces } from '../db/content';

export function usePlaces() {
  const { data: places, loading: isLoading } = useAsyncData(() => getPlaces(), [], []);
  return { places, isLoading };
}
