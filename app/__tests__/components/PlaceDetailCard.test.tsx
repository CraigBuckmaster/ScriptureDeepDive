import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';

jest.mock('@/db/content', () => ({
  getPeopleAtPlace: jest.fn().mockResolvedValue([]),
}));

import { PlaceDetailCard, formatCoord } from '@/components/map/PlaceDetailCard';
import type { Place, MapStory } from '@/types';

function makePlace(overrides: Partial<Place> = {}): Place {
  return {
    id: 'jerusalem',
    ancient_name: 'Jerusalem',
    modern_name: 'Yerushalayim',
    latitude: 31.77,
    longitude: 35.23,
    type: 'city',
    priority: 1,
    label_dir: 'n',
    ...overrides,
  };
}

function makeStory(overrides: Partial<MapStory> = {}): MapStory {
  return {
    id: 'davidic-kingdom',
    era: 'kingdom',
    name: 'Davidic Kingdom',
    scripture_ref: '2 Samuel 5',
    chapter_link: null,
    summary: 'David takes Jerusalem.',
    places_json: '["jerusalem"]',
    regions_json: null,
    paths_json: null,
    ...overrides,
  };
}

describe('PlaceDetailCard', () => {
  it('renders ancient and modern names', () => {
    const { getByText } = renderWithProviders(
      <PlaceDetailCard place={makePlace()} onClose={jest.fn()} />,
    );
    expect(getByText('Jerusalem')).toBeTruthy();
    expect(getByText('Yerushalayim')).toBeTruthy();
  });

  it('hides the modern name row when none is provided', () => {
    const { queryByText } = renderWithProviders(
      <PlaceDetailCard
        place={makePlace({ modern_name: null })}
        onClose={jest.fn()}
      />,
    );
    expect(queryByText('Yerushalayim')).toBeNull();
  });

  it('renders the type badge label for each known type', () => {
    const cases: Array<[Place['type'], string]> = [
      ['city', 'City'],
      ['mountain', 'Mountain'],
      ['water', 'Water'],
      ['region', 'Region'],
      ['site', 'Site'],
    ];
    for (const [type, label] of cases) {
      const { getByText, unmount } = renderWithProviders(
        <PlaceDetailCard place={makePlace({ type })} onClose={jest.fn()} />,
      );
      expect(getByText(label)).toBeTruthy();
      unmount();
    }
  });

  it('renders related story chips and invokes onStoryPress', () => {
    const onStory = jest.fn();
    const stories = [
      makeStory({ id: 's1', name: 'Story One' }),
      makeStory({ id: 's2', name: 'Story Two' }),
    ];
    const { getByText } = renderWithProviders(
      <PlaceDetailCard
        place={makePlace()}
        stories={stories}
        onClose={jest.fn()}
        onStoryPress={onStory}
      />,
    );
    expect(getByText('Story One')).toBeTruthy();
    expect(getByText('Story Two')).toBeTruthy();
    fireEvent.press(getByText('Story Two'));
    expect(onStory).toHaveBeenCalledWith(stories[1]);
  });

  it('shows the empty-state message when no stories are linked', () => {
    const { getByText } = renderWithProviders(
      <PlaceDetailCard place={makePlace()} stories={[]} onClose={jest.fn()} />,
    );
    expect(getByText(/No stories link to this place yet/)).toBeTruthy();
  });

  it('renders the coordinates footer with N/S/E/W markers', () => {
    const { getByText } = renderWithProviders(
      <PlaceDetailCard place={makePlace()} onClose={jest.fn()} />,
    );
    expect(getByText(/31\.77° N · 35\.23° E/)).toBeTruthy();
  });

  it('calls onClose when the close button is pressed', () => {
    const onClose = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <PlaceDetailCard place={makePlace()} onClose={onClose} />,
    );
    fireEvent.press(getByLabelText('Close place details'));
    expect(onClose).toHaveBeenCalledTimes(1);
  });
});

describe('formatCoord', () => {
  it('formats positive latitudes as N', () => {
    expect(formatCoord(31.77, 'lat')).toBe('31.77° N');
  });

  it('formats negative latitudes as S', () => {
    expect(formatCoord(-15.5, 'lat')).toBe('15.50° S');
  });

  it('formats positive longitudes as E', () => {
    expect(formatCoord(35.23, 'lon')).toBe('35.23° E');
  });

  it('formats negative longitudes as W', () => {
    expect(formatCoord(-100.1, 'lon')).toBe('100.10° W');
  });

  it('always uses 2 decimals', () => {
    expect(formatCoord(0, 'lat')).toBe('0.00° N');
  });
});
