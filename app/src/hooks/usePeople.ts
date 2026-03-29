import { useState, useEffect } from 'react';
import { getAllPeople } from '../db/content';
import type { Person } from '../types';
import { logger } from '../utils/logger';

export function usePeople() {
  const [people, setPeople] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAllPeople().then((p) => {
      logger.info('usePeople', `Loaded ${p.length} people from DB`);
      setPeople(p);
      setIsLoading(false);
    }).catch((err) => {
      logger.error('usePeople', 'Error loading people', err);
      setIsLoading(false);
    });
  }, []);

  return { people, isLoading };
}
