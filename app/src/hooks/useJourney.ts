/**
 * useJourney — Load a single journey with its stops and tags.
 */

import { useState, useEffect, useRef } from 'react';
import { getJourney, getJourneyStops, getJourneyTags } from '../db/content/features';
import { logger } from '../utils/logger';
import type { Journey, JourneyStop, JourneyTag } from '../types';

interface UseJourneyResult {
  journey: Journey | null;
  stops: JourneyStop[];
  tags: JourneyTag[];
  isLoading: boolean;
}

export function useJourney(journeyId: string | null): UseJourneyResult {
  const [journey, setJourney] = useState<Journey | null>(null);
  const [stops, setStops] = useState<JourneyStop[]>([]);
  const [tags, setTags] = useState<JourneyTag[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const cancelRef = useRef(false);

  useEffect(() => {
    cancelRef.current = false;
    if (!journeyId) {
      setJourney(null);
      setStops([]);
      setTags([]);
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
        setJourney(j);
        setStops(s);
        setTags(t);
      } catch (err) {
        if (cancelRef.current) return;
        logger.error('useJourney', 'Failed to load journey', err);
      } finally {
        if (!cancelRef.current) setIsLoading(false);
      }
    })();

    return () => { cancelRef.current = true; };
  }, [journeyId]);

  return { journey, stops, tags, isLoading };
}
