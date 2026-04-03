/**
 * ConcordanceEntry — Single result card for concordance search.
 *
 * Shows book name + chapter:verse reference, verse text with the
 * target word's gloss highlighted in gold.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import type { ConcordanceResult } from '../types';

interface Props {
  result: ConcordanceResult;
  gloss: string | null;
  onPress: () => void;
}

function ConcordanceEntry({ result, gloss, onPress }: Props) {
  const { base } = useTheme();
  const ref = `${result.book_name} ${result.chapter_num}:${result.verse_num}`;

  // Highlight the gloss word within the verse text
  const renderText = () => {
    if (!gloss || !result.text) {
      return <Text style={[styles.verseText, { color: base.textDim }]}>{result.text}</Text>;
    }

    // Case-insensitive split on the gloss word
    const splitRegex = new RegExp(`(${escapeRegex(gloss)})`, 'gi');
    const testRegex = new RegExp(`^${escapeRegex(gloss)}$`, 'i');
    const parts = result.text.split(splitRegex);

    return (
      <Text style={[styles.verseText, { color: base.textDim }]}>
        {parts.map((part, i) =>
          testRegex.test(part) ? (
            <Text key={i} style={[styles.glossHighlight, { color: base.gold }]}>{part}</Text>
          ) : (
            <Text key={i}>{part}</Text>
          )
        )}
      </Text>
    );
  };

  return (
    <TouchableOpacity
      style={[styles.card, { backgroundColor: base.bgElevated, borderColor: base.border }]}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={styles.refRow}>
        <Text style={[styles.ref, { color: base.gold }]}>{ref}</Text>
        {result.gloss ? (
          <Text style={[styles.gloss, { color: base.textMuted }]}>{result.gloss}</Text>
        ) : null}
      </View>
      {renderText()}
    </TouchableOpacity>
  );
}

const MemoizedConcordanceEntry = React.memo(ConcordanceEntry);
export { MemoizedConcordanceEntry as ConcordanceEntry };
export default MemoizedConcordanceEntry;

function escapeRegex(str: string): string {
  return str.replace(/[.*+?^${}()|[\]\\]/g, '\\$&');
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
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
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
  },
  gloss: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 12,
  },
  verseText: {
    fontFamily: fontFamily.body,
    fontSize: 14,
    lineHeight: 22,
  },
  glossHighlight: {
    fontFamily: fontFamily.bodyMedium,
  },
});
