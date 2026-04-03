import { useAsyncData } from './useAsyncData';
import { getAllWordStudies } from '../db/content';

export function useWordStudies() {
  const { data: studies, loading: isLoading } = useAsyncData(() => getAllWordStudies(), [], []);
  return { studies, isLoading };
}
