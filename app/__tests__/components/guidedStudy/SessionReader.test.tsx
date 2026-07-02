/**
 * #1834 — embedded scripture reader (components/guidedStudy/SessionReader).
 * Verse text must render byte-identical to the loaded rows.
 */
import React from 'react';
import { fireEvent, render } from '@testing-library/react-native';
import { SessionReader } from '@/components/guidedStudy/SessionReader';
import type { Verse } from '@/types';

function verse(num: number, text: string): Verse {
  return {
    id: num,
    book_id: 'jonah',
    chapter_num: 1,
    verse_num: num,
    translation: 'kjv',
    text,
  };
}

const VERSES: Verse[] = [
  verse(1, 'Now the word of the LORD came unto Jonah the son of Amittai, saying,'),
  verse(2, 'Arise, go to Nineveh, that great city, and cry against it; for their wickedness is come up before me.'),
  verse(3, 'But Jonah rose up to flee unto Tarshish from the presence of the LORD.'),
  verse(4, 'But the LORD sent out a great wind into the sea.'),
  verse(5, 'Then the mariners were afraid, and cried every man unto his god.'),
];

describe('SessionReader (#1834)', () => {
  it('collapsed: shows exactly the first three verses word-for-word plus the count affordance', () => {
    const { getByText, queryByText } = render(<SessionReader verses={VERSES} />);
    expect(getByText(VERSES[0].text, { exact: false })).toBeTruthy();
    expect(getByText(VERSES[2].text, { exact: false })).toBeTruthy();
    expect(queryByText(VERSES[3].text, { exact: false })).toBeNull();
    expect(getByText('Read chapter (5 verses)')).toBeTruthy();
  });

  it('expands to the full chapter — no trimming, no skipping — and collapses back', () => {
    const { getByLabelText, getByText, queryByText } = render(<SessionReader verses={VERSES} />);

    fireEvent.press(getByLabelText('Read chapter — 2 more verses'));
    for (const v of VERSES) {
      expect(getByText(v.text, { exact: false })).toBeTruthy();
    }

    fireEvent.press(getByLabelText('Collapse chapter text'));
    expect(queryByText(VERSES[4].text, { exact: false })).toBeNull();
  });

  it('honors initiallyExpanded and reports toggles', () => {
    const onToggle = jest.fn();
    const { getByLabelText, getByText } = render(
      <SessionReader verses={VERSES} initiallyExpanded onToggle={onToggle} />,
    );
    expect(getByText(VERSES[4].text, { exact: false })).toBeTruthy();

    fireEvent.press(getByLabelText('Collapse chapter text'));
    expect(onToggle).toHaveBeenCalledWith(false);
  });

  it('renders short chapters in full with no expand affordance', () => {
    const short = VERSES.slice(0, 2);
    const { getByText, queryByText } = render(<SessionReader verses={short} />);
    expect(getByText(short[0].text, { exact: false })).toBeTruthy();
    expect(getByText(short[1].text, { exact: false })).toBeTruthy();
    expect(queryByText(/Read chapter/)).toBeNull();
  });

  it('renders nothing for an empty verse list', () => {
    const { toJSON } = render(<SessionReader verses={[]} />);
    expect(toJSON()).toBeNull();
  });
});
