/**
 * #1832 — LibrarySections extraction. The shelves must render the same
 * section data ExploreMenuScreen used to own, route presses through
 * onNavigate, and honor the jump-pill filter.
 */
import React from 'react';
import { fireEvent, render, waitFor } from '@testing-library/react-native';

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

import {
  LibrarySections,
  LIBRARY_SECTIONS,
  PREMIUM_SCREENS,
} from '@/components/study/LibrarySections';

function renderSections(overrides: Partial<React.ComponentProps<typeof LibrarySections>> = {}) {
  const onNavigate = jest.fn();
  const utils = render(
    <LibrarySections
      imageRegistry={{}}
      isPremium
      onNavigate={onNavigate}
      onDeepLink={jest.fn()}
      {...overrides}
    />,
  );
  return { onNavigate, ...utils };
}

describe('LibrarySections (#1832)', () => {
  it('exports the seven library sections with stable ids', () => {
    expect(LIBRARY_SECTIONS.map((s) => s.id)).toEqual([
      'biblical-world', 'themes', 'journeys', 'language', 'scholarly', 'life', 'deep-dive',
    ]);
    expect(PREMIUM_SCREENS.Concordance).toBe('Concordance Search');
  });

  it('renders every section label and its cards', async () => {
    const { getByText } = renderSections();
    await waitFor(() => {
      expect(getByText('The Biblical World')).toBeTruthy();
      expect(getByText('Themes & Connections')).toBeTruthy();
      expect(getByText('Language & Reference')).toBeTruthy();
      expect(getByText('Scholarly Analysis')).toBeTruthy();
      expect(getByText('Life & Faith')).toBeTruthy();
      expect(getByText('Deep Dive')).toBeTruthy();
      expect(getByText('People')).toBeTruthy();
      expect(getByText('Timeline')).toBeTruthy();
      expect(getByText('Scholars')).toBeTruthy();
      expect(getByText('Grammar')).toBeTruthy();
    });
  });

  it('routes card presses through onNavigate', async () => {
    const { getByText, onNavigate } = renderSections();
    await waitFor(() => expect(getByText('Map')).toBeTruthy());
    fireEvent.press(getByText('Map'));
    expect(onNavigate).toHaveBeenCalledWith('Map');
  });

  it('renders only the filtered section when filterSectionId is set', async () => {
    const { getByText, queryByText } = renderSections({ filterSectionId: 'deep-dive' });
    await waitFor(() => expect(getByText('Deep Dive')).toBeTruthy());
    expect(queryByText('The Biblical World')).toBeNull();
    expect(queryByText('Scholarly Analysis')).toBeNull();
  });
});
