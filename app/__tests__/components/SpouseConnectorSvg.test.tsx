import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { SpouseConnectorSvg } from '@/components/tree/SpouseConnectorSvg';

jest.mock('react-native-svg', () => {
  const React = require('react');
  return {
    Svg: 'Svg',
    G: 'G',
    Line: 'Line',
    Path: 'Path',
    Rect: 'Rect',
    Text: (props: any) => React.createElement('Text', props, props.children),
    Circle: 'Circle',
  };
});

const makeConnector = (overrides?: Partial<{ x: number; yTop: number; yBottom: number; dimmed: boolean }>) => ({
  x: 150,
  yTop: 50,
  yBottom: 200,
  dimmed: false,
  ...overrides,
});

describe('SpouseConnectorSvg', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    const { toJSON } = renderWithProviders(<SpouseConnectorSvg connector={makeConnector()} />);
    expect(toJSON()).not.toBeNull();
  });

  it('renders a Line element with correct coordinates', () => {
    const { UNSAFE_getByType } = renderWithProviders(
      <SpouseConnectorSvg connector={makeConnector({ x: 100, yTop: 10, yBottom: 90 })} />,
    );
    const line = UNSAFE_getByType('Line' as any);
    expect(line.props.x1).toBe(100);
    expect(line.props.y1).toBe(10);
    expect(line.props.y2).toBe(90);
  });

  it('applies reduced opacity when dimmed', () => {
    const { UNSAFE_getByType } = renderWithProviders(
      <SpouseConnectorSvg connector={makeConnector({ dimmed: true })} />,
    );
    const line = UNSAFE_getByType('Line' as any);
    expect(line.props.opacity).toBe(0.1);
  });

  it('applies normal opacity when not dimmed', () => {
    const { UNSAFE_getByType } = renderWithProviders(
      <SpouseConnectorSvg connector={makeConnector({ dimmed: false })} />,
    );
    const line = UNSAFE_getByType('Line' as any);
    expect(line.props.opacity).toBe(0.5);
  });
});
