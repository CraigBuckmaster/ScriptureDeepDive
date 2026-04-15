import React from 'react';
import { fireEvent } from '@testing-library/react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import type { MapStory, Place } from '@/types';

// Import the native component directly rather than the dispatcher, since
// the dispatcher uses React.lazy() which jest's default environment can't
// resolve synchronously (requires --experimental-vm-modules). The
// dispatcher gate is covered by `MapChipDispatcher.test.tsx`.
import MapChipNative from '@/components/map/MapChipNative';

const story: MapStory = {
  id: 'exodus-journey',
  era: 'exodus',
  name: 'The Exodus',
  scripture_ref: 'Exod 12',
  chapter_link: null,
  summary: 'Israel leaves Egypt',
  places_json: '["ramesses","red-sea"]',
  regions_json: null,
  paths_json: '[{"coords":[[31,29],[33,28]],"dashed":false}]',
};

const places: Place[] = [
  {
    id: 'ramesses',
    ancient_name: 'Ramesses',
    modern_name: null,
    latitude: 30.8,
    longitude: 31.8,
    type: 'city',
    priority: 2,
    label_dir: 'n',
  },
  {
    id: 'red-sea',
    ancient_name: 'Red Sea',
    modern_name: null,
    latitude: 27.5,
    longitude: 34.0,
    type: 'water',
    priority: 1,
    label_dir: 'n',
  },
];

describe('MapChipNative', () => {
  it('fires onExpand when the expand pill is tapped', () => {
    const onExpand = jest.fn();
    const { getByLabelText } = renderWithProviders(
      <MapChipNative story={story} places={places} onExpand={onExpand} />,
    );
    fireEvent.press(getByLabelText('Expand to full map'));
    expect(onExpand).toHaveBeenCalledTimes(1);
  });

  it('renders an inline map view keyed for identification', () => {
    const { getByTestId } = renderWithProviders(
      <MapChipNative story={story} places={places} onExpand={jest.fn()} />,
    );
    expect(getByTestId('map-chip-view')).toBeTruthy();
  });

  it('labels the chip with the story name for accessibility', () => {
    const { getByLabelText } = renderWithProviders(
      <MapChipNative story={story} places={places} onExpand={jest.fn()} />,
    );
    expect(getByLabelText(/Open full map for The Exodus/)).toBeTruthy();
  });
});
