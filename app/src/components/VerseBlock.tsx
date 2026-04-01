/**
 * VerseBlock — Renders verse text for a section with VHL highlighting
 * and per-verse note indicators.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { HighlightedText } from './HighlightedText';
import { NoteIndicator } from './NoteIndicator';
import { base, useTheme, spacing, fontFamily } from '../theme';
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
}

export const VerseBlock = React.memo(function VerseBlock({
  verses, vhlGroups, activeVhlGroups, notedVerses, sectionId,
  fontSize = 16, onVhlWordPress, onNotePress, onVerseLongPress, onVerseNumPress, activeVerseNum,
}: Props) {
  const { base } = useTheme();
  if (!verses.length) return null;

  const lineHeight = fontSize * 1.6;
  const numSize = Math.max(11, fontSize * 0.65);

  return (
    <View style={styles.container}>
      {verses.map((verse) => (
        <TouchableOpacity
          key={verse.verse_num}
          style={[styles.verseRow, activeVerseNum === verse.verse_num && { backgroundColor: base.gold + '15', borderRadius: 4, marginHorizontal: -4, paddingHorizontal: 4 }]}
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
            />
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
      ))}
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
});
