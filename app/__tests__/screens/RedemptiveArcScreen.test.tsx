import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { fireEvent } from '@testing-library/react-native';

jest.mock('@/hooks/useRedemptiveArc', () => ({
  useRedemptiveArc: jest.fn().mockReturnValue({
    acts: [
      {
        id: 'creation',
        name: 'Creation',
        tagline: 'God creates everything good',
        summary: 'God creates the heavens and the earth.',
        key_verse: { text: 'In the beginning God created...', ref: 'Genesis 1:1' },
        era_ids: ['creation_era'],
        book_range: 'Genesis 1-2',
        threads: ['thread_creation'],
        prophecy_chains: ['chain_seed'],
      },
      {
        id: 'fall',
        name: 'The Fall',
        tagline: 'Humanity chooses rebellion',
        summary: 'Sin enters the world.',
        key_verse: null,
        era_ids: [],
        book_range: 'Genesis 3',
        threads: [],
        prophecy_chains: [],
      },
      {
        id: 'redemption',
        name: 'Redemption Initiated',
        tagline: null,
        summary: null,
        key_verse: null,
        era_ids: [],
        book_range: null,
        threads: [],
        prophecy_chains: [],
      },
    ],
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

jest.mock('@/components/ScreenHeader', () => ({
  ScreenHeader: ({ title }: { title: string }) => {
    const RN = require('react-native');
    return <RN.Text>{title}</RN.Text>;
  },
}));

jest.mock('@/components/LoadingSkeleton', () => ({
  LoadingSkeleton: () => null,
}));

jest.mock('@/components/BadgeChip', () => ({
  BadgeChip: ({ label }: { label: string }) => {
    const RN = require('react-native');
    return <RN.Text>{label}</RN.Text>;
  },
}));

jest.mock('@/components/UpgradePrompt', () => ({
  UpgradePrompt: () => null,
}));

jest.mock('@/components/ScreenErrorBoundary', () => ({
  withErrorBoundary: (C: React.ComponentType) => C,
}));

jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn() }),
}));

import RedemptiveArcScreen from '@/screens/RedemptiveArcScreen';

describe('RedemptiveArcScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<RedemptiveArcScreen />);
    }).not.toThrow();
  });

  it('shows the screen title', () => {
    const { getByText } = renderWithProviders(<RedemptiveArcScreen />);
    expect(getByText('The Story of the Bible')).toBeTruthy();
  });

  it('shows first 2 acts for non-premium users (FREE_ACT_COUNT=2)', () => {
    const { getByText, queryByText } = renderWithProviders(<RedemptiveArcScreen />);
    expect(getByText('Creation')).toBeTruthy();
    expect(getByText('The Fall')).toBeTruthy();
    expect(queryByText('Redemption Initiated')).toBeNull();
  });

  it('shows premium unlock card', () => {
    const { getByText } = renderWithProviders(<RedemptiveArcScreen />);
    expect(getByText('1 more acts')).toBeTruthy();
  });

  it('expands act on tap to show threads', () => {
    const { getByText, queryByText } = renderWithProviders(<RedemptiveArcScreen />);

    // Threads should not be visible initially
    expect(queryByText('THREADS')).toBeNull();

    // Tap the Creation act card
    fireEvent.press(getByText('Creation'));

    // Now threads section should appear
    expect(getByText('THREADS')).toBeTruthy();
  });
});
