/**
 * BookmarkListScreen — Browsable list of all bookmarked verses.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, SafeAreaView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getBookmarks, removeBookmark } from '../db/user';
import { base, spacing, radii } from '../theme';
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
    <SafeAreaView style={{ flex: 1, backgroundColor: base.bg }}>
      <Text style={{ color: base.gold, fontFamily: 'Cinzel_600SemiBold', fontSize: 22, paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.md }}>
        Bookmarks
      </Text>
      <FlatList
        data={bookmarks}
        keyExtractor={(b) => String(b.id)}
        contentContainerStyle={{ paddingHorizontal: spacing.md }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: spacing.xxl }}>
            <Text style={{ color: base.textMuted, fontFamily: 'EBGaramond_400Regular_Italic', fontSize: 15 }}>
              No bookmarks yet. Tap ☆ next to any verse.
            </Text>
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
              style={{
                paddingVertical: spacing.md, borderBottomWidth: 1, borderBottomColor: base.border + '40',
              }}
            >
              <Text style={{ color: base.gold, fontFamily: 'SourceSans3_600SemiBold', fontSize: 13 }}>
                {item.verse_ref}
              </Text>
              {item.label && <Text style={{ color: base.textDim, fontSize: 12, marginTop: 2 }}>{item.label}</Text>}
              <Text style={{ color: base.textMuted, fontSize: 10, marginTop: 4 }}>{item.created_at?.slice(0, 10)}</Text>
            </TouchableOpacity>
          );
        }}
      />
    </SafeAreaView>
  );
}
