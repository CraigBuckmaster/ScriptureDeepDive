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

const makeBar = (overrides?: Partial<{ x1: number; x2: number; y: number; midX: number; dimmed: boolean; partnerId: string; spouseId: string }>) => ({
  x1: 100,
  x2: 200,
  y: 50,
  midX: 150,
  dimmed: false,
  partnerId: 'abraham',
  spouseId: 'sarah',
  ...overrides,
});

describe('MarriageBarSvg', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders without crashing', () => {
    const { toJSON } = renderWithProviders(<MarriageBarSvg bar={makeBar()} />);
    expect(toJSON()).not.toBeNull();
  });

  it('renders glow line, main line, and two ring circles', () => {
    const { UNSAFE_getAllByType } = renderWithProviders(<MarriageBarSvg bar={makeBar()} />);
    // 2 Lines (glow + main bar) + 2 Circles (interlocking rings)
    const lines = UNSAFE_getAllByType('Line' as any);
    expect(lines).toHaveLength(2);
    const circles = UNSAFE_getAllByType('Circle' as any);
    expect(circles).toHaveLength(2);
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
