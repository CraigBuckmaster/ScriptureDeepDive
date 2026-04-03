/**
 * VerseBlock — Renders verse text for a section with VHL highlighting,
 * per-verse note indicators, and optional comparison translation.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { HighlightedText } from './HighlightedText';
import { NoteIndicator } from './NoteIndicator';
import { ComparisonVerse } from './ComparisonVerse';
import { useTheme, spacing, fontFamily } from '../theme';
import type { Verse, VHLGroup } from '../types';

interface Props {
  verses: Verse[];
  vhlGroups: VHLGroup[];
  activeVhlGroups?: string[];
  notedVerses: Set<number>;
  sectionId: string;
  fontSize?: number;
  onVhlWordPress?: (panelTypes: string[], sectionId: string) => void;
  onNotePress?: (verseNum: number) => void;
  onVerseLongPress?: (verseNum: number, text: string) => void;
  onVerseNumPress?: (verseNum: number) => void;
  activeVerseNum?: number;
  /** Comparison verses for parallel translation view. */
  comparisonVerses?: Verse[];
  /** Label for the comparison translation (e.g. "ASV"). */
  comparisonLabel?: string;
  /** Label for the primary translation (e.g. "KJV"). Shown only when comparing. */
  primaryLabel?: string;
  /** Red-letter verse numbers (Jesus speaking). */
  redLetterVerses?: Set<number>;
  /** Called with (verseNum, yRelativeToBlock) when a verse wrapper lays out. */
  onVerseLayout?: (verseNum: number, y: number) => void;
  /** User-applied verse highlight colors: verseNum → hex color string. */
  highlightMap?: Map<number, string>;
}

export const VerseBlock = React.memo(function VerseBlock({
  verses, vhlGroups, activeVhlGroups, notedVerses, sectionId,
  fontSize = 16, onVhlWordPress, onNotePress, onVerseLongPress, onVerseNumPress, activeVerseNum,
  comparisonVerses, comparisonLabel, primaryLabel,
  redLetterVerses, onVerseLayout, highlightMap,
}: Props) {
  const { base } = useTheme();
  if (!verses.length) return null;

  const lineHeight = fontSize * 1.6;
  const numSize = Math.max(11, fontSize * 0.65);
  const isComparing = !!comparisonVerses && comparisonVerses.length > 0;

  return (
    <View style={styles.container}>
      {verses.map((verse, idx) => {
        const comp = isComparing
          ? comparisonVerses!.find(cv => cv.verse_num === verse.verse_num)
          : null;
        const highlightHex = highlightMap?.get(verse.verse_num);

        return (
          <View
            key={verse.verse_num}
            onLayout={onVerseLayout ? (e) => onVerseLayout(verse.verse_num, e.nativeEvent.layout.y) : undefined}
          >
            <TouchableOpacity
              style={[
                styles.verseRow,
                highlightHex && { backgroundColor: highlightHex + '20', borderRadius: 4, marginHorizontal: -4, paddingHorizontal: 4 },
                activeVerseNum === verse.verse_num && { backgroundColor: base.gold + '15', borderRadius: 4, marginHorizontal: -4, paddingHorizontal: 4 },
              ]}
              onLongPress={onVerseLongPress ? () => onVerseLongPress(verse.verse_num, verse.text) : undefined}
              activeOpacity={onVerseLongPress ? 0.7 : 1}
              delayLongPress={400}
              accessibilityRole="button"
              accessibilityLabel={`Verse ${verse.verse_num}. Long press for options`}
              accessibilityHint="Long press to copy, share, or add a note"
            >
              {/* Verse number (tap for interlinear) */}
              <Text
                style={[styles.verseNum, { fontSize: numSize, lineHeight, color: base.verseNum }]}
                accessibilityLabel={`Verse ${verse.verse_num}`}
                onPress={onVerseNumPress ? () => onVerseNumPress(verse.verse_num) : undefined}
              >
                {verse.verse_num}
              </Text>

              {/* Verse text with VHL */}
              <View style={styles.textWrap}>
                <HighlightedText
                  text={verse.text}
                  groups={vhlGroups}
                  activeGroups={activeVhlGroups}
                  sectionId={sectionId}
                  onVhlWordPress={onVhlWordPress}
                  style={{ fontSize, lineHeight }}
                  baseColor={redLetterVerses?.has(verse.verse_num) ? base.redLetter : undefined}
                />
                {/* Primary translation label (only in compare mode) */}
                {isComparing && primaryLabel && (
                  <Text style={[styles.translationLabel, { color: base.textMuted + '80' }]}>
                    {primaryLabel}
                  </Text>
                )}
              </View>

              {/* Note indicator */}
              {onNotePress && (
                <NoteIndicator
                  verseNum={verse.verse_num}
                  hasNote={notedVerses.has(verse.verse_num)}
                  onPress={onNotePress}
                />
              )}
            </TouchableOpacity>

            {/* Comparison verse (display only — no VHL, no interaction) */}
            {isComparing && (
              <ComparisonVerse
                text={comp?.text ?? null}
                translationLabel={comparisonLabel ?? ''}
              />
            )}

            {/* Divider between verse pairs in compare mode */}
            {isComparing && idx < verses.length - 1 && (
              <View style={[styles.compareDivider, { borderBottomColor: base.border }]} />
            )}
          </View>
        );
      })}
    </View>
  );
});

const styles = StyleSheet.create({
  container: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.md,
  },
  verseRow: {
    flexDirection: 'row',
    marginBottom: 8,
  },
  verseNum: {
    fontFamily: fontFamily.display,
    marginRight: 4,
    minWidth: 28,
    textAlign: 'right',
  },
  textWrap: {
    flex: 1,
  },
  translationLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 9,
    alignSelf: 'flex-end',
    marginTop: 2,
  },
  compareDivider: {
    borderBottomWidth: 1,
    borderStyle: 'dashed',
    marginVertical: 8,
    marginHorizontal: spacing.md,
  },
});
