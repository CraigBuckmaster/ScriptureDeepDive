import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import DifficultPassageDetailScreen from '@/screens/DifficultPassageDetailScreen';

// ── Override useRoute to supply params ───────────────────────────
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn(), push: jest.fn(), setOptions: jest.fn() }),
    useRoute: () => ({ params: { passageId: 'dp-1' }, key: 'DifficultPassageDetail-1', name: 'DifficultPassageDetail' }),
    useScrollToTop: jest.fn(),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

// ── Mock hook ────────────────────────────────────────────────────
const mockUseDifficultPassage = jest.fn();
jest.mock('@/hooks/useDifficultPassages', () => ({
  useDifficultPassage: (...args: unknown[]) => mockUseDifficultPassage(...args),
}));

const samplePassage = {
  id: 'dp-1',
  title: 'The Conquest of Canaan',
  category: 'ethical' as const,
  severity: 'major' as const,
  passage: 'Joshua 6-11',
  question: 'How can a loving God command the destruction of entire cities?',
  context: 'The conquest narratives raise difficult ethical questions about divine violence.',
  consensus: 'Scholars generally agree these texts must be read in their ancient Near Eastern context.',
  key_verses: [
    { ref: 'Joshua 6:21', text: 'They devoted the city to the Lord...' },
    { ref: 'Deuteronomy 20:16-18', text: 'In the cities of the nations...' },
  ],
  responses: [
    {
      tradition: 'Reformed Evangelical',
      tradition_family: 'evangelical',
      scholar_id: 'scholar-1',
      summary: 'God as sovereign judge has the right to execute judgment on any nation.',
      strengths: 'Takes divine sovereignty seriously.',
      weaknesses: 'May not adequately address the emotional difficulty.',
      key_verses: ['Romans 9:20'],
    },
  ],
  related_chapters: [
    { book_dir: 'joshua', chapter_num: 6 },
  ],
  further_reading: [
    { author: 'Paul Copan', title: 'Is God a Moral Monster?', year: 2011 },
  ],
  tags: ['violence', 'ethics', 'conquest'],
};

const sampleScholars = new Map([
  ['scholar-1', { id: 'scholar-1', name: 'Dr. Scholar One', tradition: 'Reformed' }],
]);

beforeEach(() => {
  jest.clearAllMocks();
  mockUseDifficultPassage.mockReturnValue({
    passage: samplePassage,
    scholars: sampleScholars,
    relatedChapters: [{ book_dir: 'joshua', chapter_num: 6, book_name: 'Joshua' }],
    loading: false,
    error: null,
  });
});

describe('DifficultPassageDetailScreen', () => {
  it('renders passage title and question', () => {
    const { getByText } = renderWithProviders(<DifficultPassageDetailScreen />);
    expect(getByText('The Conquest of Canaan')).toBeTruthy();
    expect(getByText(/How can a loving God/)).toBeTruthy();
  });

  it('shows scholarly responses', () => {
    const { getByText } = renderWithProviders(<DifficultPassageDetailScreen />);
    expect(getByText('Scholarly Responses')).toBeTruthy();
    expect(getByText('Reformed Evangelical')).toBeTruthy();
    expect(getByText(/God as sovereign judge/)).toBeTruthy();
  });

  it('shows key verses', () => {
    const { getAllByText, getByText } = renderWithProviders(<DifficultPassageDetailScreen />);
    // "Key Verses" appears in main section and inside expanded response card
    expect(getAllByText('Key Verses').length).toBeGreaterThanOrEqual(1);
    expect(getByText('Joshua 6:21')).toBeTruthy();
    expect(getByText(/They devoted the city/)).toBeTruthy();
  });

  it('shows further reading', () => {
    const { getByText } = renderWithProviders(<DifficultPassageDetailScreen />);
    expect(getByText('Further Reading')).toBeTruthy();
    expect(getByText('Is God a Moral Monster?')).toBeTruthy();
    expect(getByText('Paul Copan (2011)')).toBeTruthy();
  });

  it('shows loading state', () => {
    mockUseDifficultPassage.mockReturnValue({
      passage: null,
      scholars: new Map(),
      relatedChapters: [],
      loading: true,
      error: null,
    });
    const { queryByText } = renderWithProviders(<DifficultPassageDetailScreen />);
    // Title should not be rendered during loading
    expect(queryByText('The Conquest of Canaan')).toBeNull();
  });
});
