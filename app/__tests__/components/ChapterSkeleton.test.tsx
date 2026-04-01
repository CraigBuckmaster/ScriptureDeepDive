import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { ChapterSkeleton } from '@/components/ChapterSkeleton';

describe('ChapterSkeleton', () => {
  it('renders without crashing', () => {
    const { toJSON } = renderWithProviders(<ChapterSkeleton />);
    expect(toJSON()).not.toBeNull();
  });

  it('renders multiple skeleton sections', () => {
    const { toJSON } = renderWithProviders(<ChapterSkeleton />);
    const tree = toJSON();
    // Container should have children: header, section1, buttonRow, section2
    expect(tree!.children!.length).toBeGreaterThanOrEqual(4);
  });

  it('renders placeholder bars for loading content', () => {
    const { toJSON } = renderWithProviders(<ChapterSkeleton />);
    const tree = toJSON();
    // Should render a tree of nested Views (skeleton bars)
    expect(tree).toBeTruthy();
    expect(tree!.type).toBe('View');
  });
});
