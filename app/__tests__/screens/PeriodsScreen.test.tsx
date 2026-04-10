import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';

jest.mock('@/hooks/useEras', () => ({
  useEras: jest.fn().mockReturnValue({
    eras: [
      {
        id: 'creation',
        name: 'Creation',
        range_start: null,
        range_end: -2000,
        summary: 'The beginning of all things.',
        hex: '#4a7c4f',
        pill: 'ORIGINS',
        key_people: ['adam', 'noah'],
        books: ['genesis'],
        geographic_center: { region: 'Mesopotamia' },
        transition_to_next: 'From creation to the patriarchs...',
      },
      {
        id: 'patriarchs',
        name: 'Patriarchs',
        range_start: -2000,
        range_end: -1500,
        summary: 'The founding fathers of Israel.',
        hex: '#8b6c4a',
        pill: null,
        key_people: ['abraham'],
        books: ['genesis'],
        geographic_center: null,
        transition_to_next: null,
      },
      {
        id: 'exodus',
        name: 'Exodus',
        range_start: -1500,
        range_end: -1400,
        summary: 'Deliverance from Egypt.',
        hex: '#c84040',
        pill: 'LIBERATION',
        key_people: ['moses'],
        books: ['exodus'],
        geographic_center: { region: 'Egypt' },
        transition_to_next: null,
      },
      {
        id: 'conquest',
        name: 'Conquest',
        range_start: -1400,
        range_end: -1050,
        summary: 'Taking the promised land.',
        hex: null,
        pill: null,
        key_people: [],
        books: [],
        geographic_center: null,
        transition_to_next: null,
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

const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => ({
  ...jest.requireActual('@react-navigation/native'),
  useNavigation: () => ({ navigate: mockNavigate, goBack: jest.fn() }),
}));

import PeriodsScreen from '@/screens/PeriodsScreen';

describe('PeriodsScreen', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<PeriodsScreen />);
    }).not.toThrow();
  });

  it('shows the screen title', () => {
    const { getByText } = renderWithProviders(<PeriodsScreen />);
    expect(getByText('The Periods of the Bible')).toBeTruthy();
  });

  it('shows first 3 eras for non-premium users', () => {
    const { getByText, queryByText } = renderWithProviders(<PeriodsScreen />);
    expect(getByText('Creation')).toBeTruthy();
    expect(getByText('Patriarchs')).toBeTruthy();
    expect(getByText('Exodus')).toBeTruthy();
    // Fourth era should not be visible
    expect(queryByText('Conquest')).toBeNull();
  });

  it('shows unlock card for non-premium users', () => {
    const { getByText } = renderWithProviders(<PeriodsScreen />);
    expect(getByText('1 more eras')).toBeTruthy();
  });

  it('shows date ranges correctly', () => {
    const { getByText } = renderWithProviders(<PeriodsScreen />);
    expect(getByText('? – 2000 BC')).toBeTruthy();
    expect(getByText('2000 BC – 1500 BC')).toBeTruthy();
  });

  it('shows key people chips', () => {
    const { getByText } = renderWithProviders(<PeriodsScreen />);
    expect(getByText('adam')).toBeTruthy();
    expect(getByText('noah')).toBeTruthy();
  });
});
