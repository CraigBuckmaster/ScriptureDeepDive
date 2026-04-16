import React from 'react';
import { NativeModules } from 'react-native';
import { renderWithProviders } from '../helpers/renderWithProviders';
import MapScreen from '@/screens/MapScreen';
import { __resetMapNativeProbeForTests } from '@/utils/isMapNativeAvailable';

const navigation: any = { navigate: jest.fn(), goBack: jest.fn() };
const route: any = { params: {}, key: 'map-1', name: 'Map' };

describe('MapScreen (dispatcher)', () => {
  const original = (NativeModules as any).MLRNModule;

  beforeEach(() => {
    __resetMapNativeProbeForTests();
  });

  afterEach(() => {
    (NativeModules as any).MLRNModule = original;
  });

  it('renders MapUnavailableCard when MapLibre native is absent', () => {
    (NativeModules as any).MLRNModule = null;
    const { getByLabelText } = renderWithProviders(
      <MapScreen route={route} navigation={navigation} />,
    );
    expect(getByLabelText('Map requires a development build')).toBeTruthy();
  });
});
