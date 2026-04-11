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
  ScreenHeader: ({ title, subtitle }: { title: string; subtitle?: string }) => {
    const RN = require('react-native');
    return <RN.View><RN.Text>{title}</RN.Text>{subtitle && <RN.Text>{subtitle}</RN.Text>}</RN.View>;
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

  it('shows subtitle with act count', () => {
    const { getByText } = renderWithProviders(<RedemptiveArcScreen />);
    expect(getByText(/3 acts in God/)).toBeTruthy();
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

  it('shows act tagline', () => {
    const { getByText } = renderWithProviders(<RedemptiveArcScreen />);
    expect(getByText('God creates everything good')).toBeTruthy();
    expect(getByText('Humanity chooses rebellion')).toBeTruthy();
  });

  it('shows act summary', () => {
    const { getByText } = renderWithProviders(<RedemptiveArcScreen />);
    expect(getByText('God creates the heavens and the earth.')).toBeTruthy();
    expect(getByText('Sin enters the world.')).toBeTruthy();
  });

  it('shows act key verse when present', () => {
    const { getByText } = renderWithProviders(<RedemptiveArcScreen />);
    expect(getByText('In the beginning God created...')).toBeTruthy();
    expect(getByText('Genesis 1:1')).toBeTruthy();
  });

  it('shows era badges and book range', () => {
    const { getByText } = renderWithProviders(<RedemptiveArcScreen />);
    expect(getByText('creation era')).toBeTruthy();
    expect(getByText('Genesis 1-2')).toBeTruthy();
    expect(getByText('Genesis 3')).toBeTruthy();
  });

  it('shows act number badges', () => {
    const { getByText } = renderWithProviders(<RedemptiveArcScreen />);
    expect(getByText('1')).toBeTruthy();
    expect(getByText('2')).toBeTruthy();
  });

  it('expands act on tap to show threads', () => {
    const { getByText, queryByText } = renderWithProviders(<RedemptiveArcScreen />);
    expect(queryByText('THREADS')).toBeNull();
    fireEvent.press(getByText('Creation'));
    expect(getByText('THREADS')).toBeTruthy();
    expect(getByText('thread creation')).toBeTruthy();
  });

  it('shows prophecy chains when expanded', () => {
    const { getByText } = renderWithProviders(<RedemptiveArcScreen />);
    fireEvent.press(getByText('Creation'));
    expect(getByText('PROPHECY CHAINS')).toBeTruthy();
    expect(getByText('chain seed')).toBeTruthy();
  });

  it('collapses act on second tap', () => {
    const { getByText, queryByText } = renderWithProviders(<RedemptiveArcScreen />);
    fireEvent.press(getByText('Creation'));
    expect(getByText('THREADS')).toBeTruthy();
    fireEvent.press(getByText('Creation'));
    expect(queryByText('THREADS')).toBeNull();
  });

  it('shows all acts for premium users', () => {
    const { usePremium } = require('@/hooks/usePremium');
    usePremium.mockReturnValue({
      isPremium: true,
      upgradeRequest: null,
      showUpgrade: jest.fn(),
      dismissUpgrade: jest.fn(),
    });

    const { getByText, queryByText } = renderWithProviders(<RedemptiveArcScreen />);
    expect(getByText('Redemption Initiated')).toBeTruthy();
    expect(queryByText(/more acts/)).toBeNull();
  });

  it('shows loading skeleton when isLoading', () => {
    const { useRedemptiveArc } = require('@/hooks/useRedemptiveArc');
    useRedemptiveArc.mockReturnValue({ acts: [], isLoading: true });
    expect(() => {
      renderWithProviders(<RedemptiveArcScreen />);
    }).not.toThrow();
  });
});
