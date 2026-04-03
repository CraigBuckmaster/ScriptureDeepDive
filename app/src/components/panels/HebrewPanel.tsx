/**
 * HebrewPanel — Hebrew/Greek word study entries.
 *
 * Each entry: word (accent, large) + transliteration (gold-dim italic)
 * + gloss (gold bold) + paragraph (body with TappableReference).
 *
 * WORD STUDY TRIGGER: Tapping a word INSIDE this panel opens the
 * WordStudyPopup (if a matching entry exists). This is the actual
 * path to the lexicon — NOT from VHL highlighting in verse text.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { TappableReference } from '../TappableReference';
import { useTheme, spacing, fontFamily } from '../../theme';
import type { HebEntry, ParsedRef } from '../../types';

interface Props {
  entries: HebEntry[];
  onWordStudyPress?: (word: string) => void;
  onRefPress?: (ref: ParsedRef) => void;
}

export function HebrewPanel({ entries, onWordStudyPress, onRefPress }: Props) {
  const { base, getPanelColors } = useTheme();
  const colors = getPanelColors('heb');

  return (
    <View style={[styles.container, { gap: spacing.md }]}>
      {entries.map((entry, i) => (
        <View key={i} style={styles.entryRow}>
          {/* Word + transliteration + gloss */}
          <View style={styles.wordRow}>
            <TouchableOpacity
              onPress={() => onWordStudyPress?.(entry.word)}
              disabled={!onWordStudyPress}
              accessibilityRole="button"
              accessibilityLabel={`Word study: ${entry.word}`}
            >
              <Text style={[styles.wordText, { color: colors.accent }]}>
                {entry.word}
              </Text>
            </TouchableOpacity>
            <Text style={[styles.transliterationText, { color: base.goldDim }]}>
              {entry.transliteration || entry.tlit || ''}
            </Text>
            <Text style={[styles.glossText, { color: base.gold }]}>
              — {entry.gloss}
            </Text>
          </View>

          {/* Paragraph */}
          {(entry.paragraph || entry.text || entry.note) ? (
            <TappableReference
              text={entry.paragraph || entry.text || entry.note || ''}
              style={[styles.paragraphText, { color: base.textDim }]}
              onRefPress={onRefPress}
            />
          ) : null}
        </View>
      ))}
    </View>
  );
}

const styles = StyleSheet.create({
  container: {},
  entryRow: {
    gap: 4,
  },
  wordRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    alignItems: 'baseline',
    gap: 6,
  },
  wordText: {
    fontSize: 18,
    fontFamily: fontFamily.bodyMedium,
  },
  transliterationText: {
    fontSize: 13,
    fontFamily: fontFamily.bodyItalic,
  },
  glossText: {
    fontSize: 14,
    fontFamily: fontFamily.bodySemiBold,
  },
  paragraphText: {
    fontSize: 14,
    lineHeight: 22,
  },
});
