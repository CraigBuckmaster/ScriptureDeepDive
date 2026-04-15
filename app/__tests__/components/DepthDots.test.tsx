import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { DepthDots } from '@/components/DepthDots';
import { buildPalette } from '@/theme/palettes';

const { base } = buildPalette('dark');

describe('DepthDots', () => {
  it('renders correct number of dots', () => {
    const { toJSON } = renderWithProviders(<DepthDots explored={2} total={5} />);
    const tree = toJSON();
    // The container View should have `total` child View elements (dots)
    expect(tree).not.toBeNull();
    expect(tree!.children).toHaveLength(5);
  });

  it('filled dots match explored count', () => {
    const { toJSON } = renderWithProviders(<DepthDots explored={3} total={5} />);
    const tree = toJSON();
    const dots = tree!.children as any[];
    // Filled dots use base.gold; unfilled dots use base.border
    const filledDots = dots.filter((d: any) => {
      const bg = Array.isArray(d.props.style)
        ? Object.assign({}, ...d.props.style.filter(Boolean)).backgroundColor
        : d.props.style?.backgroundColor;
      return bg === base.gold;
    });
    expect(filledDots).toHaveLength(3);
  });

  it('unfilled dots match unexlored count', () => {
    const { toJSON } = renderWithProviders(<DepthDots explored={3} total={5} />);
    const tree = toJSON();
    const dots = tree!.children as any[];
    const unfilledDots = dots.filter((d: any) => {
      const bg = Array.isArray(d.props.style)
        ? Object.assign({}, ...d.props.style.filter(Boolean)).backgroundColor
        : d.props.style?.backgroundColor;
      return bg === base.border;
    });
    expect(unfilledDots).toHaveLength(2);
  });

  it('returns null when total is 0', () => {
    const { toJSON } = renderWithProviders(<DepthDots explored={0} total={0} />);
    expect(toJSON()).toBeNull();
  });
});
