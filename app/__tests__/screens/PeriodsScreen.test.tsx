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

  it('shows era subtitle with count', () => {
    const { getByText } = renderWithProviders(<PeriodsScreen />);
    expect(getByText(/4 eras from/)).toBeTruthy();
  });

  it('shows first 3 eras for non-premium users', () => {
    const { getByText, queryByText } = renderWithProviders(<PeriodsScreen />);
    expect(getByText('Creation')).toBeTruthy();
    expect(getByText('Patriarchs')).toBeTruthy();
    expect(getByText('Exodus')).toBeTruthy();
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
    expect(getByText('1500 BC – 1400 BC')).toBeTruthy();
  });

  it('shows key people chips', () => {
    const { getByText } = renderWithProviders(<PeriodsScreen />);
    expect(getByText('adam')).toBeTruthy();
    expect(getByText('noah')).toBeTruthy();
    expect(getByText('abraham')).toBeTruthy();
  });

  it('shows book chips', () => {
    const { getAllByText } = renderWithProviders(<PeriodsScreen />);
    expect(getAllByText('genesis').length).toBeGreaterThan(0);
    expect(getAllByText('exodus').length).toBeGreaterThan(0);
  });

  it('shows pill badge when era has one', () => {
    const { getByText } = renderWithProviders(<PeriodsScreen />);
    expect(getByText('ORIGINS')).toBeTruthy();
    expect(getByText('LIBERATION')).toBeTruthy();
  });

  it('shows era summaries', () => {
    const { getByText } = renderWithProviders(<PeriodsScreen />);
    expect(getByText('The beginning of all things.')).toBeTruthy();
    expect(getByText('The founding fathers of Israel.')).toBeTruthy();
  });

  it('shows geographic region badges', () => {
    const { getByText } = renderWithProviders(<PeriodsScreen />);
    expect(getByText('Mesopotamia')).toBeTruthy();
    expect(getByText('Egypt')).toBeTruthy();
  });

  it('shows transition text between eras', () => {
    const { getByText } = renderWithProviders(<PeriodsScreen />);
    expect(getByText('From creation to the patriarchs...')).toBeTruthy();
  });

  it('shows loading skeleton when isLoading', () => {
    const useErasMock = require('@/hooks/useEras').useEras;
    useErasMock.mockReturnValueOnce({ eras: [], isLoading: true });

    expect(() => {
      renderWithProviders(<PeriodsScreen />);
    }).not.toThrow();
  });

  it('shows all eras for premium users', () => {
    const usePremiumMock = require('@/hooks/usePremium').usePremium;
    usePremiumMock.mockReturnValueOnce({
      isPremium: true,
      upgradeRequest: null,
      showUpgrade: jest.fn(),
      dismissUpgrade: jest.fn(),
    });

    const { getByText, queryByText } = renderWithProviders(<PeriodsScreen />);
    expect(getByText('Conquest')).toBeTruthy();
    expect(queryByText(/more eras/)).toBeNull();
  });

  it('navigates to PersonDetail when person chip pressed', () => {
    const { fireEvent } = require('@testing-library/react-native');
    const { getByText } = renderWithProviders(<PeriodsScreen />);
    fireEvent.press(getByText('adam'));
    expect(mockNavigate).toHaveBeenCalledWith('PersonDetail', { personId: 'adam' });
  });

  it('navigates to BookIntro when book chip pressed', () => {
    const { fireEvent } = require('@testing-library/react-native');
    const { getAllByText } = renderWithProviders(<PeriodsScreen />);
    fireEvent.press(getAllByText('genesis')[0]);
    expect(mockNavigate).toHaveBeenCalledWith('BookIntro', { bookId: 'genesis' });
  });

  it('shows upgrade prompt when unlock card pressed', () => {
    const { fireEvent } = require('@testing-library/react-native');
    const showUpgrade = jest.fn();
    const usePremiumMock = require('@/hooks/usePremium').usePremium;
    usePremiumMock.mockReturnValueOnce({
      isPremium: false,
      upgradeRequest: null,
      showUpgrade,
      dismissUpgrade: jest.fn(),
    });

    const { getByLabelText } = renderWithProviders(<PeriodsScreen />);
    fireEvent.press(getByLabelText('Unlock remaining eras'));
    expect(showUpgrade).toHaveBeenCalledWith('explore', 'Bible Periods');
  });
});
