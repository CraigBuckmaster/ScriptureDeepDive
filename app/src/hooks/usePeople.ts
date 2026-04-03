import { useAsyncData } from './useAsyncData';
import { getAllPeople } from '../db/content';

export function usePeople() {
  const { data: people, loading: isLoading } = useAsyncData(() => getAllPeople(), [], []);
  return { people, isLoading };
}
