import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import PersonJourneyScreen from '@/screens/PersonJourneyScreen';

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
    useRoute: () => ({ params: { personId: 'abraham' } }),
    useScrollToTop: jest.fn(),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

jest.mock('@/hooks/usePersonJourney', () => ({
  usePersonJourney: jest.fn().mockReturnValue({
    person: null,
    stages: [],
    legacyRefs: [],
    isLoading: false,
  }),
}));

jest.mock('@/hooks/usePremium', () => ({
  usePremium: jest.fn().mockReturnValue({
    isPremium: false,
    upgradeRequest: null,
    showUpgrade: jest.fn(),
    dismissUpgrade: jest.fn(),
  }),
}));

jest.mock('@/hooks/useEras', () => ({
  useEras: jest.fn().mockReturnValue({ eras: [] }),
}));

jest.mock('@/components/ScreenHeader', () => ({
  ScreenHeader: ({ title }: { title: string }) => {
    const RN = require('react-native');
    return <RN.Text>{title}</RN.Text>;
  },
}));

jest.mock('@/components/LoadingSkeleton', () => ({ LoadingSkeleton: () => null }));
jest.mock('@/components/BadgeChip', () => ({ BadgeChip: () => null }));
jest.mock('@/components/UpgradePrompt', () => ({ UpgradePrompt: () => null }));
jest.mock('@/components/ScreenErrorBoundary', () => ({
  withErrorBoundary: (C: React.ComponentType) => C,
}));

describe('PersonJourneyScreen', () => {
  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<PersonJourneyScreen />);
    }).not.toThrow();
  });

  it('renders content area', () => {
    const result = renderWithProviders(<PersonJourneyScreen />);
    expect(result).toBeTruthy();
  });
});
