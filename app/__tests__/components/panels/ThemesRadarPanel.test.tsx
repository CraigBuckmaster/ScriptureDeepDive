/**
 * ThemesRadarPanel.test.tsx — Tests for the themes radar visualization.
 */

import React from 'react';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { ThemesRadarPanel } from '@/components/panels/ThemesRadarPanel';

jest.mock('react-native-svg', () => {
  const React = require('react');
  return {
    __esModule: true,
    default: 'Svg',
    Svg: 'Svg',
    G: 'G',
    Line: 'Line',
    Path: 'Path',
    Rect: 'Rect',
    Text: (props: any) => React.createElement('Text', props, props.children),
    Circle: 'Circle',
    Polygon: 'Polygon',
    Polyline: 'Polyline',
  };
});

const data = {
  scores: [
    { name: 'Creation', value: 9 },
    { name: 'Sovereignty', value: 7 },
    { name: 'Covenant', value: 5 },
    { name: 'Redemption', value: 3 },
  ],
  note: 'Themes are scored on a 1-10 scale.',
};

describe('ThemesRadarPanel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    const { toJSON } = renderWithProviders(<ThemesRadarPanel data={data} />);
    expect(toJSON()).toBeTruthy();
  });

  it('renders the note text', () => {
    const { getByText } = renderWithProviders(<ThemesRadarPanel data={data} />);
    expect(getByText('Themes are scored on a 1-10 scale.')).toBeTruthy();
  });

  it('returns null when scores are empty', () => {
    const { toJSON } = renderWithProviders(
      <ThemesRadarPanel data={{ scores: [] }} />,
    );
    expect(toJSON()).toBeNull();
  });

  it('returns null when data is null-ish', () => {
    const { toJSON } = renderWithProviders(
      <ThemesRadarPanel data={null as any} />,
    );
    expect(toJSON()).toBeNull();
  });
});
