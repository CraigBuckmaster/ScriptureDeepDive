import { useState, useEffect } from 'react';
import { getAllWordStudies } from '../db/content';
import type { WordStudy } from '../types';

export function useWordStudies() {
  const [studies, setStudies] = useState<WordStudy[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAllWordStudies().then((s) => { setStudies(s); setIsLoading(false); });
  }, []);

  return { studies, isLoading };
}
