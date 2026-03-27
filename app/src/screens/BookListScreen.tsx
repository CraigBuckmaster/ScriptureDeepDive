/**
 * BookListScreen — Full library with two view modes.
 *
 * Canonical (default): OT/NT toggle with flat list in Bible order.
 * By Genre: SectionList grouped by tradition (Law, History, etc.)
 *
 * Segment toggle replaces the old dropdown. Search bar filters across
 * both modes. Per-book progress bars show reading completion.
 */

import React, { useState, useMemo, useRef } from 'react';
import { View, Text, TouchableOpacity, SectionList, FlatList, ScrollView, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import { useScrollToTop } from '@react-navigation/native';
import { useBooks, type BookWithProgress } from '../hooks/useBooks';
import { useSettingsStore } from '../stores';
import { SearchInput } from '../components/SearchInput';
import { base, spacing, radii, fontFamily, MIN_TOUCH_TARGET } from '../theme';

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

export default function BookListScreen() {
  const navigation = useNavigation<any>();
  const scrollRef = useRef<FlatList>(null);
  useScrollToTop(scrollRef as any);

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
  const renderBookRow = (book: BookWithProgress) => (
    <TouchableOpacity
      key={book.id}
      onPress={() => navigation.navigate('ChapterList', { bookId: book.id })}
      style={styles.bookRow}
    >
      <View style={styles.bookRowContent}>
        <View style={styles.bookRowHeader}>
          <Text style={[styles.bookName, !book.is_live && styles.bookNameDim]}>
            {book.name}
          </Text>
          <Text style={styles.chapterCount}>
            {book.chaptersRead > 0
              ? `${book.chaptersRead}/${book.total_chapters}`
              : `${book.total_chapters} ch`}
          </Text>
        </View>
        {book.chaptersRead > 0 && (
          <View style={styles.progressTrack}>
            <View style={[
              styles.progressFill,
              { width: `${(book.chaptersRead / book.total_chapters) * 100}%` },
            ]} />
          </View>
        )}
      </View>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Title + segment toggle on same row */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>Library</Text>
        <View style={styles.segmentRow}>
          {([['canonical', 'Canonical'], ['thematic', 'By Genre']] as const).map(([key, label]) => (
            <TouchableOpacity key={key} onPress={() => setMode(key)}>
              <Text style={[styles.segmentLabel, mode === key && styles.segmentActive]}>
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
            <TouchableOpacity key={t} onPress={() => setTestament(t)}>
              <Text style={[styles.testamentLabel, testament === t && styles.testamentActive]}>
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
          renderItem={({ item }) => renderBookRow(item)}
          contentContainerStyle={styles.listContent}
          ListEmptyComponent={
            <View style={styles.emptyWrap}>
              <Text style={styles.emptyText}>No books matching "{search.trim()}"</Text>
            </View>
          }
        />
      ) : mode === 'canonical' ? (
        <FlatList
          ref={scrollRef}
          data={canonicalBooks}
          keyExtractor={(b) => b.id}
          renderItem={({ item }) => renderBookRow(item)}
          contentContainerStyle={styles.listContent}
        />
      ) : (
        <SectionList
          sections={thematicSections}
          keyExtractor={(item) => item.id}
          contentContainerStyle={styles.listContent}
          renderSectionHeader={({ section }) => (
            <View style={styles.sectionHeader}>
              <Text style={styles.sectionTitle}>
                {section.title.toUpperCase()}
              </Text>
            </View>
          )}
          renderItem={({ item }) => renderBookRow(item)}
        />
      )}
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: base.bg,
  },
  title: {
    color: base.gold,
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
    color: base.textMuted,
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
    paddingBottom: 4,
  },
  segmentActive: {
    color: base.gold,
    borderBottomWidth: 2,
    borderBottomColor: base.gold,
  },
  testamentRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  testamentLabel: {
    color: base.textMuted,
    fontFamily: fontFamily.uiMedium,
    fontSize: 12,
    paddingBottom: 3,
  },
  testamentActive: {
    color: base.gold,
    borderBottomWidth: 2,
    borderBottomColor: base.gold,
  },
  searchRow: {
    paddingHorizontal: spacing.md,
    marginBottom: spacing.sm,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  sectionHeader: {
    backgroundColor: base.bg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  sectionTitle: {
    color: base.textMuted,
    fontFamily: fontFamily.uiMedium,
    fontSize: 11,
    letterSpacing: 0.5,
  },
  bookRow: {
    paddingHorizontal: spacing.md,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    borderBottomWidth: 1,
    borderBottomColor: base.border + '40',
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
    color: base.text,
    fontFamily: fontFamily.display,
    fontSize: 14,
  },
  bookNameDim: {
    color: base.textMuted,
  },
  chapterCount: {
    color: base.textMuted,
    fontFamily: fontFamily.ui,
    fontSize: 11,
  },
  progressTrack: {
    height: 2,
    backgroundColor: base.border,
    borderRadius: 1,
    marginTop: 4,
  },
  progressFill: {
    height: 2,
    backgroundColor: base.gold + '50',
    borderRadius: 1,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  emptyText: {
    color: base.textMuted,
    fontFamily: fontFamily.bodyItalic,
    fontSize: 14,
  },
});
