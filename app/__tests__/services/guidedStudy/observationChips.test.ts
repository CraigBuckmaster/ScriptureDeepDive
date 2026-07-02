/**
 * #1839 — observation chip candidates (repetition extraction + merge)
 * and CapturedInputs backward compatibility.
 */
import {
  buildRepetitionChips,
  mergeObservationChips,
} from '@/services/guidedStudy/observationChips';
import { safeParseCapturedInputs } from '@/services/guidedStudy/capturedInputs';
import { buildCarryForwardItems } from '@/services/guidedStudy/stepBindings';
import type { Verse } from '@/types';

function verse(num: number, text: string): Verse {
  return { id: num, book_id: 'jonah', chapter_num: 1, verse_num: num, translation: 'kjv', text };
}

describe('buildRepetitionChips (#1839)', () => {
  it('surfaces words repeated three or more times, most frequent first', () => {
    const verses = [
      verse(1, 'The covenant stood. The covenant held. A covenant of peace.'),
      verse(2, 'Water rose and water fell, and the water covered the deep.'),
      verse(3, 'Peace came once.'),
    ];
    const chips = buildRepetitionChips(verses);
    expect(chips.map((c) => c.label)).toEqual(['Covenant', 'Water']);
    expect(chips[0].id).toBe('repeat:covenant');
  });

  it('ignores stopwords and short words regardless of frequency', () => {
    const verses = [
      verse(1, 'And the and the and the said said said unto unto unto sea sea sea.'),
    ];
    // 'sea' repeats but is under the 4-letter floor; the rest are stopwords.
    expect(buildRepetitionChips(verses)).toEqual([]);
  });

  it('caps the candidate list', () => {
    const words = ['storm', 'vessel', 'prayer', 'mercy', 'signs', 'winds'];
    const text = words.map((w) => `${w} ${w} ${w}`).join(' ');
    const chips = buildRepetitionChips([verse(1, text)]);
    expect(chips.length).toBeLessThanOrEqual(4);
  });
});

describe('mergeObservationChips (#1839)', () => {
  it('dedupes by label (concept chips win) and caps the merged list', () => {
    const concept = [
      { id: 'covenant', label: 'Covenant' },
      { id: 'genre:poetry', label: 'Poetry' },
    ];
    const repeats = [
      { id: 'repeat:covenant', label: 'Covenant' }, // dup — dropped
      { id: 'repeat:water', label: 'Water' },
    ];
    const merged = mergeObservationChips(concept, repeats);
    expect(merged.map((c) => c.id)).toEqual(['covenant', 'genre:poetry', 'repeat:water']);
  });
});

describe('CapturedInputs.observeSelections compatibility (#1839)', () => {
  it('old stored JSON without observeSelections parses without error', () => {
    const legacyJson = JSON.stringify({
      scene: { genre_response: 'A storm narrative' },
      observe: { surprises: 'The sailors pray first' },
      synthesize: { takeaway: 'x', open_question: 'y', key_connection: 'z' },
    });
    const parsed = safeParseCapturedInputs(legacyJson);
    expect(parsed.observe?.surprises).toBe('The sailors pray first');
    expect(parsed.observeSelections).toBeUndefined();
  });

  it('round-trips selections through serialize/parse', () => {
    const parsed = safeParseCapturedInputs(
      JSON.stringify({ observeSelections: ['Covenant', 'Water'] }),
    );
    expect(parsed.observeSelections).toEqual(['Covenant', 'Water']);
  });
});

describe('carry-forward integration (#1839)', () => {
  it('selections appear as a chip item on explore and synthesize, alongside typed text', () => {
    const captured = {
      observe: { surprises: 'The sailors pray before Jonah does' },
      observeSelections: ['Covenant', 'Water'],
    };
    const explore = buildCarryForwardItems('deep', 'explore', captured);
    expect(explore).toEqual([
      {
        sourceStep: 'observe',
        label: 'What you noticed',
        content: 'The sailors pray before Jonah does',
      },
      {
        sourceStep: 'observe',
        label: 'What you marked',
        content: 'Covenant · Water',
        chips: ['Covenant', 'Water'],
      },
    ]);

    const synthesize = buildCarryForwardItems('quick', 'synthesize', captured);
    expect(synthesize.some((i) => i.chips?.length === 2)).toBe(true);
  });

  it('adds nothing when no chips are selected (skipping carries no punishment)', () => {
    expect(buildCarryForwardItems('deep', 'explore', {})).toEqual([]);
    expect(
      buildCarryForwardItems('deep', 'explore', { observeSelections: [] }),
    ).toEqual([]);
  });

  it('does not leak selections into scene/observe/review steps', () => {
    const captured = { observeSelections: ['Covenant'] };
    expect(buildCarryForwardItems('deep', 'observe', captured)).toEqual([]);
    expect(
      buildCarryForwardItems('deep', 'review', captured).some((i) => i.chips),
    ).toBe(false);
  });
});
