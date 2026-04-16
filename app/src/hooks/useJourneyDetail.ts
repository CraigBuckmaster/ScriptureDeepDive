/**
 * useJourneyDetail — Load a journey with stops, tags, and linked journey lookups.
 */

import { useState, useEffect, useRef, useMemo } from 'react';
import { getJourney, getJourneyStops, getJourneyTags } from '../db/content/features';
import { logger } from '../utils/logger';
import type { Journey, JourneyStop, JourneyTag } from '../types';

interface LinkedJourneyLookup {
  id: string;
  title: string;
}

interface UseJourneyDetailResult {
  journey: Journey | null;
  stops: JourneyStop[];
  tags: JourneyTag[];
  linkedJourneyLookups: Map<string, LinkedJourneyLookup>;
  readingTimeMinutes: number;
  isLoading: boolean;
}

function estimateReadingTime(stops: JourneyStop[]): number {
  let words = 0;
  for (const s of stops) {
    if (s.development) words += s.development.split(/\s+/).length;
    if (s.what_changes) words += s.what_changes.split(/\s+/).length;
    if (s.bridge_to_next) words += s.bridge_to_next.split(/\s+/).length;
  }
  return Math.max(1, Math.round(words / 200));
}

export function useJourneyDetail(journeyId: string | undefined): UseJourneyDetailResult {
  const [journey, setJourney] = useState<Journey | null>(null);
  const [stops, setStops] = useState<JourneyStop[]>([]);
  const [tags, setTags] = useState<JourneyTag[]>([]);
  const [linkedLookups, setLinkedLookups] = useState<Map<string, LinkedJourneyLookup>>(new Map());
  const [isLoading, setIsLoading] = useState(true);
  const cancelRef = useRef(false);

  useEffect(() => {
    cancelRef.current = false;
    if (!journeyId) {
      setJourney(null);
      setStops([]);
      setTags([]);
      setLinkedLookups(new Map());
      setIsLoading(false);
      return;
    }

    setIsLoading(true);
    (async () => {
      try {
        const [j, s, t] = await Promise.all([
          getJourney(journeyId),
          getJourneyStops(journeyId),
          getJourneyTags(journeyId),
        ]);
        if (cancelRef.current) return;

        // Resolve linked journey titles
        const linkedIds = s
          .filter((st) => st.stop_type === 'linked_journey' && st.linked_journey_id)
          .map((st) => st.linked_journey_id!);
        const uniqueIds = [...new Set(linkedIds)];
        const lookups = new Map<string, LinkedJourneyLookup>();
        await Promise.all(
          uniqueIds.map(async (id) => {
            const linked = await getJourney(id);
            if (linked) lookups.set(id, { id: linked.id, title: linked.title });
          }),
        );
        if (cancelRef.current) return;

        setJourney(j);
        setStops(s);
        setTags(t);
        setLinkedLookups(lookups);
      } catch (err) {
        if (cancelRef.current) return;
        logger.error('useJourneyDetail', 'Failed to load journey detail', err);
      } finally {
        if (!cancelRef.current) setIsLoading(false);
      }
    })();

    return () => { cancelRef.current = true; };
  }, [journeyId]);

  const readingTimeMinutes = useMemo(() => estimateReadingTime(stops), [stops]);

  return { journey, stops, tags, linkedJourneyLookups: linkedLookups, readingTimeMinutes, isLoading };
}
