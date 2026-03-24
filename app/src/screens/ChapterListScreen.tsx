/**
 * ChapterListScreen — Chapter grid for a selected book.
 *
 * Back button via ArrowLeft. No "· Live" label (dimmed chapters are
 * sufficient status indicator). Read progress shown as subtle background
 * tint on visited chapters.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, SafeAreaView, ScrollView, StyleSheet } from 'react-native';
import { useNavigation, useRoute } from '@react-navigation/native';
import { ArrowLeft } from 'lucide-react-native';
import { getBook } from '../db/content';
import { getProgressForBook } from '../db/user';
import { base, spacing, radii, fontFamily, MIN_TOUCH_TARGET } from '../theme';
import type { Book } from '../types';

export default function ChapterListScreen() {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const { bookId } = route.params ?? {};
  const [book, setBook] = useState<Book | null>(null);
  const [visited, setVisited] = useState<Set<number>>(new Set());

  useEffect(() => {
    if (bookId) {
      getBook(bookId).then(setBook);
      getProgressForBook(bookId).then((rows) =>
        setVisited(new Set(rows.map((r) => r.chapter_num)))
      );
    }
  }, [bookId]);

  if (!book) return <View style={styles.container} />;

  return (
    <SafeAreaView style={styles.container}>
      <ScrollView contentContainerStyle={styles.content}>
        {/* Header with back button */}
        <View style={styles.headerRow}>
          <TouchableOpacity
            onPress={() => navigation.goBack()}
            style={styles.backButton}
            accessibilityLabel="Back to library"
          >
            <ArrowLeft size={20} color={base.gold} />
          </TouchableOpacity>
          <View style={styles.headerText}>
            <Text style={styles.bookTitle}>{book.name}</Text>
            <Text style={styles.bookSubtitle}>
              {book.total_chapters} chapters
            </Text>
          </View>
        </View>

        {/* About This Book */}
        <TouchableOpacity
          onPress={() => navigation.navigate('BookIntro', { bookId })}
          style={styles.introLink}
        >
          <Text style={styles.introLinkText}>About This Book →</Text>
        </TouchableOpacity>

        {/* Chapter grid */}
        <View style={styles.grid}>
          {Array.from({ length: book.total_chapters }, (_, i) => i + 1).map((ch) => {
            const isVisited = visited.has(ch);
            return (
              <TouchableOpacity
                key={ch}
                onPress={() => book.is_live && navigation.navigate('Chapter', { bookId, chapterNum: ch })}
                disabled={!book.is_live}
                style={[
                  styles.cell,
                  isVisited && styles.cellVisited,
                ]}
              >
                <Text style={[
                  styles.cellText,
                  !book.is_live && styles.cellTextDim,
                ]}>
                  {ch}
                </Text>
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
    backgroundColor: base.bg,
  },
  content: {
    padding: spacing.md,
  },
  headerRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: spacing.sm,
    marginBottom: spacing.xs,
  },
  backButton: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
  },
  headerText: {
    flex: 1,
  },
  bookTitle: {
    color: base.gold,
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 22,
  },
  bookSubtitle: {
    color: base.textMuted,
    fontFamily: fontFamily.ui,
    fontSize: 12,
  },
  introLink: {
    marginBottom: spacing.lg,
  },
  introLinkText: {
    color: base.gold,
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
    height: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: base.bgElevated,
    borderRadius: radii.sm,
  },
  cellVisited: {
    backgroundColor: base.gold + '15',
  },
  cellText: {
    color: base.gold,
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
  },
  cellTextDim: {
    color: base.textMuted + '40',
  },
});
