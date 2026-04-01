import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { LoadingSkeleton } from '@/components/LoadingSkeleton';

describe('LoadingSkeleton', () => {
  it('renders without crashing', () => {
    const { toJSON } = renderWithProviders(<LoadingSkeleton />);
    expect(toJSON()).not.toBeNull();
  });

  it('renders default 3 lines', () => {
    const { toJSON } = renderWithProviders(<LoadingSkeleton />);
    const tree = toJSON();
    expect(tree!.children).toHaveLength(3);
  });

  it('renders custom number of lines', () => {
    const { toJSON } = renderWithProviders(<LoadingSkeleton lines={5} />);
    const tree = toJSON();
    expect(tree!.children).toHaveLength(5);
  });

  it('last line is narrower (60% width)', () => {
    const { toJSON } = renderWithProviders(<LoadingSkeleton lines={3} />);
    const tree = toJSON();
    const children = tree!.children as any[];
    const lastChild = children[children.length - 1];
    const style = Array.isArray(lastChild.props.style)
      ? Object.assign({}, ...lastChild.props.style.filter(Boolean))
      : lastChild.props.style;
    expect(style.width).toBe('60%');
  });
});
