import { getAllWordStudies } from '../db/content';
import { useAsyncData } from './useAsyncData';

export function useWordStudies() {
  const { data: studies, loading: isLoading } = useAsyncData(() => getAllWordStudies(), [], []);
  return { studies, isLoading };
}
