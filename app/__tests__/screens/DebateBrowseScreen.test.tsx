import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import DebateBrowseScreen from '@/screens/DebateBrowseScreen';

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
    useScrollToTop: jest.fn(),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

jest.mock('lucide-react-native', () => ({
  ArrowLeft: () => null,
  ChevronLeft: () => null,
  Search: () => null,
  X: () => null,
  Filter: () => null,
  BookOpen: () => null,
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

// ── Mock hook ────────────────────────────────────────────────────
jest.mock('@/hooks/useDebateTopics', () => ({
  useDebateTopics: () => ({
    topics: [
      {
        id: 'gen-days',
        title: 'The Nature of the Days',
        category: 'theological',
        book_id: 'genesis',
        passage: 'Genesis 1',
        question: 'Are the days literal?',
        positions_json:
          '[{"tradition_family":"evangelical"},{"tradition_family":"critical"}]',
        position_count: 2,
        tags_json: '[]',
        chapters_json: '[1]',
      },
    ],
    loading: false,
    search: '',
    setSearch: jest.fn(),
    categoryFilter: 'all',
    setCategoryFilter: jest.fn(),
    categories: ['theological'],
  }),
  DEBATE_CATEGORY_LABELS: {
    theological: 'Theological',
    ethical: 'Ethical',
    historical: 'Historical',
    textual: 'Textual',
    interpretive: 'Interpretive',
  },
}));

beforeEach(() => {
  jest.clearAllMocks();
});

describe('DebateBrowseScreen', () => {
  it('renders "Scholar Debates" title', () => {
    const { getByText } = renderWithProviders(<DebateBrowseScreen />);
    expect(getByText('Scholar Debates')).toBeTruthy();
  });

  it('renders topic card with title', () => {
    const { getByText } = renderWithProviders(<DebateBrowseScreen />);
    expect(getByText('The Nature of the Days')).toBeTruthy();
  });

  it('shows position count "2 positions"', () => {
    const { getByText } = renderWithProviders(<DebateBrowseScreen />);
    expect(getByText(/2 positions/)).toBeTruthy();
  });

  it('renders "All" category chip', () => {
    const { getByText } = renderWithProviders(<DebateBrowseScreen />);
    expect(getByText('All')).toBeTruthy();
  });
});
