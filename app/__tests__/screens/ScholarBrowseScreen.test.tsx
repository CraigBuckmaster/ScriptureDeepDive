import React from 'react';
import { fireEvent, waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import ScholarBrowseScreen from '@/screens/ScholarBrowseScreen';

// ── Override useNavigation with a trackable mock ─────────────────
const mockNavigate = jest.fn();
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({
      navigate: mockNavigate,
      goBack: jest.fn(),
      push: jest.fn(),
      setOptions: jest.fn(),
    }),
    useRoute: () => ({ params: {} }),
    useScrollToTop: jest.fn(),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

// ── Mock child components ────────────────────────────────────────
jest.mock('@/components/ScreenHeader', () => ({
  ScreenHeader: ({ title }: { title: string }) => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, {}, title);
  },
}));

jest.mock('@/components/SearchInput', () => ({
  SearchInput: () => null,
}));

jest.mock('@/components/LoadingSkeleton', () => ({
  LoadingSkeleton: () => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, {}, 'Loading...');
  },
}));

// ── Mock hook ────────────────────────────────────────────────────
const mockUseScholars = jest.fn();
jest.mock('@/hooks/useScholars', () => ({
  useScholars: (...args: unknown[]) => mockUseScholars(...args),
}));

const sampleScholars = [
  { id: 'scholar-1', name: 'N.T. Wright', tradition: 'Anglican', scope_json: '["romans","corinthians"]' },
  { id: 'scholar-2', name: 'Michael Heiser', tradition: 'Evangelical', scope_json: '["genesis","psalms","daniel"]' },
  { id: 'scholar-3', name: 'Amy-Jill Levine', tradition: 'Jewish', scope_json: '["matthew","luke"]' },
];

beforeEach(() => {
  mockNavigate.mockClear();
  jest.clearAllMocks();
  mockUseScholars.mockReturnValue({
    scholars: sampleScholars,
    isLoading: false,
  });
});

describe('ScholarBrowseScreen', () => {
  it('renders the Scholars header', () => {
    const { getByText } = renderWithProviders(<ScholarBrowseScreen />);
    expect(getByText('Scholars')).toBeTruthy();
  });

  it('renders scholar list', () => {
    const { getByText } = renderWithProviders(<ScholarBrowseScreen />);
    expect(getByText('N.T. Wright')).toBeTruthy();
    expect(getByText('Michael Heiser')).toBeTruthy();
    expect(getByText('Amy-Jill Levine')).toBeTruthy();
  });

  it('renders tradition filter tabs', () => {
    const { getAllByText } = renderWithProviders(<ScholarBrowseScreen />);
    // "All" is the default filter; tradition names appear both on cards and filter tabs
    expect(getAllByText('All').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('Anglican').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('Evangelical').length).toBeGreaterThanOrEqual(1);
    expect(getAllByText('Jewish').length).toBeGreaterThanOrEqual(1);
  });

  it('navigates to scholar bio on tap', () => {
    const { getByText } = renderWithProviders(<ScholarBrowseScreen />);
    fireEvent.press(getByText('N.T. Wright'));
    expect(mockNavigate).toHaveBeenCalledWith('ScholarBio', { scholarId: 'scholar-1' });
  });
});
