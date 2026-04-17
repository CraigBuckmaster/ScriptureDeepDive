import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';

// Force the MapLibre-native probe to report unavailable so the dispatcher
// renders MapUnavailableCard. The v11 probe no longer consults
// NativeModules.MLRNModule; it now inspects the package's JS export
// surface. The cleanest way to pin the probe for this test is to mock
// the utility module directly.
jest.mock('@/utils/isMapNativeAvailable', () => ({
  isMapNativeAvailable: () => false,
  getMapUnavailableReason: () => 'Cannot find module \'@maplibre/maplibre-react-native\'',
  __resetMapNativeProbeForTests: jest.fn(),
  ensureMapLibreInit: jest.fn(),
}));

import MapScreen from '@/screens/MapScreen';

const navigation: any = { navigate: jest.fn(), goBack: jest.fn() };
const route: any = { params: {}, key: 'map-1', name: 'Map' };

describe('MapScreen (dispatcher)', () => {
  it('renders MapUnavailableCard when MapLibre native is absent', () => {
    // `Cannot find module` is the Expo Go fingerprint — the card uses
    // the "Map unavailable in Expo Go" heading for that case.
    const { getByLabelText } = renderWithProviders(
      <MapScreen route={route} navigation={navigation} />,
    );
    expect(getByLabelText('Map unavailable in Expo Go')).toBeTruthy();
  });
});
