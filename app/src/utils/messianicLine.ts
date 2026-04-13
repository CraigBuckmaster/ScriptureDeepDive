/**
 * messianicLine.ts — The 42-generation messianic lineage from Matthew 1.
 *
 * Used by the Genealogy Tree to highlight the "golden thread" through the
 * family tree. Stored as a config constant rather than a DB column so the
 * list is easy to audit and doesn't require a migration.
 *
 * Part of Card #1265 (Genealogy redesign Phase 1).
 */

/** Person IDs (matching the `people.id` column) that are part of the line to Jesus. */
export const MESSIANIC_LINE: readonly string[] = [
  'adam',
  'seth',
  'enosh',
  'kenan',
  'mahalalel',
  'jared',
  'enoch',
  'methuselah',
  'lamech',
  'noah',
  'shem',
  'arphaxad',
  'shelah',
  'eber',
  'peleg',
  'reu',
  'serug',
  'nahor',
  'terah',
  'abraham',
  'isaac',
  'jacob',
  'judah',
  'perez',
  'hezron',
  'ram',
  'amminadab',
  'nahshon',
  'salmon',
  'boaz',
  'obed',
  'jesse',
  'david',
  'solomon',
  'rehoboam',
  'abijah',
  'asa',
  'jehoshaphat',
  'jehoram',
  'uzziah',
  'jotham',
  'ahaz',
  'hezekiah',
  'manasseh',
  'amon',
  'josiah',
  'jeconiah',
  'shealtiel',
  'zerubbabel',
  'abiud',
  'eliakim',
  'azor',
  'zadok',
  'akim',
  'eliud',
  'eleazar',
  'matthan',
  'jacob_nt',
  'joseph',
  'jesus',
] as const;

/** Fast membership check. */
const SET = new Set(MESSIANIC_LINE);

/** Whether a person id belongs to the messianic line. */
export function isMessianic(personId: string | null | undefined): boolean {
  if (!personId) return false;
  return SET.has(personId);
}

/** Total number of entries on the messianic line. */
export function messianicLineLength(): number {
  return MESSIANIC_LINE.length;
}
