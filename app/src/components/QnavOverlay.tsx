/**
 * QnavOverlay — Full-screen quick navigation modal.
 *
 * Header: X + "Navigate". Search bar with inline filter.
 * OT/NT toggle. FlatList of books → expand chapter grid.
 * Auto-expands the current book. Highlights the current chapter in gold.
 * Live chapters gold, non-live muted. Tap chapter → navigate + close.
 * NO CHEVRONS anywhere.
 */

import React, { useState, useCallback, useMemo, useEffect } from 'react';
import {
  Modal, View, Text, TouchableOpacity, TextInput,
  FlatList, SafeAreaView, StyleSheet,
} from 'react-native';
import { X } from 'lucide-react-native';
import { useBooks } from '../hooks/useBooks';
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
  const { books } = useBooks();
  const [testament, setTestament] = useState<'ot' | 'nt'>('ot');
  const [expandedBook, setExpandedBook] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  // Auto-expand current book and set correct testament when opening
  useEffect(() => {
    if (visible && currentBookId) {
      setExpandedBook(currentBookId);
      const currentBook = books.find((b) => b.id === currentBookId);
      if (currentBook) setTestament(currentBook.testament);
    }
  }, [visible, currentBookId, books]);

  // Clear search when closing
  useEffect(() => {
    if (!visible) setSearch('');
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

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={styles.container}>
        {/* Header */}
        <View style={styles.header}>
          <Text style={styles.headerTitle}>Navigate</Text>
          <TouchableOpacity
            onPress={onClose}
            style={styles.closeButton}
            accessibilityLabel="Close navigation"
          >
            <X size={20} color={base.gold} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchRow}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search books..."
            placeholderTextColor={base.textMuted}
            style={styles.searchInput}
          />
        </View>

        {/* OT/NT toggle */}
        {!search.trim() && (
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
        )}

        {/* Book list */}
        <FlatList
          data={filteredBooks}
          keyExtractor={(b) => b.id}
          renderItem={({ item: book }) => (
            <View>
              {/* Book row */}
              <TouchableOpacity
                onPress={() => setExpandedBook(expandedBook === book.id ? null : book.id)}
                style={styles.bookRow}
              >
                <Text style={[
                  styles.bookName,
                  !book.is_live && styles.bookNameDim,
                ]}>
                  {book.name}
                </Text>
                <Text style={styles.bookChapterCount}>
                  {book.total_chapters} ch
                </Text>
              </TouchableOpacity>

              {/* Chapter grid */}
              {expandedBook === book.id && (
                <View style={styles.chapterGrid}>
                  {Array.from({ length: book.total_chapters }, (_, i) => i + 1).map((ch) => {
                    const isCurrent = book.id === currentBookId && ch === currentChapter;
                    return (
                      <TouchableOpacity
                        key={ch}
                        onPress={() => book.is_live && handleSelect(book.id, ch)}
                        disabled={!book.is_live}
                        style={[
                          styles.chapterCell,
                          isCurrent && styles.chapterCellCurrent,
                        ]}
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
      </SafeAreaView>
    </Modal>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: base.bg,
  },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: spacing.md,
    height: 48,
    borderBottomWidth: 1,
    borderBottomColor: base.border,
  },
  headerTitle: {
    color: base.text,
    fontFamily: fontFamily.displayMedium,
    fontSize: 16,
  },
  closeButton: {
    minWidth: MIN_TOUCH_TARGET,
    minHeight: MIN_TOUCH_TARGET,
    justifyContent: 'center',
    alignItems: 'flex-end',
  },
  searchRow: {
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
  },
  searchInput: {
    backgroundColor: base.bgElevated,
    color: base.text,
    fontFamily: fontFamily.ui,
    fontSize: 14,
    borderRadius: radii.md,
    paddingHorizontal: spacing.md,
    paddingVertical: spacing.sm,
    borderWidth: 1,
    borderColor: base.border,
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
