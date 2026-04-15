import { getAllScholars } from '../db/content';
import { useAsyncData } from './useAsyncData';

export function useScholars() {
  const { data: scholars, loading: isLoading } = useAsyncData(() => getAllScholars(), [], []);
  return { scholars, isLoading };
}
