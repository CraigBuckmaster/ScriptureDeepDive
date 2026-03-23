import { useState, useEffect } from 'react';
import { getAllScholars } from '../db/content';
import type { Scholar } from '../types';

export function useScholars() {
  const [scholars, setScholars] = useState<Scholar[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAllScholars().then((s) => { setScholars(s); setIsLoading(false); });
  }, []);

  return { scholars, isLoading };
}
