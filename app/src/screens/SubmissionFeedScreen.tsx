/**
 * SubmissionFeedScreen — Browse community submissions with sort and filter.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { useNavigation } from '@react-navigation/native';
import type { ScreenNavProp } from '../navigation/types';
import { ScreenHeader } from '../components/ScreenHeader';
import SubmissionCard from '../components/lifetopics/SubmissionCard';
import { useSubmissionFeed } from '../hooks/useSubmissionFeed';
import { useTheme, spacing, radii, fontFamily } from '../theme';
import { withErrorBoundary } from '../components/ScreenErrorBoundary';
import type { Submission } from '../types';

type SortMode = 'newest' | 'top_rated';

function SubmissionFeedScreen() {
  const { base } = useTheme();
  const navigation = useNavigation<ScreenNavProp<'Explore', 'SubmissionFeed'>>();
  const [sort, setSort] = useState<SortMode>('newest');

  const { submissions, loading, loadMore } = useSubmissionFeed(sort);

  const handlePress = useCallback(
    (submissionId: string) => {
      navigation.push('SubmissionDetail', { submissionId });
    },
    [navigation],
  );

  const renderItem = useCallback(
    ({ item }: { item: Submission }) => (
      <SubmissionCard
        title={item.title}
        authorName={item.author_name}
        excerpt={item.body.slice(0, 150)}
        upvoteCount={item.upvote_count}
        starAvg={item.star_avg}
        onPress={() => handlePress(item.id)}
      />
    ),
    [handlePress],
  );

  return (
    <SafeAreaView style={[styles.container, { backgroundColor: base.bg }]}>
      <View style={styles.headerPad}>
        <ScreenHeader title="Community Submissions" onBack={() => navigation.goBack()} />
        {/* Sort toggle */}
        <View style={styles.sortRow}>
          {(['newest', 'top_rated'] as SortMode[]).map((mode) => (
            <TouchableOpacity
              key={mode}
              onPress={() => setSort(mode)}
              style={[
                styles.sortChip,
                {
                  backgroundColor: sort === mode ? base.gold + '20' : 'transparent',
                  borderColor: sort === mode ? base.gold : base.border + '40',
                },
              ]}
            >
              <Text
                style={[styles.sortText, { color: sort === mode ? base.gold : base.textDim }]}
              >
                {mode === 'newest' ? 'Newest' : 'Top Rated'}
              </Text>
            </TouchableOpacity>
          ))}
        </View>
      </View>

      <FlatList
        data={submissions}
        keyExtractor={(item) => item.id}
        renderItem={renderItem}
        contentContainerStyle={styles.listContent}
        onEndReached={loadMore}
        onEndReachedThreshold={0.5}
        ListEmptyComponent={
          !loading ? (
            <Text style={[styles.emptyText, { color: base.textMuted }]}>
              No submissions yet. Be the first to contribute!
            </Text>
          ) : null
        }
      />
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  headerPad: { paddingHorizontal: spacing.md, paddingTop: spacing.md },
  sortRow: {
    flexDirection: 'row',
    gap: spacing.xs,
    marginVertical: spacing.sm,
  },
  sortChip: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  sortText: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
  },
  listContent: {
    padding: spacing.md,
    paddingBottom: spacing.xxl,
  },
  emptyText: {
    fontFamily: fontFamily.ui,
    fontSize: 14,
    textAlign: 'center',
    marginTop: spacing.xl,
  },
});

export default withErrorBoundary(SubmissionFeedScreen);
