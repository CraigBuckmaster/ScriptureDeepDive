/**
 * useJourneyBrowse — Load all journeys from the unified journeys table
 * for the three-tab JourneyBrowseScreen.
 *
 * Rewritten for Epic #1379 unified journey model.
 */

import { useState, useEffect, useMemo } from 'react';
import { getAllJourneys } from '../db/content/features';
import { logger } from '../utils/logger';
import type { Journey } from '../types';

export interface JourneyBrowseEntry {
  id: string;
  journeyType: 'person' | 'concept' | 'thematic';
  title: string;
  subtitle: string | null;
  lensId: string | null;
  depth: string | null;
  personId: string | null;
  conceptId: string | null;
}

export interface JourneyBrowseData {
  allJourneys: JourneyBrowseEntry[];
  personJourneys: JourneyBrowseEntry[];
  conceptJourneys: JourneyBrowseEntry[];
  thematicJourneys: JourneyBrowseEntry[];
  lensIds: string[];
  isLoading: boolean;
}

function toEntry(j: Journey): JourneyBrowseEntry {
  return {
    id: j.id,
    journeyType: j.journey_type,
    title: j.title,
    subtitle: j.subtitle,
    lensId: j.lens_id,
    depth: j.depth,
    personId: j.person_id,
    conceptId: j.concept_id,
  };
}

export function useJourneyBrowse(): JourneyBrowseData {
  const [allJourneys, setAllJourneys] = useState<JourneyBrowseEntry[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    getAllJourneys()
      .then((rows) => setAllJourneys(rows.map(toEntry)))
      .catch((err) => logger.warn('useJourneyBrowse', 'Failed to load journeys', err))
      .finally(() => setIsLoading(false));
  }, []);

  const personJourneys = useMemo(
    () => allJourneys.filter((j) => j.journeyType === 'person').sort((a, b) => a.title.localeCompare(b.title)),
    [allJourneys],
  );

  const conceptJourneys = useMemo(
    () => allJourneys.filter((j) => j.journeyType === 'concept'),
    [allJourneys],
  );

  const thematicJourneys = useMemo(
    () => allJourneys.filter((j) => j.journeyType === 'thematic'),
    [allJourneys],
  );

  const lensIds = useMemo(() => {
    const set = new Set<string>();
    for (const j of allJourneys) {
      if (j.lensId) set.add(j.lensId);
    }
    return [...set].sort();
  }, [allJourneys]);

  return { allJourneys, personJourneys, conceptJourneys, thematicJourneys, lensIds, isLoading };
}
