/**
 * ContentLibraryCard — Entry card for the Content Library screen.
 *
 * Shows title, reference pill (book + chapter), and a 2-line preview.
 * Tap navigates to the chapter with openPanel deep-link.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import type { ContentLibraryEntry } from '../types';

interface Props {
  entry: ContentLibraryEntry;
  onPress: (entry: ContentLibraryEntry) => void;
}

export function ContentLibraryCard({ entry, onPress }: Props) {
  const { base } = useTheme();

  const refLabel = entry.section_num
    ? `${entry.book_name} ${entry.chapter_num} · §${entry.section_num}`
    : `${entry.book_name} ${entry.chapter_num}`;

  return (
    <TouchableOpacity
      onPress={() => onPress(entry)}
      activeOpacity={0.7}
      style={[styles.card, { backgroundColor: base.bgElevated, borderColor: base.border }]}
    >
      <Text
        style={[
          styles.title,
          { color: base.gold },
          (entry.category === 'chiasms' || entry.category === 'discourse')
            ? { fontFamily: fontFamily.displayMedium }
            : null,
        ]}
        numberOfLines={2}
      >
        {entry.title}
      </Text>

      <View style={[styles.refPill, { backgroundColor: base.bgSurface }]}>
        <Text style={[styles.refText, { color: base.textMuted }]}>{refLabel}</Text>
      </View>

      {entry.preview ? (
        <Text style={[styles.preview, { color: base.textMuted }]} numberOfLines={2}>
          {entry.preview}
        </Text>
      ) : null}
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
    lineHeight: 18,
  },
  refPill: {
    alignSelf: 'flex-start',
    borderRadius: radii.sm,
    paddingHorizontal: spacing.xs + 2,
    paddingVertical: 2,
    marginTop: spacing.xs,
  },
  refText: {
    fontFamily: fontFamily.ui,
    fontSize: 10,
  },
  preview: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    lineHeight: 16,
    marginTop: spacing.xs,
  },
});
