/**
 * SubmissionCard — Card showing submission title, author, excerpt, and stats.
 */

import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { ThumbsUp, Star } from 'lucide-react-native';
import { useTheme, spacing, radii, fontFamily } from '../../theme';

interface Props {
  title: string;
  authorName: string;
  excerpt: string;
  upvoteCount: number;
  starAvg: number;
  onPress: () => void;
}

function SubmissionCard({ title, authorName, excerpt, upvoteCount, starAvg, onPress }: Props) {
  const { base } = useTheme();

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.7}
      style={[styles.card, { backgroundColor: base.bgElevated, borderColor: base.border + '40' }]}
    >
      <Text style={[styles.title, { color: base.text }]} numberOfLines={2}>
        {title}
      </Text>
      <Text style={[styles.author, { color: base.textDim }]}>by {authorName}</Text>
      <Text style={[styles.excerpt, { color: base.text }]} numberOfLines={3}>
        {excerpt}
      </Text>
      <View style={styles.statsRow}>
        <View style={styles.stat}>
          <ThumbsUp size={12} color={base.textMuted} />
          <Text style={[styles.statText, { color: base.textMuted }]}>{upvoteCount}</Text>
        </View>
        {starAvg > 0 && (
          <View style={styles.stat}>
            <Star size={12} color={base.gold} />
            <Text style={[styles.statText, { color: base.textMuted }]}>{starAvg.toFixed(1)}</Text>
          </View>
        )}
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    borderWidth: 1,
    borderRadius: radii.md,
    padding: spacing.md,
    marginBottom: spacing.sm,
  },
  title: {
    fontFamily: fontFamily.displayMedium,
    fontSize: 15,
    marginBottom: 2,
  },
  author: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
    marginBottom: spacing.xs,
  },
  excerpt: {
    fontFamily: fontFamily.body,
    fontSize: 13,
    lineHeight: 20,
    marginBottom: spacing.sm,
  },
  statsRow: {
    flexDirection: 'row',
    gap: spacing.md,
  },
  stat: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  statText: {
    fontFamily: fontFamily.ui,
    fontSize: 11,
  },
});

export default React.memo(SubmissionCard);
