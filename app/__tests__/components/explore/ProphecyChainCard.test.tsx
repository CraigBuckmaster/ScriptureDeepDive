import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import {
  ProphecyChainCard,
  parseChainLinks,
  formatRange,
} from '@/components/explore/ProphecyChainCard';
import type { ProphecyChain } from '@/types';

const CHAIN: ProphecyChain = {
  id: 'seed',
  title: 'Seed of the Woman',
  category: 'messianic',
  chain_type: 'prophecy-fulfillment',
  summary: null,
  tags_json: null,
  links_json: JSON.stringify([
    { book_dir: 'genesis', chapter_num: 3, verse_ref: 'Gen 3:15' },
    { book_dir: 'revelation', chapter_num: 12, verse_ref: 'Rev 12:5' },
  ]),
};

describe('ProphecyChainCard', () => {
  it('renders the chain title', () => {
    const { getByText } = renderWithProviders(
      <ProphecyChainCard chain={CHAIN} onPress={jest.fn()} />,
    );
    expect(getByText('Seed of the Woman')).toBeTruthy();
  });

  it('renders the verse range using first → last refs', () => {
    const { getByText } = renderWithProviders(
      <ProphecyChainCard chain={CHAIN} onPress={jest.fn()} />,
    );
    expect(getByText(/Gen 3:15 → Rev 12:5/)).toBeTruthy();
  });

  it('renders the stop count', () => {
    const { getByText } = renderWithProviders(
      <ProphecyChainCard chain={CHAIN} onPress={jest.fn()} />,
    );
    expect(getByText('2 stops')).toBeTruthy();
  });

  it('calls onPress when tapped', () => {
    const onPress = jest.fn();
    const { getByRole } = renderWithProviders(
      <ProphecyChainCard chain={CHAIN} onPress={onPress} />,
    );
    fireEvent.press(getByRole('button'));
    expect(onPress).toHaveBeenCalledTimes(1);
  });

  it('renders safely with malformed links_json', () => {
    const broken: ProphecyChain = { ...CHAIN, links_json: 'not-json' };
    const { getByText } = renderWithProviders(
      <ProphecyChainCard chain={broken} onPress={jest.fn()} />,
    );
    expect(getByText('0 stops')).toBeTruthy();
  });
});

describe('parseChainLinks', () => {
  it('returns empty array for null/undefined/empty', () => {
    expect(parseChainLinks(null)).toEqual([]);
    expect(parseChainLinks(undefined)).toEqual([]);
    expect(parseChainLinks('')).toEqual([]);
  });

  it('returns empty array on malformed JSON', () => {
    expect(parseChainLinks('not-json')).toEqual([]);
  });

  it('returns empty array when parsed value is not an array', () => {
    expect(parseChainLinks('{"foo":1}')).toEqual([]);
  });

  it('parses a valid array of links', () => {
    const out = parseChainLinks(
      '[{"book_dir":"genesis","chapter_num":1,"verse_ref":"Gen 1:1"}]',
    );
    expect(out).toHaveLength(1);
    expect(out[0].verse_ref).toBe('Gen 1:1');
  });
});

describe('formatRange', () => {
  it('returns empty string for empty array', () => {
    expect(formatRange([])).toBe('');
  });

  it('returns single ref when first and last are the same object', () => {
    const link = { book_dir: 'gen', chapter_num: 1, verse_ref: 'Gen 1:1' };
    expect(formatRange([link])).toBe('Gen 1:1');
  });

  it('returns arrow-joined refs for multiple links', () => {
    const a = { book_dir: 'gen', chapter_num: 1, verse_ref: 'Gen 1:1' };
    const b = { book_dir: 'rev', chapter_num: 22, verse_ref: 'Rev 22:21' };
    expect(formatRange([a, b])).toBe('Gen 1:1 → Rev 22:21');
  });
});
