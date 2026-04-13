/**
 * covenantWaypoints.ts — Theological waypoints along the messianic line.
 *
 * Each waypoint attaches a 1-line annotation + verse ref to a key figure
 * on the golden thread. The Genealogy Tree surfaces them as diamond
 * markers that invite the user to click through to the cited chapter.
 *
 * Part of Card #1267 (Genealogy Phase 2).
 */

export interface CovenantWaypoint {
  personId: string;
  text: string;
  ref: string;
}

export const COVENANT_WAYPOINTS: readonly CovenantWaypoint[] = [
  { personId: 'adam', text: 'Seed of the woman promised', ref: 'Gen 3:15' },
  { personId: 'noah', text: 'Covenant preserved through flood', ref: 'Gen 9:9' },
  { personId: 'abraham', text: '"In you all nations will be blessed"', ref: 'Gen 12:3' },
  { personId: 'judah', text: 'The scepter shall not depart', ref: 'Gen 49:10' },
  { personId: 'david', text: 'Throne established forever', ref: '2 Sam 7:16' },
  { personId: 'zerubbabel', text: 'Line preserved through exile', ref: 'Hag 2:23' },
  { personId: 'jesus', text: 'The promise fulfilled', ref: 'Matt 1:1' },
] as const;

const BY_ID = new Map<string, CovenantWaypoint>(
  COVENANT_WAYPOINTS.map((w) => [w.personId, w]),
);

/** Look up a waypoint by personId (or return null). */
export function getCovenantWaypoint(personId: string | null | undefined): CovenantWaypoint | null {
  if (!personId) return null;
  return BY_ID.get(personId) ?? null;
}
