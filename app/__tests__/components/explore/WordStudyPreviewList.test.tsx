import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';

jest.mock('@/db/content', () => ({
  getAllWordStudies: jest.fn(),
}));

import {
  WordStudyPreviewList,
  parseFirstGloss,
  countOccurrences,
} from '@/components/explore/WordStudyPreviewList';
import type { WordStudy } from '@/types';
const { getAllWordStudies } = require('@/db/content');

function makeWord(overrides: Partial<WordStudy> = {}): WordStudy {
  return {
    id: 'hesed',
    language: 'hebrew',
    original: 'חסד',
    transliteration: 'hesed',
    strongs: null,
    glosses_json: '["steadfast love", "lovingkindness"]',
    semantic_range: null,
    note: null,
    occurrences_json: '["Gen 24:12","Ex 15:13","Ps 23:6"]',
    ...overrides,
  };
}

describe('WordStudyPreviewList', () => {
  it('renders the supplied word studies', () => {
    const words = [
      makeWord({ id: 'a', transliteration: 'agape' }),
      makeWord({ id: 'b', transliteration: 'emet' }),
    ];
    const { getByText } = renderWithProviders(
      <WordStudyPreviewList
        onWordPress={jest.fn()}
        onSeeAll={jest.fn()}
        wordStudies={words}
        totalCount={120}
      />,
    );
    expect(getByText('agape')).toBeTruthy();
    expect(getByText('emet')).toBeTruthy();
    expect(getByText('All 120 word studies ›')).toBeTruthy();
  });

  it('renders the first gloss', () => {
    const words = [makeWord({ id: 'a' })];
    const { getByText } = renderWithProviders(
      <WordStudyPreviewList onWordPress={jest.fn()} onSeeAll={jest.fn()} wordStudies={words} />,
    );
    expect(getByText('steadfast love')).toBeTruthy();
  });

  it('renders language badge upper-cased', () => {
    const words = [makeWord({ id: 'a', language: 'greek' })];
    const { getByText } = renderWithProviders(
      <WordStudyPreviewList onWordPress={jest.fn()} onSeeAll={jest.fn()} wordStudies={words} />,
    );
    expect(getByText('GREEK')).toBeTruthy();
  });

  it('renders occurrence count', () => {
    const words = [makeWord({ id: 'a' })];
    const { getByText } = renderWithProviders(
      <WordStudyPreviewList onWordPress={jest.fn()} onSeeAll={jest.fn()} wordStudies={words} />,
    );
    expect(getByText('3×')).toBeTruthy();
  });

  it('caps the list at 3 entries', () => {
    const words = [
      makeWord({ id: 'a', transliteration: 'a' }),
      makeWord({ id: 'b', transliteration: 'b' }),
      makeWord({ id: 'c', transliteration: 'c' }),
      makeWord({ id: 'd', transliteration: 'd' }),
    ];
    const { queryByText } = renderWithProviders(
      <WordStudyPreviewList onWordPress={jest.fn()} onSeeAll={jest.fn()} wordStudies={words} />,
    );
    expect(queryByText('a')).toBeTruthy();
    expect(queryByText('b')).toBeTruthy();
    expect(queryByText('c')).toBeTruthy();
    expect(queryByText('d')).toBeNull();
  });

  it('returns null when list is empty', () => {
    const { queryByText } = renderWithProviders(
      <WordStudyPreviewList onWordPress={jest.fn()} onSeeAll={jest.fn()} wordStudies={[]} />,
    );
    expect(queryByText(/word studies ›/)).toBeNull();
  });

  it('calls onWordPress with the word id', () => {
    const onPress = jest.fn();
    const words = [makeWord({ id: 'xyz', transliteration: 'xyz' })];
    const { getByText } = renderWithProviders(
      <WordStudyPreviewList onWordPress={onPress} onSeeAll={jest.fn()} wordStudies={words} />,
    );
    fireEvent.press(getByText('xyz'));
    expect(onPress).toHaveBeenCalledWith('xyz');
  });

  it('fetches word studies from the DB when no override provided', async () => {
    (getAllWordStudies as jest.Mock).mockResolvedValueOnce([
      makeWord({ id: 'fetched', transliteration: 'fetched' }),
    ]);
    const { findByText } = renderWithProviders(
      <WordStudyPreviewList onWordPress={jest.fn()} onSeeAll={jest.fn()} />,
    );
    expect(await findByText('fetched')).toBeTruthy();
  });
});

describe('parseFirstGloss', () => {
  it('returns empty string for null/undefined/empty', () => {
    expect(parseFirstGloss(null)).toBe('');
    expect(parseFirstGloss(undefined)).toBe('');
    expect(parseFirstGloss('')).toBe('');
  });

  it('returns empty string for malformed JSON', () => {
    expect(parseFirstGloss('not-json')).toBe('');
  });

  it('returns empty string when parsed value is not an array', () => {
    expect(parseFirstGloss('{"a":1}')).toBe('');
  });

  it('returns empty string for empty array', () => {
    expect(parseFirstGloss('[]')).toBe('');
  });

  it('returns the first string in a valid array', () => {
    expect(parseFirstGloss('["love","mercy"]')).toBe('love');
  });

  it('returns empty string when the first entry is not a string', () => {
    expect(parseFirstGloss('[1,2]')).toBe('');
  });
});

describe('countOccurrences', () => {
  it('returns 0 for null/empty/invalid', () => {
    expect(countOccurrences(null)).toBe(0);
    expect(countOccurrences('')).toBe(0);
    expect(countOccurrences('not-json')).toBe(0);
    expect(countOccurrences('{"x":1}')).toBe(0);
  });

  it('returns array length for valid arrays', () => {
    expect(countOccurrences('["a","b"]')).toBe(2);
  });
});
