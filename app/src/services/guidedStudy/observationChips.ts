/**
 * services/guidedStudy/observationChips.ts — Chip candidates for the
 * Observe step (#1839, friction phase A). Combines the plan's concept
 * chips with repeated-word candidates derived from the chapter's own
 * verse text, so a reader can mark what they noticed without typing.
 */
import type { Verse } from '../../types';
import type { GuidedConceptChip } from './types';

/** Words too common (English or KJV-flavored) to count as repetition. */
const STOPWORDS = new Set([
  'the', 'and', 'that', 'unto', 'shall', 'with', 'them', 'they', 'have', 'from',
  'were', 'which', 'their', 'there', 'this', 'then', 'when', 'thou', 'thee',
  'thine', 'hath', 'upon', 'also', 'said', 'saying', 'came', 'come', 'went',
  'will', 'been', 'because', 'before', 'after', 'against', 'into', 'over',
  'under', 'again', 'more', 'most', 'other', 'some', 'such', 'than', 'very',
  'yet', 'not', 'but', 'for', 'his', 'her', 'him', 'she', 'you', 'your',
  'yours', 'our', 'ours', 'out', 'all', 'are', 'was', 'what', 'who', 'whom',
  'shalt', 'thereof', 'therefore', 'behold', 'even', 'every', 'let', 'made',
  'make', 'may', 'now', 'one', 'own', 'so', 'to', 'of', 'in', 'a', 'is', 'it',
  'be', 'as', 'at', 'by', 'or', 'an', 'no', 'nor', 'on', 'up', 'we', 'us',
  'me', 'my', 'i', 'he', 'do', 'did', 'done', 'has', 'had', 'ye', 'o',
]);

const MIN_WORD_LENGTH = 4;
const MIN_REPETITIONS = 3;
const MAX_REPETITION_CHIPS = 4;
const MAX_OBSERVATION_CHIPS = 8;

/**
 * Repeated-word candidates from the chapter text: words of at least
 * four letters that appear three or more times, most frequent first.
 */
export function buildRepetitionChips(verses: Verse[]): GuidedConceptChip[] {
  const counts = new Map<string, number>();
  for (const verse of verses) {
    const words = verse.text.toLowerCase().match(/[a-z']+/g) ?? [];
    for (const raw of words) {
      const word = raw.replace(/^'+|'+$/g, '');
      if (word.length < MIN_WORD_LENGTH || STOPWORDS.has(word)) continue;
      counts.set(word, (counts.get(word) ?? 0) + 1);
    }
  }

  return Array.from(counts.entries())
    .filter(([, count]) => count >= MIN_REPETITIONS)
    .sort((a, b) => b[1] - a[1] || a[0].localeCompare(b[0]))
    .slice(0, MAX_REPETITION_CHIPS)
    .map(([word]) => ({
      id: `repeat:${word}`,
      label: word.replace(/^\w/, (c) => c.toUpperCase()),
    }));
}

/**
 * Concept chips + repetition chips, deduped by label (case-insensitive,
 * concept chips win) and capped so the Observe step stays scannable.
 */
export function mergeObservationChips(
  conceptChips: GuidedConceptChip[],
  repetitionChips: GuidedConceptChip[],
): GuidedConceptChip[] {
  const seen = new Set<string>();
  const merged: GuidedConceptChip[] = [];
  for (const chip of [...conceptChips, ...repetitionChips]) {
    const key = chip.label.toLowerCase();
    if (seen.has(key)) continue;
    seen.add(key);
    merged.push(chip);
    if (merged.length >= MAX_OBSERVATION_CHIPS) break;
  }
  return merged;
}
