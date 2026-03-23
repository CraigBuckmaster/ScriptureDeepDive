/**
 * QnavOverlay — Full-screen quick navigation modal.
 *
 * Header: X + "Navigate". Search bar with debounced useSearch.
 * OT/NT toggle. FlatList of books → expand chapter grid.
 * Live chapters gold, non-live muted. Tap chapter → navigate + close.
 */

import React, { useState, useCallback, useMemo } from 'react';
import {
  Modal, View, Text, TouchableOpacity, TextInput,
  FlatList, SafeAreaView,
} from 'react-native';
import { useBooks } from '../hooks/useBooks';
import { base, spacing, radii, MIN_TOUCH_TARGET } from '../theme';

interface Props {
  visible: boolean;
  onClose: () => void;
  onSelectChapter: (bookId: string, chapterNum: number) => void;
}

export function QnavOverlay({ visible, onClose, onSelectChapter }: Props) {
  const { books } = useBooks();
  const [testament, setTestament] = useState<'ot' | 'nt'>('ot');
  const [expandedBook, setExpandedBook] = useState<string | null>(null);
  const [search, setSearch] = useState('');

  const filteredBooks = useMemo(() => {
    let filtered = books.filter((b) => b.testament === testament);
    if (search.trim()) {
      const q = search.toLowerCase();
      filtered = books.filter((b) => b.name.toLowerCase().includes(q));
    }
    return filtered;
  }, [books, testament, search]);

  const handleSelect = useCallback((bookId: string, ch: number) => {
    onSelectChapter(bookId, ch);
    onClose();
  }, [onSelectChapter, onClose]);

  return (
    <Modal visible={visible} animationType="slide" presentationStyle="fullScreen">
      <SafeAreaView style={{ flex: 1, backgroundColor: base.bg }}>
        {/* Header */}
        <View style={{
          flexDirection: 'row', alignItems: 'center', justifyContent: 'space-between',
          paddingHorizontal: spacing.md, height: 48,
          borderBottomWidth: 1, borderBottomColor: base.border,
        }}>
          <Text style={{ color: base.text, fontFamily: 'Cinzel_500Medium', fontSize: 16 }}>
            Navigate
          </Text>
          <TouchableOpacity onPress={onClose} style={{ minWidth: MIN_TOUCH_TARGET, minHeight: MIN_TOUCH_TARGET, justifyContent: 'center', alignItems: 'flex-end' }}>
            <Text style={{ color: base.gold, fontSize: 16 }}>✕</Text>
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={{ paddingHorizontal: spacing.md, paddingVertical: spacing.sm }}>
          <TextInput
            value={search}
            onChangeText={setSearch}
            placeholder="Search books..."
            placeholderTextColor={base.textMuted}
            style={{
              backgroundColor: base.bgElevated, color: base.text,
              fontFamily: 'SourceSans3_400Regular', fontSize: 14,
              borderRadius: radii.md, paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
              borderWidth: 1, borderColor: base.border,
            }}
          />
        </View>

        {/* OT/NT toggle */}
        {!search.trim() && (
          <View style={{ flexDirection: 'row', paddingHorizontal: spacing.md, gap: spacing.md, marginBottom: spacing.sm }}>
            {(['ot', 'nt'] as const).map((t) => (
              <TouchableOpacity key={t} onPress={() => setTestament(t)}>
                <Text style={{
                  color: testament === t ? base.gold : base.textMuted,
                  fontFamily: 'Cinzel_500Medium', fontSize: 13,
                  borderBottomWidth: testament === t ? 2 : 0,
                  borderBottomColor: base.gold, paddingBottom: 4,
                }}>
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
                style={{
                  flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center',
                  paddingHorizontal: spacing.md, paddingVertical: spacing.sm,
                  minHeight: MIN_TOUCH_TARGET,
                }}
              >
                <Text style={{
                  color: book.is_live ? base.text : base.textMuted,
                  fontFamily: 'Cinzel_400Regular', fontSize: 14,
                }}>
                  {book.name}
                </Text>
                <Text style={{ color: base.textMuted, fontSize: 11 }}>
                  {book.total_chapters} ch {expandedBook === book.id ? '▾' : '▸'}
                </Text>
              </TouchableOpacity>

              {/* Chapter grid */}
              {expandedBook === book.id && (
                <View style={{
                  flexDirection: 'row', flexWrap: 'wrap',
                  paddingHorizontal: spacing.md, paddingBottom: spacing.sm, gap: 4,
                }}>
                  {Array.from({ length: book.total_chapters }, (_, i) => i + 1).map((ch) => (
                    <TouchableOpacity
                      key={ch}
                      onPress={() => book.is_live && handleSelect(book.id, ch)}
                      disabled={!book.is_live}
                      style={{
                        width: MIN_TOUCH_TARGET, height: MIN_TOUCH_TARGET,
                        justifyContent: 'center', alignItems: 'center',
                        backgroundColor: base.bgElevated,
                        borderRadius: radii.sm,
                      }}
                    >
                      <Text style={{
                        color: book.is_live ? base.gold : base.textMuted + '40',
                        fontFamily: 'SourceSans3_500Medium', fontSize: 13,
                      }}>
                        {ch}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
          )}
        />
      </SafeAreaView>
    </Modal>
  );
}
