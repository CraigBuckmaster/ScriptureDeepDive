import { useState, useEffect } from 'react';
import { getPlaces } from '../db/content';
import type { Place } from '../types';

export function usePlaces() {
  const [places, setPlaces] = useState<Place[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getPlaces().then((p) => { setPlaces(p); setIsLoading(false); });
  }, []);

  return { places, isLoading };
}
