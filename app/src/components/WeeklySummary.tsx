/**
 * WeeklySummary — "This week: N chapters · Book1, Book2" card.
 * Renders only when weeklyChapters > 0.
 */

import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { useTheme, spacing, radii, fontFamily } from '../theme';

interface Props {
  chapters: number;
  bookNames: string[];
}

export function WeeklySummary({ chapters, bookNames }: Props) {
  const { base } = useTheme();
  if (chapters < 1) return null;

  const bookList = bookNames.length > 0
    ? bookNames.slice(0, 3).join(', ') + (bookNames.length > 3 ? ` +${bookNames.length - 3}` : '')
    : '';

  const chapterWord = chapters === 1 ? 'chapter' : 'chapters';
  const summary = bookList
    ? `This week: ${chapters} ${chapterWord} · ${bookList}`
    : `This week: ${chapters} ${chapterWord}`;

  return (
    <View style={[styles.container, { backgroundColor: base.bgElevated, borderColor: base.border }]}>
      <Text style={[styles.text, { color: base.textDim }]}>{summary}</Text>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    borderRadius: radii.md,
    borderWidth: 1,
    paddingVertical: spacing.sm,
    paddingHorizontal: spacing.md,
    marginBottom: spacing.md,
  },
  text: {
    fontFamily: fontFamily.ui,
    fontSize: 13,
  },
});
