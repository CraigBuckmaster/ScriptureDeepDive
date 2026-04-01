import React from 'react';
import { waitFor } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import ScholarBioScreen from '@/screens/ScholarBioScreen';

// ── Override useRoute to supply params ───────────────────────────
jest.mock('@react-navigation/native', () => {
  const actual = jest.requireActual('@react-navigation/native');
  return {
    ...actual,
    useNavigation: () => ({ navigate: jest.fn(), goBack: jest.fn(), push: jest.fn(), setOptions: jest.fn(), setParams: jest.fn() }),
    useRoute: () => ({ params: { scholarId: 'scholar-1' }, key: 'ScholarBio-1', name: 'ScholarBio' }),
    useScrollToTop: jest.fn(),
    useFocusEffect: (cb: () => void) => cb(),
  };
});

// ── Mock child components ────────────────────────────────────────
jest.mock('@/components/ScreenHeader', () => ({
  ScreenHeader: ({ title, subtitle }: { title: string; subtitle?: string }) => {
    const React = require('react');
    const { View, Text } = require('react-native');
    return React.createElement(
      View,
      {},
      React.createElement(Text, {}, title),
      subtitle ? React.createElement(Text, {}, subtitle) : null,
    );
  },
}));

jest.mock('@/components/LoadingSkeleton', () => ({
  LoadingSkeleton: () => {
    const React = require('react');
    const { Text } = require('react-native');
    return React.createElement(Text, {}, 'Loading...');
  },
}));

// ── Mock DB functions ────────────────────────────────────────────
const mockGetScholar = jest.fn();
const mockGetAllScholars = jest.fn();

jest.mock('@/db/content', () => ({
  getScholar: (...args: unknown[]) => mockGetScholar(...args),
  getAllScholars: (...args: unknown[]) => mockGetAllScholars(...args),
}));

const sampleScholar = {
  id: 'scholar-1',
  name: 'N.T. Wright',
  label: 'N.T. Wright',
  color: '#4488cc',
  tradition: 'Anglican',
  scope_json: '["romans","corinthians","philippians"]',
  bio_json: JSON.stringify({
    eyebrow: 'Bishop, Scholar, Author',
    sections: [
      { title: 'Background', body: 'Former Bishop of Durham and leading New Testament scholar.' },
      { title: 'Key Works', body: 'The New Testament and the People of God, Paul and the Faithfulness of God.' },
    ],
  }),
};

beforeEach(() => {
  jest.clearAllMocks();
  mockGetScholar.mockResolvedValue(sampleScholar);
  mockGetAllScholars.mockResolvedValue([
    sampleScholar,
    { id: 'scholar-2', name: 'Michael Heiser', label: 'Heiser', color: null, tradition: 'Evangelical', scope_json: '[]', bio_json: '{}' },
  ]);
});

describe('ScholarBioScreen', () => {
  it('renders scholar name and tradition', async () => {
    const { getByText } = renderWithProviders(<ScholarBioScreen />);
    await waitFor(() => {
      expect(getByText('N.T. Wright')).toBeTruthy();
    });
    expect(getByText('Anglican')).toBeTruthy();
  });

  it('renders bio sections', async () => {
    const { getByText } = renderWithProviders(<ScholarBioScreen />);
    await waitFor(() => {
      expect(getByText('Background')).toBeTruthy();
    });
    expect(getByText(/Former Bishop of Durham/)).toBeTruthy();
    expect(getByText('Key Works')).toBeTruthy();
  });

  it('renders scope books in Appears In section', async () => {
    const { getByText } = renderWithProviders(<ScholarBioScreen />);
    await waitFor(() => {
      expect(getByText('Appears In')).toBeTruthy();
    });
    expect(getByText('romans')).toBeTruthy();
    expect(getByText('corinthians')).toBeTruthy();
    expect(getByText('philippians')).toBeTruthy();
  });

  it('shows loading skeleton when scholar is null', async () => {
    mockGetScholar.mockResolvedValue(null);
    const { getByText } = renderWithProviders(<ScholarBioScreen />);
    // The LoadingSkeleton mock renders "Loading..."
    expect(getByText('Loading...')).toBeTruthy();
  });
});
