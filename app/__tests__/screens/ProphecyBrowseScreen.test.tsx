import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import ProphecyBrowseScreen from '@/screens/ProphecyBrowseScreen';

// ── Override navigation ─────────────────────────────────────────
const mockNavigate = jest.fn();
const mockGoBack = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: mockGoBack,
      push: jest.fn(),
      setOptions: jest.fn(),
    }),
    useRoute: () => ({ params: {} }),
    useScrollToTop: jest.fn(),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

// ── Mock child components ────────────────────────────────────────
jest.mock('@/components/ScreenHeader', () => ({
  ScreenHeader: ({ title }: { title: string }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, {}, title);
  },
}));

jest.mock('@/components/LoadingSkeleton', () => ({
  LoadingSkeleton: () => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, {}, 'Loading...');
  },
}));

jest.mock('@/components/BadgeChip', () => ({
  BadgeChip: ({ label }: { label: string }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, {}, label);
  },
}));

// ── Mock hook ────────────────────────────────────────────────────
const mockUseProphecyChains = jest.fn();
jest.mock('@/hooks/useProphecyChains', () => ({
  useProphecyChains: (...args: unknown[]) => mockUseProphecyChains(...args),
}));

const sampleChains = [
  {
    id: 'chain-1',
    title: 'The Seed of the Woman',
    category: 'messianic',
    summary: 'Traces the messianic promise from Genesis to Revelation.',
    links_json: JSON.stringify([
      { book_dir: 'genesis', verse_ref: '3:15' },
      { book_dir: 'revelation', verse_ref: '12:1' },
    ]),
  },
  {
    id: 'chain-2',
    title: 'Day of the Lord',
    category: 'judgment',
    summary: 'Prophetic warnings of divine judgment.',
    links_json: JSON.stringify([
      { book_dir: 'joel', verse_ref: '2:1' },
      { book_dir: '2_peter', verse_ref: '3:10' },
    ]),
  },
  {
    id: 'chain-3',
    title: 'New Covenant Promise',
    category: 'covenant',
    summary: 'The promise of a renewed covenant.',
    links_json: JSON.stringify([
      { book_dir: 'jeremiah', verse_ref: '31:31' },
      { book_dir: 'hebrews', verse_ref: '8:13' },
    ]),
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockUseProphecyChains.mockReturnValue({
    chains: sampleChains,
    isLoading: false,
  });
});

describe('ProphecyBrowseScreen', () => {
  it('renders the header', () => {
    const { getByText } = renderWithProviders(<ProphecyBrowseScreen />);
    expect(getByText('Prophecy & Typology')).toBeTruthy();
  });

  it('renders chain titles', () => {
    const { getByText } = renderWithProviders(<ProphecyBrowseScreen />);
    expect(getByText('The Seed of the Woman')).toBeTruthy();
    expect(getByText('Day of the Lord')).toBeTruthy();
    expect(getByText('New Covenant Promise')).toBeTruthy();
  });

  it('shows loading skeleton when loading', () => {
    mockUseProphecyChains.mockReturnValue({ chains: [], isLoading: true });
    const { getByText } = renderWithProviders(<ProphecyBrowseScreen />);
    expect(getByText('Loading...')).toBeTruthy();
  });

  it('renders category filter chips', () => {
    const { getByText } = renderWithProviders(<ProphecyBrowseScreen />);
    expect(getByText('All')).toBeTruthy();
  });

  it('displays link count on cards', () => {
    const { getAllByText } = renderWithProviders(<ProphecyBrowseScreen />);
    expect(getAllByText('2 links').length).toBe(3);
  });

  it('displays reference range on cards', () => {
    const { getByText } = renderWithProviders(<ProphecyBrowseScreen />);
    expect(getByText('Genesis 3:15 → Revelation 12:1')).toBeTruthy();
  });

  it('navigates to ProphecyDetail on card press', () => {
    const { getByText } = renderWithProviders(<ProphecyBrowseScreen />);
    fireEvent.press(getByText('The Seed of the Woman'));
    expect(mockNavigate).toHaveBeenCalledWith('ProphecyDetail', { chainId: 'chain-1' });
  });

  it('filters chains by category when chip is pressed', () => {
    const { getAllByText, getByText, queryByText } = renderWithProviders(<ProphecyBrowseScreen />);
    // "Judgment" appears on both the filter chip and the card badge; press the first (filter chip)
    const judgmentElements = getAllByText('Judgment');
    fireEvent.press(judgmentElements[0]);
    expect(getByText('Day of the Lord')).toBeTruthy();
    expect(queryByText('The Seed of the Woman')).toBeNull();
    expect(queryByText('New Covenant Promise')).toBeNull();
  });
});
