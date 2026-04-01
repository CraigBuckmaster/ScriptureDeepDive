import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { DepthDots } from '@/components/DepthDots';

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
    // First 3 dots should have a gold backgroundColor (from base.gold)
    // Last 2 should have unfilled style (#444)
    const filledDots = dots.filter((d: any) => {
      const bg = Array.isArray(d.props.style)
        ? Object.assign({}, ...d.props.style.filter(Boolean)).backgroundColor
        : d.props.style?.backgroundColor;
      return bg && bg !== '#444';
    });
    expect(filledDots).toHaveLength(3);
  });

  it('returns null when total is 0', () => {
    const { toJSON } = renderWithProviders(<DepthDots explored={0} total={0} />);
    expect(toJSON()).toBeNull();
  });
});
