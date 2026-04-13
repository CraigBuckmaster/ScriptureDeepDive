/**
 * useJourneyBrowse — Data for the Journeys section on ExploreMenuScreen.
 *
 * Loads person journeys (from people_journeys table) and concept journeys
 * (from concepts table, filtered to those with journey_stops) in parallel.
 *
 * Part of Journeys on Explore feature.
 */

import { useState, useEffect } from 'react';
import { getPeopleWithJourneys } from '../db/content';
import { useConcepts, type Concept } from './useConceptData';
import { logger } from '../utils/logger';

export interface PersonJourneyEntry {
  personId: string;
  name: string;
  era: string | null;
  role: string | null;
  stageCount: number;
}

export interface ConceptJourneyEntry {
  conceptId: string;
  title: string;
  stopCount: number;
  firstLabel: string;
  lastLabel: string;
}

export interface JourneyBrowseData {
  personJourneys: PersonJourneyEntry[];
  conceptJourneys: ConceptJourneyEntry[];
  isLoading: boolean;
}

export function useJourneyBrowse(): JourneyBrowseData {
  const [personJourneys, setPersonJourneys] = useState<PersonJourneyEntry[]>([]);
  const [isLoadingPeople, setIsLoadingPeople] = useState(true);
  const { concepts, loading: conceptsLoading } = useConcepts();

  // Load person journeys
  useEffect(() => {
    getPeopleWithJourneys()
      .then((rows) => {
        setPersonJourneys(
          rows.map((r) => ({
            personId: r.person_id,
            name: r.name,
            era: r.era,
            role: r.role,
            stageCount: r.stage_count,
          })),
        );
      })
      .catch((err) => {
        logger.warn('useJourneyBrowse', 'Failed to load person journeys', err);
      })
      .finally(() => setIsLoadingPeople(false));
  }, []);

  // Derive concept journeys from the concepts hook (already loaded)
  const conceptJourneys: ConceptJourneyEntry[] = concepts
    .filter((c: Concept) => c.journey_stops && c.journey_stops.length > 0)
    .map((c: Concept) => ({
      conceptId: c.id,
      title: c.title,
      stopCount: c.journey_stops.length,
      firstLabel: c.journey_stops[0]?.label ?? '',
      lastLabel: c.journey_stops[c.journey_stops.length - 1]?.label ?? '',
    }))
    .sort((a, b) => b.stopCount - a.stopCount);

  return {
    personJourneys,
    conceptJourneys,
    isLoading: isLoadingPeople || conceptsLoading,
  };
}
