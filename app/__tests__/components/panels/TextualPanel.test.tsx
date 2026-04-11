/**
 * TextualPanel.test.tsx — Tests for the textual criticism panel.
 */

import React from 'react';
import { renderWithProviders } from '../../helpers/renderWithProviders';
import { TextualPanel } from '@/components/panels/TextualPanel';
import type { TextualEntry } from '@/types';
import type { ManuscriptStory } from '@/components/panels/ManuscriptStoriesView';

const entries: TextualEntry[] = [
  { ref: 'v. 1', title: 'Masoretic vs LXX', content: 'The MT reads bereshit while LXX has en arche.', note: 'Minor semantic difference.' },
  { ref: 'v. 2', title: 'Dead Sea Scrolls', content: 'Fragment 4Q supports MT reading.', note: '' },
];

describe('TextualPanel', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders entry refs and titles', () => {
    const { getByText } = renderWithProviders(
      <TextualPanel entries={entries} />,
    );
    expect(getByText('v. 1')).toBeTruthy();
    expect(getByText('Masoretic vs LXX')).toBeTruthy();
    expect(getByText('v. 2')).toBeTruthy();
    expect(getByText('Dead Sea Scrolls')).toBeTruthy();
  });

  it('renders entry content', () => {
    const { getByText } = renderWithProviders(
      <TextualPanel entries={entries} />,
    );
    expect(getByText(/MT reads bereshit/)).toBeTruthy();
  });

  it('renders note when present', () => {
    const { getByText } = renderWithProviders(
      <TextualPanel entries={entries} />,
    );
    expect(getByText('Minor semantic difference.')).toBeTruthy();
  });

  it('renders with empty entries without crashing', () => {
    const { toJSON } = renderWithProviders(
      <TextualPanel entries={[]} />,
    );
    expect(toJSON()).toBeTruthy();
  });

  it('omits note when empty string', () => {
    const { queryByText } = renderWithProviders(
      <TextualPanel entries={[{ ref: 'v. 3', title: 'Test', content: 'Body', note: '' }]} />,
    );
    // Empty note should not render (note is falsy)
    expect(queryByText('Minor semantic difference.')).toBeNull();
  });
});

// ── CompositeTextualPanel tests ──

import { CompositeTextualPanel } from '@/components/panels/TextualPanel';

jest.mock('@/components/panels/ManuscriptStoriesView', () => ({
  ManuscriptStoriesView: ({ stories }: any) => {
    const RN = require('react-native');
    return <RN.Text>Stories: {stories.length}</RN.Text>;
  },
}));

describe('CompositeTextualPanel', () => {
  const notes: TextualEntry[] = [
    { ref: 'v.1', title: 'Variant A', content: 'Content A', note: '' },
  ];
  const stories: ManuscriptStory[] = [
    { title: 'Story 1', passage: 'John 7:53-8:11', summary: 'Summary', evidence: [], consensus: 'Consensus', significance: 'High' },
  ];

  it('renders notes-only without tab bar', () => {
    const { getByText, queryByText } = renderWithProviders(
      <CompositeTextualPanel data={{ notes, stories: [] }} />,
    );
    expect(getByText('Variant A')).toBeTruthy();
    expect(queryByText('Notes')).toBeNull(); // no tab bar
  });

  it('renders stories-only without tab bar', () => {
    const { getByText, queryByText } = renderWithProviders(
      <CompositeTextualPanel data={{ notes: [], stories }} />,
    );
    expect(getByText('Stories: 1')).toBeTruthy();
    expect(queryByText('Manuscript Stories')).toBeNull(); // no tab bar
  });

  it('renders tab bar when both notes and stories exist', () => {
    const { getByText } = renderWithProviders(
      <CompositeTextualPanel data={{ notes, stories }} />,
    );
    expect(getByText('Notes')).toBeTruthy();
    expect(getByText('Manuscript Stories')).toBeTruthy();
  });

  it('defaults to stories tab when defaultTab is stories', () => {
    const { getByText } = renderWithProviders(
      <CompositeTextualPanel data={{ notes, stories }} defaultTab="stories" />,
    );
    expect(getByText('Stories: 1')).toBeTruthy();
  });
});
