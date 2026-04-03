/**
 * ChapterListScreen — Chapter grid for a selected book.
 *
 * Back button via ArrowLeft. No "· Live" label (dimmed chapters are
 * sufficient status indicator). Read progress shown as subtle background
 * tint on visited chapters. Difficulty dots shown beneath chapter number.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView, ActivityIndicator, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation, useRoute } from '@react-navigation/native';
import type { ScreenNavProp, ScreenRouteProp } from '../navigation/types';
import { getBook, getDifficultyForBook } from '../db/content';
import { getProgressForBook } from '../db/user';
import { ScreenHeader } from '../components/ScreenHeader';
import { DifficultyBadge } from '../components/DifficultyBadge';
import { ArrowRight } from 'lucide-react-native';
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
  const [difficulty, setDifficulty] = useState<Map<number, number>>(new Map());

  useEffect(() => {
    if (bookId) {
      getBook(bookId).then(setBook);
      getProgressForBook(bookId).then((rows) =>
        setVisited(new Set(rows.map((r) => r.chapter_num)))
      );
      getDifficultyForBook(bookId).then(setDifficulty);
    }
  }, [bookId]);

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

        {/* About This Book */}
        <TouchableOpacity
          onPress={() => navigation.navigate('BookIntro', { bookId })}
          style={styles.introLink}
          accessibilityLabel="About this book"
          accessibilityRole="button"
        >
          <Text style={[styles.introLinkText, { color: base.gold }]}>About This Book</Text>
          <ArrowRight size={13} color={base.gold} />
        </TouchableOpacity>

        {/* Chapter grid */}
        <View style={styles.grid}>
          {Array.from({ length: book.total_chapters }, (_, i) => i + 1).map((ch) => {
            const isVisited = visited.has(ch);
            const diff = difficulty.get(ch);
            return (
              <TouchableOpacity
                key={ch}
                onPress={() => book.is_live && navigation.navigate('Chapter', { bookId, chapterNum: ch })}
                disabled={!book.is_live}
                style={[
                  styles.cell,
                  { backgroundColor: base.bgElevated },
                  isVisited && { backgroundColor: base.gold + '30' },
                ]}
              >
                <Text style={[
                  styles.cellText,
                  { color: base.gold },
                  !book.is_live && { color: base.textMuted },
                ]}>
                  {ch}
                </Text>
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
    marginBottom: spacing.xs,
  },
  introLink: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
    marginBottom: spacing.lg,
  },
  introLinkText: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 13,
  },
  grid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 4,
  },
  cell: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET + 6,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radii.sm,
  },
  cellText: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
  },
});

export default withErrorBoundary(ChapterListScreen);
