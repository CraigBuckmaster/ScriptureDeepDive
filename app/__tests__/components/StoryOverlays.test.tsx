import React from 'react';
import { StoryOverlays } from '@/components/map/StoryOverlays';
import { renderWithProviders } from '../helpers/renderWithProviders';
import type { MapStory } from '@/types';

jest.mock('@/utils/geoMath', () => ({
  toLatLng: ([lon, lat]: number[]) => ({ latitude: lat, longitude: lon }),
  computeBearing: () => 45,
  midpoint: (
    a: { latitude: number; longitude: number },
    b: { latitude: number; longitude: number },
  ) => ({
    latitude: (a.latitude + b.latitude) / 2,
    longitude: (a.longitude + b.longitude) / 2,
  }),
  pathDistance: (coords: { latitude: number; longitude: number }[]) =>
    // Simple stub: 100 miles per leg so the label renders deterministically.
    Math.max(0, coords.length - 1) * 100,
}));

beforeEach(() => jest.clearAllMocks());

const baseStory: MapStory = {
  id: 's1',
  era: 'patriarchs',
  name: 'Abraham Journey',
  scripture_ref: 'Genesis 12',
  chapter_link: null,
  summary: 'A journey from Ur to Canaan',
  places_json: null,
  regions_json: null,
  paths_json: null,
};

describe('StoryOverlays', () => {
  it('renders nothing when story has no regions or paths', () => {
    const { toJSON } = renderWithProviders(
      <StoryOverlays story={baseStory} zoomLevel={7} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('renders polygon elements for regions', () => {
    const story: MapStory = {
      ...baseStory,
      regions_json: JSON.stringify([
        { coords: [[35, 31], [36, 31], [36, 32], [35, 32]], color: '#ff0000', label: 'Canaan' },
      ]),
    };
    const tree = renderWithProviders(
      <StoryOverlays story={story} zoomLevel={7} />,
    );
    // The Polygon mock renders as a string tag; check that the tree is non-null
    expect(tree.toJSON()).not.toBeNull();
  });

  it('renders polyline elements for paths', () => {
    const story: MapStory = {
      ...baseStory,
      paths_json: JSON.stringify([
        { coords: [[35, 31], [36, 32]], dashed: false },
      ]),
    };
    const tree = renderWithProviders(
      <StoryOverlays story={story} zoomLevel={7} />,
    );
    expect(tree.toJSON()).not.toBeNull();
  });

  it('renders both regions and paths together', () => {
    const story: MapStory = {
      ...baseStory,
      regions_json: JSON.stringify([
        { coords: [[35, 31], [36, 31], [36, 32], [35, 32]], color: '#ff0000', label: 'Canaan' },
      ]),
      paths_json: JSON.stringify([
        { coords: [[35, 31], [36, 32]], dashed: true },
      ]),
    };
    const tree = renderWithProviders(
      <StoryOverlays story={story} zoomLevel={7} />,
    );
    const json = tree.toJSON();
    expect(json).not.toBeNull();
    // Should have multiple children (polygon + polyline fragment)
    expect(Array.isArray(json)).toBe(true);
  });

  it('handles invalid JSON gracefully', () => {
    const story: MapStory = {
      ...baseStory,
      regions_json: '{bad json',
      paths_json: '{bad json',
    };
    const { toJSON } = renderWithProviders(
      <StoryOverlays story={story} zoomLevel={7} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('renders a distance label at zoom >= 5 for paths with >= 2 points', () => {
    const story: MapStory = {
      ...baseStory,
      paths_json: JSON.stringify([
        { coords: [[35, 31], [36, 32]], dashed: false },
      ]),
    };
    const { getByLabelText } = renderWithProviders(
      <StoryOverlays story={story} zoomLevel={6} />,
    );
    // Stub returns 100 miles per leg (1 leg → 100 mi).
    expect(getByLabelText('Distance: about 100 miles')).toBeTruthy();
  });

  it('does not render a distance label below the min zoom', () => {
    const story: MapStory = {
      ...baseStory,
      paths_json: JSON.stringify([
        { coords: [[35, 31], [36, 32]], dashed: false },
      ]),
    };
    const { queryByLabelText } = renderWithProviders(
      <StoryOverlays story={story} zoomLevel={4} />,
    );
    expect(queryByLabelText(/Distance: about/)).toBeNull();
  });
});
