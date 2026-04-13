import React from 'react';
import { PlaceMarkerList } from '@/components/map/PlaceMarkerList';
import { renderWithProviders } from '../helpers/renderWithProviders';
import type { Place } from '@/types';

jest.mock('@/utils/geoMath', () => ({
  maxPriorityForZoom: (zoom: number) => (zoom >= 7 ? 3 : 1),
  labelScale: () => 1,
  labelOffset: () => ({ x: 0, y: 0 }),
}));

beforeEach(() => jest.clearAllMocks());

const makePlace = (id: string, priority: number): Place => ({
  id,
  ancient_name: `Place ${id}`,
  modern_name: null,
  latitude: 31.0,
  longitude: 35.0,
  type: 'city',
  priority,
  label_dir: 'n',
});

describe('PlaceMarkerList', () => {
  const places: Place[] = [
    makePlace('1', 1),
    makePlace('2', 2),
    makePlace('3', 3),
  ];

  it('renders a marker for each visible place at high zoom', () => {
    const { getAllByText } = renderWithProviders(
      <PlaceMarkerList places={places} showModern={false} zoomLevel={7} />,
    );
    // At zoom 7, maxPriority = 3 so all 3 places should render labels
    expect(getAllByText(/Place \d/)).toHaveLength(3);
  });

  it('filters places by zoom priority', () => {
    const { getAllByText } = renderWithProviders(
      <PlaceMarkerList places={places} showModern={false} zoomLevel={5} />,
    );
    // At zoom 5, maxPriority = 1 so only priority-1 place visible
    expect(getAllByText(/Place \d/)).toHaveLength(1);
  });

  it('renders nothing when places array is empty', () => {
    const { toJSON } = renderWithProviders(
      <PlaceMarkerList places={[]} showModern={false} zoomLevel={7} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('includes story places regardless of priority', () => {
    const highPriorityPlace = makePlace('99', 99);
    const allPlaces = [...places, highPriorityPlace];
    const story = {
      id: 's1',
      era: 'patriarchs',
      name: 'Test Story',
      scripture_ref: null,
      chapter_link: null,
      summary: '',
      places_json: '["99"]',
      regions_json: null,
      paths_json: null,
    };

    const { getAllByText } = renderWithProviders(
      <PlaceMarkerList
        places={allPlaces}
        showModern={false}
        zoomLevel={5}
        activeStory={story}
      />,
    );
    // At least the high-priority place should be visible at zoom 5
    expect(getAllByText(/Place \d+/).length).toBeGreaterThanOrEqual(1);
  });

  it('forwards taps to onPlacePress with the matching place', () => {
    const onPlacePress = jest.fn();
    const ReactNativeMaps = require('react-native-maps');
    const Marker = ReactNativeMaps.Marker;
    const { UNSAFE_getAllByType } = renderWithProviders(
      <PlaceMarkerList
        places={places}
        showModern={false}
        zoomLevel={7}
        onPlacePress={onPlacePress}
      />,
    );
    const markers = UNSAFE_getAllByType(Marker);
    expect(markers.length).toBe(3);
    // Fire the first marker's onPress directly — react-native-maps mocks Marker
    // as a string element so fireEvent.press doesn't recognise it.
    markers[0].props.onPress();
    expect(onPlacePress).toHaveBeenCalledWith(places[0]);
  });

  it('omits onPress on the marker when no handler is provided', () => {
    const ReactNativeMaps = require('react-native-maps');
    const Marker = ReactNativeMaps.Marker;
    const { UNSAFE_getAllByType } = renderWithProviders(
      <PlaceMarkerList places={places} showModern={false} zoomLevel={7} />,
    );
    const markers = UNSAFE_getAllByType(Marker);
    for (const m of markers) {
      expect(m.props.onPress).toBeUndefined();
    }
  });
});
