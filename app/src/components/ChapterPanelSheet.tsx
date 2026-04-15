/**
 * ChapterPanelSheet — Overlay/sheet section of ChapterScreen.
 *
 * Renders the InterlinearSheet, LexiconSheet, VerseLongPressMenu,
 * HighlightColorPicker, and UpgradePrompt that sit above the main
 * scroll content.
 *
 * Extracted from ChapterScreen to reduce file size and isolate the
 * overlay/panel concern.
 */

import React, { useState, useCallback } from 'react';
import { setHighlight, removeHighlight, type VerseHighlight } from '../db/user';
import { InterlinearSheet } from './InterlinearSheet';
import { LexiconSheet } from './LexiconSheet';
import { VerseLongPressMenu } from './VerseLongPressMenu';
import { HighlightColorPicker, HIGHLIGHT_COLORS } from './HighlightColorPicker';
import { UpgradePrompt } from './UpgradePrompt';

interface Props {
  bookId: string;
  chapterNum: number;
  bookName: string;
  /** The long-pressed verse, or null if none. */
  longPress: { verseNum: number; text: string } | null;
  setLongPress: (v: { verseNum: number; text: string } | null) => void;
  /** Interlinear sheet state */
  interlinearVerse: number | null;
  setInterlinearVerse: (v: number | null) => void;
  /** Navigation callbacks */
  onWordStudyPress: (wsId: string) => void;
  onConcordancePress: (params: any) => void;
  /** Notes callback */
  onAddNote: (verseNum: number) => void;
  /** Bookmark support */
  toggleBookmark: (verseNum: number) => void;
  bookmarked: Set<number>;
  /** Highlights */
  highlights: VerseHighlight[];
  loadHighlights: () => void;
  /** Premium/upgrade */
  upgradeRequest: { variant: 'feature' | 'personal' | 'explore'; featureName: string } | null;
  dismissUpgrade: () => void;
}

const ChapterPanelSheet = React.memo(function ChapterPanelSheet({
  bookId,
  chapterNum,
  bookName,
  longPress,
  setLongPress,
  interlinearVerse,
  setInterlinearVerse,
  onWordStudyPress,
  onConcordancePress,
  onAddNote,
  toggleBookmark,
  bookmarked,
  highlights,
  loadHighlights,
  upgradeRequest,
  dismissUpgrade,
}: Props) {
  const [lexiconStrongs, setLexiconStrongs] = useState<string | null>(null);
  const [lexiconWordStudyId, setLexiconWordStudyId] = useState<string | null>(null);
  const [colorPickerOpen, setColorPickerOpen] = useState(false);

  const handleLexiconPress = useCallback((strongs: string, wsId: string | null) => {
    setInterlinearVerse(null);
    setLexiconStrongs(strongs);
    setLexiconWordStudyId(wsId);
  }, [setInterlinearVerse]);

  const handleInterlinearWordStudy = useCallback((wsId: string) => {
    setInterlinearVerse(null);
    onWordStudyPress(wsId);
  }, [setInterlinearVerse, onWordStudyPress]);

  const handleInterlinearConcordance = useCallback((params: any) => {
    setInterlinearVerse(null);
    onConcordancePress(params);
  }, [setInterlinearVerse, onConcordancePress]);

  const handleLexiconWordStudy = useCallback((wsId: string) => {
    setLexiconStrongs(null);
    setLexiconWordStudyId(null);
    onWordStudyPress(wsId);
  }, [onWordStudyPress]);

  const handleLexiconConcordance = useCallback((params: any) => {
    setLexiconStrongs(null);
    setLexiconWordStudyId(null);
    onConcordancePress(params);
  }, [onConcordancePress]);

  const handleHighlightSelect = useCallback(async (color: string | null) => {
    if (!longPress) return;
    const ref = `${bookId}_${chapterNum}:${longPress.verseNum}`;
    if (color) {
      await setHighlight(ref, color);
    } else {
      await removeHighlight(ref);
    }
    loadHighlights();
    setLongPress(null);
  }, [longPress, bookId, chapterNum, loadHighlights, setLongPress]);

  return (
    <>
      <InterlinearSheet
        visible={interlinearVerse !== null}
        bookId={bookId}
        chapter={chapterNum}
        verse={interlinearVerse ?? 1}
        verseRef={interlinearVerse ? `${bookName} ${chapterNum}:${interlinearVerse}` : ''}
        onClose={() => setInterlinearVerse(null)}
        onWordStudyPress={handleInterlinearWordStudy}
        onConcordancePress={handleInterlinearConcordance}
        onLexiconPress={handleLexiconPress}
      />

      <LexiconSheet
        visible={lexiconStrongs !== null}
        strongs={lexiconStrongs}
        wordStudyId={lexiconWordStudyId}
        onClose={() => { setLexiconStrongs(null); setLexiconWordStudyId(null); }}
        onWordStudyPress={handleLexiconWordStudy}
        onConcordancePress={handleLexiconConcordance}
      />

      <VerseLongPressMenu
        visible={longPress !== null}
        verseText={longPress?.text ?? ''}
        verseRef={longPress ? `${bookName} ${chapterNum}:${longPress.verseNum}` : ''}
        onClose={() => setLongPress(null)}
        onAddNote={longPress ? () => onAddNote(longPress.verseNum) : undefined}
        onHighlight={() => setColorPickerOpen(true)}
        highlightColor={longPress
          ? HIGHLIGHT_COLORS.find((c) => c.name === highlights.find(
              (h) => h.verse_ref === `${bookId}_${chapterNum}:${longPress.verseNum}`
            )?.color)?.hex ?? null
          : null}
        onBookmark={longPress ? () => toggleBookmark(longPress.verseNum) : undefined}
        isBookmarked={longPress ? bookmarked.has(longPress.verseNum) : false}
      />

      <HighlightColorPicker
        visible={colorPickerOpen}
        currentColor={longPress
          ? highlights.find(
              (h) => h.verse_ref === `${bookId}_${chapterNum}:${longPress.verseNum}`
            )?.color ?? null
          : null}
        onSelect={handleHighlightSelect}
        onClose={() => setColorPickerOpen(false)}
      />

      {upgradeRequest && (
        <UpgradePrompt
          visible
          variant={upgradeRequest.variant}
          featureName={upgradeRequest.featureName}
          onClose={dismissUpgrade}
        />
      )}
    </>
  );
});

export { ChapterPanelSheet };
