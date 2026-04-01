import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import DifficultPassagesBrowseScreen from '@/screens/DifficultPassagesBrowseScreen';

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

jest.mock('lucide-react-native', () => ({
  ChevronLeft: () => null,
  Search: () => null,
  X: () => null,
}));

// ── Mock hook ────────────────────────────────────────────────────
const mockUseDifficultPassages = jest.fn();
jest.mock('@/hooks/useDifficultPassages', () => ({
  useDifficultPassages: (...args: unknown[]) => mockUseDifficultPassages(...args),
}));

const samplePassages = [
  {
    id: 'dp-1',
    title: 'The Conquest of Canaan',
    category: 'ethical',
    severity: 'major',
    passage: 'Joshua 6:21',
    question: 'How do we understand divine commands of destruction?',
    tags: ['violence', 'old-testament'],
  },
  {
    id: 'dp-2',
    title: 'Two Creation Accounts',
    category: 'contradiction',
    severity: 'moderate',
    passage: 'Genesis 1-2',
    question: 'Are there two conflicting creation narratives?',
    tags: ['genesis', 'creation'],
  },
  {
    id: 'dp-3',
    title: 'The Problem of Evil',
    category: 'theological',
    severity: 'major',
    passage: 'Job 1:1-12',
    question: 'Why does God allow suffering of the righteous?',
    tags: ['suffering', 'theodicy'],
  },
  {
    id: 'dp-4',
    title: 'Census Numbers',
    category: 'historical',
    severity: 'minor',
    passage: 'Numbers 1:46',
    question: 'Are the census figures historically plausible?',
    tags: ['numbers', 'history'],
  },
];

beforeEach(() => {
  jest.clearAllMocks();
  mockUseDifficultPassages.mockReturnValue({
    passages: samplePassages,
    loading: false,
    error: null,
  });
});

describe('DifficultPassagesBrowseScreen', () => {
  it('renders without crashing', () => {
    const { getByText } = renderWithProviders(<DifficultPassagesBrowseScreen />);
    expect(getByText('Difficult Passages')).toBeTruthy();
  });

  it('renders passage cards', () => {
    const { getByText } = renderWithProviders(<DifficultPassagesBrowseScreen />);
    expect(getByText('The Conquest of Canaan')).toBeTruthy();
    expect(getByText('Two Creation Accounts')).toBeTruthy();
    expect(getByText('The Problem of Evil')).toBeTruthy();
    expect(getByText('Census Numbers')).toBeTruthy();
  });

  it('shows loading indicator when loading', () => {
    mockUseDifficultPassages.mockReturnValue({ passages: [], loading: true, error: null });
    const { queryByText } = renderWithProviders(<DifficultPassagesBrowseScreen />);
    // Cards should not be present
    expect(queryByText('The Conquest of Canaan')).toBeNull();
  });

  it('shows error message when error occurs', () => {
    mockUseDifficultPassages.mockReturnValue({
      passages: [],
      loading: false,
      error: 'Failed to load passages',
    });
    const { getByText } = renderWithProviders(<DifficultPassagesBrowseScreen />);
    expect(getByText('Failed to load passages')).toBeTruthy();
  });

  it('renders category filter chips', () => {
    const { getByText } = renderWithProviders(<DifficultPassagesBrowseScreen />);
    expect(getByText('All')).toBeTruthy();
    expect(getByText('Ethical')).toBeTruthy();
    expect(getByText('Contradiction')).toBeTruthy();
    expect(getByText('Theological')).toBeTruthy();
    expect(getByText('Historical')).toBeTruthy();
    expect(getByText('Textual')).toBeTruthy();
  });

  it('filters by category when chip is pressed', () => {
    const { getByText, queryByText } = renderWithProviders(<DifficultPassagesBrowseScreen />);
    fireEvent.press(getByText('Ethical'));
    expect(getByText('The Conquest of Canaan')).toBeTruthy();
    expect(queryByText('Two Creation Accounts')).toBeNull();
    expect(queryByText('The Problem of Evil')).toBeNull();
    expect(queryByText('Census Numbers')).toBeNull();
  });

  it('displays passage references and questions', () => {
    const { getByText } = renderWithProviders(<DifficultPassagesBrowseScreen />);
    expect(getByText('Joshua 6:21')).toBeTruthy();
    expect(getByText('How do we understand divine commands of destruction?')).toBeTruthy();
  });

  it('navigates to detail on card press', () => {
    const { getByText } = renderWithProviders(<DifficultPassagesBrowseScreen />);
    fireEvent.press(getByText('The Conquest of Canaan'));
    expect(mockNavigate).toHaveBeenCalledWith('DifficultPassageDetail', { passageId: 'dp-1' });
  });
});
