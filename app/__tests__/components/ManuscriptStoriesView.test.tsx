/**
 * Tests for ManuscriptStoriesView inline display.
 *
 * Bug: Evidence, consensus, and significance were hidden behind a
 * dropdown chevron toggle that users didn't notice.
 * Fix: Removed expand/collapse — all content is always visible.
 */

import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { ManuscriptStoriesView } from '@/components/panels/ManuscriptStoriesView';

const mockStories = [
  {
    title: 'The Ending of Mark',
    passage: 'Mark 16:9-20',
    summary: 'The longer ending is absent from the earliest manuscripts.',
    evidence: [
      { manuscript: 'Codex Sinaiticus', reading: 'Ends at 16:8' },
      { manuscript: 'Codex Vaticanus', reading: 'Ends at 16:8' },
    ],
    consensus: 'Most scholars consider the longer ending secondary.',
    significance: 'This affects our understanding of Mark\'s intended conclusion.',
  },
];

describe('ManuscriptStoriesView', () => {
  it('renders without crash', () => {
    expect(() => {
      renderWithProviders(<ManuscriptStoriesView stories={mockStories} />);
    }).not.toThrow();
  });

  it('returns null for empty stories array', () => {
    const { toJSON } = renderWithProviders(<ManuscriptStoriesView stories={[]} />);
    expect(toJSON()).toBeNull();
  });

  it('shows title and passage', () => {
    const { getByText } = renderWithProviders(
      <ManuscriptStoriesView stories={mockStories} />
    );
    expect(getByText('The Ending of Mark')).toBeTruthy();
    expect(getByText('Mark 16:9-20')).toBeTruthy();
  });

  it('shows summary without needing to expand', () => {
    const { getByText } = renderWithProviders(
      <ManuscriptStoriesView stories={mockStories} />
    );
    expect(getByText(mockStories[0].summary)).toBeTruthy();
  });

  it('shows evidence table without needing to expand', () => {
    const { getByText } = renderWithProviders(
      <ManuscriptStoriesView stories={mockStories} />
    );
    expect(getByText('Manuscript Evidence')).toBeTruthy();
    expect(getByText('Codex Sinaiticus')).toBeTruthy();
    expect(getByText('Codex Vaticanus')).toBeTruthy();
  });

  it('shows consensus and significance without needing to expand', () => {
    const { getByText } = renderWithProviders(
      <ManuscriptStoriesView stories={mockStories} />
    );
    expect(getByText('Scholarly Consensus')).toBeTruthy();
    expect(getByText(mockStories[0].consensus)).toBeTruthy();
    expect(getByText('Significance')).toBeTruthy();
    expect(getByText(mockStories[0].significance)).toBeTruthy();
  });

  it('does not render any expand/collapse chevron', () => {
    const { queryByText } = renderWithProviders(
      <ManuscriptStoriesView stories={mockStories} />
    );
    expect(queryByText('▼')).toBeNull();
    expect(queryByText('▲')).toBeNull();
  });
});
