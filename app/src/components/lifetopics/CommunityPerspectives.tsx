/**
 * CommunityPerspectives — Section showing community submissions for a topic.
 *
 * Header, sort toggle (Newest / Top Rated), and list of SubmissionCards.
 */

import React, { useState, useCallback } from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { useTheme, spacing, radii, fontFamily } from '../../theme';
import type { Submission } from '../../types';
import SubmissionCard from './SubmissionCard';

type SortMode = 'newest' | 'top_rated';

interface Props {
  submissions: Submission[];
  onSubmissionPress: (submissionId: string) => void;
}

function CommunityPerspectives({ submissions, onSubmissionPress }: Props) {
  const { base } = useTheme();
  const [sort, setSort] = useState<SortMode>('newest');

  const sorted = React.useMemo(() => {
    const list = [...submissions];
    if (sort === 'top_rated') {
      list.sort((a, b) => b.star_avg - a.star_avg || b.upvote_count - a.upvote_count);
    } else {
      list.sort((a, b) => new Date(b.created_at).getTime() - new Date(a.created_at).getTime());
    }
    return list;
  }, [submissions, sort]);

  if (submissions.length === 0) return null;

  return (
    <View style={styles.container}>
      {/* Header */}
      <View style={styles.headerRow}>
        <Text style={[styles.heading, { color: base.text }]}>Community Perspectives</Text>
        <View style={styles.toggleRow}>
          <SortToggle
            label="Newest"
            active={sort === 'newest'}
            onPress={() => setSort('newest')}
            base={base}
          />
          <SortToggle
            label="Top Rated"
            active={sort === 'top_rated'}
            onPress={() => setSort('top_rated')}
            base={base}
          />
        </View>
      </View>

      {/* List */}
      {sorted.map((sub) => (
        <SubmissionCard
          key={sub.id}
          title={sub.title}
          authorName={sub.author_name}
          excerpt={sub.body.slice(0, 150)}
          upvoteCount={sub.upvote_count}
          starAvg={sub.star_avg}
          onPress={() => onSubmissionPress(sub.id)}
        />
      ))}
    </View>
  );
}

function SortToggle({
  label,
  active,
  onPress,
  base,
}: {
  label: string;
  active: boolean;
  onPress: () => void;
  base: ReturnType<typeof useTheme>['base'];
}) {
  return (
    <TouchableOpacity
      onPress={onPress}
      style={[
        styles.toggle,
        {
          backgroundColor: active ? base.gold + '20' : 'transparent',
          borderColor: active ? base.gold : base.border + '40',
        },
      ]}
    >
      <Text style={[styles.toggleText, { color: active ? base.gold : base.textDim }]}>
        {label}
      </Text>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  container: {
    marginTop: spacing.md,
  },
  headerRow: {
    marginBottom: spacing.sm,
  },
  heading: {
    fontFamily: fontFamily.displaySemiBold,
    fontSize: 16,
    marginBottom: spacing.xs,
  },
  toggleRow: {
    flexDirection: 'row',
    gap: spacing.xs,
  },
  toggle: {
    borderWidth: 1,
    borderRadius: radii.pill,
    paddingHorizontal: spacing.sm,
    paddingVertical: spacing.xs,
  },
  toggleText: {
    fontFamily: fontFamily.ui,
    fontSize: 12,
  },
});

export default React.memo(CommunityPerspectives);
