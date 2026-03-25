/**
 * BookmarkListScreen — Browsable list of all bookmarked verses.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, SafeAreaView, Alert, StyleSheet } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getBookmarks, removeBookmark } from '../db/user';
import { ScreenHeader } from '../components/ScreenHeader';
import { base, spacing, fontFamily } from '../theme';
import type { Bookmark } from '../types';

export default function BookmarkListScreen() {
  const navigation = useNavigation<any>();
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
    <SafeAreaView style={styles.container}>
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
            <Text style={styles.emptyText}>No bookmarks yet. Tap ☆ next to any verse.</Text>
          </View>
        }
        renderItem={({ item }) => {
          const match = item.verse_ref.match(/^(\w+)\s+(\d+):(\d+)$/);
          return (
            <TouchableOpacity
              onPress={() => match && navigation.navigate('ReadTab', {
                screen: 'Chapter', params: { bookId: match[1], chapterNum: parseInt(match[2], 10) },
              })}
              onLongPress={() => handleDelete(item.id)}
              style={styles.row}
            >
              <Text style={styles.verseRef}>{item.verse_ref}</Text>
              {item.label && <Text style={styles.label}>{item.label}</Text>}
              <Text style={styles.date}>{item.created_at?.slice(0, 10)}</Text>
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
    backgroundColor: base.bg,
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
    color: base.textMuted,
    fontFamily: fontFamily.bodyItalic,
    fontSize: 15,
  },
  row: {
    paddingVertical: spacing.md,
    borderBottomWidth: 1,
    borderBottomColor: base.border + '40',
  },
  verseRef: {
    color: base.gold,
    fontFamily: fontFamily.uiSemiBold,
    fontSize: 13,
  },
  label: {
    color: base.textDim,
    fontSize: 12,
    marginTop: 2,
  },
  date: {
    color: base.textMuted,
    fontSize: 10,
    marginTop: 4,
  },
});
