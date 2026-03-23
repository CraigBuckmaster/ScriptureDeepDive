import { useState, useEffect } from 'react';
import { getPerson, getPersonChildren, getSpousesOf } from '../db/content';
import type { Person } from '../types';

interface PersonDetail {
  person: Person | null;
  parents: { father: Person | null; mother: Person | null };
  children: Person[];
  spouses: Person[];
  isLoading: boolean;
}

export function usePersonDetail(personId: string | null): PersonDetail {
  const [person, setPerson] = useState<Person | null>(null);
  const [parents, setParents] = useState<{ father: Person | null; mother: Person | null }>({ father: null, mother: null });
  const [children, setChildren] = useState<Person[]>([]);
  const [spouses, setSpouses] = useState<Person[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    if (!personId) return;
    let cancelled = false;

    async function load() {
      setIsLoading(true);
      const p = await getPerson(personId!);
      if (cancelled || !p) { setIsLoading(false); return; }
      setPerson(p);

      const [father, mother, kids, sp] = await Promise.all([
        p.father ? getPerson(p.father) : null,
        p.mother ? getPerson(p.mother) : null,
        getPersonChildren(personId!),
        getSpousesOf(personId!),
      ]);

      if (cancelled) return;
      setParents({ father, mother });
      setChildren(kids);
      setSpouses(sp);
      setIsLoading(false);
    }

    load();
    return () => { cancelled = true; };
  }, [personId]);

  return { person, parents, children, spouses, isLoading };
}
