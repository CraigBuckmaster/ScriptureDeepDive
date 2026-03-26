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
import { base, spacing, radii, fontFamily, MIN_TOUCH_TARGET } from '../theme';

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
      backgroundStyle={styles.sheetBg}
      handleIndicatorStyle={styles.handle}
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
                <Text style={[styles.toggleLabel, testament === t && styles.toggleActive]}>
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
              style={[styles.translationPill, translation === t && styles.translationPillActive]}
            >
              <Text style={[styles.translationLabel, translation === t && styles.translationLabelActive]}>
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
              <Text style={[styles.bookName, !book.is_live && styles.bookNameDim]}>
                {book.name}
              </Text>
              <Text style={styles.bookChapterCount}>{book.total_chapters} ch</Text>
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
                      style={[styles.chapterCell, isCurrent && styles.chapterCellCurrent]}
                    >
                      <Text style={[
                        styles.chapterNum,
                        !book.is_live && styles.chapterNumDim,
                        isCurrent && styles.chapterNumCurrent,
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
    backgroundColor: base.bg,
    borderTopLeftRadius: 16,
    borderTopRightRadius: 16,
    borderWidth: 1,
    borderColor: base.border,
    borderBottomWidth: 0,
  },
  handle: {
    backgroundColor: base.textMuted,
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
    color: base.textMuted,
    fontFamily: fontFamily.displayMedium,
    fontSize: 13,
    paddingBottom: 4,
  },
  toggleActive: {
    color: base.gold,
    borderBottomWidth: 2,
    borderBottomColor: base.gold,
  },
  translationRow: {
    flexDirection: 'row',
    gap: spacing.sm,
  },
  translationPill: {
    backgroundColor: base.bgElevated,
    borderRadius: radii.pill,
    paddingHorizontal: 14,
    paddingVertical: 4,
    borderWidth: 1,
    borderColor: base.border,
  },
  translationPillActive: {
    backgroundColor: base.gold + '30',
    borderColor: base.gold + '60',
  },
  translationLabel: {
    color: base.textMuted,
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 11,
  },
  translationLabelActive: {
    color: base.gold,
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
    color: base.text,
    fontFamily: fontFamily.display,
    fontSize: 14,
  },
  bookNameDim: {
    color: base.textMuted,
  },
  bookChapterCount: {
    color: base.textMuted,
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
    backgroundColor: base.bgElevated,
    borderRadius: radii.sm,
  },
  chapterCellCurrent: {
    backgroundColor: base.gold + '30',
    borderWidth: 1,
    borderColor: base.gold + '60',
  },
  chapterNum: {
    color: base.gold,
    fontFamily: fontFamily.uiMedium,
    fontSize: 13,
  },
  chapterNumDim: {
    color: base.textMuted + '40',
  },
  chapterNumCurrent: {
    color: base.gold,
  },
});
