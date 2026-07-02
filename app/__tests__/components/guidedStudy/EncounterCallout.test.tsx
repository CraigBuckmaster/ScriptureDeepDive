/**
 * #1843 — encounter callout: qualification threshold, single-winner
 * selection, own-words excerpt, render + dismiss + tap-through.
 */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import {
  EncounterCallout,
  selectEncounterCallout,
} from '@/components/guidedStudy/EncounterCallout';
import type { ConceptEncounterHistoryRow } from '@/db/userQueries';

function row(
  conceptId: string,
  chapterId: string,
  count: number,
  lastSeen: string,
  response: string | null = null,
): ConceptEncounterHistoryRow {
  return {
    concept_id: conceptId,
    concept_label: conceptId.replace(/^\w/, (c) => c.toUpperCase()),
    chapter_id: chapterId,
    encounter_count: count,
    last_seen_at: lastSeen,
    prior_response: response,
  };
}

const CURRENT = 'jonah_1';

describe('selectEncounterCallout (#1843)', () => {
  it('returns null below 2 total encounters', () => {
    expect(selectEncounterCallout([row('covenant', 'genesis_9', 1, '2026-06-01')], CURRENT)).toBeNull();
    expect(selectEncounterCallout([], CURRENT)).toBeNull();
  });

  it('requires a prior chapter — encounters only in the current chapter never call out', () => {
    expect(
      selectEncounterCallout([row('covenant', CURRENT, 5, '2026-06-01')], CURRENT),
    ).toBeNull();
  });

  it('picks exactly one winner (highest total count) when several qualify', () => {
    const callout = selectEncounterCallout(
      [
        row('covenant', 'genesis_9', 2, '2026-06-01', 'God binds himself first.'),
        row('covenant', 'genesis_15', 2, '2026-06-10'),
        row('temple', 'exodus_40', 3, '2026-06-05', 'The tent mirrors Eden.'),
      ],
      CURRENT,
    );
    expect(callout?.conceptId).toBe('covenant'); // total 4 beats temple's 3
    expect(callout?.totalEncounters).toBe(4);
    // Most recent prior chapter wins the pointer.
    expect(callout?.priorChapterId).toBe('genesis_15');
  });

  it('clamps the excerpt to 120 chars of the user’s own text', () => {
    const long = 'covenant '.repeat(40);
    const callout = selectEncounterCallout(
      [row('covenant', 'genesis_9', 2, '2026-06-01', long)],
      CURRENT,
    );
    expect(callout?.excerpt?.length).toBeLessThanOrEqual(120);
    expect(callout?.excerpt?.endsWith('…')).toBe(true);
    expect(callout?.excerpt?.startsWith('covenant')).toBe(true);
  });
});

describe('EncounterCallout render (#1843)', () => {
  const CALLOUT = {
    conceptId: 'covenant',
    conceptLabel: 'Covenant',
    totalEncounters: 4,
    priorChapterId: 'genesis_9',
    excerpt: 'God binds himself to creation before anyone asks.',
  };

  it('shows the count, prior chapter ref, and the user’s own excerpt', () => {
    const { getByText } = render(
      <EncounterCallout callout={CALLOUT} onOpenChapter={jest.fn()} onDismiss={jest.fn()} />,
    );
    expect(getByText(/your 4th encounter with/)).toBeTruthy();
    expect(
      getByText('In Genesis 9 you wrote: “God binds himself to creation before anyone asks.”'),
    ).toBeTruthy();
  });

  it('taps through to the prior chapter and dismisses', () => {
    const onOpenChapter = jest.fn();
    const onDismiss = jest.fn();
    const { getByLabelText } = render(
      <EncounterCallout callout={CALLOUT} onOpenChapter={onOpenChapter} onDismiss={onDismiss} />,
    );
    fireEvent.press(
      getByLabelText('Your 4th encounter with Covenant. Open Genesis 9'),
    );
    expect(onOpenChapter).toHaveBeenCalledWith('genesis_9');
    fireEvent.press(getByLabelText('Dismiss encounter note'));
    expect(onDismiss).toHaveBeenCalledTimes(1);
  });

  it('falls back gracefully when there is no excerpt', () => {
    const { getByText } = render(
      <EncounterCallout
        callout={{ ...CALLOUT, excerpt: null }}
        onOpenChapter={jest.fn()}
        onDismiss={jest.fn()}
      />,
    );
    expect(getByText('You last met it in Genesis 9.')).toBeTruthy();
  });
});
