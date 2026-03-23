import { useState, useEffect } from 'react';
import { getAllPeople } from '../db/content';
import type { Person } from '../types';

export function usePeople() {
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAllPeople().then((p) => { setPeople(p); setIsLoading(false); });
  }, []);

  return { people, isLoading };
}
