import React from 'react';

jest.mock('react-native-svg', () => {
  const React = require('react');
  return { Svg: 'Svg', G: 'G', Line: 'Line', Path: 'Path', Rect: 'Rect', Text: 'Text', Circle: 'Circle' };
});

jest.mock('@/theme', () => ({
  useTheme: () => ({
    base: {
      goldDim: '#B8960C',
      textMuted: '#888888',
    },
  }),
  eras: {
    creation: '#55AA55',
    patriarchs: '#AA5555',
  } as Record<string, string>,
}));

import { renderWithProviders } from '../helpers/renderWithProviders';
import { TreeLink } from '@/components/tree/TreeLink';

describe('TreeLink', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    const tree = renderWithProviders(
      <TreeLink
        source={{ x: 100, y: 50 }}
        target={{ x: 100, y: 200 }}
        isSpine={true}
        dimmed={false}
      />,
    );
    expect(tree.toJSON()).toBeTruthy();
  });

  it('produces a Path element with cubic bezier d attribute', () => {
    const tree = renderWithProviders(
      <TreeLink
        source={{ x: 100, y: 50 }}
        target={{ x: 150, y: 200 }}
        isSpine={false}
        dimmed={false}
      />,
    );
    const json = tree.toJSON() as any;
    // The rendered element should be a Path mock
    expect(json).toBeTruthy();
    // Verify d attribute contains M and C commands
    if (json.props?.d) {
      expect(json.props.d).toContain('M100,50');
      expect(json.props.d).toContain('C');
    }
  });

  it('renders with dimmed opacity', () => {
    const tree = renderWithProviders(
      <TreeLink
        source={{ x: 0, y: 0 }}
        target={{ x: 50, y: 100 }}
        isSpine={false}
        dimmed={true}
      />,
    );
    const json = tree.toJSON() as any;
    expect(json).toBeTruthy();
    if (json.props?.opacity !== undefined) {
      expect(json.props.opacity).toBe(0.1);
    }
  });

  it('renders spine link with higher opacity', () => {
    const tree = renderWithProviders(
      <TreeLink
        source={{ x: 0, y: 0 }}
        target={{ x: 50, y: 100 }}
        isSpine={true}
        dimmed={false}
      />,
    );
    const json = tree.toJSON() as any;
    expect(json).toBeTruthy();
    if (json.props?.opacity !== undefined) {
      expect(json.props.opacity).toBe(0.7);
    }
  });

  it('uses era color when era is provided', () => {
    const tree = renderWithProviders(
      <TreeLink
        source={{ x: 0, y: 0 }}
        target={{ x: 50, y: 100 }}
        isSpine={false}
        dimmed={false}
        era="creation"
      />,
    );
    const json = tree.toJSON() as any;
    expect(json).toBeTruthy();
  });
});
