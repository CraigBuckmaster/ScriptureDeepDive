import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import TimeTravelDetailScreen from '@/screens/TimeTravelDetailScreen';

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
    useRoute: () => ({ params: { verseRef: 'Genesis 1:1' } }),
    useScrollToTop: jest.fn(),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

jest.mock('@/hooks/useInterpretations', () => ({
  useVerseInterpretations: jest.fn().mockReturnValue({ data: [], loading: false }),
}));

jest.mock('@/hooks/usePremium', () => ({
  usePremium: jest.fn().mockReturnValue({
    isPremium: false,
    upgradeRequest: null,
    showUpgrade: jest.fn(),
    dismissUpgrade: jest.fn(),
  }),
}));

jest.mock('@/utils/verseResolver', () => ({
  parseReference: jest.fn(),
}));

jest.mock('@/components/ScreenHeader', () => ({
  ScreenHeader: ({ title }: { title: string }) => {
    const RN = require('react-native');
    return <RN.Text>{title}</RN.Text>;
  },
}));

jest.mock('@/components/LoadingSkeleton', () => ({ LoadingSkeleton: () => null }));
jest.mock('@/components/interpretations/InterpretationCard', () => ({
  InterpretationCard: () => null,
}));
jest.mock('@/components/BadgeChip', () => ({ BadgeChip: () => null }));
jest.mock('@/components/UpgradePrompt', () => ({ UpgradePrompt: () => null }));
jest.mock('@/components/ScreenErrorBoundary', () => ({
  withErrorBoundary: (C: React.ComponentType) => C,
}));

describe('TimeTravelDetailScreen', () => {
  it('renders the screen header', () => {
    const { getByText } = renderWithProviders(<TimeTravelDetailScreen />);
    expect(getByText('Through the Ages')).toBeTruthy();
  });

  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<TimeTravelDetailScreen />);
    }).not.toThrow();
  });
});
