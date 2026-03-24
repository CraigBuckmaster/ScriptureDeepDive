/**
 * BookListScreen — Full library with two view modes.
 *
 * Thematic (default): SectionList grouped by tradition (Law, History, etc.)
 * Canonical: OT/NT toggle with flat list in Bible order.
 *
 * ViewModeDropdown in the title row switches between modes.
 * No LIVE badges — dimmed text is sufficient status indicator.
 */

import React, { useState, useMemo } from 'react';
import {
  View, Text, TouchableOpacity, SectionList, FlatList,
  SafeAreaView, StyleSheet,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useBooks } from '../hooks/useBooks';
import { useSettingsStore } from '../stores';
import { ViewModeDropdown } from '../components/ViewModeDropdown';
import { base, spacing, fontFamily, MIN_TOUCH_TARGET } from '../theme';
import type { Book } from '../types';

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
  const { books } = useBooks();
  const mode = useSettingsStore((s) => s.bookListMode);
  const setMode = useSettingsStore((s) => s.setBookListMode);
  const [testament, setTestament] = useState<'ot' | 'nt'>('ot');

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
  const renderBookRow = (book: Book) => (
    <TouchableOpacity
      key={book.id}
      onPress={() => navigation.navigate('ChapterList', { bookId: book.id })}
      style={styles.bookRow}
    >
      <Text style={[
        styles.bookName,
        !book.is_live && styles.bookNameDim,
      ]}>
        {book.name}
      </Text>
      <Text style={styles.chapterCount}>{book.total_chapters} ch</Text>
    </TouchableOpacity>
  );

  return (
    <SafeAreaView style={styles.container}>
      {/* Title row with dropdown */}
      <View style={styles.titleRow}>
        <Text style={styles.title}>Library</Text>
        <ViewModeDropdown mode={mode} onModeChange={setMode} />
      </View>

      {mode === 'canonical' ? (
        /* ── Canonical view ───────────────────────────── */
        <View style={styles.flex1}>
          {/* OT/NT toggle */}
          <View style={styles.toggleRow}>
            {(['ot', 'nt'] as const).map((t) => (
              <TouchableOpacity key={t} onPress={() => setTestament(t)}>
                <Text style={[
                  styles.toggleLabel,
                  testament === t && styles.toggleLabelActive,
                ]}>
                  {t === 'ot' ? 'Old Testament' : 'New Testament'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <FlatList
            data={canonicalBooks}
            keyExtractor={(b) => b.id}
            renderItem={({ item }) => renderBookRow(item)}
          />
        </View>
      ) : (
        /* ── Thematic view ────────────────────────────── */
        <SectionList
          sections={thematicSections}
          keyExtractor={(item) => item.id}
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
  flex1: {
    flex: 1,
  },
  titleRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  title: {
    color: base.gold,
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 22,
  },
  toggleRow: {
    flexDirection: 'row',
    paddingHorizontal: spacing.md,
    gap: spacing.md,
    marginBottom: spacing.sm,
  },
  toggleLabel: {
    color: base.textMuted,
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
    paddingBottom: 4,
  },
  toggleLabelActive: {
    color: base.gold,
    borderBottomWidth: 2,
    borderBottomColor: base.gold,
  },
  sectionHeader: {
    backgroundColor: base.bg,
    paddingHorizontal: spacing.md,
    paddingTop: spacing.md,
    paddingBottom: spacing.xs,
  },
  sectionTitle: {
    color: base.textMuted,
    fontFamily: fontFamily.display,
    fontSize: 10,
    letterSpacing: 0.5,
  },
  bookRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    minHeight: MIN_TOUCH_TARGET,
    borderBottomWidth: 1,
    borderBottomColor: base.border + '40',
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
});
