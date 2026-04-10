import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import ArchaeologyDetailScreen from '@/screens/ArchaeologyDetailScreen';

const mockUseRoute = jest.fn().mockReturnValue({ params: { discoveryId: 'd-1' } });

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
    useRoute: () => mockUseRoute(),
    useScrollToTop: jest.fn(),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

jest.mock('@/hooks/useArchaeology', () => ({
  useArchaeologyDetail: jest.fn().mockReturnValue({
    discovery: null,
    verseLinks: [],
    images: [],
    loading: false,
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

jest.mock('@/components/ScreenHeader', () => ({
  ScreenHeader: ({ title }: { title: string }) => {
    const RN = require('react-native');
    return <RN.Text>{title}</RN.Text>;
  },
}));

jest.mock('@/components/LoadingSkeleton', () => ({ LoadingSkeleton: () => null }));
jest.mock('@/components/CollapsibleSection', () => ({ CollapsibleSection: () => null }));
jest.mock('@/components/UpgradePrompt', () => ({ UpgradePrompt: () => null }));
jest.mock('@/components/DiscoveryImageGallery', () => ({ DiscoveryImageGallery: () => null }));
jest.mock('@/components/BadgeChip', () => ({ BadgeChip: () => null }));
jest.mock('@/components/ScreenErrorBoundary', () => ({
  withErrorBoundary: (C: React.ComponentType) => C,
}));

describe('ArchaeologyDetailScreen', () => {
  it('renders header when discovery is not found', () => {
    const { getByText } = renderWithProviders(<ArchaeologyDetailScreen />);
    expect(getByText('Discovery')).toBeTruthy();
  });

  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<ArchaeologyDetailScreen />);
    }).not.toThrow();
  });
});
