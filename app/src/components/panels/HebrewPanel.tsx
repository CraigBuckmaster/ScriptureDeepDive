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
import { View, Text, TouchableOpacity } from 'react-native';
import { TappableReference } from '../TappableReference';
import { getPanelColors, base, spacing } from '../../theme';
import type { HebEntry, ParsedRef } from '../../types';

interface Props {
  entries: HebEntry[];
  onWordStudyPress?: (word: string) => void;
  onRefPress?: (ref: ParsedRef) => void;
}

export function HebrewPanel({ entries, onWordStudyPress, onRefPress }: Props) {
  const colors = getPanelColors('heb');

  return (
    <View style={{ gap: spacing.md }}>
      {entries.map((entry, i) => (
        <View key={i} style={{ gap: 4 }}>
          {/* Word + transliteration + gloss */}
          <View style={{ flexDirection: 'row', flexWrap: 'wrap', alignItems: 'baseline', gap: 6 }}>
            <TouchableOpacity
              onPress={() => onWordStudyPress?.(entry.word)}
              disabled={!onWordStudyPress}
              accessibilityRole="button"
              accessibilityLabel={`Word study: ${entry.word}`}
            >
              <Text style={{ color: colors.accent, fontSize: 18, fontFamily: 'EBGaramond_500Medium' }}>
                {entry.word}
              </Text>
            </TouchableOpacity>
            <Text style={{ color: base.goldDim, fontSize: 13, fontFamily: 'EBGaramond_400Regular_Italic' }}>
              {entry.transliteration || entry.tlit || ''}
            </Text>
            <Text style={{ color: base.gold, fontSize: 14, fontFamily: 'EBGaramond_600SemiBold' }}>
              — {entry.gloss}
            </Text>
          </View>

          {/* Paragraph */}
          {(entry.paragraph || entry.text || entry.note) ? (
            <TappableReference
              text={entry.paragraph || entry.text || entry.note || ''}
              style={{ color: base.textDim, fontSize: 14, lineHeight: 22 }}
              onRefPress={onRefPress}
            />
          ) : null}
        </View>
      ))}
    </View>
  );
}
