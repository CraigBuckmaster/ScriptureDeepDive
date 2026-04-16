import React from 'react';
import { NativeModules } from 'react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { MapChip } from '@/components/map/MapChip';
import { __resetMapNativeProbeForTests } from '@/utils/isMapNativeAvailable';
import type { MapStory, Place } from '@/types';

const story: MapStory = {
  id: 's1',
  era: 'patriarch',
  name: 'Abraham Journey',
  scripture_ref: null,
  chapter_link: null,
  summary: '',
  places_json: null,
  regions_json: null,
  paths_json: null,
};

describe('MapChip (dispatcher)', () => {
  const original = (NativeModules as any).MLRNModule;

  beforeEach(() => {
    __resetMapNativeProbeForTests();
  });

  afterEach(() => {
    (NativeModules as any).MLRNModule = original;
  });

  it('renders null when the MapLibre native module is absent (Expo Go)', () => {
    (NativeModules as any).MLRNModule = null;
    const { toJSON } = renderWithProviders(
      <MapChip story={story} places={[] as Place[]} onExpand={jest.fn()} />,
    );
    expect(toJSON()).toBeNull();
  });
});
