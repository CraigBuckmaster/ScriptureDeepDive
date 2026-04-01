import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { MarriageBarSvg } from '@/components/tree/MarriageBarSvg';

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

const makeBar = (overrides?: Partial<{ x1: number; x2: number; y: number; midX: number; dimmed: boolean }>) => ({
  x1: 100,
  x2: 200,
  y: 50,
  midX: 150,
  dimmed: false,
  ...overrides,
});

describe('MarriageBarSvg', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    const { toJSON } = renderWithProviders(<MarriageBarSvg bar={makeBar()} />);
    expect(toJSON()).not.toBeNull();
  });

  it('renders a G group with three Line elements', () => {
    const { UNSAFE_getAllByType } = renderWithProviders(<MarriageBarSvg bar={makeBar()} />);
    // G wrapper + 3 lines (horizontal bar + 2 ticks)
    const lines = UNSAFE_getAllByType('Line' as any);
    expect(lines).toHaveLength(3);
  });

  it('applies reduced opacity when dimmed', () => {
    const { UNSAFE_getByType } = renderWithProviders(<MarriageBarSvg bar={makeBar({ dimmed: true })} />);
    const g = UNSAFE_getByType('G' as any);
    expect(g.props.opacity).toBe(0.1);
  });

  it('applies normal opacity when not dimmed', () => {
    const { UNSAFE_getByType } = renderWithProviders(<MarriageBarSvg bar={makeBar({ dimmed: false })} />);
    const g = UNSAFE_getByType('G' as any);
    expect(g.props.opacity).toBe(0.5);
  });
});
