import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import ConceptDetailScreen from '@/screens/ConceptDetailScreen';

// ── Override useRoute to supply params ───────────────────────────
const mockUseRoute = jest.fn().mockReturnValue({
  params: { conceptId: 'concept-1' },
  key: 'ConceptDetail-1',
  name: 'ConceptDetail',
});

jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn(), push: jest.fn(), setOptions: jest.fn() }),
    useRoute: (...args: unknown[]) => mockUseRoute(...args),
    useScrollToTop: jest.fn(),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

// ── Mock child components ────────────────────────────────────────
jest.mock('@/components/ConceptJourney', () => {
  const React = require('react');
  const { Text } = require('react-native');
  return {
    __esModule: true,
    default: () => React.createElement(Text, {}, 'ConceptJourney'),
  };
});

// ── Mock useConceptData hook ─────────────────────────────────────
const mockUseConceptData = jest.fn();
jest.mock('@/hooks/useConceptData', () => ({
  useConceptData: (...args: unknown[]) => mockUseConceptData(...args),
}));

const baseConcept = {
  id: 'concept-1',
  title: 'Covenant Faithfulness',
  description: 'God faithfully keeps His covenant promises across all of Scripture.',
  tags: ['covenant', 'faithfulness'],
  journey_stops: [],
};

const sampleWordStudies = [
  { id: 'ws-1', original: '\u05D7\u04E6\u05E1\u05D3', transliteration: 'chesed', glosses: ['steadfast love', 'mercy'] },
];

const sampleChapters = [
  { chapter_id: 'gen-15', book_dir: 'genesis', book_name: 'Genesis', chapter_num: 15, score: 9 },
  { chapter_id: 'exo-19', book_dir: 'exodus', book_name: 'Exodus', chapter_num: 19, score: 8 },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockUseConceptData.mockReturnValue({
    concept: baseConcept,
    wordStudies: sampleWordStudies,
    prophecyChains: [],
    threads: [],
    people: [],
    topChapters: sampleChapters,
    loading: false,
    error: null,
  });
});

describe('ConceptDetailScreen', () => {
  it('renders concept title and description', () => {
    const { getByText } = renderWithProviders(<ConceptDetailScreen />);
    expect(getByText('Covenant Faithfulness')).toBeTruthy();
    expect(getByText(/God faithfully keeps/)).toBeTruthy();
  });

  it('shows word studies section', () => {
    const { getByText } = renderWithProviders(<ConceptDetailScreen />);
    expect(getByText('Word Studies')).toBeTruthy();
    expect(getByText('chesed')).toBeTruthy();
  });

  it('shows key chapters section', () => {
    const { getByText } = renderWithProviders(<ConceptDetailScreen />);
    expect(getByText('Key Chapters')).toBeTruthy();
    expect(getByText('Genesis 15')).toBeTruthy();
    expect(getByText('Exodus 19')).toBeTruthy();
  });

  it('shows concept tags', () => {
    const { getByText } = renderWithProviders(<ConceptDetailScreen />);
    expect(getByText('covenant')).toBeTruthy();
    expect(getByText('faithfulness')).toBeTruthy();
  });

  it('renders loading state', () => {
    mockUseConceptData.mockReturnValue({
      concept: null,
      wordStudies: [],
      prophecyChains: [],
      threads: [],
      people: [],
      topChapters: [],
      loading: true,
      error: null,
    });
    // Should not crash; ActivityIndicator renders
    const { queryByText } = renderWithProviders(<ConceptDetailScreen />);
    expect(queryByText('Covenant Faithfulness')).toBeNull();
  });

  it('renders error state', () => {
    mockUseConceptData.mockReturnValue({
      concept: null,
      wordStudies: [],
      prophecyChains: [],
      threads: [],
      people: [],
      topChapters: [],
      loading: false,
      error: 'Failed to load concept',
    });
    const { getByText } = renderWithProviders(<ConceptDetailScreen />);
    expect(getByText('Failed to load concept')).toBeTruthy();
  });
});
