/**
 * ConcordanceEntry — Single result card for concordance search.
 *
 * Shows book name + chapter:verse reference, verse text with the
 * target word's gloss highlighted in gold.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { base, spacing, radii, fontFamily } from '../theme';
import type { ConcordanceResult } from '../types';

interface Props {
  result: ConcordanceResult;
  gloss: string | null;
  onPress: () => void;
}

export function ConcordanceEntry({ result, gloss, onPress }: Props) {
  const ref = `${result.book_name} ${result.chapter_num}:${result.verse_num}`;

  // Highlight the gloss word within the verse text
  const renderText = () => {
    if (!gloss || !result.text) {
      return <Text style={styles.verseText}>{result.text}</Text>;
    }

    // Case-insensitive split on the gloss word
    const splitRegex = new RegExp(`(${escapeRegex(gloss)})`, 'gi');
    const testRegex = new RegExp(`^${escapeRegex(gloss)}$`, 'i');
    const parts = result.text.split(splitRegex);

    return (
      <Text style={styles.verseText}>
        {parts.map((part, i) =>
          testRegex.test(part) ? (
            <Text key={i} style={styles.highlighted}>{part}</Text>
          ) : (
            <Text key={i}>{part}</Text>
          )
        )}
      </Text>
    );
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.7}>
      <View style={styles.refRow}>
        <Text style={styles.ref}>{ref}</Text>
        {result.gloss ? (
          <Text style={styles.gloss}>{result.gloss}</Text>
        ) : null}
      </View>
      {renderText()}
    </TouchableOpacity>
  );
}

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: base.bgElevated,
    borderWidth: 1,
    borderColor: base.border,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  refRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: spacing.xs,
  },
  ref: {
    color: base.gold,
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
  },
  gloss: {
    color: base.textMuted,
    fontFamily: fontFamily.bodyItalic,
    fontSize: 12,
  },
  verseText: {
    color: base.textDim,
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 22,
  },
  highlighted: {
    color: base.gold,
    fontFamily: fontFamily.bodyMedium,
  },
});
