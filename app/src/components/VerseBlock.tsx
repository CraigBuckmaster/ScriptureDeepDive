/**
 * VerseBlock — Renders verse text for a section with VHL highlighting
 * and per-verse note indicators.
 */

import React from 'react';
import { View } from 'react-native';
import { Text } from 'react-native';
import { HighlightedText } from './HighlightedText';
import { NoteIndicator } from './NoteIndicator';
import { base, spacing } from '../theme';
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

export function VerseBlock({
  verses, vhlGroups, activeVhlGroups, notedVerses, sectionId,
  fontSize = 16, onVhlWordPress, onNotePress,
}: Props) {
  if (!verses.length) return null;

  return (
    <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>
      {verses.map((verse) => (
        <View
          key={verse.verse_num}
          style={{ flexDirection: 'row', marginBottom: 2 }}
        >
          {/* Verse number */}
          <Text
            style={{
              color: base.gold,
              fontFamily: 'Cinzel_400Regular',
              fontSize: Math.max(9, fontSize * 0.6),
              lineHeight: fontSize * 1.6,
              marginRight: 4,
              minWidth: 20,
              textAlign: 'right',
            }}
            accessibilityLabel={`Verse ${verse.verse_num}`}
          >
            {verse.verse_num}
          </Text>

          {/* Verse text with VHL */}
          <View style={{ flex: 1 }}>
            <HighlightedText
              text={verse.text}
              groups={vhlGroups}
              activeGroups={activeVhlGroups}
              sectionId={sectionId}
              onVhlWordPress={onVhlWordPress}
              style={{ fontSize, lineHeight: fontSize * 1.6 }}
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
}
