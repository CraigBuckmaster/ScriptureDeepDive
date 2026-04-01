import React from 'react';
import { PlaceLabel } from '@/components/map/PlaceLabel';
import { renderWithProviders } from '../helpers/renderWithProviders';
import type { Place } from '@/types';

jest.mock('@/utils/geoMath', () => ({
  maxPriorityForZoom: (zoom: number) => (zoom >= 7 ? 3 : 1),
  labelScale: () => 1,
  labelOffset: () => ({ x: 0, y: 0 }),
}));

beforeEach(() => jest.clearAllMocks());

const makePlace = (overrides: Partial<Place> = {}): Place => ({
  id: 'jerusalem',
  ancient_name: 'Jerusalem',
  modern_name: 'Yerushalayim',
  latitude: 31.77,
  longitude: 35.23,
  type: 'city',
  priority: 1,
  label_dir: 'n',
  ...overrides,
});

describe('PlaceLabel', () => {
  it('renders the ancient name by default', () => {
    const { getByText } = renderWithProviders(
      <PlaceLabel place={makePlace()} showModern={false} zoomLevel={7} />,
    );
    expect(getByText('Jerusalem')).toBeTruthy();
  });

  it('renders the modern name when showModern is true', () => {
    const { getByText } = renderWithProviders(
      <PlaceLabel place={makePlace()} showModern={true} zoomLevel={7} />,
    );
    expect(getByText('Yerushalayim')).toBeTruthy();
  });

  it('falls back to ancient name when modern_name is null', () => {
    const { getByText } = renderWithProviders(
      <PlaceLabel
        place={makePlace({ modern_name: null })}
        showModern={true}
        zoomLevel={7}
      />,
    );
    expect(getByText('Jerusalem')).toBeTruthy();
  });

  it('returns null when priority exceeds max for zoom level', () => {
    const { toJSON } = renderWithProviders(
      <PlaceLabel place={makePlace({ priority: 5 })} showModern={false} zoomLevel={7} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('renders a type symbol for city type', () => {
    const { getByText } = renderWithProviders(
      <PlaceLabel place={makePlace({ type: 'city' })} showModern={false} zoomLevel={7} />,
    );
    expect(getByText('●')).toBeTruthy();
  });
});
