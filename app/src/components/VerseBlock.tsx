/**
 * VerseBlock — Renders verse text for a section with VHL highlighting
 * and per-verse note indicators.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { HighlightedText } from './HighlightedText';
import { NoteIndicator } from './NoteIndicator';
import { base, spacing, fontFamily } from '../theme';
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
}

export const VerseBlock = React.memo(function VerseBlock({
  verses, vhlGroups, activeVhlGroups, notedVerses, sectionId,
  fontSize = 16, onVhlWordPress, onNotePress,
}: Props) {
  if (!verses.length) return null;

  const lineHeight = fontSize * 1.6;
  const numSize = Math.max(9, fontSize * 0.6);

  return (
    <View style={styles.container}>
      {verses.map((verse) => (
        <View key={verse.verse_num} style={styles.verseRow}>
          {/* Verse number */}
          <Text
            style={[styles.verseNum, { fontSize: numSize, lineHeight }]}
            accessibilityLabel={`Verse ${verse.verse_num}`}
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
        </View>
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
    color: base.verseNum,
    fontFamily: fontFamily.display,
    marginRight: 4,
    minWidth: 28,
    textAlign: 'right',
  },
  textWrap: {
    flex: 1,
  },
});
