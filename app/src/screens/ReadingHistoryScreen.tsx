/**
 * ReadingHistoryScreen — Browsable reading history with stats.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, SafeAreaView, Alert } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { getRecentChapters, getReadingStats } from '../db/user';
import { base, spacing, radii } from '../theme';
import type { RecentChapter, ReadingStats } from '../db/user';

export default function ReadingHistoryScreen() {
  const navigation = useNavigation<any>();
  const [history, setHistory] = useState<RecentChapter[]>([]);
  const [stats, setStats] = useState<ReadingStats | null>(null);

  useEffect(() => {
    getRecentChapters(100).then(setHistory);
    getReadingStats().then(setStats);
  }, []);

  return (
    <SafeAreaView style={{ flex: 1, backgroundColor: base.bg }}>
      <Text style={{ color: base.gold, fontFamily: 'Cinzel_600SemiBold', fontSize: 22, paddingHorizontal: spacing.md, paddingTop: spacing.lg, paddingBottom: spacing.md }}>
        Reading History
      </Text>

      {/* Stats */}
      {stats && stats.totalChapters > 0 && (
        <View style={{
          flexDirection: 'row', justifyContent: 'space-around',
          paddingHorizontal: spacing.md, paddingBottom: spacing.md,
          borderBottomWidth: 1, borderBottomColor: base.border,
        }}>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: base.gold, fontFamily: 'Cinzel_500Medium', fontSize: 20 }}>
              {stats.totalChapters}
            </Text>
            <Text style={{ color: base.textMuted, fontSize: 10 }}>Chapters</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: base.gold, fontFamily: 'Cinzel_500Medium', fontSize: 20 }}>
              {stats.currentStreak}
            </Text>
            <Text style={{ color: base.textMuted, fontSize: 10 }}>Day streak</Text>
          </View>
          <View style={{ alignItems: 'center' }}>
            <Text style={{ color: base.gold, fontFamily: 'Cinzel_500Medium', fontSize: 20 }}>
              {stats.longestStreak}
            </Text>
            <Text style={{ color: base.textMuted, fontSize: 10 }}>Best streak</Text>
          </View>
        </View>
      )}

      <FlatList
        data={history}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={{ paddingHorizontal: spacing.md }}
        ListEmptyComponent={
          <View style={{ alignItems: 'center', paddingTop: spacing.xxl }}>
            <Text style={{ color: base.textMuted, fontFamily: 'EBGaramond_400Regular_Italic', fontSize: 15 }}>
              No reading history yet.
            </Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.navigate('ReadTab', {
              screen: 'Chapter', params: { bookId: item.book_id, chapterNum: item.chapter_num },
            })}
            style={{ paddingVertical: spacing.sm, borderBottomWidth: 1, borderBottomColor: base.border + '40' }}
          >
            <Text style={{ color: base.text, fontFamily: 'SourceSans3_500Medium', fontSize: 14 }}>
              {item.book_name} {item.chapter_num}
            </Text>
            {item.title && (
              <Text style={{ color: base.textDim, fontSize: 12, marginTop: 2 }}>{item.title}</Text>
            )}
            <Text style={{ color: base.textMuted, fontSize: 10, marginTop: 2 }}>
              {item.completed_at?.slice(0, 16)?.replace('T', ' ')}
            </Text>
          </TouchableOpacity>
        )}
      />
    </SafeAreaView>
  );
}
