/**
 * db/content/people.ts — People queries (genealogy tree, person detail).
 */

import { getDb } from '../database';
import type { Person, PersonJourneyStage, PersonLegacyRef } from '../../types';

export async function getAllPeople(): Promise<Person[]> {
  return getDb().getAllAsync<Person>(
    'SELECT * FROM people ORDER BY name'
  );
}

export async function getPerson(id: string): Promise<Person | null> {
  return getDb().getFirstAsync<Person>(
    'SELECT * FROM people WHERE id = ?', [id]
  );
}

export async function getPersonChildren(parentId: string): Promise<Person[]> {
  return getDb().getAllAsync<Person>(
    'SELECT * FROM people WHERE father = ? OR mother = ? ORDER BY name',
    [parentId, parentId]
  );
}

export async function getSpousesOf(personId: string): Promise<Person[]> {
  return getDb().getAllAsync<Person>(
    'SELECT * FROM people WHERE spouse_of = ? ORDER BY name',
    [personId]
  );
}

// ── People Journeys (#1125) ───────────────────────────────────────

export async function getPersonJourney(personId: string): Promise<PersonJourneyStage[]> {
  return getDb().getAllAsync<PersonJourneyStage>(
    'SELECT * FROM people_journeys WHERE person_id = ? ORDER BY stage_order',
    [personId]
  );
}

export async function getPersonLegacyRefs(personId: string): Promise<PersonLegacyRef[]> {
  return getDb().getAllAsync<PersonLegacyRef>(
    'SELECT * FROM people_legacy_refs WHERE person_id = ? ORDER BY id',
    [personId]
  );
}

/** Check if a person has a journey (fast count query). */
export async function hasPersonJourney(personId: string): Promise<boolean> {
  const row = await getDb().getFirstAsync<{ c: number }>(
    'SELECT COUNT(*) as c FROM people_journeys WHERE person_id = ?',
    [personId]
  );
  return (row?.c ?? 0) > 0;
}
