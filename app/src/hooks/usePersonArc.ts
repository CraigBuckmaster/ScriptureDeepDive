/**
 * usePersonArc — Loads a person's chronological geographic arc
 * (PersonGeographyStop[]) together with the coordinates for each stop,
 * ready to render as a LineLayer + numbered SymbolLayer on the map.
 *
 * Returns null until resolved, or if the person has no geography field.
 *
 * Feature for epic #1314 / issue #1324.
 */

import { useAsyncData } from './useAsyncData';
import { getPerson, getPlaces } from '../db/content';
import type { Person, Place, PersonGeographyStop } from '../types';
import { safeParse } from '../utils/logger';

export interface PersonArcStop extends PersonGeographyStop {
  /** Resolved place, looked up by place_id from places.json. */
  place: Place;
}

export interface PersonArcData {
  person: Person;
  stops: PersonArcStop[];
}

export function usePersonArc(personId: string | null | undefined) {
  const { data, loading: isLoading } = useAsyncData<PersonArcData | null>(
    async () => {
      if (!personId) return null;
      const [person, places] = await Promise.all([
        getPerson(personId),
        getPlaces(),
      ]);
      if (!person) return null;
      const raw = safeParse<PersonGeographyStop[]>(person.geography_json ?? null, []);
      const byId = new Map(places.map((p) => [p.id, p]));
      const stops: PersonArcStop[] = raw
        .map((stop) => {
          const place = byId.get(stop.place_id);
          if (!place) return null;
          return { ...stop, place };
        })
        .filter((x): x is PersonArcStop => x !== null)
        .sort((a, b) => a.order - b.order);
      return { person, stops };
    },
    [personId],
    null,
  );
  return { arcData: data, isLoading };
}
