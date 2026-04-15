import { getAllPeople } from '../db/content';
import { useAsyncData } from './useAsyncData';

export function usePeople() {
  const { data: people, loading: isLoading } = useAsyncData(() => getAllPeople(), [], []);
  return { people, isLoading };
}
