import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { VerseBlock } from '@/components/VerseBlock';
import type { Verse, VHLGroup } from '@/types';

// Mock child components to isolate VerseBlock logic
jest.mock('@/components/HighlightedText', () => {
  const React = require('react');
  return {
    HighlightedText: ({ text }: { text: string }) =>
      React.createElement('Text', { testID: 'highlighted-text' }, text),
  };
});

jest.mock('@/components/NoteIndicator', () => {
  const React = require('react');
  return {
    NoteIndicator: ({ verseNum, onPress }: any) =>
      React.createElement('Text', {
        testID: `note-indicator-${verseNum}`,
        onPress: () => onPress(verseNum),
      }, 'note'),
  };
});

const makeVerse = (num: number, text: string): Verse => ({
  id: num,
  book_id: 'GEN',
  chapter_num: 1,
  verse_num: num,
  translation: 'KJV',
  text,
});

const VERSES: Verse[] = [
  makeVerse(1, 'In the beginning God created the heavens and the earth.'),
  makeVerse(2, 'And the earth was without form, and void.'),
];

const VHL_GROUPS: VHLGroup[] = [];

describe('VerseBlock', () => {
  const mockLongPress = jest.fn();
  const mockVerseNumPress = jest.fn();
  const mockNotePress = jest.fn();

  beforeEach(() => jest.clearAllMocks());

  it('renders verse numbers', () => {
    const { getByText } = renderWithProviders(
      <VerseBlock
        verses={VERSES}
        vhlGroups={VHL_GROUPS}
        notedVerses={new Set()}
        sectionId="sec1"
      />,
    );
    expect(getByText('1')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();
  });

  it('renders verse text via HighlightedText', () => {
    const { getAllByTestId } = renderWithProviders(
      <VerseBlock
        verses={VERSES}
        vhlGroups={VHL_GROUPS}
        notedVerses={new Set()}
        sectionId="sec1"
      />,
    );
    expect(getAllByTestId('highlighted-text')).toHaveLength(2);
  });

  it('has accessibility label for verse numbers', () => {
    const { getByLabelText } = renderWithProviders(
      <VerseBlock
        verses={VERSES}
        vhlGroups={VHL_GROUPS}
        notedVerses={new Set()}
        sectionId="sec1"
      />,
    );
    expect(getByLabelText('Verse 1')).toBeTruthy();
    expect(getByLabelText('Verse 2')).toBeTruthy();
  });

  it('fires onVerseLongPress handler on long press', () => {
    const { getByText } = renderWithProviders(
      <VerseBlock
        verses={VERSES}
        vhlGroups={VHL_GROUPS}
        notedVerses={new Set()}
        sectionId="sec1"
        onVerseLongPress={mockLongPress}
      />,
    );
    // Long press the verse row containing verse 1
    fireEvent(getByText('1').parent!.parent!, 'longPress');
    expect(mockLongPress).toHaveBeenCalledWith(1, VERSES[0].text);
  });

  it('fires onVerseNumPress when verse number is pressed', () => {
    const { getByLabelText } = renderWithProviders(
      <VerseBlock
        verses={VERSES}
        vhlGroups={VHL_GROUPS}
        notedVerses={new Set()}
        sectionId="sec1"
        onVerseNumPress={mockVerseNumPress}
      />,
    );
    fireEvent.press(getByLabelText('Verse 2'));
    expect(mockVerseNumPress).toHaveBeenCalledWith(2);
  });

  it('returns null for empty verses array', () => {
    const { toJSON } = renderWithProviders(
      <VerseBlock
        verses={[]}
        vhlGroups={VHL_GROUPS}
        notedVerses={new Set()}
        sectionId="sec1"
      />,
    );
    expect(toJSON()).toBeNull();
  });

  it('renders note indicators when onNotePress is provided', () => {
    const { getByTestId } = renderWithProviders(
      <VerseBlock
        verses={VERSES}
        vhlGroups={VHL_GROUPS}
        notedVerses={new Set([1])}
        sectionId="sec1"
        onNotePress={mockNotePress}
      />,
    );
    expect(getByTestId('note-indicator-1')).toBeTruthy();
    expect(getByTestId('note-indicator-2')).toBeTruthy();
  });

  it('applies highlight style to active verse', () => {
    const { getByText } = renderWithProviders(
      <VerseBlock
        verses={VERSES}
        vhlGroups={VHL_GROUPS}
        notedVerses={new Set()}
        sectionId="sec1"
        activeVerseNum={1}
      />,
    );
    // The verse row for verse 1 should have a backgroundColor style applied
    const verseNumEl = getByText('1');
    const row = verseNumEl.parent!.parent!;
    const flatStyle = Array.isArray(row.props.style)
      ? Object.assign({}, ...row.props.style.filter(Boolean))
      : row.props.style;
    expect(flatStyle.backgroundColor).toBeDefined();
  });
});
