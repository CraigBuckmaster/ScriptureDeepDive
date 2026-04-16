import React from 'react';
import { render, fireEvent, waitFor } from '@testing-library/react-native';

jest.mock('@/db/content', () => ({
  getAllProphecyChains: jest.fn().mockResolvedValue([]),
  getDebateTopics: jest.fn().mockResolvedValue([]),
  getAllWordStudies: jest.fn().mockResolvedValue([]),
  getLifeTopicCategories: jest.fn().mockResolvedValue([]),
  getPeopleWithJourneys: jest.fn().mockResolvedValue([]),
}));

jest.mock('@/hooks/useJourneyBrowse', () => ({
  useJourneyBrowse: jest.fn().mockReturnValue({
    allJourneys: [],
    personJourneys: [],
    conceptJourneys: [],
    thematicJourneys: [],
    lensIds: [],
    isLoading: false,
  }),
}));

jest.mock('@/hooks/useProphecyChains', () => ({
  useProphecyChains: jest.fn().mockReturnValue({ chains: [], isLoading: false }),
}));

jest.mock('@/db/user', () => ({
  getReadingStats: jest.fn().mockResolvedValue({ totalChapters: 10 }),
  getPreference: jest.fn().mockResolvedValue(null),
  setPreference: jest.fn().mockResolvedValue(undefined),
}));

jest.mock('@/hooks/useExploreRecommendations', () => ({
  useExploreRecommendations: jest.fn().mockReturnValue({ recommendations: [], bookName: null }),
}));

jest.mock('@/hooks/useExploreImages', () => ({
  useExploreImages: jest.fn().mockReturnValue({}),
}));

jest.mock('@/hooks/usePremium', () => ({
  usePremium: jest.fn().mockReturnValue({
    isPremium: true,
    upgradeRequest: null,
    showUpgrade: jest.fn(),
    dismissUpgrade: jest.fn(),
  }),
}));

import ExploreMenuScreen from '@/screens/ExploreMenuScreen';

describe('ExploreMenuScreen', () => {
  it('renders the Explore heading', async () => {
    const { getByText } = render(<ExploreMenuScreen />);
    await waitFor(() => expect(getByText('Explore')).toBeTruthy());
  });

  it('renders hero feature cards', async () => {
    const { getByText } = render(<ExploreMenuScreen />);
    await waitFor(() => {
      expect(getByText('People')).toBeTruthy();
      expect(getByText('Timeline')).toBeTruthy();
    });
  });

  it('renders feature cards across the section layouts', async () => {
    const { getByText } = render(<ExploreMenuScreen />);
    await waitFor(() => {
      expect(getByText('Map')).toBeTruthy();
      // Language split row contains Concordance + Dictionary (Word Studies moves to the preview list)
      expect(getByText('Concordance')).toBeTruthy();
      // Scholarly split row contains Scholars + Difficult Passages
      expect(getByText('Scholars')).toBeTruthy();
      expect(getByText('Difficult Passages')).toBeTruthy();
    });
  });

  it('renders the varied section headers', async () => {
    const { getAllByText } = render(<ExploreMenuScreen />);
    // Each section header appears twice: once in the jump-pill bar and once
    // above the section itself — so we expect at least two matches.
    await waitFor(() => {
      expect(getAllByText('Themes & Connections').length).toBeGreaterThanOrEqual(2);
      expect(getAllByText('Language & Reference').length).toBeGreaterThanOrEqual(2);
      expect(getAllByText('Life & Faith').length).toBeGreaterThanOrEqual(2);
      expect(getAllByText('Deep Dive').length).toBeGreaterThanOrEqual(2);
    });
  });

  it('navigates when a card is pressed', async () => {
    const { getByText } = render(<ExploreMenuScreen />);
    await waitFor(() => expect(getByText('Map')).toBeTruthy());
    fireEvent.press(getByText('Map'));
  });
});
