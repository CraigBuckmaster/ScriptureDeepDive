import { useAsyncData } from './useAsyncData';
import { getAllScholars } from '../db/content';

export function useScholars() {
  const { data: scholars, loading: isLoading } = useAsyncData(() => getAllScholars(), [], []);
  return { scholars, isLoading };
}
