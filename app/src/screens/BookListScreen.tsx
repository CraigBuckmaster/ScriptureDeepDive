/**
 * BookListScreen — Full library with two view modes.
 *
 * Canonical (default): OT/NT toggle with flat list in Bible order.
 * By Genre: SectionList grouped by tradition (Law, History, etc.)
 *
 * Segment toggle replaces the old dropdown. Search bar filters across
 * both modes. Per-book progress bars show reading completion.
 */

import React, { useState, useMemo, useRef, useCallback } from 'react';
import { View, Text, TouchableOpacity, SectionList, FlatList, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { ScreenNavProp } from '../navigation/types';
import { useScrollToTop } from '@react-navigation/native';
import { useBooks, type BookWithProgress } from '../hooks/useBooks';
import { useSettingsStore } from '../stores';
import { SearchInput } from '../components/SearchInput';
import { useTheme, spacing, radii, fontFamily, MIN_TOUCH_TARGET } from '../theme';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';

// ── Tradition groupings (by book_order index) ────────────────────

const OT_GROUPS = [
  { title: 'Law', range: [0, 5] },
  { title: 'History', range: [5, 17] },
  { title: 'Poetry & Wisdom', range: [17, 22] },
  { title: 'Major Prophets', range: [22, 27] },
  { title: 'Minor Prophets', range: [27, 39] },
];

const NT_GROUPS = [
  { title: 'Gospels & Acts', range: [39, 44] },
  { title: 'Pauline Epistles', range: [44, 57] },
  { title: 'General Epistles', range: [57, 65] },
  { title: 'Apocalypse', range: [65, 66] },
];

const BookRow = React.memo(function BookRow({ book, onPress, base }: {
  book: BookWithProgress;
  onPress: (bookId: string) => void;
  base: ReturnType<typeof useTheme>['base'];
}) {
  return (
    <TouchableOpacity
      onPress={() => onPress(book.id)}
      style={[styles.bookRow, { borderBottomColor: base.border + '40' }]}
      accessibilityRole="button"
      accessibilityLabel={`${book.name}, ${book.chaptersRead > 0 ? `${book.chaptersRead} of ${book.total_chapters} chapters read` : `${book.total_chapters} chapters`}`}
    >
      <View style={styles.bookRowContent}>
        <View style={styles.bookRowHeader}>
          <Text style={[styles.bookName, { color: base.text }, !book.is_live && { color: base.textMuted }]}>
            {book.name}
          </Text>
          <Text style={[styles.chapterCount, { color: base.textMuted }]}>
            {book.chaptersRead > 0
              ? `${book.chaptersRead}/${book.total_chapters}`
              : `${book.total_chapters} ch`}
          </Text>
        </View>
        {book.chaptersRead > 0 && (
          <View style={[styles.progressTrack, { backgroundColor: base.border }]}>
            <View style={[
              styles.progressFill,
              { width: `${(book.chaptersRead / book.total_chapters) * 100}%`, backgroundColor: base.gold + '50' },
            ]} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
});

function BookListScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Read', 'BookList'>>();
  const scrollRef = useRef<FlatList>(null);
  useScrollToTop(scrollRef);

  const { books } = useBooks();
  const mode = useSettingsStore((s) => s.bookListMode);
  const setMode = useSettingsStore((s) => s.setBookListMode);
  const [testament, setTestament] = useState<'ot' | 'nt'>('ot');
  const [search, setSearch] = useState('');

  // ── Search filter ────────────────────────────────────────────
  const searchResults = useMemo(() => {
    const q = search.trim().toLowerCase();
    if (!q) return null;
    return books.filter((b) => b.name.toLowerCase().includes(q));
  }, [books, search]);

  // ── Thematic sections ────────────────────────────────────────
  const thematicSections = useMemo(() =>
    [...OT_GROUPS, ...NT_GROUPS]
      .map((g) => ({
        title: g.title,
        data: books.slice(g.range[0], g.range[1]),
      }))
      .filter((s) => s.data.length > 0),
    [books]
  );

  // ── Canonical filtered list ──────────────────────────────────
  const canonicalBooks = useMemo(() =>
    books.filter((b) => b.testament === testament),
    [books, testament]
  );

  // ── Shared book row ──────────────────────────────────────────
  const handleBookPress = useCallback((bookId: string) => {
    navigation.navigate('ChapterList', { bookId });
  }, [navigation]);

  const renderBookRow = useCallback(({ item: book }: { item: BookWithProgress }) => (
    <BookRow book={book} onPress={handleBookPress} base={base} />
  ), [handleBookPress, base]);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      {/* Title + segment toggle on same row */}
      <View style={styles.titleRow}>
        <Text style={[styles.title, { color: base.gold }]} accessibilityRole="header">Library</Text>
        <View style={styles.segmentRow}>
          {([['canonical', 'Canonical'], ['thematic', 'By Genre']] as const).map(([key, label]) => (
            <TouchableOpacity key={key} onPress={() => setMode(key)} accessibilityRole="button" accessibilityLabel={`${label} view`} accessibilityState={{ selected: mode === key }}>
              <Text style={[styles.segmentLabel, { color: base.textMuted }, mode === key && [styles.segmentActive, { color: base.gold, borderBottomColor: base.gold }]]}>
                {label}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* OT/NT toggle (canonical mode only, no search) */}
      {mode === 'canonical' && !searchResults && (
        <View style={styles.testamentRow}>
          {(['ot', 'nt'] as const).map((t) => (
            <TouchableOpacity key={t} onPress={() => setTestament(t)} accessibilityRole="button" accessibilityLabel={t === 'ot' ? 'Old Testament' : 'New Testament'} accessibilityState={{ selected: testament === t }}>
              <Text style={[styles.testamentLabel, { color: base.textMuted }, testament === t && [styles.testamentActive, { color: base.gold, borderBottomColor: base.gold }]]}>
                {t === 'ot' ? 'Old Testament' : 'New Testament'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      )}

      {/* Search */}
      <View style={styles.searchRow}>
        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search books..."
          compact
        />
      </View>

      {/* List */}
      {searchResults ? (
        /* Search results — flat list regardless of mode */
        <FlatList
          ref={scrollRef}
          data={searchResults}
          keyExtractor={(b) => b.id}
          renderItem={renderBookRow}
          contentContainerStyle={styles.listContent}
          maxToRenderPerBatch={15}
          windowSize={7}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={[styles.emptyText, { color: base.textMuted }]}>No books matching "{search.trim()}"</Text>
            </View>
          }
        />
      ) : mode === 'canonical' ? (
        <FlatList
          ref={scrollRef}
          data={canonicalBooks}
          keyExtractor={(b) => b.id}
          renderItem={renderBookRow}
          contentContainerStyle={styles.listContent}
          maxToRenderPerBatch={15}
          windowSize={7}
        />
      ) : (
        <SectionList
          sections={thematicSections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderSectionHeader={({ section }) => (
            <View style={[styles.sectionHeader, { backgroundColor: base.bg }]}>
              <Text style={[styles.sectionTitle, { color: base.textMuted }]}>
                {section.title.toUpperCase()}
              </Text>
            </View>
          )}
          renderItem={renderBookRow}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  title: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 22,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'baseline',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.sm,
  },
  segmentRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  segmentLabel: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
    paddingBottom: 4,
  },
  segmentActive: {
    borderBottomWidth: 2,
  },
  testamentRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  testamentLabel: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
    paddingBottom: 3,
  },
  testamentActive: {
    borderBottomWidth: 2,
  },
  searchRow: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  sectionHeader: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  sectionTitle: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  bookRow: {
    paddingHorizontal: spacing.md,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    borderBottomWidth: 1,
  },
  bookRowContent: {
    paddingVertical: 6,
  },
  bookRowHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  bookName: {
    fontFamily: fontFamily.display,
    fontSize: 14,
  },
  bookNameDim: {
  },
  chapterCount: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
  },
  progressTrack: {
    height: 2,
    borderRadius: 1,
    marginTop: 4,
  },
  progressFill: {
    height: 2,
    borderRadius: 1,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  emptyText: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 14,
  },
});

export default withErrorBoundary(BookListScreen);
