import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { VerseShareCard } from '@/components/VerseShareCard';

describe('VerseShareCard', () => {
  beforeEach(() => jest.clearAllMocks());

  it('renders the verse text in quotes', () => {
    const { getByText } = renderWithProviders(
      <VerseShareCard verseRef="John 3:16" verseText="For God so loved the world" translation="esv" />,
    );
    expect(getByText(/For God so loved the world/)).toBeTruthy();
  });

  it('renders the verse reference with translation', () => {
    const { getByText } = renderWithProviders(
      <VerseShareCard verseRef="John 3:16" verseText="For God so loved the world" translation="esv" />,
    );
    expect(getByText(/John 3:16/)).toBeTruthy();
    expect(getByText(/ESV/)).toBeTruthy();
  });

  it('renders the branding text', () => {
    const { getByText } = renderWithProviders(
      <VerseShareCard verseRef="Psalm 23:1" verseText="The Lord is my shepherd" translation="kjv" />,
    );
    expect(getByText(/Companion Study/)).toBeTruthy();
  });

  it('uppercases the translation abbreviation', () => {
    const { getByText } = renderWithProviders(
      <VerseShareCard verseRef="Gen 1:1" verseText="In the beginning" translation="niv" />,
    );
    expect(getByText(/NIV/)).toBeTruthy();
  });
});
