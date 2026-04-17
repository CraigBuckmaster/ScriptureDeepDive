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

// ── People Journeys (now backed by unified journeys/journey_stops) ──

export async function getPersonJourney(personId: string): Promise<PersonJourneyStage[]> {
  return getDb().getAllAsync<PersonJourneyStage>(
    `SELECT js.id, j.person_id, js.stop_order AS stage_order,
            js.label AS stage, j.era, js.book_id AS book_dir,
            NULL AS chapters, js.ref AS verse_ref,
            js.development AS summary, js.what_changes AS theme
     FROM journey_stops js
     JOIN journeys j ON js.journey_id = j.id
     WHERE j.person_id = ? AND j.journey_type = 'person'
     ORDER BY js.stop_order`,
    [personId]
  );
}

export async function getPersonLegacyRefs(personId: string): Promise<PersonLegacyRef[]> {
  return getDb().getAllAsync<PersonLegacyRef>(
    'SELECT * FROM people_legacy_refs WHERE person_id = ? ORDER BY id',
    [personId]
  );
}

/** Get all people who have journey data (for Explore browse). */
export async function getPeopleWithJourneys(): Promise<
  { person_id: string; name: string; era: string | null; role: string | null; stage_count: number }[]
> {
  return getDb().getAllAsync(
    `SELECT p.id as person_id, p.name, p.era, p.role,
            COUNT(js.id) as stage_count
     FROM people p
     JOIN journeys j ON j.person_id = p.id AND j.journey_type = 'person'
     JOIN journey_stops js ON js.journey_id = j.id
     GROUP BY p.id
     ORDER BY stage_count DESC`,
  );
}

/** Check if a person has a journey (fast count query). */
export async function hasPersonJourney(personId: string): Promise<boolean> {
  const row = await getDb().getFirstAsync<{ c: number }>(
    "SELECT COUNT(*) as c FROM journeys WHERE person_id = ? AND journey_type = 'person'",
    [personId]
  );
  return (row?.c ?? 0) > 0;
}

/**
 * Quick existence check for #1324's `geography` array — lets the
 * PersonSidebar decide whether to surface the "View on Map" action
 * without loading and parsing the full JSON.
 */
export async function hasPersonGeography(personId: string): Promise<boolean> {
  const row = await getDb().getFirstAsync<{ geography_json: string | null }>(
    'SELECT geography_json FROM people WHERE id = ?',
    [personId],
  );
  const json = row?.geography_json;
  if (!json) return false;
  try {
    const parsed = JSON.parse(json);
    return Array.isArray(parsed) && parsed.length > 0;
  } catch {
    return false;
  }
}

/**
 * People whose `geography_json` arc references a given place_id. Powers
 * the "People who came here" section on the PlaceDetailCard (#1324).
 *
 * Uses LIKE with a JSON-quoted place_id — safe enough for the fixed
 * place-id format (lowercase, alphanumeric + hyphens) and cheaper than
 * parsing every row's JSON client-side.
 */
export async function getPeopleAtPlace(
  placeId: string,
): Promise<{ id: string; name: string }[]> {
  // Guard: reject anything that can't occur in a valid place_id so the
  // LIKE pattern is always injection-safe.
  if (!/^[a-z0-9_-]+$/i.test(placeId)) return [];
  const pattern = `%"place_id":"${placeId}"%`;
  return getDb().getAllAsync<{ id: string; name: string }>(
    'SELECT id, name FROM people WHERE geography_json LIKE ? ORDER BY name',
    [pattern],
  );
}
