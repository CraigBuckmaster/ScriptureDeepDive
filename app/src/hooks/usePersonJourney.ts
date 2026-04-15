import { useState, useEffect } from 'react';
import { getPerson, getPersonJourney, getPersonLegacyRefs } from '../db/content';
import type { Person, PersonJourneyStage, PersonLegacyRef } from '../types';

export interface PersonJourneyData {
  person: Person | null;
  stages: PersonJourneyStage[];
  legacyRefs: PersonLegacyRef[];
  isLoading: boolean;
}

export function usePersonJourney(personId: string | null): PersonJourneyData {
  const [person, setPerson] = useState<Person | null>(null);
  const [stages, setStages] = useState<PersonJourneyStage[]>([]);
  const [legacyRefs, setLegacyRefs] = useState<PersonLegacyRef[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    // eslint-disable-next-line react-hooks/set-state-in-effect
    if (!personId) { setIsLoading(false); return; }
    let cancelled = false;

    async function load() {
      const [p, j, lr] = await Promise.all([
        getPerson(personId!),
        getPersonJourney(personId!),
        getPersonLegacyRefs(personId!),
      ]);
      if (cancelled) return;
      setPerson(p);
      setStages(j);
      setLegacyRefs(lr);
      setIsLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [personId]);

  return { person, stages, legacyRefs, isLoading };
}
