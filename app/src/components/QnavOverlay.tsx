/**
 * QnavOverlay — Bottom-sheet quick navigation.
 *
 * 65%/90% snap points. Drag handle replaces close button.
 * Search bar + OT/NT toggle + translation toggle (moved from nav bar).
 * Book list with expandable chapter grids.
 */

import React, { useState, useCallback, useMemo, useEffect, useRef } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import BottomSheet, { BottomSheetFlatList } from '@gorhom/bottom-sheet';
import { useBooks } from '../hooks/useBooks';
import { useSettingsStore } from '../stores';
import { SearchInput } from './SearchInput';
import { selectionFeedback } from '../utils/haptics';
import { base, useTheme, spacing, radii, fontFamily, MIN_TOUCH_TARGET } from '../theme';

interface Props {
  visible: boolean;
  currentBookId?: string;
  currentChapter?: number;
  onClose: () => void;
  onSelectChapter: (bookId: string, chapterNum: number) => void;
}

export function QnavOverlay({
  visible, currentBookId, currentChapter,
  onClose, onSelectChapter,
}: Props) {
  const { base } = useTheme();
  const sheetRef = useRef<BottomSheet>(null);
  const { books } = useBooks();
  const translation = useSettingsStore((s) => s.translation);
  const setTranslation = useSettingsStore((s) => s.setTranslation);
  const [testament, setTestament] = useState<'ot' | 'nt'>('ot');
  const [expandedBook, setExpandedBook] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const snapPoints = useMemo(() => ['65%', '90%'], []);

  // Auto-expand current book when opening
  useEffect(() => {
    if (visible && currentBookId) {
      setExpandedBook(currentBookId);
      const currentBook = books.find((b) => b.id === currentBookId);
      if (currentBook) setTestament(currentBook.testament);
      sheetRef.current?.snapToIndex(0);
    }
  }, [visible, currentBookId, books]);

  // Clear search when closing
  useEffect(() => {
    if (!visible) {
      setSearch('');
      sheetRef.current?.close();
    }
  }, [visible]);

  const filteredBooks = useMemo(() => {
    if (search.trim()) {
      const q = search.toLowerCase();
      return books.filter((b) => b.name.toLowerCase().includes(q));
    }
    return books.filter((b) => b.testament === testament);
  }, [books, testament, search]);

  const handleSelect = useCallback((bookId: string, ch: number) => {
    onSelectChapter(bookId, ch);
    onClose();
  }, [onSelectChapter, onClose]);

  const handleTranslation = useCallback((t: string) => {
    selectionFeedback();
    setTranslation(t);
  }, [setTranslation]);

  if (!visible) return null;

  return (
    <BottomSheet
      ref={sheetRef}
      index={0}
      snapPoints={snapPoints}
      enablePanDownToClose
      onClose={onClose}
      backgroundStyle={[styles.sheetBg, { backgroundColor: base.bg, borderColor: base.border }]}
      handleIndicatorStyle={[styles.handle, { backgroundColor: base.textMuted }]}
    >
      {/* Controls */}
      <View style={styles.controls}>
        {/* Search */}
        <SearchInput
          value={search}
          onChangeText={setSearch}
          placeholder="Search books..."
          compact
        />

        {/* OT/NT toggle */}
        {!search.trim() && (
          <View style={styles.toggleRow}>
            {(['ot', 'nt'] as const).map((t) => (
              <TouchableOpacity key={t} onPress={() => setTestament(t)}>
                <Text style={[styles.toggleLabel, { color: base.textMuted }, testament === t && { color: base.gold, borderBottomWidth: 2, borderBottomColor: base.gold }]}>
                  {t === 'ot' ? 'Old Testament' : 'New Testament'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* Translation toggle */}
        <View style={styles.translationRow}>
          {(['niv', 'esv'] as const).map((t) => (
            <TouchableOpacity
              key={t}
              onPress={() => handleTranslation(t)}
              style={[styles.translationPill, { backgroundColor: base.bgElevated, borderColor: base.border }, translation === t && { backgroundColor: base.gold + '30', borderColor: base.gold + '60' }]}
            >
              <Text style={[styles.translationLabel, { color: base.textMuted }, translation === t && { color: base.gold }]}>
                {t.toUpperCase()}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      {/* Book list */}
      <BottomSheetFlatList
        data={filteredBooks}
        keyExtractor={(b) => b.id}
        contentContainerStyle={styles.listContent}
        renderItem={({ item: book }) => (
          <View>
            <TouchableOpacity
              onPress={() => setExpandedBook(expandedBook === book.id ? null : book.id)}
              style={styles.bookRow}
            >
              <Text style={[styles.bookName, { color: base.text }, !book.is_live && { color: base.textMuted }]}>
                {book.name}
              </Text>
              <Text style={[styles.bookChapterCount, { color: base.textMuted }]}>{book.total_chapters} ch</Text>
            </TouchableOpacity>

            {expandedBook === book.id && (
              <View style={styles.chapterGrid}>
                {Array.from({ length: book.total_chapters }, (_, i) => i + 1).map((ch) => {
                  const isCurrent = book.id === currentBookId && ch === currentChapter;
                  return (
                    <TouchableOpacity
                      key={ch}
                      onPress={() => book.is_live && handleSelect(book.id, ch)}
                      disabled={!book.is_live}
                      style={[styles.chapterCell, { backgroundColor: base.bgElevated }, isCurrent && { backgroundColor: base.gold + '30', borderWidth: 1, borderColor: base.gold + '60' }]}
                    >
                      <Text style={[
                        styles.chapterNum,
                        { color: base.gold },
                        !book.is_live && { color: base.textMuted + '40' },
                        isCurrent && { color: base.gold },
                      ]}>
                        {ch}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </View>
            )}
          </View>
        )}
      />
    </BottomSheet>
  );
}

const styles = StyleSheet.create({
  sheetBg: {
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderBottomWidth: 0,
  },
  handle: {
    width: 36,
  },
  controls: {
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: spacing.sm,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  toggleLabel: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
    paddingBottom: 4,
  },
  translationRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  translationPill: {
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1,
  },
  translationLabel: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 11,
  },
  listContent: {
    paddingBottom: spacing.xxl,
  },
  bookRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    minHeight: MIN_TOUCH_TARGET,
  },
  bookName: {
    fontFamily: fontFamily.display,
    fontSize: 14,
  },
  bookChapterCount: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
  },
  chapterGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.sm,
    gap: 4,
  },
  chapterCell: {
    width: MIN_TOUCH_TARGET,
    height: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'center',
    borderRadius: radii.sm,
  },
  chapterNum: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
  },
});
