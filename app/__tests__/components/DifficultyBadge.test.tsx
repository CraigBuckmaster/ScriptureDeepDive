import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { DifficultyBadge } from '@/components/DifficultyBadge';

describe('DifficultyBadge', () => {
  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<DifficultyBadge level={3} />);
    }).not.toThrow();
  });

  it('renders correct number of dots for level 1', () => {
    const { toJSON } = renderWithProviders(<DifficultyBadge level={1} />);
    const json = toJSON() as any;
    // The row view contains 1 dot
    expect(json.children).toHaveLength(1);
  });

  it('renders correct number of dots for level 5', () => {
    const { toJSON } = renderWithProviders(<DifficultyBadge level={5} />);
    const json = toJSON() as any;
    expect(json.children).toHaveLength(5);
  });

  it('renders correct number of dots for level 3', () => {
    const { toJSON } = renderWithProviders(<DifficultyBadge level={3} />);
    const json = toJSON() as any;
    expect(json.children).toHaveLength(3);
  });
});
