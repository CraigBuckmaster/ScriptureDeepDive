import React from 'react';
import { renderWithProviders } from '../helpers/renderWithProviders';
import { ChapterPanelSheet } from '@/components/ChapterPanelSheet';

jest.mock('@/components/InterlinearSheet', () => ({
  InterlinearSheet: () => null,
}));

jest.mock('@/components/LexiconSheet', () => ({
  LexiconSheet: () => null,
}));

jest.mock('@/components/VerseLongPressMenu', () => ({
  VerseLongPressMenu: () => null,
}));

jest.mock('@/components/HighlightColorPicker', () => ({
  HighlightColorPicker: () => null,
  HIGHLIGHT_COLORS: [{ name: 'yellow', hex: '#FFD700' }],
}));

jest.mock('@/db/user', () => ({
  setHighlight: jest.fn().mockResolvedValue(undefined),
  removeHighlight: jest.fn().mockResolvedValue(undefined),
  getPreference: jest.fn().mockResolvedValue(null),
  setPreference: jest.fn().mockResolvedValue(undefined),
}));

describe('ChapterPanelSheet', () => {
  const defaultProps = {
    bookId: 'genesis',
    chapterNum: 1,
    bookName: 'Genesis',
    longPress: null,
    setLongPress: jest.fn(),
    interlinearVerse: null,
    setInterlinearVerse: jest.fn(),
    onWordStudyPress: jest.fn(),
    onConcordancePress: jest.fn(),
    onAddNote: jest.fn(),
    toggleBookmark: jest.fn(),
    bookmarked: new Set<number>(),
    highlights: [],
    loadHighlights: jest.fn(),
    upgradeRequest: null,
    dismissUpgrade: jest.fn(),
  };

  it('renders without crashing', () => {
    expect(() => {
      renderWithProviders(<ChapterPanelSheet {...defaultProps} />);
    }).not.toThrow();
  });

  it('renders upgrade prompt when upgradeRequest is set', () => {
    const { getByText } = renderWithProviders(
      <ChapterPanelSheet
        {...defaultProps}
        upgradeRequest={{ variant: 'feature', featureName: 'Interlinear Hebrew & Greek' }}
      />,
    );
    expect(getByText('Interlinear Hebrew & Greek')).toBeTruthy();
  });

  it('renders with longPress verse set', () => {
    expect(() => {
      renderWithProviders(
        <ChapterPanelSheet
          {...defaultProps}
          longPress={{ verseNum: 3, text: 'And God said...' }}
        />,
      );
    }).not.toThrow();
  });

  it('renders with interlinear verse set', () => {
    expect(() => {
      renderWithProviders(
        <ChapterPanelSheet
          {...defaultProps}
          interlinearVerse={5}
        />,
      );
    }).not.toThrow();
  });

  it('renders with highlights', () => {
    expect(() => {
      renderWithProviders(
        <ChapterPanelSheet
          {...defaultProps}
          highlights={[{ verse_ref: 'genesis_1:1', color: 'yellow', id: 1, created_at: '', collection_id: null, note: null }]}
          longPress={{ verseNum: 1, text: 'In the beginning...' }}
        />,
      );
    }).not.toThrow();
  });

  it('renders with bookmarked verse and longPress', () => {
    expect(() => {
      renderWithProviders(
        <ChapterPanelSheet
          {...defaultProps}
          bookmarked={new Set([1, 3, 5])}
          longPress={{ verseNum: 3, text: 'Some verse text' }}
        />,
      );
    }).not.toThrow();
  });
});
