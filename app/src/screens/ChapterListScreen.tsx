/**
 * ChapterListScreen — Chapter grid for a selected book.
 *
 * Back button via ArrowLeft. No "· Live" label (dimmed chapters are
 * sufficient status indicator). Read progress shown as subtle background
 * tint on visited chapters. Difficulty dots shown beneath chapter number.
 *
 * Card #1363 (UI polish phase 6):
 *   - Full-width tinted "About This Book" card in place of the small link.
 *   - Chapter grid softer borders (8% gold), gold ring on the last-read
 *     chapter, gold fill (+ checkmark) on completed chapters.
 *   - New progress summary row above the grid: "X of Y chapters read"
 *     with a gold progress bar.
 */

import React, { useState, useEffect, useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowRight, Check } from 'lucide-react-native';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import { getBook, getDifficultyForBook } from '../db/content';
import { getProgressForBook } from '../db/user';
import { ScreenHeader } from '../components/ScreenHeader';
import { DifficultyBadge } from '../components/DifficultyBadge';
import { useTheme, spacing, radii, fontFamily, MIN_TOUCH_TARGET } from '../theme';
import type { Book } from '../types';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

function ChapterListScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Read', 'ChapterList'>>();
  const route = useRoute<ScreenRouteProp<'Read', 'ChapterList'>>();
  const { bookId } = route.params ?? {};
  const [book, setBook] = useState<Book | null>(null);
  const [visited, setVisited] = useState<Set<number>>(new Set());
  const [lastRead, setLastRead] = useState<number | null>(null);
  const [difficulty, setDifficulty] = useState<Map<number, number>>(new Map());

  useEffect(() => {
    if (bookId) {
      getBook(bookId).then(setBook);
      getProgressForBook(bookId).then((rows) => {
        setVisited(new Set(rows.map((r) => r.chapter_num)));
        // Last-read: highest chapter number in the progress rows.
        if (rows.length > 0) {
          const maxCh = rows.reduce((m: number, r) => Math.max(m, r.chapter_num), 0);
          setLastRead(maxCh);
        }
      });
      getDifficultyForBook(bookId).then(setDifficulty);
    }
  }, [bookId]);

  const progressPct = useMemo(() => {
    if (!book || book.total_chapters <= 0) return 0;
    return Math.min(100, (visited.size / book.total_chapters) * 100);
  }, [book, visited.size]);

  if (!book) return <View style={[styles.container, { backgroundColor: base.bg, justifyContent: 'center', alignItems: 'center' }]}><ActivityIndicator color={base.gold} /></View>;

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header with back button */}
        <ScreenHeader
          title={book.name}
          subtitle={`${book.total_chapters} chapters`}
          onBack={() => navigation.goBack()}
          backLabel="Back to library"
          style={styles.headerSpacing}
        />

        {/* Progress summary — only shown when user has started the book */}
        {visited.size > 0 && (
          <View style={styles.progressRow}>
            <Text style={[styles.progressLabel, { color: base.textMuted }]}>
              {`${visited.size} of ${book.total_chapters} chapters read`}
            </Text>
            <View style={[styles.progressTrack, { backgroundColor: base.border + '80' }]}>
              <View
                style={[
                  styles.progressFill,
                  { width: `${progressPct}%`, backgroundColor: base.gold },
                ]}
              />
            </View>
          </View>
        )}

        {/* About This Book — full-width tinted card */}
        <TouchableOpacity
          onPress={() => navigation.navigate('BookIntro', { bookId })}
          style={[
            styles.introCard,
            {
              backgroundColor: base.tintParchment,
              borderColor: base.gold + '20',
            },
          ]}
          accessibilityLabel="About this book"
          accessibilityRole="button"
        >
          <View style={styles.introCardText}>
            <Text style={[styles.introCardLabel, { color: base.gold }]}>About This Book</Text>
            <Text style={[styles.introCardSubtitle, { color: base.textDim }]} numberOfLines={1}>
              Genre, authorship, and key themes
            </Text>
          </View>
          <ArrowRight size={16} color={base.gold} />
        </TouchableOpacity>

        {/* Chapter grid */}
        <View style={styles.grid}>
          {Array.from({ length: book.total_chapters }, (_, i) => i + 1).map((ch) => {
            const isVisited = visited.has(ch);
            const isLastRead = ch === lastRead;
            const diff = difficulty.get(ch);
            return (
              <TouchableOpacity
                key={ch}
                onPress={() => book.is_live && navigation.navigate('Chapter', { bookId, chapterNum: ch })}
                disabled={!book.is_live}
                style={[
                  styles.cell,
                  {
                    backgroundColor: base.bgElevated,
                    borderColor: base.gold + '14', // ~8% opacity soft border
                  },
                  isVisited && {
                    backgroundColor: base.gold + '22',
                    borderColor: base.gold + '40',
                  },
                  isLastRead && {
                    // Ring around the last-read chapter: thicker gold border.
                    borderColor: base.gold,
                    borderWidth: 2,
                  },
                ]}
              >
                <Text style={[
                  styles.cellText,
                  { color: base.gold },
                  !book.is_live && { color: base.textMuted },
                ]}>
                  {ch}
                </Text>
                {isVisited && (
                  <View style={styles.cellCheck} pointerEvents="none">
                    <Check size={10} color={base.gold} />
                  </View>
                )}
                {diff != null && diff > 1 && <DifficultyBadge level={diff} />}
              </TouchableOpacity>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  content: {
    padding: spacing.md,
  },
  headerSpacing: {
    marginBottom: spacing.md,
  },
  progressRow: {
    marginBottom: spacing.md,
  },
  progressLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
    letterSpacing: 0.3,
    marginBottom: spacing.xs,
  },
  progressTrack: {
    height: 3,
    borderRadius: 1.5,
    overflow: 'hidden',
  },
  progressFill: {
    height: 3,
    borderRadius: 1.5,
  },
  introCard: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    borderWidth: 1,
    borderRadius: radii.lg,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm + 2,
    marginBottom: spacing.lg,
  },
  introCardText: {
    flex: 1,
  },
  introCardLabel: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 14,
    letterSpacing: 0.4,
  },
  introCardSubtitle: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 12,
    marginTop: 2,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 6,
  },
  cell: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET + 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radii.sm,
    borderWidth: 1,
    position: 'relative',
  },
  cellText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
  },
  cellCheck: {
    position: 'absolute',
    top: 3,
    right: 3,
  },
});

export default withErrorBoundary(ChapterListScreen);
