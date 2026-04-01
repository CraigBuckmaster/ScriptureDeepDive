/**
 * BookmarkListScreen — Browsable list of all bookmarked verses.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, Alert, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { ScreenNavProp } from '../navigation/types';
import { getBookmarks, removeBookmark } from '../db/user';
import { parseVerseRef, displayRef } from '../utils/verseRef';
import { ScreenHeader } from '../components/ScreenHeader';
import { base, useTheme, spacing, fontFamily } from '../theme';
import type { Bookmark } from '../types';

export default function BookmarkListScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'More', 'Bookmarks'>>();
  const [bookmarks, setBookmarks] = useState<Bookmark[]>([]);

  const reload = () => getBookmarks().then(setBookmarks);
  useEffect(() => { reload(); }, []);

  const handleDelete = (id: number) => {
    Alert.alert('Remove Bookmark', 'Remove this bookmark?', [
      { text: 'Cancel', style: 'cancel' },
      { text: 'Remove', style: 'destructive', onPress: async () => { await removeBookmark(id); reload(); } },
    ]);
  };

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <ScreenHeader
        title="Bookmarks"
        onBack={() => navigation.goBack()}
        style={styles.header}
      />
      <FlatList
        data={bookmarks}
        keyExtractor={(b) => String(b.id)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={[styles.emptyText, { color: base.textMuted }]}>No bookmarks yet. Tap ☆ next to any verse.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const parsed = parseVerseRef(item.verse_ref);
          return (
            <TouchableOpacity
              onPress={() => parsed && navigation.push('Chapter', {
                bookId: parsed.bookId, chapterNum: parsed.ch,
              })}
              onLongPress={() => handleDelete(item.id)}
              accessibilityLabel={`${item.verse_ref}${item.label ? ', ' + item.label : ''}`}
              accessibilityHint="Tap to read, long press to remove"
              accessibilityRole="button"
              style={[styles.row, { borderBottomColor: base.border + '40' }]}
            >
              <Text style={[styles.verseRef, { color: base.gold }]}>{displayRef(item.verse_ref)}</Text>
              {item.label && <Text style={[styles.label, { color: base.textDim }]}>{item.label}</Text>}
              <Text style={[styles.date, { color: base.textMuted }]}>{item.created_at?.slice(0, 10)}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  header: {
    paddingHorizontal: spacing.md,
    paddingTop: spacing.lg,
    paddingBottom: spacing.md,
  },
  listContent: {
    paddingHorizontal: spacing.md,
  },
  emptyWrap: {
    alignItems: 'center',
    paddingTop: spacing.xxl,
  },
  emptyText: {
    fontFamily: fontFamily.bodyItalic,
    fontSize: 15,
  },
  row: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
  },
  verseRef: {
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 13,
  },
  label: {
    fontSize: 12,
    marginTop: 2,
  },
  date: {
    fontSize: 10,
    marginTop: 4,
  },
});
