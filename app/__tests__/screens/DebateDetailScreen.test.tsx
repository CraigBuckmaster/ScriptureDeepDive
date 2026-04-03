import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import DebateDetailScreen from '@/screens/DebateDetailScreen';

// ── Override navigation + route ─────────────────────────────────
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: jest.fn(),
      goBack: jest.fn(),
      push: jest.fn(),
      setOptions: jest.fn(),
    }),
    useRoute: () => ({ params: { topicId: 'gen-days' } }),
    useScrollToTop: jest.fn(),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

jest.mock('lucide-react-native', () => ({
  ChevronLeft: () => null,
  ChevronDown: () => null,
  ChevronUp: () => null,
  BookOpen: () => null,
  Filter: () => null,
  Search: () => null,
  X: () => null,
}));

jest.mock('react-native-safe-area-context', () => ({
  SafeAreaView: ({ children }: any) => children,
  useSafeAreaInsets: () => ({ top: 44, bottom: 34, left: 0, right: 0 }),
}));

// ── Mock hooks ──────────────────────────────────────────────────
const mockUseDebateTopic = jest.fn();
jest.mock('@/hooks/useDebateTopics', () => ({
  useDebateTopic: (...args: unknown[]) => mockUseDebateTopic(...args),
  useDebateTopics: jest.fn(),
}));

jest.mock('@/hooks/usePremium', () => ({
  usePremium: () => ({
    isPremium: true,
    upgradeRequest: null,
    showUpgrade: jest.fn(),
    dismissUpgrade: jest.fn(),
  }),
}));

// ── Mock child components ───────────────────────────────────────
jest.mock('@/components/UpgradePrompt', () => {
  const { View } = require('react-native');
  return { UpgradePrompt: () => <View testID="upgrade-prompt" /> };
});

jest.mock('@/components/DebatePositionCard', () => {
  const { Text } = require('react-native');
  return {
    DebatePositionCard: ({ position }: any) => <Text>{position.label}</Text>,
  };
});

jest.mock('@/components/DebateTraditionFilter', () => {
  const { Text } = require('react-native');
  return {
    DebateTraditionFilter: ({ traditions }: any) => (
      <Text>Filter: {traditions.join(', ')}</Text>
    ),
  };
});

const sampleTopicData = {
  topic: {
    id: 'gen-days',
    title: 'The Nature of the Days',
    question: 'Are the days literal?',
    passage: 'Genesis 1',
    context: 'The creation account in Genesis 1.',
    synthesis: 'Multiple views exist.',
    book_id: 'genesis',
    chapters: [1],
    tags: ['creation'],
    positions: [
      {
        id: 'p1',
        label: 'Literal Days',
        tradition_family: 'evangelical',
        argument: 'Plain reading.',
        proponents: 'Morris',
        strengths: 'Simple',
        weaknesses: 'Science',
        key_verses: ['Gen 1:5'],
        scholar_ids: [],
      },
      {
        id: 'p2',
        label: 'Framework',
        tradition_family: 'reformed',
        argument: 'Literary structure.',
        proponents: 'Kline',
        strengths: 'Literary',
        weaknesses: 'Novel',
        key_verses: ['Gen 1:1'],
        scholar_ids: [],
      },
    ],
  },
  scholars: [],
  loading: false,
};

beforeEach(() => {
  jest.clearAllMocks();
  mockUseDebateTopic.mockReturnValue(sampleTopicData);
});

describe('DebateDetailScreen', () => {
  it('renders topic title', () => {
    const { getByText } = renderWithProviders(<DebateDetailScreen />);
    expect(getByText('The Nature of the Days')).toBeTruthy();
  });

  it('renders question text', () => {
    const { getByText } = renderWithProviders(<DebateDetailScreen />);
    expect(getByText('Are the days literal?')).toBeTruthy();
  });

  it('shows "CONTEXT" section', () => {
    const { getByText } = renderWithProviders(<DebateDetailScreen />);
    expect(getByText(/CONTEXT/i)).toBeTruthy();
  });

  it('shows "SYNTHESIS" section', () => {
    const { getByText } = renderWithProviders(<DebateDetailScreen />);
    expect(getByText(/SYNTHESIS/i)).toBeTruthy();
  });

  it('renders position cards for premium users', () => {
    const { getByText } = renderWithProviders(<DebateDetailScreen />);
    expect(getByText('Literal Days')).toBeTruthy();
    expect(getByText('Framework')).toBeTruthy();
  });

  it('shows "Not Found" when topic is null', () => {
    mockUseDebateTopic.mockReturnValue({
      topic: null,
      scholars: [],
      loading: false,
    });
    const { getByText } = renderWithProviders(<DebateDetailScreen />);
    expect(getByText(/Not Found/i)).toBeTruthy();
  });
});
