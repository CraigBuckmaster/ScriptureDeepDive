/**
 * ReadingHistoryScreen — Browsable reading history with stats.
 */

import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, FlatList, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { ScreenNavProp } from '../navigation/types';
import { getRecentChapters, getReadingStats } from '../db/user';
import { ScreenHeader } from '../components/ScreenHeader';
import { useTheme, spacing, fontFamily } from '../theme';
import type { RecentChapter, ReadingStats } from '../db/user';

export default function ReadingHistoryScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'More', 'ReadingHistory'>>();
  const [history, setHistory] = useState<RecentChapter[]>([]);
  const [stats, setStats] = useState<ReadingStats | null>(null);

  useEffect(() => {
    getRecentChapters(100).then(setHistory);
    getReadingStats().then(setStats);
  }, []);

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <ScreenHeader
        title="Reading History"
        onBack={() => navigation.goBack()}
        style={styles.header}
      />

      {/* Stats */}
      {stats && stats.totalChapters > 0 && (
        <View style={[styles.statsRow, { borderBottomColor: base.border }]}>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: base.gold }]}>{stats.totalChapters}</Text>
            <Text style={[styles.statLabel, { color: base.textMuted }]}>Chapters</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: base.gold }]}>{stats.currentStreak}</Text>
            <Text style={[styles.statLabel, { color: base.textMuted }]}>Day streak</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={[styles.statValue, { color: base.gold }]}>{stats.longestStreak}</Text>
            <Text style={[styles.statLabel, { color: base.textMuted }]}>Best streak</Text>
          </View>
        </View>
      )}

      <FlatList
        data={history}
        keyExtractor={(_, i) => String(i)}
        contentContainerStyle={styles.listContent}
        ListEmptyComponent={
          <View style={styles.emptyWrap}>
            <Text style={[styles.emptyText, { color: base.textMuted }]}>No reading history yet.</Text>
          </View>
        }
        renderItem={({ item }) => (
          <TouchableOpacity
            onPress={() => navigation.push('Chapter', {
              bookId: item.book_id, chapterNum: item.chapter_num,
            })}
            style={[styles.row, { borderBottomColor: base.border + '40' }]}
            accessibilityLabel={`${item.book_name} chapter ${item.chapter_num}`}
            accessibilityRole="button"
          >
            <Text style={[styles.rowTitle, { color: base.text }]}>{item.book_name} {item.chapter_num}</Text>
            {item.title && <Text style={[styles.rowSubtitle, { color: base.textDim }]}>{item.title}</Text>}
            <Text style={[styles.rowDate, { color: base.textMuted }]}>{item.completed_at?.slice(0, 16)?.replace('T', ' ')}</Text>
          </TouchableOpacity>
        )}
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
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    paddingHorizontal: spacing.md,
    paddingBottom: spacing.md,
    borderBottomWidth: 1,
  },
  statItem: {
    alignItems: 'center',
  },
  statValue: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 20,
  },
  statLabel: {
    fontSize: 10,
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
    paddingVertical: spacing.sm,
    borderBottomWidth: 1,
  },
  rowTitle: {
    fontFamily: fontFamily.uiMedium,
    fontSize: 14,
  },
  rowSubtitle: {
    fontSize: 12,
    marginTop: 2,
  },
  rowDate: {
    fontSize: 10,
    marginTop: 2,
  },
});
