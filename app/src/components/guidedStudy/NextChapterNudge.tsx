import React, { useMemo } from 'react';
import { StyleSheet, Text, TouchableOpacity, View } from 'react-native';
import { ArrowRight, RotateCcw } from 'lucide-react-native';
import { fontFamily, radii, spacing, useTheme } from '../../theme';
import {
  getNextChapter,
  type NextChapterRef,
} from '../../services/guidedStudy/nextChapter';
import type { Book } from '../../types';

export interface NextChapterNudgeProps {
  bookId: string;
  chapterNum: number;
  books: Book[];
  onOpenNext: (next: NextChapterRef) => void;
  onMarkComplete: () => void;
  onRestart?: () => void;
}

export function NextChapterNudge({
  bookId,
  chapterNum,
  books,
  onOpenNext,
  onMarkComplete,
  onRestart,
}: NextChapterNudgeProps) {
  const { base } = useTheme();

  const next = useMemo(
    () => getNextChapter(bookId, chapterNum, books),
    [bookId, chapterNum, books],
  );

  if (!next) {
    return (
      <View
        style={[styles.card, { backgroundColor: base.bgElevated, borderColor: `${base.gold}30` }]}
      >
        <Text style={[styles.title, { color: base.gold }]}>You finished Revelation!</Text>
        <Text style={[styles.subtitle, { color: base.textDim }]}>
          The whole canon read through. Want to start the journey again?
        </Text>
        <TouchableOpacity
          onPress={onRestart}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Start over from Genesis 1"
          style={[styles.primaryButton, { backgroundColor: base.gold }]}
        >
          <RotateCcw size={14} color={base.bg} />
          <Text style={[styles.primaryText, { color: base.bg }]}>Start over from Genesis 1</Text>
        </TouchableOpacity>
      </View>
    );
  }

  return (
    <View
      style={[styles.card, { backgroundColor: base.bgElevated, borderColor: `${base.gold}30` }]}
    >
      <Text style={[styles.title, { color: base.gold }]}>Continue your study</Text>
      <Text style={[styles.subtitle, { color: base.textDim }]}>
        Next: {next.bookName} {next.chapterNum}
      </Text>
      <View style={styles.actionRow}>
        <TouchableOpacity
          onPress={() => onOpenNext(next)}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel={`Open ${next.bookName} ${next.chapterNum}`}
          style={[styles.primaryButton, { backgroundColor: base.gold }]}
        >
          <Text style={[styles.primaryText, { color: base.bg }]}>Open</Text>
          <ArrowRight size={14} color={base.bg} />
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onMarkComplete}
          activeOpacity={0.75}
          accessibilityRole="button"
          accessibilityLabel="Mark complete and stay here"
          style={[styles.secondaryButton, { borderColor: base.border }]}
        >
          <Text style={[styles.secondaryText, { color: base.text }]}>Mark complete</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    marginHorizontal: spacing.md,
    marginBottom: spacing.md,
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    gap: spacing.xs,
  },
  title: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 16,
  },
  subtitle: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 19,
  },
  actionRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginTop: spacing.xs,
  },
  primaryButton: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 6,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  primaryText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 13,
  },
  secondaryButton: {
    borderWidth: 1,
    borderRadius: radii.sm,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  secondaryText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
  },
});
